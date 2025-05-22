// Sidebar.js
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/global.css";
import { InventoryIcon, RequestsIcon, ManageIcon, WarningIcon, SearchIcon, NotificationIcon } from "./Icons";

function Sidebar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  
  return (
    <div className={`sidebar ${expanded ? '' : 'collapsed'}`}>
      <div className="sidebar-logo">
        <span className="logo-text">WAREHOUSE</span>
        <button className="toggle-sidebar" onClick={() => setExpanded(!expanded)}>
          {expanded ? '«' : '»'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <Link 
          to="/dashboard" 
          className={`nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}
          title="Dashboard"
        >
          <span className="nav-icon">
            <ManageIcon />
          </span>
          <span className="nav-label">Dashboard</span>
        </Link>
          {role === "admin" && (
          <Link 
            to="/inventory" 
            className={`nav-item ${location.pathname === "/inventory" ? "active" : ""}`}
            title="Inventory Management"
          >
            <span className="nav-icon">
              <InventoryIcon />
            </span>
            <span className="nav-label">Inventory</span>
          </Link>
        )}
        
        <Link 
          to="/requests" 
          className={`nav-item ${location.pathname === "/requests" ? "active" : ""}`}
          title={role === "admin" ? "Manage Requests" : "My Requests"}
        >
          <span className="nav-icon">
            <RequestsIcon />
          </span>
          <span className="nav-label">{role === "admin" ? "Manage Requests" : "My Requests"}</span>
        </Link>

        {role === "admin" && (
          <div className="sidebar-section">
            <div className="section-title">Quick Stats</div>
            <div className="sidebar-stat">
              <span className="stat-icon warning">
                <WarningIcon />
              </span>
              <span className="stat-info">Low Stock Items</span>
            </div>
            <div className="sidebar-stat">
              <span className="stat-icon notification">
                <NotificationIcon />
              </span>
              <span className="stat-info">Pending Requests</span>
            </div>
          </div>
        )}
      </nav>
      
      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
