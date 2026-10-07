import type { V4State, DomainEvent, Loan } from './model.ts';
import { protectedCash } from './sourcing.ts';
import { accountBalance, installment, post, debit, credit } from './finance.ts';
export type RecoveryOption = 'bridge' | 'restructure';
export function recoveryQuote(state: V4State, option: RecoveryOption) {
    const reject = (error: string) => ({ ok: false as const, error });
    if (!['bridge', 'restructure'].includes(option))
        return reject('Choose an offered recovery facility.');
    if (state.events.some(e => e.type === 'finance-recovery' && (e.details.option === option || e.details.option === 'restructure')))
        return reject('This one-time recovery facility has already been used.');
    if (!['playing', 'recovery'].includes(state.campaign.status) || !state.factories.length)
        return reject('An operating house is required.');
    if (option === 'restructure' && state.campaign.status !== 'recovery')
        return reject('Restructuring requires actual unpaid obligations.');
    if (option === 'bridge' && state.campaign.status !== 'recovery' && state.cashCents > protectedCash(state) * 2)
        return reject('Bridge credit is reserved for an imminent cash shortfall.');
    const oldPrincipalCents = state.loans.reduce((n, l) => n + l.principalCents, 0), accruedCents = -accountBalance(state, 'arrears'), workingCapitalCents = option === 'bridge' ? 100000 : 150000, feeCents = option === 'bridge' ? 5000 : 7500, termWeeks = option === 'bridge' ? 26 : 104, weeklyRateBps = option === 'bridge' ? 90 : 75, principalCents = workingCapitalCents + (option === 'restructure' ? oldPrincipalCents + accruedCents : 0);
    if (principalCents > 5000000)
        return reject('This founding-house facility cannot refinance this scale of debt.');
    const installmentCents = installment(principalCents, weeklyRateBps, termWeeks);
    return { ok: true as const, quote: { id: ['recovery', option, state.week, state.cashCents, state.ledger.length, principalCents, accruedCents].join(':'), option, oldPrincipalCents, accruedCents, workingCapitalCents, feeCents, termWeeks, weeklyRateBps, principalCents, installmentCents, totalScheduledCents: installmentCents * termWeeks, firstDueWeek: state.week } };
}
export function financeRecovery(state: V4State, option: RecoveryOption, quoteId: string, event: DomainEvent) {
    const offered = recoveryQuote(state, option);
    if (!offered.ok)
        throw Error(offered.error);
    const q = offered.quote;
    if (q.id !== quoteId)
        throw Error('Debt or cash changed. Review the updated recovery terms.');
    const id = 'recovery:' + event.id, loan: Loan = { id, principalCents: q.principalCents, weeklyRateBps: q.weeklyRateBps, installmentCents: q.installmentCents, remainingWeeks: q.termWeeks, nextDueWeek: state.week, arrearsCents: 0, arrearsPrincipalCents: 0, arrearsInterestCents: 0, feesCents: 0, arrearsSinceWeek: null, status: 'active', bridge: option === 'bridge' };
    post(state, event, option === 'bridge' ? 'Costly one-time working-capital bridge' : 'Negotiated creditor refinancing proceeds', [debit('cash', q.principalCents), credit('loan-principal', q.principalCents, id)], 'proceeds');
    if (option === 'restructure') {
        for (const old of state.loans) {
            if (old.principalCents)
                post(state, event, 'Earlier lender principal repaid by refinancing', [debit('loan-principal', old.principalCents, old.id), credit('cash', old.principalCents)], 'settle:' + old.id);
            Object.assign(old, { principalCents: 0, remainingWeeks: 0, arrearsCents: 0, arrearsPrincipalCents: 0, arrearsInterestCents: 0, feesCents: 0, arrearsSinceWeek: null, status: 'settled' });
        }
        if (q.accruedCents)
            post(state, event, 'Overdue staff, premises, interest and fees settled', [debit('arrears', q.accruedCents), credit('cash', q.accruedCents)], 'creditors');
        state.unpaidObligations = [];
        state.campaign.status = 'playing';
    }
    post(state, event, 'Disclosed recovery facility fee', [debit('fees', q.feeCents, id), credit('cash', q.feeCents)], 'fee');
    state.loans.push(loan);
    event.entityIds = [id];
    event.details = { option, loanId: id, principalCents: q.principalCents, workingCapitalCents: q.workingCapitalCents, feeCents: q.feeCents, weeklyRateBps: q.weeklyRateBps, termWeeks: q.termWeeks, installmentCents: q.installmentCents, oldPrincipalCents: q.oldPrincipalCents, accruedCents: q.accruedCents };
}
export function recoveryEvidenceErrors(state: V4State) {
    const errors: string[] = [];
    for (const event of state.events.filter(e => e.type === 'finance-recovery')) {
        const option = event.details.option, terms = option === 'bridge' ? { fee: 5000, capital: 100000, rate: 90, term: 26 } : option === 'restructure' ? { fee: 7500, capital: 150000, rate: 75, term: 104 } : null;
        let command;
        try {
            command = JSON.parse(event.signature);
        }
        catch {
            errors.push('Invalid recovery contract source');
            continue;
        }
        const loan = state.loans.find(l => l.id === event.details.loanId), principal = Number(event.details.principalCents), entries = state.ledger.filter(e => e.eventId === event.id);
        const start = state.ledger.findIndex(e => e.eventId === event.id), prior = state.ledger.slice(0, start), oldPrincipal = -accountBalance(state, 'loan-principal', prior), accrued = -accountBalance(state, 'arrears', prior), closed = state.snapshots.filter(s => s.week >= event.week).length;
        if (terms && loan) {
            const expected = [{ id: event.id + ':proceeds', postings: [debit('cash', principal), credit('loan-principal', principal, loan.id)] }, { id: event.id + ':fee', postings: [debit('fees', terms.fee, loan.id), credit('cash', terms.fee)] }];
            if (option === 'restructure') {
                const older = new Map<string, number>();
                for (const entry of prior)
                    for (const p of entry.postings)
                        if (p.account === 'loan-principal') {
                            const owner = p.entityId ?? 'starter';
                            older.set(owner, (older.get(owner) ?? 0) + p.creditCents - p.debitCents);
                        }
                ;
                for (const [id, amount] of older)
                    if (amount > 0)
                        expected.push({ id: event.id + ':settle:' + id, postings: [debit('loan-principal', amount, id), credit('cash', amount)] });
                if (accrued)
                    expected.push({ id: event.id + ':creditors', postings: [debit('arrears', accrued), credit('cash', accrued)] });
            }
            if (entries.length !== expected.length || expected.some(e => { const actual = entries.find(a => a.id === e.id); return !actual || actual.week !== event.week || actual.scope !== undefined || actual.kind !== undefined || JSON.stringify(actual.postings) !== JSON.stringify(e.postings); }))
                errors.push('Recovery contract requires its exact cash-paid journal');
        }
        if (loan && (loan.nextDueWeek > state.week || loan.remainingWeeks !== (loan.status === 'settled' ? 0 : Math.max(0, (terms?.term ?? 0) - closed)) || loan.principalCents !== -accountBalance(state, 'loan-principal', state.ledger.filter(e => e.postings.some(p => p.entityId === loan.id)))))
            errors.push('Recovery repayment schedule differs from its source history');
        if (!terms || event.details.oldPrincipalCents !== oldPrincipal || event.details.accruedCents !== accrued || principal !== terms.capital + (option === 'restructure' ? oldPrincipal + accrued : 0) || command.quoteId !== ['recovery', option, event.week, accountBalance(state, 'cash', prior), start, principal, accrued].join(':') || state.events.filter(e => e.type === 'finance-recovery' && e.details.option === option).length !== 1 || command.id !== event.id || command.type !== event.type || command.option !== option || typeof command.quoteId !== 'string' || !loan || !Number.isSafeInteger(principal) || principal < terms.capital || event.details.workingCapitalCents !== terms.capital || event.details.feeCents !== terms.fee || event.details.weeklyRateBps !== terms.rate || event.details.termWeeks !== terms.term || event.details.installmentCents !== installment(principal, terms.rate, terms.term) || loan.weeklyRateBps !== terms.rate || loan.installmentCents !== event.details.installmentCents || loan.bridge !== (option === 'bridge') || accountBalance(state, 'fees', entries) !== terms.fee || !entries.some(e => e.id === event.id + ':proceeds' && e.postings.some(p => p.account === 'loan-principal' && p.entityId === loan.id && p.creditCents === principal)))
            errors.push('Recovery borrowing differs from its paid contract');
    }
    return errors;
}
