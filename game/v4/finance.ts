import {regionForCity} from './content/regions.ts';
import type {LedgerScope,V4State,Account,LedgerEntry,Posting,Loan,DomainEvent} from './model.ts';
export const accounts:Account[]=['cash','packaging-inventory','raw-inventory','finished-inventory','receivables','equipment','premises-deposit','loan-principal','customer-deposits','arrears','equity','retail-revenue','contract-revenue','owned-retail-revenue','ecommerce-revenue','royalty-revenue','supply-revenue','cogs','payroll','rent','maintenance','energy','commissioning','research','shipping','marketing','support','interest','fees','depreciation','accumulated-depreciation'];
const operatingExpenses:Account[]=['payroll','rent','maintenance','energy','commissioning','research','shipping','marketing','support','fees','depreciation'];
const revenues:Account[]=['retail-revenue','contract-revenue','owned-retail-revenue','ecommerce-revenue','royalty-revenue','supply-revenue'];
export const debit=(account:Account,cents:number,entityId?:string):Posting=>({account,debitCents:cents,creditCents:0,...(entityId?{entityId}:{})});
export const credit=(account:Account,cents:number,entityId?:string):Posting=>({account,debitCents:0,creditCents:cents,...(entityId?{entityId}:{})});
export function accountBalance(state:V4State,account:Account,entries=state.ledger):number {return entries.reduce((sum,e)=>sum+e.postings.filter(p=>p.account===account).reduce((n,p)=>n+p.debitCents-p.creditCents,0),0);}
export function financialSummary(state:V4State,entries=state.ledger){
  const revenueCents=0-revenues.reduce((n,a)=>n+accountBalance(state,a,entries),0);
  const cogsCents=accountBalance(state,'cogs',entries),operatingExpenseCents=operatingExpenses.reduce((n,a)=>n+accountBalance(state,a,entries),0),interestCents=accountBalance(state,'interest',entries);
  return {revenueCents,cogsCents,operatingExpenseCents,interestCents,profitCents:revenueCents-cogsCents-operatingExpenseCents-interestCents};
}
export function classifyCashFlow(entry:LedgerEntry):'operating'|'investing'|'financing' {
  if(entry.postings.some(p=>p.account==='loan-principal'||p.account==='equity'))return 'financing';
  if(entry.postings.some(p=>p.account==='equipment'||p.account==='premises-deposit'))return 'investing';
  return 'operating';
}
export function post(state:V4State,event:DomainEvent,description:string,postings:Posting[],suffix='',scope?:LedgerScope,kind?:string):void {
  const id=event.id+(suffix?':'+suffix:'');
  if(state.ledger.some(e=>e.id===id))throw Error('Duplicate ledger event.');
  if(!postings.length||postings.some(p=>!accounts.includes(p.account)||!Number.isSafeInteger(p.debitCents)||!Number.isSafeInteger(p.creditCents)||p.debitCents<0||p.creditCents<0||p.debitCents>0&&p.creditCents>0))throw Error('Invalid monetary posting.');
  const totalDebit=postings.reduce((n,p)=>n+p.debitCents,0),totalCredit=postings.reduce((n,p)=>n+p.creditCents,0);
  if(!Number.isSafeInteger(totalDebit)||totalDebit!==totalCredit)throw Error('Ledger entry does not balance.');
  const owner=postings.map(p=>p.entityId).find(id=>state.factories.some(f=>f.id===id)||state.warehouses.some(w=>w.id===id)),factory=state.factories.find(f=>f.id===owner),warehouse=state.warehouses.find(w=>w.id===owner);
  const resolvedScope=scope??(factory?{factoryId:factory.id,regionId:regionForCity(factory.cityId)}:warehouse?{regionId:regionForCity(warehouse.cityId)}:undefined);
  const entry:LedgerEntry={id,eventId:event.id,week:state.week,description,postings,...(resolvedScope?{scope:structuredClone(resolvedScope)}:{}),...(kind?{kind}:{})};
  const cashChange=postings.filter(p=>p.account==='cash').reduce((n,p)=>n+p.debitCents-p.creditCents,0);
  if(!Number.isSafeInteger(state.cashCents+cashChange)||state.cashCents+cashChange<0)throw Error('Insufficient cash for this commitment.');
  state.ledger.push(entry);state.cashCents+=cashChange;
}
export function installment(principalCents:number,weeklyRateBps:number,term:number):number {
  const rate=weeklyRateBps/10000;
  return Math.round(rate===0?principalCents/term:principalCents*rate/(1-Math.pow(1+rate,-term)));
}
export function starterLoan(leveraged=false):Loan {
  const principalCents=leveraged?500000:300000,weeklyRateBps=leveraged?45:30;
  return {id:'starter',principalCents,weeklyRateBps,installmentCents:installment(principalCents,weeklyRateBps,52),remainingWeeks:52,nextDueWeek:1,arrearsCents:0,arrearsPrincipalCents:0,arrearsInterestCents:0,feesCents:0,arrearsSinceWeek:null,status:'active',bridge:false};
}
/** Mutates only the isolated draft owned by commands/tick. Accrual precedes
 * settlement; interest and arrears are visible even when cash cannot pay. */
export function serviceLoan(state:V4State,loan:Loan,event:DomainEvent):void {
  if(loan.status==='settled'||loan.nextDueWeek>state.week)return;
  const interest=Math.round(loan.principalCents*loan.weeklyRateBps/10000);
  if(interest){post(state,event,'Accrued weekly loan interest',[debit('interest',interest,loan.id),credit('arrears',interest,loan.id)],loan.id+'-interest');loan.arrearsInterestCents+=interest;}
  const duePrincipal=loan.remainingWeeks<=1?loan.principalCents-loan.arrearsPrincipalCents:Math.min(loan.principalCents-loan.arrearsPrincipalCents,Math.max(0,loan.installmentCents-interest));
  loan.arrearsPrincipalCents+=Math.max(0,duePrincipal);
  const due=loan.feesCents+loan.arrearsInterestCents+loan.arrearsPrincipalCents;
  let available=Math.min(state.cashCents,due);
  const feesPaid=Math.min(available,loan.feesCents);available-=feesPaid;loan.feesCents-=feesPaid;
  const interestPaid=Math.min(available,loan.arrearsInterestCents);available-=interestPaid;loan.arrearsInterestCents-=interestPaid;
  const principalPaid=Math.min(available,loan.arrearsPrincipalCents);loan.arrearsPrincipalCents-=principalPaid;loan.principalCents-=principalPaid;
  if(feesPaid+interestPaid)post(state,event,'Interest and fee settlement',[debit('arrears',feesPaid+interestPaid,loan.id),credit('cash',feesPaid+interestPaid)],loan.id+'-interest-paid');
  if(principalPaid)post(state,event,'Term-loan principal repayment',[debit('loan-principal',principalPaid,loan.id),credit('cash',principalPaid)],loan.id+'-principal');
  loan.remainingWeeks=Math.max(0,loan.remainingWeeks-1);loan.nextDueWeek=state.week+1;
  if(loan.arrearsPrincipalCents+loan.arrearsInterestCents+loan.feesCents>0){
    if(loan.arrearsSinceWeek===null){loan.arrearsSinceWeek=state.week;loan.feesCents+=2500;post(state,event,'Disclosed first missed installment fee',[debit('fees',2500,loan.id),credit('arrears',2500,loan.id)],loan.id+'-late-fee');}
    loan.status='recovery';state.campaign.status='recovery';
  }else{loan.arrearsSinceWeek=null;loan.status=loan.principalCents===0?'settled':'active';}
  loan.arrearsCents=loan.arrearsPrincipalCents+loan.arrearsInterestCents+loan.feesCents;
}
export function checkLedger(state:V4State):string[]{
  const errors:string[]=[];
  if(!Array.isArray(state.ledger)||!Array.isArray(state.events)||!Array.isArray(state.loans))return ['Missing financial history'];
  const ids=new Set<string>(),events=new Set(state.events.map(e=>e.id));
  for(const e of state.ledger){
    if(!e||!Array.isArray(e.postings)||!e.postings.length){errors.push('Invalid entry');continue;}
    if(ids.has(e.id))errors.push('Duplicate ledger entry');ids.add(e.id);
    if(!events.has(e.eventId))errors.push('Missing source event');
    if(e.postings.some(p=>!accounts.includes(p.account)||!Number.isSafeInteger(p.debitCents)||!Number.isSafeInteger(p.creditCents)||p.debitCents<0||p.creditCents<0||p.debitCents>0&&p.creditCents>0))errors.push('Invalid monetary posting');
    if(e.postings.reduce((n,p)=>n+p.debitCents-p.creditCents,0)!==0)errors.push('Unbalanced entry');
  }
  if(!Number.isSafeInteger(state.cashCents)||state.cashCents<0||accountBalance(state,'cash')!==state.cashCents)errors.push('Cash does not reconcile');
  if(-accountBalance(state,'loan-principal')!==state.loans.reduce((n,l)=>n+l.principalCents,0))errors.push('Loan principal does not reconcile');
  if(-accountBalance(state,'arrears')!==state.loans.reduce((n,l)=>n+l.arrearsInterestCents+l.feesCents,0)+(state.unpaidObligations??[]).reduce((n,o)=>n+o.cents,0))errors.push('Accrued obligations do not reconcile');
  if(accountBalance(state,'receivables')!==state.receivables.filter(r=>!r.collected).reduce((n,r)=>n+r.amountCents,0))errors.push('Customer balances do not reconcile');
  const consumerDeposits=(state.consumerOrders??[]).reduce((n,o)=>n+(o.status==='pending'?o.depositCents:!o.refundPaid?o.refundCents:0),0);
  const franchiseDeposits=(state.franchiseCohorts??[]).reduce((n,c)=>n+c.feeRemainingCents,0);
  const deposits=franchiseDeposits+consumerDeposits+state.contracts.filter(c=>c.status==='accepted').reduce((n,c)=>n+c.depositCents-Math.floor(c.depositCents*c.fulfilledCases/c.cases),0);
  if(-accountBalance(state,'customer-deposits')!==deposits)errors.push('Unearned customer deposits do not reconcile');
  return errors;
}
