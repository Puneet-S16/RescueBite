import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DonorForm from './pages/DonorForm';
import DonateMoney from './pages/DonateMoney';
import RequestForm from './pages/RequestForm';
import VolunteerDashboard from './pages/VolunteerDashboard';
import HeatmapPage from './pages/HeatmapPage';
import AuthPage from './pages/AuthPage';
import Footer from './components/Footer';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' } }} />
        <div className="min-h-screen text-white flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/donate" element={<DonorForm />} />
              <Route path="/donate-money" element={<DonateMoney />} />
              <Route path="/request" element={<RequestForm />} />
              <Route path="/volunteer" element={<VolunteerDashboard />} />
              <Route path="/heatmap" element={<HeatmapPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
