import { processEquipmentSignature } from './equipment.ts';
import type { V4State, ProcessProfile } from './model.ts';
import { catalog } from './catalog.ts';
export function standardCycleMinutes(recipeId: string): number {
    const recipe = catalog.recipes.find(r => r.id === recipeId);
    if (!recipe)
        throw Error('Unknown recipe process.');
    return recipe.operations.reduce((n, o) => n + o.minutesPerCase, 0);
}
export function commissioningProfile(state: V4State, factoryId: string, recipeRevisionId: string, mode: 'timed' | 'assisted', controls: [
    number,
    number,
    number
]): ProcessProfile {
    const factory = state.factories.find(f => f.id === factoryId), revision = state.recipeRevisions.find(r => r.id === recipeRevisionId);
    if (!factory || Math.max(factory.readyWeek??1,factory.reactivationReadyWeek??1)>state.week || !revision || !['timed', 'assisted'].includes(mode) || !Array.isArray(controls) || controls.length !== 3 || controls.some(n => !Number.isFinite(n) || n < 0 || n > 1))
        throw Error('A valid line, formula and normalized process trial are required.');
    return profileForControls(factoryId, recipeRevisionId, revision.recipeId, processEquipmentSignature(factory, revision.recipeId), mode, controls);
}
export function profileForControls(factoryId: string, recipeRevisionId: string, recipeId: string, equipmentSignature: string, mode: 'timed' | 'assisted', controls: [
    number,
    number,
    number
]): ProcessProfile {
    if (!Array.isArray(controls) || controls.length !== 3 || controls.some(n => !Number.isFinite(n) || n < 0 || n > 1))
        throw Error('Invalid normalized trial controls.');
    const score = controls.reduce((n, x) => n + x, 0) / 3;
    return { id: `${factoryId}/${recipeRevisionId}/${equipmentSignature}`, factoryId, recipeRevisionId, equipmentSignature: equipmentSignature, methodVersion: 1, cycleMinutes: Math.ceil(standardCycleMinutes(recipeId) * (1.15 - .35 * score)), expectedYield: .9 + .08 * score, consistency: 60 + 35 * score, requiredCompetency: 40 + 40 * score, provenance: mode };
}
