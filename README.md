# AI-Powered Food Rescue & Hunger Heatmap Platform (RescueBite)

RescueBite connects food donors with volunteers to distribute surplus food to high-hunger areas based on an AI priority engine.

## Prerequisites
- Node.js (for frontend)
- Python 3.8+ (for backend)

## 1. Setup Backend (FastAPI)
1. Open terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   *The backend runs on `http://localhost:8000`. You can view the API docs at `http://localhost:8000/docs`.*

## 2. Setup Frontend (React + Vite)
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The frontend usually runs on `http://localhost:5173`. Open this URL in your browser.*

## Features Implemented
- **Donor Module (React):** Form to submit food type, quantity, and expiry.
- **AI Priority Engine (Python):** Ranks donations based on expiry time and local hunger levels. Priority score logic in `ai_engine.py`.
- **Volunteer Dashboard (React + Leaflet):** Displays AI-prioritized tasks on an interactive map. Allows volunteers to accept tasks.
- **Live Heatmap (React + Leaflet + AI Data):** Shows Red (High), Yellow (Medium), and Green (Low) hunger zones using dummy data populated on backend startup.

## Database
Uses SQLite (`rescuebite.db`) with SQLAlchemy. Auto-creates tables (`Donations`, `Volunteers`, `HeatmapZones`) when the FastAPI app starts.

## API Endpoints
- `POST /donations` Submit new food
- `GET /donations` Get all donations
- `GET /donations/nearby` Get AI-prioritized pending tasks
- `POST /accept-task` Accept a donation task
- `GET /heatmap-data` Get heatmap zones
