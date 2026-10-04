async(page)=>{
const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cacao-house-save-v2')).state);const assert=(b,m)=>{if(!b)throw new Error(m)};
const menu=()=>page.getByRole('button',{name:'House menu',exact:true}).click();
await page.reload();await page.setViewportSize({width:390,height:844});await menu();
await page.locator('input[type=file]').setInputFiles('output/playwright/deadline-fixture.json');await page.getByRole('heading',{name:'The house menu'}).waitFor({state:'hidden'});
await page.getByRole('button',{name:'Close the week',exact:true}).click();await page.getByRole('button',{name:'Produce, dispatch & sell',exact:true}).evaluate(e=>{e.click();e.click()});
assert((await read()).week===5,'Repeated click advanced twice');assert((await read()).contracts[0].status==='failed','Deadline not enforced');
await menu();await page.locator('input[type=file]').setInputFiles('output/playwright/bankruptcy-fixture.json');await page.getByRole('heading',{name:'The house menu'}).waitFor({state:'hidden'});
await page.getByRole('button',{name:'Close the week',exact:true}).click();await page.getByRole('button',{name:'Produce, dispatch & sell',exact:true}).click();
await page.getByRole('heading',{name:'A page to begin again.',exact:true}).waitFor();assert((await read()).status==='lost','Bankruptcy ending missing');
await page.getByRole('button',{name:'Begin another campaign',exact:true}).click();await page.getByRole('button',{name:'Open the workshop',exact:true}).click();
assert((await read()).week===1&&(await read()).cash===3200,'New game reset broken');
await menu();await page.locator('input[type=file]').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{bad')});assert((await read()).week===1,'Invalid import mutated state');
await page.locator('input[type=file]').setInputFiles({name:'version.json',mimeType:'application/json',buffer:Buffer.from('{"version":0,"state":{}}')});assert((await read()).week===1,'Version import mutated state');
await page.locator('input[type=file]').setInputFiles('output/playwright/world-complete-save.json');await page.getByRole('heading',{name:'The house menu'}).waitFor({state:'hidden'});await page.reload();assert((await read()).week===17&&(await read()).cash===8154.33,'Import/reload corrupted completed house');
await menu();await page.getByRole('button',{name:'Restart campaign',exact:true}).click();await page.getByRole('button',{name:'Keep this house',exact:true}).click();assert((await read()).week===17,'Cancel restart failed');await page.getByRole('button',{name:'Restart campaign',exact:true}).click();await page.getByRole('button',{name:'Begin a new house',exact:true}).click();await page.getByRole('button',{name:'Open the workshop',exact:true}).click();
await page.getByRole('button',{name:'Go to The Quay Workshop',exact:true}).click();await page.getByRole('button',{name:'Production plan',exact:true}).click();
const input=page.getByRole('spinbutton',{name:'Quayside 62 production cases',exact:true});await input.fill('400');await input.press('Enter');assert(await page.getByRole('button',{name:'Close the week',exact:true}).isDisabled(),'Capacity/stock guard absent');await input.fill('1.5');await input.press('Enter');assert((await read()).plan.dark===400,'Fraction accepted');await input.fill('55');await input.press('Enter');
await page.getByRole('tab',{name:'Supply house',exact:true}).click();const qty=page.getByRole('spinbutton',{name:'Order kilograms',exact:true});await qty.fill('500');await qty.press('Enter');assert(await page.getByRole('button',{name:'Buy 500 kg cocoa',exact:true}).isDisabled(),'Overspending enabled');
await page.getByRole('button',{name:/Back to Maravel/}).click();await page.getByRole('button',{name:'Close location',exact:true}).click();
await page.evaluate(()=>new Promise(r=>setTimeout(r,3000)));await page.screenshot({path:'output/playwright/delivery-world-phone.png'});await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>new Promise(r=>setTimeout(r,300)));await page.screenshot({path:'output/playwright/delivery-world-desktop.png'});
return {pass:true,bankruptcy:true,missedDeadline:true,repeatedClick:true,saveRoundTrip:true,reset:true,overspend:true};}
