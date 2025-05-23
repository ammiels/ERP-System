import React, { useEffect, useState } from "react";
import axios from "axios";
import { INVENTORY_API_URL } from "../../config";
import InventoryForm from "./InventoryForm";
import InventoryItem from "./InventoryItem";
import DataImportExport from "./DataImportExport";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";

function InventoryPage() {
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");
    const [importSuccess, setImportSuccess] = useState(""); 
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${INVENTORY_API_URL}/inventory`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(response.data);
        } catch (error) {
            setError("Failed to fetch inventory items.");
            console.error("Error fetching inventory:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddItem = async (item) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${INVENTORY_API_URL}/inventory`, item, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems([...items, response.data]); 
        } catch (error) {
            setError("Failed to add item.");
            console.error("Error adding item:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteItem = async (id) => {
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    };
    

    const handleUpdateItem = async (id, updatedItem) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(`${INVENTORY_API_URL}/inventory/${id}`, updatedItem, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(items.map((item) => (item.id === id ? response.data : item)));
        } catch (error) {
            setError("Failed to update item.");
            console.error("Error updating item:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Handle data import - just refresh data after import
    const handleDataImport = async () => {
        await fetchItems();
    };
    
    // Clear error message after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        fetchItems();
    }, []);
    
    return (        
        <div className="app-container">
            <Sidebar role="admin" />
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>Inventory Management</h1>
                </header>
                <div className="dashboard-content">
                    {error && <div className="error-message">{error}</div>}
                    {importSuccess && <div className="success-message">{importSuccess}</div>}
                    
                    <div className="card">
                        <h2>Add New Item</h2>
                        <InventoryForm 
                            onSubmit={handleAddItem} 
                            submitLabel="Add Item"
                            isDisabled={isLoading} 
                        />
                    </div>
                    
                    <div className="card">
                        <h2>Import/Export Data</h2>
                        <DataImportExport 
                            items={items} 
                            onImport={handleDataImport} 
                        />
                    </div>
                    
                    <div className="card">
                        <h2>Inventory Items {isLoading && <span className="loading-indicator">Loading...</span>}</h2>
                        <div className="inventory-list">
                            {items.length > 0 ? (
                                items.map((item) => (
                                    <InventoryItem
                                        key={item.id}
                                        item={item}
                                        onDelete={handleDeleteItem}
                                        onUpdate={handleUpdateItem}
                                        isDisabled={isLoading}
                                    />
                                ))
                            ) : (                                
                                <p>{isLoading ? 'Loading inventory items...' : 'No inventory items available'}</p>
                            )}
                        </div>
                        
                        <div className="back-dashboard-container">
                            <button 
                                className="action-button back-dashboard-btn" 
                                onClick={() => navigate("/dashboard")}
                                disabled={isLoading}
                            >
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
