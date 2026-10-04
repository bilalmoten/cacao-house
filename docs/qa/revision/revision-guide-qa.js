async (page)=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.setViewportSize({width:1440,height:1000});await page.goto('http://localhost:5173/');await page.evaluate(()=>localStorage.clear());await page.reload();
const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cacao-house-save-v2')).state);
const check=(condition,message)=>{if(!condition)throw new Error(message)};
await page.getByRole('button',{name:'Start guided play',exact:true}).click();
await page.getByRole('button',{name:'Plan reviewed · find a buyer',exact:true}).click();
await page.getByRole('button',{name:'Accept order',exact:true}).click();
check((await read()).contracts[0].id==='ferry','ferry not accepted');
await page.getByRole('button',{name:'Back to Maravel',exact:false}).click();await page.reload();
await page.getByRole('button',{name:'Review & close week 1',exact:true}).click();await page.getByRole('button',{name:'Keep planning',exact:true}).click();check((await read()).week===1,'dismiss advanced time');
await page.getByRole('button',{name:'Review & close week 1',exact:true}).click();await page.getByRole('button',{name:'Produce, dispatch & sell',exact:true}).click();
await page.waitForFunction(()=>JSON.parse(localStorage.getItem('cacao-house-save-v2')).state.week===2);
await page.getByRole('button',{name:'Continue to suppliers',exact:true}).click();
await page.getByRole('button',{name:'Buy 47 kg cocoa now',exact:true}).click();await page.getByRole('button',{name:'Buy 27 kg sugar now',exact:true}).click();
await page.getByRole('button',{name:'Order 40 kg cocoa for week 4',exact:true}).click();
let s=await read();check(s.orders[0].arrival===4&&s.orders[0].qty===40,'guide shipment wrong');check(s.stock.cocoa.qty===63.75,'delayed cocoa available too soon');
await page.screenshot({path:'output/playwright/revision-desktop-supply.png'});
await page.reload();check((await read()).tutorial.completed.includes('supply'),'guide progress lost');
await page.getByRole('button',{name:'Open suppliers',exact:true}).click();await page.getByRole('button',{name:'Close week 2',exact:true}).click();await page.getByRole('button',{name:'Produce, dispatch & sell',exact:true}).click();
await page.waitForFunction(()=>JSON.parse(localStorage.getItem('cacao-house-save-v2')).state.week===3);
await page.getByRole('button',{name:'Acknowledge & close',exact:true}).click();await page.getByRole('button',{name:'Finish guided start',exact:true}).click();
await page.getByRole('button',{name:'Messages',exact:true}).click();check(await page.getByRole('button',{name:/Your first 16 weeks/}).count()===1,'opening not in inbox');await page.getByRole('button',{name:/Your first 16 weeks/}).click();await page.getByRole('button',{name:'Acknowledge & close',exact:true}).click();
check((await read()).tutorial.completed.includes('result2'),'reopening message reset tutorial');
await page.getByRole('button',{name:'Back to Maravel',exact:false}).click();await page.getByRole('button',{name:'Go to Rafi’s Dock Exchange',exact:true}).click();check(await page.getByRole('tab',{name:'Suppliers',exact:true}).getAttribute('data-state')==='active','building did not open supplier directly');
const old=(await read());await page.getByRole('button',{name:'Repeat cocoa',exact:true}).click();s=await read();check(s.orders.length===old.orders.length+1&&s.orders.at(-1).supplier==='coop'&&s.orders.at(-1).qty===40&&s.orders.at(-1).quality===82,'repeat wrong or no immediate purchase');
await page.getByRole('button',{name:'Factory capacity details',exact:true}).click();
const card=page.locator('.recipe-card').filter({has:page.getByRole('heading',{name:'Quayside 62',exact:true})});await card.locator('.ingredient-policy summary').click();
await page.getByLabel('Quayside 62 cocoa preferred grade',{exact:true}).selectOption('premium');await page.getByLabel('Quayside 62 cocoa fallback',{exact:true}).selectOption('none');
check((await read()).ingredientPolicy.dark.cocoa.fallback==='none','preference not saved');
await page.screenshot({path:'output/playwright/revision-desktop-controls.png'});
await page.reload();await page.getByRole('button',{name:'Factory capacity details',exact:true}).click();await card.locator('.ingredient-policy summary').click();check(await page.getByLabel('Quayside 62 cocoa preferred grade',{exact:true}).inputValue()==='premium','preference lost on reload');
await page.getByLabel('Quayside 62 cocoa fallback',{exact:true}).selectOption('any');
await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'How to play',exact:true}).click();await page.getByRole('button',{name:'Return to game',exact:true}).click();
await page.getByRole('button',{name:'Back to Maravel',exact:false}).click();
await page.getByRole('button',{name:'Go to The Quay Workshop',exact:true}).click();check(await page.locator('.business-panel.open').count()===0,'first workshop click should enter interior');check(await page.getByRole('heading',{name:'The Quay Workshop',exact:true}).count()===1,'workshop not entered');await page.getByRole('button',{name:'Go to The Quay Workshop',exact:true}).click();check(await page.locator('.business-panel.open').count()===1,'interior production click failed');
for(const width of [390,320,768,1440]){await page.setViewportSize({width,height:844});const dimensions=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth}));check(dimensions.document<=dimensions.width+1,'overflow '+width);check(await page.getByRole('button',{name:'Messages',exact:true}).isVisible(),'HUD hidden');if(width===390)await page.screenshot({path:'output/playwright/revision-phone-controls.png'});}
check(errors.length===0,JSON.stringify(errors));console.log('PASS guided real-play weeks 1–2, interruption/reload, old message reopening, direct navigation, repeat purchase, saved preferences, settings/help, responsive widths 320/390/768/1440; no page errors');
}
