import type {FloorLayout,FloorStation} from './layout.ts';
import type {TrialSettings,TrialSample,HandoffSignal,TrialHandoff} from './activity.ts';
/** V4 uses cents, grams, minutes and whole cases. Legacy state stays separate. */
export const V4_SCHEMA_VERSION = 4 as const;
export const V4_CONTENT_VERSION = '4.1' as const;
export interface BrandIdentity {
  founder: string;
  business: string;
  emblem: string;
  primary: string;
  accent: string;
}
/** Minimal boot contract; economic fields are introduced by Phase A3/B. */
export interface V4State {
  franchiseStandards?:FranchiseStandard[];
  franchiseSupportHubs?:FranchiseSupportHub[];
  franchiseCohorts?:FranchiseCohort[];
  franchiseHistory?:FranchiseWeek[];
  franchiseSupplyOrders?:FranchiseSupplyOrder[];
  overtimeBookings?:OvertimeBooking[];
  factoryOperations?:FactoryOperations[];
  machineOrders?:MachineOrder[];
  siteClosures?:SiteClosure[];
  cohortTeams?:CohortTeam[];
  supplyAgreements?:SupplyAgreement[];
  consumerChannels?:ConsumerChannel[];
  consumerOrders?:ConsumerOrder[];
  consumerHistory?:ConsumerWeek[];
  consumerCampaigns?:ConsumerCampaign[];
  directAssortment?:string[];
  delegationPolicies?:DelegationPolicy[];
  managementReview?:{id:string;weeks:4|13;startWeek:number;nextIndex:number};
  schemaVersion: typeof V4_SCHEMA_VERSION;
  contentVersion: typeof V4_CONTENT_VERSION;
  week: number;
  random: {seed: number; cursor: number};
  identity: BrandIdentity;
  brandVersion:number;
  updates:HouseUpdate[];
  guide:{mode:'guided'|'explore'|'paused';replayStepId?:'identity'|'inspect'|'equipment'|'staff'|'trial'|'supplier'|'buyer'|'plan'|'preview'|'close'|'outcome'};
  cashCents:number;
  weekOpeningCashCents:number;
  weekLedgerStartIndex:number;
  ledger:LedgerEntry[];
  events:DomainEvent[];
  loans:Loan[];
  inventory:InventoryLot[];
  factories:Factory[];
  employees:Employee[];
  contracts:Contract[];
  receivables:Receivable[];
  snapshots:WeeklySnapshot[];
  campaign:{stage:Stage;chapter:number;flags:Record<string,string>;completedChapters:string[];status:'playing'|'recovery'|'bankrupt'|'won'|'sandbox'};
  knownSuppliers:string[];
  completedTicks:string[];
  reserveCents:number;
  currentCityId:string;
  visitedCities:string[];
  trip?:{cityId:string;departureWeek:number;arrivalWeek:number;sourceEventId:string};
  warehouses:Warehouse[];
  shipments:Shipment[];
  recipeRevisions:RecipeRevision[];
  processProfiles:ProcessProfile[];
  engineeringJobs:EngineeringJob[];
  training:Training[];
  lastProduction:ProductionSchedule[];
  prices:Record<string,number>;
  marketMemory:Record<string,{quality:number}>;
  brandTrust:number;serviceTrust:number;brandAwareness:number;
  lastSales:SalesResult|null;
  salesHistory:SalesResult[];
  knownRecipeBriefs:string[];
  researchProjects:ResearchProject[];
  unpaidObligations:{id:string;account:'payroll'|'rent'|'maintenance'|'energy'|'fees'|'customer-deposits'|'marketing'|'research'|'support';cents:number;sinceWeek:number;scope?:LedgerScope}[];
}
export type SaveLoadResult = {ok:true; state:V4State} | {ok:false; error:string};
export interface SlotStorage {getItem(key:string):string|null; setItem(key:string,value:string):void}
export type Stage = 1|2|3|4|5|6;
export type StorageClass = 'dry'|'controlled'|'cold';
export type FlavorVector = [number,number,number,number]; // cocoa/fruit/roast/spice fit
export interface IngredientVariety {
  id:string; name:string; familyId:string; stage:Stage; roles:string[];
  form:string; storageClass:StorageClass; shelfWeeks:number; gramsPerLiter:number;
  flavor:FlavorVector; cycleFactor:number; yieldFactor:number;
  harvest:[number,number][]; baseCentsPerKg:number; originId?:string;
}
export interface OriginProfile {id:string; name:string; stage:Stage; flavor:FlavorVector; cycleFactor:number; yieldFactor:number; harvest:[number,number][]; baseSupplyGrams:number}
export type StationId = 'preparation'|'processing'|'tempering'|'cooling'|'packing';
export interface RecipeRole {role:string; allowedVarietyIds:string[]; gramsPerCase:number; qualityWeight:number; minimumQuality:number}
export interface CommercialRecipe {
  id:string; name:string; stage:Stage; line:string; route:string; roles:RecipeRole[];
  operations:{station:StationId; minutesPerCase:number; laborMinutesPerCase:number}[];
  referencePriceCents:number; shelfWeeks:number; storageClass:StorageClass;
  flavor:FlavorVector; researchBudgetCents:number; minimumShelfWeeks:number;
}
export interface SupplierBusiness {
  id:string; name:string; cityId:string; stage:Stage; remoteIntroduction:boolean;packagingIds?:string[];packagingAvailabilityUnits?:number;
  varietyIds:string[]; leadWeeks:number; priceFactor:number; quality:number;
  minimumGrams:number; baseAvailabilityGrams:number; reliability:number;
  freightCents:number; bulkBands:{grams:number; discount:number}[];
}
export interface CityContent {id:string; name:string; stage:Stage; geography:string; interior:string; contact:string; hotspots:string[]; milestoneChange:string; market:{value:number;gifting:number;enthusiast:number;online:number}}
export interface V4Catalog {cities:CityContent[];ingredients:IngredientVariety[];origins:OriginProfile[];recipes:CommercialRecipe[];suppliers:SupplierBusiness[]}
export interface ContentValidationResult {errors:string[]}
export type Account = 'cash'|'packaging-inventory'|'raw-inventory'|'finished-inventory'|'receivables'|'equipment'|'premises-deposit'|'loan-principal'|'customer-deposits'|'arrears'|'equity'|'retail-revenue'|'contract-revenue'|'owned-retail-revenue'|'ecommerce-revenue'|'royalty-revenue'|'supply-revenue'|'cogs'|'payroll'|'rent'|'maintenance'|'energy'|'commissioning'|'research'|'shipping'|'marketing'|'support'|'interest'|'fees'|'depreciation'|'accumulated-depreciation';
export interface Posting {account:Account;debitCents:number;creditCents:number;entityId?:string}
export interface LedgerEntry {id:string;eventId:string;week:number;description:string;postings:Posting[];scope?:LedgerScope;kind?:string}
export interface DomainEvent {id:string;origin:'action'|'tick';week:number;type:string;signature:string;entityIds:string[];details:Record<string,string|number>}
export interface Loan {product?:import('./commercial-finance.ts').FacilityId;id:string;principalCents:number;weeklyRateBps:number;installmentCents:number;remainingWeeks:number;nextDueWeek:number;arrearsCents:number;arrearsPrincipalCents:number;arrearsInterestCents:number;feesCents:number;arrearsSinceWeek:number|null;status:'active'|'settled'|'recovery';bridge:boolean}
export interface InventoryLot {id:string;locationId:string;kind:'ingredient'|'finished'|'packaging';brandVersion?:number;varietyId?:string;recipeRevisionId?:string;factoryId?:string;flavor?:FlavorVector;packagingId?:string;processProfileId?:string;quantity:number;costCents:number;quality:number;condition:number;bornWeek:number;arrivalWeek:number;expiryWeek:number;storageClass:StorageClass;reservations:{contractId:string;quantity:number}[]}
export interface Factory {reactivationReadyWeek?:number;readyWeek?:number;capacityScale?:number;layout?:FloorLayout;id:string;cityId:string;active:boolean;packageId:string;equipmentSignature:string;rentCents:number;stations:Record<StationId,{minutes:number;tier:number}>;plan:FactoryPlanItem[];changeoverTier:number}
export interface Employee {cohortHeadcount?:number;departedWeek?:number;id:string;name:string;role:'operator'|'quality'|'engineer'|'researcher'|'manager'|'commercial';factoryId:string|null;wageCents:number;contractedMinutes:number;skills:{production:number;setup:number;quality:number;maintenance:number;research:number;management:number};fatigue:number}
export interface Contract {offerId?:string;packagingId?:string;minimumShelfWeeks?:number;id:string;buyer:string;cityId:string;recipeId:string;cases:number;priceCents:number;minimumQuality:number;depositCents:number;dueStart:number;dueEnd:number;settlementDelay:number;penaltyCents:number;status:'accepted'|'fulfilled'|'failed';fulfilledCases:number}
export interface Receivable {id:string;contractId:string;dueWeek:number;amountCents:number;collected:boolean;scope?:LedgerScope}
export interface WeeklySnapshot {tickId:string;week:number;openingCashCents:number;closingCashCents:number;operatingFlowCents:number;investingFlowCents:number;financingFlowCents:number;revenueCents:number;cogsCents:number;operatingExpenseCents:number;interestCents:number;profitCents:number;sourceEventIds:string[];production:ProductionActual[];inventory:{rawCents:number;finishedCents:number;packagingCents:number;lots:InventoryLot[];shipments:Shipment[]};obligations:{receivableCents:number;depositCents:number;arrearsCents:number};sales:SalesResult}
export interface ProductionActual extends Omit<ProductionSchedule,'remainingInventory'> {regionId:string}
export interface HouseUpdate {id:string;author:string;kind:'guidance'|'information'|'offer'|'commitment';topic:string;title:string;body:string;publishedWeek:number;effectiveWeek:number;sourceEventId:string;locationIds:string[];cityIds:string[];entityIds:string[];readWeek?:number}
export interface PackagingFamily {id:string;name:string;stage:Stage;baseUnitCents:number;minimumOrderUnits:number;unitVolumeMilliliters:number;finishedCaseMilliliters:number;packingExtraMinutesPerCase:number;protection:number;maximumShelfWeeks:number;compatibleStorageClasses:StorageClass[]}
export interface PackagingRequest {supplierId:string;packagingId:string;quantityUnits:number;warehouseId:string;purpose?:'manual'|'delegated'}
export interface PackagingQuote {agreementId?:string;contractQuantity?:number;routeCents:number;routeWeeks:number;id:string;supplierId:string;packagingId:string;quantityUnits:number;availableUnits:number;goodsCents:number;freightCents:number;totalCents:number;unitGoodsCents:number;discount:number;quality:number;arrivalWeek:number;storageMilliliters:number;brandVersion:number;drivers:string[]}
export type V4Command =
  | ({id:string;type:"start-consumer-campaign"}&ConsumerCampaignProposal)
  | ({id:string;type:'write-franchise-standard'} & FranchiseStandardProposal)
  | ({id:string;type:'franchise-support'} & FranchiseSupportProposal)
  | ({id:string;type:'open-franchise-cohort'} & FranchiseCohortProposal)
  | {id:string;type:'supply-agreement';supplierId:string;warehouseId:string;kind:'ingredient'|'packaging';itemId:string;weeklyQuantity:number;weeks:number;grade:'standard'|'premium'}
  | {id:string;type:'configure-team';workplaceId:string;leaderId:string;role:'production'|'field';grade:'apprentice'|'experienced'|'specialist';headcount:number;minutes:number}
  | {id:string;type:'train-team';teamId:string}
  | {id:string;type:'release-employee';employeeId:string}
  | {id:string;type:'rehire-employee';employeeId:string;factoryId:string}
  | {id:string;type:'reopen-factory';factoryId:string}
  | {id:string;type:'close-factory';factoryId:string;workforce:'retain'|'release'}
  | {id:string;type:'order-module';factoryId:string;station:StationId;x?:number;y?:number;financing:'purchase'|'lease'}
  | {id:string;type:'complete-machine-installation';factoryId:string}
  | {id:string;type:'return-leased-module';orderId:string}
  | {id:string;type:'maintenance-policy';factoryId:string;policy:MaintenancePolicy}
  | {id:string;type:'repair-station';factoryId:string;station:StationId}
  | {id:string;type:'book-overtime';employeeId:string;minutes:number}
  | {id:string;type:'franchise-supply-order';cohortId:string;recipeRevisionId:string;quantity:number}
  | {id:string;type:'franchise-cohort-policy';cohortId:string;paused:boolean;priceFactorBps:number;extraTrainingWeeks:number;grade?:'standard'|'premium'}
  | {id:string;type:"stop-consumer-campaign";campaignId:string}
  | ({id:string;type:"open-consumer-channel"}&ConsumerChannelProposal)
  | {id:string;type:"consumer-policy";channelId:string;assortment:string[];prices?:Record<string,number>;weeklyMediaCents:number;shippingSubsidyCents:number;fulfillmentCases:number;deliveryWeeks:1|2;audience:SegmentId}

  | {id:string;type:'retail-assortment';recipeRevisionIds:string[]}
  | ({id:string;type:'delegation-policy'} & DelegationPolicy)
  | {id:string;type:'finance-recovery';option:'bridge'|'restructure';quoteId:string}
  | {id:string;type:'select-packaging';recipeRevisionId:string;packagingId:string}
  | {id:string;type:'purchase-packaging';request:PackagingRequest;quoteId?:string;overrideReserve?:boolean}
  | {id:string;type:'read-update';updateId:string}
  | {id:string;type:'guide-control';mode:'guided'|'explore'|'paused'|'replay';stepId?:V4State['guide']['replayStepId']}
  | {id:string;type:'visit-location';cityId:string;locationId:string}
  | {id:string;type:'preview-week'}
  | {id:string;type:'view-report';query:ReportQuery}
  | {id:string;type:'assign-consumer-lead';channelId:string;employeeId:string}
  | {id:string;type:'relationship-choice';arcId:string;choice:0|1}
  | {id:string;type:'appoint-executive';employeeId:string;role:'finance'|'operations'|'brand'}
  | {id:string;type:'allocate-portfolio';regionId:string;priority:'retention'|'innovation'|'resilience';weeklyBudgetCents:number}
  | {id:string;type:'accra-partnership';choice:'core'|'specialty'}
  | {id:string;type:'continue-business'}
  | {id:string;type:'select-funding';package:'standard'|'leveraged'}
  | {id:string;type:'accept-order';orderId:string}
  | {id:string;type:'repeat-order';terms:'steady'|'flexible'}
  | {id:string;type:'review-chapter';chapterId:string}
  | {id:string;type:'choose-collection';choice:'curated'|'trade'}
  | {id:string;type:'repeat-regional-order';cityId:string;recipeId:string;terms:import('./regional-repeat.ts').RepeatTerms;quoteId:string}
  | {id:string;type:'travel';cityId:string}
  | {id:string;type:'accept-offer';offerId:string}
  | {id:string;type:'take-loan';facility:import('./commercial-finance.ts').FacilityId;quoteId:string}
  | {id:string;type:'open-depot';cityId:string}
  | {id:string;type:'open-factory';cityId:string;package:'flexible'|'balanced'|'automated'|'industrial-flexible'|'industrial-automated'}
  | {id:string;type:'ship-lot';lotId:string;warehouseId:string;express?:boolean}
  | {id:string;type:'transfer-lot';lotId:string;toLocationId:string}
  | {id:string;type:'select-equipment';package:'flexible'|'balanced'|'automated'}
  | {id:string;type:'discover-supplier';supplierId:string}
  | {id:string;type:'expand-storage';warehouseId:string;storageClass:StorageClass}
  | {id:string;type:'purchase';request:PurchaseRequest;quoteId?:string;overrideReserve?:boolean}
  | {id:string;type:'set-reserve';cents:number}
  | WarehousePolicyCommand | ReserveLotCommand | ProductionCommand | SalesCommand | ResearchCommand;
export type WarehousePolicyCommand={id:string;type:'arrival-policy';warehouseId:string;policy:'delay'|'overflow'|'reject';budgetCents:number};
export type ReserveLotCommand={id:string;type:'reserve-lot';lotId:string;contractId:string;quantity:number};
export type CommandResult = {ok:true;state:V4State;events:DomainEvent[]} | {ok:false;state:V4State;error:string};
export interface WeekIntent {tickId:string;expectedWeek:number}
export type WeekOutcome = {ok:true;state:V4State;ledgerEntries:LedgerEntry[];interruptions:string[]} | {ok:false;state:V4State;error:string};
export interface Warehouse {rentCents?:number;id:string;cityId:string;capacityMilliliters:Record<StorageClass,number>;upgrades:{storageClass:StorageClass;milliliters:number;readyWeek:number}[];arrivalPolicy:'delay'|'overflow'|'reject';overflowBudgetCents:number}
export interface Shipment {kind?:'internal'|'customer';id:string;lotId:string;warehouseId:string;arrivalWeek:number;status:'in-transit'|'arrived'|'delayed'|'rejected'|'expired';supplierId:string;promisedWeek:number;delayCount:number}
export interface PurchaseRequest {supplierId:string;varietyId:string;quantityGrams:number;grade:'standard'|'premium';warehouseId:string;purpose?:'manual'|'delegated'}
export interface PurchaseQuote {agreementId?:string;contractQuantity?:number;spotQuantityGrams?:number;routeCents:number;routeWeeks:number;id:string;supplierId:string;varietyId:string;quantityGrams:number;availableGrams:number;discount:number;goodsCents:number;freightCents:number;totalCents:number;quality:number;arrivalWeek:number;storageMilliliters:number;seasonalYield:number;drivers:string[]}
export type QuoteResult={ok:true;quote:PurchaseQuote}|{ok:false;error:string};
export interface RecipeRevision {id:string;recipeId:string;version:number;formula:Record<string,string>;released:boolean;shelfWeeks:number;packagingId:string;producedCases:number}
export interface ProcessProfile {id:string;factoryId:string;recipeRevisionId:string;equipmentSignature:string;methodVersion:number;cycleMinutes:number;expectedYield:number;consistency:number;requiredCompetency:number;provenance:'timed'|'assisted'|'engineer'}
export interface Training {employeeId:string;skill:keyof Employee['skills'];readyWeek:number;improvement:number}
export interface FactoryPlanItem {recipeRevisionId:string;cases:number;contractId?:string;packagingId?:string}
export interface FactoryPlan {factoryId:string;items:FactoryPlanItem[]}
export interface ProductionContext {state:V4State;factoryId:string}
export interface ConsumedInput {lotId:string;quantity:number;costCents:number;quality:number;varietyId:string}
export interface ConsumedPackaging {lotId:string;quantity:number;costCents:number;packagingId:string;brandVersion:number}
export interface ProductionRow {recipeRevisionId:string;packagingId:string;brandVersion:number;plannedCases:number;inputCases:number;goodCases:number;rejectedCases:number;quality:number;flavor:FlavorVector;consumed:ConsumedInput[];packagingConsumed:ConsumedPackaging[];packagingCents:number;materialCents:number;conversionCents:number;allocatedLaborCents:number;stationMinutes:Record<StationId,number>;laborMinutes:number;constraints:string[]}
export interface ProductionSchedule {factoryId:string;rows:ProductionRow[];remainingInventory:InventoryLot[];stationUsedMinutes:Record<StationId,number>;laborUsedMinutes:number;laborAvailableMinutes:number;changeoverMinutes:number;constraints:string[]}
export interface EngineeringJob {id:string;bookingEventId:string;employeeId:string;factoryId:string;recipeRevisionId:string;equipmentSignature:string;bookedWeek:number;dueWeek:number;feeCents:number;minutes:number;status:'booked'|'completed'|'interrupted';profile:ProcessProfile;completionEventId?:string}
export type ProductionCommand=
  | import('./equipment.ts').EquipmentCommand
  | {id:string;type:'place-module';factoryId:string;station:FloorStation;x:number;y:number;tier?:number}
  | {id:string;type:'process-trial';factoryId:string;recipeRevisionId:string;mode:'timed'|'assisted';settings:TrialSettings;handoffs:TrialHandoff[]|HandoffSignal[];samples?:TrialSample[];extendedWindows?:boolean;practice?:boolean}
  | {id:string;type:'engineer-commission';employeeId:string;factoryId:string;recipeRevisionId:string}
  | {id:string;type:'employment-terms';employeeId:string;factoryId:string;minutes:number}
  | {id:string;type:'hire';employeeId:string;factoryId:string}
  | {id:string;type:'train';employeeId:string;skill:keyof Employee['skills']}
  | {id:string;type:'commission';factoryId:string;recipeRevisionId:string;mode:'timed'|'assisted';controls:[number,number,number];practice?:boolean}
  | {id:string;type:'production-plan';plan:FactoryPlan}
  | {id:string;type:'changeover-upgrade';factoryId:string};
export type SegmentId='value'|'gifting'|'enthusiast'|'online';
export interface MarketContext {economicFactor?:number;priceCredibility?:number;targetedSegment?:SegmentId;campaignStrength?:number;segmentShares?:Partial<Record<SegmentId,number>>;cityId:string;week:number;seed:number;trust:number;service:number;awareness:number;cursor?:number}
export interface ProductOffer {id:string;recipeRevisionId:string;priceCents:number;quality:number;flavor:FlavorVector;packagingId:string}
export interface MarketResult {cityId:string;week:number;opportunityCases:number;totalDemand:number;noPurchaseCases:number;rivalCases:number;offers:{id:string;demandCases:number}[];segments:{id:SegmentId;opportunityCases:number;ownDemandCases:number;noPurchaseCases:number;rivalCases:number}[];drivers:string[]}
export interface DemandForecast {basis:'sampled demand before stock constraints';cityId:string;week:number;lowCases:number;expectedCases:number;highCases:number;offers:{id:string;lowCases:number;expectedCases:number;highCases:number}[];drivers:string[];samples:number}
export interface SalesResult {tickId:string;week:number;contracts:{contractId:string;deliveredCases:number;revenueCents:number;depositReleasedCents:number;receivableCents:number}[];retail:{offerId:string;recipeRevisionId:string;packagingId:string;priceCents:number;demandCases:number;soldCases:number;revenueCents:number;cogsCents:number;unservedCases:number;reason:string}[];forecast:DemandForecast|null;market:MarketResult|null}
export type SalesCommand={id:string;type:'set-price';recipeRevisionId:string;priceCents:number};
export interface ResearchBrief {minimumQuality:number;shelfWeeks:number;segment:SegmentId}
export type ResearchPhase='concept'|'pilot'|'taste'|'stability';
export interface ResearchProject {id:string;recipeId:string;revision:number;researcherId:string;formula:Record<string,string>;brief:ResearchBrief;phase:ResearchPhase;status:'active'|'waiting'|'paused'|'failed'|'ready'|'released'|'abandoned';pausedFrom?:'active'|'waiting';dueWeek:number|null;bookingEventId?:string;paidCents:number;budgetCents:number;paidStages:ResearchPhase[];findings:{phase:ResearchPhase;revision:number;week:number;result:string;stageEventId:string;completionEventId:string;value?:number}[];pilotQuality:number|null;pilotFailures:string[];testedShelfWeeks:number|null;remainingCents:number;releasedRevisionId?:string}
export type ResearchCommand=
 | {id:string;type:'introduce-recipe';recipeId:string}
 | {id:string;type:'start-research';projectId:string;recipeId:string;researcherId:string;formula:Record<string,string>;brief:ResearchBrief}
 | {id:string;type:'research-stage';projectId:string}
 | {id:string;type:'research-status';projectId:string;status:'active'|'paused'|'abandoned'}
 | {id:string;type:'revise-research';projectId:string;formula:Record<string,string>;brief:ResearchBrief;repeatFrom?:'pilot'|'taste'|'stability'}
 | {id:string;type:'release-research';projectId:string};
export interface LedgerScope {factoryId?:string;regionId?:string;channelId?:string}
export interface ReportQuery {asOfWeek:number;periodStart:number;periodEnd:number;scopeType:'company'|'factory'|'region'|'channel';scopeId?:string;category:'overview'|'news'|'finance'|'sales'|'supply'|'production'|'obligations'}
export interface ReportMetric {id:string;label:string;value:number|null;unit:'cents'|'cases'|'minutes'|'weeks'|'ratio';basis:'actual'|'forecast'|'planned';period:{start:number;end:number};sourceEventIds:string[];sourceEntityIds:string[];comparison?:{value:number|null;label:string};forecast?:{lower:number;central:number;upper:number;intervalLabel:string;assumptions:string[];modelVersion:string}}
export interface ReportView {schemaVersion:1;generatedFromTickId:string|null;query:ReportQuery;metrics:ReportMetric[];series:{metricId:string;week:number;value:number}[];rows:Record<string,unknown>[];alerts:string[];availableDrilldowns:{id:string;label:string;locationId:string}[]}
export interface MetricRef {query:ReportQuery;metricId:string}
export interface MetricExplanation {baseline:number|null;currentValue:number|null;drivers:{label:string;contribution:number;sourceEventIds:string[];locationId:string}[];remainder:number;basis:string;actions:{label:string;locationId:string}[]}

export interface DelegationPolicy {production?:{priority:'commitments-first'|'contribution';minimumQuality:number;assortment:{recipeRevisionId:string;maximumCases:number;stockTargetCases:number}[]};factoryId:string;managerId:string;enabled:boolean;budgetCents:number;items:{supplierId:string;varietyId:string;grade:'standard'|'premium';minimum:number;target:number}[];packaging:{supplierId:string;packagingId:string;minimum:number;target:number}[]}

export interface ConsumerChannelProposal {kind:"owned-retail"|"ecommerce";cityId:string;warehouseId:string;format:"neighborhood"|"flagship"|"online"}
export interface ConsumerChannel extends ConsumerChannelProposal {id:string;active:boolean;readyWeek:number;assortment:string[];prices?:Record<string,number>;weeklyMediaCents:number;shippingSubsidyCents:number;fulfillmentCases:number;retainedCustomers:number;trust:number;staffHeadcount:number;staffSkill:number;deliveryWeeks:1|2;audience:SegmentId}

export interface ConsumerOrder {id:string;channelId:string;recipeRevisionId:string;packagingId:string;bookedWeek:number;dueWeek:number;quantity:number;priceCents:number;depositCents:number;customerShippingCents:number;shippingCostCents:number;repeatCases:number;allocations:{lotId:string;quantity:number;costCents:number;factoryId:string}[];status:"pending"|"delivered"|"refunded";deliveredWeek?:number;returnedCases:number;refundDueWeek?:number;refundCents:number;refundPaid:boolean}
export interface ConsumerWeek {tickId:string;week:number;channels:{channelId:string;cityId:string;kind:"owned-retail"|"ecommerce";demandCases:number;soldCases:number;bookedCases:number;repeatCases:number;revenueCents:number;cogsCents:number;mediaCents:number;shippingCents:number;returnedCases:number;refundCents:number;unservedCases:number;market:MarketResult|null}[]}

export interface ConsumerCampaignProposal {channelId:string;brief:string;audience:SegmentId;objective:"acquisition"|"retention"|"launch";creativeCents:number;weeklyMediaCents:number;startWeek:number;durationWeeks:number;measurement:string}
export interface ConsumerCampaign extends Omit<ConsumerCampaignProposal,"durationWeeks"> {id:string;endWeek:number;stoppedWeek?:number}

export interface FranchiseStandardProposal {leaderId:string;assortment:string[];minimumQuality:number;royaltyBps:number;supply:'local'|'central';weeklySupportCents:number;openingFeeCents:number;feeEarningWeeks:number;trainingWeeks:number;brief:string}
export interface FranchiseStandard extends FranchiseStandardProposal {id:string;version:number;createdWeek:number}
export interface FranchiseSupportProposal {cityId:string;leaderId:string;weeklyBudgetCents:number}
export interface FranchiseSupportHub extends FranchiseSupportProposal {id:string;readyWeek:number}
export interface FranchiseCohortProposal {partnerId:string;standardId:string;hubId:string;stores:number;priceFactorBps:number;warehouseId?:string;grade?:'standard'|'premium'}
export interface PartnerStock {id:string;kind:'ingredient'|'packaging'|'finished';recipeRevisionId?:string;varietyId?:string;packagingId?:string;quantity:number;costCents:number;quality:number;arrivalWeek:number;expiryWeek:number;supplierId:string}
export interface FranchiseCohort extends FranchiseCohortProposal {id:string;createdWeek:number;grade:'standard'|'premium';partnerCashCents:number;feeRemainingCents:number;serviceWeeks:number;trainingCompletedWeeks:number;extraTrainingWeeks:number;paused:boolean;stock:PartnerStock[];partnerArrearsCents:number;compliantWeeks:number;openedWeek?:number;exception:string}
export interface PartnerPurchase {stock:PartnerStock;goodsCents:number;freightCents:number}
export interface PartnerRecipeSale {finishedConsumed?:{stockId:string;quantityCases:number;costCents:number}[];recipeRevisionId:string;inputCases:number;soldCases:number;quality:number;priceCents:number;materialCents:number;packagingCents:number;consumed:{stockId:string;quantityGrams:number;costCents:number}[];packagingConsumed:{stockId:string;quantityUnits:number;costCents:number}[]}
export interface FranchiseActual {demandCases?:number;soldCases?:number;unservedCases?:number;viable?:boolean;cohortId:string;partnerId:string;cityId:string;supportedStores:number;supportCents:number;openingCashCents:number;closingCashCents:number;trainingCompletedWeeks:number;partnerRevenueCents:number;partnerCogsCents:number;partnerFixedCents:number;partnerFixedPaidCents:number;closingPartnerArrearsCents:number;partnerProcurementCents:number;partnerExpiryCents:number;royaltyCents:number;feeEarnedCents:number;feeRemainingCents:number;serviceWeeks:number;compliant:boolean;exception:string;purchases:PartnerPurchase[];recipes:PartnerRecipeSale[];closingStock:PartnerStock[];stores:{id:string;name:string;status:'training'|'operating'|'paused';exception:string;demandCases?:number;soldCases?:number;compliant?:boolean}[]}
export interface FranchiseWeek {tickId:string;week:number;cohorts:FranchiseActual[]}

export interface FranchiseSupplyOrder {id:string;cohortId:string;recipeRevisionId:string;warehouseId:string;bookedWeek:number;dueWeek:number;quantity:number;unitPriceCents:number;shippingCents:number;status:'pending'|'delivered'|'cancelled';allocations:{lotId:string;quantity:number}[];deliveredWeek?:number;exception?:string}
export interface FranchiseSupplyDelivery {orderId:string;cohortId:string;revenueCents:number;shippingCents:number;consumed:{lotId:string;quantity:number;costCents:number}[];stocks:PartnerStock[]}

export interface OvertimeBooking {id:string;employeeId:string;factoryId:string;bookedWeek:number;minutes:number;costCents:number;status:'booked'|'used'|'expired';workedMinutes:number}

export type MaintenancePolicy='reactive'|'preventive'|'reliability';
export interface FactoryOperations {factoryId:string;startedWeek:number;policy:MaintenancePolicy;stations:Record<StationId,{condition:number;availableMinutes:number;downMinutes:number}>}

export interface MachineOrder {id:string;factoryId:string;station:StationId;financing:'purchase'|'lease';tier:number;x:number;y:number;previousTier:number;previousX:number;previousY:number;bookedWeek:number;dueWeek:number;costCents:number;setupCents:number;weeklyRentCents:number;minimumWeeks:number;status:'installing'|'installed'|'returned'|'cancelled';installedWeek?:number;returnedWeek?:number}

export interface SiteClosure{id:string;factoryId:string;closedWeek:number;storageRentCents:number;workforce:'retain'|'release';depositRefundCents:number;exitCostCents:number;reopenedWeek?:number}

export interface CohortTeam {id:string;workplaceId:string;leaderId:string;role:'production'|'field';grade:'apprentice'|'experienced'|'specialist';headcount:number;minutes:number;readyWeek:number;skillBonus:number;fatigue:number;morale:number;trainingUntilWeek?:number}

export interface SupplyAgreement {id:string;supplierId:string;warehouseId:string;kind:'ingredient'|'packaging';itemId:string;weeklyQuantity:number;weeks:number;grade:'standard'|'premium';startWeek:number;endWeek:number;unitCentsPerThousand:number;setupCents:number;minimumUtilizationBps:number}
