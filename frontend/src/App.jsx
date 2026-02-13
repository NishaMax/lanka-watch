import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null); // Keep a reference to the map object
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: '', description: '', lat: 0, lng: 0 });

  const fetchReports = () => {
    fetch('http://127.0.0.1:8000/reports/')
      .then(res => res.json())
      .then(data => setReports(data));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (map.current) return; // Prevent double initialization
    
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [80.3992, 6.6828], // Set to Ratnapura for a local feel
      zoom: 10
    });

    // CLICK HANDLER: Capture coordinates when the user clicks the map
    map.current.on('click', (e) => {
      setFormData(prev => ({ ...prev, lat: e.lngLat.lat, lng: e.lngLat.lng }));
      setShowForm(true);
    });
  }, []);

  // Update markers when reports list changes
  useEffect(() => {
    if (!map.current) return;
    reports.forEach(report => {
      new maplibregl.Marker({ color: "#FF0000" })
        .setLngLat([report.lng, report.lat])
        .setPopup(new maplibregl.Popup().setHTML(`<b>${report.category}</b><p>${report.description}</p>`))
        .addTo(map.current);
    });
  }, [reports]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://127.0.0.1:8000/reports/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      alert("Report submitted!");
      setShowForm(false);
      fetchReports(); // Refresh the map markers
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* THE FORM OVERLAY */}
      {showForm && (
        <div style={{ position: 'absolute', top: 20, left: 20, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000 }}>
          <h3>Report an Issue</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Category (e.g. Fuel)" required 
              onChange={e => setFormData({...formData, category: e.target.value})} /><br/><br/>
            <textarea placeholder="Description" required 
              onChange={e => setFormData({...formData, description: e.target.value})} /><br/>
            <p><small>Location: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</small></p>
            <button type="submit">Submit Report</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;