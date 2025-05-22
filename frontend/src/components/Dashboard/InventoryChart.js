import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

function InventoryChart({ items }) {
  // Process data for charts
  const lowStockItems = items.filter(item => item.quantity < 10);
  const healthyStockItems = items.filter(item => item.quantity >= 10);
  
  // Data for pie chart
  const pieData = {
    labels: ['Low Stock', 'Healthy Stock'],
    datasets: [
      {
        data: [lowStockItems.length, healthyStockItems.length],
        backgroundColor: ['var(--secondary-color)', 'var(--graph-blue)'],
        borderColor: ['rgba(255, 107, 107, 1)', 'rgba(75, 156, 211, 1)'],
        borderWidth: 1,
      },
    ],
  };
  
  // Get top 5 items by quantity for bar chart
  const topItems = [...items]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
    
  const barData = {
    labels: topItems.map(item => item.name),
    datasets: [
      {
        label: 'Quantity',
        data: topItems.map(item => item.quantity),
        backgroundColor: 'var(--graph-blue)',
      },
    ],
  };
  
  return (
    <div className="inventory-charts">
      <div className="chart-container">
        <h3>Stock Status</h3>
        <div className="pie-chart">
          <Pie data={pieData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
      
      <div className="chart-container">
        <h3>Top 5 Items by Quantity</h3>
        <div className="bar-chart">
          <Bar 
            data={barData} 
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                  },
                  ticks: {
                    color: 'var(--text-light)'
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    color: 'var(--text-light)'
                  }
                }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
}

export default InventoryChart;