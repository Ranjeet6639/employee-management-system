import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate("/login", { replace: true });
    }, 400);
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand">
        Employee Management
        <span className="brand-mark">EMS</span>
      </span>
      {user && (
        <div className="navbar-user">
          <span>Hi, {user.name}</span>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut && <span className="spinner" />}
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
