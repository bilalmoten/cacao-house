import { historicalProcessSignature } from './equipment.ts';
import { regionForCity } from './content/regions.ts';
import type { V4State, ProcessProfile } from './model.ts';
import { profileForControls } from './process.ts';
import { scoreAssistedTrial, scoreTimedTrial } from './activity.ts';
/** Paid source events, rather than editable result numbers, authorize installed methods. */
export function processEvidenceErrors(state: V4State): string[] {
    const errors: string[] = [], best = new Map<string, ProcessProfile>(), byEvent = new Map<string, V4State['ledger']>();
    for (const entry of state.ledger) {
        const entries = byEvent.get(entry.eventId) ?? [];
        entries.push(entry);
        byEvent.set(entry.eventId, entries);
    }
    const retain = (profile: ProcessProfile) => {
        const old = best.get(profile.id);
        if (!old || profile.expectedYield >= old.expectedYield && profile.cycleMinutes <= old.cycleMinutes)
            best.set(profile.id, profile);
    };
    for (const event of state.events) {
        if (event.type === 'commission' || event.type === 'process-trial') {
            try {
                const command = JSON.parse(event.signature);
                if (event.origin !== 'action' || command.id !== event.id || command.type !== event.type || command.practice)
                    throw Error('Invalid paid source');
                const entries = byEvent.get(event.id) ?? [], fee = entries[0]?.postings.find(p => p.account === 'commissioning');
                if (entries.length !== 1 || entries[0].postings.length !== 2 || entries[0].scope?.factoryId !== command.factoryId || entries[0].scope?.regionId !== regionForCity(state.factories.find(f => f.id === command.factoryId)?.cityId ?? '') || Object.keys(entries[0].scope ?? {}).length !== 2 || fee?.debitCents !== 8000 || fee.creditCents !== 0 || !entries[0].postings.some(p => p.account === 'cash' && p.debitCents === 0 && p.creditCents === 8000))
                    throw Error('Invalid trial fee');
                const prefix = `${command.factoryId}/${command.recipeRevisionId}/`;
                if (!fee.entityId?.startsWith(prefix))
                    throw Error('Invalid trial process identity');
                const equipmentSignature = fee.entityId.slice(prefix.length);
                if (!equipmentSignature)
                    throw Error('Missing trial equipment identity');
                let controls = command.controls;
                if (command.type === 'process-trial')
                    controls = command.mode === 'timed' ? scoreTimedTrial(command.samples, command.handoffs, command.extendedWindows === true).controls : scoreAssistedTrial(command.settings, command.handoffs).controls;
                const revision = state.recipeRevisions.find(r => r.id === command.recipeRevisionId);
                if (!revision)
                    throw Error('Missing formula');
                const authorized = historicalProcessSignature(state, command.factoryId, revision.recipeId, event.id);
                if (command.factoryId === 'sf-workshop' && !authorized || authorized && authorized !== equipmentSignature)
                    throw Error('Trial calibration differs from purchased equipment');
                const profile = profileForControls(command.factoryId, command.recipeRevisionId, revision.recipeId, equipmentSignature, command.mode, controls);
                if (profile.id !== fee.entityId || !event.entityIds.includes(profile.factoryId) || !event.entityIds.includes(profile.recipeRevisionId))
                    throw Error('Trial identity differs from its paid source');
                retain(profile);
            }
            catch {
                errors.push('Paid process trial lacks its exact source evidence.');
            }
        }
        for (const job of state.engineeringJobs.filter(j => j.status === 'completed' && j.completionEventId === event.id))
            retain(job.profile);
    }
    for (const profile of state.processProfiles) {
        const expected = best.get(profile.id);
        if (!expected || Object.keys(expected).some(key => expected[key as keyof ProcessProfile] !== profile[key as keyof ProcessProfile]))
            errors.push('Installed process differs from the best paid factory recipe trial.');
    }
    return [...new Set(errors)];
}
