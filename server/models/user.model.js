const pool = require("../config/db");


const User = {


    // ==========================================
    // FIND USER BY EMAIL
    // ==========================================

    async findByEmail(email) {

        const result = await pool.query(
            `
            SELECT *
            FROM users
            WHERE LOWER(email) = LOWER($1)
            `,
            [email]
        );

        return result.rows[0];
    },


    // ==========================================
    // FIND USER BY ID
    // SAFE USER DATA
    // ==========================================

    async findById(userId) {

        const result = await pool.query(
            `
            SELECT
                u.user_id,
                u.role_id,
                r.role_name,
                u.first_name,
                u.middle_name,
                u.last_name,
                u.email,
                u.profile_picture,
                u.is_verified,
                u.is_active,
                u.last_login,
                u.created_at,
                u.updated_at

            FROM users u

            LEFT JOIN roles r
                ON u.role_id = r.role_id

            WHERE u.user_id = $1
            `,
            [userId]
        );

        return result.rows[0];
    },


    // ==========================================
    // FIND USER WITH PASSWORD
    // ==========================================

    async findWithPasswordById(userId) {

        const result = await pool.query(
            `
            SELECT
                user_id,
                role_id,
                first_name,
                middle_name,
                last_name,
                email,
                password_hash,
                is_verified,
                is_active

            FROM users

            WHERE user_id = $1
            `,
            [userId]
        );

        return result.rows[0];
    },


    // ==========================================
    // CREATE USER
    // ==========================================

    async create(user) {

        const result = await pool.query(
            `
            INSERT INTO users
            (
                role_id,
                first_name,
                middle_name,
                last_name,
                email,
                password_hash
            )

            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
            )

            RETURNING
                user_id,
                role_id,
                first_name,
                middle_name,
                last_name,
                email,
                profile_picture,
                is_verified,
                is_active,
                created_at
            `,
            [
                user.role_id,
                user.first_name,
                user.middle_name || null,
                user.last_name,
                user.email,
                user.password_hash
            ]
        );

        return result.rows[0];
    },


    // ==========================================
    // VERIFY USER
    // ==========================================

    async verifyUser(
        userId
    ) {

        const result =
            await pool.query(
                `
                UPDATE users

                SET
                    is_verified = true,
                    updated_at = CURRENT_TIMESTAMP

                WHERE user_id = $1

                RETURNING
                    user_id,
                    is_verified,
                    updated_at
                `,
                [
                    userId
                ]
            );


        return result.rows[0];

    },


    // ==========================================
    // UPDATE OWN ACCOUNT INFORMATION
    // ==========================================

    async updateAccount(userId, data) {

        const result = await pool.query(
            `
            UPDATE users

            SET
                first_name = $1,
                middle_name = $2,
                last_name = $3,
                email = $4,
                updated_at = CURRENT_TIMESTAMP

            WHERE user_id = $5

            RETURNING
                user_id,
                role_id,
                first_name,
                middle_name,
                last_name,
                email,
                profile_picture,
                is_verified,
                is_active,
                updated_at
            `,
            [
                data.first_name,
                data.middle_name || null,
                data.last_name,
                data.email,
                userId
            ]
        );

        return result.rows[0];
    },


    // ==========================================
    // UPDATE PROFILE PICTURE
    // ==========================================

    async updateProfilePicture(
        userId,
        profilePicture
    ) {

        const result = await pool.query(
            `
            UPDATE users

            SET
                profile_picture = $1,
                updated_at = CURRENT_TIMESTAMP

            WHERE user_id = $2

            RETURNING
                user_id,
                profile_picture,
                updated_at
            `,
            [
                profilePicture,
                userId
            ]
        );


        return result.rows[0];

    },


    // ==========================================
    // UPDATE PASSWORD
    // ==========================================

    async updatePassword(
        userId,
        passwordHash
    ) {

        const result = await pool.query(
            `
            UPDATE users

            SET
                password_hash = $1,
                updated_at = CURRENT_TIMESTAMP

            WHERE user_id = $2

            RETURNING
                user_id,
                updated_at
            `,
            [
                passwordHash,
                userId
            ]
        );

        return result.rows[0];
    }


};


module.exports =
    User;