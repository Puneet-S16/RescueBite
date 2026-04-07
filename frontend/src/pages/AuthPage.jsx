import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Car, Utensils, ArrowRight, HeartHandshake } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '', email: '', password: '', user_type: 'Donor',
    contact: '', vehicle_availability: false
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, loginData);
      login(res.data.access_token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}! 👋`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, signupData);
      login(res.data.access_token, res.data.user);
      toast.success(`Account created! Welcome, ${res.data.user.name}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-12 relative">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
              <Utensils className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white">RescueBite</h1>
          <p className="text-gray-400 mt-1">AI-Powered Food Rescue Platform</p>
        </div>

        {/* Card */}
        <div className="bg-dark-800 border border-dark-700 rounded-3xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-dark-700">
            {['login', 'signup'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider transition-all
                  ${tab === t ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="p-8">
            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email" required placeholder="Email address"
                    value={loginData.email}
                    onChange={e => setLoginData({...loginData, email: e.target.value})}
                    className="w-full bg-dark-900 border border-dark-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password" required placeholder="Password"
                    value={loginData.password}
                    onChange={e => setLoginData({...loginData, password: e.target.value})}
                    className="w-full bg-dark-900 border border-dark-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-primary transition-all"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
                </button>
                <p className="text-center text-gray-500 text-sm">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setTab('signup')} className="text-primary hover:underline">Create one</button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text" required placeholder="Full Name"
                    value={signupData.name}
                    onChange={e => setSignupData({...signupData, name: e.target.value})}
                    className="w-full bg-dark-900 border border-dark-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email" required placeholder="Email address"
                    value={signupData.email}
                    onChange={e => setSignupData({...signupData, email: e.target.value})}
                    className="w-full bg-dark-900 border border-dark-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password" required placeholder="Password"
                    value={signupData.password}
                    onChange={e => setSignupData({...signupData, password: e.target.value})}
                    className="w-full bg-dark-900 border border-dark-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text" placeholder="Contact Number (optional)"
                    value={signupData.contact}
                    onChange={e => setSignupData({...signupData, contact: e.target.value})}
                    className="w-full bg-dark-900 border border-dark-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-primary transition-all"
                  />
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">I want to join as:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Donor', 'Volunteer', 'NGO'].map(type => (
                      <button
                        key={type} type="button"
                        onClick={() => setSignupData({...signupData, user_type: type})}
                        className={`py-2 px-3 rounded-xl text-sm font-bold border transition-all
                          ${signupData.user_type === type
                            ? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                            : 'bg-dark-900 text-gray-400 border-dark-700 hover:border-gray-500'}`}
                      >
                        {type === 'Donor' ? '🍱' : type === 'Volunteer' ? '🚗' : '🏢'} {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vehicle toggle for volunteers */}
                {signupData.user_type === 'Volunteer' && (
                  <label className="flex items-center gap-3 bg-dark-900 border border-dark-700 p-3 rounded-xl cursor-pointer">
                    <Car className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300 flex-1">Vehicle available for deliveries?</span>
                    <input
                      type="checkbox"
                      checked={signupData.vehicle_availability}
                      onChange={e => setSignupData({...signupData, vehicle_availability: e.target.checked})}
                      className="w-4 h-4 accent-orange-500"
                    />
                  </label>
                )}

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                >
                  {loading ? 'Creating account...' : <><HeartHandshake className="w-5 h-5" /><span>Join RescueBite</span></>}
                </button>
                <p className="text-center text-gray-500 text-sm">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setTab('login')} className="text-primary hover:underline">Sign in</button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
