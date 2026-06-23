const express = require("express");
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All employee routes are protected
router.use(protect);

router.route("/").get(getEmployees).post(createEmployee);
router.route("/:id").get(getEmployeeById).put(updateEmployee).delete(deleteEmployee);

module.exports = router;
