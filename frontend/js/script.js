const searchButton = document.querySelector(".search-box button");

if (searchButton) {
    searchButton.addEventListener("click", function () {
        const inputs = document.querySelectorAll(".input-group input");
        const select = document.querySelector(".input-group select");

        const from = inputs[0].value.trim();
        const to = inputs[1].value.trim();
        const date = inputs[2].value;
        const passengers = select.value;

        if (from === "" || to === "" || date === "") {
            alert("Please fill all flight search details.");
            return;
        }

        const searchData = {
            from: from,
            to: to,
            date: date,
            passengers: passengers
        };

        localStorage.setItem(
            "flightSearch",
            JSON.stringify(searchData)
        );

        window.location.href = "flights.html";
    });
}
