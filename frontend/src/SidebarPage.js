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
  const [campaignsSubmenuOpen, setCampaignsSubmenuOpen] = useState(false);
  const [loadingFinished, setLoadingFinished] = useState(true);
  const [isViewingClosedCampaign, setIsViewingClosedCampaign] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Keep Events submenu open if path starts with /events OR is /add
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

  // Keep Campaigns submenu open if path starts with /campaigns OR is /add-campaign
  useEffect(() => {
    if (
      location.pathname.startsWith("/campaigns") ||
      location.pathname === "/add-campaign"
    ) {
      setCampaignsSubmenuOpen(true);
    } else {
      setCampaignsSubmenuOpen(false);
    }
  }, [location]);

  // Check if viewing a closed event
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
      fetch(`http://localhost:5000/events/${match[1]}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch event");
          return res.json();
        })
        .then((event) => {
          setIsViewingClosedEvent(event.isClosed === true);
        })
        .catch(() => setIsViewingClosedEvent(false))
        .finally(() => setLoadingFinished(true));
    };

    fetchEvent();
    intervalId = setInterval(fetchEvent, 20000);

    return () => clearInterval(intervalId);
  }, [location]);

  // Check if viewing a closed campaign
  useEffect(() => {
    const match = location.pathname.match(/^\/campaigns\/([^/]+)$/);
    if (!match) {
      setIsViewingClosedCampaign(false);
      return;
    }

    fetch(`http://localhost:5000/campaigns/${match[1]}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch campaign");
        return res.json();
      })
      .then((campaign) => {
        setIsViewingClosedCampaign(campaign.isClosed === true);
      })
      .catch(() => setIsViewingClosedCampaign(false));
  }, [location]);

  // Highlight Open Events submenu item
  const showYellowDotOnOpenEvents =
    loadingFinished &&
    (
      location.pathname === "/events" ||
      location.pathname === "/add" ||
      (location.pathname.startsWith("/events") &&
       !location.pathname.startsWith("/events/archive") &&
       !isViewingClosedEvent)
    );

  // Highlight Archive Events submenu
  const showYellowDotOnArchiveEvents =
    loadingFinished &&
    (location.pathname.startsWith("/events/archive") || isViewingClosedEvent);

  // Highlight Active Campaign submenu item
  const showYellowDotOnActiveCampaigns =
    location.pathname === "/campaigns" ||
    location.pathname === "/add-campaign" ||
    (location.pathname.startsWith("/campaigns") && !location.pathname.startsWith("/campaigns/archive") && !isViewingClosedCampaign);

  // Highlight Archive Campaign submenu
  const showYellowDotOnArchiveCampaigns =
    location.pathname.startsWith("/campaigns/archive") || isViewingClosedCampaign;

  const handleMenuClick = (path) => {
    setIsOpen(false);
    if (path === "events") {
      setEventsSubmenuOpen((prev) => !prev);
    } else if (path === "campaigns") {
      setCampaignsSubmenuOpen((prev) => !prev);
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

            {/* Campaigns with submenu */}
            <li>
              <div
                className={`menu-item ${campaignsSubmenuOpen ? "active" : ""}`}
                onClick={() => handleMenuClick("campaigns")}
                style={{ cursor: "pointer", padding: "1px 20px" }}
              >
                <span className="menu-icon">
                  <GiReceiveMoney />
                </span>
                <span className="menu-text">Campaigns</span>
              </div>

              <div className={`submenu-wrapper ${campaignsSubmenuOpen ? "open" : ""}`}>
                <ul className="submenu">
                  <li onClick={() => setIsOpen(false)}>
                    <Link
                      to="/campaigns"
                      className={showYellowDotOnActiveCampaigns ? "active-submenu" : ""}
                    >
                      <span
                        className={`yellow-dot ${
                          showYellowDotOnActiveCampaigns ? "" : "hidden"
                        }`}
                      ></span>
                      Active Campaigns
                    </Link>
                  </li>
                  <li onClick={() => setIsOpen(false)}>
                    <Link
                      to="/campaigns/archive"
                      className={showYellowDotOnArchiveCampaigns ? "active-submenu" : ""}
                    >
                      <span
                        className={`yellow-dot ${
                          showYellowDotOnArchiveCampaigns ? "" : "hidden"
                        }`}
                      ></span>
                      Archive
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            {/* Events */}
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
                      className={showYellowDotOnArchiveEvents ? "active-submenu" : ""}
                    >
                      <span
                        className={`yellow-dot ${
                          showYellowDotOnArchiveEvents ? "" : "hidden"
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
