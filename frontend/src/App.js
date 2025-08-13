import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SidebarPage from "./SidebarPage";

import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import AddEventPage from "./pages/AddEventPage";
import ArchivePage from "./pages/ArchivePage";

function Dashboard() { return <h1>Dashboard Page</h1>; }
function Records() { return <h1>Records Page</h1>; }
function Donation() { return <h1>Donation Page</h1>; }
function News() { return <h1>News Page</h1>; }
function Survey() { return <h1>Survey Page</h1>; }

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SidebarPage />}>
          {/* Default to EventsPage at /events */}
          <Route path="events" element={<EventsPage />} />
          <Route path="events/archive" element={<ArchivePage />} />
          <Route path="events/:id" element={<EventDetailPage />} />

          {/* Other main routes */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="records" element={<Records />} />
          <Route path="donation" element={<Donation />} />
          <Route path="add" element={<AddEventPage />} />
          <Route path="news" element={<News />} />
          <Route path="survey" element={<Survey />} />

          {/* Optional: Redirect root "/" to /events */}
          <Route index element={<EventsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
