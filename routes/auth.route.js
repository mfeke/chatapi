const { verifySignUp } = require("../middleware");
const controller =require("../controller/auth.controller")
const upload = require("../_helper/helper")


const express = require('express');
const router = express.Router();

// Define routes
router.post("/signup",controller.signup);



router.post("/signin", controller.signin);


module.exports = router; // Export the router
