import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DonorForm from './pages/DonorForm';
import RequestForm from './pages/RequestForm';
import VolunteerDashboard from './pages/VolunteerDashboard';
import HeatmapPage from './pages/HeatmapPage';
import Footer from './components/Footer';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen text-white flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/donate" element={<DonorForm />} />
            <Route path="/request" element={<RequestForm />} />
            <Route path="/volunteer" element={<VolunteerDashboard />} />
            <Route path="/heatmap" element={<HeatmapPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
