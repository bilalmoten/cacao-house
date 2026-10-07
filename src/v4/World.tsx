import {anniversaryRegions} from '../../game/v4/anniversary';
import{catalog}from '../../game/v4/catalog';import{regionForCity}from '../../game/v4/content/regions';
import{consumerReservedQuantity}from'../../game/v4/channel-stock';
import {regionalPlaces} from '../../game/v4/world-routes';
import type {WorldLocation} from '../world/scene';
import {defaultLayout} from '../../game/v4/layout';
import { useMemo } from 'react';
import V3World from '../world/V3World';
import { previewProduction } from '../../game/v4/production';
import { newGame } from '../../game/engine';
import type { V4State } from '../../game/v4/model';
/** The accepted renderer receives a read-only appearance adapter. No legacy
 * action, forecast, persistence or economy runs for a V4 house. */
export default function World({ state, interior, inactive, onInteract, highlight, area,place }: {
    state: V4State;
    interior: boolean;
    inactive: boolean;
    onInteract: (id: string) => void;
    highlight?: string;
    area?: string;
    place?:string;
}) {
    const visual = useMemo(() => { const s = newGame(); s.week = state.week; s.v3.identity.business = state.identity.business; s.v3.identity.founder = state.identity.founder; s.v3.chapter = 2; return s; }, [state.week, state.identity.business, state.identity.founder]);
    const factory = state.factories.find(f => f.cityId === state.currentCityId);
    const presentation = useMemo(() => { const local = new Set([...(factory ? [factory.id] : []), ...state.warehouses?.filter(w => w.cityId === state.currentCityId).flatMap(w => [w.id, 'overflow:' + w.id]) ?? []]); let active = false; if (factory) {
        try {
            active = previewProduction(state, { factoryId: factory.id, items: factory.plan }).schedule.rows.some(row => row.goodCases > 0);
        }
        catch { }
    }const channels=(state.consumerChannels??[]).filter(c=>c.active&&c.cityId===state.currentCityId&&c.readyWeek<=state.week),sites=new Set(channels.map(c=>c.warehouseId)),commercialStock=state.inventory.filter(l=>l.kind==='finished'&&sites.has(l.locationId)&&l.expiryWeek>=state.week); return {...(state.campaign.flags['global-finale']?{anniversary:{recipes:[...new Set(state.recipeRevisions.filter(r=>r.released).map(r=>catalog.recipes.find(p=>p.id===r.recipeId)!.name))],regions:anniversaryRegions(state)}}:{}),commerce:{storeReady:channels.some(c=>c.kind==='owned-retail'),onlineReady:channels.some(c=>c.kind==='ecommerce'),finishedCases:commercialStock.reduce((n,l)=>n+l.quantity,0),reservedCases:commercialStock.reduce((n,l)=>n+consumerReservedQuantity(state,l.id)+l.reservations.reduce((m,r)=>m+r.quantity,0),0),customers:channels.reduce((n,c)=>n+c.retainedCustomers,0),trust:channels.length?channels.reduce((n,c)=>n+c.trust,0)/channels.length:.5},cityId:state.currentCityId,interiorKind:state.currentCityId==='sf'?(place==='office'?'office' as const:place==='flagship'?'showroom' as const:undefined):regionalPlaces(state.currentCityId).find(p=>p.id===place)?.kind,floor:factory?.layout??defaultLayout(), business: state.identity.business, emblem:state.identity.emblem, primary: state.identity.primary, accent: state.identity.accent, lineInstalled: !!factory, crewCount: 1 + state.employees.filter(e => e.factoryId === factory?.id).length, active, rawKg: state.inventory.filter(l => l.kind === 'ingredient' && local.has(l.locationId)).reduce((n, l) => n + l.quantity, 0) / 1000, finishedCases: state.inventory.filter(l => l.kind === 'finished' && local.has(l.locationId)).reduce((n, l) => n + l.quantity, 0) }; }, [state, factory,place]);
    return <V3World s={visual} location={state.currentCityId as WorldLocation} interior={interior} inactive={inactive} onInteract={onInteract} highlight={highlight} sceneArea={area} presentation={presentation} policy={{ research: interior || state.campaign.stage >= 2, travel: state.campaign.stage >= 2, factories: true, labels: state.currentCityId!=='sf'?{contact:regionalPlaces(state.currentCityId).find(p=>p.id===place)?.contact??'Regional contact',research:'Recipe development',supplier:'Local supply desk',market:'Market context',reports:'Reports Centre',campaign:'Business challenge',collection:'Collection display',buyer:'Buyer brief',commercial:'Channel economics',display:'Display & assortment',stock:'Receiving stock',freight:'Freight & arrival terms',technique:'Technique & process',brief:'Regional product brief',staff:'Named colleagues',people:'People & capability',delegation:'Operating policies',partners:'Partner district',standards:'Operating standard',support:'Field support'}:{ research:interior?'Process studio':'Recipe lab', factory: factory ? 'Your workshop' : 'Inspect the workshop', staff: 'Nadia · your team', supplier: 'Rafi · pantry', buyer: 'Leda · Ferry Café', market: 'The local market', office: 'House office',reports:'Reports Centre',campaign:'Business challenge',people:'Named colleagues',delegation:'Management authority',commercial:'Store & online decisions',display:'Store assortment',production: 'Production line', machines: 'Equipment & setup', inventory: 'Receiving & storage', dispatch: 'Pack & dispatch' } }}/>;
}
