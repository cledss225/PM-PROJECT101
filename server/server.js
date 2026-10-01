const path = require("path");
const http = require("http");

const express = require("express");
const cors = require("cors");
const compression = require("compression");

require("dotenv").config();

const pool = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const testRoutes = require("./routes/test.routes");
const alumniRoutes = require("./routes/alumni.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const accountRoutes = require("./routes/account.routes");
const eventRoutes = require("./routes/events.routes");
const jobsRoutes = require("./routes/jobs.routes");
const announcementRoutes = require("./routes/announcement.routes");
const searchRoutes = require("./routes/search.routes");

const app = express();


// =========================================================
// APP SETTINGS
// =========================================================

app.disable("x-powered-by");


// =========================================================
// MIDDLEWARE
// =========================================================

app.use(
    cors({
        origin: true,
        credentials: true
    })
);


// Compress JSON, HTML, CSS, JS responses
app.use(
    compression({
        threshold: 1024
    })
);


// Prevent unnecessarily huge JSON requests
app.use(
    express.json({
        limit: "1mb"
    })
);


// =========================================================
// STATIC FRONTEND
// =========================================================

app.use(
    express.static(
        path.join(__dirname, "../client"),
        {
            maxAge:
                process.env.NODE_ENV === "production"
                    ? "1d"
                    : 0,

            etag: true
        }
    )
);


// =========================================================
// API ROUTES
// =========================================================

app.use("/api/auth", authRoutes);

app.use("/api/test", testRoutes);

app.use("/api/alumni", alumniRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/accounts", accountRoutes);

app.use("/api/events", eventRoutes);

app.use("/api/jobs", jobsRoutes);

app.use(
    "/api/announcements",
    announcementRoutes
);

app.use(
    "/api/search",
    searchRoutes
);


// =========================================================
// DEBUG ROUTE
// =========================================================

app.get(
    "/debug",
    (req, res) => {

        res.json({
            success: true,
            message:
                "Current server.js is running"
        });

    }
);


// =========================================================
// DATABASE HEALTH CHECK
// =========================================================

app.get(
    "/api/test-db",
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    "SELECT NOW()"
                );

            res.status(200).json({
                success: true,

                message:
                    "🚀 Alumni Management System API is running!",

                database:
                    "Connected",

                serverTime:
                    result.rows[0].now
            });

        } catch (error) {

            console.error(
                "DATABASE HEALTH CHECK ERROR:",
                error
            );

            res.status(500).json({
                success: false,

                message:
                    "Database connection failed."
            });

        }

    }
);


// =========================================================
// FRONTEND ROOT
// =========================================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../client/index.html"
            )
        );

    }
);


// =========================================================
// 404 HANDLER
// =========================================================

app.use(
    (req, res) => {

        res
            .status(404)
            .json({
                success: false,

                message:
                    "Route not found",

                path:
                    req.originalUrl
            });

    }
);


// =========================================================
// GLOBAL ERROR HANDLER
// =========================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "UNHANDLED SERVER ERROR:",
            error
        );

        if (res.headersSent) {

            return next(error);

        }

        res
            .status(
                error.status || 500
            )
            .json({
                success: false,

                message:
                    error.message ||
                    "Internal server error."
            });

    }
);


// =========================================================
// HTTP SERVER
// =========================================================

const PORT =
    Number(
        process.env.PORT
    ) || 5000;


const server =
    http.createServer(app);


// Keep connections reusable
server.keepAliveTimeout =
    65 * 1000;


// Must be slightly higher than keepAliveTimeout
server.headersTimeout =
    70 * 1000;


// Prevent requests from hanging forever
server.requestTimeout =
    30 * 1000;


// =========================================================
// START SERVER
// =========================================================

server.listen(
    PORT,
    () => {

        console.log(
            "🔥 CURRENT SERVER.JS LOADED"
        );

        console.log(
            `🚀 Server running at http://localhost:${PORT}`
        );

    }
);


// =========================================================
// GRACEFUL SHUTDOWN
// =========================================================

async function shutdown(signal) {

    console.log(
        `\n🛑 ${signal} received. Shutting down gracefully...`
    );


    server.close(
        async () => {

            try {

                await pool.end();

                console.log(
                    "✅ PostgreSQL pool closed."
                );

            } catch (error) {

                console.error(
                    "POOL SHUTDOWN ERROR:",
                    error
                );

            }


            process.exit(0);

        }
    );


    setTimeout(
        () => {

            console.error(
                "❌ Forced shutdown after timeout."
            );

            process.exit(1);

        },
        10_000
    ).unref();

}


process.on(
    "SIGTERM",
    () =>
        shutdown(
            "SIGTERM"
        )
);


process.on(
    "SIGINT",
    () =>
        shutdown(
            "SIGINT"
        )
);