import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import SidebarPage from "./SidebarPage";

// Event imports
import EventsPage from "./event/EventsPage";
import EventDetailPage from "./event/EventDetailPage";
import AddEventPage from "./event/AddEventPage";
import ArchivePage from "./event/ArchivePage";

// Campaign imports
import CampaignPage from "./campaign/CampaignPage";
import AddCampaignPage from "./campaign/AddCampaignPage";
import CampaignDetailPage from "./campaign/CampaignDetailPage";
import ArchiveCampaignPage from "./campaign/ArchiveCampaignPage";

// Survey imports
import SurveyPage from "./survey/SurveyPage";
import AddSurveyPage from "./survey/AddSurveyPage";
import ArchiveSurveyPage from "./survey/ArchiveSurveyPage";
import SurveyDetailPage from "./survey/SurveyDetailPage";

// Home / Auth imports
import HomePage from "./Home/HomePage";
import RegisterInsti from "./Home/RegisterInsti";
import RegisterAdminPage from "./RegisterAdminPage";

// Super Admin imports
import RecordsPageAdmin from "./SAdmin/RecordsPageAdmin";
import PendingPageAdmin from "./SAdmin/PendingPageAdmin";
import SidebarSuperAdmin from "./SAdmin/SidebarPageAdmin";

// Profile import
import ProfilePage from "./Profile/ProfilePage";

// Dashboard import (NEW)
import DashboardPage from "./dashboard/DashboardPage";

// Temp placeholder components (kept only for Records, Donation, News)
function Records() { return <h1>Records Page</h1>; }
function Donation() { return <h1>Donation Page</h1>; }
function News() { return <h1>News Page</h1>; }

// ------------------- Dynamic Title Hook -------------------
function useDynamicTitle() {
  const location = useLocation();

  useEffect(() => {
    const userString = localStorage.getItem("user");
    let user = null;
    try {
      if (userString) user = JSON.parse(userString);
    } catch {
      user = null;
    }

    const role = user?.role || null;
    let title = "Knot";

    if (location.pathname === "/") {
      title = "Knot | Home";
    } else if (location.pathname.startsWith("/superadmin")) {
      title = "Knot | Super Admin";
    } else if (location.pathname.startsWith("/app")) {
      if (role === "admin") {
        title = "Knot | Admin";
      } else if (role === "user") {
        const parts = location.pathname.split("/");
        const page = parts[2] || "Dashboard"; // /app/dashboard → Dashboard
        title = `Knot | ${page.charAt(0).toUpperCase() + page.slice(1)}`;
      }
    }

    document.title = title;
  }, [location]);
}

// ------------------- Protected Route -------------------
function ProtectedRoute({ allowedRoles }) {
  const userString = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  let user = null;
  try {
    if (userString) {
      user = JSON.parse(userString);
    }
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  if (!user || !token || !user.role) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

// ------------------- App -------------------
export default function App() {
  return (
    <Router>
      <DynamicTitleWrapper />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register-institution" element={<RegisterInsti />} />
        <Route path="/register-admin/:institutionId" element={<RegisterAdminPage />} />

        {/* Protected routes for Normal Users and Admins */}
        <Route element={<ProtectedRoute allowedRoles={["user", "admin"]} />}>
          <Route path="/app" element={<SidebarPage />}>
            {/* Events */}
            <Route path="events" element={<EventsPage />} />
            <Route path="events/archive" element={<ArchivePage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="add" element={<AddEventPage />} />

            {/* Campaigns */}
            <Route path="campaigns" element={<CampaignPage />} />
            <Route path="campaigns/archive" element={<ArchiveCampaignPage />} />
            <Route path="campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="add-campaign" element={<AddCampaignPage />} />

            {/* Surveys */}
            <Route path="survey" element={<SurveyPage />} />
            <Route path="survey/add" element={<AddSurveyPage />} />
            <Route path="survey/archive" element={<ArchiveSurveyPage />} />
            <Route path="survey/:id" element={<SurveyDetailPage />} />

            {/* User Profile */}
            <Route path="profile" element={<ProfilePage />} />

            {/* Others */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="records" element={<Records />} />
            <Route path="donation" element={<Donation />} />
            <Route path="news" element={<News />} />

            {/* Default landing page inside app */}
            <Route index element={<DashboardPage />} />
          </Route>
        </Route>

        {/* Protected routes for Super Admin */}
        <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
          <Route path="/superadmin" element={<SidebarSuperAdmin />}>
            <Route path="records" element={<RecordsPageAdmin />} />
            <Route path="pending" element={<PendingPageAdmin />} />
            <Route index element={<RecordsPageAdmin />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Wrapper so useDynamicTitle runs inside Router
function DynamicTitleWrapper() {
  useDynamicTitle();
  return null;
}
