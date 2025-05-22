import React, { useState } from "react";

function InventoryItem({ item, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedItem, setEditedItem] = useState({
        name: item.name,
        quantity: item.quantity,
        description: item.description || "",
    });
    
    const handleSave = () => {
        onUpdate(item.id, editedItem);
        setIsEditing(false);
    };    if (isEditing) {
        return (
            <div className="inventory-item editing">
                <div className="form-group">
                    <label>Item Name</label>
                    <input
                        className="styled-input"
                        type="text"
                        value={editedItem.name}
                        onChange={(e) =>setEditedItem({ ...editedItem, name: e.target.value })}
                        placeholder="Name"
                    />
                </div>
                <div className="form-group">
                    <label>Quantity</label>
                    <input
                        className="styled-input"
                        type="number"
                        value={editedItem.quantity}
                        onChange={(e) => setEditedItem({ ...editedItem, quantity: parseInt(e.target.value) })}
                        placeholder="Quantity"
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <input
                        className="styled-input"
                        type="text"
                        value={editedItem.description}
                        onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
                        placeholder="Description"
                    />
                </div>
                <div className="item-actions">
                    <button className="action-button success" onClick={handleSave}>Save Changes</button>
                    <button className="action-button outline" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            </div>
        );
    }

    return (
        <div className="inventory-item">
            <div className="item-details">
                <h3 className="item-name">{item.name}</h3>
                <div className="item-meta">
                    <span className={`quantity-badge ${item.quantity < 10 ? 'low' : ''}`}>
                        {item.quantity < 10 ? 'Low Stock' : 'In Stock'}: {item.quantity}
                    </span>
                </div>
                <p className="item-description">{item.description || "No description provided"}</p>
            </div>
            <div className="item-actions">
                <button className="action-button" onClick={() => setIsEditing(true)}>Update</button>
                <button className="action-button danger" onClick={() => onDelete(item.id)}>Delete</button>
            </div>
        </div>
    );
}

export default InventoryItem;