import type {V4State} from './model.ts';

/** Private forecast drafts share closed, read-only evidence, but clone every
 * mutable operating object and every array that the simulated close appends.
 * Never use this for an action/committed tick returned to a caller or storage.
 * Complete validation still runs against the original evidence in each sample.
 */
export function simulationCopy(state:V4State):V4State {
 const {events,ledger,snapshots,salesHistory,consumerHistory,franchiseHistory,...operating}=state;
 const draft=structuredClone(operating);
 return {...draft,events:[...events],ledger:[...ledger],snapshots:[...snapshots],salesHistory:[...salesHistory],...(consumerHistory?{consumerHistory:[...consumerHistory]}:{}),...(franchiseHistory?{franchiseHistory:[...franchiseHistory]}:{})};
}
