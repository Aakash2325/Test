// const sql = require('mssql');
// const redis = require('redis');

// // Configuration for SQL Server connection
// const config = {
//     server: '109.255.231.231',
//     user: 'sa',
//     password: 'sqlEnvEcon9',
//     database: 'NationalCarTest',
//     options: {
//         encrypt: true,
//         trustServerCertificate: true,
//         port: 1433
//     }
// };

// const poolPromise = new sql.ConnectionPool(config)
//     .connect()
//     .then(pool => {
//         console.log('Connected to MSSQL');
//         return pool;
//     })
//     .catch(err => console.log('Database Connection Failed! Bad Config: ', err));

// const redisClient = redis.createClient({
//     socket: {
//         host: process.env.REDIS_HOST || 'redis',
//         port: process.env.REDIS_PORT || 6379,
//         connectTimeout: 10000,
//     },
//     retry_strategy: (options) => {
//         if (options.error && options.error.code === 'ECONNREFUSED') {
//             return new Error('The server refused the connection');
//         }
//         if (options.total_retry_time > 1000 * 60 * 60) {
//             return new Error('Retry time exhausted');
//         }
//         if (options.attempt > 10) {
//             return undefined;
//         }
//         return Math.min(options.attempt * 100, 3000);
//     }
// });

// redisClient.on('error', (err) => {
//     console.log('Redis Client Error', err);
// });

// redisClient.connect()
//     .then(() => console.log('Connected to Redis'))
//     .catch(err => console.log('Redis Connection Failed', err));

// async function getLicensingData(year, topRows, offset) {
//     const pool = await poolPromise;
//     const result = await pool.request()
//         .input('year', sql.Int, year)
//         .input('topRows', sql.Int, topRows)
//         .input('offset', sql.Int, offset)
//         .query(`
//             SELECT [Licensing_ID]
//                   ,[DataYear]
//                   ,[NumberOfVehicles]
//                   ,[MakeDescription]
//                   ,[ModelDescription]
//                   ,[AgeOfVehicle]
//                   ,[FuelType]
//                   ,[MotorTaxOffice]
//                   ,[BodyDescription]
//                   ,[TaxDescription]
//                   ,[EngineCC]
//                   ,[VTAValue]
//                   ,[GrossVehicleWeight]
//                   ,[RegistrationStatus]
//               FROM [Licensing].[dbo].[LicensingData]
//               WHERE [DataYear] = @year
//               ORDER BY [Licensing_ID]
//               OFFSET @offset ROWS FETCH NEXT @topRows ROWS ONLY
//         `);
//     return result.recordset;
// }

// async function getNCTData(year, topRows, offset) {
//     const pool = await poolPromise;
//     const result = await pool.request()
//         .input('year', sql.Int, year)
//         .input('topRows', sql.Int, topRows)
//         .input('offset', sql.Int, offset)
//         .query(`
//             SELECT [UniqueID]
//                   ,[Data_Year]
//                   ,[Make]
//                   ,[Model]
//                   ,[BodyType]
//                   ,[FuelType]
//                   ,[EngineSize]
//                   ,[YearOfManufacture]
//                   ,[TaxClass]
//                   ,[County]
//                   ,[TimeOfTestRegistration]
//                   ,[TestCentre]
//                   ,[TestDate]
//                   ,[VehicleTestWeight]
//                   ,[MileageKM]
//               FROM [NationalCarTest].[dbo].[NCT]
//               WHERE [Data_Year] = @year
//               ORDER BY [UniqueID]
//               OFFSET @offset ROWS FETCH NEXT @topRows ROWS ONLY
//         `);
//     return result.recordset;
// }

// module.exports = {
//     getLicensingData,
//     getNCTData,
//     redisClient // Export redisClient
// };










const sql = require('mssql');
const redis = require('redis');

// Configuration for SQL Server connection
const config = {
    server: '109.255.231.231',
    user: 'sa',
    password: 'sqlEnvEcon9',
    database: 'NationalCarTest',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        port: 1433
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch(err => console.log('Database Connection Failed! Bad Config: ', err));

const redisClient = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST || 'redis',
        port: process.env.REDIS_PORT || 6379,
        connectTimeout: 10000,
    },
    retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
            return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
    }
});

redisClient.on('error', (err) => {
    console.log('Redis Client Error', err);
});

redisClient.connect()
    .then(() => console.log('Connected to Redis'))
    .catch(err => console.log('Redis Connection Failed', err));

async function getLicensingData(year, pageSize, offset) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('year', sql.Int, year)
        .query(`
            SELECT [Licensing_ID]
                  ,[DataYear]
                  ,[NumberOfVehicles]
                  ,[MakeDescription]
                  ,[ModelDescription]
                  ,[AgeOfVehicle]
                  ,[FuelType]
                  ,[MotorTaxOffice]
                  ,[BodyDescription]
                  ,[TaxDescription]
                  ,[EngineCC]
                  ,[VTAValue]
                  ,[GrossVehicleWeight]
                  ,[RegistrationStatus]
              FROM [Licensing].[dbo].[LicensingData]
              WHERE [DataYear] = @year
              ORDER BY [Licensing_ID]
              OFFSET ${offset} ROWS
              FETCH NEXT ${pageSize} ROWS ONLY
        `);
    return result.recordset;
}

async function getNCTData(year, pageSize, offset) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('year', sql.Int, year)
        .query(`
            SELECT [UniqueID]
                  ,[Data_Year]
                  ,[Make]
                  ,[Model]
                  ,[BodyType]
                  ,[FuelType]
                  ,[EngineSize]
                  ,[YearOfManufacture]
                  ,[TaxClass]
                  ,[County]
                  ,[TimeOfTestRegistration]
                  ,[TestCentre]
                  ,[TestDate]
                  ,[VehicleTestWeight]
                  ,[MileageKM]
              FROM [NationalCarTest].[dbo].[NCT]
              WHERE [Data_Year] = @year
              ORDER BY [UniqueID]
              OFFSET ${offset} ROWS
              FETCH NEXT ${pageSize} ROWS ONLY
        `);
    return result.recordset;
}

module.exports = {
    getLicensingData,
    getNCTData,
    redisClient // Export redisClient
};
