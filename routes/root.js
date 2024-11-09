const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

router.get("/about", (req, res) => {
    res.render("root/about");
});

router.get("/contact", (req, res) => {
    res.render("root/contact");
});

module.exports = router;