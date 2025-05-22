// dynamicImports.js - Utility functions for safely loading dynamic imports

/**
 * Safely imports a module and returns it or a fallback if import fails
 * @param {Function} importFunction - A function that returns the dynamic import (e.g., () => import('module'))
 * @param {Object} fallback - A fallback value to return if the import fails
 * @param {Function} onSuccess - Optional callback when import succeeds
 * @param {Function} onError - Optional callback when import fails
 * @returns {Promise<any>} - The imported module or fallback value
 */
export async function safeImport(importFunction, fallback = {}, onSuccess = null, onError = null) {
  try {
    const module = await importFunction();
    if (onSuccess) onSuccess(module);
    return module;
  } catch (error) {
    console.error(`Error loading module dynamically: ${error.message}`);
    if (onError) onError(error);
    return fallback;
  }
}

/**
 * Safely imports Chart.js and React-ChartJS-2 modules
 * @returns {Promise<Object>} Object containing Chart.js and React-ChartJS-2 components or placeholders
 */
export async function loadChartDependencies() {
  try {
    // Import Chart.js
    const ChartJS = await import('chart.js');
    
    // Import React ChartJS 2
    const ReactChartJS2 = await import('react-chartjs-2');
    
    // Register required Chart.js components
    const {
      Chart,
      CategoryScale,
      LinearScale,
      BarElement,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend,
      ArcElement,
      RadialLinearScale,
      Filler
    } = ChartJS;
    
    Chart.register(
      CategoryScale,
      LinearScale,
      BarElement,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend,
      ArcElement,
      RadialLinearScale,
      Filler
    );
    
    return {
      Chart,
      Bar: ReactChartJS2.Bar,
      Line: ReactChartJS2.Line,
      Doughnut: ReactChartJS2.Doughnut,
      Pie: ReactChartJS2.Pie,
      Radar: ReactChartJS2.Radar,
      success: true
    };
  } catch (error) {
    console.error("Failed to load Chart.js dependencies:", error);
    
    // Create placeholder components
    const PlaceholderChart = () => (
      <div className="chart-error">
        <div className="chart-error-icon">⚠️</div>
        <div className="chart-error-text">
          Chart visualization could not be loaded. 
          <br />
          Please ensure Chart.js is installed.
        </div>
      </div>
    );
    
    return {
      Chart: {},
      Bar: PlaceholderChart,
      Line: PlaceholderChart,
      Doughnut: PlaceholderChart,
      Pie: PlaceholderChart,
      Radar: PlaceholderChart,
      success: false
    };
  }
}
