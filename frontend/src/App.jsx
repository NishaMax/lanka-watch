import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('All'); // Task 6: Filter state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: '', description: '', lat: 0, lng: 0 });

  // 1. Fetch data from Backend
  const fetchReports = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/reports/');
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // 3. Filter & Marker Logic

  const handleVerify = async (id) => {
    await fetch(`http://127.0.0.1:8000/reports/${id}/verify`, { method: 'POST' });
    fetchReports();
  };

  const handleDelete = async (id) => {
    await fetch(`http://127.0.0.1:8000/reports/${id}`, { method: 'DELETE' });
    fetchReports();
  };

  useEffect(() => {
    if (!map.current) return;

    // Remove all existing markers from the map
    const currentMarkers = document.querySelectorAll('.maplibregl-marker');
    currentMarkers.forEach(m => m.remove());

    // Apply Filter
    const filteredReports = filter === 'All' 
      ? reports 
      : reports.filter(r => r.category === filter);

    filteredReports.forEach(report => {
      const markerColor = report.status === 'verified' ? "#00FF00" : "#FF0000";
      
      const popupNode = document.createElement('div');
      popupNode.style.padding = "5px";
      popupNode.innerHTML = `
        <h3 style="margin:0">${report.category}</h3>
        <p style="margin:5px 0">${report.description}</p>
        <p><strong>Confirmations: ${report.verifications || 0}</strong></p>
        <div style="display: flex; gap: 5px;">
          <button id="verify-${report.id}" style="background:#28a745; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; flex: 2;">
            Confirm ✅
          </button>
          <button id="delete-${report.id}" style="background:#dc3545; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; flex: 1;">
            🗑️
          </button>
        </div>
      `;

      popupNode.querySelector(`#verify-${report.id}`).addEventListener('click', async () => {
        await handleVerify(report.id);
      });

      popupNode.querySelector(`#delete-${report.id}`).addEventListener('click', async () => {
        if(window.confirm("Delete this report?")) {
          await handleDelete(report.id);
        }
      });

      const popup = new maplibregl.Popup({ offset: 25 }).setDOMContent(popupNode);

      new maplibregl.Marker({ color: markerColor })
        .setLngLat([report.lng, report.lat])
        .setPopup(popup)
        .addTo(map.current);
    });
  }, [reports, filter]); // Re-run when reports OR filter change

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://127.0.0.1:8000/reports/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setShowForm(false);
    fetchReports();
  };

  return (
  <div style={{ width: '100vw', height: '100vh', position: 'relative', fontFamily: 'Arial, sans-serif' }}>
    <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

    {/* SIDEBAR FILTER - Fixed Colors */}
    <div style={{ 
      position: 'absolute', top: 20, right: 20, 
      background: '#ffffff', color: '#333333', // Explicit white background and dark text
      padding: '15px', borderRadius: '12px', zIndex: 1000, 
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)', width: '180px' 
    }}>
      <h4 style={{ margin: '0 0 12px 0', borderBottom: '1px solid #ddd', paddingBottom: '8px', color: '#000' }}>Categories</h4>
      {['All', 'Flood', 'Fuel', 'Traffic', 'Hazard'].map(cat => (
        <label key={cat} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
          <input 
            type="radio" 
            name="filter" 
            checked={filter === cat} 
            onChange={() => setFilter(cat)} 
            style={{ marginRight: '8px' }}
          /> {cat}
        </label>
      ))}
    </div>

    {/* SUBMISSION FORM - Fixed Colors */}
    {showForm && (
      <div style={{ 
        position: 'absolute', top: 20, left: 20, 
        background: '#ffffff', color: '#333333', // Explicit white background and dark text
        padding: '20px', borderRadius: '12px', zIndex: 1000, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)', width: '260px' 
      }}>
        <h3 style={{ marginTop: 0, color: '#000' }}>Report Issue</h3>
        <form onSubmit={handleSubmit}>
          <select 
            required 
            style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', color: '#000' }}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="">Select Category</option>
            <option value="Flood">Flood</option>
            <option value="Fuel">Fuel</option>
            <option value="Traffic">Traffic</option>
            <option value="Hazard">Hazard</option>
          </select>
          <textarea 
            placeholder="Describe the situation..." 
            required 
            style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', height: '80px', background: '#fff', color: '#000' }}
            onChange={e => setFormData({ ...formData, description: e.target.value })} 
          />
          <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>Submit Report</button>
          <button type="button" onClick={() => setShowForm(false)} style={{ width: '100%', marginTop: '10px', border: 'none', background: 'none', cursor: 'pointer', color: '#dc3545' }}>Cancel</button>
        </form>
      </div>
    )}
  </div>
  );
}

export default App;