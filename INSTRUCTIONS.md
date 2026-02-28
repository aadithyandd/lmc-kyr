# LMCST Bus Tracker Setup Instructions

This project has been redesigned to match the elegant "Musmentor" aesthetics requested and moved from Google Sheets to a PostgreSQL backend powered by Neon.

## 1. Setup Neon Database

1. Go to [https://neon.com/](https://neon.com/) and create a free account.
2. Create a new Project (name it `college_bus` or similar).
3. Once the database is created, you will see a connection string on the dashboard.
4. Copy the "Connection String" (it looks like `postgresql://username:password@hostname/database?sslmode=require`).

## 2. Configure Environment

1. Open the `.env.example` file in your code editor.
2. Replace the placeholder `DATABASE_URL` with your actual Neon Connection String.
3. Rename the file from `.env.example` to `.env`.

## 3. Install Dependencies & Run

1. Open a terminal in the project folder (`college_bus`).
2. Run `npm install` (this was already done, but good to remember for the future).
3. Run `node server.js` to start your server.
4. The first time the server starts, it will automatically create the required `bus_locations` table in your Neon database!
5. The server will run on `http://localhost:3000`.

## 4. How to Use the App

- **Start Tracking (Driver):** Open `driver.html` in your browser. Enter password `1234`, select a route, and click "START BROADCAST". (Note: The browser will ask for location permissions).
- **View Location (Student):** Open `index.html`. Select the route the driver is broadcasting to see the live location on the map.
- **View Fleet (Admin):** Open `admin.html` to see all active buses on one single map.

**Note:** For the browser to allow geolocation (`navigator.geolocation`), you might need to run the UI through a local development server like Live Server instead of opening the raw files, or ensure your Node.js server serves the files (you can access the app directly via `http://localhost:3000/index.html` since the Node server is configured to serve static files).

### Updates Made:
- **Design:** Implemented the premium "Musmentor" design language (beige backgrounds, neo-brutal/elegant black borders, Outfit/Inter typography, responsive grid layout, customized Leaflet maps).
- **Functionality:** Replaced the slow Google Apps Script mechanism with a lightning-fast Express + Postgres (Neon) REST API.
- **Bug Fixes:** Fixed `no-cors` issues with geolocation fetching, added proper error handling, retry logic, and fallback UI states (e.g., waiting for driver ping).
