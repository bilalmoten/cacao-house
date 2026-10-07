import { useState } from 'react';
import type { V4State, Employee } from '../../game/v4/model';
import { overtimeCost } from '../../game/v4/overtime';
import { money, type Dispatch } from './types';
export function OvertimeControl({ state, employee: e, dispatch }: {
    state: V4State;
    employee: Employee;
    dispatch: Dispatch;
}) {
    const [hours, setHours] = useState(1), booking = state.overtimeBookings?.find(b => b.employeeId === e.id && b.bookedWeek === state.week), maximum = Math.min(10, Math.floor(e.contractedMinutes * .25 / 30) * .5), factory = state.factories.find(f => f.id === e.factoryId && f.active && (f.readyWeek ?? 1) <= state.week), training = state.training.some(t => t.employeeId === e.id);
    if (e.role !== 'operator')
        return null;
    return <details><summary>Overtime for the next close</summary>{booking ? <p>Reserved {booking.minutes / 60} extra hours for W{booking.bookedWeek}; paid {money(booking.costCents)}. Base salary continues once. Actual extra work adds recoverable fatigue.</p> : <><label>{e.name.split(' ')[0]} overtime hours<input type="number" min={.5} max={maximum} step={.5} value={hours} onChange={ev => setHours(Number(ev.target.value))}/></label><p>Reserve up to {maximum} extra hours for W{state.week}, at 150% of base hourly pay. Cost {money(overtimeCost(e, Math.round(hours * 60)))} now; unused reservations expire without a refund.</p><p>Worked extra hours add fatigue and reduce effective hours and production skill. Reducing workload and adding staff restore performance. One busy week causes no permanent penalty. Three consecutive closes with worked overtime at fatigue 60 or higher cause a departure after two visible warnings. Rest or extra staffing resets that streak; a former colleague can be rehired.</p><button className="v4-button secondary" disabled={!factory || training || !Number.isFinite(hours) || hours < .5 || hours > maximum || hours * 2 % 1 !== 0} onClick={() => void dispatch({ type: 'book-overtime', employeeId: e.id, minutes: Math.round(hours * 60) })}>Book {e.name.split(' ')[0]} overtime for next close</button>{training && <p>Complete paid training before reserving overtime.</p>}</>}</details>;
}
