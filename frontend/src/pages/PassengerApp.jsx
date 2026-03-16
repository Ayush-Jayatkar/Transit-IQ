import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonStanding, Bus, ArrowRightLeft, Train, Clock, Sunrise, Sunset, Trees, Compass, Search, Map as MapIcon, Zap, Leaf, Timer, Repeat, CreditCard, MapPin, AlertTriangle, ShieldAlert } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import api from '../api.js';


/* ── helpers ─────────────────────────────────────────────────────────────── */
const MODE_ICONS = { walk: <PersonStanding size={16}/>, bus: <Bus size={16}/>, transfer: <ArrowRightLeft size={16}/>, metro: <Train size={16}/> };
const MODE_COLORS = { walk: '#9aafc4', bus: '#1a6cf5', transfer: '#e88c00', metro: '#6c3acb' };
const CROWD_COLORS = { low: '#00a86b', medium: '#e88c00', high: '#e53935' };
const CROWD_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };

const TIME_PRESETS = [
    { label: 'Now', get timeMin() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }, icon: <Clock size={16}/> },
    { label: '8AM Peak', timeMin: 8 * 60, icon: <Sunrise size={16}/> },
    { label: '6PM Peak', timeMin: 18 * 60, icon: <Sunset size={16}/> },
    { label: 'Weekend 11', timeMin: 11 * 60, icon: <Trees size={16}/> },
];

function MapFlyTo({ center }) {
    const map = useMap();
    useEffect(() => { if (center) map.flyTo(center, 13, { duration: 1.2 }); }, [center, map]);
    return null;
}

function StepCard({ step, color }) {
    const ic = MODE_ICONS[step.mode] || '•';
    const col = MODE_COLORS[step.mode] || '#9aafc4';
    return (
        <div style={{
            display: 'flex', gap: 12, padding: '12px 16px', marginBottom: 8,
            background: '#fff', borderRadius: 12,
            border: `1px solid ${col}25`,
            boxShadow: '0 1px 6px rgba(15,40,90,0.06)',
        }}>
            {/* Icon column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 36 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: `${col}18`,
                    border: `2px solid ${col}55`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 16, flexShrink: 0,
                }}>{ic}</div>
                <div style={{ width: 2, flex: 1, background: `${col}30`, borderRadius: 1, minHeight: 12 }} />
            </div>
            {/* Content */}
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0d1b3e', marginBottom: 3 }}>
                    {step.description}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#4a5f80' }}>
                        ⏱ {step.duration_min}m
                    </span>
                    {step.distance_m && (
                        <span style={{ fontSize: 11, color: '#9aafc4' }}>· {step.distance_m}m walk</span>
                    )}
                    {step.crowd_level && (
                        <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                            background: CROWD_COLORS[step.crowd_level] + '18',
                            color: CROWD_COLORS[step.crowd_level],
                            border: `1px solid ${CROWD_COLORS[step.crowd_level]}44`,
                        }}>
                            {CROWD_LABELS[step.crowd_level]} crowd
                        </span>
                    )}
                    {step.from && step.to && step.from !== step.to && (
                        <span style={{ fontSize: 10, color: '#9aafc4' }}>
                            {step.from} → {step.to}
                        </span>
                    )}
                </div>
                {step.next_departures && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${col}30`, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 10, color: '#4a5f80', width: '100%', marginBottom: 2 }}>Upcoming Departures (Est. Fare: ₹{step.fare || 15}):</div>
                        {step.next_departures.map((dep, idx) => (
                            <div key={idx} style={{ background: '#f0f4ff', padding: '4px 8px', borderRadius: 6, fontSize: 10, color: '#1a6cf5', fontWeight: 600 }}>
                                🚌 {dep.bus_no} • {dep.time} (in {dep.in_min}m)
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: col, fontFamily: 'monospace' }}>
                    {step.duration_min}m
                </div>
                <div style={{ fontSize: 9, color: '#c0ccdf', textTransform: 'uppercase' }}>
                    {step.mode}
                </div>
            </div>
        </div>
    );
}

function StopAutocomplete({ value, onChange, onSelect, placeholder }) {
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const timer = useRef(null);

    const handleChange = (e) => {
        const v = e.target.value;
        onChange(v);
        clearTimeout(timer.current);
        if (v.length < 2) { setSuggestions([]); setOpen(false); return; }
        timer.current = setTimeout(async () => {
            try {
                const res = await api.searchStops(v);
                setSuggestions(res);
                setOpen(res.length > 0);
            } catch { setSuggestions([]); setOpen(false); }
        }, 280);
    };

    return (
        <div style={{ position: 'relative' }}>
            <input
                value={value}
                onChange={handleChange}
                onFocus={() => suggestions.length > 0 && setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 180)}
                placeholder={placeholder}
                style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13,
                    border: '1.5px solid rgba(15,40,90,0.15)', outline: 'none',
                    background: '#f8fafc', color: '#0d1b3e', boxSizing: 'border-box',
                    fontFamily: 'Inter,sans-serif',
                }}
            />
            {open && (
                <div style={{
                    position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 9999,
                    background: '#fff', borderRadius: 10, border: '1px solid rgba(15,40,90,0.12)',
                    boxShadow: '0 8px 30px rgba(15,40,90,0.15)', overflow: 'hidden',
                }}>
                    {suggestions.map((s, i) => (
                        <div
                            key={i}
                            onMouseDown={() => { onSelect(s.name); setOpen(false); }}
                            style={{
                                padding: '9px 14px', cursor: 'pointer', fontSize: 12,
                                color: '#0d1b3e', borderBottom: '1px solid rgba(15,40,90,0.05)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <span>📍 {s.name}</span>
                            {s.routes_count > 0 && (
                                <span style={{ fontSize: 10, color: '#9aafc4' }}>{s.routes_count} routes</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ════════════════════════════════════ MAIN ════════════════════════════════ */
export default function PassengerApp() {
    const [origin, setOrigin] = useState('Shivaji Nagar');
    const [dest, setDest] = useState('Hinjawadi Maan Phase 3');
    const [timePreset, setTimePreset] = useState(0);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mapCenter, setMapCenter] = useState([18.5204, 73.8567]);
    const [routeLine, setRouteLine] = useState([]);

    // A5: Issue reporter state
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [issueType, setIssueType] = useState('');
    const [issueDesc, setIssueDesc] = useState('');
    const [issueToast, setIssueToast] = useState('');
    const [issueSubmitting, setIssueSubmitting] = useState(false);

    const submitIssue = useCallback(async () => {
        if (!issueType) return;
        setIssueSubmitting(true);
        try {
            await api.submitIssue({ lat: mapCenter[0], lon: mapCenter[1], type: issueType, description: issueDesc });
            setShowIssueModal(false);
            setIssueType('');
            setIssueDesc('');
            setIssueToast('✅ Report submitted — operators notified!');
            setTimeout(() => setIssueToast(''), 4000);
        } catch {
            setIssueToast('❌ Failed to submit. Try again.');
            setTimeout(() => setIssueToast(''), 3000);
        } finally {
            setIssueSubmitting(false);
        }
    }, [issueType, issueDesc, mapCenter]);


    const search = useCallback(async () => {
        if (!origin.trim() || !dest.trim()) return;
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const timeMin = TIME_PRESETS[timePreset].timeMin;
            const res = await api.planRoute(origin, dest, timeMin);
            if (res.error) { setError(res.error); return; }
            setResult(res);

            // Build polyline from origin → destination GPS
            const line = [];
            if (res.origin?.lat) line.push([res.origin.lat, res.origin.lon]);
            if (res.destination?.lat) line.push([res.destination.lat, res.destination.lon]);
            setRouteLine(line);
            if (res.origin?.lat) setMapCenter([res.origin.lat, res.origin.lon]);
        } catch (e) {
            setError('Could not connect to backend. Make sure the server is running.');
        } finally {
            setLoading(false);
        }
    }, [origin, dest, timePreset]);

    return (
        <div style={{
            display: 'flex', height: '100%', fontFamily: 'Inter,sans-serif',
            background: 'linear-gradient(135deg,#0f1f5a 0%,#1a3a8f 100%)',
        }}>

            {/* ── LEFT PANEL ── */}
            <div style={{
                width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column',
                background: '#f4f7fc', borderRight: '1px solid rgba(15,40,90,0.10)',
                overflowY: 'auto',
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 20px 16px',
                    background: 'linear-gradient(135deg,#1a6cf5,#3b82f6)', color: '#fff',
                }}>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Compass size={20}/> Transit Planner</div>
                    <div style={{ fontSize: 11, opacity: 0.85 }}>
                        Powered by RAPTOR Algorithm · Real PMPML Network
                    </div>
                </div>

                {/* Search form */}
                <div style={{ padding: 16, background: '#fff', borderBottom: '1px solid rgba(15,40,90,0.08)' }}>
                    {/* Origin */}
                    <div style={{ marginBottom: 10 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#4a5f80', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                            <MapPin size={12} color="#00a86b" /> From
                        </label>
                        <StopAutocomplete
                            value={origin}
                            onChange={setOrigin}
                            onSelect={setOrigin}
                            placeholder="Search origin stop…"
                        />
                    </div>

                    {/* Swap button */}
                    <div style={{ textAlign: 'center', marginBottom: 10 }}>
                        <button onClick={() => { setOrigin(dest); setDest(origin); }} style={{
                            background: '#f0f4ff', border: '1px solid rgba(26,108,245,0.25)', borderRadius: 8,
                            padding: '5px 14px', cursor: 'pointer', color: '#1a6cf5',
                        }}>
                            <ArrowRightLeft size={16} style={{ transform: 'rotate(90deg)' }} />
                        </button>
                    </div>

                    {/* Destination */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#4a5f80', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                            <MapPin size={12} color="#e53935" /> To
                        </label>
                        <StopAutocomplete
                            value={dest}
                            onChange={setDest}
                            onSelect={setDest}
                            placeholder="Search destination stop…"
                        />
                    </div>

                    {/* Time selector */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#4a5f80', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                            <Clock size={12} /> Departure Time
                        </label>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {TIME_PRESETS.map((p, i) => (
                                <button key={i} onClick={() => setTimePreset(i)} style={{
                                    flex: 1, padding: '7px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                    background: timePreset === i ? '#1a6cf5' : '#f0f4ff',
                                    color: timePreset === i ? '#fff' : '#4a5f80',
                                    fontSize: 10, fontWeight: 700, fontFamily: 'Inter,sans-serif',
                                    transition: 'all 0.15s',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                                }}>
                                    {p.icon}<span>{p.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search button */}
                    <button onClick={search} disabled={loading} style={{
                        width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: loading ? '#c0ccdf' : 'linear-gradient(135deg,#1a6cf5,#3b82f6)',
                        color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: 'Inter,sans-serif',
                        boxShadow: loading ? 'none' : '0 4px 16px rgba(26,108,245,0.4)',
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}>
                        {loading ? <><Repeat size={16} className="spin" /> Finding route…</> : <><Search size={16} /> Find Route</>}
                    </button>

                    {error && (
                        <div style={{ marginTop: 10, padding: '10px 12px', background: '#fdecea', borderRadius: 8, fontSize: 12, color: '#e53935', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AlertTriangle size={14} /> {error}
                        </div>
                    )}
                </div>

                {/* Results */}
                {result && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '14px 16px', flex: 1 }}>
                        {/* Algorithm badge */}
                        <div style={{
                            marginBottom: 12, padding: '8px 12px',
                            background: 'linear-gradient(135deg,#f0f4ff,#e8f0fe)',
                            borderRadius: 10, border: '1px solid rgba(26,108,245,0.2)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: '#1a6cf5', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Zap size={14} /> {result.algorithm}
                                </div>
                                <div style={{ fontSize: 9, color: '#9aafc4' }}>Round-Based Public Transit Optimized Router</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#00a86b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Leaf size={14} /> {result.carbon_saved_g}g CO₂ saved
                                </div>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex', gap: 8, marginBottom: 14,
                        }}>
                            {[
                                { label: 'Total Time', value: `${result.total_time_min}m`, icon: <Timer size={16} />, color: '#1a6cf5' },
                                { label: 'Transfers', value: result.transfers, icon: <Repeat size={16} />, color: '#e88c00' },
                                { label: 'Fare', value: `₹${result.fare_inr}`, icon: <CreditCard size={16} />, color: '#00a86b' },
                                { label: 'Distance', value: `${result.distance_km}km`, icon: <MapPin size={16} />, color: '#6c3acb' },
                            ].map(m => (
                                <div key={m.label} style={{
                                    flex: 1, textAlign: 'center', background: '#fff',
                                    borderRadius: 10, padding: '9px 4px',
                                    border: `1px solid ${m.color}22`,
                                    boxShadow: '0 1px 4px rgba(15,40,90,0.06)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', color: m.color, marginBottom: 4 }}>{m.icon}</div>
                                    <div style={{ fontSize: 15, fontWeight: 900, color: m.color, fontFamily: 'monospace' }}>{m.value}</div>
                                    <div style={{ fontSize: 9, color: '#9aafc4', textTransform: 'uppercase' }}>{m.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Departure / Arrival */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', marginBottom: 14,
                            padding: '10px 14px', background: '#fff', borderRadius: 10,
                            border: '1px solid rgba(15,40,90,0.08)',
                        }}>
                            <div>
                                <div style={{ fontSize: 10, color: '#9aafc4', textTransform: 'uppercase' }}>Depart</div>
                                <div style={{ fontSize: 18, fontWeight: 900, color: '#1a6cf5', fontFamily: 'monospace' }}>{result.departure}</div>
                                <div style={{ fontSize: 10, color: '#4a5f80' }}>{result.origin?.name || origin}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', color: '#c0ccdf', fontSize: 20 }}>→</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 10, color: '#9aafc4', textTransform: 'uppercase' }}>Arrive</div>
                                <div style={{ fontSize: 18, fontWeight: 900, color: '#00a86b', fontFamily: 'monospace' }}>{result.arrival}</div>
                                <div style={{ fontSize: 10, color: '#4a5f80' }}>{result.destination?.name || dest}</div>
                            </div>
                        </div>

                        {/* Step-by-step */}
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#0d1b3e', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <MapIcon size={14}/> Step-by-Step Route
                        </div>
                        {(result.steps || []).map((step, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                                <StepCard step={step} color="#1a6cf5" />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {!result && !loading && (
                    <div style={{ padding: 24, textAlign: 'center', color: '#9aafc4' }}>
                        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><MapIcon size={40} color="#9aafc4"/></div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>Enter origin & destination</div>
                        <div style={{ fontSize: 11, marginTop: 6 }}>and press Find Route to get your optimized transit plan</div>
                    </div>
                )}
            </div>

            {/* ── MAP ── */}
            <div style={{ flex: 1, position: 'relative' }}>
                {/* Top overlay */}
                <div style={{
                    position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 500, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)',
                    borderRadius: 12, padding: '10px 20px',
                    boxShadow: '0 4px 20px rgba(15,40,90,0.2)', border: '1px solid rgba(15,40,90,0.10)',
                    display: 'flex', alignItems: 'center', gap: 14,
                }}>
                    <span style={{ fontSize: 20 }}>🚌</span>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b3e' }}>Transit-IQ Route Planner</div>
                        <div style={{ fontSize: 10, color: '#9aafc4' }}>RAPTOR · Real PMPML Network · Pune</div>
                    </div>
                    {result && (
                        <div style={{
                            marginLeft: 8, padding: '5px 12px', background: '#e2f9ef',
                            borderRadius: 8, border: '1px solid #00a86b44',
                            fontSize: 11, fontWeight: 700, color: '#00a86b',
                        }}>
                            ✅ Route found · {result.total_time_min}min
                        </div>
                    )}
                </div>

                <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={true}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution="&copy; CARTO"
                        maxZoom={19}
                    />
                    <MapFlyTo center={mapCenter} />

                    {/* Route polyline */}
                    {routeLine.length > 1 && (
                        <Polyline
                            positions={routeLine}
                            color="#1a6cf5"
                            weight={5}
                            opacity={0.8}
                            dashArray="8,4"
                        />
                    )}

                    {/* Origin marker */}
                    {result?.origin?.lat && (
                        <CircleMarker
                            center={[result.origin.lat, result.origin.lon]}
                            radius={10} color="#00a86b" fillColor="#00a86b" fillOpacity={0.9} weight={3}
                        >
                            <Popup>
                                <strong>🟢 Origin</strong><br />
                                {result.origin.name}
                            </Popup>
                        </CircleMarker>
                    )}

                    {/* Destination marker */}
                    {result?.destination?.lat && (
                        <CircleMarker
                            center={[result.destination.lat, result.destination.lon]}
                            radius={10} color="#e53935" fillColor="#e53935" fillOpacity={0.9} weight={3}
                        >
                            <Popup>
                                <strong>🔴 Destination</strong><br />
                                {result.destination.name}
                            </Popup>
                        </CircleMarker>
                    )}
                </MapContainer>

                {/* A5: Floating Report Issue button */}
                <button onClick={() => setShowIssueModal(true)} style={{
                    position: 'absolute', bottom: 24, right: 24, zIndex: 600,
                    background: 'linear-gradient(135deg,#ff6f00,#ff9800)',
                    color: '#fff', border: 'none', borderRadius: '50px',
                    padding: '13px 20px', cursor: 'pointer', fontWeight: 800, fontSize: 13,
                    boxShadow: '0 4px 20px rgba(255,111,0,0.5)',
                    display: 'flex', alignItems: 'center', gap: 8,
                    animation: 'pulse 2.5s infinite',
                }}>
                    <ShieldAlert size={16} /> Report Issue
                </button>

                {/* A5: Toast notification */}
                {issueToast && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute', bottom: 80, right: 24, zIndex: 700,
                            background: '#0d1b3e', color: '#fff', borderRadius: 10,
                            padding: '12px 18px', fontSize: 13, fontWeight: 600,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                        }}>
                        {issueToast}
                    </motion.div>
                )}
            </div>

            {/* A5: Issue Reporter Modal */}
            {showIssueModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        style={{ background: '#fff', borderRadius: 16, padding: '24px', width: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#0d1b3e', marginBottom: 4 }}>🚨 Report an Issue</div>
                        <div style={{ fontSize: 11, color: '#9aafc4', marginBottom: 18 }}>Operators will be notified instantly</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                            {['Overcrowded', 'Bus Not Arrived', 'Breakdown Seen', 'Safety Issue'].map(t => (
                                <button key={t} onClick={() => setIssueType(t)} style={{
                                    padding: '12px 8px', borderRadius: 10, border: `2px solid ${issueType === t ? '#ff6f00' : 'rgba(15,40,90,0.15)'}`,
                                    background: issueType === t ? '#fff3e0' : '#f8fafc',
                                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                                    color: issueType === t ? '#ff6f00' : '#4a5f80', transition: 'all 0.15s',
                                }}>{t}</button>
                            ))}
                        </div>
                        <textarea value={issueDesc} onChange={e => setIssueDesc(e.target.value)}
                            placeholder="Additional details (optional)…"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid rgba(15,40,90,0.15)', fontSize: 12, outline: 'none', resize: 'none', height: 70, boxSizing: 'border-box', fontFamily: 'Inter,sans-serif', marginBottom: 14 }} />
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setShowIssueModal(false)} style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1px solid rgba(15,40,90,0.15)', background: '#f8fafc', cursor: 'pointer', fontSize: 13, color: '#9aafc4', fontWeight: 600 }}>Cancel</button>
                            <button onClick={submitIssue} disabled={!issueType || issueSubmitting} style={{
                                flex: 2, padding: '11px', borderRadius: 9, border: 'none',
                                background: issueType ? 'linear-gradient(135deg,#ff6f00,#ff9800)' : '#e8edf8',
                                color: issueType ? '#fff' : '#9aafc4', cursor: issueType ? 'pointer' : 'not-allowed',
                                fontWeight: 800, fontSize: 13,
                            }}>{issueSubmitting ? 'Submitting…' : '🚨 Submit Report'}</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

