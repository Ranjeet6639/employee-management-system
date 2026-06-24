const Employee = require("../models/Employee");
const asyncHandler = require("../middleware/asyncHandler");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

const getEmployees = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10, sortBy = "createdAt", order = "desc", department } = req.query;

  const query = {};

  if (search) {
    query.fullName = { $regex: escapeRegex(search), $options: "i" };
  }

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

const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  res.status(200).json({ success: true, data: employee });
});

const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const { fullName, email, mobileNumber, department, designation, joiningDate } = req.body;

  if (fullName !== undefined && fullName !== "") employee.fullName = fullName;
  if (email !== undefined && email !== "") employee.email = email;
  if (mobileNumber !== undefined && mobileNumber !== "") employee.mobileNumber = mobileNumber;
  if (department !== undefined && department !== "") employee.department = department;
  if (designation !== undefined && designation !== "") employee.designation = designation;
  if (joiningDate !== undefined && joiningDate !== "") employee.joiningDate = joiningDate;

  const updatedEmployee = await employee.save();

  res.status(200).json({ success: true, data: updatedEmployee });
});

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
