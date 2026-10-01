require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());


// ===============================
// TEST ROUTE
// ===============================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message: "Alumni Management System API is running!"

    });

});


// ===============================
// ROUTES
// ===============================

const authRoutes = require("./routes/auth.routes");
const accountRoutes = require("./routes/account.routes");
const alumniRoutes = require("./routes/alumni.routes");
const dashboardRoutes = require("./routes/dashboard.routes");


// Existing working routes muna
app.use("/api/auth", authRoutes);

app.use("/api/accounts", accountRoutes);

app.use("/api/alumni", alumniRoutes);

app.use("/api/dashboard", dashboardRoutes);


// Temporary disable muna:
// announcement.routes.js
// events.routes.js
//
// I-aactivate natin sila kapag gagawin na natin yung modules.



// ===============================
// DATABASE
// ===============================

require("./config/db");



// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "Route not found",

        path: req.originalUrl

    });

});



// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {

    console.log(`🚀 Server running on port ${PORT}`);

});