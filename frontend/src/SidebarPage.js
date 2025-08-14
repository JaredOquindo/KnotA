import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import "./SidebarPage.css";
import { RiDashboardFill, RiSurveyFill } from "react-icons/ri";
import { IoPeopleCircleOutline, IoCalendar } from "react-icons/io5";
import { GiReceiveMoney } from "react-icons/gi";
import { FaNewspaper, FaBars } from "react-icons/fa";
import TopBar from "./TopBar";

export default function SidebarPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [eventsSubmenuOpen, setEventsSubmenuOpen] = useState(false);
  const [campaignsSubmenuOpen, setCampaignsSubmenuOpen] = useState(false);
  const [surveySubmenuOpen, setSurveySubmenuOpen] = useState(false);
  const [loadingFinished, setLoadingFinished] = useState(true);
  const [isViewingClosedEvent, setIsViewingClosedEvent] = useState(false);
  const [isViewingClosedCampaign, setIsViewingClosedCampaign] = useState(false);
  const [isViewingClosedSurvey, setIsViewingClosedSurvey] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // --- submenu open checks ---
  useEffect(() => {
    setEventsSubmenuOpen(
      location.pathname.startsWith("/events") || location.pathname === "/add"
    );
  }, [location]);

  useEffect(() => {
    setCampaignsSubmenuOpen(
      location.pathname.startsWith("/campaigns") ||
        location.pathname === "/add-campaign"
    );
  }, [location]);

  useEffect(() => {
    setSurveySubmenuOpen(
      location.pathname.startsWith("/survey") ||
        location.pathname === "/add-survey"
    );
  }, [location]);

  // --- closed event/campaign/survey checks ---
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
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((event) => setIsViewingClosedEvent(event.isClosed === true))
        .catch(() => setIsViewingClosedEvent(false))
        .finally(() => setLoadingFinished(true));
    };
    fetchEvent();
    intervalId = setInterval(fetchEvent, 20000);
    return () => clearInterval(intervalId);
  }, [location]);

  useEffect(() => {
    const match = location.pathname.match(/^\/campaigns\/([^/]+)$/);
    if (!match) {
      setIsViewingClosedCampaign(false);
      return;
    }
    fetch(`http://localhost:5000/campaigns/${match[1]}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((campaign) =>
        setIsViewingClosedCampaign(campaign.isClosed === true)
      )
      .catch(() => setIsViewingClosedCampaign(false));
  }, [location]);

  useEffect(() => {
    const match = location.pathname.match(/^\/survey\/([^/]+)$/);
    if (!match) {
      setIsViewingClosedSurvey(false);
      return;
    }
    fetch(`http://localhost:5000/surveys/${match[1]}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((survey) => setIsViewingClosedSurvey(survey.isClosed === true))
      .catch(() => setIsViewingClosedSurvey(false));
  }, [location]);

  // --- yellow dot active state ---
  const showYellowDotOnOpenEvents =
    loadingFinished &&
    (location.pathname === "/events" ||
      location.pathname === "/add" ||
      (location.pathname.startsWith("/events") &&
        !location.pathname.startsWith("/events/archive") &&
        !isViewingClosedEvent));

  const showYellowDotOnArchiveEvents =
    loadingFinished &&
    (location.pathname.startsWith("/events/archive") || isViewingClosedEvent);

  const showYellowDotOnActiveCampaigns =
    location.pathname === "/campaigns" ||
    location.pathname === "/add-campaign" ||
    (location.pathname.startsWith("/campaigns") &&
      !location.pathname.startsWith("/campaigns/archive") &&
      !isViewingClosedCampaign);

  const showYellowDotOnArchiveCampaigns =
    location.pathname.startsWith("/campaigns/archive") ||
    isViewingClosedCampaign;

  const showYellowDotOnActiveSurveys =
    location.pathname === "/survey" ||
    location.pathname === "/add-survey" ||
    (location.pathname.startsWith("/survey") &&
      !location.pathname.startsWith("/survey/archive") &&
      !isViewingClosedSurvey);

  const showYellowDotOnArchiveSurveys =
    location.pathname.startsWith("/survey/archive") || isViewingClosedSurvey;

  const handleMenuClick = (path) => {
    setIsOpen(false);
    if (path === "events") setEventsSubmenuOpen((prev) => !prev);
    else if (path === "campaigns") setCampaignsSubmenuOpen((prev) => !prev);
    else if (path === "survey") setSurveySubmenuOpen((prev) => !prev);
    else navigate(`/${path}`);
  };

  return (
    <div className="layout">
      {/* Sidebar */}
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

            {/* Campaigns */}
            <li>
              <div
                className={`menu-item ${
                  campaignsSubmenuOpen ? "active" : ""
                }`}
                onClick={() => handleMenuClick("campaigns")}
                style={{ cursor: "pointer", padding: "1px 20px" }}
              >
                <span className="menu-icon">
                  <GiReceiveMoney />
                </span>
                <span className="menu-text">Campaigns</span>
              </div>
              <div
                className={`submenu-wrapper ${
                  campaignsSubmenuOpen ? "open" : ""
                }`}
              >
                <ul className="submenu">
                  <li onClick={() => setIsOpen(false)}>
                    <Link
                      to="/campaigns"
                      className={
                        showYellowDotOnActiveCampaigns ? "active-submenu" : ""
                      }
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
                      className={
                        showYellowDotOnArchiveCampaigns ? "active-submenu" : ""
                      }
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
              <div
                className={`submenu-wrapper ${
                  eventsSubmenuOpen ? "open" : ""
                }`}
              >
                <ul className="submenu">
                  <li onClick={() => setIsOpen(false)}>
                    <Link
                      to="/events"
                      className={
                        showYellowDotOnOpenEvents ? "active-submenu" : ""
                      }
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
                      className={
                        showYellowDotOnArchiveEvents ? "active-submenu" : ""
                      }
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

            {/* Survey */}
            <li>
              <div
                className={`menu-item ${surveySubmenuOpen ? "active" : ""}`}
                onClick={() => handleMenuClick("survey")}
                style={{ cursor: "pointer", padding: "1px 20px" }}
              >
                <span className="menu-icon">
                  <RiSurveyFill />
                </span>
                <span className="menu-text">Survey</span>
              </div>
              <div
                className={`submenu-wrapper ${
                  surveySubmenuOpen ? "open" : ""
                }`}
              >
                <ul className="submenu">
                  <li onClick={() => setIsOpen(false)}>
                    <Link
                      to="/survey"
                      className={
                        showYellowDotOnActiveSurveys ? "active-submenu" : ""
                      }
                    >
                      <span
                        className={`yellow-dot ${
                          showYellowDotOnActiveSurveys ? "" : "hidden"
                        }`}
                      ></span>
                      Active Surveys
                    </Link>
                  </li>
                  <li onClick={() => setIsOpen(false)}>
                    <Link
                      to="/survey/archive"
                      className={
                        showYellowDotOnArchiveSurveys ? "active-submenu" : ""
                      }
                    >
                      <span
                        className={`yellow-dot ${
                          showYellowDotOnArchiveSurveys ? "" : "hidden"
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
          </ul>
        </nav>

        {/* Logo at bottom center */}
        <div className="sidebar-logo">
          <img src="/knot7.png" alt="Knot Logo" />
        </div>
      </aside>

      {/* Main content with TopBar */}
      <main className="content relative">
        <TopBar />
        <div className="pt-20 px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
