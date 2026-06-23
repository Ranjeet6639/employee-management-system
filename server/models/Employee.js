const mongoose = require("mongoose");
const validator = require("validator");

const employeeSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email address",
      },
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      validate: {
        validator: (value) => validator.isMobilePhone(value, "any"),
        message: "Please provide a valid mobile number",
      },
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      maxlength: [50, "Department cannot exceed 50 characters"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
      maxlength: [50, "Designation cannot exceed 50 characters"],
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },
    // Track which user (admin) created this employee record
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Index to make name-based search fast
employeeSchema.index({ fullName: "text" });

module.exports = mongoose.model("Employee", employeeSchema);
