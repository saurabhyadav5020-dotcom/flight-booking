document.addEventListener("DOMContentLoaded",()=>{
 const flight=FlightBook.read("selectedFlight"),passenger=FlightBook.read("passengerDetails"),summary=document.getElementById("payment-summary");
 if(!flight||!passenger){summary.innerHTML=`<h2>Booking details missing</h2><p>Start by selecting a flight and entering passenger details.</p><a class="primary-btn" style="display:inline-block;margin-top:14px" href="index.html">Start again →</a>`;document.querySelector("#payment-form button").disabled=true;return;}
 document.body.className=flight.theme||FlightBook.airlineTheme(flight.airline);
 summary.innerHTML=`<h2>Fare summary</h2><div class="summary-airline"><div class="airline-logo">✈</div><div><h3>${FlightBook.safe(flight.airline)}</h3><p>${FlightBook.safe(flight.flightNumber)}</p></div></div><div class="summary-line"></div><div class="summary-row"><span>Passenger</span><strong>${FlightBook.safe(passenger.firstName)} ${FlightBook.safe(passenger.lastName)}</strong></div><div class="summary-row"><span>Route</span><strong>${FlightBook.safe(flight.from)} → ${FlightBook.safe(flight.to)}</strong></div><div class="summary-row"><span>Travel date</span><strong>${FlightBook.safe(FlightBook.date(flight.date))}</strong></div><div class="summary-line"></div><div class="summary-row"><span>Provider-listed fare</span><strong>${FlightBook.safe(FlightBook.money(flight.price))}</strong></div><div class="summary-row"><span>Taxes / fees</span><strong>Included if shown by provider</strong></div><div class="summary-line"></div><div class="summary-row summary-total"><span>Total shown</span><strong>${FlightBook.safe(FlightBook.money(flight.price))}</strong></div><div class="notice">This is a frontend demonstration. No real payment will be charged and no ticket is issued by this page.</div>`;
 let method="upi";
 document.querySelectorAll("[data-method]").forEach(btn=>btn.addEventListener("click",()=>{
  method=btn.dataset.method;document.querySelectorAll("[data-method]").forEach(b=>b.classList.toggle("active",b===btn));
  document.getElementById("card-fields").hidden=method!=="card";
  document.getElementById("method-note").textContent=method==="card"?"Demo only: do not enter real card information. No payment gateway is connected.":method==="upi"?"Demo only: no UPI request will be sent. No payment gateway is connected.":"Continue to simulate the booking confirmation. No payment is taken.";
 }));
 document.getElementById("payment-form").addEventListener("submit",e=>{
  e.preventDefault();
  if(method==="card" && document.getElementById("card-number").value.trim() && !/^[0-9 ]{12,23}$/.test(document.getElementById("card-number").value.trim())){alert("Enter a test card number using digits only, or choose Demo checkout.");return;}
  const booking={reference:"FB-"+Math.random().toString(36).slice(2,8).toUpperCase(),createdAt:new Date().toISOString(),status:"DEMO ONLY - NOT TICKETED",method,flight,passenger};
  FlightBook.save("bookingConfirmation",booking);location.href="confirmation.html";
 });
});
