import type {PackagingFamily} from '../model.ts';
/** Physical consumer packs; each commercial case contains 20 retail units. */
export const packagingFamilies:PackagingFamily[]=[
 {id:'ordinary-wrap',name:'Everyday wrapper',stage:1,baseUnitCents:3,minimumOrderUnits:1000,unitVolumeMilliliters:20,finishedCaseMilliliters:1800,packingExtraMinutesPerCase:0,protection:.25,maximumShelfWeeks:16,compatibleStorageClasses:['dry','controlled','cold']},
 {id:'presentation-box',name:'Presentation box',stage:2,baseUnitCents:12,minimumOrderUnits:1000,unitVolumeMilliliters:120,finishedCaseMilliliters:4600,packingExtraMinutesPerCase:12,protection:.45,maximumShelfWeeks:8,compatibleStorageClasses:['dry','controlled','cold']},
 {id:'protective-pack',name:'Protective shipping pack',stage:4,baseUnitCents:8,minimumOrderUnits:1000,unitVolumeMilliliters:90,finishedCaseMilliliters:4000,packingExtraMinutesPerCase:8,protection:.9,maximumShelfWeeks:16,compatibleStorageClasses:['dry','controlled','cold']},
];
