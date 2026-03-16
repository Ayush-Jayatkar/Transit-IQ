# 🚌 Transit-IQ — Predictive Urban Mobility & Fleet Optimizer

> **PMPML Pune — AI-Powered Public Transport Demand Forecasting, Route Planning & Fleet Management**

Transit-IQ is a fully closed-loop, production-grade intelligent transit management system. It transitions municipal bus operations from a *reactive* model to a *predictive* one, using Machine Learning, Operations Research, and real GTFS data from Pune's PMPML bus network.

**Built for Hackathon Problem Statement 4: Public Transport Demand & Fleet Optimizer**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%202.0-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61dafb?logo=react)](https://react.dev/)
[![Prophet](https://img.shields.io/badge/ML-Prophet%201.1.5-orange)](https://facebook.github.io/prophet/)
[![XGBoost](https://img.shields.io/badge/ML-XGBoost-red?logo=python)](https://xgboost.readthedocs.io/)
[![OR-Tools](https://img.shields.io/badge/Optimizer-OR--Tools%209.9-blue?logo=google)](https://developers.google.com/optimization)

---

<<<<<<< HEAD
## 📸 Platform Gallery

### 1. Modern Landing Page
The entry point of Transit-IQ featuring dynamic text animations, animated statistics counters, and a professional dark-themed design system.
![Landing Page](docs/hero.png)

### 2. Live Fleet Tracking
A real-time command center for operators to monitor PMPML bus locations, route status, and congestion levels using interactive Leaflet maps.
![Fleet Tracking](docs/fleet.png)

### 3. Demand Forecasting
Deep-dive into route-specific forecasts within the Operator Dashboard. Features real-time demand curves, 4-hour forward-looking peaks, and integrated historical comparisons such as Weekday vs. Weekend volume profiles to anticipate passenger surges.
![Demand Forecasting](docs/demand.png)

### 4. Fleet Optimization
Data-driven fleet deployment interface that allows operators to visualize live bus distribution and apply mathematically optimized strategies. Provides a visual tradeoff analysis between wait scores, fuel costs, and passenger coverage based on live telemetry.
![Fleet Optimization](docs/optimize.png)

---

## 🌟 Key Features
=======
## 📸 Screenshots
>>>>>>> 43f78161cdfc88006500f22435bd5004ed7d5ad0

> **Operator Command Center Dashboard**

<!-- Add screenshot of Operator Dashboard here -->
### Live Fleet Tracking
Comprehensive PMPML operator monitoring view showing all 312 active buses on an interactive Leaflet map. Operators can track every route's real-time status (On Time, Crowded, Delayed, Breakdown), monitor critical fleet metrics (buses crowded >85%, delayed >5min, breakdowns), inspect per-route traffic load distribution, and scroll through a live bus list sorted by speed and next stop — all in one unified command screen.

<img width="2559" height="1304" alt="image" src="https://github.com/user-attachments/assets/8d0ee70c-c495-412c-93aa-df2ab78d9c70" />


> **Demand Heatmap on Live Map**

An operator-side heatmap view overlaid on the Pune city map, highlighting heavily-trafficked routes in vivid red clusters. Dispatchers can identify demand hotspots in real-time — major transit corridors like the central Pune hub light up intensely during peak hours — enabling data-driven decisions on where to deploy additional buses before congestion peaks.

<!-- Add screenshot of Demand Heatmap here -->
<img width="2559" height="1307" alt="image" src="https://github.com/user-attachments/assets/a796cb6f-924d-4037-b38a-e2e3d9fd1dff" />


> **Passenger App — RAPTOR Journey Planner**

The rider-facing journey planning dashboard where users select a source and destination, choose a time preset (Now, 8AM Peak, 6PM Peak, Weekend 11), and hit "Find Route." The RAPTOR algorithm instantly calculates the optimal path — showing total time, number of transfers, ₹ fare, and distance — along with precise Depart → Arrive times. The step-by-step route breakdown further lists upcoming buses with their real license plates (e.g. MH-12-FC-4905) and estimated wait times, so riders know exactly which physical bus to board.

<!-- Add screenshot of Passenger App here -->
<img width="2559" height="1306" alt="image" src="https://github.com/user-attachments/assets/7eb9a845-b440-4258-96f0-26718cff58a2" />


---

## ✨ Key Features

### Operator Dashboard (`/operator`)
| Feature | Description |
|---|---|
| 🗺️ **Live Fleet Map** | Real Leaflet map with animated buses moving across real Pune GPS routes |
| 🌡️ **Demand Heatmap** | Toggle to show colored circle markers at stops, sized by forecasted load |
| 📊 **Demand Analytics** | Morning / Evening / Weekend demand comparison charts per route |
| 🤖 **AI Recommendations** | OR-Tools derived fleet deployment cards with priority levels |
| ⚠️ **Anomaly Alerts** | IsolationForest anomaly detection tab with critical/high/medium severity alerts |
| ⚙️ **Multi-Objective Optimizer** | Pareto radar chart comparing Time-Optimal vs Fuel-Optimal vs Balanced strategies |
| 🎯 **Model Accuracy Panel** | Live MAPE and MAE scoring against 60-day held-out test set |
| 🌍 **SDG Impact Tracker** | CO₂ savings, passenger-km served, and fuel efficiency metrics |

### Passenger App (`/passenger`)
| Feature | Description |
|---|---|
| 🔍 **RAPTOR Journey Planner** | Enter any origin + destination; returns step-by-step boarding instructions |
| 🕐 **Time Selector** | Choose Now / 8AM Peak / 6PM Peak / Weekend for schedule-aware routing |
| 🗺️ **Route Polylines** | Planned route is drawn on the Pune map with transfer markers |
| 📱 **Crowd Status** | Live occupancy data from backend for each step |

---

## 🧠 Algorithm Details

### 1. Hybrid Demand Forecaster (Prophet v1.1.5 + XGBoost) 
**Files:** `backend/models/hybrid_forecaster.py`, `backend/models/demand_forecaster.py`

A two-stage ensemble approach:
- **Stage 1 — Prophet** trains with `seasonality_mode="multiplicative"` on 730 days of generated demand data. It captures:
  - Daily ridership curves (morning peak 8AM, evening peak 6PM)
  - Weekly multipliers (Monday=1.05, Sunday=0.62)
  - Yearly seasonal variation calibrated to real PMPML monthly ridership data
  - 8 Pune event overrides (Ganpati Festival +55%, IPL matches +90%, Diwali -35%)
- **Stage 2 — XGBoost** (`n_estimators=200, max_depth=5, learning_rate=0.08`) trains on Prophet's residuals using 10 engineered features:
  - `precipitation_mm`, `rain_demand_multiplier`, `temperature_c` from Open-Meteo API
  - `lag_1h` and `lag_24h` autocorrelation features
  - `is_weekend`, `hour`, `weekday`, `month`, `event_mult`
- **Accuracy:** Achieves **8–12% MAPE** on 60-day held-out test set (reported live in the Accuracy Panel)

---

### 2. Fleet Optimizer (Google OR-Tools v9.9.3963)
**File:** `backend/models/fleet_optimizer.py`

Uses `ortools.sat.python.cp_model` (CP-SAT Constraint Programming Solver) to determine optimal bus fleet sizing. For each route:
- **Input:** Peak forecasted demand (pax), current fleet count, bus capacity (80 seats/bus, 85% efficiency)
- **Output:** `buses_needed` — minimum buses to keep occupancy under threshold
- **Multi-Objective Tradeoff API** (`/api/optimize/tradeoffs`) computes 3 Pareto strategies:
  - **Time-Optimal** — 100% of AI recommendations applied → minimizes wait time
  - **Fuel-Optimal** — Only top 25% critical routes get extra buses → minimizes diesel
  - **Balanced** — Top 55% of routes → recommended Pareto-optimal sweet spot

---

### 3. RAPTOR Transit Router (Round-Based Algorithm)
**File:** `backend/models/route_planner.py`

Implements the **RAPTOR** algorithm from the Microsoft Research paper *"Round-Based Public Transit Routing"* (Delling et al., 2012):
- **Graph:** 60+ real Pune GPS stops indexed by name; edges = (stop_A → stop_B) weighted by travel speed per route category (BRT=28 km/h, IT=22 km/h, City=18 km/h, Feeder=14 km/h)
- **Algorithm:** Operates in up to `MAX_RAPTOR_ROUNDS=3` transfer rounds; each round expands the reachable stop set
- **Transfer Edges:** Stops within 350m are connected by walking edges (4.5 km/h) with a 5-min transfer penalty
- **Why not Dijkstra?** Dijkstra is schedule-blind; RAPTOR is specifically designed for GTFS timetable-based transit and is 10× faster on transit graphs

---

### 4. Anomaly Detector (Scikit-Learn IsolationForest)
**File:** `backend/models/anomaly_detector.py`

An unsupervised anomaly detector runs every 10 seconds in the background event loop:
- **IsolationForest** (`contamination=0.1, random_state=42`) is fit and cached per-route on a rolling 200-tick history window
- **Detection:** Compares each live ridership tick against Prophet's predicted baseline; flags if `deviation_pct > 40%` or IsolationForest score = `-1`
- **Severity levels:** `critical` (>60% deviation), `high` (>40%), `medium`

---

## 🗄️ Datasets

| Dataset | Source | Used For |
|---|---|---|
| **PMPML GTFS** (`routes.txt`, `stops.txt`, `trips.txt`, etc.) | Pune Municipal Corporation (Official GTFS Feed) | Build bus stop GPS graph and route network |
| **PMPML Annual Reports 2019-20, 2020-21** (Excel) | Official PMPML Annual Reports | Anchor system-wide daily ridership baseline (real figures) |
| **PMPML Annual Statistics 2023-24 & 2024-25** (PDF) | PMPML Statistics Cell | Validate forecast calibration |
| **Open-Meteo Historical Weather** (50,000+ hourly rows) | [archive-api.open-meteo.com](https://archive-api.open-meteo.com) | XGBoost weather features (2022-2024) |
| **PMPML Bus Fleet 2015-2019** (CSV) | PMPML Internal Data | Simulate realistic fleet sizes |

---

## 🌐 Backend API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/routes` | All PMPML routes with stop coordinates |
| `GET` | `/api/buses` | Live bus positions + occupancy |
| `GET` | `/api/stops` | All indexed stops with GPS coordinates |
| `GET` | `/api/weather` | Live Pune weather conditions |
| `GET` | `/api/health` | System-wide fleet health metrics |
| `GET` | `/api/metro` | Pune metro lines overlay |
| `GET` | `/api/demand/forecast` | Demand forecast all routes |
| `GET` | `/api/demand/forecast/{route_id}` | Demand forecast for one route |
| `POST` | `/api/demand/refresh` | Force re-run ML predictions |
| `GET` | `/api/demand/heatmap?hour=8` | Per-stop demand intensity for map heatmap |
| `GET` | `/api/demand/timeofday/{route_id}` | Morning/Evening/Weekend profiles |
| `GET` | `/api/model/accuracy` | Per-route MAPE + MAE from held-out test |
| `GET` | `/api/model/predicted-vs-actual` | Actual vs Predicted chart data |
| `GET` | `/api/recommendations` | OR-Tools fleet recommendations |
| `GET` | `/api/alerts` | IsolationForest anomaly alerts |
| `GET` | `/api/optimize/tradeoffs` | Pareto tradeoff radar chart data |
| `POST` | `/api/optimize/apply/{strategy}` | Apply Time/Fuel/Balanced strategy live |
| `GET` | `/api/route/plan?origin=X&destination=Y&hour=8` | RAPTOR journey planning |
| `GET` | `/api/sdg-impact` | SDG sustainability impact calculator |
| `GET` | `/docs` | Auto-generated Swagger API Documentation |

---

## 📂 Project Structure

```
📦 Transit-IQ/
├── 📂 backend/                        # Python FastAPI Server
│   ├── 📂 data/
│   │   ├── 📂 gtfs/                   # Real PMPML GTFS files (routes.txt, stops.txt, etc.)
│   │   ├── 📄 gtfs_loader.py          # Parses GTFS into in-memory route + stop graphs
│   │   ├── 📄 synthetic_gtfs.py       # Bus simulation engine + route definitions
│   │   ├── 📄 pmpml_data_parser.py    # Parses real PMPML Annual Report Excel files
│   │   ├── 📄 pmpml_ridership_monthly.csv  # Extracted real monthly ridership (2019-2021)
│   │   ├── 📄 weather.py              # Open-Meteo live weather fetcher
│   │   ├── 📄 download_weather_history.py  # One-time historical weather downloader
│   │   ├── 📄 Annual Report 2019-20.xlsx   # Source: Real PMPML Annual Report
│   │   ├── 📄 Annual Report 2020-21.xlsx   # Source: Real PMPML Annual Report
│   │   └── 📄 PMPML Number of Buses 2015–2019.csv # Fleet size history
│   │
│   ├── 📂 models/
│   │   ├── 📄 hybrid_forecaster.py    # 🤖 Prophet + XGBoost Hybrid — PRIMARY forecaster
│   │   ├── 📄 demand_forecaster.py    # Prophet-only baseline forecaster
│   │   ├── 📄 fleet_optimizer.py      # ⚙️ Google OR-Tools CP-SAT fleet planner
│   │   ├── 📄 route_planner.py        # 🗺️ RAPTOR routing + Pareto tradeoff engine
│   │   ├── 📄 anomaly_detector.py     # 🚨 Scikit-Learn IsolationForest alerts
│   │   └── 📄 pune_weather_history.csv # Cached Open-Meteo weather data (50k+ rows)
│   │
│   ├── 📄 main.py                     # FastAPI app, startup, sim loop, all endpoints
│   └── 📄 requirements.txt            # Pinned Python dependencies
│
├── 📂 frontend/                       # React 19 + Vite Application
│   └── 📂 src/
│       ├── 📄 App.jsx                 # React Router — 4 routes (/, /operator, /passenger, /api-docs)
│       ├── 📄 api.js                  # Axios API client with all endpoint wrappers
│       ├── 📄 index.css               # Global design system (CSS variables, animations)
│       └── 📂 pages/
│           ├── 📄 LandingPage.jsx     # Animated marketing landing page
│           ├── 📄 OperatorDashboard.jsx  # 🖥️ Heavy-duty 68KB operator control room
│           ├── 📄 PassengerApp.jsx    # 📱 Passenger RAPTOR journey planner UI
│           ├── 📄 InsightsSidebar.jsx # Collapsible insights panel
│           └── 📄 ApiDocs.jsx         # Interactive Swagger-style API reference UI
│
├── 📄 start_backend.bat               # One-click backend launcher (Windows)
├── 📄 start_frontend.bat              # One-click frontend launcher (Windows)
└── 📄 README.md
```

---

## 🏗️ System Architecture

```
                    ┌─────────────────────────────────┐
                    │        Data Sources              │
                    │  PMPML GTFS  │  Annual Reports   │
                    │  Open-Meteo  │  Pune Events Cal  │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │     Python FastAPI Backend        │
                    │  ┌──────────────────────────┐   │
                    │  │   Startup & Training      │   │
                    │  │  Prophet + XGBoost (730d) │   │
                    │  │  RAPTOR Graph Building    │   │
                    │  └──────────┬───────────────┘   │
                    │             │  Every 10s         │
                    │  ┌──────────▼───────────────┐   │
                    │  │   Background Sim Loop     │   │
                    │  │  simulate_bus_tick()      │   │
                    │  │  optimize_fleet()         │   │
                    │  │  update_and_detect()      │   │
                    │  └──────────┬───────────────┘   │
                    │             │                    │
                    │  ┌──────────▼───────────────┐   │
                    │  │   REST API Endpoints      │   │
                    │  │  /api/demand, /api/buses  │   │
                    │  │  /api/optimize/tradeoffs  │   │
                    │  │  /api/route/plan (RAPTOR) │   │
                    │  │  /api/alerts              │   │
                    │  └──────────────────────────┘   │
                    └──────────────┬──────────────────┘
                                   │ HTTP/REST
                    ┌──────────────▼──────────────────┐
                    │     React 19 + Vite Frontend      │
                    │  ┌──────────────────────────┐   │
                    │  │   LandingPage (/)         │   │
                    │  └──────────────────────────┘   │
                    │  ┌──────────────────────────┐   │
                    │  │   OperatorDashboard       │   │
                    │  │  Map | Demand | Alerts    │   │
                    │  │  Optimize | Accuracy      │   │
                    │  └──────────────────────────┘   │
                    │  ┌──────────────────────────┐   │
                    │  │   PassengerApp            │   │
                    │  │  Route Search + Map       │   │
                    │  └──────────────────────────┘   │
                    └─────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Library | Version | Role |
|---|---|---|
| `fastapi` | 0.110.0 | Async API server |
| `uvicorn` | 0.27.1 | ASGI server |
| `prophet` | 1.1.5 | Time-series seasonality forecasting |
| `xgboost` | latest | Residual correction (weather + events) |
| `scikit-learn` | 1.4.0 | IsolationForest anomaly detection |
| `ortools` | 9.9.3963 | CP-SAT constraint solver for fleet sizing |
| `pandas` | 2.2.0 | Data manipulation (GTFS, weather, PMPML) |
| `numpy` | 1.26.4 | Numerical operations |
| `shapely` | 2.0.3 | Geospatial calculations |
| `pyproj` | 3.6.1 | Coordinate projection |

### Frontend
| Library | Version | Role |
|---|---|---|
| `react` | 19.2.0 | UI framework |
| `vite` | 7.3.1 | Development server and build tool |
| `react-leaflet` | 5.0.0 | Interactive maps with GTFS route overlays |
| `recharts` | 3.7.0 | Demand charts, Radar charts, AreaCharts |
| `framer-motion` | latest | Fluid dashboard animations |
| `lucide-react` | 0.575.0 | Icon system |
| `axios` | 1.13.6 | HTTP client with all API wrappers |

---

## ⚙️ How to Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Start the Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

The backend boots at **`http://localhost:8000`**.

> **Note:** On first run, the system will:
> 1. Load the real PMPML GTFS routes and stop coordinates
> 2. Download 3 years of Pune historical weather from Open-Meteo (~5MB, one-time)
> 3. Train the Prophet + XGBoost models on 730 days of data (~15-25 seconds)
> 4. Build the RAPTOR stop-to-stop transit graph
>
> Subsequent runs use the cached weather CSV and are much faster (~5 seconds).

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend is available at **`http://localhost:5173`**.

### 3. One-Click (Windows)
Double-click `start_backend.bat` in one terminal, and `start_frontend.bat` in another.

---

## 🌍 SDG Alignment

- **SDG 11 — Sustainable Cities:** Reduces vehicle congestion by improving public transit reliability
- **SDG 13 — Climate Action:** Quantifies CO₂ savings from optimized fleet deployment (fewer empty buses)
- **SDG 9 — Industry & Innovation:** Applies AI and Operations Research to 21st-century urban infrastructure

---

## 👥 Team

**Sync** — Built for the BlueBit Hackathon, March 2026
