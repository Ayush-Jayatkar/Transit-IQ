# 🚀 Transit-IQ: Predictive Urban Mobility & Fleet Optimizer

**Transit-IQ** is a closed-loop public transport intelligence system. It transitions municipal transit from being a *reactionary* service to a *predictive* one. By modeling a city's transport network using real GTFS data, applying time-series Machine Learning to forecast crowd sizes, and utilizing Constraint Programming, Transit-IQ dynamically rebalances bus fleets to squash wait times and minimize fuel waste.

Built for **Problem Statement 4 [PS4] - Public Transport Demand & Fleet Optimizer**.

---

## 🔥 Key Features

- **Predictive Demand Heatmap:** Anticipates crowd surges at specific bus stops hours before they happen using daily/weekly seasonality.
- **Multi-Objective Fleet Optimization:** Calculates Pareto-optimal fleet distribution strategies (Time-Optimal vs. Fuel-Optimal).
- **RAPTOR Journey Planner:** A passenger-facing routing engine that finds the mathematically fastest multi-transfer path through the city.
- **Live Anomaly Detection:** An unsupervised real-time ML guardrail that alerts operators to statistically impossible crowd surges (e.g., flash protests).

---

## 🧠 Core Machine Learning & Algorithms

We utilized 4 distinct algorithmic engines to solve the core objective of the hackathon:

### 1. Hybrid Demand Forecaster (Facebook Prophet + XGBoost)
We implemented a true hybrid forecasting model in `backend/models/hybrid_forecaster.py` to predict localized passenger volume:
*   **Prophet:** Captures cyclical time-series data using multiplicative seasonality to model daily variations and the weekly drop-off on weekends.
*   **XGBoost:** Prophet fails when external anomalies occur. We layered an XGBoost regressor using 200 estimators (max depth 5) to correct Prophet's residuals in real-time. It trains on external variables including historical **Open-Meteo Pune weather data** (precipitation and temperature) and a discrete calendar of major Pune events (like Ganpati Festival and IPL matches).

### 2. Fleet Rebalancing (Google OR-Tools)
Predicting crowds is only half the battle. We utilized **Google OR-Tools** (Constraint Programming / SAT solver) in `backend/models/fleet_optimizer.py`.
*   The optimizer consumes the forecasted localized passenger count against physical bus capacity constraints (80 pax/bus).
*   It computes a **Pareto Frontier** offering three strict strategies:
    *   *Time-Optimal:* Dispatch maximum buses to crush passenger wait times.
    *   *Fuel-Optimal:* Dispatch minimum buses to save municipal diesel.
    *   *Balanced:* The mathematical sweet spot.

### 3. Passenger Routing (RAPTOR Algorithm)
When a passenger queries a journey from Point A to Point B, the backend utilizes the **RAPTOR (Round-Based Public Transit Optimized Router)** algorithm located in `backend/models/route_planner.py`.
*   Unlike typical implementations using Dijkstra or A* (which are designed for static roads), RAPTOR operates in "rounds" to guarantee an optimal path that jointly minimizes physical travel time and the number of bus transfers across the localized Pune GTFS graph.

### 4. Live Safety Net (Scikit-Learn IsolationForest)
Because unpredictable events (like unannounced protests) evade time-series forecasting, we implemented an unsupervised anomaly safety net in `backend/models/anomaly_detector.py`.
*   An **Isolation Forest** runs synchronously with the live simulation loop, continually comparing the simulated ticket-sales tally against the Prophet prediction baseline. 
*   If a route's live ridership drifts toward the outer branches of the "forest", it automatically throws an alert to the Operator dashboard.

---

## 🗄️ Datasets Used

*   **Pune PMPML GTFS Dataset:** We utilized real-world public General Transit Feed Specification (GTFS) data from the Pune Municipal Corporation (`routes.txt`, `stops.txt`).
*   **Open-Meteo Historical Weather:** Fetched and locally cached 3 years of hourly historical weather data for Pune to train the XGBoost feature residuals.
*   **PMPML Official Reports:** Anchored the simulation's daily ticket sales variance to actual PMPML Annual Report dataset aggregates (`PMPML Number of Buses 2015-2019.csv`).

---

## 📂 Project Structure

```text
📦 Transit-IQ
 ┣ 📂 backend/                 # Python FastAPI Server
 ┃ ┣ 📂 data/
 ┃ ┃ ┣ 📂 gtfs/                # Real Pune PMPML GTFS text files
 ┃ ┃ ┣ 📜 gtfs_loader.py       # Parses GTFS into memory graphs
 ┃ ┃ ┣ 📜 pmpml_ridership_monthly.csv # Historical ticket dataset
 ┃ ┃ ┗ 📜 pune_weather_history.csv    # Open-meteo weather dataset
 ┃ ┣ 📂 models/                # The Algorithm Core
 ┃ ┃ ┣ 📜 anomaly_detector.py  # Scikit-Learn Isolation Forest
 ┃ ┃ ┣ 📜 demand_forecaster.py # Simple Prophet Baseline
 ┃ ┃ ┣ 📜 hybrid_forecaster.py # Primary Prophet + XGBoost Hybrid Model
 ┃ ┃ ┣ 📜 fleet_optimizer.py   # Google OR-Tools Pareto engine
 ┃ ┃ ┗ 📜 route_planner.py     # RAPTOR Routing implementation
 ┃ ┗ 📜 main.py                # Async FastAPI Endpoints & Loop
 ┃
 ┣ 📂 frontend/                # React.js + Vite Application
 ┃ ┣ 📂 src/
 ┃ ┃ ┣ 📂 pages/
 ┃ ┃ ┃ ┣ 📜 LandingPage.jsx       # 3D animated entry screen
 ┃ ┃ ┃ ┣ 📜 OperatorDashboard.jsx # The Heavy-Duty control room UI
 ┃ ┃ ┃ ┗ 📜 PassengerApp.jsx      # Mobile-first RAPTOR journey planner
 ┃ ┃ ┣ 📜 api.js                  # Axios hooks
 ┃ ┃ ┗ 📜 App.jsx                 # React Router implementation
 ┃ ┗ 📜 package.json              # Vite, Framer-Motion, Recharts, Leaflet
 ┃
 ┗ 📜 README.md
```

---

## 💻 Tech Stack

### Frontend
*   **React 19** + **Vite**
*   **Framer Motion** (For fluid dashboard animations)
*   **Recharts** (For Demand AreaCharts and Pareto Tradeoff RadarCharts)
*   **React-Leaflet** (For mapping geospatial GTFS route data)

### Backend
*   **Python 3.10** + **FastAPI**
*   **Pandas & NumPy** (GTFS data manipulation)
*   **Scikit-Learn** (IsolationForest for anomaly detection)
*   **Prophet** (Time-series forecasting seasonality)
*   **XGBoost** (Gradient-boosted decision trees for weather residuals)
*   **Google OR-Tools** (Constraint solver for fleet sizing)

---

## ⚙️ How to Run Locally

### 1. Start the Backend (Python)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*The backend boots on `http://localhost:8000`. On first run, it will automatically download Pune weather data from Open-Meteo, train the Prophet and XGBoost models, and compile the RAPTOR transit graph (~15-25 seconds depending on CPU).*

### 2. Start the Frontend (Node.js)
```bash
cd frontend
npm install
npm run dev
```
*The frontend will be available at `http://localhost:5173`. We highly recommend viewing the Operator Dashboard on a 1080p desktop monitor to render all visualizations smoothly.*
