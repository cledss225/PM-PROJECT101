const pool = require("../config/db");


const Search = {


    async searchAll(keyword, roleId) {

        const searchTerm =
            `%${keyword}%`;


        const results = [];


        /* =====================================================
           1. ALUMNI RECORDS
           ADMIN • OFFICE • ALUMNI
        ===================================================== */

        const alumniResult =
            await pool.query(
                `
                SELECT
                    u.user_id,
                    u.first_name,
                    u.middle_name,
                    u.last_name,
                    u.email,

                    a.student_number,
                    a.program,
                    a.batch_year,
                    a.current_job,
                    a.company

                FROM users u

                INNER JOIN alumni_profiles a
                    ON u.user_id = a.user_id

                WHERE
                    CONCAT_WS(
                        ' ',
                        u.first_name,
                        u.middle_name,
                        u.last_name
                    ) ILIKE $1

                    OR u.email ILIKE $1

                    OR COALESCE(
                        a.student_number,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        a.program,
                        ''
                    ) ILIKE $1

                    OR CAST(
                        a.batch_year AS TEXT
                    ) ILIKE $1

                    OR COALESCE(
                        a.current_job,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        a.company,
                        ''
                    ) ILIKE $1

                ORDER BY
                    u.first_name ASC,
                    u.last_name ASC

                LIMIT 8
                `,
                [searchTerm]
            );


        alumniResult.rows.forEach(
            alumni => {

                const fullName =
                    [
                        alumni.first_name,
                        alumni.middle_name,
                        alumni.last_name
                    ]
                        .filter(Boolean)
                        .join(" ");


                let section =
                    "Alumni Directory";


                let url =
                    "alumni-directory.html";


                /*
                 * Role 3 = Alumni Office
                 *
                 * If your actual Office page filename
                 * is different, change only this URL.
                 */

                if (roleId === 3) {

                    section =
                        "Alumni Records";

                    url =
                        "alumni-records.html";

                }


                results.push({

                    section,

                    type:
                        "alumni",

                    title:
                        fullName,

                    description:
                        [
                            alumni.program,
                            alumni.batch_year
                                ? `Batch ${alumni.batch_year}`
                                : null,
                            alumni.current_job,
                            alumni.company
                        ]
                            .filter(Boolean)
                            .join(" • "),

                    url:
                        `${url}?search=${encodeURIComponent(
                            fullName
                        )}`,

                    icon:
                        "bx-group"

                });

            }
        );


        /* =====================================================
           2. ACCOUNT APPROVALS
           ADMIN ONLY
        ===================================================== */

        if (roleId === 1) {

            const approvalResult =
                await pool.query(
                    `
                    SELECT
                        user_id,
                        first_name,
                        middle_name,
                        last_name,
                        email,
                        created_at

                    FROM users

                    WHERE is_verified = false

                    AND
                    (
                        CONCAT_WS(
                            ' ',
                            first_name,
                            middle_name,
                            last_name
                        ) ILIKE $1

                        OR email ILIKE $1
                    )

                    ORDER BY
                        created_at DESC

                    LIMIT 6
                    `,
                    [searchTerm]
                );


            approvalResult.rows.forEach(
                user => {

                    const fullName =
                        [
                            user.first_name,
                            user.middle_name,
                            user.last_name
                        ]
                            .filter(Boolean)
                            .join(" ");


                    results.push({

                        section:
                            "Account Approvals",

                        type:
                            "approval",

                        title:
                            fullName,

                        description:
                            `${user.email} • Pending verification`,

                        url:
                            `account-approvals.html?search=${encodeURIComponent(
                                fullName
                            )}`,

                        icon:
                            "bx-user-check"

                    });

                }
            );

        }


        /* =====================================================
           3. EVENTS
           ADMIN • OFFICE • ALUMNI
        ===================================================== */

        const eventResult =
            await pool.query(
                `
                SELECT
                    event_id,
                    title,
                    description,
                    event_type,
                    status,
                    start_date,
                    start_time,
                    event_mode,
                    venue,
                    visibility,
                    created_at

                FROM events

                WHERE
                    COALESCE(
                        title,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        description,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        event_type,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        status,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        event_mode,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        venue,
                        ''
                    ) ILIKE $1

                ORDER BY
                    created_at DESC

                LIMIT 6
                `,
                [searchTerm]
            );


        eventResult.rows.forEach(
            event => {

                results.push({

                    section:
                        "Events",

                    type:
                        "event",

                    title:
                        event.title ||
                        "Alumni Event",

                    description:
                        [
                            event.event_type,
                            event.venue,
                            event.event_mode,
                            event.status
                        ]
                            .filter(Boolean)
                            .join(" • ") ||
                        event.description ||
                        "Alumni event",

                    url:
                        `events.html?search=${encodeURIComponent(
                            event.title ||
                            keyword
                        )}`,

                    icon:
                        "bx-calendar-event"

                });

            }
        );


        /* =====================================================
           4. JOB OPPORTUNITIES
           ADMIN • OFFICE • ALUMNI
        ===================================================== */

        const jobResult =
            await pool.query(
                `
                SELECT
                    job_id,
                    title,
                    company_name,
                    employment_type,
                    location,
                    work_setup,
                    status,
                    description,
                    requirements,
                    contact_email,
                    created_at

                FROM jobs

                WHERE
                    COALESCE(
                        title,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        company_name,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        employment_type,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        location,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        work_setup,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        status,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        description,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        requirements,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        contact_email,
                        ''
                    ) ILIKE $1

                ORDER BY
                    created_at DESC

                LIMIT 6
                `,
                [searchTerm]
            );


        jobResult.rows.forEach(
            job => {

                results.push({

                    section:
                        "Job Opportunities",

                    type:
                        "job",

                    title:
                        job.title ||
                        "Job Opportunity",

                    description:
                        [
                            job.company_name,
                            job.location,
                            job.work_setup,
                            job.employment_type
                        ]
                            .filter(Boolean)
                            .join(" • ") ||
                        job.description ||
                        "Job opportunity",

                    url:
                        `jobs.html?search=${encodeURIComponent(
                            job.title ||
                            keyword
                        )}`,

                    icon:
                        "bx-briefcase"

                });

            }
        );


        /* =====================================================
           5. ANNOUNCEMENTS
           ADMIN • OFFICE • ALUMNI
        ===================================================== */

        const announcementResult =
            await pool.query(
                `
                SELECT
                    announcement_id,
                    title,
                    category,
                    priority,
                    target_audience,
                    target_value,
                    status,
                    publish_date,
                    expiry_date,
                    content,
                    created_at

                FROM announcements

                WHERE
                    COALESCE(
                        title,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        category,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        priority,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        target_audience,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        target_value,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        status,
                        ''
                    ) ILIKE $1

                    OR COALESCE(
                        content,
                        ''
                    ) ILIKE $1

                ORDER BY
                    created_at DESC

                LIMIT 6
                `,
                [searchTerm]
            );


        announcementResult.rows.forEach(
            announcement => {

                results.push({

                    section:
                        "Announcements",

                    type:
                        "announcement",

                    title:
                        announcement.title ||
                        "Announcement",

                    description:
                        [
                            announcement.category,
                            announcement.priority,
                            announcement.target_audience,
                            announcement.status
                        ]
                            .filter(Boolean)
                            .join(" • ") ||
                        (
                            announcement.content
                                ? announcement.content
                                    .substring(
                                        0,
                                        100
                                    )
                                : "AlumniHub announcement"
                        ),

                    url:
                        `announcements.html?search=${encodeURIComponent(
                            announcement.title ||
                            keyword
                        )}`,

                    icon:
                        "bx-volume-full"

                });

            }
        );


        /* =====================================================
           FINAL RESULT LIMIT
        ===================================================== */

        return results.slice(
            0,
            30
        );

    }


};


module.exports = Search;