
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("search-form");
  if (!form) return;

  const dateInput = document.getElementById("date");
  const returnInput = document.getElementById("returnDate");
  const returnField = document.getElementById("return-field");

  const today = new Date();
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);

  dateInput.min = localDate;
  returnInput.min = localDate;

  if (!dateInput.value) {
    dateInput.value = localDate;
  }

  let tripType = "oneway";

  const selected = {
    from: null,
    to: null
  };

  // One-way and round-trip selection
  document.querySelectorAll("[data-trip]").forEach((btn) => {
    btn.addEventListener("click", () => {
      tripType = btn.dataset.trip;

      document.querySelectorAll("[data-trip]").forEach((button) => {
        button.classList.toggle("active", button === btn);
      });

      returnField.hidden = tripType !== "roundtrip";
      returnInput.required = tripType === "roundtrip";
    });
  });

  // Show validation error below an input
  function showFieldError(side, message) {
    const input = document.getElementById(side);
    const error = document.getElementById(`${side}-error`);

    if (!input || !error) return;

    error.textContent = message;
    error.hidden = false;

    input.setAttribute("aria-invalid", "true");
  }

  // Clear validation error
  function clearFieldError(side) {
    const input = document.getElementById(side);
    const error = document.getElementById(`${side}-error`);

    if (error) {
      error.textContent = "";
      error.hidden = true;
    }

    if (input) {
      input.removeAttribute("aria-invalid");
    }
  }

  // Close airport suggestions
  function closeOptions(input, box) {
    box.hidden = true;
    input.setAttribute("aria-expanded", "false");
  }

  // Display matching airport suggestions
  function showOptions(input, box, side) {
    const query = input.value.trim().toLowerCase();

    if (!query) {
      closeOptions(input, box);
      return;
    }

    const matches = FlightBook.airports
      .filter((airport) =>
        [
          airport.city,
          airport.name,
          airport.code,
          ...(airport.aliases || [])
        ].some((value) =>
          String(value).toLowerCase().includes(query)
        )
      )
      .slice(0, 7);

    if (!matches.length) {
      closeOptions(input, box);
      return;
    }

    box.innerHTML = matches
      .map(
        (airport) => `
          <button
            type="button"
            class="airport-option"
            role="option"
            data-code="${FlightBook.safe(airport.code)}"
            aria-selected="false"
          >
            <span class="airport-option-main">
              ${FlightBook.safe(airport.city)}
              <b>(${FlightBook.safe(airport.code)})</b>
            </span>

            <span class="airport-option-sub">
              ${FlightBook.safe(airport.name)}
            </span>
          </button>
        `
      )
      .join("");

    box.hidden = false;
    input.setAttribute("aria-expanded", "true");

    // Select an airport before the input loses focus
    box.querySelectorAll(".airport-option").forEach((button) => {
      button.addEventListener("mousedown", (event) => {
        event.preventDefault();

        const airport = FlightBook.airports.find(
          (item) => item.code === button.dataset.code
        );

        if (!airport) return;

        selected[side] = airport;

        input.value = `${airport.city} (${airport.code})`;
        input.dataset.airportCode = airport.code;

        input.setCustomValidity("");
        clearFieldError(side);

        closeOptions(input, box);
      });
    });
  }

  // Configure origin and destination autocomplete
  ["from", "to"].forEach((side) => {
    const input = document.getElementById(side);
    const box = document.getElementById(
      `${side}-airport-options`
    );

    if (!input || !box) return;

    input.addEventListener("input", () => {
      selected[side] = null;

      delete input.dataset.airportCode;
      input.setCustomValidity("");

      clearFieldError(side);
      showOptions(input, box, side);
    });

    input.addEventListener("focus", () => {
      showOptions(input, box, side);
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeOptions(input, box);
      }

      if (event.key === "ArrowDown" && !box.hidden) {
        event.preventDefault();
        box.querySelector(".airport-option")?.focus();
      }
    });

    input.addEventListener("blur", () => {
      setTimeout(() => {
        closeOptions(input, box);
      }, 150);
    });
  });

  // Close suggestions when clicking outside
  document.addEventListener("click", (event) => {
    ["from", "to"].forEach((side) => {
      const input = document.getElementById(side);
      const box = document.getElementById(
        `${side}-airport-options`
      );

      if (
        input &&
        box &&
        !input.contains(event.target) &&
        !box.contains(event.target)
      ) {
        closeOptions(input, box);
      }
    });
  });

  // Validate and submit flight search
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const fromInput = document.getElementById("from");
    const toInput = document.getElementById("to");

    const fromRaw = fromInput.value.trim();
    const toRaw = toInput.value.trim();

    const date = dateInput.value;
    const passengers = Number(
      document.getElementById("passengers").value
    );

    clearFieldError("from");
    clearFieldError("to");

    if (!fromRaw) {
      showFieldError(
        "from",
        "Please enter a departure city or airport."
      );
      fromInput.focus();
      return;
    }

    if (!toRaw) {
      showFieldError(
        "to",
        "Please enter a destination city or airport."
      );
      toInput.focus();
      return;
    }

    if (!date) {
      alert("Please choose a departure date.");
      dateInput.focus();
      return;
    }

    // Resolve supported city names even without a dropdown click
    const fromAirport =
      selected.from || FlightBook.findAirport(fromRaw);

    const toAirport =
      selected.to || FlightBook.findAirport(toRaw);

    if (!fromAirport) {
      showFieldError(
        "from",
        "Please select a valid departure airport from the suggestions."
      );

      fromInput.focus();

      showOptions(
        fromInput,
        document.getElementById("from-airport-options"),
        "from"
      );

      return;
    }

    if (!toAirport) {
      showFieldError(
        "to",
        "Please select a valid destination airport from the suggestions."
      );

      toInput.focus();

      showOptions(
        toInput,
        document.getElementById("to-airport-options"),
        "to"
      );

      return;
    }

    // Prevent identical departure and destination airports
    if (fromAirport.code === toAirport.code) {
      showFieldError(
        "to",
        "Departure and destination airports cannot be the same."
      );

      toInput.focus();
      return;
    }

    if (date < localDate) {
      alert("Please choose a valid departure date.");
      dateInput.focus();
      return;
    }

    if (
      tripType === "roundtrip" &&
      (!returnInput.value || returnInput.value < date)
    ) {
      alert(
        "Return date must be on or after the departure date."
      );

      returnInput.focus();
      return;
    }

    // Save search details for the results page
    FlightBook.save("flightSearch", {
      from: fromAirport.city,
      to: toAirport.city,

      fromCode: fromAirport.code,
      toCode: toAirport.code,

      fromAirport: fromAirport.name,
      toAirport: toAirport.name,

      date,
      returnDate:
        tripType === "roundtrip" ? returnInput.value : "",

      passengers,
      tripType
    });

    localStorage.removeItem("selectedFlight");

    window.location.href = "flights.html";
  });
});