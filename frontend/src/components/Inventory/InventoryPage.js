import React, { useEffect, useState } from "react";
import axios from "axios";
import { INVENTORY_API_URL } from "../../config";
import InventoryForm from "./InventoryForm";
import InventoryItem from "./InventoryItem";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";

function InventoryPage() {
    const [items, setItems] = useState([]);
    const [error, setError] = useState(""); 
    const navigate = useNavigate();

    const fetchItems = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${INVENTORY_API_URL}/inventory`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(response.data);
        } catch (error) {
            setError("Failed to fetch inventory items.");
            console.error("Error fetching inventory:", error);
        }
    };

    const handleAddItem = async (item) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${INVENTORY_API_URL}/inventory`, item, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems([...items, response.data]); 
        } catch (error) {
            setError("Failed to add item.");
            console.error("Error adding item:", error);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(`${INVENTORY_API_URL}/inventory/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(items.filter((item) => item.id !== id));
            console.log(response.data.message);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setError(error.response.data.detail);
            } else {
                setError("Failed to delete item.");
            }
            console.error("Error deleting item:", error);
        }
    };
    

    const handleUpdateItem = async (id, updatedItem) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(`${INVENTORY_API_URL}/inventory/${id}`, updatedItem, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(items.map((item) => (item.id === id ? response.data : item)));
        } catch (error) {
            setError("Failed to update item.");
            console.error("Error updating item:", error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);    return (        <div className="app-container">
            <Sidebar role="admin" />
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>Inventory Management</h1>
                </header>
                  <div className="dashboard-content">
                    {error && <div className="error-message">{error}</div>}
                    <div className="card">
                        <h2>Add New Item</h2>
                        <InventoryForm onSubmit={handleAddItem} submitLabel="Add Item" />
                    </div>
                    
                    <div className="card">
                        <h2>Inventory Items</h2>
                        <div className="inventory-list">
                            {items.length > 0 ? (
                                items.map((item) => (
                                    <InventoryItem
                                        key={item.id}
                                        item={item}
                                        onDelete={handleDeleteItem}
                                        onUpdate={handleUpdateItem}
                                    />
                                ))
                            ) : (                                
                                <p>No inventory items available</p>
                            )}
                        </div>
                        
                        <div className="back-dashboard-container">
                            <button className="action-button back-dashboard-btn" onClick={() => navigate("/dashboard")}>
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InventoryPage;
