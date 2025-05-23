import React, { useEffect, useRef } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
// Import icons from Icons.js assuming they're defined there
import { InventoryIcon, WarningIcon, RequestsIcon } from '../Icons';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

// Enhanced chart options for better responsiveness
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  resizeDelay: 100, // Delay resize operations to improve performance
  onResize: function(chart, size) {
    // Custom resize handler if needed
  }
};

// Set default options for all charts
ChartJS.defaults.font.family = "'Segoe UI', 'Roboto', 'Oxygen', sans-serif";
ChartJS.defaults.color = '#d1d1d1'; // Lighter gray instead of bright white
ChartJS.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
ChartJS.defaults.backgroundColor = '#1e2530'; // Dark background that matches theme
ChartJS.defaults.responsive = true;
ChartJS.defaults.maintainAspectRatio = false;
ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(30, 37, 47, 0.9)';
ChartJS.defaults.plugins.tooltip.titleColor = '#fff';
ChartJS.defaults.plugins.tooltip.bodyColor = '#fff';
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.cornerRadius = 6;

function DashboardCharts({ inventoryItems, requestsHistory, role }) {
  // Create refs for charts
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const requestPieRef = useRef(null);
  
  // Effect for handling window resize
  useEffect(() => {
    const handleResize = () => {
      // Force charts to resize when window changes
      if (pieChartRef.current) {
        pieChartRef.current.resize();
      }
      if (barChartRef.current) {
        barChartRef.current.resize();
      }
      if (requestPieRef.current) {
        requestPieRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Return null if no data is available
  if ((!inventoryItems || inventoryItems.length === 0) && 
      (!requestsHistory || requestsHistory.length === 0)) {
    return null;
  }
  
  // Common animation options for charts
  const chartAnimations = {
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
    },
    responsive: true,
    maintainAspectRatio: false
  };
  
  // Only show specific charts based on user role
  return (
    <div className="inventory-charts">
      {/* For admin, show inventory-related charts */}
      {role === "admin" && inventoryItems && inventoryItems.length > 0 && (
        <>
          <div className="chart-container">
            <div className="chart-header">
              <div className="chart-icon">
                <InventoryIcon />
              </div>
              <h3>Stock Status</h3>
            </div>            <div className="pie-chart">
              <Pie 
                ref={pieChartRef}
                data={getStockStatusChart(inventoryItems)}
                options={{ 
                  ...chartAnimations,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#ffffff',
                        font: { size: 13, weight: 'bold' },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const value = context.parsed;
                          const percentage = Math.round((value / total) * 100);
                          return `${context.label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
          
          <div className="chart-container">
            <div className="chart-header">
              <div className="chart-icon">
                <WarningIcon />
              </div>
              <h3>Top 5 Items by Quantity</h3>
            </div>            <div className="bar-chart">
              <Bar 
                ref={barChartRef}
                data={getTopItemsChart(inventoryItems)}
                options={{
                  ...chartAnimations,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        color: '#ffffff',
                        font: { size: 13, weight: 'bold' }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        title: function(tooltipItem) {
                          return tooltipItem[0].label;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: '#ffffff',
                        font: { size: 12 }
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        color: '#ffffff',
                        font: { size: 12 }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </>
      )}
      
      {/* For all users, show request status chart if request data available */}
      {requestsHistory && requestsHistory.length > 0 && (
        <div className="chart-container" style={{ gridColumn: role === 'user' ? 'span 2' : 'auto' }}>
          <div className="chart-header">
            <div className="chart-icon">
              <RequestsIcon />
            </div>
            <h3>Request Status</h3>
          </div>          <div className="pie-chart">
            <Pie 
              ref={requestPieRef}
              data={getRequestStatusChart(requestsHistory)} 
              options={{ 
                ...chartAnimations,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#ffffff',
                      font: { size: 13, weight: 'bold' },
                      padding: 15,
                      usePointStyle: true,
                      pointStyle: 'circle'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to generate stock status chart data
function getStockStatusChart(items) {
  const lowStockItems = items.filter(item => item.quantity < 10);
  const healthyStockItems = items.filter(item => item.quantity >= 10);
  
  return {
    labels: ['Low Stock', 'Healthy Stock'],
    datasets: [
      {
        data: [lowStockItems.length, healthyStockItems.length],
        backgroundColor: ['rgba(255, 107, 107, 0.8)', 'rgba(75, 192, 192, 0.8)'],
        borderColor: ['rgba(255, 107, 107, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 2,
        hoverBackgroundColor: ['rgba(255, 107, 107, 1)', 'rgba(75, 192, 192, 1)'],
        hoverBorderColor: ['#fff', '#fff'],
        hoverBorderWidth: 2,
      },
    ],
  };
}

// Helper function to generate top items chart data
function getTopItemsChart(items) {
  // Get top 5 items by quantity
  const topItems = [...items]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
    
  return {
    labels: topItems.map(item => item.name),
    datasets: [
      {
        label: 'Quantity',
        data: topItems.map(item => item.quantity),
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',  // Teal
          'rgba(54, 162, 235, 0.8)',  // Blue
          'rgba(153, 102, 255, 0.8)', // Purple
          'rgba(255, 159, 64, 0.8)',  // Orange
          'rgba(255, 99, 132, 0.8)'   // Pink
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
        hoverBackgroundColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)'
        ],
      },
    ],
  };
}

// Helper function to generate request status chart data
function getRequestStatusChart(requests) {
  const pendingCount = requests.filter(req => req.status === 'pending').length;
  const approvedCount = requests.filter(req => req.status === 'approved').length;
  const declinedCount = requests.filter(req => req.status === 'declined').length;
  
  return {
    labels: ['Pending', 'Approved', 'Declined'],
    datasets: [
      {
        data: [pendingCount, approvedCount, declinedCount],
        backgroundColor: [
          'rgba(255, 206, 86, 0.8)',  // Brighter yellow for pending
          'rgba(75, 192, 192, 0.8)',   // Teal for approved
          'rgba(255, 107, 107, 0.8)'    // Coral for declined
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 107, 107, 1)'
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 107, 107, 1)'
        ],
        hoverBorderColor: ['#fff', '#fff', '#fff'],
        hoverBorderWidth: 2,
      },
    ],
  };
}

export default DashboardCharts;
