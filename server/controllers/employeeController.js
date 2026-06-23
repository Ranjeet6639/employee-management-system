const Employee = require("../models/Employee");
const asyncHandler = require("../middleware/asyncHandler");

// Escapes characters that have special meaning in a regular expression,
// so user-supplied search text is always treated as a literal string match
// rather than being interpreted as regex syntax (which can throw or be abused).
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private
const createEmployee = asyncHandler(async (req, res) => {
  const { fullName, email, mobileNumber, department, designation, joiningDate } = req.body;

  if (!fullName || !email || !mobileNumber || !department || !designation || !joiningDate) {
    res.status(400);
    throw new Error("Please provide all required employee fields");
  }

  const employee = await Employee.create({
    fullName,
    email,
    mobileNumber,
    department,
    designation,
    joiningDate,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: employee });
});

// @desc    Get all employees (supports search, pagination, sorting, filtering)
// @route   GET /api/employees?search=&page=&limit=&sortBy=&order=&department=
// @access  Private
const getEmployees = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10, sortBy = "createdAt", order = "desc", department } = req.query;

  const query = {};

  // Search by name (case-insensitive partial match, special characters escaped)
  if (search) {
    query.fullName = { $regex: escapeRegex(search), $options: "i" };
  }

  // Optional filter by department
  if (department) {
    query.department = { $regex: `^${escapeRegex(department)}$`, $options: "i" };
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const sortOrder = order === "asc" ? 1 : -1;
  const allowedSortFields = ["fullName", "department", "designation", "joiningDate", "createdAt"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  const [employees, total] = await Promise.all([
    Employee.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNum),
    Employee.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: employees,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  res.status(200).json({ success: true, data: employee });
});

// @desc    Update an employee
// @route   PUT /api/employees/:id
// @access  Private
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const { fullName, email, mobileNumber, department, designation, joiningDate } = req.body;

  // Only overwrite a field if a non-empty value was actually provided.
  // Using `??` alone would let an empty string ("") blank out an existing value,
  // since "" is not null/undefined.
  if (fullName !== undefined && fullName !== "") employee.fullName = fullName;
  if (email !== undefined && email !== "") employee.email = email;
  if (mobileNumber !== undefined && mobileNumber !== "") employee.mobileNumber = mobileNumber;
  if (department !== undefined && department !== "") employee.department = department;
  if (designation !== undefined && designation !== "") employee.designation = designation;
  if (joiningDate !== undefined && joiningDate !== "") employee.joiningDate = joiningDate;

  const updatedEmployee = await employee.save();

  res.status(200).json({ success: true, data: updatedEmployee });
});

// @desc    Delete an employee
// @route   DELETE /api/employees/:id
// @access  Private
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  await employee.deleteOne();

  res.status(200).json({ success: true, message: "Employee deleted successfully" });
});

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
