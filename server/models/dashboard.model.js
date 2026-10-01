const pool = require("../config/db");


const Dashboard = {


    // ==========================================
    // DASHBOARD STATS
    // ==========================================

    async getStats() {

        const result = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM users)
                    AS total_users,

                (SELECT COUNT(*) FROM alumni_profiles)
                    AS total_alumni,

                (
                    SELECT COUNT(*)
                    FROM users
                    WHERE is_verified = true
                )
                    AS verified_alumni,

                (
                    SELECT COUNT(*)
                    FROM alumni_profiles
                    WHERE current_job IS NOT NULL
                      AND current_job <> ''
                )
                    AS employed_alumni
        `);

        return result.rows[0];

    },


    // ==========================================
    // ALUMNI BY BATCH
    // ==========================================

    async getBatchStatistics() {

        const result = await pool.query(`
            SELECT
                batch_year,
                COUNT(*) AS total

            FROM alumni_profiles

            WHERE batch_year IS NOT NULL

            GROUP BY batch_year

            ORDER BY batch_year ASC
        `);

        return result.rows;

    },


    // ==========================================
    // EMPLOYMENT STATISTICS
    // ==========================================

    async getEmploymentStatistics() {

        const result = await pool.query(`
            SELECT

                COUNT(*) FILTER (
                    WHERE current_job IS NOT NULL
                      AND current_job <> ''
                ) AS employed,

                COUNT(*) FILTER (
                    WHERE current_job IS NULL
                       OR current_job = ''
                ) AS unemployed

            FROM alumni_profiles
        `);

        return result.rows[0];

    },


    // ==========================================
    // RECENT REGISTRATIONS
    // ==========================================

    async getRecentRegistrations() {

        const result = await pool.query(`
            SELECT
                u.first_name,
                u.last_name,
                u.email,
                u.is_verified,
                u.created_at

            FROM users u

            ORDER BY u.created_at DESC

            LIMIT 5
        `);

        return result.rows;

    },


    // ==========================================
    // RECENT ACTIVITY
    //
    // range:
    // today
    // yesterday
    // week
    // ==========================================

    async getRecentActivity(range = "today") {

        let startDate;
        let endDate;


        switch (range) {

            case "yesterday":

                startDate = `
                    CURRENT_DATE - INTERVAL '1 day'
                `;

                endDate = `
                    CURRENT_DATE
                `;

                break;


            case "week":

                startDate = `
                    date_trunc(
                        'week',
                        CURRENT_TIMESTAMP
                    )
                `;

                endDate = `
                    date_trunc(
                        'week',
                        CURRENT_TIMESTAMP
                    ) + INTERVAL '7 days'
                `;

                break;


            case "today":

            default:

                startDate = `
                    CURRENT_DATE
                `;

                endDate = `
                    CURRENT_DATE + INTERVAL '1 day'
                `;

                break;

        }


        const result = await pool.query(`
            SELECT
                activity_type,
                title,
                description,
                activity_date,
                reference_id

            FROM (

                /* ==================================
                   NEW USER REGISTRATION
                ================================== */

                SELECT
                    'registration'
                        AS activity_type,

                    'New registration'
                        AS title,

                    CONCAT(
                        u.first_name,
                        ' ',
                        u.last_name,
                        ' submitted an alumni account.'
                    )
                        AS description,

                    u.created_at
                        AS activity_date,

                    u.user_id
                        AS reference_id

                FROM users u

                WHERE
                    u.created_at >= ${startDate}

                    AND u.created_at < ${endDate}



                UNION ALL



                /* ==================================
                   ACCOUNT APPROVED
                ================================== */

                SELECT
                    'approval'
                        AS activity_type,

                    'Account approved'
                        AS title,

                    CONCAT(
                        u.first_name,
                        ' ',
                        u.last_name,
                        '''s alumni account became active.'
                    )
                        AS description,

                    u.updated_at
                        AS activity_date,

                    u.user_id
                        AS reference_id

                FROM users u

                WHERE
                    u.is_verified = true

                    AND u.updated_at IS NOT NULL

                    AND u.updated_at >
                        u.created_at

                    AND u.updated_at >= ${startDate}

                    AND u.updated_at < ${endDate}



                UNION ALL



                /* ==================================
                   NEW EVENT
                ================================== */

                SELECT
                    'event'
                        AS activity_type,

                    'New event added'
                        AS title,

                    CONCAT(
                        'The event "',
                        e.title,
                        '" was published.'
                    )
                        AS description,

                    e.created_at
                        AS activity_date,

                    e.event_id
                        AS reference_id

                FROM events e

                WHERE
                    e.created_at >= ${startDate}

                    AND e.created_at < ${endDate}



                UNION ALL



                /* ==================================
                   ALUMNI PROFILE UPDATE
                ================================== */

                SELECT
                    'profile'
                        AS activity_type,

                    'Profile updated'
                        AS title,

                    CONCAT(
                        u.first_name,
                        ' ',
                        u.last_name,
                        '''s alumni profile was updated.'
                    )
                        AS description,

                    ap.updated_at
                        AS activity_date,

                    ap.profile_id
                        AS reference_id

                FROM alumni_profiles ap

                INNER JOIN users u
                    ON ap.user_id = u.user_id

                WHERE
                    ap.updated_at IS NOT NULL

                    AND ap.updated_at >
                        ap.created_at

                    AND ap.updated_at >= ${startDate}

                    AND ap.updated_at < ${endDate}

            ) AS dashboard_activity

            ORDER BY
                activity_date DESC

            LIMIT 20
        `);


        return result.rows;

    }


};


module.exports = Dashboard;