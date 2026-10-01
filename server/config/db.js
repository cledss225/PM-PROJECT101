const { Pool } = require("pg");

require("dotenv").config();


// =========================================================
// POSTGRESQL CONNECTION POOL
// =========================================================

const pool = new Pool({

    host: process.env.DB_HOST,

    port: Number(process.env.DB_PORT),

    database: process.env.DB_NAME,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,


    // Maximum database connections
    // per Node.js instance
    max: 40,


    // Close unused connections after 30 seconds
    idleTimeoutMillis: 30000,


    // Stop waiting if PostgreSQL cannot
    // provide a connection within 5 seconds
    connectionTimeoutMillis: 5000,


    // Prevent extremely long queries
    statement_timeout: 15000,


    // Prevent queries from waiting forever
    query_timeout: 15000,


    // Keep TCP database connections alive
    keepAlive: true

});


// =========================================================
// POOL ERROR HANDLER
// =========================================================

pool.on("error", (err) => {

    console.error(
        "❌ Unexpected PostgreSQL pool error:",
        err.message
    );

});


// =========================================================
// DATABASE CONNECTION TEST
// =========================================================

async function testDatabaseConnection() {

    let client;

    try {

        client = await pool.connect();

        await client.query("SELECT 1");


        console.log(
            "✅ Connected to PostgreSQL"
        );


        console.log(
            `📊 PostgreSQL pool ready (max: ${pool.options.max})`
        );

    } catch (error) {

        console.error(
            "❌ PostgreSQL Connection Error:",
            error.message
        );

    } finally {

        if (client) {

            client.release();

        }

    }

}


testDatabaseConnection();


// =========================================================
// TEMPORARY PERFORMANCE MONITOR
// =========================================================

const monitorPool =
    String(
        process.env.DB_POOL_MONITOR || ""
    ).toLowerCase() === "true";


if (monitorPool) {

    console.log(
        "📈 PostgreSQL pool monitoring enabled"
    );


    const monitorInterval =
        setInterval(() => {

            const total =
                pool.totalCount;

            const idle =
                pool.idleCount;

            const waiting =
                pool.waitingCount;

            const busy =
                Math.max(
                    total - idle,
                    0
                );


            console.log(
                [
                    "📊 DB POOL",
                    `total=${total}`,
                    `busy=${busy}`,
                    `idle=${idle}`,
                    `waiting=${waiting}`,
                    `max=${pool.options.max}`
                ].join(" | ")
            );

        }, 2000);


    // Prevent monitoring timer from keeping
    // Node alive during graceful shutdown
    monitorInterval.unref();

}


module.exports = pool;