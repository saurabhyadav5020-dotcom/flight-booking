
package com.flightbooking.backend;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "*")
public class FlightController {

    private final SerpApiService serpApiService;

    public FlightController(SerpApiService serpApiService) {
        this.serpApiService = serpApiService;
    }

    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public String searchFlights(
            @RequestParam String departureId,
            @RequestParam String arrivalId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate outboundDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate returnDate,
            @RequestParam(defaultValue = "1") int adults
    ) throws Exception {

        if (adults < 1 || adults > 9) {
            throw new IllegalArgumentException(
                    "Adults must be between 1 and 9");
        }

        if (returnDate != null && returnDate.isBefore(outboundDate)) {
            throw new IllegalArgumentException(
                    "Return date cannot be before outbound date");
        }

    return serpApiService.searchFlights(
        departureId,
        arrivalId,
        outboundDate.toString(),
        returnDate == null ? null : returnDate.toString(),
        adults
    ).toPrettyString();
    }
}
