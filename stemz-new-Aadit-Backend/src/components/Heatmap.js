import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Heatmap.css";

const Heatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Add timeout to prevent infinite loading state
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await axios.get("http://localhost:5000/api/heatmap", {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        // Validate the response data structure
        if (!Array.isArray(response.data)) {
          throw new Error('Invalid data format received');
        }

        // Log the received data for debugging
        console.log('Received data:', response.data);
        
        setHeatmapData(response.data);
      } catch (err) {
        console.error('Error details:', err);
        setError(err.message || 'Failed to fetch heatmap data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getHeatmapColor = (score, maxScore) => {
    if (!maxScore) return 'rgb(255, 255, 255)'; // Default white for zero scores
    const intensity = Math.floor((score / maxScore) * 255);
    return `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
  };

  const maxScore = heatmapData.length > 0
    ? Math.max(
        ...heatmapData.flatMap((module) => 
          module.data?.map((entry) => entry.engagement) || []
        )
      )
    : 0;

  if (isLoading) {
    return (
      <div className="heatmap-container">
        <div className="loading-spinner">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="heatmap-container">
        <div className="error-message">
          Error: {error}
          <p>Please check your backend connection and try again.</p>
        </div>
      </div>
    );
  }

  if (!heatmapData.length) {
    return (
      <div className="heatmap-container">
        <div className="no-data-message">
          No data available. Please ensure your database is populated.
        </div>
      </div>
    );
  }

  return (
    <div className="heatmap-container">
      <div className="heatmap-grid">
        {heatmapData.map((module, moduleIndex) => (
          <div key={moduleIndex} className="heatmap-module">
            <h3 className="module-title">{module.module}</h3>
            <div className="heatmap-row">
              {module.data?.map((entry, entryIndex) => (
                <div
                  key={entryIndex}
                  className="heatmap-cell"
                  style={{
                    backgroundColor: getHeatmapColor(entry.engagement, maxScore),
                  }}
                >
                  <div className="cell-time">{entry.time}</div>
                  <div className="cell-value">{entry.engagement}%</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Heatmap;