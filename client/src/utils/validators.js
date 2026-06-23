export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Accepts numbers with optional +country code, 7-15 digits total
export const isValidMobile = (value) => /^\+?[0-9]{7,15}$/.test(value.replace(/[\s-]/g, ""));

export const validateRegisterForm = ({ name, email, password, confirmPassword }) => {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }
  if (!email || !isValidEmail(email)) {
    errors.email = "Please enter a valid email address";
  }
  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  if (!email || !isValidEmail(email)) {
    errors.email = "Please enter a valid email address";
  }
  if (!password) {
    errors.password = "Password is required";
  }

  return errors;
};

export const validateEmployeeForm = ({ fullName, email, mobileNumber, department, designation, joiningDate }) => {
  const errors = {};

  if (!fullName || fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters";
  }
  if (!email || !isValidEmail(email)) {
    errors.email = "Please enter a valid email address";
  }
  if (!mobileNumber || !isValidMobile(mobileNumber)) {
    errors.mobileNumber = "Please enter a valid mobile number (7-15 digits)";
  }
  if (!department || department.trim().length === 0) {
    errors.department = "Department is required";
  }
  if (!designation || designation.trim().length === 0) {
    errors.designation = "Designation is required";
  }
  if (!joiningDate) {
    errors.joiningDate = "Joining date is required";
  } else {
    const selectedDate = new Date(joiningDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      errors.joiningDate = "Joining date cannot be in the future";
    }
  }

  return errors;
};
