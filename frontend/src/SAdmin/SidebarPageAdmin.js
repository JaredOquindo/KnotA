import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";

import { RiDashboardFill } from "react-icons/ri";
import { IoPeopleCircleOutline } from "react-icons/io5";
import { FaBars } from "react-icons/fa";

export default function SidebarPageAdmin() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [recordsSubmenuOpen, setRecordsSubmenuOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // --- submenu open check for Records ---
  useEffect(() => {
    setRecordsSubmenuOpen(
      location.pathname.startsWith("/superadmin/records") ||
      location.pathname.startsWith("/superadmin/pending")
    );
  }, [location]);

  const handleMenuClick = (path) => {
    setIsOpen(false);
    if (path === "records") setRecordsSubmenuOpen((prev) => !prev);
    else navigate(`/superadmin/${path}`);
  };

  // --- yellow dot active checks ---
  const showYellowDotOnDashboard =
    location.pathname === "/superadmin/dashboard";

  const showYellowDotOnRegistered =
    location.pathname === "/superadmin/records";

  const showYellowDotOnPending =
    location.pathname === "/superadmin/pending";

  return (
    <div className="layout">
      {/* Sidebar */}
      <button className="menu-toggle" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Top box with logo and school name */}
        <div className="sidebar-header">
          <img src="/Ateneo.png" alt="Logo" className="sidebar-logo-img" />
          <span className="sidebar-school-name">Ateneo De Naga University</span>
        </div>

        <nav>
          <ul>
            {/* Dashboard */}
            <li
              className={
                location.pathname === "/superadmin/dashboard" ? "active" : ""
              }
              onClick={() => handleMenuClick("dashboard")}
            >
              <Link to="/superadmin/dashboard">
                <span className="menu-icon">
                  <RiDashboardFill />
                </span>
                <span className="menu-text">
                  <span
                    className={`yellow-dot ${
                      showYellowDotOnDashboard ? "" : "hidden"
                    }`}
                  ></span>
                  Dashboard
                </span>
              </Link>
            </li>

            {/* Records */}
            <li>
              <div
                className={`menu-item ${recordsSubmenuOpen ? "active" : ""}`}
                onClick={() => handleMenuClick("records")}
                style={{ cursor: "pointer", padding: "1px 20px" }}
              >
                <span className="menu-icon">
                  <IoPeopleCircleOutline />
                </span>
                <span className="menu-text">Records</span>
              </div>
              <div
                className={`submenu-wrapper ${
                  recordsSubmenuOpen ? "open" : ""
                }`}
              >
                <ul className="submenu">
                  <li onClick={() => setIsOpen(false)}>
                    <Link
                      to="/superadmin/records"
                      className={
                        showYellowDotOnRegistered ? "active-submenu" : ""
                      }
                    >
                      <span
                        className={`yellow-dot ${
                          showYellowDotOnRegistered ? "" : "hidden"
                        }`}
                      ></span>
                      Registered
                    </Link>
                  </li>
                  <li onClick={() => setIsOpen(false)}>
                    <Link
                      to="/superadmin/pending"
                      className={showYellowDotOnPending ? "active-submenu" : ""}
                    >
                      <span
                        className={`yellow-dot ${
                          showYellowDotOnPending ? "" : "hidden"
                        }`}
                      ></span>
                      Pending V.
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </nav>

        {/* Logo at bottom center */}
        <div className="sidebar-logo">
          <img src="/knot7.png" alt="Knot Logo" />
        </div>
      </aside>

      {/* Main content (no TopBar at all) */}
      <main className="content relative">
        <div className="pt-4 px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
