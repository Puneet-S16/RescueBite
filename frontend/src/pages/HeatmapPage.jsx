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
              <Popup className="custom-popup min-w-[250px]">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <b className="text-lg font-extrabold text-dark-900">{zone.name}</b>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wider
                      ${zone.urgency_level === 'high' ? 'bg-red-500' : zone.urgency_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                      {zone.urgency_level}
                    </span>
                  </div>
                  
                  <div className="text-sm font-medium text-gray-700">
                    <span className="text-xs uppercase text-gray-500">TYPE:</span> {zone.requester_type}
                  </div>

                  {zone.short_story && (
                    <p className="text-sm italic text-gray-600 bg-gray-100 p-2 rounded-lg border-l-4 border-primary">
                      "{zone.short_story}"
                    </p>
                  )}

                  <div className="mt-2">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-primary">{zone.fulfilled_quantity} / {zone.required_quantity} meals</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(100, (zone.fulfilled_quantity / zone.required_quantity) * 100)}%` }}
                      />
                    </div>
                    {zone.required_quantity > zone.fulfilled_quantity && (
                      <p className="text-xs text-red-500 font-bold mt-1 text-right">
                        {zone.required_quantity - zone.fulfilled_quantity} Deficit
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>
    </div>
  );
}
