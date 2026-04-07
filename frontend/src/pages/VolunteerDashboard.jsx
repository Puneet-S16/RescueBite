import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { AlertCircle, Clock, MapPin, CheckCircle, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import VolunteerSignup from '../components/VolunteerSignup';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [volunteer, setVolunteer] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [matchedRequest, setMatchedRequest] = useState(null);
  const [contributedMeals, setContributedMeals] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Auto-use logged-in user as volunteer
  useEffect(() => {
    if (user && !volunteer) {
      setVolunteer({
        id: user.id,
        name: user.name,
        vehicle_availability: user.vehicle_availability
      });
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/donations/nearby`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (volunteer) {
      fetchTasks();
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
          (err) => setUserLocation([40.7128, -74.0060])
        );
      } else {
        setUserLocation([40.7128, -74.0060]);
      }
    }
  }, [volunteer]);

  const openAcceptModal = async (task) => {
    setSelectedTask(task);
    setContributedMeals(task.quantity.toString());
    try {
      // Preview best match
      const res = await axios.get(`${API_URL}/match-request?latitude=${task.latitude}&longitude=${task.longitude}`);
      if (res.data.matched) {
        setMatchedRequest(res.data);
      } else {
        setMatchedRequest(null);
      }
    } catch(err) {
      console.error("Match error", err);
    }
  };

  const confirmAcceptance = async () => {
    setIsAccepting(true);
    const toastId = toast.loading('Assigning task...');
    try {
      await axios.post(`${API_URL}/accept-task`, {
        donation_id: selectedTask.id,
        user_id: volunteer.id,
        contributed_meals: parseInt(contributedMeals),
        is_delivery_partner: volunteer.vehicle_availability
      });
      setSelectedTask(null);
      fetchTasks();
      toast.success("Task Assigned! " + (volunteer.vehicle_availability ? "You are the Delivery Partner." : "Self Delivery Initiated."), { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept task", { id: toastId });
    } finally {
      setIsAccepting(false);
    }
  };

  if (!volunteer) {
    return <VolunteerSignup onComplete={setVolunteer} />;
  }

  return (
    <div className="grid md:grid-cols-3 h-[calc(100vh-73px)] relative">
      <div className="col-span-1 bg-dark-800 border-r border-dark-700 overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-2 sticky top-0 bg-dark-800 pt-2 pb-2">AI-Prioritized Tasks</h2>
        <div className="mb-6 sticky top-12 bg-dark-800 pb-2 border-b border-dark-700 text-sm text-primary flex items-center gap-2">
          Hello {volunteer.name} • {volunteer.vehicle_availability ? 'Delivery Partner' : 'Volunteer'}
        </div>
        
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
                  onClick={() => openAcceptModal(task)}
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

      {/* Accept Task Modal */}
      {selectedTask && (
        <div className="absolute inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Navigation className="text-primary" /> Confirm Task Details
            </h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="bg-dark-900 p-4 rounded-xl border border-dark-700">
                <p className="text-gray-400 mb-1">Pickup Information (Donor)</p>
                <p className="font-bold text-lg">{selectedTask.quantity} Meals ({selectedTask.food_type.toUpperCase()})</p>
                <p>Location: {selectedTask.latitude.toFixed(4)}, {selectedTask.longitude.toFixed(4)}</p>
              </div>

              <div className="bg-dark-900 p-4 rounded-xl border border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">AI ASSIGNED</div>
                <p className="text-gray-400 mb-1">Target NGO / Relief Center</p>
                {matchedRequest ? (
                  <>
                    <p className="font-bold text-lg text-primary">{matchedRequest.request.name}</p>
                    <p>Total Meals Required: {matchedRequest.request.required_quantity}</p>
                    <p className="text-red-400">Remaining Deficit: {matchedRequest.remaining}</p>
                  </>
                ) : (
                  <p className="text-yellow-500 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4"/> No pending high-urgency requests. Delivery will be assigned to fallback shelter.
                  </p>
                )}
              </div>

              <div className="bg-dark-900 p-4 rounded-xl border border-dark-700 mt-4">
                <label className="block text-gray-400 mb-2 font-medium">Meals you want to contribute (Partial Fulfillment)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" min="1" max={selectedTask.quantity}
                    value={contributedMeals}
                    onChange={(e) => setContributedMeals(e.target.value)}
                    className="w-1/2 bg-dark-800 border border-dark-600 rounded-lg p-3 outline-none focus:border-primary text-xl font-bold text-white"
                  />
                  <div className="flex-1 text-sm text-gray-400">
                    <p>Total available: {selectedTask.quantity}</p>
                    <p className="font-bold text-orange-400 mt-1">Remaining after you: {selectedTask.quantity - (parseInt(contributedMeals) || 0)}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-dark-700/50 rounded-lg text-gray-400 flex items-center gap-2">
                Roles: <span className="text-white font-medium">{volunteer.vehicle_availability ? "Delivery Partner Transport" : "Self-Delivery by Volunteer"}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setSelectedTask(null)} className="flex-1 px-4 py-3 rounded-lg border border-dark-600 hover:bg-dark-700 transition">Cancel</button>
              <button 
                onClick={confirmAcceptance} 
                disabled={isAccepting}
                className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-bold hover:bg-orange-600 transition"
              >
                {isAccepting ? 'Assigning...' : 'Confirm & Claim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
