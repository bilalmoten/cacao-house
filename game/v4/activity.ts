/** Trial evidence is measured in active seconds, independent of animation frequency. */
export interface TrialSettings {
    temperature: number;
    agitation: number;
    cooling: number;
}
export interface TrialSample extends TrialSettings {
    at: number;
}
export type TrialHandoff = 'tempering' | 'cooling' | 'packing';
export interface HandoffSignal {
    station: TrialHandoff;
    at: number;
}
const expected: TrialHandoff[] = ['tempering', 'cooling', 'packing'];
const targets = [.5, .55, .7];
function settingScores(settings: TrialSettings): [
    number,
    number,
    number
] { const values = [settings.temperature, settings.agitation, settings.cooling]; if (values.some(v => !Number.isFinite(v) || v < 0 || v > 1))
    throw Error('Process controls must be normalized from zero to one.'); return values.map((v, i) => Math.max(0, 1 - Math.abs(v - targets[i]) / Math.max(targets[i], 1 - targets[i]))) as [
    number,
    number,
    number
]; }
export function activeTrialSeconds(start: number, now: number, pauses: {
    start: number;
    end: number;
}[]): number { if (!Number.isFinite(start) || !Number.isFinite(now) || now < start)
    throw Error('Use a monotonic trial clock.'); let end = start, paused = 0; for (const pause of [...pauses].sort((a, b) => a.start - b.start)) {
    if (!Number.isFinite(pause.start) || !Number.isFinite(pause.end) || pause.end < pause.start)
        throw Error('Invalid pause interval.');
    const left = Math.max(start, end, pause.start), right = Math.min(now, pause.end);
    if (right > left)
        paused += right - left;
    end = Math.max(end, pause.end);
} return Math.max(0, (now - start - paused) / 1000); }
export function scoreAssistedTrial(settings: TrialSettings, handoffs: TrialHandoff[]) { const handoffScore = expected.reduce((n, id, i) => n + (handoffs[i] === id ? 1 : 0), 0) / expected.length; return { controls: settingScores(settings).map(v => v * (.75 + .25 * handoffScore)) as [
        number,
        number,
        number
    ], handoffScore, durationSeconds: 0 }; }
export function scoreTimedTrial(samples: TrialSample[], handoffs: HandoffSignal[], extendedWindows = false) { if (samples.length < 2 || samples[0].at !== 0 || samples.at(-1)!.at !== 60)
    throw Error('Complete a 60-second active commissioning run.'); const integrals = [0, 0, 0]; for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    if (!Number.isFinite(sample.at) || sample.at < 0 || sample.at > 60 || i > 0 && sample.at <= samples[i - 1].at)
        throw Error('Samples must follow the active monotonic clock.');
    const scores = settingScores(sample);
    if (i < samples.length - 1)
        for (let k = 0; k < 3; k++)
            integrals[k] += scores[k] * (samples[i + 1].at - sample.at);
} const windows = [20, 40, 55], tolerance = extendedWindows ? 12 : 6; const handoffScore = expected.reduce((n, station, i) => { const signal = handoffs[i]; return n + (signal?.station === station && Number.isFinite(signal.at) ? Math.max(0, 1 - Math.abs(signal.at - windows[i]) / tolerance) : 0); }, 0) / 3; return { controls: integrals.map(v => Math.round(v / 60 * (.75 + .25 * handoffScore) * 1e9) / 1e9) as [
        number,
        number,
        number
    ], handoffScore, durationSeconds: 60 }; }
