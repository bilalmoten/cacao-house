import {money} from './types.ts';
import {franchisePartners} from '../../game/v4/content/franchise-partners.ts';
import type { V4State } from '../../game/v4/model.ts';
import { catalog } from '../../game/v4/catalog.ts';
import { packagingFamilies } from '../../game/v4/content/packaging.ts';
export function hiddenReportField(field: string) { return ['id', 'eventId', 'tickId', 'signature', 'schemaVersion', 'generatedFromTickId', 'processProfileId', 'offerId', 'lotId', 'modelVersion', 'entityIds', 'locationIds', 'cityIds'].includes(field) || /^source.*Ids?$/.test(field); }
export function reportEntityLabel(state: V4State, field: string, id: string): string {
    if(field==='orderId')return state.franchiseSupplyOrders?.find(o=>o.id===id)?'Licensed central supply order':'Commercial order';
    if(field==='partnerId')return franchisePartners.find(p=>p.id===id)?.name??'Partner operator';
    if(field==='cohortId')return franchisePartners.find(p=>p.id===state.franchiseCohorts?.find(c=>c.id===id)?.partnerId)?.name??'Opening cohort';
    if(field==='channelId'){const channel=state.consumerChannels?.find(c=>c.id===id);if(channel)return `${catalog.cities.find(p=>p.id===channel.cityId)?.name??'Local'} · ${channel.kind==='ecommerce'?'online fulfillment':'owned store'}`;return id.replaceAll('-',' ');}if(field==='campaignId')return state.consumerCampaigns?.find(c=>c.id===id)?.brief??'Campaign brief';
    if (field === 'recipeRevisionId') {
        const revision = state.recipeRevisions.find(r => r.id === id);
        const recipe = catalog.recipes.find(r => r.id === (revision?.recipeId ?? id.split(':r')[0]));
        return recipe ? `${recipe.name} · revision ${revision?.version ?? id.split(':r')[1] ?? 1}` : 'Unavailable recipe record';
    }
    if (field === 'varietyId')
        return catalog.ingredients.find(i => i.id === id)?.name ?? 'Unavailable ingredient';
    if (field === 'supplierId')
        return id==='house'?'House central supply':catalog.suppliers.find(s => s.id === id)?.name ?? 'Unavailable supplier';
    if (field === 'packagingId')
        return packagingFamilies.find(p => p.id === id)?.name ?? 'Unavailable packaging';
    if (field === 'employeeId')
        return state.employees.find(e => e.id === id)?.name ?? 'Unassigned colleague';
    if (field === 'cityId')
        return catalog.cities.find(c => c.id === id)?.name ?? 'Unavailable city';
    if (field === 'contractId')
        return state.contracts.find(c => c.id === id)?.buyer ?? 'Commercial commitment';
    if (['locationId', 'factoryId', 'warehouseId'].includes(field)) {
        if (id.startsWith('transit:'))
            return 'In transit';
        const warehouse = state.warehouses.find(w => w.id === id || 'overflow:' + w.id === id), factory = state.factories.find(f => f.id === id), city = catalog.cities.find(c => c.id === (warehouse?.cityId ?? factory?.cityId));
        if (warehouse)
            return `${city?.name ?? 'Local'} ${id.startsWith('overflow:') ? 'overflow storage' : 'receiving & storage'}`;
        if (factory)
            return `${city?.name ?? 'Local'} workshop`;
        return ({ office: 'House office', workshop: 'Waterfront workshop', 'rafi-pantry': 'Rafi’s pantry', 'ferry-cafe': 'Ferry Café' } as Record<string, string>)[id] ?? 'Local business location';
    }
    return id;
}

export function reportNumberLabel(field:string,value:number,context?:Record<string,unknown>):string {if(field==='cents'||/Cents$/.test(field))return money(value);if(/Milliliters$/.test(field))return (value/1000).toLocaleString();if(field==='quantity'){if(context?.kind==='ingredient'||context?.varietyId)return `${(value/1000).toLocaleString()} kg`;if(context?.kind==='packaging'||context?.packagingId&&!context?.recipeRevisionId)return `${value.toLocaleString()} retail packs`;if(context?.recipeRevisionId||context?.contractId)return `${value.toLocaleString()} cases`;}return value.toLocaleString()}
