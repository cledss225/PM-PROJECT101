const pool =
    require("../config/db");


const SmsVerification = {


    async invalidateActiveCodes(
        userId
    ) {

        await pool.query(
            `
            UPDATE sms_verification_codes

            SET
                used_at = CURRENT_TIMESTAMP

            WHERE
                user_id = $1
                AND used_at IS NULL
            `,
            [userId]
        );

    },


    async createCode(
        userId,
        phoneNumber,
        codeHash,
        expiresAt
    ) {

        const result =
            await pool.query(
                `
                INSERT INTO sms_verification_codes
                (
                    user_id,
                    phone_number,
                    code_hash,
                    expires_at
                )

                VALUES (
                    $1,
                    $2,
                    $3,
                    $4
                )

                RETURNING
                    verification_id,
                    user_id,
                    phone_number,
                    expires_at,
                    created_at
                `,
                [
                    userId,
                    phoneNumber,
                    codeHash,
                    expiresAt
                ]
            );


        return result.rows[0];

    },


    async findLatestActiveCode(
        userId
    ) {

        const result =
            await pool.query(
                `
                SELECT
                    verification_id,
                    user_id,
                    phone_number,
                    code_hash,
                    expires_at,
                    used_at,
                    attempt_count,
                    created_at

                FROM sms_verification_codes

                WHERE
                    user_id = $1
                    AND used_at IS NULL

                ORDER BY
                    created_at DESC

                LIMIT 1
                `,
                [userId]
            );


        return result.rows[0];

    },


    async incrementAttemptCount(
        verificationId
    ) {

        const result =
            await pool.query(
                `
                UPDATE sms_verification_codes

                SET
                    attempt_count =
                        attempt_count + 1

                WHERE
                    verification_id = $1

                RETURNING
                    attempt_count
                `,
                [verificationId]
            );


        return result.rows[0];

    },


    async markUsed(
        verificationId
    ) {

        const result =
            await pool.query(
                `
                UPDATE sms_verification_codes

                SET
                    used_at =
                        CURRENT_TIMESTAMP

                WHERE
                    verification_id = $1

                RETURNING
                    verification_id,
                    used_at
                `,
                [verificationId]
            );


        return result.rows[0];

    }


};


module.exports =
    SmsVerification;