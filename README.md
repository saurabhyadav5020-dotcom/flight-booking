# ✈️ FlightBook

A flight booking platform built with a static frontend and a Spring Boot backend. FlightBook lets users search for flights through a web interface and view flight search results powered by SerpApi.

## 🌐 Live Demo

- **Frontend:** https://saurabhyadav5020-dotcom.github.io/flight-booking/
- **Flight Search:** https://saurabhyadav5020-dotcom.github.io/flight-booking/frontend/index.html
- **Backend API Base URL:** https://flight-booking-hxs9.onrender.com

> Note: The frontend and backend are deployed separately. Flight search requires the backend service and a valid SerpApi API key to be configured.

## ✨ Features

- Flight search interface
- Search results fetched from the backend API
- Flight selection and passenger information flow
- Responsive web interface
- REST API built with Spring Boot
- External flight search integration using SerpApi
- Separate frontend and backend deployments

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Java 21
- Spring Boot
- Maven
- REST API

### External Service
- SerpApi for flight search data

### Deployment
- GitHub Pages for the frontend
- Render for the backend
- Docker for backend deployment

## 📁 Project Structure

```text
flight-booking/
├── index.html
├── frontend/
│   ├── css/
│   ├── js/
│   │   └── flights.js
│   ├── flights.html
│   └── ...
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   ├── pom.xml
│   └── Dockerfile
├── README.md
├── README-FRONTEND.md
└── .gitignore
```

## ⚙️ Prerequisites

Install the following before running the project locally:

- Java 21
- Maven
- Git
- A SerpApi API key

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/saurabhyadav5020-dotcom/flight-booking.git
cd flight-booking
```

### 2. Configure the API key

Set your SerpApi key as an environment variable in the terminal where you will start the backend.

**Linux (Bash/Zsh):**

```bash
export SERPAPI_KEY="your_serpapi_api_key"
```

**Fish shell:**

```fish
set -x SERPAPI_KEY "your_serpapi_api_key"
```

Replace the example value with your actual key. Never commit API keys to GitHub.

### 3. Start the backend

```bash
cd backend
mvn spring-boot:run
```

The backend should start at:

```text
http://localhost:8080
```

### 4. Open the frontend

Open the root `index.html` or the relevant frontend HTML page in a browser, or serve the frontend using a local static HTTP server.

For local development, ensure the frontend's API base URL points to `http://localhost:8080`. For the deployed website, use the Render backend URL.

## 🔌 Flight Search API

The frontend sends flight search requests to:

```text
GET /api/flights/search
```

The deployed endpoint is:

```text
https://flight-booking-hxs9.onrender.com/api/flights/search
```

The search query parameters depend on the frontend search form and backend implementation.

## ☁️ Deployment

### Frontend: GitHub Pages

The frontend is hosted using GitHub Pages. Push frontend changes to the configured deployment branch and wait for the Pages deployment to finish.

### Backend: Render

The backend is deployed on Render using Docker.

- Root directory: `backend`
- Dockerfile: `backend/Dockerfile`
- Runtime port: Provided by Render
- Environment variable: `SERPAPI_KEY`

Configure `SERPAPI_KEY` in the Render service's Environment settings. Do not put the secret in frontend JavaScript or commit it to the repository.

The Render free service may sleep after inactivity, so the first request after a period of inactivity can take longer.

## 🔒 Security Notes

- Keep API keys private.
- Store backend secrets in environment variables.
- Never expose the SerpApi key in frontend code.
- Do not commit `.env` files containing secrets.

## 🧪 Troubleshooting

**Flight search returns a network error**
- Confirm the Render backend is live.
- Check that the frontend uses the correct backend URL.
- Inspect the browser's Developer Tools Console and Network tabs.
- Check backend logs on Render.

**Flight search returns an API error**
- Verify that `SERPAPI_KEY` is configured correctly in Render.
- Check the backend logs and API provider response.
- Confirm the requested search parameters are valid.

**The backend is slow on the first request**
- The Render free service may have been sleeping and need time to start.

## 📌 Project Status

FlightBook is an ongoing learning and development project. Features and integrations may change as development progresses.

## 👨‍💻 Author

**Saurabh Yadav**

GitHub: https://github.com/saurabhyadav5020-dotcom
