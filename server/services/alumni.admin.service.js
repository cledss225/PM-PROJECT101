const bcrypt = require("bcrypt");
const pool = require("../config/db");

const AdminAlumni = require("../models/admin.alumni.model");


const AlumniAdminService = {

    // =====================================
    // CREATE ALUMNI
    // =====================================

    async createAlumni(data, currentUser){

        const client = await pool.connect();

        try{

            await client.query("BEGIN");


            // =====================================
            // VALIDATE CURRENT USER
            // =====================================

            if(!currentUser){

                throw new Error(
                    "Unable to identify the current user."
                );

            }


            const currentRoleId =
            Number(currentUser.role_id);


            if(
                currentRoleId !== 1 &&
                currentRoleId !== 3
            ){

                throw new Error(
                    "You are not allowed to create alumni records."
                );

            }


            // =====================================
            // REQUIRED FIELD VALIDATION
            // =====================================

            if(!data.first_name?.trim()){

                throw new Error(
                    "First name is required."
                );

            }


            if(!data.last_name?.trim()){

                throw new Error(
                    "Last name is required."
                );

            }


            if(!data.email?.trim()){

                throw new Error(
                    "Email address is required."
                );

            }


            if(!data.password){

                throw new Error(
                    "Temporary password is required."
                );

            }


            if(data.password.length < 8){

                throw new Error(
                    "Password must contain at least 8 characters."
                );

            }


            if(!data.student_number?.trim()){

                throw new Error(
                    "Student number is required."
                );

            }


            if(!data.program?.trim()){

                throw new Error(
                    "Program is required."
                );

            }


            if(!data.batch_year){

                throw new Error(
                    "Batch year is required."
                );

            }


            // =====================================
            // NORMALIZE INPUT DATA
            // =====================================

            const email =
            data.email.trim().toLowerCase();

            const studentNumber =
            data.student_number.trim();

            const batchYear =
            Number(data.batch_year);


            if(
                !Number.isInteger(batchYear) ||
                batchYear < 1950 ||
                batchYear > 2100
            ){

                throw new Error(
                    "Please enter a valid batch year."
                );

            }


            // =====================================
            // CHECK EXISTING EMAIL
            // =====================================

            const existingEmail =
            await client.query(

                `
                SELECT user_id
                FROM users
                WHERE LOWER(email) = LOWER($1)
                LIMIT 1
                `,

                [
                    email
                ]

            );


            if(existingEmail.rows.length > 0){

                throw new Error(
                    "Email already exists."
                );

            }


            // =====================================
            // CHECK EXISTING STUDENT NUMBER
            // =====================================

            const existingStudentNumber =
            await client.query(

                `
                SELECT profile_id
                FROM alumni_profiles
                WHERE LOWER(student_number) = LOWER($1)
                LIMIT 1
                `,

                [
                    studentNumber
                ]

            );


            if(existingStudentNumber.rows.length > 0){

                throw new Error(
                    "Student number already exists."
                );

            }


            // =====================================
            // HASH TEMPORARY PASSWORD
            // =====================================

            const hashedPassword =
            await bcrypt.hash(

                data.password,

                10

            );


            // =====================================
            // VERIFICATION PERMISSION
            // =====================================

            const isAdmin =
            currentRoleId === 1;


            const requestedImmediateVerification =
            data.verify_immediately === true ||
            data.verify_immediately === "true";


            const canVerifyImmediately =
            isAdmin &&
            requestedImmediateVerification;


            // =====================================
            // CREATE ACCOUNT AND ALUMNI PROFILE
            // =====================================

            const result =
            await AdminAlumni.create(

                {

                    ...data,

                    first_name:
                    data.first_name.trim(),

                    middle_name:
                    data.middle_name?.trim() || null,

                    last_name:
                    data.last_name.trim(),

                    email,

                    student_number:
                    studentNumber,

                    program:
                    data.program.trim(),

                    batch_year:
                    batchYear,

                    birth_date:
                    data.birth_date || null,

                    gender:
                    data.gender || null,

                    phone_number:
                    data.phone_number?.trim() || null,

                    address:
                    data.address?.trim() || null,

                    employment_status:
                    data.employment_status || null,

                    current_job:
                    data.current_job?.trim() || null,

                    company:
                    data.company?.trim() || null,

                    linkedin_url:
                    data.linkedin_url?.trim() || null,

                    password_hash:
                    hashedPassword,

                    role_id:
                    2,

                    is_verified:
                    canVerifyImmediately,

                    verification_status:
                    canVerifyImmediately
                        ? "verified"
                        : "pending",

                    is_active:
                    true,

                    verify_immediately:
                    canVerifyImmediately

                },

                client

            );


            await client.query("COMMIT");


            return result;

        }catch(error){

            await client.query("ROLLBACK");

            console.error(
                "CREATE ALUMNI SERVICE ERROR:",
                error
            );

            throw error;

        }finally{

            client.release();

        }

    }

};


module.exports = AlumniAdminService;