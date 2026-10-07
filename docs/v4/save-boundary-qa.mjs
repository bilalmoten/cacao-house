import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolveWeek} from '../../game/v4/tick.ts';
const require=createRequire('/tmp/cacao-v4-qa/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox'],timeout:15000});
const legacy=readFileSync(new URL('../../tests/fixtures/v4/legacy-v6.json',import.meta.url),'utf8');
try {
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
    const page=await browser.newPage({viewport});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(raw=>localStorage.setItem('cacao-house-save-v2',raw),legacy);
    await page.goto('http://127.0.0.1:5174/?v4=save-boundary',{waitUntil:'domcontentloaded',timeout:15000});
    await page.getByRole('heading',{name:'V4 save checkpoint'}).waitFor({timeout:5000});
    await page.getByLabel('Founder').fill('Bilal');
    await page.getByLabel('House name').fill('Cacao QA House');
    await page.getByRole('button',{name:'Create separate V4 slot'}).click();
    await page.getByText('Cacao QA House · Week 1').waitFor();
    const before=await page.evaluate(()=>localStorage.getItem('cacao-house-v4-slot:founder'));
    await page.getByLabel('Import V4 save').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{')});
    await page.getByRole('alert').filter({hasText:'could not be read'}).waitFor();
    assert.equal(await page.evaluate(()=>localStorage.getItem('cacao-house-v4-slot:founder')),before);
    const next=resolveWeek(JSON.parse(before).current,{tickId:'qa-week:1',expectedWeek:1}).state;
    await page.getByLabel('Import V4 save').setInputFiles({name:'next.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(next))});
    await page.getByText('Cacao QA House · Week 2').waitFor();
    const downloadEvent=page.waitForEvent('download');
    await page.getByRole('button',{name:'Export V4 save',exact:true}).click();
    const download=await downloadEvent;assert.equal(download.suggestedFilename(),'cacao-house-v4-founder.json');
    assert.deepEqual(JSON.parse(readFileSync(await download.path(),'utf8')),next);
    await page.getByRole('button',{name:'Restore earlier checkpoint'}).click();
    await page.getByText('Cacao QA House · Week 1').waitFor();
    await page.reload();await page.getByText('Cacao QA House · Week 1').waitFor();
    assert.equal(await page.evaluate(()=>localStorage.getItem('cacao-house-save-v2')),legacy);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
    await page.screenshot({path:new URL(`save-boundary-${viewport.width}.png`,import.meta.url).pathname,fullPage:true});
    await page.getByRole('button',{name:'Continue existing house'}).click();
    await page.getByRole('button',{name:'Menu',exact:true}).waitFor();
    assert.deepEqual(JSON.parse(await page.evaluate(()=>localStorage.getItem('cacao-house-save-v2'))),JSON.parse(legacy));
    assert.deepEqual(errors,[]);
    console.log(`PASS ${viewport.width}×${viewport.height}: create/import/export/restore/reload/legacy, no JS errors`);
    await page.close();
  }
} finally {await browser.close();}
