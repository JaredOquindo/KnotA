import { useState } from "react";
import "./DashboardPage.css"; // A new CSS file will be needed

// Icons
import { FaUser, FaCalendarAlt, FaSort } from "react-icons/fa";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Alumni");

  // Static placeholder data
  const dashboardData = {
    stats: {
      registeredAlumni: 25,
      reportedUsers: 3,
      postedEvents: 5,
      postedDonations: 2,
    },
    alumni: [
      { id: 1, name: "Juan Dela Cruz", batch: "2023", status: "Active" },
      { id: 2, name: "Maria Santos", batch: "2022", status: "Inactive" },
      { id: 3, name: "Jose Rizal", batch: "2021", status: "Active" },
    ],
  };

  // Helper function for the "Status" cell in the table
  const StatusPill = ({ status }) => (
    <span className={`status-pill ${status.toLowerCase()}`}>
      {status}
    </span>
  );

  const { stats, alumni } = dashboardData;

  // Placeholder percentage calculations
  const totalCount = 100;
  const registeredAlumniPercent = (stats.registeredAlumni / totalCount) * 100;
  const reportedUsersPercent = (stats.reportedUsers / totalCount) * 100;
  const postedEventsPercent = (stats.postedEvents / totalCount) * 100;
  const postedDonationsPercent = (stats.postedDonations / totalCount) * 100;

  return (
    <div className="container">
      {/* Top Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <select className="batch-select">
            <option>Batch 2023</option>
            <option>Batch 2022</option>
            <option>Batch 2021</option>
          </select>
        </div>
        <div className="dashboard-date-time">
          <FaCalendarAlt />
          <span>April 17, 2025</span>
          <span>8:30 am</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="card">
          <div className="card-content">
            <div className="stat-value">{stats.registeredAlumni}</div>
            <div className="stat-label">Registered Alumni</div>
            <div className="stat-percent">
              {registeredAlumniPercent.toFixed(0)}% ({totalCount})
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="stat-value">{stats.reportedUsers}</div>
            <div className="stat-label">Reported Users</div>
            <div className="stat-percent">
              {reportedUsersPercent.toFixed(0)}% ({totalCount})
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="stat-value">{stats.postedEvents}</div>
            <div className="stat-label">Posted Event</div>
            <div className="stat-percent">
              {postedEventsPercent.toFixed(0)}% ({totalCount})
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="stat-value">{stats.postedDonations}</div>
            <div className="stat-label">Posted Donation</div>
            <div className="stat-percent">
              {postedDonationsPercent.toFixed(0)}% ({totalCount})
            </div>
          </div>
        </div>
      </div>

      {/* Chart Placeholders */}
      <div className="chart-area-row">
        <div className="chart-placeholder">
          <p>Statistics</p>
          <a href="#">View more</a>
        </div>
        <div className="chart-placeholder">
          <p>Statistics</p>
          <a href="#">View more</a>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="tabs-container">
        <div className="tabs">
          <button className={activeTab === "Alumni" ? "active" : ""} onClick={() => setActiveTab("Alumni")}>Alumni</button>
          <button className={activeTab === "Event" ? "active" : ""} onClick={() => setActiveTab("Event")}>Event</button>
          <button className={activeTab === "News" ? "active" : ""} onClick={() => setActiveTab("News")}>News</button>
          <button className={activeTab === "Donation" ? "active" : ""} onClick={() => setActiveTab("Donation")}>Donation</button>
          <button className={activeTab === "Survey" ? "active" : ""} onClick={() => setActiveTab("Survey")}>Survey</button>
          <button className={activeTab === "Mentorship" ? "active" : ""} onClick={() => setActiveTab("Mentorship")}>Mentorship</button>
        </div>
        <div className="sort-control">
          <span>Sort</span>
          <FaSort />
        </div>
      </div>

      {/* Content based on Active Tab */}
      <div className="tab-content">
        {activeTab === "Alumni" && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Registered Alumni</th>
                  <th>Batch</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {alumni.map((alum) => (
                  <tr key={alum.id}>
                    <td><FaUser /> {alum.id}</td>
                    <td>{alum.name}</td>
                    <td>{alum.batch}</td>
                    <td><StatusPill status={alum.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Other tab content would go here */}
      </div>
    </div>
  );
}
