import test from 'node:test';
import assert from 'node:assert/strict';
import {newV4,serializeV4} from '../game/v4/saves.ts';
import {applyCommand} from '../game/v4/commands.ts';
import {resolveWeek} from '../game/v4/tick.ts';
import {accountBalance,checkLedger} from '../game/v4/finance.ts';
const act=(s,c)=>{const r=applyCommand(s,c);assert.equal(r.ok,true,r.error);return r.state;};
function lab(){let s=newV4({founder:'B',business:'House',emblem:'cocoa',primary:'#184f45',accent:'#cd925a'});s=act(s,{id:'line',type:'select-equipment',package:'balanced'});s.campaign.stage=2;s.visitedCities.push('paris');s.knownSuppliers.push('claire-imports');
 const amount=2000000;s.cashCents+=amount;s.events.push({id:'fixture-equity',origin:'action',week:1,type:'equity',signature:'fixture',entityIds:['house'],details:{}});s.ledger.push({id:'fixture-equity',eventId:'fixture-equity',week:1,description:'Research scenario funding',postings:[{account:'cash',debitCents:amount,creditCents:0},{account:'equity',debitCents:0,creditCents:amount}]});
 s=act(s,{id:'researcher',type:'hire',employeeId:'dev',factoryId:'sf-workshop'});s=act(s,{id:'brief',type:'introduce-recipe',recipeId:'origin-collection'});
 for(const [varietyId,quantityGrams]of [['cocoa-ecuador',10000],['sugar-refined',10000]])s=act(s,{id:'stock-'+varietyId,type:'purchase',request:{supplierId:'rafi',varietyId,quantityGrams,grade:'premium',warehouseId:'sf-storage'}});return s;}
const start=(s,shelfWeeks=5)=>act(s,{id:'project',type:'start-research',projectId:'origin-project',recipeId:'origin-collection',researcherId:'dev',formula:{cocoa:'cocoa-ecuador',sweetener:'sugar-refined'},brief:{minimumQuality:65,shelfWeeks,segment:'enthusiast'}});
function week(s){const r=resolveWeek(s,{tickId:'week:'+s.week,expectedWeek:s.week});assert.equal(r.ok,true,r.error);assert.doesNotThrow(()=>serializeV4(r.state));return r.state;}
function complete(s,phase){s=act(s,{id:'pay-'+phase+':'+s.week,type:'research-stage',projectId:'origin-project'});return week(week(s));}
test('discovery grants a paid project opportunity; unpaid stages cannot release a recipe',()=>{
 let s=start(lab());assert.equal(s.recipeRevisions.some(r=>r.recipeId==='origin-collection'&&r.released),false);assert.equal(s.researchProjects[0].paidCents,0);assert.equal(applyCommand(s,{id:'release',type:'release-research',projectId:'origin-project'}).ok,false);
 const noLead=lab();noLead.knownRecipeBriefs=[];assert.equal(applyCommand(noLead,{id:'project',type:'start-research',projectId:'origin-project',recipeId:'origin-collection',researcherId:'dev',formula:{cocoa:'cocoa-ecuador',sweetener:'sugar-refined'},brief:{minimumQuality:65,shelfWeeks:5,segment:'enthusiast'}}).ok,false);
});
test('paid concept, physical pilot, taste and stability work release one documented recipe revision',()=>{
 let s=start(lab());for(const phase of ['concept','pilot','taste','stability'])s=complete(s,phase);assert.equal(s.researchProjects[0].status,'ready');assert.ok(s.researchProjects[0].paidCents>0);assert.ok(s.researchProjects[0].findings.length>=4);
 s=act(s,{id:'release',type:'release-research',projectId:'origin-project'});assert.equal(s.recipeRevisions.filter(r=>r.recipeId==='origin-collection'&&r.released).length,1);assert.ok(accountBalance(s,'research')>s.researchProjects[0].paidCents*.8);assert.deepEqual(checkLedger(s),[]);assert.doesNotThrow(()=>serializeV4(s));assert.equal(applyCommand(s,{id:'second-release',type:'release-research',projectId:'origin-project'}).ok,false);
});
test('failed shelf-life revision retains paid knowledge and can reduce ambition rather than reroll fees',()=>{
 let s=start(lab(),12);for(const phase of ['concept','pilot','taste','stability'])s=complete(s,phase);const p=s.researchProjects[0],paid=p.paidCents,findings=structuredClone(p.findings);assert.equal(p.status,'failed');assert.equal(applyCommand(s,{id:'release',type:'release-research',projectId:p.id}).ok,false);
 s=act(s,{id:'revise',type:'revise-research',projectId:p.id,formula:p.formula,brief:{...p.brief,shelfWeeks:5}});assert.equal(s.researchProjects[0].paidCents,paid);assert.deepEqual(s.researchProjects[0].findings,findings);assert.equal(s.researchProjects[0].status,'ready');
 s=act(s,{id:'release-fixed',type:'release-research',projectId:p.id});assert.equal(s.researchProjects[0].status,'released');
});
test('pause retains sunk costs, prevents unpaid progress and does not consume another research fee',()=>{
 let s=start(lab());s=act(s,{id:'concept',type:'research-stage',projectId:'origin-project'});const spent=s.researchProjects[0].paidCents;s=act(s,{id:'pause',type:'research-status',projectId:'origin-project',status:'paused'});s=week(week(s));assert.equal(s.researchProjects[0].phase,'concept');assert.equal(s.researchProjects[0].paidCents,spent);assert.equal(s.researchProjects[0].status,'paused');
 s=act(s,{id:'resume',type:'research-status',projectId:'origin-project',status:'active'});s=week(s);assert.equal(s.researchProjects[0].phase,'pilot');assert.equal(s.researchProjects[0].paidCents,spent);
});
test('research fees compete with obligations, missing physical inputs roll back and forged paid evidence is rejected',async()=>{
 const {deserializeV4}=await import('../game/v4/saves.ts');let s=start(lab());s=act(s,{id:'reserve',type:'set-reserve',cents:s.cashCents});const before=serializeV4(s);assert.equal(applyCommand(s,{id:'unfunded',type:'research-stage',projectId:'origin-project'}).ok,false);assert.equal(serializeV4(s),before);
 s=start(lab());s=complete(s,'concept');s=act(s,{id:'customer',type:'accept-order',orderId:'ferry'});for(const lot of [...s.inventory])s=act(s,{id:'hold-'+lot.id,type:'reserve-lot',lotId:lot.id,contractId:'ferry',quantity:lot.quantity});const snapshot=JSON.stringify(s);assert.equal(applyCommand(s,{id:'no-input',type:'research-stage',projectId:'origin-project'}).ok,false);assert.equal(JSON.stringify(s),snapshot);
 s=start(lab());s.researchProjects[0].paidCents=100000;assert.equal(deserializeV4(JSON.stringify(s)).ok,false);
});
test('an unpaid concept remains reachable after formula revision and cannot skip predecessor tests',()=>{
 let s=start(lab());s=act(s,{id:'revise-early',type:'revise-research',projectId:'origin-project',formula:{cocoa:'cocoa-ghana',sweetener:'sugar-refined'},brief:{minimumQuality:65,shelfWeeks:5,segment:'enthusiast'}});assert.equal(s.researchProjects[0].phase,'concept');assert.equal(applyCommand(s,{id:'skip-pilot',type:'revise-research',projectId:'origin-project',formula:s.researchProjects[0].formula,brief:s.researchProjects[0].brief,repeatFrom:'stability'}).ok,false);s=complete(s,'concept');assert.equal(s.researchProjects[0].phase,'pilot');assert.doesNotThrow(()=>serializeV4(s));
});
test('forged stage events without individual paid ledger postings cannot authorize release',async()=>{
 const {deserializeV4}=await import('../game/v4/saves.ts');let s=start(lab());s=act(s,{id:'concept',type:'research-stage',projectId:'origin-project'});const project=s.researchProjects[0];project.paidStages=['concept','pilot','taste','stability'];project.status='ready';project.pilotQuality=90;project.testedShelfWeeks=5;project.phase='stability';project.dueWeek=null;project.remainingCents=0;
 for(const phase of ['pilot','taste','stability'])s.events.push({id:'forged-'+phase,origin:'action',week:1,type:'research-stage',signature:'fixture',entityIds:[project.id],details:{phase,revision:project.revision,researcherId:'dev',labMinutes:600,feeCents:10000}});
 assert.equal(deserializeV4(JSON.stringify(s)).ok,false);assert.equal(applyCommand(s,{id:'release-forged',type:'release-research',projectId:project.id}).ok,false);
});
test('a small below-minimum pilot input cannot be concealed by premium-stock averages',()=>{
 let s=start(lab());s=complete(s,'concept');const cocoa=s.inventory.find(l=>l.varietyId==='cocoa-ecuador');const total=cocoa.quantity,cost=cocoa.costCents;cocoa.quantity=200;cocoa.costCents=Math.floor(cost*200/total);cocoa.quality=0;s.inventory.push({...structuredClone(cocoa),id:'remainder',quantity:1800,costCents:cost-cocoa.costCents,quality:76});
 const before=JSON.stringify(s);assert.equal(applyCommand(s,{id:'bad-pilot',type:'research-stage',projectId:'origin-project'}).ok,false);assert.equal(JSON.stringify(s),before);
});
test('physical lab consumption reconciles regional and company inventory book values',async()=>{
 const {buildReport}=await import('../game/v4/reports.ts');let s=start(lab());s=complete(s,'concept');s=act(s,{id:'pilot',type:'research-stage',projectId:'origin-project'});s=week(s);
 const query={asOfWeek:3,periodStart:3,periodEnd:3,scopeType:'region',scopeId:'north-america',category:'supply'};assert.equal(buildReport(s,query).metrics.find(m=>m.id==='raw-inventory').value,accountBalance(s,'raw-inventory'));
});

test('one paid specialist workweek completes its stage without an extra idle weekly close',()=>{let s=start(lab());s=act(s,{id:'one-week-concept',type:'research-stage',projectId:'origin-project'});s=week(s);assert.equal(s.week,2);assert.equal(s.researchProjects[0].phase,'pilot');assert.equal(s.researchProjects[0].status,'active');assert.equal(s.researchProjects[0].findings[0].completionEventId,'week:1');});
