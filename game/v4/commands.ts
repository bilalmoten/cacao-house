import{assignConsumerLead}from './commercial-leads.ts';
import {chooseRelationship}from './relationships.ts';
import {appointExecutive,allocatePortfolio}from './global.ts';
import {signSupplyAgreement} from './supply-agreements.ts';
import {configureTeam,trainTeam} from './teams.ts';
import {releaseEmployee,rehireEmployee,closeFactory,reopenFactory,activeEmployee} from './site-recovery.ts';
import {orderMachine,returnLeasedMachine,finishMachineOrders} from './machine-orders.ts';
import {maintenancePolicy,repairStation} from './maintenance.ts';
import {bookOvertime} from './overtime.ts';
import {bookFranchiseSupply} from './franchise-supply.ts';
import {openFranchiseCohort,franchiseCohortPolicy} from './franchise-cohorts.ts';
import {simulationCopy} from './simulation-copy.ts';
import {franchiseStandard,configureFranchiseSupport} from './franchise.ts';
import{startConsumerCampaign,stopConsumerCampaign}from'./marketing.ts';
import{consumerReservedQuantity}from'./channel-stock.ts';
import{openConsumerChannel,consumerPolicy}from'./channels.ts';
import {configureDelegation} from './delegation.ts';
import {employmentTerms} from './employment.ts';
import {acceptRegionalRepeat} from './regional-repeat.ts';
import {takeLoan} from './commercial-finance.ts';
import {openDepot,shipLot,openFactory} from './network.ts';
import {acceptOffer} from './orders.ts';
import {beginTravel} from './travel.ts';
import {reviewFounderChapter,chooseCollection} from './campaign.ts';
import {repeatBuyerTerms} from './content/orders.ts';
import {upgradeEquipment} from './equipment.ts';
import {defaultLayout,placeModule} from './layout.ts';
import {scoreAssistedTrial,scoreTimedTrial,type TrialHandoff,type HandoffSignal} from './activity.ts';
import {financeRecovery} from './recovery.ts';
import {packagingFamilies} from './content/packaging.ts';
import {purchasePackaging} from './packaging.ts';
import {guideStepIds} from './onboarding.ts';
import {previewWeek} from './tick.ts';
import {buildReport} from './reports.ts';
import {bookEngineering} from './engineering.ts';
import {regionForCity} from './content/regions.ts';
import type {V4State,V4Command,CommandResult} from './model.ts';
import {checkLedger,post,debit,credit,starterLoan} from './finance.ts';
import {catalog} from './catalog.ts';
import {quotePurchase,protectedCash} from './sourcing.ts';
import {checkInventory} from './inventory.ts';
import {candidates} from './content/people.ts';
import {commissioningProfile} from './process.ts';
import {researchCommand} from './research.ts';
import {operatorTeam} from './people.ts';
const packageCosts={flexible:140000,balanced:220000,automated:320000};
export function applyCommand(state:V4State,command:V4Command):CommandResult {return apply(state,command,false);}
/** Internal forecast procurement; only append-only purchasing can share closed evidence. */
export function applySimulatedProcurement(state:V4State,command:Extract<V4Command,{type:'purchase'|'purchase-packaging'}>):CommandResult {return apply(state,command,true);}
export function applySimulatedProductionPlan(state:V4State,command:Extract<V4Command,{type:'production-plan'}>):CommandResult{return apply(state,command,true);}
function apply(state:V4State,command:V4Command,simulation:boolean):CommandResult {
  const reject=(error:string):CommandResult=>({ok:false,state,error});
  if(!command||typeof command.id!=='string'||!/^[a-zA-Z0-9:_-]{1,96}$/.test(command.id))return reject('Invalid action identity.');
  const originalSignature=JSON.stringify(command),signature=JSON.stringify(['purchase','purchase-packaging'].includes(command.type)?{...command,sourcingRulesVersion:1}:command.type==='repeat-regional-order'?{...command,repeatRulesVersion:1}:command),previous=state.events.find(e=>e.id===command.id);
  if(previous)return previous.origin==='action'&&(previous.signature===signature||previous.signature===originalSignature)?{ok:true,state,events:[]}:reject('This action identity has already been used.');
  if(checkLedger(state).length)return reject('The saved financial history does not reconcile.');
  const draft=simulation?simulationCopy(state):structuredClone(state),event={id:command.id,origin:'action' as const,week:state.week,type:command.type,signature,entityIds:[] as string[],details:{} as Record<string,string|number>};
  try {
    switch(command.type){
      case 'complete-machine-installation':{if(!(draft.machineOrders??[]).some(j=>j.factoryId===command.factoryId&&j.status==='installing'&&j.dueWeek<=draft.week))return reject('The stated installation date has not arrived.');finishMachineOrders(draft,event);break;}
      case 'assign-consumer-lead':{assignConsumerLead(draft,command,event);break;}
      case 'relationship-choice':{chooseRelationship(draft,command,event,applyCommand);break;}
      case 'appoint-executive':{appointExecutive(draft,command,event);break;}
      case 'allocate-portfolio':{allocatePortfolio(draft,command,event);break;}
      case 'continue-business':{if(draft.campaign.status!=='won')return reject('Complete the global finale before continuing this house.');draft.campaign.status='sandbox';event.entityIds=['global-finale'];break;}
      case 'accra-partnership':{if(draft.campaign.stage!==5||draft.currentCityId!=='accra'||!['core','specialty'].includes(command.choice)||draft.campaign.flags['accra-partnership']||!draft.knownSuppliers.includes(command.choice==='core'?'kofi-cocoa':'accra-specialty')||!(draft.supplyAgreements??[]).some(a=>a.supplierId===(command.choice==='core'?'kofi-cocoa':'accra-specialty')))return reject('Meet the chosen Accra source and sign actual supplier capacity before choosing its partnership route.');draft.campaign.flags['accra-partnership']=command.choice;event.entityIds=['accra',command.choice];event.details={choice:command.choice,scene:command.choice==='core'?'Kofi commits a dependable cocoa route. The locked bulk volume and minimum-use obligation call for a steady everyday portfolio.':'Ama commits the specialty route. Premium source grades and narrower products must earn their extra working capital.'};break;}
      case 'supply-agreement':{signSupplyAgreement(draft,command,event);break;}
      case 'configure-team':{configureTeam(draft,command,event);break;}
      case 'train-team':{trainTeam(draft,command.teamId,event);break;}
      case 'release-employee':{releaseEmployee(draft,command.employeeId,event);break;}
      case 'rehire-employee':{rehireEmployee(draft,command.employeeId,command.factoryId,event);break;}
      case 'reopen-factory':{reopenFactory(draft,command.factoryId,event);break;}
      case 'close-factory':{closeFactory(draft,command.factoryId,command.workforce,event);break;}
      case 'order-module':{orderMachine(draft,command,event);break;}
      case 'return-leased-module':{returnLeasedMachine(draft,command,event);break;}
      case 'maintenance-policy':{maintenancePolicy(draft,command,event);break;}
      case 'repair-station':{repairStation(draft,command,event);break;}
      case 'book-overtime':bookOvertime(draft,command,event);break;
      case 'franchise-supply-order':bookFranchiseSupply(draft,command,event);break;
      case 'open-franchise-cohort':openFranchiseCohort(draft,command,event);break;
      case 'franchise-cohort-policy':franchiseCohortPolicy(draft,command,event);break;
      case 'write-franchise-standard':franchiseStandard(draft,command,event);break;
      case 'franchise-support':configureFranchiseSupport(draft,command,event);break;
      case 'start-consumer-campaign':startConsumerCampaign(draft,command,event);break;
      case 'stop-consumer-campaign':stopConsumerCampaign(draft,command.campaignId,event);break;
      case 'open-consumer-channel':openConsumerChannel(draft,command,event);break;
      case 'consumer-policy':consumerPolicy(draft,command,event);break;
      case 'delegation-policy':configureDelegation(draft,{factoryId:command.factoryId,managerId:command.managerId,enabled:command.enabled,budgetCents:command.budgetCents,items:command.items,packaging:command.packaging,...(command.production?{production:command.production}:{})},event);break;
      case 'employment-terms':employmentTerms(draft,command.employeeId,command.factoryId,command.minutes,event);break;
      case 'take-loan':takeLoan(draft,command.facility,command.quoteId,event);break;
      case 'open-factory':openFactory(draft,command.cityId,command.package,event);break;
      case 'open-depot':openDepot(draft,command.cityId,event);break;
      case 'ship-lot':shipLot(draft,command.lotId,command.warehouseId,event,command.express===true);break;
      case 'accept-offer':acceptOffer(draft,command.offerId,event);break;
      case 'travel':beginTravel(draft,command.cityId,event);break;
      case 'repeat-regional-order':acceptRegionalRepeat(draft,command.cityId,command.recipeId,command.terms,command.quoteId,event);break;
      case 'choose-collection':chooseCollection(draft,command.choice,event);break;
      case 'review-chapter':reviewFounderChapter(draft,command.chapterId,event);break;
      case 'finance-recovery':{financeRecovery(draft,command.option,command.quoteId,event);break;}
      case 'select-packaging':{
        const revision=draft.recipeRevisions.find(r=>r.id===command.recipeRevisionId),family=packagingFamilies.find(p=>p.id===command.packagingId),recipe=catalog.recipes.find(r=>r.id===revision?.recipeId);
        if(!revision?.released||!family||!recipe||family.stage>state.campaign.stage||!family.compatibleStorageClasses.includes(recipe.storageClass))return reject('Choose a compatible unlocked packaging family for a released recipe.');
        revision.packagingId=family.id;event.entityIds=[revision.id,family.id];event.details={recipeRevisionId:revision.id,packagingId:family.id};break;
      }
      case 'purchase-packaging':{purchasePackaging(draft,command.request,event,command.quoteId,command.overrideReserve);break;}
      case 'read-update':{const update=draft.updates.find(u=>u.id===command.updateId&&u.publishedWeek<=state.week);if(!update)return reject('Choose an available update.');if(update.readWeek===undefined)update.readWeek=state.week;event.entityIds=[update.id];break;}
      case 'guide-control':{
        if(command.mode==='replay'){if(!command.stepId||!guideStepIds.includes(command.stepId))return reject('Choose an available opening help topic.');draft.guide={mode:'guided',replayStepId:command.stepId};}
        else if(['guided','explore','paused'].includes(command.mode))draft.guide={mode:command.mode};else return reject('Choose a guidance mode.');
        event.entityIds=['opening-help'];break;
      }
      case 'visit-location':{
        const city=catalog.cities.find(c=>c.id===command.cityId&&c.stage<=state.campaign.stage);
        if(!city||state.currentCityId!==city.id||!state.visitedCities.includes(city.id)||!city.hotspots.includes(command.locationId))return reject('Visit an available local place in the current city.');
        event.entityIds=[city.id,command.locationId];event.details={cityId:city.id,locationId:command.locationId};break;
      }
      case 'preview-week':{
        const preview=previewWeek(state,{tickId:'preview:'+command.id,expectedWeek:state.week});
        event.entityIds=['weekly-commitments'];event.details={expectedWeek:state.week,lowCashCents:preview.lowCashCents,highCashCents:preview.highCashCents,basis:preview.basis};break;
      }
      case 'view-report':{
        const report=buildReport(state,command.query),closed=report.metrics.some(m=>m.basis==='actual'&&m.value!==null)&&['finance','overview'].includes(command.query.category),snapshot=state.snapshots.find(s=>s.tickId===report.generatedFromTickId);
        if(report.alerts.some(a=>a.includes('Choose')||a.includes('Invalid')))return reject('Choose an available report date and scope.');
        event.entityIds=['reports'];event.details={actualClosedWeek:closed&&snapshot?snapshot.week:0,category:command.query.category};break;
      }

      case 'engineer-commission':{bookEngineering(draft,command,event);break;}
      case 'introduce-recipe':case 'start-research':case 'research-stage':case 'research-status':case 'revise-research':case 'release-research':{researchCommand(draft,command,event);break;}
      case 'retail-assortment':{if(!Array.isArray(command.recipeRevisionIds)||new Set(command.recipeRevisionIds).size!==command.recipeRevisionIds.length||command.recipeRevisionIds.some(id=>!draft.recipeRevisions.some(r=>r.id===id&&r.released)))return reject('Choose distinct released recipes for the local retail display.');draft.directAssortment=[...command.recipeRevisionIds];event.entityIds=[...command.recipeRevisionIds];event.details={assortment:JSON.stringify(command.recipeRevisionIds)};break;}
      case 'set-price':{
        if(!draft.recipeRevisions.some(r=>r.id===command.recipeRevisionId&&r.released)||!Number.isSafeInteger(command.priceCents)||command.priceCents<=0)return reject('Choose a released recipe and a positive whole-cent asking price.');
        draft.prices[command.recipeRevisionId]=command.priceCents;event.entityIds=[command.recipeRevisionId];break;
      }
      case 'hire':{
        const candidate=candidates.find(e=>e.id===command.employeeId),factory=draft.factories.find(f=>f.id===command.factoryId&&f.active);
        if(!candidate||candidate.stage>state.campaign.stage||!factory||draft.employees.some(e=>e.id===candidate.id))return reject('Choose an available colleague and an active workplace.');
        if(protectedCash(state)+candidate.wageCents>state.cashCents)return reject('This appointment would leave the next payroll uncovered.');
        const {stage,...employee}=candidate;draft.employees.push({...employee,factoryId:factory.id});event.entityIds=[employee.id,factory.id];break;
      }
      case 'train':{
        const employee=draft.employees.find(e=>activeEmployee(e)&&e.id===command.employeeId);
        if((draft.overtimeBookings??[]).some(b=>b.employeeId===command.employeeId&&b.bookedWeek===draft.week))return reject('Finish this close’s paid overtime before beginning training.');
        if(!employee||!Object.hasOwn(employee.skills,command.skill)||draft.training.some(t=>t.employeeId===employee.id))return reject('Choose a colleague and an available training discipline.');
        const cost=35000;if(cost+protectedCash(state)>state.cashCents)return reject('Training would spend protected operating cash.');
        post(draft,event,'Professional staff training',[debit('research',cost,employee.id),credit('cash',cost)]);
        draft.training.push({employeeId:employee.id,skill:command.skill,readyWeek:state.week+2,improvement:12});event.entityIds=[employee.id];break;
      }
      case 'upgrade-module':case 'upgrade-utilities':upgradeEquipment(draft,command,event);break;
      case 'place-module':{
        const factory=draft.factories.find(f=>f.id===command.factoryId&&f.active);if(!factory)return reject('Choose an active owned floor.');
        const floor=factory.layout??defaultLayout(),old=floor.modules.find(m=>m.station===command.station);if(!old)return reject('Choose an installed module.');
        if(command.tier!==undefined&&command.tier!==old.tier)return reject('Relocation cannot change the purchased equipment tier.');
        const proposed=placeModule(floor,command);if(!proposed.ok)return reject(proposed.error);if(old.x===command.x&&old.y===command.y)return reject('Choose a different valid position.');
        const cost=5000;if(cost+protectedCash(state)>state.cashCents)return reject('Contractor relocation would spend protected operating cash.');
        post(draft,event,'Physical station relocation',[debit('commissioning',cost,factory.id),credit('cash',cost)],'',{factoryId:factory.id,regionId:regionForCity(factory.cityId)});
        factory.layout=proposed.layout;event.entityIds=[factory.id,command.station];event.details={factoryId:factory.id,station:command.station,x:command.x,y:command.y,costCents:cost};break;
      }
      case 'process-trial':case 'commission':{
        let controls:[number,number,number];
        if(command.type==='process-trial'){
          if(!Array.isArray(command.handoffs)||command.handoffs.length>3)return reject('Use the three process handoffs.');
          if(command.mode==='assisted'){
            if(command.handoffs.length!==3||command.handoffs.some(h=>typeof h!=='string'||!['tempering','cooling','packing'].includes(h)))return reject('Choose all three assisted handoffs.');
            controls=scoreAssistedTrial(command.settings,command.handoffs as TrialHandoff[]).controls;
          }else if(command.mode==='timed'){
            if(!Array.isArray(command.samples)||command.samples.length>1024)return reject('Complete an active timed trial with valid process samples.');
            controls=scoreTimedTrial(command.samples,command.handoffs as HandoffSignal[],command.extendedWindows===true).controls;
          }else return reject('Choose an available process activity mode.');
        }else controls=command.controls;
        const profile=commissioningProfile(draft,command.factoryId,command.recipeRevisionId,command.mode,controls);
        if(!operatorTeam(state,command.factoryId).length)return reject('Assign an operator before commissioning this line.');
        if(command.practice)return {ok:true,state,events:[]};
        const revision=draft.recipeRevisions.find(r=>r.id===command.recipeRevisionId)!;
        if(!revision.released&&catalog.recipes.find(r=>r.id===revision.recipeId)!.stage!==1)return reject('Finish recipe research before commissioning its production process.');
        const cost=8000;if(cost+protectedCash(state)>state.cashCents)return reject('A paid process trial would spend protected operating cash.');
        post(draft,event,'Paid factory recipe commissioning trial',[debit('commissioning',cost,profile.id),credit('cash',cost)],'',{factoryId:profile.factoryId,regionId:regionForCity(draft.factories.find(f=>f.id===profile.factoryId)!.cityId)});
        const previous=draft.processProfiles.find(p=>p.id===profile.id);
        if(!previous)draft.processProfiles.push(profile);
        else if(profile.expectedYield>=previous.expectedYield&&profile.cycleMinutes<=previous.cycleMinutes)Object.assign(previous,profile);
        revision.released=true;event.entityIds=[profile.factoryId,profile.recipeRevisionId];break;
      }
      case 'production-plan':{
        const factory=draft.factories.find(f=>f.id===command.plan?.factoryId);
        if(!factory||!Array.isArray(command.plan.items)||command.plan.items.some(i=>i.packagingId!==undefined&&!validPlanPackaging(draft,i.recipeRevisionId,i.packagingId)||!Number.isSafeInteger(i.cases)||i.cases<0||!draft.recipeRevisions.some(r=>r.id===i.recipeRevisionId&&r.released)||i.contractId&&!draft.contracts.some(c=>c.id===i.contractId&&(c.status==='accepted'||factory.plan.some(saved=>JSON.stringify(saved)===JSON.stringify(i)))&&draft.recipeRevisions.some(r=>r.id===i.recipeRevisionId&&r.recipeId===c.recipeId))))return reject('Choose released recipes, whole nonnegative case targets and accepted commitments.');
        factory.plan=structuredClone(command.plan.items);event.entityIds=[factory.id];break;
      }
      case 'changeover-upgrade':{
        const factory=draft.factories.find(f=>f.id===command.factoryId);
        if(!factory||factory.changeoverTier>=3)return reject('This line has no further changeover upgrade.');
        const cost=[200000,350000,600000][factory.changeoverTier];if(cost+protectedCash(state)>state.cashCents)return reject('The upgrade would spend protected operating cash.');
        post(draft,event,'Changeover engineering investment',[debit('equipment',cost,factory.id),credit('cash',cost)]);factory.changeoverTier++;event.entityIds=[factory.id];break;
      }
      case 'arrival-policy':{
        const warehouse=draft.warehouses.find(w=>w.id===command.warehouseId);
        if(!warehouse||!['delay','overflow','reject'].includes(command.policy)||!Number.isSafeInteger(command.budgetCents)||command.budgetCents<0)return reject('Choose a valid receiving policy and spending budget.');
        warehouse.arrivalPolicy=command.policy;warehouse.overflowBudgetCents=command.budgetCents;event.entityIds=[warehouse.id];break;
      }
      case 'reserve-lot':{
        const lot=draft.inventory.find(l=>l.id===command.lotId),contract=draft.contracts.find(c=>c.id===command.contractId&&c.status==='accepted');
        if(!lot||!contract||!Number.isSafeInteger(command.quantity)||command.quantity<=0||command.quantity+lot.reservations.reduce((n,r)=>n+r.quantity,0)+consumerReservedQuantity(draft,lot.id)>lot.quantity)return reject('Reservation exceeds eligible unreserved stock.');
        const recipe=catalog.recipes.find(r=>r.id===contract.recipeId);
        if(lot.kind==='finished'&&(!draft.recipeRevisions.some(r=>r.id===lot.recipeRevisionId&&r.recipeId===contract.recipeId)||lot.quality*lot.condition/100<contract.minimumQuality))return reject('This finished batch cannot satisfy the accepted recipe and quality specification.');
        if(lot.kind==='ingredient'&&!recipe?.roles.some(role=>role.allowedVarietyIds.includes(lot.varietyId!)))return reject('This lot cannot supply the accepted recipe.');
        lot.reservations.push({contractId:contract.id,quantity:command.quantity});event.entityIds=[contract.id,lot.id];break;
      }
      case 'discover-supplier':{
        const supplier=catalog.suppliers.find(s=>s.id===command.supplierId);
        if(!supplier||supplier.stage>state.campaign.stage||!supplier.remoteIntroduction&&!state.visitedCities.includes(supplier.cityId))return reject('Follow this supplier introduction in its city first.');
        if(state.knownSuppliers.includes(supplier.id))return reject('This supplier is already known.');
        draft.knownSuppliers.push(supplier.id);event.entityIds=[supplier.id];break;
      }
      case 'set-reserve':{
        if(!Number.isSafeInteger(command.cents)||command.cents<0)return reject('Reserve must be a nonnegative amount in cents.');
        draft.reserveCents=command.cents;event.entityIds=['cash-reserve'];break;
      }
      case 'expand-storage':{
        const warehouse=draft.warehouses.find(w=>w.id===command.warehouseId);
        if(!warehouse||!['dry','controlled','cold'].includes(command.storageClass))return reject('Choose an owned warehouse and storage condition.');
        const storageClass=command.storageClass,increment=storageClass==='cold'?150000:500000,base=storageClass==='dry'?400000:storageClass==='controlled'?200000:0;
        const projected=warehouse.capacityMilliliters[storageClass]+warehouse.upgrades.filter(u=>u.storageClass===storageClass).reduce((n,u)=>n+u.milliliters,0);
        const tier=Math.max(0,Math.round((projected-base)/increment)),cost=(storageClass==='cold'?180000:100000)*(1+tier);
        if(cost+protectedCash(state)>state.cashCents)return reject('Storage investment would consume cash reserved for obligations.');
        post(draft,event,'Warehouse condition-space expansion',[debit('equipment',cost,warehouse.id),credit('cash',cost)]);
        warehouse.upgrades.push({storageClass,milliliters:increment,readyWeek:state.week+2});event.entityIds=[warehouse.id];break;
      }
      case 'purchase':{
        const quoted=quotePurchase(state,command.request);if(!quoted.ok)return reject(quoted.error);
        const q=quoted.quote;if(command.quoteId&&command.quoteId!==q.id)return reject('The dated quote changed. Review the new landed cost and space before buying.');
        if(q.totalCents>state.cashCents||!command.overrideReserve&&q.totalCents+protectedCash(state)>state.cashCents)return reject('This order would spend cash reserved for payroll, rent or loan service.');
        if(state.campaign.status==='recovery'&&!command.overrideReserve)return reject('Discretionary purchases pause during recovery. Review a deliberate reserve override for essential stock.');
        const variety=catalog.ingredients.find(i=>i.id===q.varietyId)!,lotId=event.id+':lot',shipmentId=event.id+':shipment';
        post(draft,event,'Ingredient purchase at locked landed cost',[debit('raw-inventory',q.totalCents,lotId),credit('cash',q.totalCents)],'',{regionId:regionForCity(draft.warehouses.find(w=>w.id===command.request.warehouseId)!.cityId)});
        const immediate=q.arrivalWeek===state.week;
        draft.inventory.push({id:lotId,kind:'ingredient',varietyId:variety.id,locationId:immediate?command.request.warehouseId:'transit:'+shipmentId,quantity:q.quantityGrams,costCents:q.totalCents,quality:q.quality,condition:100,bornWeek:state.week,arrivalWeek:q.arrivalWeek,expiryWeek:q.arrivalWeek+variety.shelfWeeks-1,storageClass:variety.storageClass,reservations:[]});
        if(!immediate)draft.shipments.push({id:shipmentId,lotId,warehouseId:command.request.warehouseId,arrivalWeek:q.arrivalWeek,status:'in-transit',supplierId:q.supplierId,promisedWeek:q.arrivalWeek,delayCount:0});
        event.details={...(q.agreementId?{agreementId:q.agreementId,contractQuantity:q.contractQuantity!,spotQuantityGrams:q.spotQuantityGrams!}:{}),routeWeeks:q.routeWeeks,routeCents:q.routeCents,goodsCents:q.goodsCents,freightCents:q.freightCents,arrivalWeek:q.arrivalWeek,supplierId:q.supplierId,varietyId:q.varietyId,quantityGrams:q.quantityGrams,totalCents:q.totalCents};event.entityIds=[q.supplierId,variety.id,lotId];break;
      }
      case 'select-funding':{
        if(!['standard','leveraged'].includes(command.package))return reject('Unknown financing package.');
        if(state.campaign.flags['funding-selected']||state.week!==1||state.factories.length)return reject('Initial financing has already been committed.');
        draft.campaign.flags['funding-selected']=command.package;
        if(command.package==='leveraged'){post(draft,event,'Additional leveraged starter principal',[debit('cash',200000),credit('loan-principal',200000)],'additional');draft.loans=[starterLoan(true)];}
        event.entityIds=['starter'];break;
      }
      case 'repeat-order':{const terms=repeatBuyerTerms[command.terms];if(!terms||!state.contracts.some(c=>c.id==='ferry'&&c.status!=='accepted')||state.contracts.some(c=>c.id.startsWith('leda:')&&c.status==='accepted')||state.events.some(e=>e.type==='repeat-order'&&e.week===state.week))return reject('Resolve the first promise, then negotiate one repeat order per week with no outstanding repeat promise.');const id='leda:'+command.id,depositCents=Math.round(terms.cases*terms.priceCents*terms.depositRatio);if(depositCents)post(draft,event,'Repeat buyer deposit held as an obligation',[debit('cash',depositCents),credit('customer-deposits',depositCents,id)]);draft.contracts.push({id,buyer:'Leda — Ferry Cafe',cityId:'sf',recipeId:'embar62',cases:terms.cases,priceCents:terms.priceCents,minimumQuality:terms.minimumQuality,depositCents,dueStart:state.week,dueEnd:state.week+terms.window,settlementDelay:terms.delay,penaltyCents:terms.penaltyCents,status:'accepted',fulfilledCases:0});event.entityIds=[id];event.details={terms:command.terms};break;}
      case 'accept-order':{
        if(command.orderId!=='ferry'||state.contracts.some(c=>c.id===command.orderId))return reject('This order is unavailable or already accepted.');
        const contract={id:'ferry',buyer:'Leda — Ferry Cafe',cityId:'sf',recipeId:'embar62',cases:35,priceCents:2200,minimumQuality:60,depositCents:19250,dueStart:state.week,dueEnd:state.week+2,settlementDelay:1,penaltyCents:5000,status:'accepted' as const,fulfilledCases:0};
        post(draft,event,'Customer deposit held until contractual delivery',[debit('cash',contract.depositCents),credit('customer-deposits',contract.depositCents,contract.id)]);
        draft.contracts.push(contract);event.entityIds=[contract.id];break;
      }
      case 'select-equipment':{
        if(!(command.package in packageCosts))return reject('Unknown starter equipment.');
        if(state.factories.length)return reject('The initial workshop has already been configured.');
        const amount=packageCosts[command.package];
        post(draft,event,'Installed equipment and premises deposit',[debit('equipment',amount,'sf-workshop'),debit('premises-deposit',40000,'sf-workshop'),credit('cash',amount+40000)],'capital',{factoryId:'sf-workshop',regionId:regionForCity('sf')});
        post(draft,event,'Premises setup and commissioning cost',[debit('commissioning',20000,'sf-workshop'),credit('cash',20000)],'setup',{factoryId:'sf-workshop',regionId:regionForCity('sf')});
        const minutes=command.package==='flexible'?600:command.package==='balanced'?900:1400;
        draft.factories.push({layout:defaultLayout(),id:'sf-workshop',cityId:'sf',active:true,packageId:command.package,equipmentSignature:'sf:'+command.package+':1',rentCents:15000,stations:{preparation:{minutes,tier:1},processing:{minutes,tier:1},tempering:{minutes,tier:1},cooling:{minutes:Math.round(minutes*.65),tier:1},packing:{minutes:Math.round(minutes*.8),tier:1}},plan:[],changeoverTier:0});
        event.entityIds=['sf-workshop'];break;
      }
      case 'transfer-lot':{
        const lot=draft.inventory.find(l=>l.id===command.lotId);
        if(!lot||lot.reservations.length||consumerReservedQuantity(draft,lot.id)>0||![...draft.warehouses.map(w=>w.id),...draft.factories.map(f=>f.id)].includes(command.toLocationId))return reject('The lot or owned receiving location is unavailable.');
        const source=draft.warehouses.find(w=>w.id===lot.locationId)??draft.factories.find(f=>f.id===lot.locationId),destination=draft.warehouses.find(w=>w.id===command.toLocationId)??draft.factories.find(f=>f.id===command.toLocationId);if(!source||!destination||source.cityId!==destination.cityId)return reject('Use paid freight for stock in another city.');lot.locationId=command.toLocationId;event.entityIds=[lot.id,command.toLocationId];break;
      }
      default:return reject('Unknown V4 action.');
    }
    draft.events.push(event);
    const errors=[...checkLedger(draft),...checkInventory(draft)];if(errors.length)return reject(errors.join('; '));
    return {ok:true,state:draft,events:[event]};
  }catch(error){return reject(error instanceof Error?error.message:'This action could not be committed.');}
}

export function validPlanPackaging(s:V4State,revisionId:string,packagingId:string){const r=s.recipeRevisions.find(r=>r.id===revisionId),recipe=catalog.recipes.find(p=>p.id===r?.recipeId),pack=packagingFamilies.find(p=>p.id===packagingId);return !!recipe&&!!pack&&pack.stage<=s.campaign.stage&&pack.compatibleStorageClasses.includes(recipe.storageClass);}
