const express = require("express");
const passport = require("passport");
const router = express.Router();
const { register, login } = require("../controller/auth");

router.post("/register", register);
router.post("/login", passport.authenticate("jwt", { session: false }), login);

module.exports = router;
