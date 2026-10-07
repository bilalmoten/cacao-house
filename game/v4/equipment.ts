import type { V4State, Factory, DomainEvent, StationId } from './model.ts';
import { defaultLayout, placeModule, inspectLayout, type FloorLayout, type FloorStation } from './layout.ts';
import { protectedCash } from './sourcing.ts';
import { post, debit, credit } from './finance.ts';
import { regionForCity } from './content/regions.ts';
import { catalog } from './catalog.ts';
export const moduleUpgradeCosts = [90000, 160000, 260000] as const;
export const utilityConnections = [{ power: 18, cooling: 8 }, { power: 30, cooling: 16 }, { power: 60, cooling: 24 }] as const;
export function stationCapacity(packageId: string, station: StationId, tier: number,scale=1) { const core = packageId.endsWith('flexible') ? 600 : packageId.endsWith('balanced') ? 900 : 1400; return Math.round(Math.round(core*scale * (station === 'cooling' ? .65 : station === 'packing' ? .8 : 1)) * [1, 1.35, 1.8, 2.35][tier - 1]); }
/** Only calibrated operations bind certification; handling upgrades retain the method. */
export function processEquipmentSignature(factory: Factory, recipeId: string): string { const recipe = catalog.recipes.find(r => r.id === recipeId); if (!recipe)
    throw Error('Unknown documented recipe.'); const calibrated = ['processing', 'tempering', 'cooling']; const relevant = [...new Set(recipe.operations.map(o => o.station))].filter(s => calibrated.includes(s)).sort(); return factory.equipmentSignature + relevant.filter(s => factory.stations[s].tier > 1).map(s => `;${s}=${factory.stations[s].tier}`).join(''); }
export type EquipmentCommand = {
    id: string;
    type: 'upgrade-module';
    factoryId: string;
    station: FloorStation;
    x?: number;
    y?: number;
} | {
    id: string;
    type: 'upgrade-utilities';
    factoryId: string;
};
export function equipmentProposal(state: V4State, command: EquipmentCommand) {
    const factory = state.factories.find(f => f.id === command.factoryId && f.active);
    if (!factory)
        throw Error('Choose an active owned production site.');
    const floor = factory.layout ?? defaultLayout();
    if (command.type === 'upgrade-utilities') {
        const index = utilityConnections.findIndex(c => c.power === floor.powerCapacity && c.cooling === floor.coolingCapacity);
        if (index < 0 || index >= 2)
            throw Error('This site already has its final utility connection.');
        if (state.campaign.stage < index + 2)
            throw Error('Establish the next operating stage before expanding utility service.');
        const next = utilityConnections[index + 1], layout = { ...structuredClone(floor), powerCapacity: next.power, coolingCapacity: next.cooling };
        return { factory, layout, costCents: [180000, 320000][index], relocationCents: 0, station: undefined, tier: undefined };
    }
    const module = floor.modules.find(m => m.station === command.station);
    if (!module)
        throw Error('Choose a supported installed station.');
    if (module.tier >= 4)
        throw Error('This module is already at tier four.');
    const tier = module.tier + 1;
    if (state.campaign.stage < tier)
        throw Error('Establish the next operating stage before buying this station tier.');
    const result = placeModule(floor, { station: command.station, tier, x: command.x ?? module.x, y: command.y ?? module.y });
    if (!result.ok)
        throw Error(result.error);
    return { factory, layout: result.layout, costCents: moduleUpgradeCosts[tier - 2], relocationCents: (command.x !== undefined && command.x !== module.x || command.y !== undefined && command.y !== module.y) ? 5000 : 0, station: command.station, tier };
}
export function upgradeEquipment(state: V4State, command: EquipmentCommand, event: DomainEvent) { const p = equipmentProposal(state, command), cost = p.costCents + p.relocationCents; if (cost + protectedCash(state) > state.cashCents)
    throw Error('The equipment investment would spend protected operating obligations.'); const scope = { factoryId: p.factory.id, regionId: regionForCity(p.factory.cityId) }; post(state, event, command.type === 'upgrade-module' ? 'Purchased station upgrade' : 'Expanded power and cooling connection', [debit('equipment', p.costCents, p.factory.id), credit('cash', p.costCents)], 'capital', scope); if (p.relocationCents)
    post(state, event, 'Upgrade contractor relocation', [debit('commissioning', p.relocationCents, p.factory.id), credit('cash', p.relocationCents)], 'placement', scope); p.factory.layout = p.layout; if (p.station && p.tier)
    p.factory.stations[p.station] = { tier: p.tier, minutes: stationCapacity(p.factory.packageId, p.station, p.tier,p.factory.capacityScale??1) }; event.entityIds = [p.factory.id, ...(p.station ? [p.station] : [])]; event.details = { factoryId: p.factory.id, costCents: cost, ...(p.station && p.tier ? { station: p.station, tier: p.tier } : {}), powerCapacity: p.layout.powerCapacity, coolingCapacity: p.layout.coolingCapacity }; }
/** Calibration identity at the trial's source event, before later upgrades. */
export function historicalProcessSignature(state: V4State, factoryId: string, recipeId: string, eventId: string): string | undefined {
    const current = state.factories.find(f => f.id === factoryId);
    if (!current)
        return;
    const initial = factoryId === 'sf-workshop' ? state.events.find(e => e.type === 'select-equipment') : state.events.find(e => ['select-equipment','open-factory'].includes(e.type) && e.entityIds.includes(factoryId));
    if (!initial)
        return;
    const purchase = JSON.parse(initial.signature), factory = { ...current, equipmentSignature: current.cityId+':' + purchase.package + ':1', stations: Object.fromEntries(Object.keys(current.stations).map(s => [s, { tier: 1, minutes: 0 }])) } as Factory;
    for (const event of state.events) {
        if (event.id === eventId)
            break;
        if(['install-module','return-leased-module'].includes(event.type)&&event.entityIds.includes(factoryId)){const p=JSON.parse(event.signature),job=state.machineOrders?.find(j=>j.id===(p.orderId??event.details.orderId));if(job)factory.stations[job.station].tier=event.type==='install-module'?job.tier:job.previousTier;}
        if (event.type === 'upgrade-module' && event.entityIds.includes(factoryId)) {
            const c = JSON.parse(event.signature);
            factory.stations[c.station as StationId].tier++;
        }
    }
    return processEquipmentSignature(factory, recipeId);
}
