import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// The color mapping based on hunger level
const colorOptions = {
  high: { fillColor: '#ef4444', color: '#dc2626' }, // Red
  medium: { fillColor: '#eab308', color: '#ca8a04' }, // Yellow
  low: { fillColor: '#22c55e', color: '#16a34a' } // Green
};

export default function HeatmapPage() {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/heatmap-data')
      .then(res => setZones(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="h-[calc(100vh-73px)] w-full relative z-0">
      <div className="absolute top-6 right-6 z-[1000] bg-dark-800/90 backdrop-blur border border-dark-700 p-4 rounded-xl shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Hunger Level Key</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span> High Need
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]"></span> Medium Need
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span> Low Need
          </div>
        </div>
      </div>

      <MapContainer center={[40.7300, -73.9900]} zoom={12} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {zones.map(zone => (
          <Circle
            key={zone.area_id}
            center={[zone.latitude, zone.longitude]}
            radius={2000} // Radius in meters
            pathOptions={{ 
              ...colorOptions[zone.hunger_level],
              fillOpacity: 0.4,
              weight: 1
            }}
          >
            <Popup className="text-dark-900">
              <b>Hunger Level: {zone.hunger_level.toUpperCase()}</b><br/>
              Target zone for rescue deliveries.
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}
