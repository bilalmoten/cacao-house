async (page) => {
await page.setViewportSize({width:1440,height:1000});await page.goto('http://localhost:5173/');await page.evaluate(()=>localStorage.clear());await page.reload();await page.getByRole('button',{name:'Start guided play',exact:true}).click();await page.getByRole('button',{name:'Hide guide',exact:true}).click();
const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cacao-house-save-v2')).state);
const tab=async name=>{if(!(await page.locator('.business-panel.open').count()))await page.getByRole('button',{name:'Factory capacity details',exact:true}).click();await page.getByRole('tab',{name,exact:true}).click();};
const fill=async (name,value)=>{const input=page.getByRole('spinbutton',{name,exact:true});await input.fill(String(value));await input.press('Enter');};
const clickLabel=async (group,value)=>{await page.getByRole('radiogroup',{name:group,exact:true}).locator('label').filter({has:page.locator(`[role=radio][value="${value}"]`)}).click();};
const buy=async (ingredient,amount,supplier='dock')=>{await tab('Suppliers');await clickLabel('Ingredient to buy',ingredient);await clickLabel('Supplier',supplier);await fill('Order kilograms',amount);await page.getByRole('button',{name:`Buy ${amount} kg ${ingredient}`,exact:true}).click();};
const accept=async client=>{if((await read()).contracts.some(c=>c.client.includes(client)))return;await tab('Orders');await page.locator('article').filter({hasText:client}).getByRole('button',{name:'Accept order',exact:true}).click();};
const plan=async (name,n)=>{await tab('Workshop');await fill(name+' production cases',n);};
const handleLetter=async ()=>{const dialog=page.getByRole('dialog');if(await dialog.count()){if(await dialog.getByRole('button',{name:/Back the growers/}).count())await dialog.getByRole('button',{name:/Back the growers/}).click();else if(await dialog.getByRole('button',{name:/Stay independent/}).count())await dialog.getByRole('button',{name:/Stay independent/}).click();else if(await dialog.getByRole('button',{name:/Host the tasting/}).count())await dialog.getByRole('button',{name:/Host the tasting/}).click();else if(await dialog.getByRole('button',{name:'Acknowledge & close',exact:true}).count())await dialog.getByRole('button',{name:'Acknowledge & close',exact:true}).click();}};
const ingredients={dark:{cocoa:.8,sugar:.4},milk:{cocoa:.55,sugar:.4,milk:.3},orange:{cocoa:.7,sugar:.4,citrus:.25},praline:{cocoa:.55,sugar:.35,nuts:.4,milk:.1},origin:{cocoa:1.05,sugar:.2},truffle:{cocoa:.65,sugar:.25,milk:.6}};
if(await page.getByRole('button',{name:'Open the workshop',exact:true}).count())await page.getByRole('button',{name:'Open the workshop',exact:true}).click();
if((await read()).week===1){await accept('Ferry');await page.getByRole('button',{name:'Close the week',exact:true}).click();await page.getByRole('button',{name:'Produce, dispatch & sell',exact:true}).click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('cacao-house-save-v2')).state.week===2);}
for(let week=(await read()).week;week<=16;week++){
 await handleLetter();
 if(week===2){
   await tab('Research');await page.locator('article').filter({hasText:'Precision tempering'}).getByRole('button').click();
   await page.getByRole('button',{name:'Fund Citrus development',exact:true}).click();
   await buy('cocoa',50,'coop');
 }
 if(week===3){await accept('Mara Sen');await tab('Suppliers');await page.screenshot({path:'output/playwright/desktop-suppliers.png',fullPage:true});}
 if(week===4){await tab('Maravel');await page.getByRole('button',{name:'Open Lantern Hill',exact:true}).click();await page.screenshot({path:'output/playwright/desktop-maravel.png',fullPage:true});}
 if(week===5){await tab('Research');await page.locator('article').filter({hasText:'Second conching drum'}).getByRole('button').click();}
 if(week===6){await page.setViewportSize({width:390,height:844});await accept('Nadia’s Guild');await plan('Quayside 62',50);await plan('Velvet Milk',30);await plan('Amber Peel',48);}
 if(week===7)await plan('Amber Peel',0);
 if(week===8){await accept('Jon Bell');await plan('Quayside 62',75);}
 let s=await read();
 for(const ingredient of ['cocoa','sugar','milk','nuts','citrus']){const need=Object.entries(s.plan).reduce((sum,[id,n])=>sum+n*(ingredients[id][ingredient]||0),0);const missing=Math.ceil(Math.round((need-s.stock[ingredient].qty)*100)/100);if(missing>0)await buy(ingredient,missing);}
 await tab('Workshop');
 if(week===6||week===12)await page.screenshot({path:`output/playwright/phone-workshop-week-${week}.png`,fullPage:true});
 if(week===16){await tab('Accounts');await page.getByRole('button',{name:/Repay the full note/}).click();}
 const width=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));if(width.document>width.viewport+1)throw new Error('Horizontal overflow at week '+week+': '+JSON.stringify(width));
 await page.getByRole('button',{name:'Close the week',exact:true}).click();
 await page.getByRole('button',{name:'Produce, dispatch & sell',exact:true}).click();
 await page.waitForFunction(expected=>JSON.parse(localStorage.getItem('cacao-house-save-v2')).state.week===expected,week+1);
 s=await read();if(s.week!==week+1)throw new Error('Wrong week advance');if(s.cash<0)throw new Error('Policy bankrupt at week '+week);
 console.log(JSON.stringify({week:week+1,cash:s.cash,reputation:s.reputation,fulfilled:s.fulfilled,signature:s.signature,status:s.status}));
}
const final=await read();if(final.status!=='won'||final.debt!==0||final.fulfilled<4||final.signature<1)throw new Error('Campaign did not win');
await page.evaluate(()=>new Promise(r=>setTimeout(r,350)));await page.screenshot({path:'output/playwright/revision-campaign-win.png'});
await page.getByRole('button',{name:'Continue the house in sandbox',exact:true}).click();
if((await read()).mode!=='sandbox')throw new Error('Sandbox continuation failed');
await page.reload();
if((await read()).week!==17||(await read()).mode!=='sandbox')throw new Error('Autosave reload failed');
await page.evaluate(s=>localStorage.setItem('revision-ui-campaign-result',JSON.stringify({week:s.week,cash:s.cash,reputation:s.reputation,fulfilled:s.fulfilled,signature:s.signature,status:s.status,debt:s.debt})),final);
console.log('PASS: complete UI campaign, research, capacity/quality upgrades, immediate/sea buying, four commissions, story choices, expansion, repayment, phone win, sandbox continuation and reload');
}
