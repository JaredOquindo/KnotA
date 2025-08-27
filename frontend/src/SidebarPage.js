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

  const [institution, setInstitution] = useState(null);
  const [userName, setUserName] = useState("Loading...");

  const toggleSidebar = () => setIsOpen(!isOpen);

  // ------------------- FETCH USER DATA -------------------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); // token stored on login
        if (!token) throw new Error("No token found");

        const res = await fetch("http://localhost:5000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user data");

        const user = await res.json();
        setUserName(user.fullName || "Unknown User");
        setInstitution(user.institution || null); // set full institution object
      } catch (err) {
        console.error(err);
        setUserName("Unknown User");
        setInstitution(null);
      }
    };

    fetchUser();
  }, []);

  // ------------------- SUBMENU LOGIC -------------------
  useEffect(() => {
    setEventsSubmenuOpen(
      location.pathname.startsWith("/app/events") || location.pathname === "/app/add"
    );
    setCampaignsSubmenuOpen(
      location.pathname.startsWith("/app/campaigns") || location.pathname === "/app/add-campaign"
    );
    setSurveySubmenuOpen(
      location.pathname.startsWith("/app/survey") || location.pathname === "/app/add-survey"
    );
  }, [location]);

  // ------------------- EVENT/CAMPAIGN/SURVEY CLOSED CHECK -------------------
  useEffect(() => {
    const match = location.pathname.match(/^\/app\/events\/([^/]+)$/);
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
    const match = location.pathname.match(/^\/app\/campaigns\/([^/]+)$/);
    if (!match) {
      setIsViewingClosedCampaign(false);
      return;
    }
    fetch(`http://localhost:5000/campaigns/${match[1]}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((campaign) => setIsViewingClosedCampaign(campaign.isClosed === true))
      .catch(() => setIsViewingClosedCampaign(false));
  }, [location]);

  useEffect(() => {
    const match = location.pathname.match(/^\/app\/survey\/([^/]+)$/);
    if (!match) {
      setIsViewingClosedSurvey(false);
      return;
    }
    fetch(`http://localhost:5000/surveys/${match[1]}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((survey) => setIsViewingClosedSurvey(survey.status === "closed"))
      .catch(() => setIsViewingClosedSurvey(false));
  }, [location]);

  // ------------------- YELLOW DOT ACTIVE STATE -------------------
  const showYellowDotOnOpenEvents =
    loadingFinished &&
    (location.pathname === "/app/events" ||
      location.pathname === "/app/add" ||
      (location.pathname.startsWith("/app/events") &&
        !location.pathname.startsWith("/app/events/archive") &&
        !isViewingClosedEvent));

  const showYellowDotOnArchiveEvents =
    loadingFinished &&
    (location.pathname.startsWith("/app/events/archive") || isViewingClosedEvent);

  const showYellowDotOnActiveCampaigns =
    location.pathname === "/app/campaigns" ||
    location.pathname === "/app/add-campaign" ||
    (location.pathname.startsWith("/app/campaigns") &&
      !location.pathname.startsWith("/app/campaigns/archive") &&
      !isViewingClosedCampaign);

  const showYellowDotOnArchiveCampaigns =
    location.pathname.startsWith("/app/campaigns/archive") || isViewingClosedCampaign;

  const showYellowDotOnActiveSurveys =
    location.pathname === "/app/survey" ||
    location.pathname === "/app/add-survey" ||
    (location.pathname.startsWith("/app/survey") &&
      !location.pathname.startsWith("/app/survey/archive") &&
      !isViewingClosedSurvey);

  const showYellowDotOnArchiveSurveys =
    location.pathname.startsWith("/app/survey/archive") || isViewingClosedSurvey;

  const handleMenuClick = (path) => {
    setIsOpen(false);
    if (path === "events") setEventsSubmenuOpen((prev) => !prev);
    else if (path === "campaigns") setCampaignsSubmenuOpen((prev) => !prev);
    else if (path === "survey") setSurveySubmenuOpen((prev) => !prev);
    else navigate(`/app/${path}`);
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <button className="menu-toggle" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Top box with logo and school name */}
        <div className="sidebar-header">
          <img
            src={institution?.institutionLogo || "/Ateneo.png"}
            alt="Logo"
            className="sidebar-logo-img"
          />
          <div className="sidebar-school-name">
            {institution?.officialInstitutionName || "No Institution"}
          </div>
        </div>

        {/* Navigation */}
        <nav>
          <ul>
            <li
              className={location.pathname === "/app/dashboard" ? "active" : ""}
              onClick={() => handleMenuClick("dashboard")}
            >
              <Link to="/app/dashboard">
                <span className="menu-icon"><RiDashboardFill /></span>
                <span className="menu-text">Dashboard</span>
              </Link>
            </li>

            <li
              className={location.pathname === "/app/records" ? "active" : ""}
              onClick={() => handleMenuClick("records")}
            >
              <Link to="/app/records">
                <span className="menu-icon"><IoPeopleCircleOutline /></span>
                <span className="menu-text">Records</span>
              </Link>
            </li>

            {/* Campaigns */}
            <li>
              <div
                className={`menu-item ${campaignsSubmenuOpen ? "active" : ""}`}
                onClick={() => handleMenuClick("campaigns")}
                style={{ cursor: "pointer", padding: "1px 20px" }}
              >
                <span className="menu-icon"><GiReceiveMoney /></span>
                <span className="menu-text">Campaigns</span>
              </div>
              <div className={`submenu-wrapper ${campaignsSubmenuOpen ? "open" : ""}`}>
                <ul className="submenu">
                  <li onClick={() => setIsOpen(false)}>
                    <Link
                      to="/app/campaigns"
                      className={showYellowDotOnActiveCampaigns ? "active-submenu" : ""}
                    >
                      <span className={`yellow-dot ${showYellowDotOnActiveCampaigns ? "" : "hidden"}`}></span>
                      Active Campaigns
                    </Link>
                  </li>
                  <li onClick={() => setIsOpen(false)}>
                    <Link
                      to="/app/campaigns/archive"
                      className={showYellowDotOnArchiveCampaigns ? "active-submenu" : ""}
                    >
                      <span className={`yellow-dot ${showYellowDotOnArchiveCampaigns ? "" : "hidden"}`}></span>
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
                <span className="menu-icon"><IoCalendar /></span>
                <span className="menu-text">Events</span>
              </div>
              <div className={`submenu-wrapper ${eventsSubmenuOpen ? "open" : ""}`}>
                <ul className="submenu">
                  <li onClick={() => setIsOpen(false)}>
                    <Link
                      to="/app/events"
                      className={showYellowDotOnOpenEvents ? "active-submenu" : ""}
                    >
                      <span className={`yellow-dot ${showYellowDotOnOpenEvents ? "" : "hidden"}`}></span>
                      Open Events
                    </Link>
                  </li>
                  <li onClick={() => setIsOpen(false)}>
                    <Link
                      to="/app/events/archive"
                      className={showYellowDotOnArchiveEvents ? "active-submenu" : ""}
                    >
                      <span className={`yellow-dot ${showYellowDotOnArchiveEvents ? "" : "hidden"}`}></span>
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
                <span className="menu-icon"><RiSurveyFill /></span>
                <span className="menu-text">Survey</span>
              </div>
              <div className={`submenu-wrapper ${surveySubmenuOpen ? "open" : ""}`}>
                <ul className="submenu">
                  <li onClick={() => setIsOpen(false)}>
                    <Link
                      to="/app/survey"
                      className={showYellowDotOnActiveSurveys ? "active-submenu" : ""}
                    >
                      <span className={`yellow-dot ${showYellowDotOnActiveSurveys ? "" : "hidden"}`}></span>
                      Active Surveys
                    </Link>
                  </li>
                  <li onClick={() => setIsOpen(false)}>
                    <Link
                      to="/app/survey/archive"
                      className={showYellowDotOnArchiveSurveys ? "active-submenu" : ""}
                    >
                      <span className={`yellow-dot ${showYellowDotOnArchiveSurveys ? "" : "hidden"}`}></span>
                      Archive
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            <li
              className={location.pathname === "/app/news" ? "active" : ""}
              onClick={() => handleMenuClick("news")}
            >
              <Link to="/app/news">
                <span className="menu-icon"><FaNewspaper /></span>
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

      {/* Main content */}
      <main className="content relative">
        <TopBar />
        <div className="pt-20 px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
