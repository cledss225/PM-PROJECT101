const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User =
    require("../models/user.model");

const EmailVerification =
    require("../models/email-verification.model");

const EmailService =
    require("./email.service");

const Alumni =
    require("../models/alumni.model");

const SmsVerification =
    require("../models/sms-verification.model");

const SmsService =
    require("./sms.service");


const AuthService = {


    async register(userData) {

        const normalizedEmail =
            String(
                userData.email || ""
            )
                .trim()
                .toLowerCase();


        const phoneNumber =
            String(
                userData.phone_number || ""
            )
                .trim();


        if (!normalizedEmail) {

            throw new Error(
                "Email is required."
            );

        }


        if (
            !/^09\d{9}$/.test(
                phoneNumber
            )
        ) {

            throw new Error(
                "A valid 11-digit Philippine mobile number is required."
            );

        }


        const existingUser =
            await User.findByEmail(
                normalizedEmail
            );


        // ==========================================
        // EXISTING ACCOUNT
        // ==========================================

        if (existingUser) {

            if (
                Number(existingUser.role_id) !== 2
            ) {

                throw new Error(
                    "This email is already registered to another account."
                );

            }


            if (
                existingUser.is_verified === true
            ) {

                const error =
                    new Error(
                        "This alumni account is already verified. Please sign in."
                    );

                error.code =
                    "ACCOUNT_ALREADY_VERIFIED";

                throw error;

            }


            const profile =
                await Alumni
                    .upsertRegistrationPhone(
                        existingUser.user_id,
                        phoneNumber
                    );


            return {

                user_id:
                    existingUser.user_id,

                role_id:
                    existingUser.role_id,

                first_name:
                    existingUser.first_name,

                middle_name:
                    existingUser.middle_name,

                last_name:
                    existingUser.last_name,

                email:
                    existingUser.email,

                phone_number:
                    profile.phone_number,

                profile_picture:
                    existingUser.profile_picture,

                is_verified:
                    existingUser.is_verified,

                is_active:
                    existingUser.is_active,

                existing_account:
                    true,

                pending_verification:
                    true

            };

        }


        // ==========================================
        // NEW ACCOUNT
        // ==========================================

        const hashedPassword =
            await bcrypt.hash(
                userData.password,
                10
            );


        const newUser =
            await User.create({

                role_id:
                    userData.role_id || 2,

                first_name:
                    userData.first_name,

                middle_name:
                    userData.middle_name,

                last_name:
                    userData.last_name,

                email:
                    normalizedEmail,

                password_hash:
                    hashedPassword

            });


        const profile =
            await Alumni
                .upsertRegistrationPhone(
                    newUser.user_id,
                    phoneNumber
                );


        return {

            ...newUser,

            phone_number:
                profile.phone_number,

            existing_account:
                false,

            pending_verification:
                true

        };

    },


    // ==========================================
    // SEND EMAIL VERIFICATION CODE
    // ==========================================

    async sendEmailVerificationCode(
        email
    ) {

        const normalizedEmail =
            String(
                email || ""
            )
                .trim()
                .toLowerCase();


        if (!normalizedEmail) {

            throw new Error(
                "Email is required."
            );

        }


        const user =
            await User.findByEmail(
                normalizedEmail
            );


        if (!user) {

            throw new Error(
                "No registered account was found for this email."
            );

        }


        if (
            Number(user.role_id) !== 2
        ) {

            throw new Error(
                "Email verification is only available for alumni accounts."
            );

        }


        if (
            user.is_verified === true
        ) {

            throw new Error(
                "This alumni account is already verified."
            );

        }


        const code =
            String(
                crypto.randomInt(
                    100000,
                    1000000
                )
            );


        const codeHash =
            crypto
                .createHash(
                    "sha256"
                )
                .update(
                    code
                )
                .digest(
                    "hex"
                );


        const expiresAt =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        await EmailVerification
            .invalidateActiveCodes(
                user.user_id
            );


        const verificationRecord =
            await EmailVerification
                .createCode(
                    user.user_id,
                    codeHash,
                    expiresAt
                );


        try {

            await EmailService
                .sendVerificationCode(
                    normalizedEmail,
                    code
                );


        } catch (error) {

    console.error(
        "NODEMAILER REAL ERROR:",
        error
    );


    await EmailVerification
        .markUsed(
            verificationRecord
                .verification_id
        );


    throw new Error(
        "Unable to send verification email. Please try again."
    );

}


        return {
            expires_at:
                expiresAt
        };

    },


    // ==========================================
    // VERIFY EMAIL VERIFICATION CODE
    // ==========================================

    async verifyEmailVerificationCode(
        email,
        code
    ) {

        const normalizedEmail =
            String(
                email || ""
            )
                .trim()
                .toLowerCase();


        const normalizedCode =
            String(
                code || ""
            )
                .trim();


        if (
            !normalizedEmail ||
            !/^\d{6}$/.test(
                normalizedCode
            )
        ) {

            throw new Error(
                "A valid email and 6-digit verification code are required."
            );

        }


        const user =
            await User.findByEmail(
                normalizedEmail
            );


        if (!user) {

            throw new Error(
                "Account not found."
            );

        }


        if (
            Number(user.role_id) !== 2
        ) {

            throw new Error(
                "Email verification is only available for alumni accounts."
            );

        }


        if (
            user.is_verified === true
        ) {

            return {
                user:
                    await User.findById(
                        user.user_id
                    )
            };

        }


        const record =
            await EmailVerification
                .findLatestActiveCode(
                    user.user_id
                );


        if (!record) {

            throw new Error(
                "No active verification code was found. Please request a new code."
            );

        }


        if (
            Number(
                record.attempt_count
            ) >= 5
        ) {

            await EmailVerification
                .markUsed(
                    record.verification_id
                );


            throw new Error(
                "Too many incorrect attempts. Please request a new code."
            );

        }


        if (
            new Date(
                record.expires_at
            ).getTime() <
            Date.now()
        ) {

            await EmailVerification
                .markUsed(
                    record.verification_id
                );


            throw new Error(
                "Verification code has expired. Please request a new code."
            );

        }


        const submittedHash =
            crypto
                .createHash(
                    "sha256"
                )
                .update(
                    normalizedCode
                )
                .digest(
                    "hex"
                );


        if (
            submittedHash !==
            record.code_hash
        ) {

            await EmailVerification
                .incrementAttemptCount(
                    record.verification_id
                );


            throw new Error(
                "Incorrect verification code."
            );

        }


        await EmailVerification
            .markUsed(
                record.verification_id
            );


        await User.verifyUser(
            user.user_id
        );


        return {
            user:
                await User.findById(
                    user.user_id
                )
        };

    },


    // ==========================================
    // SEND SMS VERIFICATION CODE
    // ==========================================

    async sendSmsVerificationCode(
        email
    ) {

        const normalizedEmail =
            String(
                email || ""
            )
                .trim()
                .toLowerCase();


        if (!normalizedEmail) {

            throw new Error(
                "Email is required."
            );

        }


        const user =
            await User.findByEmail(
                normalizedEmail
            );


        if (!user) {

            throw new Error(
                "No registered account was found for this email."
            );

        }


        if (
            Number(user.role_id) !== 2
        ) {

            throw new Error(
                "SMS verification is only available for alumni accounts."
            );

        }


        if (
            user.is_verified === true
        ) {

            throw new Error(
                "This alumni account is already verified."
            );

        }


        const profile =
            await Alumni.findByUserId(
                user.user_id
            );


        const phoneNumber =
            String(
                profile?.phone_number || ""
            )
                .trim();


        if (
            !/^09\d{9}$/.test(
                phoneNumber
            )
        ) {

            throw new Error(
                "No valid registered mobile number was found for this account."
            );

        }


        const code =
            String(
                crypto.randomInt(
                    100000,
                    1000000
                )
            );


        const codeHash =
            crypto
                .createHash(
                    "sha256"
                )
                .update(
                    code
                )
                .digest(
                    "hex"
                );


        const expiresAt =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        await SmsVerification
            .invalidateActiveCodes(
                user.user_id
            );


        const verificationRecord =
            await SmsVerification
                .createCode(
                    user.user_id,
                    phoneNumber,
                    codeHash,
                    expiresAt
                );


        try {

            await SmsService
                .sendVerificationCode(
                    phoneNumber,
                    code
                );


        } catch (error) {

            console.error(
                "SEMAPHORE REAL ERROR:",
                error
            );


            await SmsVerification
                .markUsed(
                    verificationRecord
                        .verification_id
                );


            throw new Error(
                error.message ||
                "Unable to send SMS OTP. Please try again."
            );

        }


        return {

            expires_at:
                expiresAt,

            masked_phone_number:
                `${phoneNumber.slice(0, 2)}******${phoneNumber.slice(-3)}`

        };

    },


    // ==========================================
    // VERIFY SMS VERIFICATION CODE
    // ==========================================

    async verifySmsVerificationCode(
        email,
        code
    ) {

        const normalizedEmail =
            String(
                email || ""
            )
                .trim()
                .toLowerCase();


        const normalizedCode =
            String(
                code || ""
            )
                .trim();


        if (
            !normalizedEmail ||
            !/^\d{6}$/.test(
                normalizedCode
            )
        ) {

            throw new Error(
                "A valid email and 6-digit SMS OTP are required."
            );

        }


        const user =
            await User.findByEmail(
                normalizedEmail
            );


        if (!user) {

            throw new Error(
                "Account not found."
            );

        }


        if (
            Number(user.role_id) !== 2
        ) {

            throw new Error(
                "SMS verification is only available for alumni accounts."
            );

        }


        if (
            user.is_verified === true
        ) {

            return {

                user:
                    await User.findById(
                        user.user_id
                    )

            };

        }


        const record =
            await SmsVerification
                .findLatestActiveCode(
                    user.user_id
                );


        if (!record) {

            throw new Error(
                "No active SMS OTP was found. Please request a new code."
            );

        }


        if (
            Number(
                record.attempt_count
            ) >= 5
        ) {

            await SmsVerification
                .markUsed(
                    record.verification_id
                );


            throw new Error(
                "Too many incorrect attempts. Please request a new SMS OTP."
            );

        }


        if (
            new Date(
                record.expires_at
            ).getTime() <
            Date.now()
        ) {

            await SmsVerification
                .markUsed(
                    record.verification_id
                );


            throw new Error(
                "SMS OTP has expired. Please request a new code."
            );

        }


        const submittedHash =
            crypto
                .createHash(
                    "sha256"
                )
                .update(
                    normalizedCode
                )
                .digest(
                    "hex"
                );


        if (
            submittedHash !==
            record.code_hash
        ) {

            await SmsVerification
                .incrementAttemptCount(
                    record.verification_id
                );


            throw new Error(
                "Incorrect SMS OTP."
            );

        }


        await SmsVerification
            .markUsed(
                record.verification_id
            );


        await User.verifyUser(
            user.user_id
        );


        return {

            user:
                await User.findById(
                    user.user_id
                )

        };

    },


    // ==========================================
    // LOGIN
    // ==========================================

    async login(email, password) {

        if (!email || !password) {

            throw new Error(
                "Email and password are required."
            );

        }


        const user =
            await User.findByEmail(
                email
            );


        if (!user) {

            throw new Error(
                "Invalid email or password."
            );

        }


        if (user.is_active === false) {

            throw new Error(
                "Your account is currently inactive."
            );

        }


        const validPassword =
            await bcrypt.compare(
                password,
                user.password_hash
            );


        if (!validPassword) {

            throw new Error(
                "Invalid email or password."
            );

        }


        if (
            Number(user.role_id) === 2 &&
            user.is_verified !== true
        ) {

            throw new Error(
                "Your alumni account is still pending verification."
            );

        }


        const token =
            jwt.sign(
                {
                    user_id:
                        user.user_id,

                    role_id:
                        user.role_id,

                    email:
                        user.email
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "1d"
                }
            );


        const safeUser =
            await User.findById(
                user.user_id
            );


        return {
            token,
            user: safeUser
        };

    },


    // ==========================================
    // GET CURRENT USER
    // ==========================================

    async getCurrentUser(userId) {

        const user =
            await User.findById(
                userId
            );


        if (!user) {

            throw new Error(
                "User not found."
            );

        }


        if (user.is_active === false) {

            throw new Error(
                "This account is inactive."
            );

        }


        return user;

    },


    // ==========================================
    // UPDATE OWN ACCOUNT
    // ==========================================

    async updateAccount(
        userId,
        data
    ) {

        const currentUser =
            await User.findById(
                userId
            );


        if (!currentUser) {

            throw new Error(
                "User not found."
            );

        }


        if (currentUser.is_active === false) {

            throw new Error(
                "This account is inactive."
            );

        }


        const firstName =
            String(
                data.first_name || ""
            ).trim();


        const middleName =
            String(
                data.middle_name || ""
            ).trim();


        const lastName =
            String(
                data.last_name || ""
            ).trim();


        const email =
            String(
                data.email || ""
            )
                .trim()
                .toLowerCase();


        if (
            !firstName ||
            !lastName ||
            !email
        ) {

            throw new Error(
                "First name, last name, and email are required."
            );

        }


        const existingUser =
            await User.findByEmail(
                email
            );


        if (
            existingUser &&
            Number(
                existingUser.user_id
            ) !==
            Number(userId)
        ) {

            throw new Error(
                "Email already exists."
            );

        }


        const updatedUser =
            await User.updateAccount(
                userId,
                {
                    first_name:
                        firstName,

                    middle_name:
                        middleName || null,

                    last_name:
                        lastName,

                    email
                }
            );


        if (!updatedUser) {

            throw new Error(
                "Unable to update account."
            );

        }


        return await User.findById(
            userId
        );

    },


    // ==========================================
    // UPDATE PROFILE PICTURE
    // ==========================================

    async updateProfilePicture(
        userId,
        profilePicturePath
    ) {

        const currentUser =
            await User.findById(
                userId
            );


        if (!currentUser) {

            throw new Error(
                "User not found."
            );

        }


        if (currentUser.is_active === false) {

            throw new Error(
                "This account is inactive."
            );

        }


        if (!profilePicturePath) {

            throw new Error(
                "Profile picture is required."
            );

        }


        const result =
            await User.updateProfilePicture(
                userId,
                profilePicturePath
            );


        if (!result) {

            throw new Error(
                "Unable to update profile picture."
            );

        }


        return await User.findById(
            userId
        );

    },


    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

    async changePassword(
        userId,
        data
    ) {

        const currentPassword =
            String(
                data.current_password || ""
            );


        const newPassword =
            String(
                data.new_password || ""
            );


        const confirmPassword =
            String(
                data.confirm_password || ""
            );


        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {

            throw new Error(
                "Current password, new password, and confirmation are required."
            );

        }


        if (
            newPassword !==
            confirmPassword
        ) {

            throw new Error(
                "New password and confirmation do not match."
            );

        }


        if (
            newPassword.length < 8
        ) {

            throw new Error(
                "New password must be at least 8 characters long."
            );

        }


        if (
            currentPassword ===
            newPassword
        ) {

            throw new Error(
                "New password must be different from your current password."
            );

        }


        const user =
            await User.findWithPasswordById(
                userId
            );


        if (!user) {

            throw new Error(
                "User not found."
            );

        }


        if (user.is_active === false) {

            throw new Error(
                "This account is inactive."
            );

        }


        const validCurrentPassword =
            await bcrypt.compare(
                currentPassword,
                user.password_hash
            );


        if (!validCurrentPassword) {

            throw new Error(
                "Current password is incorrect."
            );

        }


        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );


        const result =
            await User.updatePassword(
                userId,
                hashedPassword
            );


        if (!result) {

            throw new Error(
                "Unable to change password."
            );

        }


        return {
            user_id:
                result.user_id,

            updated_at:
                result.updated_at
        };

    }


};


module.exports =
    AuthService;