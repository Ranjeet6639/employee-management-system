import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployees, deleteEmployee } from "../services/employeeService";
import ConfirmModal from "../components/ConfirmModal";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Builds a short, badge-style staff code from the Mongo ObjectId
// (last 4 hex characters), purely cosmetic — gives each row a record-like identity.
const idChip = (id) => `#${id.slice(-4).toUpperCase()}`;

const EmployeeListPage = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getEmployees({ search, sortBy, order, page, limit: 10 });
      setEmployees(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, order, page]);

  // Debounce search input so we don't fire a request on every keystroke
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEmployees();
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [fetchEmployees]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setOrder("asc");
    }
    setPage(1);
  };

  const sortIndicator = (field) => {
    if (sortBy !== field) return "";
    return order === "asc" ? " ▲" : " ▼";
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(deleteTarget._id);
      setDeleteTarget(null);
      // If we deleted the last item on a page beyond page 1, step back a page
      if (employees.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchEmployees();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete employee");
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Staff directory</p>
          <h1>Employees</h1>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/employees/new")}>
          + Add Employee
        </button>
      </div>

      <div className="toolbar">
        <div className="search-input-wrap">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-text">Loading employees...</div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-glyph">∅</div>
            {search ? `No employees found matching "${search}"` : "No employees yet — add your first one."}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort("fullName")}>Name{sortIndicator("fullName")}</th>
                <th>Email</th>
                <th>Mobile</th>
                <th onClick={() => handleSort("department")}>Department{sortIndicator("department")}</th>
                <th onClick={() => handleSort("designation")}>Designation{sortIndicator("designation")}</th>
                <th onClick={() => handleSort("joiningDate")}>Joining Date{sortIndicator("joiningDate")}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td>
                    <div className="employee-name-cell">
                      <span className="id-chip">{idChip(emp._id)}</span>
                      <span>{emp.fullName}</span>
                    </div>
                  </td>
                  <td className="cell-muted">{emp.email}</td>
                  <td className="cell-muted">{emp.mobileNumber}</td>
                  <td>
                    <span className="dept-badge">{emp.department}</span>
                  </td>
                  <td>{emp.designation}</td>
                  <td className="cell-muted">{formatDate(emp.joiningDate)}</td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/employees/${emp._id}/edit`)}
                    >
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(emp)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Employee"
          message={`Are you sure you want to delete ${deleteTarget.fullName}? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isConfirming={isDeleting}
        />
      )}
    </div>
  );
};

export default EmployeeListPage;
