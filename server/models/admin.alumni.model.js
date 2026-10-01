const pool = require("../config/db");

const AdminAlumni = {

    // =====================================
    // CREATE ALUMNI
    // =====================================

    async create(data, client) {

        const userResult = await client.query(

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

            VALUES
            ($1,$2,$3,$4,$5,$6)

            RETURNING user_id,
            first_name,
            last_name,
            email
            `,

            [
                2,
                data.first_name,
                data.middle_name,
                data.last_name,
                data.email,
                data.password_hash
            ]

        );

        const user = userResult.rows[0];

        const profileResult = await client.query(

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
            ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)

            RETURNING *

            `,

            [
                user.user_id,
                data.student_number,
                data.program,
                data.batch_year,
                data.birth_date,
                data.gender,
                data.phone_number,
                data.address,
                data.current_job,
                data.company,
                data.linkedin_url
            ]

        );

        return {

            user,

            profile: profileResult.rows[0]

        };

    },



    // =====================================
    // UPDATE ALUMNI PROFILE
    // =====================================

    async update(user_id, data){

        const result = await pool.query(

            `
            UPDATE alumni_profiles

            SET

            student_number=$1,

            program=$2,

            batch_year=$3,

            current_job=$4,

            company=$5,

            updated_at=CURRENT_TIMESTAMP

            WHERE user_id=$6

            RETURNING *

            `,

            [

                data.student_number,

                data.program,

                data.batch_year,

                data.current_job,

                data.company,

                user_id

            ]

        );

        return result.rows[0];

    },



    // =====================================
    // DELETE ALUMNI
    // =====================================

    async delete(user_id){

        const client = await pool.connect();

        try{

            await client.query("BEGIN");

            const profile = await client.query(

                `
                DELETE FROM alumni_profiles
                WHERE user_id=$1
                RETURNING *
                `,

                [user_id]

            );

            if(profile.rows.length===0){

                await client.query("ROLLBACK");

                return null;

            }

            await client.query(

                `
                DELETE FROM users
                WHERE user_id=$1
                `,

                [user_id]

            );

            await client.query("COMMIT");

            return true;

        }catch(error){

            await client.query("ROLLBACK");

            throw error;

        }finally{

            client.release();

        }

    }

};

module.exports = AdminAlumni;