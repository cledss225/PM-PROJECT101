const pool = require("../config/db");


const EventService = {


    // GET ALL EVENTS

    async getAllEvents() {

        const result = await pool.query(`
            SELECT
                e.event_id,
                e.title,
                e.description,
                e.event_type,
                e.status,
                e.start_date,
                e.start_time,
                e.end_date,
                e.end_time,
                e.event_mode,
                e.venue,
                e.meeting_link,
                e.capacity,
                e.registration_deadline,
                e.visibility,
                e.rsvp_enabled,
                e.event_image,
                e.created_by,
                e.created_at,
                e.updated_at,

                u.first_name AS creator_first_name,
                u.last_name AS creator_last_name,

                (
                    SELECT COUNT(*)::INTEGER

                    FROM event_rsvps er

                    WHERE er.event_id = e.event_id
                    AND er.status = 'going'

                ) AS rsvp_count

            FROM events e

            LEFT JOIN users u
                ON e.created_by = u.user_id

            ORDER BY
                e.start_date ASC,
                e.start_time ASC
        `);


        return result.rows;

    },


    // GET ONE EVENT

    async getEventById(eventId) {

        const result = await pool.query(`
            SELECT
                e.event_id,
                e.title,
                e.description,
                e.event_type,
                e.status,
                e.start_date,
                e.start_time,
                e.end_date,
                e.end_time,
                e.event_mode,
                e.venue,
                e.meeting_link,
                e.capacity,
                e.registration_deadline,
                e.visibility,
                e.rsvp_enabled,
                e.event_image,
                e.created_by,
                e.created_at,
                e.updated_at

            FROM events e

            WHERE e.event_id = $1
        `, [eventId]);


        if (result.rows.length === 0) {

            throw new Error(
                "Event not found."
            );

        }


        return result.rows[0];

    },


    // CREATE EVENT

    async createEvent(data, createdBy) {

        const result = await pool.query(`
            INSERT INTO events (
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
                event_image,
                created_by
            )

            VALUES (
                $1, $2, $3, $4,
                $5, $6, $7, $8,
                $9, $10, $11, $12,
                $13, $14, $15, $16,
                $17
            )

            RETURNING *
        `, [

            data.title,
            data.description,
            data.event_type,
            data.status || "upcoming",

            data.start_date,
            data.start_time,
            data.end_date || null,
            data.end_time || null,

            data.event_mode,
            data.venue || null,
            data.meeting_link || null,
            data.capacity || null,

            data.registration_deadline || null,

            data.visibility || "published",

            data.rsvp_enabled !== false,

            data.event_image || null,

            createdBy || null

        ]);


        return result.rows[0];

    },


    // UPDATE EVENT

    async updateEvent(eventId, data) {

        const existingEvent =
            await this.getEventById(eventId);


        const result = await pool.query(`
            UPDATE events

            SET
                title = $1,
                description = $2,
                event_type = $3,
                status = $4,
                start_date = $5,
                start_time = $6,
                end_date = $7,
                end_time = $8,
                event_mode = $9,
                venue = $10,
                meeting_link = $11,
                capacity = $12,
                registration_deadline = $13,
                visibility = $14,
                rsvp_enabled = $15,
                event_image = $16,
                updated_at = NOW()

            WHERE event_id = $17

            RETURNING *
        `, [

            data.title ??
                existingEvent.title,

            data.description ??
                existingEvent.description,

            data.event_type ??
                existingEvent.event_type,

            data.status ??
                existingEvent.status,

            data.start_date ??
                existingEvent.start_date,

            data.start_time ??
                existingEvent.start_time,

            data.end_date !== undefined
                ? data.end_date
                : existingEvent.end_date,

            data.end_time !== undefined
                ? data.end_time
                : existingEvent.end_time,

            data.event_mode ??
                existingEvent.event_mode,

            data.venue !== undefined
                ? data.venue
                : existingEvent.venue,

            data.meeting_link !== undefined
                ? data.meeting_link
                : existingEvent.meeting_link,

            data.capacity !== undefined
                ? data.capacity
                : existingEvent.capacity,

            data.registration_deadline !== undefined
                ? data.registration_deadline
                : existingEvent.registration_deadline,

            data.visibility ??
                existingEvent.visibility,

            data.rsvp_enabled !== undefined
                ? data.rsvp_enabled
                : existingEvent.rsvp_enabled,

            data.event_image !== undefined
                ? data.event_image
                : existingEvent.event_image,

            eventId

        ]);


        return result.rows[0];

    },


    // DELETE EVENT

    async deleteEvent(eventId) {

        const result = await pool.query(`
            DELETE FROM events

            WHERE event_id = $1

            RETURNING
                event_id,
                title
        `, [eventId]);


        if (result.rows.length === 0) {

            throw new Error(
                "Event not found."
            );

        }


        return result.rows[0];

    }


};


module.exports = EventService;