const express = require("express");
const aboutRoute = require("./aboutRoutes");
const router = express.Router();
router.use("/admin", aboutRoute);

module.exports = router;
