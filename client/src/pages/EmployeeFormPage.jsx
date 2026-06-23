import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createEmployee, updateEmployee, getEmployeeById } from "../services/employeeService";
import { validateEmployeeForm } from "../utils/validators";

const DEPARTMENTS = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations", "Support"];

const emptyForm = {
  fullName: "",
  email: "",
  mobileNumber: "",
  department: "",
  designation: "",
  joiningDate: "",
};

// Convert ISO date string to yyyy-mm-dd for the date input
const toDateInputValue = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toISOString().split("T")[0];
};

const EmployeeFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) return;

    const loadEmployee = async () => {
      try {
        const employee = await getEmployeeById(id);
        setFormData({
          fullName: employee.fullName,
          email: employee.email,
          mobileNumber: employee.mobileNumber,
          department: employee.department,
          designation: employee.designation,
          joiningDate: toDateInputValue(employee.joiningDate),
        });
      } catch (err) {
        setServerError(err.response?.data?.message || "Failed to load employee");
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployee();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validateEmployeeForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateEmployee(id, formData);
      } else {
        await createEmployee(formData);
      }
      navigate("/employees");
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="container loading-text">Loading employee details...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>{isEditMode ? "Edit Employee" : "Add Employee"}</h1>
      </div>

      <div className="auth-card" style={{ maxWidth: 560, margin: 0 }}>
        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
              placeholder="John Smith"
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && <div className="field-error">{errors.fullName}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                placeholder="john@company.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="mobileNumber">Mobile Number</label>
              <input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                className={`form-control ${errors.mobileNumber ? "is-invalid" : ""}`}
                placeholder="+91 9876543210"
                value={formData.mobileNumber}
                onChange={handleChange}
              />
              {errors.mobileNumber && <div className="field-error">{errors.mobileNumber}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                name="department"
                type="text"
                list="department-options"
                className={`form-control ${errors.department ? "is-invalid" : ""}`}
                placeholder="Engineering"
                value={formData.department}
                onChange={handleChange}
              />
              <datalist id="department-options">
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} />
                ))}
              </datalist>
              {errors.department && <div className="field-error">{errors.department}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="designation">Designation</label>
              <input
                id="designation"
                name="designation"
                type="text"
                className={`form-control ${errors.designation ? "is-invalid" : ""}`}
                placeholder="Software Engineer"
                value={formData.designation}
                onChange={handleChange}
              />
              {errors.designation && <div className="field-error">{errors.designation}</div>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="joiningDate">Joining Date</label>
            <input
              id="joiningDate"
              name="joiningDate"
              type="date"
              className={`form-control ${errors.joiningDate ? "is-invalid" : ""}`}
              value={formData.joiningDate}
              onChange={handleChange}
            />
            {errors.joiningDate && <div className="field-error">{errors.joiningDate}</div>}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting && <span className="spinner" />}
              {isSubmitting ? "Saving..." : isEditMode ? "Update Employee" : "Add Employee"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/employees")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeFormPage;
