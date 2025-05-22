import React, { useState } from "react";

function InventoryForm({ onSubmit, submitLabel }) {
    const [formData, setFormData] = useState({
        name: "",
        quantity: "",
        description: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.quantity) {
            alert("Name and Quantity are required.");
            return;
        }

        // Convert quantity to a number
        const payload = {
            ...formData,
            quantity: parseInt(formData.quantity, 10),
        };

        onSubmit(payload);
        setFormData({ name: "", quantity: "", description: "" }); // Clear after submit
    };    return (
        <form onSubmit={handleSubmit} className="inventory-form">
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="name">Item Name</label>
                    <input
                        className="styled-input"
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter item name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="quantity">Quantity</label>
                    <input
                        className="styled-input"
                        type="number"
                        id="quantity"
                        name="quantity"
                        placeholder="Enter quantity"                        value={formData.quantity}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input
                        className="styled-input"
                        type="text"
                        id="description"
                        name="description"
                        placeholder="Enter description (optional)"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <button className="action-button primary" type="submit">
                {submitLabel || "Add Item"}
            </button>
        </form>
    );
}

export default InventoryForm;
