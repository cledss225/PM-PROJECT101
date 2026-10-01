const express = require("express");

const router = express.Router();

const SearchController =
    require("../controllers/search.controller");

const authenticateToken =
    require("../middleware/auth.middleware");

const authorizeRole =
    require("../middleware/role.middleware");


// ==========================================
// GLOBAL SYSTEM SEARCH
// ADMIN • ALUMNI • ALUMNI OFFICE
//
// GET /api/search?q=keyword
// ==========================================

router.get(
    "/",
    authenticateToken,
    authorizeRole(1, 2, 3),
    SearchController.searchAll
);


module.exports = router;