// Dashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { DASHBOARD_API_URL, INVENTORY_API_URL, REQUESTS_API_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { InventoryIcon, WarningIcon, SearchIcon, RequestsIcon, NotificationIcon, PendingIcon, ManageIcon } from "./Icons";
import Sidebar from "./Sidebar";
import DashboardCharts from "./Dashboard/DashboardCharts";
import "../styles/global.css";
import "../styles/additional.css";
import "../styles/charts.css";

function Dashboard() {
    const [message, setMessage] = useState("");
    const [role, setRole] = useState("");
    const [username, setUsername] = useState("");
    const [inventoryStats, setInventoryStats] = useState({ total: 0, itemsLow: 0 });
    const [requestsStats, setRequestsStats] = useState({ pending: 0, total: 0 });
    const [inventoryItems, setInventoryItems] = useState([]);
    const [requestsHistory, setRequestsHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role);
        setUsername(payload.sub || "");

        // Get dashboard welcome message
        axios.get(`${DASHBOARD_API_URL}/dashboard/${payload.role}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
            setMessage(res.data.message);
        }).catch(() => {
            setMessage("Access denied");
        });

        // Get inventory statistics and data if admin
        if (payload.role === "admin") {
            axios.get(`${INVENTORY_API_URL}/inventory/`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then((res) => {
                const items = res.data;
                setInventoryItems(items); // Store full inventory data for charts
                const lowStock = items.filter(item => item.quantity < 10).length;
                setInventoryStats({ 
                    total: items.length, 
                    itemsLow: lowStock
                });
            }).catch(err => {
                console.error("Failed to fetch inventory stats:", err);
            });

            // Get pending requests count and all request history
            axios.get(`${REQUESTS_API_URL}/requests/pending`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then((res) => {
                const pendingRequests = res.data;
                setRequestsStats(prev => ({
                    ...prev,
                    pending: pendingRequests.length
                }));
                
                // Get all requests history
                axios.get(`${REQUESTS_API_URL}/requests/history`, {
                    headers: { Authorization: `Bearer ${token}` },
                }).then((histRes) => {
                    const allRequests = [...histRes.data, ...pendingRequests];
                    setRequestsHistory(allRequests); // Store full request data for charts
                    setRequestsStats(prev => ({
                        ...prev,
                        total: allRequests.length
                    }));
                    setIsLoading(false);
                });
            }).catch(err => {
                console.error("Failed to fetch requests stats:", err);
                setIsLoading(false);
            });
        } else if (payload.role === "user") {
            // For regular users, get their own requests
            axios.get(`${REQUESTS_API_URL}/requests/mine`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then((res) => {
                const myRequests = res.data;
                setRequestsHistory(myRequests); // Store full request data for charts
                const pending = myRequests.filter(req => req.status === "pending").length;
                setRequestsStats({
                    pending: pending,
                    total: myRequests.length
                });
                setIsLoading(false);
            }).catch(err => {
                console.error("Failed to fetch user requests:", err);
                setIsLoading(false);
            });
        }
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div className="app-container">
            <Sidebar role={role} />
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>Dashboard</h1>
                    <div className="user-info">
                        <span className="welcome-message">{message}</span>
                        <button className="logout-btn" onClick={logout}>Logout</button>
                    </div>
                </header>
                <div className="dashboard-content">
                    {isLoading ? (
                        <div className="loading">Loading dashboard data...</div>
                    ) : (
                        <>
                            <div className="dashboard-cards">
                                <div className="dashboard-card">
                                    <div className={`card-icon ${role === 'admin' ? 'icon-blue' : 'icon-purple'}`}>
                                        {role === 'admin' ? <InventoryIcon /> : <NotificationIcon />}
                                    </div>
                                    <div className="card-content">
                                        <h3>{role === 'admin' ? 'Inventory Items' : 'My Requests'}</h3>
                                        <p className="card-value">{role === 'admin' ? inventoryStats.total : requestsStats.total}</p>
                                    </div>
                                </div>
                                
                                <div className="dashboard-card">
                                    <div className={`card-icon ${role === 'admin' ? 'icon-warning' : 'icon-blue'}`}>
                                        {role === 'admin' ? <WarningIcon /> : <PendingIcon />}
                                    </div>
                                    <div className="card-content">
                                        <h3>{role === 'admin' ? 'Low Stock Items' : 'Pending Requests'}</h3>
                                        <p className="card-value">{role === 'admin' ? inventoryStats.itemsLow : requestsStats.pending}</p>
                                    </div>
                                </div>
                                
                                <div className="dashboard-card">
                                    <div className="card-icon icon-primary">
                                        {role === 'admin' ? <RequestsIcon /> : <SearchIcon />}
                                    </div>
                                    <div className="card-content">
                                        <h3>{role === 'admin' ? 'Pending Requests' : 'Available Items'}</h3>
                                        <p className="card-value">{role === 'admin' ? requestsStats.pending : '—'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="dashboard-actions">
                                <h2 className="section-heading">Quick Actions</h2>
                                <div className="action-buttons">
                                    {role === "admin" && (
                                        <>
                                            <button className="action-button inventory" onClick={() => navigate("/inventory")}>
                                                <span className="action-icon"><InventoryIcon /></span>
                                                <span>Manage Inventory</span>
                                            </button>
                                            <button className="action-button requests" onClick={() => navigate("/requests")}>
                                                <span className="action-icon"><ManageIcon /></span>
                                                <span>Manage Requests</span>
                                            </button>
                                        </>
                                    )}
                                    {role === "user" && (
                                        <button className="action-button requests" onClick={() => navigate("/requests")}>
                                            <span className="action-icon"><RequestsIcon /></span>
                                            <span>View My Requests</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Dashboard Charts Section */}
                            <div className="dashboard-charts-section">
                                <h2 className="section-heading">Analytics</h2>
                                <DashboardCharts 
                                    inventoryItems={inventoryItems} 
                                    requestsHistory={requestsHistory} 
                                    role={role} 
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
