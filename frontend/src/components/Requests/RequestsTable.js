import React, { useState } from 'react';

function RequestsTable({ requests, onAccept, onDecline, onDelete, isAdmin, isHistory }) {
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRequests = [...requests].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    // Sort by different fields
    if (sortField === 'id') {
      return (a.id - b.id) * direction;
    } else if (sortField === 'status') {
      return a.status.localeCompare(b.status) * direction;
    } else if (sortField === 'quantity') {
      return (a.quantity - b.quantity) * direction;
    } else if (sortField === 'item_name') {
      return a.inventory.name.localeCompare(b.inventory.name) * direction;
    }
    
    return 0;
  });

  return (
    <div className="requests-table-container">
      <table className="requests-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('id')} className={sortField === 'id' ? 'sorted' : ''}>
              ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('item_name')} className={sortField === 'item_name' ? 'sorted' : ''}>
              Item {sortField === 'item_name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('quantity')} className={sortField === 'quantity' ? 'sorted' : ''}>
              Quantity {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('status')} className={sortField === 'status' ? 'sorted' : ''}>
              Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            {isAdmin && <th>Requested By</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedRequests.map(req => (
            <tr key={req.id}>
              <td>{req.id}</td>
              <td>{req.inventory.name}</td>
              <td>{req.quantity}</td>
              <td>
                <span className={`status-badge status-${req.status}`}>{req.status}</span>
              </td>
              {isAdmin && <td>{req.user_id}</td>}
              <td>
                <div className="table-actions">
                  {isAdmin && !isHistory && req.status === 'pending' && (
                    <>
                      <button className="action-button small primary" onClick={() => onAccept(req.id)}>Accept</button>
                      <button className="action-button small secondary" onClick={() => onDecline(req.id)}>Decline</button>
                    </>
                  )}
                  {!isAdmin && req.status === 'pending' && (
                    <button className="action-button small danger" onClick={() => onDelete(req.id)}>Cancel</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RequestsTable;