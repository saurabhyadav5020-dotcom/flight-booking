# FlightBook frontend redesign

## Start
1. Keep the existing Spring Boot backend running on `http://localhost:8080`.
2. Ensure `SERPAPI_KEY` is set in the backend terminal.
3. Open this frontend using VS Code/VSCodium Live Server (recommended), not by opening an HTML file directly.
4. Start at `index.html`, search a route/date, select a result and continue through the passenger and demo checkout pages.

## What is connected
- Live flight search calls `GET http://localhost:8080/api/flights/search`.
- Flight details are normalized and saved to browser `localStorage` as `selectedFlight`, fixing the old mismatch where passenger page used hardcoded values.
- Search results include airline, flight numbers, departure/arrival, duration, stops, price, aircraft when available, layovers/extensions and estimated emissions when supplied by the API.
- Booking and confirmation are browser-only demonstrations.

## Important limitations
- Search API data is live, but a Google Flights search result is not itself a bookable ticket.
- Payment is NOT connected. Do not enter real payment card details.
- Confirmation is a demo receipt, not a ticket, PNR or airline reservation.
- Airport autocomplete is a starter list. Use valid IATA codes or supported city names for other routes.
