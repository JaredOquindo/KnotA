import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function Dashboard() { return <h1>Dashboard Page</h1>; }
function Records() { return <h1>Records Page</h1>; }
function Donation() { return <h1>Donation Page</h1>; }
function News() { return <h1>News Page</h1>; }

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SidebarPage />}>

          {/* Event routes */}
          <Route path="events" element={<EventsPage />} />
          <Route path="events/archive" element={<ArchivePage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="add" element={<AddEventPage />} />

          {/* Campaign routes */}
          <Route path="campaigns" element={<CampaignPage />} />
          <Route path="campaigns/archive" element={<ArchiveCampaignPage />} />
          <Route path="campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="add-campaign" element={<AddCampaignPage />} />

          {/* Survey routes */}
          <Route path="survey" element={<SurveyPage />} />
          <Route path="survey/add" element={<AddSurveyPage />} />
          <Route path="survey/archive" element={<ArchiveSurveyPage />} />

          {/* Other main routes */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="records" element={<Records />} />
          <Route path="donation" element={<Donation />} />
          <Route path="news" element={<News />} />

          {/* Default index route */}
          <Route index element={<EventsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
