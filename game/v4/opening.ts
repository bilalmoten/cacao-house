import {finishTeamTraining} from './teams.ts';
import {finishMachineOrders} from './machine-orders.ts';
import type {V4State,DomainEvent} from './model.ts';
import {finishEngineering} from './engineering.ts';
import {receiveShipments} from './inventory.ts';
import {finishTraining} from './people.ts';
import {finishResearch} from './research.ts';
/** Shared deterministic opening boundary for committed weeks and read-only
 * production outlooks. Callers own the isolated draft and source event. */
export function prepareOpening(state:V4State,event:DomainEvent):string[]{
 const interruptions=receiveShipments(state,event);interruptions.push(...finishMachineOrders(state,event));finishTraining(state);finishTeamTraining(state);finishResearch(state,event);interruptions.push(...finishEngineering(state,event));return interruptions;
}
