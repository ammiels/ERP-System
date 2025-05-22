import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

function ExportInventory({ items }) {
  const generatePDF = () => {
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
  
  return (
    <button className="action-button" onClick={generatePDF}>
      <span>Export Inventory (PDF)</span>
    </button>
  );
}

export default ExportInventory;