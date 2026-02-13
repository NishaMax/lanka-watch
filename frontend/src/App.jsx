import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: '', description: '', lat: 0, lng: 0 });
  
  // New State for Search
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/reports/');
      const data = await res.json();
      setReports(data);
    } catch (err) { console.error(err); }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchReports(); }, []);

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

  // Search Function Logic
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}, Sri Lanka`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        map.current.flyTo({
          center: [parseFloat(lon), parseFloat(lat)],
          zoom: 12,
          essential: true
        });
      } else {
        alert("Location not found in Sri Lanka.");
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  // Marker & Filter Logic (Keeping your working code)
  useEffect(() => {
    if (!map.current) return;
    const currentMarkers = document.querySelectorAll('.maplibregl-marker');
    currentMarkers.forEach(m => m.remove());

    const filteredReports = filter === 'All' ? reports : reports.filter(r => r.category === filter);

    filteredReports.forEach(report => {
      const markerColor = report.status === 'verified' ? "#00FF00" : "#FF0000";
      const popupNode = document.createElement('div');
      popupNode.style.padding = "5px";
      popupNode.innerHTML = `
        <h3 style="margin:0; color:#000;">${report.category}</h3>
        <p style="margin:5px 0; color:#333;">${report.description}</p>
        <button id="verify-${report.id}" style="background:#28a745; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer;">Confirm ✅</button>
      `;

      popupNode.querySelector('button').addEventListener('click', async () => {
        await fetch(`http://127.0.0.1:8000/reports/${report.id}/verify`, { method: 'POST' });
        fetchReports();
      });

      const popup = new maplibregl.Popup({ offset: 25 }).setDOMContent(popupNode);
      new maplibregl.Marker({ color: markerColor }).setLngLat([report.lng, report.lat]).setPopup(popup).addTo(map.current);
    });
  }, [reports, filter]);

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

      {/* NEW: SEARCH BAR UI */}
      {/* SEARCH BAR UI - Clean White Version */}
<div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: '350px' }}>
  <form onSubmit={handleSearch} style={{ 
    display: 'flex', 
    gap: '5px', 
    background: '#ffffff', // Explicit white
    padding: '8px 15px', 
    borderRadius: '30px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)' 
  }}>
    <input 
      type="text" 
      placeholder="Search city in Sri Lanka..." 
      style={{ 
        border: 'none', 
        outline: 'none', 
        padding: '8px', 
        flex: 1, 
        fontSize: '14px',
        color: '#000000', // Dark text for readability
        background: 'transparent'
      }}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    <button type="submit" style={{ 
      background: '#007bff', 
      color: 'white', 
      border: 'none', 
      borderRadius: '50%', 
      width: '35px', 
      height: '35px', 
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>🔍</button>
  </form>
</div>

      {/* SIDEBAR FILTER (With fixed colors from before) */}
      <div style={{ position: 'absolute', top: 20, right: 20, background: '#ffffff', color: '#000', padding: '15px', borderRadius: '12px', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)', width: '180px' }}>
        <h4 style={{ margin: '0 0 12px 0', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>Categories</h4>
        {['All', 'Flood', 'Fuel', 'Traffic', 'Hazard'].map(cat => (
          <label key={cat} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer', fontSize: '14px' }}>
            <input type="radio" name="filter" checked={filter === cat} onChange={() => setFilter(cat)} style={{ marginRight: '8px' }} /> {cat}
          </label>
        ))}
      </div>

      {/* SUBMISSION FORM */}
      {showForm && (
        <div style={{ position: 'absolute', top: 80, left: 20, background: '#ffffff', color: '#000', padding: '20px', borderRadius: '12px', zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', width: '260px' }}>
          <h3 style={{ marginTop: 0 }}>Report Issue</h3>
          <form onSubmit={handleSubmit}>
            <select required style={{ width: '100%', marginBottom: '10px', padding: '10px', background: '#fff', color: '#000' }} onChange={e => setFormData({ ...formData, category: e.target.value })}>
              <option value="">Select Category</option>
              <option value="Flood">Flood</option>
              <option value="Fuel">Fuel</option>
              <option value="Traffic">Traffic</option>
              <option value="Hazard">Hazard</option>
            </select>
            <textarea placeholder="Describe..." required style={{ width: '100%', marginBottom: '10px', padding: '10px', height: '80px', background: '#fff', color: '#000' }} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>Submit</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ width: '100%', marginTop: '10px', border: 'none', background: 'none', cursor: 'pointer', color: '#dc3545' }}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;