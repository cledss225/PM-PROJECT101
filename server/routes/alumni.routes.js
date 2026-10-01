const express = require("express");

const router = express.Router();


const AlumniController =
    require("../controllers/alumni.controller");

const AdminAlumniController =
    require("../controllers/admin.alumni.controller");


const authenticateToken =
    require("../middleware/auth.middleware");

const authorizeRole =
    require("../middleware/role.middleware");


const {
    cacheMiddleware,
    clearCache
} = require("../middleware/cache.middleware");


// =========================================================
// CACHE INVALIDATION
// =========================================================
//
// Clear cached directory data only after a successful
// create/update/delete request.
//
// Note:
// Our current cache middleware uses one shared in-memory Map,
// so clearCache() also clears other cached GET responses such
// as dashboard caches.
//
// This is safe for now. Later, when we move to Redis,
// we can use dedicated cache namespaces/keys.
// =========================================================

function clearCacheOnSuccess(
    req,
    res,
    next
) {

    res.on("finish", () => {

        if (
            res.statusCode >= 200 &&
            res.statusCode < 300
        ) {

            clearCache();

        }

    });

    next();

}


// =========================================================
// OWN ALUMNI PROFILE
// =========================================================


// Create own profile
// POST /api/alumni/profile

router.post(

    "/profile",

    authenticateToken,

    clearCacheOnSuccess,

    AlumniController.createProfile

);


// Get own profile
// GET /api/alumni/profile
//
// IMPORTANT:
// Do NOT cache this endpoint because this contains
// personalized data for the logged-in user.

router.get(

    "/profile",

    authenticateToken,

    AlumniController.getProfile

);


// Update own profile
// PUT /api/alumni/profile

router.put(

    "/profile",

    authenticateToken,

    clearCacheOnSuccess,

    AlumniController.updateProfile

);


// Delete own profile
// DELETE /api/alumni/profile

router.delete(

    "/profile",

    authenticateToken,

    clearCacheOnSuccess,

    AlumniController.deleteProfile

);


// =========================================================
// ALUMNI DIRECTORY
// ADMIN / ALUMNI OFFICE / ALUMNI
// =========================================================


// ---------------------------------------------------------
// DIRECTORY METADATA
// ---------------------------------------------------------
//
// Cache for 30 seconds.
//
// Includes:
// - total alumni
// - verified alumni
// - employed alumni
// - programs
// - batches
//
// Metadata does not need to hit PostgreSQL on every
// request because it changes relatively infrequently.
//
// GET /api/alumni/meta

router.get(

    "/meta",

    authenticateToken,

    authorizeRole(1, 2, 3),

    cacheMiddleware(30),

    AlumniController.getDirectoryMeta

);


// ---------------------------------------------------------
// ALUMNI DIRECTORY
// ---------------------------------------------------------
//
// Cache each unique URL/query combination for 10 seconds.
//
// Examples:
//
// /api/alumni?page=1&limit=20&sort=name
//
// /api/alumni?page=2&limit=20&sort=name
//
// /api/alumni?page=1&limit=20&search=cledera
//
// /api/alumni?page=1&program=BSIT
//
// Because cache.middleware.js uses req.originalUrl,
// each Search / Filter / Sort / Page combination gets
// its own cache entry.
//
// GET /api/alumni

router.get(

    "/",

    authenticateToken,

    authorizeRole(1, 2, 3),

    cacheMiddleware(10),

    AlumniController.getAllAlumni

);


// =========================================================
// ADMIN / OFFICE MANAGEMENT
// =========================================================


// Create alumni account
// POST /api/alumni/admin/create

router.post(

    "/admin/create",

    authenticateToken,

    authorizeRole(1, 3),

    clearCacheOnSuccess,

    AdminAlumniController.createAlumni

);


// Update alumni through admin endpoint
// PUT /api/alumni/admin/update/:user_id

router.put(

    "/admin/update/:user_id",

    authenticateToken,

    authorizeRole(1, 3),

    clearCacheOnSuccess,

    AdminAlumniController.updateAlumni

);


// Delete alumni through admin endpoint
// DELETE /api/alumni/admin/delete/:user_id

router.delete(

    "/admin/delete/:user_id",

    authenticateToken,

    authorizeRole(1, 3),

    clearCacheOnSuccess,

    AdminAlumniController.deleteAlumni

);


// =========================================================
// SIMPLIFIED ADMIN / OFFICE ENDPOINTS
// =========================================================


// Update alumni
// PUT /api/alumni/:user_id

router.put(

    "/:user_id",

    authenticateToken,

    authorizeRole(1, 3),

    clearCacheOnSuccess,

    AdminAlumniController.updateAlumni

);


// Delete alumni
// DELETE /api/alumni/:user_id

router.delete(

    "/:user_id",

    authenticateToken,

    authorizeRole(1, 3),

    clearCacheOnSuccess,

    AdminAlumniController.deleteAlumni

);


module.exports = router;