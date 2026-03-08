import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Terminal, Code, Activity, Server, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const apiSections = [
    {
        title: "Core Endpoints",
        icon: <Server size={22} className="text-blue-400" />,
        endpoints: [
            { method: "GET", path: "/api/routes", desc: "Retrieves the full list of PMPML active routes and their geometries." },
            { method: "GET", path: "/api/buses", desc: "Fetches live GPS coordinates and fleet status for all active buses." },
            { method: "GET", path: "/api/stops", desc: "Returns a GeoJSON collection of all bus stops and depots." },
            { method: "GET", path: "/api/weather", desc: "Gets current Pune weather and rain impact severity from Open-Meteo." },
            { method: "GET", path: "/api/health", desc: "System health metrics including OR-Tools and Prophet service status." },
            { method: "GET", path: "/api/metro", desc: "MahaMetro live feed used for multi-modal routing overlap." }
        ]
    },
    {
        title: "Demand Forecasting",
        icon: <Activity size={22} className="text-blue-400" />,
        endpoints: [
            { method: "GET", path: "/api/demand/forecast", desc: "Facebook Prophet predictions for passenger demand across the network." },
            { method: "GET", path: "/api/demand/forecast/{routeId}", desc: "Pulls the 4-hour forward-looking demand curve for a specific route." },
            { method: "POST", path: "/api/demand/refresh", desc: "Forces the Prophet ML model to retrain synchronously on the latest dataset." },
            { method: "GET", path: "/api/demand/heatmap?hour={hour}", desc: "Generates spatial demand intensity for heatmap visualization." },
            { method: "GET", path: "/api/demand/timeofday/{routeId}", desc: "Retrieves the standard historical time-of-day volume profile." }
        ]
    },
    {
        title: "Fleet Optimization & Alerts",
        icon: <Terminal size={22} className="text-blue-400" />,
        endpoints: [
            { method: "GET", path: "/api/recommendations", desc: "Google OR-Tools generated frequency adjustments based on forecasted demand." },
            { method: "GET", path: "/api/alerts", desc: "IsolationForest anomaly detection flags for routes experiencing abnormal loads." },
            { method: "POST", path: "/api/recommendations/{id}/approve", desc: "Operator sign-off to apply the recommended fleet allocation." },
            { method: "POST", path: "/api/recommendations/{id}/reject", desc: "Rejects an optimization recommendation and logs operator feedback." }
        ]
    },
    {
        title: "Journey Planning (RAPTOR)",
        icon: <Code size={22} className="text-blue-400" />,
        endpoints: [
            { method: "GET", path: "/api/route/plan?origin={s}&destination={d}&time_min={t}", desc: "Executes the RAPTOR public transit algorithm to calculate the optimal multi-step journey." },
            { method: "GET", path: "/api/route/stops/search?q={query}", desc: "Autocomplete elastic search for station and landmark names." },
            { method: "GET", path: "/api/journey/plan?origin={s}&destination={d}", desc: "Legacy A* routing algorithm (fallback)." }
        ]
    },
    {
        title: "Model Telemetry",
        icon: <BookOpen size={22} className="text-blue-400" />,
        endpoints: [
            { method: "GET", path: "/api/model/accuracy", desc: "Detailed breakdown of MAPE and MSE for recent predictions." },
            { method: "GET", path: "/api/model/accuracy/summary", desc: "High-level aggregate score (e.g. 91.2% accurate)." },
            { method: "GET", path: "/api/model/predicted-vs-actual/{routeId}?days={d}", desc: "Time-series data comparing the Prophet forecasts to actual passenger volume." },
            { method: "GET", path: "/api/sdg-impact", desc: "Calculates total CO2 emissions saved based on passenger shifting." }
        ]
    }
];

export default function ApiDocs() {
    return (
        <div style={{
            height: '100vh',
            overflowY: 'auto',
            background: 'linear-gradient(135deg, #09090b 0%, #0d121c 50%, #060e1a 100%)',
            color: '#f8fafc',
            fontFamily: 'Inter, sans-serif',
            padding: '40px 20px 80px'
        }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: 48, borderBottom: '1px solid rgba(26,108,245,0.2)', paddingBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <Link to="/" style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                            <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Home
                        </Link>
                    </div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, fontFamily: 'Orbitron, sans-serif', margin: '0 0 16px', color: '#fff' }}
                    >
                        TRANSIT-IQ <span style={{ color: '#3b82f6' }}>API REFERENCE</span>
                    </motion.h1>
                    <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.6, maxWidth: 600, margin: 0 }}>
                        Internal documentation for the Transit-IQ Python / FastAPI backend. Exposes end-points for live telemetry, Prophet machine learning inference, and OR-Tools operational planning.
                    </p>
                </div>

                {/* Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                    {apiSections.map((sec, i) => (
                        <motion.section 
                            key={sec.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{ 
                                background: 'rgba(15,23,42,0.6)', 
                                border: '1px solid rgba(59,130,246,0.15)', 
                                borderRadius: 16, 
                                overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                            }}
                        >
                            <div style={{ 
                                padding: '20px 24px', 
                                borderBottom: '1px solid rgba(59,130,246,0.15)',
                                background: 'rgba(30,58,138,0.15)',
                                display: 'flex', alignItems: 'center', gap: 12
                            }}>
                                {sec.icon}
                                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#e2e8f0' }}>{sec.title}</h2>
                            </div>
                            <div style={{ padding: '0 24px' }}>
                                {sec.endpoints.map((ep, j) => (
                                    <div key={ep.path} style={{ 
                                        padding: '24px 0', 
                                        borderBottom: j < sec.endpoints.length - 1 ? '1px dashed rgba(59,130,246,0.15)' : 'none',
                                        display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start'
                                    }}>
                                        <div style={{ flex: '1 1 300px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, fontFamily: 'JetBrains Mono, monospace' }}>
                                                <span style={{ 
                                                    background: ep.method === 'GET' ? 'rgba(56,189,248,0.1)' : 'rgba(167,139,250,0.1)',
                                                    color: ep.method === 'GET' ? '#38bdf8' : '#a78bfa',
                                                    border: `1px solid ${ep.method === 'GET' ? 'rgba(56,189,248,0.3)' : 'rgba(167,139,250,0.3)'}`,
                                                    padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 800,
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {ep.method}
                                                </span>
                                                <span style={{ color: '#f1f5f9', fontSize: 15 }}>{ep.path}</span>
                                            </div>
                                        </div>
                                        <div style={{ flex: '1 1 300px', fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>
                                            {ep.desc}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    ))}
                </div>
            </div>
        </div>
    );
}
