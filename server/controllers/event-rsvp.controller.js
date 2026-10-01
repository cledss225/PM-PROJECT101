const EventRsvpService =
    require("../services/event-rsvp.service");


const EventRsvpController = {


    // ==========================================
    // RSVP / JOIN EVENT
    // POST /api/events/:id/rsvp
    // ==========================================

    async rsvpEvent(req, res) {

        try {

            const eventId =
                Number(req.params.id);

            const userId =
                req.user?.user_id;


            if (!Number.isInteger(eventId)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid event ID."
                });

            }


            if (!userId) {

                return res.status(401).json({
                    success: false,
                    message: "User authentication required."
                });

            }


            const rsvp =
                await EventRsvpService.rsvpEvent(
                    eventId,
                    userId
                );


            const rsvpCount =
                await EventRsvpService.getRsvpCount(
                    eventId
                );


            return res.status(200).json({

                success: true,

                message:
                    "RSVP confirmed successfully.",

                rsvp,

                rsvp_count:
                    rsvpCount

            });


        } catch (error) {

            console.error(
                "RSVP EVENT ERROR:",
                error
            );


            return res.status(400).json({

                success: false,

                message:
                    error.message ||
                    "Unable to RSVP to event."

            });

        }

    },


    // ==========================================
    // CANCEL RSVP
    // DELETE /api/events/:id/rsvp
    // ==========================================

    async cancelRsvp(req, res) {

        try {

            const eventId =
                Number(req.params.id);

            const userId =
                req.user?.user_id;


            if (!Number.isInteger(eventId)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid event ID."
                });

            }


            if (!userId) {

                return res.status(401).json({
                    success: false,
                    message: "User authentication required."
                });

            }


            const rsvp =
                await EventRsvpService.cancelRsvp(
                    eventId,
                    userId
                );


            const rsvpCount =
                await EventRsvpService.getRsvpCount(
                    eventId
                );


            return res.status(200).json({

                success: true,

                message:
                    "RSVP cancelled successfully.",

                rsvp,

                rsvp_count:
                    rsvpCount

            });


        } catch (error) {

            console.error(
                "CANCEL RSVP ERROR:",
                error
            );


            return res.status(400).json({

                success: false,

                message:
                    error.message ||
                    "Unable to cancel RSVP."

            });

        }

    },


    // ==========================================
    // GET CURRENT USER RSVP STATUS
    // GET /api/events/:id/rsvp/me
    // ==========================================

    async getMyRsvp(req, res) {

        try {

            const eventId =
                Number(req.params.id);

            const userId =
                req.user?.user_id;


            if (!Number.isInteger(eventId)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid event ID."
                });

            }


            if (!userId) {

                return res.status(401).json({
                    success: false,
                    message: "User authentication required."
                });

            }


            const rsvp =
                await EventRsvpService.getUserRsvp(
                    eventId,
                    userId
                );


            return res.status(200).json({

                success: true,

                has_rsvp:
                    rsvp?.status === "going",

                rsvp

            });


        } catch (error) {

            console.error(
                "GET MY RSVP ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to retrieve RSVP status."

            });

        }

    },


    // ==========================================
    // GET ALL RSVPS OF CURRENT ALUMNI
    // GET /api/events/my-rsvps
    // ==========================================

    async getMyRsvps(req, res) {

        try {

            const userId =
                req.user?.user_id;


            if (!userId) {

                return res.status(401).json({
                    success: false,
                    message: "User authentication required."
                });

            }


            const rsvps =
                await EventRsvpService.getMyRsvps(
                    userId
                );


            return res.status(200).json({

                success: true,

                count:
                    rsvps.length,

                rsvps

            });


        } catch (error) {

            console.error(
                "GET MY RSVPS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Unable to retrieve your RSVPs."

            });

        }

    },


    // ==========================================
    // GET RSVP COUNT
    // ADMIN + OFFICE
    // ==========================================

    async getRsvpCount(req, res) {

        try {

            const eventId =
                Number(req.params.id);


            if (!Number.isInteger(eventId)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid event ID."
                });

            }


            const count =
                await EventRsvpService.getRsvpCount(
                    eventId
                );


            return res.status(200).json({

                success: true,

                event_id:
                    eventId,

                rsvp_count:
                    count

            });


        } catch (error) {

            console.error(
                "GET RSVP COUNT ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to retrieve RSVP count."

            });

        }

    },


    // ==========================================
    // GET EVENT ATTENDEES
    // ADMIN + OFFICE
    // ==========================================

    async getEventAttendees(req, res) {

        try {

            const eventId =
                Number(req.params.id);


            if (!Number.isInteger(eventId)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid event ID."
                });

            }


            const attendees =
                await EventRsvpService.getEventAttendees(
                    eventId
                );


            return res.status(200).json({

                success: true,

                count:
                    attendees.length,

                attendees

            });


        } catch (error) {

            console.error(
                "GET EVENT ATTENDEES ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to retrieve event attendees."

            });

        }

    }


};


module.exports = EventRsvpController;