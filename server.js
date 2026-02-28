const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Neon PostgreSQL connection
// Neon PostgreSQL connection
let pool;
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    // Dummy pool to prevent crashes but clearly indicate missing URL
    pool = {
        query: () => {
            throw new Error("DATABASE_URL is not set. Please add it to your .env file!");
        }
    };
}

// Initialize database table if it doesn't exist
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bus_locations (
                route_id VARCHAR(50) PRIMARY KEY,
                lat FLOAT NOT NULL,
                lng FLOAT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Database initialized successfully.");
    } catch (err) {
        console.error("Error initializing database:", err);
    }
};

if (process.env.DATABASE_URL) {
    initDb();
} else {
    console.warn("DATABASE_URL not found in environment variables. Please set it to connect to Neon.");
}

// Get location for a specific route
app.post('/api/getLocation', async (req, res) => {
    try {
        const { routeId } = req.body;
        if (!routeId) return res.status(400).json({ error: 'Route ID is required' });

        const result = await pool.query(
            'SELECT lat, lng, updated_at FROM bus_locations WHERE route_id = $1',
            [routeId]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.json({ lat: null, lng: null });
        }
    } catch (err) {
        console.error("Error fetching location:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all fleet locations
app.post('/api/getAllLocations', async (req, res) => {
    try {
        const result = await pool.query('SELECT route_id as id, lat, lng, updated_at FROM bus_locations');
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching all locations:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update driver location
app.post('/api/updateLocation', async (req, res) => {
    try {
        const { routeId, lat, lng } = req.body;
        if (!routeId || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await pool.query(
            `INSERT INTO bus_locations (route_id, lat, lng, updated_at) 
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
             ON CONFLICT (route_id) 
             DO UPDATE SET lat = EXCLUDED.lat, lng = EXCLUDED.lng, updated_at = CURRENT_TIMESTAMP`,
            [routeId, lat, lng]
        );

        res.json({ success: true, message: 'Location updated' });
    } catch (err) {
        console.error("Error updating location:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Clear driver location
app.post('/api/clearLocation', async (req, res) => {
    try {
        const { routeId } = req.body;
        if (!routeId) {
            return res.status(400).json({ error: 'Missing routeId field' });
        }

        if (routeId === 'ALL') {
            await pool.query('DELETE FROM bus_locations');
        } else {
            await pool.query('DELETE FROM bus_locations WHERE route_id = $1', [routeId]);
        }

        res.json({ success: true, message: 'Location cleared' });
    } catch (err) {
        console.error("Error clearing location:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Remember to set up your Neon PG Database and update .env`);
});
