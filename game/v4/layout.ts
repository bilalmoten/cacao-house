import { utilityConnections, moduleUpgradeCosts, stationCapacity } from './equipment.ts';
import { regionForCity } from './content/regions.ts';
/** Physical floor configuration. Utilities and walked routes are explicit, never a throughput bonus. */
export type FloorStation = 'preparation' | 'processing' | 'tempering' | 'cooling' | 'packing';
export interface FloorModule {
    station: FloorStation;
    x: number;
    y: number;
    tier: number;
}
export interface FloorLayout {
    width: number;
    height: number;
    powerCapacity: number;
    coolingCapacity: number;
    modules: FloorModule[];
}
export interface FloorCell {
    x: number;
    y: number;
}
const order: FloorStation[] = ['preparation', 'processing', 'tempering', 'cooling', 'packing'];
const bays: Record<FloorStation, [
    number,
    number,
    number,
    number
]> = { preparation: [0, 0, 3, 3], processing: [3, 0, 7, 3], tempering: [7, 0, 10, 3], cooling: [5, 3, 10, 6], packing: [0, 3, 5, 6] };
const power: Record<FloorStation, number> = { preparation: 1, processing: 4, tempering: 3, cooling: 3, packing: 2 };
export function defaultLayout(): FloorLayout { return { width: 10, height: 8, powerCapacity: 18, coolingCapacity: 8, modules: [{ station: 'preparation', x: 1, y: 1, tier: 1 }, { station: 'processing', x: 4, y: 1, tier: 1 }, { station: 'tempering', x: 7, y: 1, tier: 1 }, { station: 'cooling', x: 6, y: 4, tier: 1 }, { station: 'packing', x: 2, y: 4, tier: 1 }] }; }
const key = (p: FloorCell) => `${p.x}:${p.y}`;
function dimensions(m: FloorModule) { return { width: m.tier >= 4 ? 3 : 2, height: 2, power: power[m.station] * m.tier, cooling: (m.station === 'tempering' ? 2 : m.station === 'cooling' ? 4 : 0) * m.tier }; }
function route(floor: FloorLayout, blocked: Set<string>, start: FloorCell, end: FloorCell): FloorCell[] {
    const queue = [start], visited = new Set([key(start)]), previous = new Map<string, FloorCell>();
    if (blocked.has(key(start)) || blocked.has(key(end)))
        return [];
    for (let i = 0; i < queue.length; i++) {
        const p = queue[i];
        if (key(p) === key(end)) {
            const result = [p];
            while (key(result[0]) !== key(start))
                result.unshift(previous.get(key(result[0]))!);
            return result;
        }
        for (const q of [{ x: p.x + 1, y: p.y }, { x: p.x - 1, y: p.y }, { x: p.x, y: p.y + 1 }, { x: p.x, y: p.y - 1 }]) {
            const id = key(q);
            if (q.x < 0 || q.y < 0 || q.x >= floor.width || q.y >= floor.height || blocked.has(id) || visited.has(id))
                continue;
            visited.add(id);
            previous.set(id, p);
            queue.push(q);
        }
    }
    return [];
}
export function inspectLayout(floor: FloorLayout) {
    const errors: string[] = [], blocked = new Set<string>();
    let powerUsed = 0, coolingUsed = 0;
    const modules = floor.modules.map(m => ({ ...m, ...dimensions(m) }));
    if (floor.width !== 10 || floor.height !== 8 || !utilityConnections.some(c => c.power === floor.powerCapacity && c.cooling === floor.coolingCapacity))
        errors.push('This site has a fixed 10 by 8 floor and a documented utility connection.');
    for (const station of order) {
        if (modules.filter(m => m.station === station).length !== 1)
            errors.push(`Place exactly one ${station} module.`);
    }
    for (const m of modules) {
        if (!order.includes(m.station) || !Number.isInteger(m.tier) || m.tier < 1 || m.tier > 4 || !Number.isInteger(m.x) || !Number.isInteger(m.y)) {
            errors.push('Use a supported station tier and whole floor cells.');
            continue;
        }
        const [left, top, right, bottom] = bays[m.station];
        if (m.x < left || m.y < top || m.x + m.width > right || m.y + m.height > bottom)
            errors.push(`${m.station} must fit inside its service bay.`);
        powerUsed += m.power;
        coolingUsed += m.cooling;
        for (let x = m.x; x < m.x + m.width; x++)
            for (let y = m.y; y < m.y + m.height; y++) {
                const id = key({ x, y });
                if (blocked.has(id))
                    errors.push('Station footprints overlap.');
                blocked.add(id);
            }
    }
    if (powerUsed > floor.powerCapacity)
        errors.push('The proposed line exceeds the site power connection.');
    if (coolingUsed > floor.coolingCapacity)
        errors.push('The proposed line exceeds the cooling connection.');
    const ports = new Map(modules.map(m => [m.station, { x: m.x, y: m.y + m.height }]));
    const handoffs = order.slice(1).map((to, i) => {
        const from = order[i], start = ports.get(from), end = ports.get(to), path = start && end ? route(floor, blocked, start, end) : [];
        if (!path.length)
            errors.push(`No clear handoff route from ${from} to ${to}.`);
        return { from, to, path, cells: Math.max(0, path.length - 1) };
    });
    for (const [station, port] of ports) {
        if (!route(floor, blocked, { x: 0, y: 7 }, port).length || !route(floor, blocked, port, { x: 9, y: 7 }).length)
            errors.push(`${station} lacks clear receiving or dispatch access.`);
    }
    return { errors: [...new Set(errors)], modules, handoffs, powerUsed, coolingUsed };
}
export function placeModule(floor: FloorLayout, request: {
    station: FloorStation;
    x: number;
    y: number;
    tier?: number;
}): {
    ok: true;
    layout: FloorLayout;
} | {
    ok: false;
    layout: FloorLayout;
    error: string;
} {
    if (!order.includes(request.station))
        return { ok: false, layout: floor, error: 'Choose an existing work station.' };
    const candidate = structuredClone(floor), m = candidate.modules.find(m => m.station === request.station);
    if (!m)
        return { ok: false, layout: floor, error: 'The current line is missing this station.' };
    Object.assign(m, { x: request.x, y: request.y, tier: request.tier ?? m.tier });
    const inspected = inspectLayout(candidate);
    if (inspected.errors.length)
        return { ok: false, layout: floor, error: inspected.errors.join(' ') };
    return { ok: true, layout: candidate };
}
export function handoffMinutesPerCase(floor: FloorLayout): number {
    const result = inspectLayout(floor);
    if (result.errors.length)
        throw Error(result.errors.join(' '));
    return result.handoffs.reduce((n, h) => n + h.cells, 0) * 0.05;
}
/** Replay purchases and contractor moves; valid geometry alone does not authorize assets. */
export function floorEvidenceErrors(state: import('./model.ts').V4State): string[] {
    const errors: string[] = [];
    for (const factory of state.factories) {
        let expected = defaultLayout();
        const moves = state.events.filter(e => ['place-module', 'upgrade-module', 'upgrade-utilities','install-module','return-leased-module'].includes(e.type) && e.entityIds.includes(factory.id));
        for (const event of moves) {
            try {
                if(['install-module','return-leased-module'].includes(event.type)){const p=JSON.parse(event.signature),job=state.machineOrders?.find(j=>j.id===(p.orderId??event.details.orderId));if(!job||job.factoryId!==factory.id||event.type==='install-module'&&event.id!==job.id+':installed')throw Error('Missing paid installation');const result=placeModule(expected,{station:job.station,tier:event.type==='install-module'?job.tier:job.previousTier,x:event.type==='install-module'?job.x:job.previousX,y:event.type==='install-module'?job.y:job.previousY});if(!result.ok)throw Error(result.error);expected=result.layout;continue;}
                const c = JSON.parse(event.signature);
                if (c.id !== event.id || c.type !== event.type || c.factoryId !== factory.id)
                    throw Error('Invalid equipment source');
                let capital = 0, placement = 0;
                if (c.type === 'upgrade-utilities') {
                    const index = utilityConnections.findIndex(u => u.power === expected.powerCapacity && u.cooling === expected.coolingCapacity);
                    if (index < 0 || index >= 2)
                        throw Error('Invalid utility tier');
                    const next = utilityConnections[index + 1];
                    expected = { ...expected, powerCapacity: next.power, coolingCapacity: next.cooling };
                    capital = [180000, 320000][index];
                }
                else {
                    const old = expected.modules.find(m => m.station === c.station);
                    if (!old)
                        throw Error('Unknown station');
                    const tier = c.type === 'upgrade-module' ? old.tier + 1 : old.tier;
                    if (tier > 4 || c.type === 'place-module' && c.tier !== undefined && c.tier !== tier)
                        throw Error('Invalid tier');
                    const x = c.x ?? old.x, y = c.y ?? old.y;
                    placement = c.type === 'place-module' || x !== old.x || y !== old.y ? 5000 : 0;
                    if (c.type === 'upgrade-module')
                        capital = moduleUpgradeCosts[tier - 2];
                    const result = placeModule(expected, { station: c.station, x, y, tier });
                    if (!result.ok)
                        throw Error(result.error);
                    expected = result.layout;
                }
                const entries = state.ledger.filter(e => e.eventId === event.id);
                const amounts = [...(capital ? [['equipment', capital]] : []), ...(placement ? [['commissioning', placement]] : [])];
                if (entries.length !== amounts.length || amounts.some(([account, amount]) => !entries.some(e => e.scope?.factoryId === factory.id && e.scope?.regionId === regionForCity(factory.cityId) && Object.keys(e.scope ?? {}).length === 2 && e.postings.length === 2 && e.postings.some(p => p.account === account && p.entityId === factory.id && p.debitCents === amount && p.creditCents === 0) && e.postings.some(p => p.account === 'cash' && p.debitCents === 0 && p.creditCents === amount))))
                    throw Error('Missing exact equipment payment');
            }
            catch {
                errors.push('Physical equipment configuration lacks its paid source.');
            }
        }
        if (factory.layout !== undefined && JSON.stringify(factory.layout) !== JSON.stringify(expected) || moves.length && factory.layout === undefined)
            errors.push('Saved physical floor differs from its purchased configuration.');
        const purchase = factory.id === 'sf-workshop' ? state.events.find(e => e.type === 'select-equipment') : state.events.find(e => e.type === 'select-equipment' && e.entityIds.includes(factory.id));
        if (factory.id === 'sf-workshop' && (!purchase || !purchase.entityIds.includes(factory.id)))
            errors.push('The owned opening factory requires its original purchase witness.');
        let paidPackage: string | undefined;
        if (purchase) {
            try {
                paidPackage = JSON.parse(purchase.signature).package;
                if (!['flexible', 'balanced', 'automated'].includes(paidPackage!) || factory.packageId !== paidPackage || factory.equipmentSignature !== 'sf:' + paidPackage + ':1')
                    errors.push('Installed package differs from the original paid purchase.');
                const cost = paidPackage === 'flexible' ? 140000 : paidPackage === 'balanced' ? 220000 : 320000;
                const entries = state.ledger.filter(e => e.eventId === purchase.id);
                if (entries.length !== 2 || !entries.some(e => e.scope?.factoryId === factory.id && e.scope?.regionId === regionForCity(factory.cityId) && Object.keys(e.scope ?? {}).length === 2 && e.postings.length === 3 && e.postings.some(p => p.account === 'equipment' && p.entityId === factory.id && p.debitCents === cost && p.creditCents === 0) && e.postings.some(p => p.account === 'premises-deposit' && p.entityId === factory.id && p.debitCents === 40000 && p.creditCents === 0) && e.postings.some(p => p.account === 'cash' && p.creditCents === cost + 40000 && p.debitCents === 0)))
                    errors.push('Installed package lacks its exact paid purchase.');
            }
            catch {
                errors.push('Unreadable equipment purchase.');
            }
        }
        if (paidPackage)
            for (const m of expected.modules) {
                const station = factory.stations[m.station];
                if (station.tier !== m.tier || station.minutes !== stationCapacity(paidPackage, m.station, m.tier,1))
                    errors.push('Station capacity differs from its paid equipment tier.');
            }
    }
    return [...new Set(errors)];
}
