import {applyWorkforceRows,workforceRows,workforceOutcomes} from './workforce.ts';
import {cohortOperators,finishTeamTraining} from './teams.ts';
import {activeEmployee} from './site-recovery.ts';
import {legacyLaborClose} from './legacy-development-labor.ts';
import { catalog } from './catalog.ts';
import { defaultLayout, placeModule, handoffMinutesPerCase, type FloorLayout } from './layout.ts';
import { profileForControls, standardCycleMinutes } from './process.ts';
import { scoreAssistedTrial, scoreTimedTrial } from './activity.ts';
import { packagingFamilies } from './content/packaging.ts';
import { utilityConnections, processEquipmentSignature } from './equipment.ts';
import type { V4State, Employee, DomainEvent, OvertimeBooking } from './model.ts';
import { post, debit, credit } from './finance.ts';
import { protectedCash } from './sourcing.ts';
import { regionForCity } from './content/regions.ts';
import { candidates } from './content/people.ts';
export function laborCapacity(e: Employee, training: boolean, bookedMinutes = 0) { const factor = (training ? .5 : 1) * (1 - e.fatigue / 200); return { base: Math.floor(e.contractedMinutes * factor), extra: Math.floor(bookedMinutes * factor) }; }
export function overtimeCost(e: Employee, minutes: number) { return Math.round(e.wageCents / e.contractedMinutes * minutes * 1.5); }
export function bookOvertime(s: V4State, p: {
    employeeId: string;
    minutes: number;
}, event: DomainEvent) { const e = s.employees.find(e => e.id === p.employeeId), factory = s.factories.find(f => f.id === e?.factoryId && f.active && Math.max(f.readyWeek ?? 1,f.reactivationReadyWeek??1) <= s.week); if (!e || !activeEmployee(e) || e.role !== 'operator' || !factory || s.training.some(t => t.employeeId === e.id) || !Number.isSafeInteger(p.minutes) || p.minutes < 30 || p.minutes % 30 || p.minutes > Math.min(600, e.contractedMinutes * .25) || (s.overtimeBookings ?? []).some(b => b.employeeId === e.id && b.bookedWeek === s.week))
    throw Error('Book one operator’s next close, in half-hour steps up to 25% of contracted hours and at most ten extra hours. Finish training first.'); const cost = overtimeCost(e, p.minutes); if (cost + protectedCash(s) > s.cashCents)
    throw Error('Overtime must preserve the ordinary payroll, premises and loan commitments.'); const b: OvertimeBooking = { id: 'overtime:' + event.id, employeeId: e.id, factoryId: factory.id, bookedWeek: s.week, minutes: p.minutes, costCents: cost, status: 'booked', workedMinutes: 0 }; post(s, event, 'Paid one-close overtime reservation at 150% of base hourly wage', [debit('payroll', cost, e.id), credit('cash', cost)], 'overtime', { factoryId: factory.id, regionId: regionForCity(factory.cityId) }); s.overtimeBookings ??= []; s.overtimeBookings.push(b); event.entityIds = [b.id, e.id, factory.id]; event.details = { booking: JSON.stringify(b) }; }
export function closeOperatorHours(employees: Employee[], bookings: OvertimeBooking[], week: number, training: Set<string>, production: Pick<V4State['lastProduction'][number], 'factoryId' | 'laborUsedMinutes'>[]) {
    const rows = [];
    for (const e of employees.filter(e => activeEmployee(e) && e.role === 'operator')) {
        const b = bookings.find(b => b.employeeId === e.id && b.bookedWeek === week), own = laborCapacity(e, training.has(e.id), b?.minutes ?? 0), team = employees.filter(p => activeEmployee(p) && p.role === 'operator' && p.factoryId === e.factoryId), teamBase = team.reduce((n, p) => n + laborCapacity(p, training.has(p.id)).base, 0), teamExtra = team.reduce((n, p) => n + laborCapacity(p, training.has(p.id), bookings.find(b => b.employeeId === p.id && b.bookedWeek === week)?.minutes ?? 0).extra, 0), used = production.find(p => p.factoryId === e.factoryId)?.laborUsedMinutes ?? 0, worked = teamExtra ? Math.min(own.extra, Math.floor(Math.max(0, used - teamBase) * own.extra / teamExtra)) : 0, openingFatigue = e.fatigue;
        e.fatigue = worked ? Math.min(80, e.fatigue + Math.ceil(worked / 30) * 2) : Math.max(0, e.fatigue - 8);
        if (b) {
            b.workedMinutes = worked;
            b.status = worked ? 'used' : 'expired';
        }
        rows.push({ employeeId: e.id, factoryId: e.factoryId, baseAvailableMinutes: own.base, additionalAvailableMinutes: own.extra, bookedMinutes: b?.minutes ?? 0, workedMinutes: worked, costCents: b?.costCents ?? 0, openingFatigue, closingFatigue: e.fatigue });
    }
    return rows;
}
export function resolveOvertime(s: V4State, event: DomainEvent) { const rows = closeOperatorHours([...s.employees,...cohortOperators(s)], s.overtimeBookings ?? [], s.week, new Set(s.training.filter(t => t.readyWeek > s.week).map(t => t.employeeId)), s.lastProduction); if (s.overtimeBookings?.length)
    event.details.overtimeActuals = JSON.stringify(rows); return rows; }
/** Paid staff, terms and training reconstruct every close's available hours.
 * Stored labor totals and fatigue are observations, never extra capacity. */
export function overtimeEvidenceErrors(s: V4State) {
    try {
        const teams:import("./model.ts").CohortTeam[]=[], staff: Employee[] = [], bookings: OvertimeBooking[] = [], training = new Map<string, {
            readyWeek: number;
            skill: keyof Employee['skills'];
        }>(), snapshots = new Map(s.snapshots.map(w => [w.tickId, w])), floors = new Map<string, FloorLayout>(), changeovers = new Map<string, number>(), profiles = new Map<string, import('./model.ts').ProcessProfile>();
        const retain = (profile: import('./model.ts').ProcessProfile) => { const old = profiles.get(profile.id); if (!old || profile.expectedYield >= old.expectedYield && profile.cycleMinutes <= old.cycleMinutes)
            profiles.set(profile.id, profile); };
        const datedFactory = (id: string) => { const f = s.factories.find(f => f.id === id)!; return { ...f, layout: floors.get(id) ?? defaultLayout(), changeoverTier: changeovers.get(id) ?? 0, stations: Object.fromEntries((floors.get(id) ?? defaultLayout()).modules.map(m => [m.station, { tier: m.tier, minutes: 0 }])) } as typeof f; };
        for (const event of s.events) {
            let p: Record<string, any> = {};
            try {
                p = JSON.parse(event.signature);
            }
            catch { }
            if (event.type === 'upgrade-utilities') {
                const floor = floors.get(p.factoryId) ?? defaultLayout(), index = utilityConnections.findIndex(u => u.power === floor.powerCapacity && u.cooling === floor.coolingCapacity), next = utilityConnections[index + 1];
                if (!next)
                    throw Error('Dated utility');
                floors.set(p.factoryId, { ...floor, powerCapacity: next.power, coolingCapacity: next.cooling });
            }
            if(event.type==='return-leased-module'){const job=s.machineOrders?.find(j=>j.id===p.orderId);if(job)p={...p,factoryId:job.factoryId,station:job.station,tier:job.previousTier,x:job.previousX,y:job.previousY};}
            if (['place-module', 'upgrade-module','install-module','return-leased-module'].includes(event.type)) {
                const floor = floors.get(p.factoryId) ?? defaultLayout(), old = floor.modules.find(m => m.station === p.station)!;
                const result = placeModule(floor, { station: p.station, x: p.x ?? old.x, y: p.y ?? old.y, tier: ['install-module','return-leased-module'].includes(event.type)?p.tier:old.tier + (event.type === 'upgrade-module' ? 1 : 0) });
                if (!result.ok)
                    throw Error('Dated floor');
                floors.set(p.factoryId, result.layout);
            }
            if (event.type === 'changeover-upgrade')
                changeovers.set(p.factoryId, (changeovers.get(p.factoryId) ?? 0) + 1);
            if (['commission', 'process-trial'].includes(event.type)) {
                const revision = s.recipeRevisions.find(r => r.id === p.recipeRevisionId)!;
                const controls = event.type === 'commission' ? p.controls : p.mode === 'timed' ? scoreTimedTrial(p.samples, p.handoffs, p.extendedWindows === true).controls : scoreAssistedTrial(p.settings, p.handoffs).controls;
                retain(profileForControls(p.factoryId, p.recipeRevisionId, revision.recipeId, processEquipmentSignature(datedFactory(p.factoryId), revision.recipeId), p.mode, controls));
            }
            if (event.type === 'hire') {
                const c = candidates.find(c => c.id === p.employeeId);
                if (!c)
                    throw Error('Unknown staff');
                const { stage, ...e } = c;
                staff.push({ ...structuredClone(e), factoryId: p.factoryId });
            }
            if(event.type==='configure-team'){const old=teams.find(t=>t.workplaceId===p.workplaceId&&t.role===p.role),added=Math.max(0,p.headcount-(old?.headcount??0)),team={id:old?.id??'team:'+p.role+':'+p.workplaceId,workplaceId:p.workplaceId,leaderId:p.leaderId,role:p.role,grade:p.grade,headcount:p.headcount,minutes:p.minutes,readyWeek:added?event.week+2:old?.readyWeek??event.week,skillBonus:old?.skillBonus??0,fatigue:old?.fatigue??0,morale:old?.morale??85};if(old)Object.assign(old,team);else teams.push(team);}
            if(event.type==='train-team'){const t=teams.find(t=>t.id===p.teamId);if(t)t.trainingUntilWeek=event.week+2;}
            if(event.type==='close-factory'&&p.workforce==='release')for(const t of teams)if(t.workplaceId===p.factoryId&&t.role==='production')t.headcount=0;
            if(event.type==='release-employee'){const e=staff.find(e=>e.id===p.employeeId);if(e)e.departedWeek=event.week;}
            if(event.type==='close-factory'&&p.workforce==='release')for(const e of staff)if(e.factoryId===p.factoryId&&activeEmployee(e))e.departedWeek=event.week;
            if(event.type==='rehire-employee'){const e=staff.find(e=>e.id===p.employeeId);if(e){delete e.departedWeek;e.factoryId=p.factoryId;e.fatigue=0;}}
            if (event.type === 'employment-terms') {
                if (bookings.some(b => b.employeeId === p.employeeId && b.bookedWeek === event.week))
                    throw Error('Paid hours changed before close');
                const e = staff.find(e => e.id === p.employeeId)!, c = candidates.find(c => c.id === p.employeeId)!;
                e.factoryId = p.factoryId;
                e.contractedMinutes = p.minutes;
                e.wageCents = Math.round(c.wageCents * p.minutes / c.contractedMinutes);
            }
            if (event.type === 'train' && bookings.some(b => b.employeeId === p.employeeId && b.bookedWeek === event.week))
                throw Error('Paid hours conflict with training');
            if (event.type === 'train')
                training.set(p.employeeId, { readyWeek: event.week + 2, skill: p.skill });
            if (event.type === 'book-overtime') {
                const e = staff.find(e => e.id === p.employeeId), f = s.factories.find(f => f.id === e?.factoryId), prior = s.events.slice(0, s.events.indexOf(event));
                if (!e || !activeEmployee(e) || e.role !== 'operator' || !f || !Number.isSafeInteger(p.minutes) || p.minutes < 30 || p.minutes % 30 || p.minutes > Math.min(600, e.contractedMinutes * .25) || training.has(e.id) || bookings.some(b => b.employeeId === e.id && b.bookedWeek === event.week) || Math.max(f.readyWeek ?? 1,f.reactivationReadyWeek??1) > event.week || !prior.some(q => q.type === 'select-equipment' && f.id === 'sf-workshop' || q.type === 'open-factory' && q.entityIds.includes(f.id)))
                    throw Error('Overtime authority');
                const b: OvertimeBooking = { id: 'overtime:' + event.id, employeeId: e.id, factoryId: f.id, bookedWeek: event.week, minutes: p.minutes, costCents: overtimeCost(e, p.minutes), status: 'booked', workedMinutes: 0 }, j = s.ledger.filter(j => j.eventId === event.id);
                if (p.id !== event.id || p.type !== event.type || event.details.booking !== JSON.stringify(b) || JSON.stringify(event.entityIds) !== JSON.stringify([b.id, e.id, f.id]) || j.length !== 1 || j[0].id !== event.id + ':overtime' || j[0].week !== event.week || JSON.stringify(j[0].scope) !== JSON.stringify({ factoryId: f.id, regionId: regionForCity(f.cityId) }) || JSON.stringify(j[0].postings) !== JSON.stringify([debit('payroll', b.costCents, e.id), credit('cash', b.costCents)]))
                    throw Error('Overtime payment');
                bookings.push(b);
            }
            if (event.origin === 'tick') {
                for (const job of s.engineeringJobs.filter(j => j.status === 'completed' && j.completionEventId === event.id))
                    retain(job.profile);
                for (const [id, t] of training)
                    if (t.readyWeek <= event.week) {
                        const e = staff.find(e => e.id === id);
                        if (e)
                            e.skills[t.skill] = Math.min(100, e.skills[t.skill] + 12);
                        training.delete(id);
                    }
                const teamContext={...s,week:event.week,employees:staff,cohortTeams:teams,training:[...training].map(([employeeId,t])=>({employeeId,skill:t.skill,readyWeek:t.readyWeek,improvement:12}))};finishTeamTraining(teamContext);const operatingStaff=[...staff,...cohortOperators(teamContext)];
                const snap = snapshots.get(event.id);
                if (!snap)
                    throw Error('Hours close');
                for (const f of snap.production) {
                    const capacity = operatingStaff.filter(e => activeEmployee(e) && e.role === 'operator' && e.factoryId === f.factoryId).reduce((n, e) => { const c = laborCapacity(e, training.has(e.id), bookings.find(b => b.employeeId === e.id && b.bookedWeek === event.week)?.minutes ?? 0); return n + c.base + c.extra; }, 0);
                    if (capacity !== f.laborAvailableMinutes)
                        throw Error('Unpaid labor availability');
                    const legacy = !bookings.some(b => b.bookedWeek === event.week) && legacyLaborClose(event, snap.production);
                    const factory = datedFactory(f.factoryId), team = operatingStaff.filter(e => activeEmployee(e) && e.role === 'operator' && e.factoryId === f.factoryId), skill = team.length ? team.reduce((n, e) => n + e.skills.production * (1 - e.fatigue / 500)*(e.cohortHeadcount??1), 0) / team.reduce((n,e)=>n+(e.cohortHeadcount??1),0) : 0;
                    let previousFamily = '', previousPackaging = '', used = 0;
                    for (const row of f.rows) {
                        let labor = 0;
                        if (row.inputCases) {
                            const revision = s.recipeRevisions.find(r => r.id === row.recipeRevisionId)!, recipe = catalog.recipes.find(r => r.id === revision.recipeId)!, profile = profiles.get(`${factory.id}/${revision.id}/${processEquipmentSignature(factory, recipe.id)}`), pack = packagingFamilies.find(p => p.id === row.packagingId)!;
                            if (!profile)
                                throw Error('Dated labor method');
                            const factor = Math.max(.8, profile.cycleMinutes / standardCycleMinutes(recipe.id), .8 + Math.max(0, profile.requiredCompetency - skill) / Math.max(1, profile.requiredCompetency) * .35), ingredientCycle = recipe.roles.reduce((n, r) => n + (catalog.ingredients.find(i => i.id === revision.formula[r.role])?.cycleFactor ?? 1) * r.qualityWeight, 0) / recipe.roles.reduce((n, r) => n + r.qualityWeight, 0), perLabor = recipe.operations.reduce((n, op) => n + op.laborMinutesPerCase * (['processing', 'tempering', 'cooling'].includes(op.station) ? factor * ingredientCycle : 1), 0) + pack.packingExtraMinutesPerCase + handoffMinutesPerCase(factory.layout!), family = recipe.route + ':' + (recipe.roles.some(r => ['dairy', 'cream', 'fat'].includes(r.role)) ? 'dairy' : 'no-dairy') + ':' + (recipe.roles.some(r => r.role === 'nut') ? 'nuts' : 'no-nuts'), setup = previousFamily && family !== previousFamily ? [480, 300, 180, 90][factory.changeoverTier] : 0, packingSetup = previousPackaging && previousPackaging !== row.packagingId ? [90, 60, 45, 30][factory.changeoverTier] : 0;
                            labor = Math.ceil(perLabor * row.inputCases) + setup + packingSetup;
                            previousFamily = family;
                            previousPackaging = row.packagingId;
                        }
                        if (!legacy && row.laborMinutes !== labor)
                            throw Error(`Dated batch labor W${event.week} ${f.factoryId} ${row.recipeRevisionId}: stored ${row.laborMinutes}, derived ${labor}, inputs ${row.inputCases}, skill ${skill}`);
                        used += labor;
                    }
                    if (!legacy && used !== f.laborUsedMinutes)
                        throw Error('Dated factory labor');
                }
                const rows = closeOperatorHours(operatingStaff, bookings, event.week, new Set(training.keys()), snap.production);
                if (bookings.length ? event.details.overtimeActuals !== JSON.stringify(rows) : event.details.overtimeActuals !== undefined)
                    throw Error('Dated fatigue and overtime');
                if(event.details.workforceTerms===1&&event.details.workforceActuals!==JSON.stringify(workforceOutcomes(s,event,staff,teams)))throw Error('Dated workforce retention');
                applyWorkforceRows(staff,teams,workforceRows(event),event.week);
            }
        }
        if (JSON.stringify(bookings) !== JSON.stringify(s.overtimeBookings ?? []) || staff.some(e => s.employees.find(p => p.id === e.id)?.fatigue !== e.fatigue))
            throw Error('Live paid hours or fatigue');
        return [];
    }
    catch {
        return ['Staff hours, paid overtime or fatigue differ from dated operating authority'];
    }
}
