const express = require("express");

const router = express.Router();

const AuthController =
    require("../controllers/auth.controller");

const authenticateToken =
    require("../middleware/auth.middleware");

const authorizeRole =
    require("../middleware/role.middleware");

const uploadProfilePicture =
    require("../middleware/profile-upload.middleware");


// ==========================================
// REGISTER
// ==========================================

router.post(
    "/register",
    AuthController.register
);


// ==========================================
// EMAIL VERIFICATION
// ==========================================

router.post(
    "/send-email-code",
    AuthController.sendEmailVerificationCode
);

router.post(
    "/verify-email-code",
    AuthController.verifyEmailVerificationCode
);


// ==========================================
// SMS OTP VERIFICATION
// ==========================================

router.post(
    "/send-sms-code",
    AuthController.sendSmsVerificationCode
);

router.post(
    "/verify-sms-code",
    AuthController.verifySmsVerificationCode
);


// ==========================================
// LOGIN
// ==========================================

router.post(
    "/login",
    AuthController.login
);


// ==========================================
// CURRENT USER
// ==========================================

router.get(
    "/me",
    authenticateToken,
    AuthController.getCurrentUser
);


// ==========================================
// UPDATE OWN ACCOUNT
// ==========================================

router.put(
    "/account",
    authenticateToken,
    AuthController.updateAccount
);


// ==========================================
// PROFILE PICTURE
// ==========================================

router.put(
    "/profile-picture",
    authenticateToken,
    uploadProfilePicture.single(
        "profile_picture"
    ),
    AuthController.updateProfilePicture
);


// ==========================================
// CHANGE PASSWORD
// ==========================================

router.put(
    "/change-password",
    authenticateToken,
    authorizeRole(1),
    AuthController.changePassword
);


module.exports =
    router;