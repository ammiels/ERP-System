import React, { useEffect, useState } from "react";
import axios from "axios";
import { REQUESTS_API_URL } from "../../config";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";

function RequestsPage() {
    const [requests, setRequests] = useState([]);
    const [availableItems, setAvailableItems] = useState([]);
    const [newRequest, setNewRequest] = useState({ inventory_id: "", quantity: 1 });
    const [error, setError] = useState("");
    const [role, setRole] = useState("");
    const [viewingHistory, setViewingHistory] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role);

        fetchAvailableItems();

        if (payload.role === "admin") {
            fetchPendingRequests();
        } else {
            fetchMyRequests();
        }
    }, []);

    const fetchMyRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${REQUESTS_API_URL}/requests/mine`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(response.data);
        } catch (error) {
            setError("Failed to fetch your requests.");
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${REQUESTS_API_URL}/requests/pending`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(response.data);
            setViewingHistory(false);
        } catch (error) {
            setError("Failed to fetch pending requests.");
        }
    };

    const fetchRequestHistory = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${REQUESTS_API_URL}/requests/history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(response.data);
            setViewingHistory(true);
        } catch (error) {
            setError("Failed to fetch request history.");
        }
    };

    const fetchAvailableItems = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${REQUESTS_API_URL}/requests/available-items`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAvailableItems(response.data);
        } catch (error) {
            setError("Failed to fetch available items.");
        }
    };

    const handleAcceptRequest = async (id) => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(`${REQUESTS_API_URL}/requests/${id}/accept`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchPendingRequests();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeclineRequest = async (id) => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(`${REQUESTS_API_URL}/requests/${id}/decline`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchPendingRequests();
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateRequest = async () => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(`${REQUESTS_API_URL}/requests`, newRequest, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchMyRequests();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteRequest = async (id) => {
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`${REQUESTS_API_URL}/requests/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchMyRequests();
        } catch (error) {
            console.error(error);
        }
    };    return (
        <div className="app-container">
            <Sidebar role={role} />
            <div className="dashboard-container">                <header className="dashboard-header">
                    <h1>Requests</h1>
                </header>
                <div className="dashboard-content">
                    {error && <p style={{ color: "red" }}>{error}</p>}            {role === "user" && (                <div className="card">
                    <h3>Create New Request</h3>
                    <div className="form-group">
                        <label>Select Item</label>
                        <select
                            className="styled-input"
                            value={newRequest.inventory_id}
                            onChange={(e) => setNewRequest({ ...newRequest, inventory_id: parseInt(e.target.value) })}
                        >
                            <option value="">Select Item</option>
                            {availableItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name} (Available: {item.quantity})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Quantity</label>
                        <input
                            className="styled-input"
                            type="number"
                            min="1"
                            value={newRequest.quantity}
                            onChange={(e) => setNewRequest({ ...newRequest, quantity: parseInt(e.target.value) })}
                        />
                    </div>
                    <button className="action-button primary" onClick={handleCreateRequest}>Submit Request</button>

                    <h3 className="section-title">My Requests</h3>
                    <div className="request-list">
                        {requests.map((req) => (
                            <div key={req.id} className="request-item">
                                <div className="request-details">
                                    <strong>{req.inventory.name}</strong> - {req.quantity} units
                                    <span className={`status-badge status-${req.status}`}>{req.status}</span>
                                </div>
                                {req.status === "pending" && (
                                    <button className="action-button secondary" onClick={() => handleDeleteRequest(req.id)}>Cancel</button>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div className="back-dashboard-container">
                        <button className="action-button back-dashboard-btn" onClick={() => navigate("/dashboard")}>
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}{role === "admin" && (                <div className="card">
                    <div className="tab-buttons">
                        <button 
                            className={`tab-button ${!viewingHistory ? 'active' : ''}`} 
                            onClick={fetchPendingRequests} 
                            disabled={!viewingHistory}
                        >
                            Pending Requests
                        </button>
                        <button 
                            className={`tab-button ${viewingHistory ? 'active' : ''}`} 
                            onClick={fetchRequestHistory} 
                            disabled={viewingHistory}
                        >
                            Request History
                        </button>
                    </div>

                    <h3 className="section-title">{viewingHistory ? "Request History" : "Pending Requests"}</h3>
                    <div className="request-list admin">
                        {requests.map((req) => {
                            const itemAvailable = availableItems.find(item => item.id === req.inventory_id);
                            const availableQty = itemAvailable ? itemAvailable.quantity : "Unknown";

                            return (
                                <div key={req.id} className="request-item admin">
                                    <div className="request-details">
                                        <div>
                                            <strong>{req.inventory.name}</strong> - {req.quantity} units requested
                                            <span className="availability-info">(Available: {availableQty})</span>
                                        </div>
                                        <div className="request-meta">
                                            <span className={`status-badge status-${req.status}`}>{req.status}</span>
                                            <span className="user-info">Requested by: {req.user_id}</span>
                                        </div>
                                    </div>
                                    {!viewingHistory && (
                                        <div className="request-actions">
                                            <button className="action-button success" onClick={() => handleAcceptRequest(req.id)}>Accept</button>
                                            <button className="action-button danger" onClick={() => handleDeclineRequest(req.id)}>Decline</button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="back-dashboard-container">
                        <button className="action-button back-dashboard-btn" onClick={() => navigate("/dashboard")}>
                            Back to Dashboard
                        </button>                    </div>
                </div>
            )}
                </div>
            </div>
        </div>
    );
}

export default RequestsPage;
