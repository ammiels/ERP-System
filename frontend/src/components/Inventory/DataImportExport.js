import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import { INVENTORY_API_URL } from "../../config";

function DataImportExport({ items, onImport }) {
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Function to export data as CSV directly from server
  const exportToCsv = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      // Using the new server endpoint for CSV export
      const response = await axios({
        url: `${INVENTORY_API_URL}/inventory/export/csv`,
        method: 'GET',
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob', // Important for handling binary data
      });
      
      // Create a download link for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setImportError('Error exporting data. Please try again.');
      setTimeout(() => setImportError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to export data as JSON directly from server
  const exportToJson = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      // Using the new server endpoint for JSON export
      const response = await axios({
        url: `${INVENTORY_API_URL}/inventory/export/json`,
        method: 'GET',
        headers: { 
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Format the JSON data nicely
      const jsonData = JSON.stringify(response.data, null, 2);
      
      // Create a download link for the JSON
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-export-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      setImportError('Error exporting data. Please try again.');
      setTimeout(() => setImportError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to export data as PDF
  const exportToPdf = () => {
    // No server endpoint for PDF - using client-side generation
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Inventory Report', 14, 22);
    
    // Add date
    const today = new Date();
    doc.setFontSize(11);
    doc.text(`Generated: ${today.toLocaleDateString()}`, 14, 30);
    
    // Create the table
    const tableColumn = ["ID", "Name", "Quantity", "Description", "Stock Status"];
    const tableRows = [];
    
    items.forEach(item => {
      const stockStatus = item.quantity < 10 ? "LOW STOCK" : "IN STOCK";
      const itemData = [
        item.id,
        item.name,
        item.quantity,
        item.description || "N/A",
        stockStatus
      ];
      tableRows.push(itemData);
    });
    
    // Generate the table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headerStyles: {
        fillColor: [75, 156, 211],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Add summary
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Items: ${items.length}`, 14, finalY);
    doc.text(`Low Stock Items: ${items.filter(item => item.quantity < 10).length}`, 14, finalY + 7);
    
    // Save the PDF
    doc.save('inventory-report.pdf');
  };

  // Function to trigger file input click
  const triggerImportFile = () => {
    fileInputRef.current.click();
  };
  
  // Function to handle import of CSV or JSON file using bulk import API
  const handleImportFile = async (e) => {
    setImportError('');
    setImportSuccess('');
    
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file extension
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      setImportError('Please select a CSV or JSON file');
      e.target.value = null;
      return;
    }

    setIsLoading(true);
    
    try {
      let importedItems = [];
      
      if (file.name.endsWith('.csv')) {
        // Process CSV file
        const parseResult = await new Promise(resolve => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: resolve
          });
        });
        
        if (parseResult.errors.length > 0) {
          setImportError(`Error parsing CSV: ${parseResult.errors[0].message}`);
          e.target.value = null;
          setIsLoading(false);
          return;
        }
        
        // Process the CSV data
        importedItems = parseResult.data.map(row => ({
          name: row.name || '',
          quantity: parseInt(row.quantity) || 0,
          description: row.description || ''
        })).filter(item => item.name && !isNaN(item.quantity));
        
      } else {
        // Process JSON file
        const jsonData = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(JSON.parse(event.target.result));
          reader.readAsText(file);
        });
        
        // Verify the data is an array
        if (!Array.isArray(jsonData)) {
          setImportError('Invalid JSON format. Expected an array of items.');
          e.target.value = null;
          setIsLoading(false);
          return;
        }
        
        // Map and validate the JSON data
        importedItems = jsonData.map(item => ({
          name: item.name || '',
          quantity: parseInt(item.quantity) || 0,
          description: item.description || ''
        })).filter(item => item.name && !isNaN(item.quantity));
      }
      
      if (importedItems.length === 0) {
        setImportError('No valid data found in the file');
        e.target.value = null;
        setIsLoading(false);
        return;
      }
      
      // Use bulk import API endpoint
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${INVENTORY_API_URL}/inventory/bulk-import`, 
        { items: importedItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Show results
      const { successful_imports, failed_imports } = response.data;
      
      if (successful_imports > 0) {
        setImportSuccess(`Successfully imported ${successful_imports} items.` +
                       (failed_imports > 0 ? ` ${failed_imports} items failed.` : ''));
        
        // Refresh inventory data after successful import
        onImport(importedItems);
      } else {
        setImportError(`Import failed. ${failed_imports} items could not be imported.`);
      }
      
      // Clear success message after 5 seconds
      if (successful_imports > 0) {
        setTimeout(() => setImportSuccess(''), 5000);
      }
      
    } catch (error) {
      console.error('Error importing data:', error);
      setImportError(error.response?.data?.detail || 'Error importing data. Please try again.');
    } finally {
      setIsLoading(false);
      e.target.value = null;
    }
  };

  return (
    <div className="data-import-export">
      <h3>Import/Export Data</h3>
      
      <div className="import-export-controls">
        <div className="export-section">
          <h4>Export Options</h4>
          <div className="button-group">
            <button 
              className="action-button" 
              onClick={exportToCsv}
              disabled={isLoading || !items || items.length === 0}
            >
              {isLoading ? 'Processing...' : 'Export to CSV'}
            </button>
            <button 
              className="action-button" 
              onClick={exportToJson}
              disabled={isLoading || !items || items.length === 0}
            >
              {isLoading ? 'Processing...' : 'Export to JSON'}
            </button>
            <button 
              className="action-button" 
              onClick={exportToPdf}
              disabled={isLoading || !items || items.length === 0}
            >
              {isLoading ? 'Processing...' : 'Export to PDF'}
            </button>
          </div>
        </div>
        
        <div className="import-section">
          <h4>Import Data</h4>
          <div className="button-group">
            <button 
              className="action-button"
              onClick={triggerImportFile}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Import from File (CSV/JSON)'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />
          </div>
          
          {importError && (
            <div className="error-message">
              {importError}
            </div>
          )}
          
          {importSuccess && (
            <div className="success-message">
              {importSuccess}
            </div>
          )}
          
          <div className="import-instructions">
            <p>CSV Format: Each row should contain name, quantity, and description (optional)</p>
            <p>JSON Format: Array of objects with name, quantity, and description fields</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataImportExport;
