const express = require("express");
const aboutRoute = require("./aboutRoutes");
const router = express.Router();
router.use("/about", aboutRoute);
module.exports = router;
