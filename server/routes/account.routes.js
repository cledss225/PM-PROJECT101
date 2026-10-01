const express = require("express");

const router = express.Router();


const AccountController =
    require("../controllers/account.controller");

const authenticateToken =
    require("../middleware/auth.middleware");

const authorizeRole =
    require("../middleware/role.middleware");


// ==========================================
// ACCOUNT VERIFICATION ROUTES
// ==========================================


// All routes require a valid login token

router.use(authenticateToken);


// ==========================================
// OFFICE VERIFICATION MONITORING
// Administrator + Alumni Office
// Role 1 = Administrator
// Role 3 = Alumni Office
// ==========================================

// GET ALL VERIFICATION RECORDS
// GET /api/accounts/verification-records

router.get(
    "/verification-records",
    authorizeRole(1, 3),
    AccountController.getVerificationRecords
);


// ==========================================
// ADMINISTRATOR ONLY
// ==========================================

// GET ALL PENDING ACCOUNTS
// GET /api/accounts/pending

router.get(
    "/pending",
    authorizeRole(1),
    AccountController.getPendingAccounts
);


// GET ONE ACCOUNT DETAILS
// GET /api/accounts/:id

router.get(
    "/:id",
    authorizeRole(1),
    AccountController.getAccountById
);


// APPROVE ACCOUNT
// PUT /api/accounts/:id/approve

router.put(
    "/:id/approve",
    authorizeRole(1),
    AccountController.approveAccount
);


// REJECT ACCOUNT
// PUT /api/accounts/:id/reject

router.put(
    "/:id/reject",
    authorizeRole(1),
    AccountController.rejectAccount
);


module.exports = router;