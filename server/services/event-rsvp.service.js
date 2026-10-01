const pool = require("../config/db");


const EventRsvpService = {


    // ==========================================
    // RSVP / JOIN EVENT
    // ==========================================

    async rsvpEvent(eventId, userId) {

        const result = await pool.query(`
            INSERT INTO event_rsvps (
                event_id,
                user_id,
                status
            )

            VALUES (
                $1,
                $2,
                'going'
            )

            ON CONFLICT (event_id, user_id)

            DO UPDATE SET
                status = 'going',
                updated_at = NOW()

            RETURNING *
        `, [
            eventId,
            userId
        ]);


        return result.rows[0];

    },


    // ==========================================
    // CANCEL RSVP
    // ==========================================

    async cancelRsvp(eventId, userId) {

        const result = await pool.query(`
            UPDATE event_rsvps

            SET
                status = 'cancelled',
                updated_at = NOW()

            WHERE event_id = $1
              AND user_id = $2

            RETURNING *
        `, [
            eventId,
            userId
        ]);


        if (result.rows.length === 0) {

            throw new Error(
                "RSVP record not found."
            );

        }


        return result.rows[0];

    },


    // ==========================================
    // GET RSVP STATUS OF CURRENT ALUMNI
    // ==========================================

    async getUserRsvp(eventId, userId) {

        const result = await pool.query(`
            SELECT
                rsvp_id,
                event_id,
                user_id,
                status,
                created_at,
                updated_at

            FROM event_rsvps

            WHERE event_id = $1
              AND user_id = $2
        `, [
            eventId,
            userId
        ]);


        return result.rows[0] || null;

    },


    // ==========================================
    // GET ALL RSVPS OF CURRENT ALUMNI
    // ==========================================

    async getMyRsvps(userId) {

        const result = await pool.query(`
            SELECT
                er.rsvp_id,
                er.event_id,
                er.user_id,
                er.status AS rsvp_status,
                er.created_at AS rsvp_created_at,
                er.updated_at AS rsvp_updated_at,

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

            FROM event_rsvps er

            JOIN events e
                ON er.event_id = e.event_id

            WHERE er.user_id = $1
              AND er.status = 'going'

            ORDER BY
                e.start_date ASC,
                e.start_time ASC
        `, [
            userId
        ]);


        return result.rows;

    },


    // ==========================================
    // GET RSVP COUNT PER EVENT
    // ==========================================

    async getRsvpCount(eventId) {

        const result = await pool.query(`
            SELECT
                COUNT(*)::INTEGER AS rsvp_count

            FROM event_rsvps

            WHERE event_id = $1
              AND status = 'going'
        `, [
            eventId
        ]);


        return result.rows[0].rsvp_count;

    },


    // ==========================================
    // GET EVENT ATTENDEES
    // OFFICE / ADMIN
    // ==========================================

    async getEventAttendees(eventId) {

        const result = await pool.query(`
            SELECT
                er.rsvp_id,
                er.status,
                er.created_at,

                u.user_id,
                u.first_name,
                u.middle_name,
                u.last_name,
                u.email,

                ap.student_number,
                ap.program,
                ap.batch_year

            FROM event_rsvps er

            JOIN users u
                ON er.user_id = u.user_id

            LEFT JOIN alumni_profiles ap
                ON u.user_id = ap.user_id

            WHERE er.event_id = $1
              AND er.status = 'going'

            ORDER BY er.created_at DESC
        `, [
            eventId
        ]);


        return result.rows;

    }


};


module.exports = EventRsvpService;