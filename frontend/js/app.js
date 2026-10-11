const FlightBook = (() => {
  // Airport names, city aliases and IATA codes used by the live flight search.
  // When several airports serve one city, the default airport is listed first.
  const AIRPORTS = [
    {city:"Delhi", name:"Indira Gandhi International Airport", code:"DEL", aliases:["new delhi","del"]},
    {city:"Mumbai", name:"Chhatrapati Shivaji Maharaj International Airport", code:"BOM", aliases:["bombay","bom"]},
    {city:"Bengaluru", name:"Kempegowda International Airport", code:"BLR", aliases:["bangalore","blr"]},
    {city:"Hyderabad", name:"Rajiv Gandhi International Airport", code:"HYD", aliases:["hyd"]},
    {city:"Chennai", name:"Chennai International Airport", code:"MAA", aliases:["madras","maa"]},
    {city:"Kolkata", name:"Netaji Subhas Chandra Bose International Airport", code:"CCU", aliases:["calcutta","ccu"]},
    {city:"Pune", name:"Pune Airport", code:"PNQ", aliases:["pnq"]},
    {city:"Goa", name:"Manohar International Airport", code:"GOX", aliases:["mopa","goi","dabolim","goa international airport"]},
    {city:"Varanasi", name:"Lal Bahadur Shastri International Airport", code:"VNS", aliases:["banaras","benares","vns"]},
    {city:"Ahmedabad", name:"Sardar Vallabhbhai Patel International Airport", code:"AMD", aliases:["amd"]},
    {city:"Jaipur", name:"Jaipur International Airport", code:"JAI", aliases:["jai"]},
    {city:"Lucknow", name:"Chaudhary Charan Singh International Airport", code:"LKO", aliases:["lko"]},
    {city:"Kochi", name:"Cochin International Airport", code:"COK", aliases:["cochin","cok"]},
    {city:"Thiruvananthapuram", name:"Trivandrum International Airport", code:"TRV", aliases:["trivandrum","trv"]},
    {city:"Amritsar", name:"Sri Guru Ram Dass Jee International Airport", code:"ATQ", aliases:["atq"]},
    {city:"Bhubaneswar", name:"Biju Patnaik International Airport", code:"BBI", aliases:["bbi"]},
    {city:"Patna", name:"Jay Prakash Narayan Airport", code:"PAT", aliases:["pat"]},
    {city:"Indore", name:"Devi Ahilya Bai Holkar Airport", code:"IDR", aliases:["idr"]},
    {city:"Nagpur", name:"Dr. Babasaheb Ambedkar International Airport", code:"NAG", aliases:["nag"]},
    {city:"Guwahati", name:"Lokpriya Gopinath Bordoloi International Airport", code:"GAU", aliases:["gau"]},
    {city:"Srinagar", name:"Sheikh ul Alam International Airport", code:"SXR", aliases:["sxr"]},
    {city:"Chandigarh", name:"Shaheed Bhagat Singh International Airport", code:"IXC", aliases:["ixc"]},
    {city:"Dehradun", name:"Jolly Grant Airport", code:"DED", aliases:["ded"]},
    {city:"Dubai", name:"Dubai International Airport", code:"DXB", aliases:["dxb"]},
    {city:"Abu Dhabi", name:"Zayed International Airport", code:"AUH", aliases:["auh"]},
    {city:"Singapore", name:"Singapore Changi Airport", code:"SIN", aliases:["sin"]},
    {city:"London", name:"Heathrow Airport", code:"LHR", aliases:["heathrow","lhr"]},
    {city:"New York", name:"John F. Kennedy International Airport", code:"JFK", aliases:["new york city","kennedy","jfk"]},
    {city:"Bangkok", name:"Suvarnabhumi Airport", code:"BKK", aliases:["bkk"]},
    {city:"Doha", name:"Hamad International Airport", code:"DOH", aliases:["doh"]},
    {city:"Paris", name:"Charles de Gaulle Airport", code:"CDG", aliases:["cdg"]},
    {city:"Istanbul", name:"Istanbul Airport", code:"IST", aliases:["ist"]},
    {city:"Frankfurt", name:"Frankfurt Airport", code:"FRA", aliases:["fra"]},
    {city:"Toronto", name:"Toronto Pearson International Airport", code:"YYZ", aliases:["yyz"]},
    {city:"Sydney", name:"Sydney Kingsford Smith Airport", code:"SYD", aliases:["syd"]}
  ];
  const safe = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const normalize = v => String(v || "").trim().toLowerCase().replace(/[.,]/g,"").replace(/\s+/g," ");
  const findAirport = value => {
    const q=normalize(value);
    if(!q) return null;
    return AIRPORTS.find(a => normalize(a.city)===q || normalize(a.name)===q || normalize(a.code)===q || a.aliases.some(x=>normalize(x)===q))
      || AIRPORTS.find(a => normalize(`${a.city} ${a.name} ${a.code}`).includes(q) && q.length>=3)
      || null;
  };
  const airportCode = v => {
    const q=String(v||"").trim();
    const codeMatch=q.match(/\(([A-Z]{3})\)\s*$/i);
    if(codeMatch) return codeMatch[1].toUpperCase();
    const airport=findAirport(q);
    return airport ? airport.code : (/^[a-z]{3}$/i.test(q) ? q.toUpperCase() : q.toUpperCase());
  };
  const airportLabel = a => `${a.city} · ${a.name} (${a.code})`;
  const money = (n) => Number(n || 0).toLocaleString("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});
  const time = (s) => { if(!s)return "—"; const d=new Date(String(s).replace(" ","T")); return Number.isNaN(d.getTime())?String(s):d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}); };
  const date = (s) => { if(!s)return "Date not supplied"; const d=new Date(`${s}T12:00:00`); return Number.isNaN(d.getTime())?s:d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); };
  const duration = (mins) => { const n=Number(mins); return Number.isFinite(n)?`${Math.floor(n/60)}h ${n%60}m`:"—"; };
  const read = (key, fallback=null) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => localStorage.setItem(key,JSON.stringify(value));
  const getSearch = () => read("flightSearch",{from:"Delhi",to:"Mumbai",date:"",passengers:1});
  const legs = (f) => Array.isArray(f?.flights)?f.flights:[];
  const airlineTheme = (name) => {
    const s=String(name||"").toLowerCase();
    if(s.includes("indigo")||s.includes("vistara"))return "theme-indigo";
    if(s.includes("akasa")||s.includes("spicejet"))return "theme-orange";
    if(s.includes("air india"))return "theme-red";
    if(s.includes("green")||s.includes("ethiopian"))return "theme-green";
    return "theme-blue";
  };
  const toSelected = (flight, search) => {
    const items=legs(flight), first=items[0]||{}, last=items[items.length-1]||first;
    const dep=first.departure_airport||{}, arr=last.arrival_airport||{};
    return {
      airline:first.airline||"Airline not supplied",
      flightNumber:items.map(x=>x.flight_number).filter(Boolean).join(", ")||"Flight number not supplied",
      aircraft:items.map(x=>x.airplane).filter(Boolean).join(", "),
      departure:time(dep.time), arrival:time(arr.time),
      departureAirport:dep.name||search.from, arrivalAirport:arr.name||search.to,
      departureCode:dep.id||search.fromCode||airportCode(search.from), arrivalCode:arr.id||search.toCode||airportCode(search.to),
      duration:duration(flight.total_duration), durationMinutes:Number(flight.total_duration)||0,
      stops:Math.max(0,items.length-1), price:Number(flight.price)||0, priceFormatted:money(flight.price),
      from:search.from,to:search.to,date:search.date||"",returnDate:search.returnDate||"",
      passengers:Number(search.passengers)||1, airlineLogo:first.airline_logo||"",
      extensions:Array.isArray(flight.extensions)?flight.extensions:[],
      layovers:Array.isArray(flight.layovers)?flight.layovers:[],
      carbonEmissions:flight.carbon_emissions||null, bookingToken:flight.booking_token||null,
      theme:airlineTheme(first.airline)
    };
  };
  return {safe,airportCode,findAirport,airportLabel,airports:AIRPORTS,money,time,date,duration,read,save,getSearch,toSelected,airlineTheme,legs};
})();
