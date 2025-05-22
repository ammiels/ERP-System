import React, { useState } from 'react';
import { SearchIcon } from '../Icons';

function InventorySearch({ onSearch, inventoryItems }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({ term: searchTerm, filter: filterBy });
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Show real-time results as user types (if we have inventory items)
    if (value.length > 1 && inventoryItems?.length > 0) {
      const filteredResults = inventoryItems
        .filter(item => item.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5); // Limit to 5 results
      setSearchResults(filteredResults);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const selectSearchItem = (item) => {
    setSearchTerm(item.name);
    setShowDropdown(false);
    onSearch({ term: item.name, filter: filterBy });
  };

  return (
    <div className="inventory-search">
      <form onSubmit={handleSearch}>
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="styled-input"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={handleInputChange}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {showDropdown && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map(item => (
                  <div 
                    key={item.id} 
                    className="search-result-item"
                    onClick={() => selectSearchItem(item)}
                  >
                    <span>{item.name}</span>
                    <span className={`quantity-badge ${item.quantity < 10 ? 'low' : ''}`}>
                      {item.quantity} in stock
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <select 
            className="styled-input"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">All Items</option>
            <option value="lowStock">Low Stock</option>
            <option value="inStock">In Stock</option>
            <option value="newest">Newest First</option>
          </select>
          
          <button type="submit" className="action-button">
            <span className="action-icon"><SearchIcon /></span>
            Search
          </button>
        </div>
      </form>
    </div>
  );
}

export default InventorySearch;