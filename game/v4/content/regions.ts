export const regionCities:Record<string,string[]>={
 'north-america':['sf','oakland','oaxaca'],'latin-america':['guayaquil','salvador'],
 europe:['paris','turin'],'east-asia':['kyoto','singapore'],'south-asia':['mumbai'],
 africa:['accra'],'west-asia':['istanbul'],
};
export const regionForCity=(cityId:string)=>Object.entries(regionCities).find(([,cities])=>cities.includes(cityId))?.[0];
