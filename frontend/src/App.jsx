import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

function App() {
  const mapContainer = useRef(null);
  const [reports, setReports] = useState([]);

  // 1. Fetch data from your FastAPI backend
  useEffect(() => {
    fetch('http://127.0.0.1:8000/reports/') // We will create this GET endpoint next
      .then(res => res.json())
      .then(data => setReports(data));
  }, []);

  // 2. Initialize the Map
  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/bright', // Free Map Tiles
      center: [80.7718, 7.8731], // Center of Sri Lanka
      zoom: 7
    });

    // Add navigation controls (zoom in/out)
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // 3. Add markers for each report
    reports.forEach(report => {
      new maplibregl.Marker()
        .setLngLat([report.lng, report.lat])
        .setPopup(new maplibregl.Popup().setHTML(`<h3>${report.category}</h3><p>${report.description}</p>`))
        .addTo(map);
    });

    return () => map.remove();
  }, [reports]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default App;