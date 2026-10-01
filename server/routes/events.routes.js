const express = require("express");

const router = express.Router();

const EventController =
    require("../controllers/event.controller");

const EventRsvpController =
    require("../controllers/event-rsvp.controller");

const authenticateToken =
    require("../middleware/auth.middleware");

const authorizeRole =
    require("../middleware/role.middleware");


// ==========================================
// ALL EVENT ROUTES REQUIRE LOGIN
// ==========================================

router.use(authenticateToken);


// ==========================================
// ALUMNI RSVP ROUTES
// Role 2 = Alumni
// ==========================================

// GET ALL RSVPS OF CURRENT ALUMNI
// IMPORTANT: before /:id

router.get(
    "/my-rsvps",
    authorizeRole(2),
    EventRsvpController.getMyRsvps
);


// RSVP TO EVENT

router.post(
    "/:id/rsvp",
    authorizeRole(2),
    EventRsvpController.rsvpEvent
);


// CANCEL RSVP

router.delete(
    "/:id/rsvp",
    authorizeRole(2),
    EventRsvpController.cancelRsvp
);


// GET CURRENT RSVP STATUS

router.get(
    "/:id/rsvp/me",
    authorizeRole(2),
    EventRsvpController.getMyRsvp
);


// ==========================================
// RSVP MONITORING
// ADMIN + ALUMNI OFFICE
// ==========================================

// RSVP COUNT

router.get(
    "/:id/rsvp/count",
    authorizeRole(1, 3),
    EventRsvpController.getRsvpCount
);


// EVENT ATTENDEES

router.get(
    "/:id/attendees",
    authorizeRole(1, 3),
    EventRsvpController.getEventAttendees
);


// ==========================================
// EVENT VIEWING
// ADMIN + ALUMNI + OFFICE
// ==========================================

// GET ALL EVENTS

router.get(
    "/",
    authorizeRole(1, 2, 3),
    EventController.getAllEvents
);


// GET ONE EVENT

router.get(
    "/:id",
    authorizeRole(1, 2, 3),
    EventController.getEventById
);


// ==========================================
// EVENT MANAGEMENT
// ADMIN + OFFICE ONLY
// ==========================================

// CREATE EVENT

router.post(
    "/",
    authorizeRole(1, 3),
    EventController.createEvent
);


// UPDATE EVENT

router.put(
    "/:id",
    authorizeRole(1, 3),
    EventController.updateEvent
);


// DELETE EVENT

router.delete(
    "/:id",
    authorizeRole(1, 3),
    EventController.deleteEvent
);


module.exports = router;