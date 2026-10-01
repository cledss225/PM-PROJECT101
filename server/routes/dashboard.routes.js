const express = require("express");


const router = express.Router();


const DashboardController =
    require("../controllers/dashboard.controller");


const authenticateToken =
    require("../middleware/auth.middleware");


const authorizeRole =
    require("../middleware/role.middleware");

    const {
    cacheMiddleware
} = require("../middleware/cache.middleware");


// ==========================================
// DASHBOARD SUMMARY
// GET /api/dashboard/stats
// ==========================================

router.get(
    "/stats",
    authenticateToken,
    authorizeRole(1, 3),
    DashboardController.getStats
);


// ==========================================
// ALUMNI PER BATCH
// GET /api/dashboard/batches
// ==========================================

router.get(
    "/batches",
    authenticateToken,
    authorizeRole(1, 3),
    DashboardController.getBatchStatistics
);


// ==========================================
// EMPLOYMENT STATISTICS
// GET /api/dashboard/employment
// ==========================================

router.get(
    "/employment",
    authenticateToken,
    authorizeRole(1, 3),
    DashboardController.getEmploymentStatistics
);


// ==========================================
// RECENT REGISTRATIONS
// GET /api/dashboard/recent
// ==========================================

router.get(
    "/recent",
    authenticateToken,
    authorizeRole(1, 3),
    DashboardController.getRecentRegistrations
);


// ==========================================
// RECENT ACTIVITY
//
// GET /api/dashboard/activity?range=today
// GET /api/dashboard/activity?range=yesterday
// GET /api/dashboard/activity?range=week
// ==========================================

router.get(
    "/activity",
    authenticateToken,
    authorizeRole(1, 3),
    DashboardController.getRecentActivity
);


module.exports = router;