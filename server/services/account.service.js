const pool = require("../config/db");


const AccountService = {


    // GET ALL PENDING ALUMNI ACCOUNTS

    async getPendingAccounts() {

        const result = await pool.query(`
            SELECT
                u.user_id,
                u.first_name,
                u.middle_name,
                u.last_name,
                u.email,
                u.profile_picture,
                u.is_verified,
                u.is_active,
                u.created_at,

                r.role_name,

                ap.student_number,
                ap.program,
                ap.batch_year,
                ap.birth_date,
                ap.gender,
                ap.phone_number,
                ap.address,
                ap.current_job,
                ap.company,
                ap.linkedin_url

            FROM users u

            JOIN roles r
                ON u.role_id = r.role_id

            LEFT JOIN alumni_profiles ap
                ON u.user_id = ap.user_id

            WHERE u.is_verified = FALSE
              AND r.role_name = 'Alumni'

            ORDER BY u.created_at DESC
        `);


        return result.rows;

    },


    // GET ONE ACCOUNT

    async getAccountById(userId) {

        const result = await pool.query(`
            SELECT
                u.user_id,
                u.first_name,
                u.middle_name,
                u.last_name,
                u.email,
                u.profile_picture,
                u.is_verified,
                u.is_active,
                u.created_at,
                u.updated_at,

                r.role_name,

                ap.student_number,
                ap.program,
                ap.batch_year,
                ap.birth_date,
                ap.gender,
                ap.phone_number,
                ap.address,
                ap.current_job,
                ap.company,
                ap.linkedin_url

            FROM users u

            JOIN roles r
                ON u.role_id = r.role_id

            LEFT JOIN alumni_profiles ap
                ON u.user_id = ap.user_id

            WHERE u.user_id = $1
        `, [userId]);


        if (result.rows.length === 0) {

            throw new Error(
                "Account not found."
            );

        }


        return result.rows[0];

    },


    // APPROVE ALUMNI ACCOUNT

    async approveAccount(userId, approvedBy) {

        const client = await pool.connect();


        try {

            await client.query("BEGIN");


            const accountResult = await client.query(`
                SELECT
                    u.user_id,
                    u.is_verified,
                    u.is_active,
                    r.role_name

                FROM users u

                JOIN roles r
                    ON u.role_id = r.role_id

                WHERE u.user_id = $1

                FOR UPDATE
            `, [userId]);


            if (accountResult.rows.length === 0) {

                throw new Error(
                    "Account not found."
                );

            }


            const account =
                accountResult.rows[0];


            if (account.role_name !== "Alumni") {

                throw new Error(
                    "Only alumni accounts can be approved."
                );

            }


            if (account.is_verified === true) {

                throw new Error(
                    "Account is already verified."
                );

            }


            const updateResult =
                await client.query(`
                    UPDATE users

                    SET
                        is_verified = TRUE,
                        is_active = TRUE,
                        updated_at = NOW()

                    WHERE user_id = $1

                    RETURNING
                        user_id,
                        first_name,
                        middle_name,
                        last_name,
                        email,
                        is_verified,
                        is_active,
                        updated_at
                `, [userId]);


            await client.query("COMMIT");


            return {

                account:
                    updateResult.rows[0],

                approved_by:
                    approvedBy || null

            };

        } catch (error) {

            await client.query("ROLLBACK");

            throw error;

        } finally {

            client.release();

        }

    },


    // REJECT ALUMNI ACCOUNT

    async rejectAccount(
        userId,
        rejectionReason,
        rejectedBy
    ) {

        const client = await pool.connect();


        try {

            await client.query("BEGIN");


            const accountResult = await client.query(`
                SELECT
                    u.user_id,
                    u.is_verified,
                    u.is_active,
                    r.role_name

                FROM users u

                JOIN roles r
                    ON u.role_id = r.role_id

                WHERE u.user_id = $1

                FOR UPDATE
            `, [userId]);


            if (accountResult.rows.length === 0) {

                throw new Error(
                    "Account not found."
                );

            }


            const account =
                accountResult.rows[0];


            if (account.role_name !== "Alumni") {

                throw new Error(
                    "Only alumni accounts can be rejected."
                );

            }


            const updateResult =
                await client.query(`
                    UPDATE users

                    SET
                        is_verified = FALSE,
                        is_active = FALSE,
                        updated_at = NOW()

                    WHERE user_id = $1

                    RETURNING
                        user_id,
                        first_name,
                        middle_name,
                        last_name,
                        email,
                        is_verified,
                        is_active,
                        updated_at
                `, [userId]);


            await client.query("COMMIT");


            return {

                account:
                    updateResult.rows[0],

                rejection_reason:
                    rejectionReason ||
                    "No reason provided.",

                rejected_by:
                    rejectedBy || null

            };

        } catch (error) {

            await client.query("ROLLBACK");

            throw error;

        } finally {

            client.release();

        }

    },
    // GET ALL ALUMNI VERIFICATION RECORDS
// OFFICE MONITORING

async getVerificationRecords() {

    const result = await pool.query(`
        SELECT
            u.user_id,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.email,
            u.profile_picture,
            u.is_verified,
            u.is_active,
            u.created_at,
            u.updated_at,

            r.role_name,

            ap.student_number,
            ap.program,
            ap.batch_year,
            ap.birth_date,
            ap.gender,
            ap.phone_number,
            ap.address,
            ap.current_job,
            ap.company,
            ap.linkedin_url,

            CASE
                WHEN u.is_verified = TRUE
                     AND u.is_active = TRUE
                    THEN 'verified'

                WHEN u.is_verified = FALSE
                     AND u.is_active = FALSE
                    THEN 'rejected'

                ELSE 'pending'
            END AS verification_status

        FROM users u

        JOIN roles r
            ON u.role_id = r.role_id

        LEFT JOIN alumni_profiles ap
            ON u.user_id = ap.user_id

        WHERE r.role_name = 'Alumni'

        ORDER BY u.created_at DESC
    `);

    return result.rows;

},
};


module.exports = AccountService;