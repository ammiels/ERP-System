// Dashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { DASHBOARD_API_URL, INVENTORY_API_URL, REQUESTS_API_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { testRequestsApi } from "../utils/testApi";
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
    const [isLoading, setIsLoading] = useState(true);    const navigate = useNavigate();
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }
        
        // Check token age - if it's older than 15 minutes, redirect to login
        const tokenTimestamp = localStorage.getItem("tokenTimestamp");
        if (tokenTimestamp) {
            const tokenAge = Date.now() - parseInt(tokenTimestamp);
            const fifteenMinutesInMs = 15 * 60 * 1000;
            
            if (tokenAge > fifteenMinutesInMs) {
                // Token is too old, redirect to login
                console.log("Token expired, redirecting to login");
                localStorage.removeItem("token");
                localStorage.removeItem("tokenTimestamp");
                navigate("/");
                return;
            }
        }
        
        // Declare payload at this scope so it's available throughout the effect
        let payload;
        
        try {
            payload = JSON.parse(atob(token.split(".")[1]));
            setRole(payload.role);
            setUsername(payload.sub || "");
            
            // Log the decoded token for debugging
            console.log("Decoded token payload:", {
                role: payload.role,
                username: payload.username,
                sub: payload.sub,
                exp: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'unknown'
            });
        } catch (error) {
            console.error("Invalid token format:", error);
            localStorage.removeItem("token");
            navigate("/");
            return;
        }
        
        // Get dashboard welcome message
        axios.get(`${DASHBOARD_API_URL}/dashboard/${payload.role}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then((res) => {
            console.log("Dashboard message received:", res.data.message);
            setMessage(res.data.message);
        }).catch((err) => {
            console.error("Dashboard API error:", err);
            if (err.response) {
                console.error("Dashboard error status:", err.response.status);
                console.error("Dashboard error data:", err.response.data);
            }
            setMessage("Access denied");
        });
        
        // Get inventory statistics and data if admin
        if (payload.role === "admin") {
            axios.get(`${INVENTORY_API_URL}/inventory`, {
                headers: { Authorization: `Bearer ${token}` }
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
                if (err.response && err.response.status === 401) {
                    // Token is invalid or expired
                    localStorage.removeItem("token");
                    navigate("/");
                }
            });
            
            // Get pending requests count and all request history
            const config = { headers: { Authorization: `Bearer ${token}` } };
            console.log('Using REQUESTS_API_URL:', REQUESTS_API_URL);
            
            // Make the requests individually to better diagnose errors            // Test connection to the Requests API first
            testRequestsApi(token)
              .then(success => {
                if (!success) {
                  console.log("API test failed, trying direct API calls anyway");
                }
                // Continue with the original requests
                return axios.get(`${REQUESTS_API_URL}/requests/pending`, config)              })
              .then(() => {
                // After the test completes, try two API paths in case one works
                // First try with /requests prefix
                return axios.get(`${REQUESTS_API_URL}/requests/pending`, config)
                  .catch(err => {
                    console.log("Failed with /requests/pending path, trying /pending directly");
                    // If that fails, try without the /requests prefix
                    return axios.get(`${REQUESTS_API_URL}/pending`, config);
                  });
              })
              .then(pendingRes => {
                console.log("Successfully fetched pending requests:", pendingRes.data.length);
                const pendingRequests = pendingRes.data;
                
                // Try the first path for history
                const historyUrl = `${REQUESTS_API_URL}${pendingRes.config.url.includes('/requests/') ? '/requests/history' : '/history'}`;
                console.log("Using history URL:", historyUrl);
                
                return axios.get(historyUrl, config)
                    .then(historyRes => {
                        console.log("Successfully fetched request history:", historyRes.data.length);
                        const historyRequests = historyRes.data;
                        const allRequests = [...historyRequests, ...pendingRequests];
                            
                            setRequestsHistory(allRequests); // Store full request data for charts
                            setRequestsStats({
                                pending: pendingRequests.length,
                                total: allRequests.length
                            });
                            setIsLoading(false);
                        });
                })
                .catch(err => {
                    console.error("Failed to fetch requests stats:", err);
                    
                    // Log detailed error information
                    if (err.response) {
                        console.error("Error response data:", err.response.data);
                        console.error("Error response status:", err.response.status);
                        console.error("Error response headers:", err.response.headers);
                        
                        if (err.response.status === 401) {
                            // Token is invalid or expired
                            localStorage.removeItem("token");
                            localStorage.removeItem("tokenTimestamp");
                            console.log("Auth error, redirecting to login");
                            navigate("/");
                        }
                    } else if (err.request) {
                        console.error("Error request:", err.request);
                        console.log("No response received from API");
                    } else {
                        console.error("Error message:", err.message);
                    }
                    
                    setIsLoading(false);
                });
        } else if (payload.role === "user") {            // For regular users, get their own requests
            // Try both paths in case one works
            axios.get(`${REQUESTS_API_URL}/requests/mine`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(err => {
                console.log("Failed with /requests/mine path, trying /mine directly");
                return axios.get(`${REQUESTS_API_URL}/mine`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
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
                if (err.response && err.response.status === 401) {
                    // Token is invalid or expired
                    localStorage.removeItem("token");
                    navigate("/");
                }
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
