const express = require("express");

const router = express.Router();

const AnnouncementController =
    require("../controllers/announcement.controller");

const authenticateToken =
    require("../middleware/auth.middleware");

const authorizeRole =
    require("../middleware/role.middleware");


// ==========================================
// ANNOUNCEMENT ROUTES
// ==========================================

// All routes require login
router.use(authenticateToken);


// ==========================================
// GET ALL ANNOUNCEMENTS
// Admin + Alumni + Alumni Office
//
// GET /api/announcements
// ==========================================

router.get(
    "/",
    authorizeRole(1, 2, 3),
    AnnouncementController.getAllAnnouncements
);


// ==========================================
// GET ONE ANNOUNCEMENT
// Admin + Alumni + Alumni Office
//
// GET /api/announcements/:id
// ==========================================

router.get(
    "/:id",
    authorizeRole(1, 2, 3),
    AnnouncementController.getAnnouncementById
);


// ==========================================
// CREATE ANNOUNCEMENT
// Admin + Alumni Office ONLY
//
// POST /api/announcements
// ==========================================

router.post(
    "/",
    authorizeRole(1, 3),
    AnnouncementController.createAnnouncement
);


// ==========================================
// UPDATE ANNOUNCEMENT
// Admin + Alumni Office ONLY
//
// PUT /api/announcements/:id
// ==========================================

router.put(
    "/:id",
    authorizeRole(1, 3),
    AnnouncementController.updateAnnouncement
);


// ==========================================
// DELETE ANNOUNCEMENT
// Admin + Alumni Office ONLY
//
// DELETE /api/announcements/:id
// ==========================================

router.delete(
    "/:id",
    authorizeRole(1, 3),
    AnnouncementController.deleteAnnouncement
);


module.exports = router;