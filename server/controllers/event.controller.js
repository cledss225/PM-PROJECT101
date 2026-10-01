const EventService =
    require("../services/event.service");


const EventController = {


    // ==========================================
    // GET ALL EVENTS
    // GET /api/events
    // ==========================================

    async getAllEvents(req, res) {

        try {

            const events =
                await EventService.getAllEvents();


            return res.status(200).json({

                success: true,

                count: events.length,

                events

            });


        } catch (error) {

            console.error(
                "GET ALL EVENTS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load events."

            });

        }

    },


    // ==========================================
    // GET ONE EVENT
    // GET /api/events/:id
    // ==========================================

    async getEventById(req, res) {

        try {

            const eventId =
                Number(req.params.id);


            if (!Number.isInteger(eventId)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid event ID."

                });

            }


            const event =
                await EventService
                    .getEventById(eventId);


            return res.status(200).json({

                success: true,

                event

            });


        } catch (error) {

            console.error(
                "GET EVENT ERROR:",
                error
            );


            return res.status(404).json({

                success: false,

                message: error.message

            });

        }

    },


    // ==========================================
    // CREATE EVENT
    // POST /api/events
    // ==========================================

    async createEvent(req, res) {

        try {

            const {

                title,
                description,
                event_type,
                status,

                start_date,
                start_time,
                end_date,
                end_time,

                event_mode,

                venue,
                meeting_link,

                capacity,

                registration_deadline,

                visibility,

                rsvp_enabled,

                event_image

            } = req.body;


            // Required fields

            if (
                !title ||
                !description ||
                !event_type ||
                !start_date ||
                !start_time ||
                !event_mode
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please complete all required event fields."

                });

            }


            // Validate capacity

            if (
                capacity !== undefined &&
                capacity !== null &&
                capacity !== "" &&
                (
                    !Number.isInteger(Number(capacity)) ||
                    Number(capacity) <= 0
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Event capacity must be greater than zero."

                });

            }


            const event =
                await EventService.createEvent(

                    {

                        title: title.trim(),

                        description:
                            description.trim(),

                        event_type,

                        status:
                            status || "upcoming",

                        start_date,
                        start_time,

                        end_date:
                            end_date || null,

                        end_time:
                            end_time || null,

                        event_mode,

                        venue:
                            venue?.trim() || null,

                        meeting_link:
                            meeting_link?.trim() || null,

                        capacity:
                            capacity
                                ? Number(capacity)
                                : null,

                        registration_deadline:
                            registration_deadline ||
                            null,

                        visibility:
                            visibility ||
                            "published",

                        rsvp_enabled:
                            rsvp_enabled !== false,

                        event_image:
                            event_image || null

                    },

                    req.user?.user_id

                );


            return res.status(201).json({

                success: true,

                message:
                    "Event created successfully.",

                event

            });


        } catch (error) {

            console.error(
                "CREATE EVENT ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Unable to create event."

            });

        }

    },


    // ==========================================
    // UPDATE EVENT
    // PUT /api/events/:id
    // ==========================================

    async updateEvent(req, res) {

        try {

            const eventId =
                Number(req.params.id);


            if (!Number.isInteger(eventId)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid event ID."

                });

            }


            // Validate capacity when supplied

            if (
                req.body.capacity !== undefined &&
                req.body.capacity !== null &&
                req.body.capacity !== "" &&
                (
                    !Number.isInteger(
                        Number(req.body.capacity)
                    ) ||
                    Number(req.body.capacity) <= 0
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Event capacity must be greater than zero."

                });

            }


            const updateData = {

                ...req.body

            };


            if (
                updateData.capacity !== undefined &&
                updateData.capacity !== null &&
                updateData.capacity !== ""
            ) {

                updateData.capacity =
                    Number(updateData.capacity);

            }


            if (updateData.title) {

                updateData.title =
                    updateData.title.trim();

            }


            if (updateData.description) {

                updateData.description =
                    updateData.description.trim();

            }


            if (
                updateData.venue !== undefined
            ) {

                updateData.venue =
                    updateData.venue?.trim() ||
                    null;

            }


            if (
                updateData.meeting_link !==
                undefined
            ) {

                updateData.meeting_link =
                    updateData.meeting_link
                        ?.trim() ||
                    null;

            }


            const event =
                await EventService.updateEvent(
                    eventId,
                    updateData
                );


            return res.status(200).json({

                success: true,

                message:
                    "Event updated successfully.",

                event

            });


        } catch (error) {

            console.error(
                "UPDATE EVENT ERROR:",
                error
            );


            const statusCode =
                error.message ===
                "Event not found."
                    ? 404
                    : 400;


            return res.status(statusCode).json({

                success: false,

                message: error.message

            });

        }

    },


    // ==========================================
    // DELETE EVENT
    // DELETE /api/events/:id
    // ==========================================

    async deleteEvent(req, res) {

        try {

            const eventId =
                Number(req.params.id);


            if (!Number.isInteger(eventId)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid event ID."

                });

            }


            const event =
                await EventService
                    .deleteEvent(eventId);


            return res.status(200).json({

                success: true,

                message:
                    "Event deleted successfully.",

                event

            });


        } catch (error) {

            console.error(
                "DELETE EVENT ERROR:",
                error
            );


            return res.status(404).json({

                success: false,

                message: error.message

            });

        }

    }


};


module.exports = EventController;