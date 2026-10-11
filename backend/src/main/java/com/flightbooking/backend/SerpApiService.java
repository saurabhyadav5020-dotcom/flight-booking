package com.flightbooking.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class SerpApiService {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JsonNode searchFlights(
            String departureId,
            String arrivalId,
            String outboundDate,
            String returnDate,
            int adults) throws Exception {

        String apiKey = System.getenv("SERPAPI_KEY");

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("SERPAPI_KEY is not configured");
        }

        StringBuilder url = new StringBuilder(
                "https://serpapi.com/search.json"
                + "?engine=google_flights"
                + "&type=2"
                + "&departure_id=" + encode(departureId)
                + "&arrival_id=" + encode(arrivalId)
                + "&outbound_date=" + encode(outboundDate)
                + "&adults=" + adults
                + "&currency=INR"
                + "&api_key=" + encode(apiKey));

        if (returnDate != null && !returnDate.isBlank()) {
            url.append("&return_date=").append(encode(returnDate));
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url.toString()))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString());

        JsonNode result = objectMapper.readTree(response.body());
        System.out.println("RAW API RESPONSE: " + response.body());
        System.out.println("PARSED JSON: " + result.toPrettyString());
        
        if (response.statusCode() != 200) {
            String apiError = result.path("error").asText("No error details returned");

            throw new IllegalStateException("SerpApi HTTP " + response.statusCode() + ": " + apiError);
        }
        System.out.println(result.toPrettyString());
        return result;
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}