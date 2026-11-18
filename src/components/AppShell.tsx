import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import { TOKEN_KEY } from "../api/client";
import "../app.css";

// Header + page frame shared by every logged-in screen.
export function AppShell() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Token is cleared below either way.
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      navigate("/login", { replace: true });
    }
  }

  return (
    <>
      <header className="shell-header">
        <span className="brand-mark">Money Tracker</span>
        <nav className="shell-nav" aria-label="Main">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/history">History</NavLink>
        </nav>
        <button className="link-button" onClick={handleLogout}>
          Log out
        </button>
      </header>
      <Outlet />
    </>
  );
}
