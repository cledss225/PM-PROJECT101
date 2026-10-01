const pool = require("../config/db");

const Alumni = {

    async create(profile) {
        const result = await pool.query(
            `
            INSERT INTO alumni_profiles
            (
                user_id,
                student_number,
                program,
                batch_year,
                birth_date,
                gender,
                phone_number,
                address,
                current_job,
                company,
                linkedin_url
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,
                $7,$8,$9,$10,$11
            )
            RETURNING *
            `,
            [
                profile.user_id,
                profile.student_number || null,
                profile.program || null,
                profile.batch_year || null,
                profile.birth_date || null,
                profile.gender || null,
                profile.phone_number || null,
                profile.address || null,
                profile.current_job || null,
                profile.company || null,
                profile.linkedin_url || null
            ]
        );

        return result.rows[0];
    },

    async upsertRegistrationPhone(userId, phoneNumber) {
        const result = await pool.query(
            `
            INSERT INTO alumni_profiles
            (
                user_id,
                phone_number
            )
            VALUES
            (
                $1,
                $2
            )
            ON CONFLICT (user_id)
            DO UPDATE SET
                phone_number = EXCLUDED.phone_number,
                updated_at = CURRENT_TIMESTAMP
            RETURNING
                profile_id,
                user_id,
                phone_number,
                created_at,
                updated_at
            `,
            [userId, phoneNumber]
        );

        return result.rows[0];
    },

    async findByUserId(user_id) {
        const result = await pool.query(
            `
            SELECT *
            FROM alumni_profiles
            WHERE user_id = $1
            `,
            [user_id]
        );

        return result.rows[0];
    },

    async findAll(options = {}) {
        const page = Math.max(Number(options.page) || 1, 1);
        const limit = Math.min(
            Math.max(Number(options.limit) || 20, 1),
            100
        );
        const offset = (page - 1) * limit;

        const search = String(options.search || "").trim();
        const program = String(options.program || "").trim();
        const batch = String(options.batch || "").trim();
        const verification = String(options.verification || "")
            .trim()
            .toLowerCase();
        const sort = String(options.sort || "name")
            .trim()
            .toLowerCase();

        const conditions = [];
        const values = [];
        let searchCte = "";

        // Build search candidates per indexed column first. This avoids the
        // previous cross-table OR join filter that scanned/joined the full
        // directory for selective searches.
        if (search) {
            values.push(`%${search}%`);
            const parameter = `$${values.length}`;

            const candidateQueries = [
                `SELECT user_id FROM users WHERE first_name ILIKE ${parameter}`,
                `SELECT user_id FROM users WHERE middle_name ILIKE ${parameter}`,
                `SELECT user_id FROM users WHERE last_name ILIKE ${parameter}`,
                `SELECT user_id FROM users WHERE email ILIKE ${parameter}`,
                `SELECT user_id FROM alumni_profiles WHERE student_number ILIKE ${parameter}`,
                `SELECT user_id FROM alumni_profiles WHERE program ILIKE ${parameter}`,
                `SELECT user_id FROM alumni_profiles WHERE current_job ILIKE ${parameter}`,
                `SELECT user_id FROM alumni_profiles WHERE company ILIKE ${parameter}`
            ];

            // batch_year is an integer. A non-numeric search can never match
            // its text representation, so only include this branch when the
            // search itself is numeric. This preserves the old substring
            // behavior for searches such as 202 or 2026.
            if (/^\d+$/.test(search)) {
                candidateQueries.push(
                    `SELECT user_id FROM alumni_profiles WHERE CAST(batch_year AS TEXT) ILIKE ${parameter}`
                );
            }

            searchCte = `
                WITH search_candidates AS (
                    ${candidateQueries.join("\n                    UNION\n                    ")}
                )
            `;

            conditions.push(
                "u.user_id IN (SELECT user_id FROM search_candidates)"
            );
        }

        if (program) {
            values.push(program);
            conditions.push(`a.program = $${values.length}`);
        }

        if (batch) {
            values.push(batch);
            conditions.push(`CAST(a.batch_year AS TEXT) = $${values.length}`);
        }

        if (verification === "verified") {
            conditions.push("u.is_verified = true");
        }

        if (
            verification === "pending" ||
            verification === "unverified"
        ) {
            conditions.push("u.is_verified = false");
        }

        conditions.push("u.is_active = true");

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const sortMap = {
            name: "u.first_name ASC, u.last_name ASC, u.user_id ASC",
            "batch-newest":
                "a.batch_year DESC NULLS LAST, u.user_id ASC",
            "batch-oldest":
                "a.batch_year ASC NULLS LAST, u.user_id ASC",
            program:
                "a.program ASC NULLS LAST, u.first_name ASC, u.last_name ASC, u.user_id ASC"
        };

        const orderBy = sortMap[sort] || sortMap.name;

        // Keep the previously better-performing two-query approach.
        // Count and page data execute concurrently instead of COUNT(*) OVER().
        const countQuery = pool.query(
            `
            ${searchCte}
            SELECT COUNT(*)::int AS total
            FROM users u
            INNER JOIN alumni_profiles a
                ON u.user_id = a.user_id
            ${whereClause}
            `,
            values
        );

        const dataValues = [...values, limit, offset];
        const limitParameter = `$${values.length + 1}`;
        const offsetParameter = `$${values.length + 2}`;

        const dataQuery = pool.query(
            `
            ${searchCte}
            SELECT
                u.user_id,
                u.first_name,
                u.middle_name,
                u.last_name,
                u.email,
                u.is_verified,
                u.is_active,
                a.profile_id,
                a.student_number,
                a.program,
                a.batch_year,
                a.current_job,
                a.company,
                a.phone_number
            FROM users u
            INNER JOIN alumni_profiles a
                ON u.user_id = a.user_id
            ${whereClause}
            ORDER BY ${orderBy}
            LIMIT ${limitParameter}
            OFFSET ${offsetParameter}
            `,
            dataValues
        );

        const [countResult, alumniResult] = await Promise.all([
            countQuery,
            dataQuery
        ]);

        const total = Number(countResult.rows[0]?.total) || 0;

        return {
            alumni: alumniResult.rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    },


    async getDirectoryMeta() {

        const [
            summaryResult,
            programsResult,
            batchesResult
        ] = await Promise.all([

            pool.query(
                `
                SELECT
                    COUNT(*)::int AS total,

                    COUNT(*) FILTER (
                        WHERE u.is_verified = true
                    )::int AS verified,

                    COUNT(*) FILTER (
                        WHERE
                            NULLIF(
                                BTRIM(
                                    COALESCE(
                                        a.current_job,
                                        ''
                                    )
                                ),
                                ''
                            ) IS NOT NULL

                            OR

                            NULLIF(
                                BTRIM(
                                    COALESCE(
                                        a.company,
                                        ''
                                    )
                                ),
                                ''
                            ) IS NOT NULL
                    )::int AS employed

                FROM users u

                INNER JOIN alumni_profiles a
                    ON u.user_id = a.user_id

                WHERE u.is_active = true
                `
            ),


            pool.query(
                `
                SELECT DISTINCT
                    BTRIM(a.program) AS program

                FROM users u

                INNER JOIN alumni_profiles a
                    ON u.user_id = a.user_id

                WHERE
                    u.is_active = true
                    AND a.program IS NOT NULL
                    AND BTRIM(a.program) <> ''

                ORDER BY
                    program ASC
                `
            ),


            pool.query(
                `
                SELECT DISTINCT
                    a.batch_year

                FROM users u

                INNER JOIN alumni_profiles a
                    ON u.user_id = a.user_id

                WHERE
                    u.is_active = true
                    AND a.batch_year IS NOT NULL

                ORDER BY
                    a.batch_year DESC
                `
            )

        ]);


        const summaryRow =
            summaryResult.rows[0] || {};


        return {

            summary: {

                total:
                    Number(summaryRow.total) || 0,

                verified:
                    Number(summaryRow.verified) || 0,

                employed:
                    Number(summaryRow.employed) || 0

            },

            filters: {

                programs:
                    programsResult.rows
                        .map(row => row.program)
                        .filter(Boolean),

                batches:
                    batchesResult.rows
                        .map(row => row.batch_year)
                        .filter(
                            value =>
                                value !== null &&
                                value !== undefined
                        )

            }

        };

    },


    async update(user_id, profile) {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const userResult = await client.query(
                `
                UPDATE users
                SET
                    first_name = $1,
                    middle_name = $2,
                    last_name = $3,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $4
                RETURNING
                    user_id,
                    first_name,
                    middle_name,
                    last_name,
                    email,
                    is_verified,
                    is_active,
                    updated_at
                `,
                [
                    profile.first_name,
                    profile.middle_name || null,
                    profile.last_name,
                    user_id
                ]
            );

            if (userResult.rows.length === 0) {
                throw new Error("User account not found.");
            }

            const profileResult = await client.query(
                `
                UPDATE alumni_profiles
                SET
                    student_number = $1,
                    program = $2,
                    batch_year = $3,
                    birth_date = $4,
                    gender = $5,
                    phone_number = $6,
                    address = $7,
                    current_job = $8,
                    company = $9,
                    linkedin_url = $10,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $11
                RETURNING *
                `,
                [
                    profile.student_number,
                    profile.program,
                    profile.batch_year,
                    profile.birth_date,
                    profile.gender,
                    profile.phone_number,
                    profile.address,
                    profile.current_job,
                    profile.company,
                    profile.linkedin_url,
                    user_id
                ]
            );

            if (profileResult.rows.length === 0) {
                throw new Error("Alumni profile not found.");
            }

            await client.query("COMMIT");

            return {
                ...profileResult.rows[0],
                first_name: userResult.rows[0].first_name,
                middle_name: userResult.rows[0].middle_name,
                last_name: userResult.rows[0].last_name,
                email: userResult.rows[0].email,
                is_verified: userResult.rows[0].is_verified,
                is_active: userResult.rows[0].is_active
            };

        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    },

    async delete(user_id) {
        await pool.query(
            `
            DELETE FROM alumni_profiles
            WHERE user_id = $1
            `,
            [user_id]
        );
    }
};

module.exports = Alumni;
