import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import "./SidebarPage.css";
import { RiDashboardFill, RiSurveyFill } from "react-icons/ri";
import { IoPeopleCircleOutline, IoCalendar } from "react-icons/io5";
import { GiReceiveMoney } from "react-icons/gi";
import { FaNewspaper, FaBars } from "react-icons/fa";

export default function SidebarPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isViewingClosedEvent, setIsViewingClosedEvent] = useState(false);
  const [eventsSubmenuOpen, setEventsSubmenuOpen] = useState(false);
  const [loadingFinished, setLoadingFinished] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Keep Events submenu open if path starts with /events OR is /add (your AddEventPage)
  useEffect(() => {
    if (
      location.pathname.startsWith("/events") ||
      location.pathname === "/add"
    ) {
      setEventsSubmenuOpen(true);
    } else {
      setEventsSubmenuOpen(false);
    }
  }, [location]);

  // Check if viewing a closed event (for archive dot)
  useEffect(() => {
    const match = location.pathname.match(/^\/events\/([^/]+)$/);
    if (!match) {
      setIsViewingClosedEvent(false);
      setLoadingFinished(true);
      return;
    }

    let intervalId;
    setLoadingFinished(false);

    const fetchEvent = () => {
      fetch(`http://localhost:5000/api/events/${match[1]}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch event");
          return res.json();
        })
        .then((event) => {
          setIsViewingClosedEvent(event.isClosed === true);
        })
        .catch(() => setIsViewingClosedEvent(false))
        .finally(() => {
          setLoadingFinished(true);
        });
    };

    fetchEvent();

    intervalId = setInterval(fetchEvent, 20000);

    return () => clearInterval(intervalId);
  }, [location]);

  // Highlight Open Events submenu item when on /events, /add, or open events (excluding archive and closed)
  const showYellowDotOnOpenEvents =
    loadingFinished &&
    (
      location.pathname === "/events" ||
      location.pathname === "/add" ||  // <-- add your AddEventPage path here
      (location.pathname.startsWith("/events") &&
       !location.pathname.startsWith("/events/archive") &&
       !isViewingClosedEvent)
    );

  // Highlight Archive submenu for archive or closed events
  const showYellowDotOnArchive =
    loadingFinished &&
    (location.pathname.startsWith("/events/archive") || isViewingClosedEvent);

  const handleMenuClick = (path) => {
    setIsOpen(false);
    if (path === "events") {
      setEventsSubmenuOpen((prev) => !prev);
    } else {
      navigate(`/${path}`);
    }
  };

  return (
    <div className="layout">
      <button className="menu-toggle" onClick={toggleSidebar}>
        <FaBars />
      </button>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2 className="logo">My App</h2>
        <nav>
          <ul>
            <li
              className={location.pathname === "/dashboard" ? "active" : ""}
              onClick={() => handleMenuClick("dashboard")}
            >
              <Link to="/dashboard">
                <span className="menu-icon">
                  <RiDashboardFill />
                </span>
                <span className="menu-text">Dashboard</span>
              </Link>
            </li>

            <li
              className={location.pathname === "/records" ? "active" : ""}
              onClick={() => handleMenuClick("records")}
            >
              <Link to="/records">
                <span className="menu-icon">
                  <IoPeopleCircleOutline />
                </span>
                <span className="menu-text">Records</span>
              </Link>
            </li>

            <li
              className={location.pathname === "/donation" ? "active" : ""}
              onClick={() => handleMenuClick("donation")}
            >
              <Link to="/donation">
                <span className="menu-icon">
                  <GiReceiveMoney />
                </span>
                <span className="menu-text">Donation</span>
              </Link>
            </li>

            <li>
              <div
                className={`menu-item ${eventsSubmenuOpen ? "active" : ""}`}
                onClick={() => handleMenuClick("events")}
                style={{ cursor: "pointer", padding: "1px 20px" }}
              >
                <span className="menu-icon">
                  <IoCalendar />
                </span>
                <span className="menu-text">Events</span>
              </div>

              <div className={`submenu-wrapper ${eventsSubmenuOpen ? "open" : ""}`}>
                <ul className="submenu">
                  <li onClick={() => setIsOpen(false)}>
                    <Link
                      to="/events"
                      className={showYellowDotOnOpenEvents ? "active-submenu" : ""}
                    >
                      <span
                        className={`yellow-dot ${
                          showYellowDotOnOpenEvents ? "" : "hidden"
                        }`}
                      ></span>
                      Open Events
                    </Link>
                  </li>
                  <li onClick={() => setIsOpen(false)}>
                    <Link
                      to="/events/archive"
                      className={showYellowDotOnArchive ? "active-submenu" : ""}
                    >
                      <span
                        className={`yellow-dot ${
                          showYellowDotOnArchive ? "" : "hidden"
                        }`}
                      ></span>
                      Archive
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            <li
              className={location.pathname === "/news" ? "active" : ""}
              onClick={() => handleMenuClick("news")}
            >
              <Link to="/news">
                <span className="menu-icon">
                  <FaNewspaper />
                </span>
                <span className="menu-text">News</span>
              </Link>
            </li>

            <li
              className={location.pathname === "/survey" ? "active" : ""}
              onClick={() => handleMenuClick("survey")}
            >
              <Link to="/survey">
                <span className="menu-icon">
                  <RiSurveyFill />
                </span>
                <span className="menu-text">Survey</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
