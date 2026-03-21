import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';

// Dynamic color computation based on real demand score
const getZoneColor = (score) => {
  if (score > 1000) return { fillColor: '#ef4444', color: '#dc2626' }; // Red High
  if (score > 300) return { fillColor: '#eab308', color: '#ca8a04' }; // Yellow Medium
  return { fillColor: '#22c55e', color: '#16a34a' }; // Green Low
};

export default function HeatmapPage() {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    axios.get(`${API_URL}/heatmap-data`)
      .then(res => setZones(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="h-[calc(100vh-73px)] w-full relative z-0">
      <div className="absolute top-6 right-6 z-[1000] bg-dark-800/90 backdrop-blur border border-dark-700 p-4 rounded-xl shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Live Hunger Heatmap (AI)</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span> Critical Deficit (&gt;1000 score)
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]"></span> Rising Demand
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span> Stable / Fulfilling
          </div>
        </div>
      </div>

      <MapContainer center={[40.7300, -73.9900]} zoom={12} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {zones.map(zone => {
           const colorOpts = getZoneColor(zone.heat_score);
           // Dynamic radius based on demand intensity
           const mapRadius = Math.max(800, Math.min(3000, zone.heat_score * 5));
           
           return (
            <Circle
              key={zone.id}
              center={[zone.latitude, zone.longitude]}
              radius={mapRadius}
              pathOptions={{ 
                ...colorOpts,
                fillOpacity: 0.5,
                weight: 1
              }}
            >
              <Popup className="text-dark-900">
                <b className="text-lg">{zone.name}</b><br/>
                <b>Required:</b> {zone.required_quantity} meals<br/>
                <b>Missing:</b> <span className="text-red-600 font-bold">{zone.required_quantity - zone.fulfilled_quantity}</span> meals<br/>
                <hr className="my-1"/>
                Heat Score: {zone.heat_score.toFixed(1)}
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>
    </div>
  );
}
