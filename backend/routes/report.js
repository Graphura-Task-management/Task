const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth"); // <-- fixed
const {
  getPerformanceReport,
  exportPerformanceExcel,
} = require("../controllers/reportController");

// JSON report
router.get("/performance", protect, getPerformanceReport);

// Excel export
router.get("/performance/excel", protect, exportPerformanceExcel);

module.exports = router;