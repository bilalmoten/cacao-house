import { catalog } from './catalog.ts';
import { regionForCity } from './content/regions.ts';
import { protectedCash } from './sourcing.ts';
import { post, debit, credit } from './finance.ts';
import type { V4State, DomainEvent } from './model.ts';
export function travelQuote(s: V4State, cityId: string) { const city = catalog.cities.find(c => c.id === cityId && c.stage <= s.campaign.stage); if (!city || cityId === s.currentCityId || s.trip)
    throw Error('Choose an unlocked destination after the current journey.'); const nearby = regionForCity(cityId) === regionForCity(s.currentCityId), local = [cityId, s.currentCityId].every(id => ['sf', 'oakland'].includes(id)); return { cityId: city.id, name: city.name, costCents: local ? 3500 : nearby ? 18000 : 35000, elapsedWeeks: local ? 0 : 1, lead: city.contact, interior: city.interior }; }
export function beginTravel(s: V4State, cityId: string, event: DomainEvent) { const quote = travelQuote(s, cityId); if (quote.costCents + protectedCash(s) > s.cashCents)
    throw Error('Travel would consume protected operating obligations.'); post(s, event, 'Disclosed business travel', [debit('shipping', quote.costCents, cityId), credit('cash', quote.costCents)], '', { regionId: regionForCity(cityId) }); if (!quote.elapsedWeeks) {
    s.currentCityId = cityId;
    if (!s.visitedCities.includes(cityId))
        s.visitedCities.push(cityId);
}
else
    s.trip = { cityId, departureWeek: s.week, arrivalWeek: s.week + quote.elapsedWeeks, sourceEventId: event.id }; event.entityIds = [cityId]; event.details = { costCents: quote.costCents, elapsedWeeks: quote.elapsedWeeks }; }
export function finishTravel(s: V4State, event: DomainEvent) { if (s.trip && s.trip.arrivalWeek <= s.week + 1) {
    s.currentCityId = s.trip.cityId;
    if (!s.visitedCities.includes(s.trip.cityId))
        s.visitedCities.push(s.trip.cityId);
    event.details.arrivedCityId = s.trip.cityId;
    delete s.trip;
} }
