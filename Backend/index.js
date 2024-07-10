// const express = require('express');
// const app = express();
// const port = 5000;
// const db = require('./db'); // Make sure db.js handles Redis connection

// app.use(express.json());

// app.get('/api/licensing', async (req, res) => {
//     const year = parseInt(req.query.year) || 2018;
//     const topRows = Math.min(parseInt(req.query.topRows) || 10, 50);
//     const page = parseInt(req.query.page) || 1;
//     const offset = (page - 1) * topRows;

//     const cacheKey = `licensing:${year}:${topRows}:${offset}`;

//     try {
//         const cachedData = await db.redisClient.get(cacheKey);
//         if (cachedData) {
//             console.log('Data retrieved from Redis cache');
//             return res.json(JSON.parse(cachedData));
//         }

//         console.log(`Received request for licensing data for year ${year}, page ${page}, and top ${topRows} rows`);
//         const data = await db.getLicensingData(year, topRows, offset);

//         await db.redisClient.set(cacheKey, JSON.stringify(data), 'EX', 3600);

//         console.log('Data fetched from database:', data);
//         res.json(data);
//     } catch (err) {
//         console.error('Error fetching data:', err);
//         res.status(500).send(err.message);
//     }
// });

// app.get('/api/nct', async (req, res) => {
//     const year = parseInt(req.query.year) || 2018;
//     const topRows = Math.min(parseInt(req.query.topRows) || 10, 50);
//     const page = parseInt(req.query.page) || 1;
//     const offset = (page - 1) * topRows;

//     const cacheKey = `nct:${year}:${topRows}:${offset}`;

//     try {
//         const cachedData = await db.redisClient.get(cacheKey);
//         if (cachedData) {
//             console.log('Data retrieved from Redis cache');
//             return res.json(JSON.parse(cachedData));
//         }

//         console.log(`Received request for NCT data for year ${year}, page ${page}, and top ${topRows} rows`);
//         const data = await db.getNCTData(year, topRows, offset);

//         await db.redisClient.set(cacheKey, JSON.stringify(data), 'EX', 3600);

//         console.log('Data fetched from database:', data);
//         res.json(data);
//     } catch (err) {
//         console.error('Error fetching data:', err);
//         res.status(500).send(err.message);
//     }
// });

// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });










const express = require('express');
const cors = require('cors'); // Add this line
const app = express();
const port = 5000;
const db = require('./db'); // Ensure db.js handles Redis connection

app.use(cors()); // Enable CORS
app.use(express.json());

const getPaginatedData = async (req, res, cacheKeyPrefix, dataFetchFunction) => {
    const year = parseInt(req.query.year);
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10000;
    const offset = (page - 1) * pageSize;
    const cacheKey = `${cacheKeyPrefix}:${year}:${page}:${pageSize}`;

    try {
        const cachedData = await db.redisClient.get(cacheKey);
        if (cachedData) {
            console.log('Data retrieved from Redis cache');
            return res.json(JSON.parse(cachedData));
        }

        console.log(`Received request for ${cacheKeyPrefix} data for year ${year}, page ${page}, pageSize ${pageSize}`);
        const data = await dataFetchFunction(year, pageSize, offset);

        await db.redisClient.set(cacheKey, JSON.stringify(data), 'EX', 3600);

        console.log('Data fetched from database:', data);
        res.json(data);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send(err.message);
    }
};

app.get('/api/licensing', (req, res) => {
    getPaginatedData(req, res, 'licensing', db.getLicensingData);
});

app.get('/api/nct', (req, res) => {
    getPaginatedData(req, res, 'nct', db.getNCTData);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
