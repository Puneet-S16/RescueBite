import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { AlertTriangle, Clock, MapPin, CheckCircle } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet Default Icon Issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function VolunteerDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  const fetchTasks = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.get(`${API_URL}/donations/nearby`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => setUserLocation([40.7128, -74.0060]) // Fallback
      );
    } else {
      setUserLocation([40.7128, -74.0060]); // Fallback
    }
  }, []);

  const handleAccept = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await axios.post(`${API_URL}/accept-task`, {
        donation_id: id,
        volunteer_id: 1 // Dummy ID
      });
      fetchTasks(); // Refresh list
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid md:grid-cols-3 h-[calc(100vh-73px)]">
      <div className="col-span-1 bg-dark-800 border-r border-dark-700 overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-6 sticky top-0 bg-dark-800 pb-2 border-b border-dark-700">AI-Prioritized Tasks</h2>
        
        {loading ? (
          <p className="text-gray-400">Loading prioritized tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-400">No pending donations at the moment.</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task, idx) => (
              <div key={task.id} className={`p-4 rounded-xl border ${idx === 0 ? 'bg-primary/10 border-primary' : 'bg-dark-900 border-dark-700'}`}>
                {idx === 0 && (
                  <span className="text-xs font-bold text-primary bg-primary/20 px-2 py-1 rounded-full uppercase mb-2 inline-block">Top Priority</span>
                )}
                <h3 className="text-lg font-bold flex justify-between">
                  {task.quantity} ppl • {task.food_type.toUpperCase()}
                </h3>
                
                <div className="mt-3 space-y-2 text-sm text-gray-400">
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-400" /> Expiring in {task.expiry_time} hours
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Lat: {task.latitude.toFixed(2)}, Lng: {task.longitude.toFixed(2)}
                  </p>
                </div>
                
                <button 
                  onClick={() => handleAccept(task.id)}
                  className="w-full mt-4 bg-white/10 hover:bg-primary hover:text-white transition-colors text-white font-medium py-2 rounded-lg flex justify-center items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Accept Rescue
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="col-span-2 relative z-0">
        {userLocation ? (
          <MapContainer center={userLocation} zoom={12} className="w-full h-full">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {userLocation && (
              <Marker position={userLocation}>
                <Popup className="text-dark-900 font-bold">You are here</Popup>
              </Marker>
            )}
            {tasks.map(task => (
               <Marker key={task.id} position={[task.latitude, task.longitude]}>
                 <Popup className="text-dark-900">
                   <b>{task.quantity} people serving</b><br/>
                   Expires in: {task.expiry_time} hours.
                 </Popup>
               </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-dark-900 text-gray-400">
            Acquiring GPS location...
          </div>
        )}
      </div>
    </div>
  );
}
