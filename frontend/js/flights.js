document.addEventListener("DOMContentLoaded", () => {
  const search = FlightBook.getSearch(), results = document.getElementById("flight-results"), count = document.getElementById("flight-count");
  const allStops = [...document.querySelectorAll(".stop-filter")]; let flights = [];
  const fromCode = search.fromCode || FlightBook.airportCode(search.from), toCode = search.toCode || FlightBook.airportCode(search.to);
  document.getElementById("search-details").textContent = `${search.from} (${fromCode}) → ${search.to} (${toCode}) · ${FlightBook.date(search.date)} · ${search.passengers} adult${Number(search.passengers) === 1 ? "" : "s"}`;
  const query = new URLSearchParams({ departureId: fromCode, arrivalId: toCode, outboundDate: search.date || new Date().toISOString().slice(0, 10), adults: String(search.passengers || 1) });
  if (search.returnDate) query.set("returnDate", search.returnDate);
  const esc = FlightBook.safe;
  function flightCard(f, i) {
    const items = FlightBook.legs(f), first = items[0] || {}, last = items[items.length - 1] || first, dep = first.departure_airport || {}, arr = last.arrival_airport || {};
    const airline = first.airline || "Airline not supplied", number = items.map(x => x.flight_number).filter(Boolean).join(" · ") || "Flight number not supplied";
    const stops = Math.max(0, items.length - 1), stopsText = stops === 0 ? "Non-stop" : `${stops} stop${stops === 1 ? "" : "s"}`;
    const extensions = [...(f.extensions || [])].slice(0, 4);
    const logo = first.airline_logo ? `<img src="${esc(first.airline_logo)}" alt="" style="width:30px;height:30px;object-fit:contain" loading="lazy" referrerpolicy="no-referrer">` : "✈";
    const aircraft = items.map(x => x.airplane).filter(Boolean).join(" · ");
    const layovers = (f.layovers || []).map(x => `${x.name || x.id || "Layover"}${x.duration ? ` (${FlightBook.duration(x.duration)})` : ""}`).join(" · ");
    const carbon = f.carbon_emissions?.this_flight ? `${Math.round(f.carbon_emissions.this_flight / 1000)} kg CO₂` : "";
    const price = Number(f.price) || 0;
    return `<article class="flight-card glass" style="animation-delay:${Math.min(i * 45, 350)}ms"><div class="flight-card-head"><div class="airline-info"><div class="airline-logo">${logo}</div><div><h3>${esc(airline)}</h3><p>${esc(number)}${aircraft ? ` · ${esc(aircraft)}` : ""}</p></div></div><span class="tag">${esc(stopsText)}</span></div><div class="flight-main"><div class="time-block"><strong>${esc(FlightBook.time(dep.time))}</strong><span>${esc(dep.id || fromCode)} · ${esc(dep.name || search.from)}</span></div><div class="duration-block">${esc(FlightBook.duration(f.total_duration))}<div class="route-line"></div><span>${esc(stopsText)}</span></div><div class="time-block"><strong>${esc(FlightBook.time(arr.time))}</strong><span>${esc(arr.id || toCode)} · ${esc(arr.name || search.to)}</span></div><div class="fare-block"><strong>${esc(FlightBook.money(price))}</strong><span>fare shown by provider</span><button class="primary-btn select-flight" data-index="${i}" type="button">Select flight →</button></div></div><div class="flight-meta">${extensions.map(x => `<span>◇ ${esc(x)}</span>`).join("")}${layovers ? `<span>↔ ${esc(layovers)}</span>` : ""}${carbon ? `<span>♧ ${esc(carbon)} estimated</span>` : ""}<span>⌁ ${items.length} flight leg${items.length === 1 ? "" : "s"}</span></div></article>`;
  }
  function render() {
    const max = Number(document.getElementById("price-filter").value);
    const activeStops = allStops.filter(x => x.checked).map(x => x.value);
    let shown = flights.filter(f => { const n = Math.max(0, FlightBook.legs(f).length - 1); return (n === 0 ? activeStops.includes("0") : n === 1 ? activeStops.includes("1") : activeStops.includes("2")) && (Number(f.price) || 0) <= max; });
    const sort = document.getElementById("sort-select").value;
    if (sort === "price") shown.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "duration") shown.sort((a, b) => (a.total_duration || 1e9) - (b.total_duration || 1e9));
    if (sort === "departure") shown.sort((a, b) => new Date(a.flights?.[0]?.departure_airport?.time || 0) - new Date(b.flights?.[0]?.departure_airport?.time || 0));
    count.textContent = `${shown.length} flight${shown.length === 1 ? "" : "s"} found`;
    document.getElementById("result-subtitle").textContent = flights.length ? `${flights.length} itineraries returned by live search · fares can change` : "";
    document.getElementById("max-price-label").textContent = FlightBook.money(max);
    results.innerHTML = shown.length ? shown.map((f, i) => flightCard(f, i)).join("") : `<div class="empty-box">No flights match these filters. Try changing the filters or search again.</div>`;
    results.querySelectorAll(".select-flight").forEach(btn => btn.addEventListener("click", () => {
      const f = shown[Number(btn.dataset.index)]; const selected = FlightBook.toSelected(f, search);
      FlightBook.save("selectedFlight", selected); location.href = "passenger.html";
    }));
  }
  async function load() {
    try {
      if (!search.date) throw new Error("No departure date was provided. Return to the home page and choose a date.");
      const response = await fetch(`https://flight-booking-hxs9.onrender.com/api/flights/search?${query.toString()}`);
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || `Flight search failed (${response.status}).`);
      if (data.search_metadata?.status === "Error") throw new Error(data.error || "The flight provider could not complete this search.");
      flights = [...(data.best_flights || []), ...(data.other_flights || [])];
      if (!flights.length) throw new Error("The API returned no flight options for these search details.");
      const prices = flights.map(f => Number(f.price) || 0).filter(n => n > 0), min = Math.max(1000, Math.floor(Math.min(...prices) / 500) * 500), max = Math.max(min + 500, Math.ceil(Math.max(...prices) / 500) * 500);
      const slider = document.getElementById("price-filter"); slider.min = min; slider.max = max; slider.value = max;
      render();
    } catch (err) { console.error(err); count.textContent = "Could not load flights"; document.getElementById("result-subtitle").textContent = "Check the backend terminal and try again."; results.innerHTML = `<div class="error-box"><strong>Flight search unavailable</strong><br>${FlightBook.safe(err.message)}<p style="margin-top:12px">Make sure the Spring Boot backend is running at <code>http://localhost:8080</code> and the API key is configured in that backend terminal.</p><a class="secondary-btn" style="display:inline-block;margin-top:10px" href="index.html">← Change search</a></div>`; }
  }
  document.getElementById("sort-select").addEventListener("change", render); allStops.forEach(x => x.addEventListener("change", render)); document.getElementById("price-filter").addEventListener("input", render); document.getElementById("reset-filters").addEventListener("click", () => { allStops.forEach(x => x.checked = true); document.getElementById("price-filter").value = document.getElementById("price-filter").max; render(); });
  load();
});
