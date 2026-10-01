const express = require("express");

const router = express.Router();

const JobController =
    require("../controllers/job.controller");

const authenticateToken =
    require("../middleware/auth.middleware");

const authorizeRole =
    require("../middleware/role.middleware");


// ==========================================
// JOB OPPORTUNITY ROUTES
// ==========================================

// Lahat ng routes dito kailangan naka-login
router.use(authenticateToken);


// ==========================================
// GET ALL JOBS
// Admin + Alumni + Alumni Office
//
// GET /api/jobs
// ==========================================

router.get(
    "/",
    authorizeRole(1, 2, 3),
    JobController.getAllJobs
);


// ==========================================
// GET ONE JOB
// Admin + Alumni + Alumni Office
//
// GET /api/jobs/:id
// ==========================================

router.get(
    "/:id",
    authorizeRole(1, 2, 3),
    JobController.getJobById
);


// ==========================================
// CREATE JOB
// Admin + Alumni Office ONLY
//
// POST /api/jobs
// ==========================================

router.post(
    "/",
    authorizeRole(1, 3),
    JobController.createJob
);


// ==========================================
// UPDATE JOB
// Admin + Alumni Office ONLY
//
// PUT /api/jobs/:id
// ==========================================

router.put(
    "/:id",
    authorizeRole(1, 3),
    JobController.updateJob
);


// ==========================================
// DELETE JOB
// Admin + Alumni Office ONLY
//
// DELETE /api/jobs/:id
// ==========================================

router.delete(
    "/:id",
    authorizeRole(1, 3),
    JobController.deleteJob
);


module.exports = router;