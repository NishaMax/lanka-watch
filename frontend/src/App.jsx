import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: '', description: '', lat: 0, lng: 0 });

  // 1. Fetch data from Backend
  const fetchReports = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/reports/');
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // 2. Initialize Map
  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [80.3992, 6.6828], // Ratnapura
      zoom: 10
    });

    map.current.on('click', (e) => {
      setFormData(prev => ({ ...prev, lat: e.lngLat.lat, lng: e.lngLat.lng }));
      setShowForm(true);
    });
  }, []);

  // 3. Marker & Verification Logic
  useEffect(() => {
    if (!map.current || reports.length === 0) return;

    // Remove existing markers to refresh them
    const currentMarkers = document.querySelectorAll('.maplibregl-marker');
    currentMarkers.forEach(m => m.remove());

    reports.forEach(report => {
      const markerColor = report.status === 'verified' ? "#00FF00" : "#FF0000";
      
      const popupNode = document.createElement('div');
      popupNode.style.padding = "5px";
      popupNode.innerHTML = `
        <h3 style="margin:0">${report.category}</h3>
        <p style="margin:5px 0">${report.description}</p>
        <p><strong>Confirmations: ${report.verifications || 0}</strong></p>
        <button id="btn-${report.id}" style="background:#28a745; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; width:100%">
          Confirm ✅
        </button>
      `;

      // Attach listener to the button
      popupNode.querySelector('button').addEventListener('click', async () => {
        await handleVerify(report.id);
      });

      const popup = new maplibregl.Popup({ offset: 25 }).setDOMContent(popupNode);

      new maplibregl.Marker({ color: markerColor })
        .setLngLat([report.lng, report.lat])
        .setPopup(popup)
        .addTo(map.current);
    });
  }, [reports]);

  const handleVerify = async (id) => {
    try {
      await fetch(`http://127.0.0.1:8000/reports/${id}/verify`, { method: 'POST' });
      fetchReports();
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://127.0.0.1:8000/reports/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setShowForm(false);
      fetchReports();
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {showForm && (
        <div style={{ position: 'absolute', top: 20, left: 20, background: 'white', padding: '20px', borderRadius: '8px', zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
          <h3 style={{ marginTop: 0 }}>Report an Issue</h3>
          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              placeholder="Category" 
              required 
              style={{ width: '100%', marginBottom: '10px' }}
              onChange={e => setFormData({ ...formData, category: e.target.value })} 
            />
            <textarea 
              placeholder="Description" 
              required 
              style={{ width: '100%', marginBottom: '10px' }}
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
            />
            <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>Submit</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', border: 'none', background: 'none', cursor: 'pointer' }}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;