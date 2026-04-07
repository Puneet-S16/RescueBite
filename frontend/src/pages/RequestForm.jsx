import { useState } from 'react';
import axios from 'axios';
import { Send, MapPin, AlertCircle, Sparkles, Navigation, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RequestForm() {
  const [formData, setFormData] = useState({
    requester_type: 'NGO',
    name: '',
    contact: '',
    latitude: 40.7128,
    longitude: -74.0060,
    required_quantity: 100,
    urgency_level: 'medium',
    short_story: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationMode, setLocationMode] = useState('gps'); // 'gps' or 'manual'
  const [citySearch, setCitySearch] = useState('');

  const getLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude}));
          setLocating(false);
          toast.success('GPS location captured!');
        },
        () => { setLocating(false); toast.error('Could not get GPS location.'); }
      );
    } else {
      setLocating(false);
      toast.error('Geolocation not supported by your browser.');
    }
  };

  const searchCity = async () => {
    if (!citySearch.trim()) return;
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(citySearch)}&format=json&limit=1`
      );
      if (res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        setFormData(prev => ({ ...prev, latitude: parseFloat(lat), longitude: parseFloat(lon) }));
        toast.success(`Location set to: ${display_name.split(',').slice(0, 2).join(',')}`);
      } else {
        toast.error('City not found. Try a different name.');
      }
    } catch {
      toast.error('Failed to search location.');
    }
  };

  const handleGenerateStory = async () => {
    if (!formData.name) {
      toast.error('Please enter Organization / Name first');
      return;
    }
    setIsGenerating(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.post(`${API_URL}/generate-story`, {
        name: formData.name,
        requester_type: formData.requester_type,
        required_quantity: formData.required_quantity,
        urgency_level: formData.urgency_level
      });
      setFormData(prev => ({...prev, short_story: res.data.story}));
      toast.success('AI Story generated!');
    } catch (err) {
      toast.error('Failed to generate story');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Submitting request...');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await axios.post(`${API_URL}/requests`, formData);
      toast.success('Food Request submitted successfully!', { id: loadingToast });
      setFormData({...formData, name: '', contact: '', required_quantity: 100, short_story: ''});
    } catch (err) {
      toast.error('Failed to submit request.', { id: loadingToast });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 shadow-xl">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <AlertCircle className="text-red-500" /> Request Food Relief
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Requester Type</label>
              <select 
                className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-primary outline-none"
                value={formData.requester_type}
                onChange={(e) => setFormData({...formData, requester_type: e.target.value})}
              >
                <option value="NGO">NGO / Shelter</option>
                <option value="Individual">Individual / Community</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Urgency Level</label>
              <select 
                className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                value={formData.urgency_level}
                onChange={(e) => setFormData({...formData, urgency_level: e.target.value})}
              >
                <option value="low">Low (Next 24-48h)</option>
                <option value="medium">Medium (Next 12-24h)</option>
                <option value="high">High (Immediate Need)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Organization / Name</label>
              <input 
                type="text" className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white outline-none"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Contact Details</label>
              <input 
                type="text" className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white outline-none"
                value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Meals Required (Quantity)</label>
            <input 
              type="number" min="1"
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white outline-none"
              value={formData.required_quantity} onChange={(e) => setFormData({...formData, required_quantity: parseInt(e.target.value)})} required
            />
          </div>

          <div className="bg-dark-900 p-5 rounded-lg border border-dark-700">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm text-gray-400 font-medium">Context / Short Story</label>
              <button 
                type="button" 
                onClick={handleGenerateStory}
                disabled={isGenerating}
                className="flex items-center gap-2 text-xs bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary/30 transition shadow-[0_0_10px_rgba(249,115,22,0.1)] disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" /> {isGenerating ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
            <textarea
              rows="3"
              className="w-full bg-transparent border border-dark-600 rounded-lg p-3 text-white outline-none focus:border-primary placeholder-gray-600 focus:bg-dark-800 transition-colors"
              placeholder="Briefly describe the situation..."
              value={formData.short_story}
              onChange={(e) => setFormData({...formData, short_story: e.target.value})}
            />
          </div>

          {/* Location Section */}
          <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
            {/* Mode Toggle */}
            <div className="flex border-b border-dark-700">
              <button
                type="button"
                onClick={() => setLocationMode('gps')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all
                  ${locationMode === 'gps' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Navigation className="w-4 h-4" /> Use GPS
              </button>
              <button
                type="button"
                onClick={() => setLocationMode('manual')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all
                  ${locationMode === 'manual' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Pencil className="w-4 h-4" /> Enter Manually
              </button>
            </div>

            <div className="p-4">
              {/* Current coords display */}
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Current: <span className="text-white font-medium">{formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</span></span>
              </div>

              {locationMode === 'gps' ? (
                <button
                  type="button" onClick={getLocation}
                  className="w-full flex items-center justify-center gap-2 bg-dark-700 hover:bg-dark-600 transition-colors py-3 rounded-lg text-sm font-medium"
                >
                  <Navigation className="w-4 h-4 text-primary" />
                  {locating ? 'Detecting location...' : 'Detect My GPS Location'}
                </button>
              ) : (
                <div className="space-y-3">
                  {/* City Search */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search city or area (e.g. Mumbai, Bengaluru)"
                      value={citySearch}
                      onChange={e => setCitySearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchCity())}
                      className="flex-1 bg-dark-800 border border-dark-600 rounded-lg p-3 text-white text-sm outline-none focus:border-primary placeholder-gray-600 transition-colors"
                    />
                    <button
                      type="button" onClick={searchCity}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
                    >
                      Search
                    </button>
                  </div>
                  {/* Manual Lat/Lng */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                      <input
                        type="number" step="any"
                        value={formData.latitude}
                        onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value) || 0})}
                        className="w-full bg-dark-800 border border-dark-600 rounded-lg p-2.5 text-white text-sm outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                      <input
                        type="number" step="any"
                        value={formData.longitude}
                        onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value) || 0})}
                        className="w-full bg-dark-800 border border-dark-600 rounded-lg p-2.5 text-white text-sm outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="w-full bg-red-600 text-white font-bold py-4 rounded-lg hover:bg-red-700 transition-colors mt-4 flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <Send className="w-5 h-5"/> Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
