import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, Legend } from 'recharts';
import api from '../api.js';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: null, iconUrl: null, shadowUrl: null });

/* ── helpers ── */
const PCOLOR = { critical: '#e53935', high: '#e88c00', medium: '#1a6cf5', low: '#9aafc4' };

function busIcon(s) {
    const m = {
        breakdown: { bg: '#fff0f0', bd: '#e53935' }, crowded: { bg: '#fff8e1', bd: '#e88c00' },
        delayed: { bg: '#fff3e0', bd: '#fb8c00' }, on_time: { bg: '#f0faf5', bd: '#00a86b' }
    };
    const c = m[s] || m.on_time;
    return L.divIcon({ html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34" width="34" height="34"><circle cx="17" cy="17" r="15" fill="${c.bg}" stroke="${c.bd}" stroke-width="2.5"/><text x="17" y="23" text-anchor="middle" font-size="14">🚌</text></svg>`, className: '', iconSize: [34, 34], iconAnchor: [17, 17] });
}

/* ── sub-components ── */
function CollapseBtn({ side, collapsed, onClick }) {
    return (
        <button onClick={onClick} style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            [side === 'left' ? 'right' : '-left']: side === 'left' ? -13 : -13,
            zIndex: 600, width: 22, height: 44, borderRadius: side === 'left' ? '0 8px 8px 0' : '8px 0 0 8px',
            background: '#1a6cf5', border: 'none', cursor: 'pointer',
            color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(26,108,245,0.4)',
        }}>{side === 'left' ? (collapsed ? '›' : '‹') : (collapsed ? '‹' : '›')}</button>
    );
}

function Chip({ color, children }) {
    return <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 99, background: color + '18', color, border: `1px solid ${color}44` }}>{children}</span>;
}

function MiniStat({ label, value, color = '#1a6cf5', icon }) {
    return (
        <div style={{ background: '#fff', borderRadius: 10, padding: '11px 12px', border: '1px solid rgba(15,40,90,0.09)', boxShadow: '0 1px 4px rgba(15,40,90,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 20, fontWeight: 900, color, fontFamily: 'JetBrains Mono,monospace' }}>{value}</span>
            </div>
            <div style={{ fontSize: 10, color: '#9aafc4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        </div>
    );
}

function ProgressBar({ value, color, height = 4 }) {
    return <div style={{ height, background: '#eef1f8', borderRadius: 99 }}><div style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: color, borderRadius: 99, transition: 'width 0.4s' }} /></div>;
}

function SectionHdr({ children, right, icon }) {
    return (
        <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#0d1b3e', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{icon} {children}</span>
            {right && <span style={{ fontSize: 10, color: '#9aafc4', fontWeight: 600 }}>{right}</span>}
        </div>
    );
}

function AlertItem({ a }) {
    const col = a.severity === 'critical' ? '#e53935' : '#e88c00';
    return (
        <div style={{ background: '#fff', borderRadius: 10, padding: '11px 13px', marginBottom: 7, border: `1px solid ${col}30`, boxShadow: '0 1px 4px rgba(15,40,90,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14 }}>{a.severity === 'critical' ? '🔴' : '🟡'}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0d1b3e', flex: 1 }}>{a.route_name}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: col, fontFamily: 'monospace' }}>{a.deviation_pct}% {a.direction}</span>
            </div>
            <p style={{ fontSize: 11, color: '#4a5f80', margin: 0, lineHeight: 1.5 }}>{a.message}</p>
        </div>
    );
}

function RecCard({ rec, onApprove, onReject }) {
    const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);
    const col = PCOLOR[rec.priority] || '#9aafc4';
    if (done) return null;
    const go = async (fn) => { setBusy(true); await fn(rec.id); setDone(true); };
    return (
        <div style={{ background: '#fff', borderRadius: 11, marginBottom: 9, overflow: 'hidden', border: '1px solid rgba(15,40,90,0.09)', boxShadow: '0 1px 5px rgba(15,40,90,0.05)' }}>
            <div style={{ height: 3, background: col }} />
            <div style={{ padding: '11px 13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0d1b3e', lineHeight: 1.4 }}>{rec.title}</span>
                    <Chip color={col}>{rec.priority?.toUpperCase()}</Chip>
                </div>
                <p style={{ fontSize: 11, color: '#4a5f80', lineHeight: 1.55, margin: '0 0 8px' }}>{rec.reason}</p>
                {rec.digital_twin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                        <div style={{ flex: 1, textAlign: 'center', padding: '7px', background: '#fdecea', borderRadius: 7 }}>
                            <div style={{ fontSize: 17, fontWeight: 900, color: '#e53935', fontFamily: 'monospace' }}>{rec.digital_twin.before_wait_min}m</div>
                            <div style={{ fontSize: 9, color: '#9aafc4' }}>wait before</div>
                        </div>
                        <span style={{ color: '#c0ccdf' }}>→</span>
                        <div style={{ flex: 1, textAlign: 'center', padding: '7px', background: '#e2f9ef', borderRadius: 7 }}>
                            <div style={{ fontSize: 17, fontWeight: 900, color: '#00a86b', fontFamily: 'monospace' }}>{rec.digital_twin.after_wait_min}m</div>
                            <div style={{ fontSize: 9, color: '#9aafc4' }}>wait after</div>
                        </div>
                    </div>
                )}
                <div style={{ fontSize: 11, color: '#00a86b', fontWeight: 600, marginBottom: 9 }}>✦ {rec.impact}</div>
                <div style={{ display: 'flex', gap: 7 }}>
                    <button onClick={() => go(onApprove)} disabled={busy} style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#00a86b', color: '#fff', fontWeight: 700, fontSize: 12 }}>{busy ? '…' : '✓ Approve'}</button>
                    <button onClick={() => go(onReject)} disabled={busy} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(15,40,90,0.15)', cursor: 'pointer', background: '#f8fafc', color: '#9aafc4', fontSize: 12 }}>✕</button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════ MAIN ═══════════════════════════ */
export default function OperatorDashboard() {
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState({});
    const [recs, setRecs] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [accuracy, setAccuracy] = useState(null);
    const [sdg, setSdg] = useState(null);
    const [selRoute, setSelRoute] = useState(null);
    const [tab, setTab] = useState('fleet');
    const [leftOpen, setLeftOpen] = useState(true);
    const [rightOpen, setRightOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());

    const [heatmap, setHeatmap] = useState([]);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [heatmapHour, setHeatmapHour] = useState(8);
    const [timeOfDayProfile, setTimeOfDayProfile] = useState(null);
    const [tradeoffs, setTradeoffs] = useState(null);

    const load = useCallback(async () => {
        try {
            const [r, b, w, fc, re, al, to] = await Promise.all([
                api.getRoutes(), api.getBuses(), api.getWeather(),
                api.getForecast(), api.getRecommendations(), api.getAlerts(),
                api.getOptimizeTradeoffs().catch(() => null)
            ]);
            setRoutes(r); setBuses(b); setWeather(w); setForecast(fc); setRecs(re); setAlerts(al);
            if (to) setTradeoffs(to);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        load(); const iv = setInterval(load, 8000); return () => clearInterval(iv);
    }, [load]);

    useEffect(() => {
        if (showHeatmap) {
            api.getDemandHeatmap(heatmapHour).then(setHeatmap).catch(() => { });
        }
    }, [showHeatmap, heatmapHour]);

    useEffect(() => {
        if (selRoute && tab === 'demand') {
            api.getTimeofdayProfile(selRoute).then(setTimeOfDayProfile).catch(() => { });
        } else {
            setTimeOfDayProfile(null);
        }
    }, [selRoute, tab]);

    useEffect(() => {
        api.getAccuracySummary().then(setAccuracy).catch(() => { });
        api.getSdgImpact().then(setSdg).catch(() => { });
        const iv = setInterval(() => { api.getSdgImpact().then(setSdg).catch(() => { }); }, 30000);
        return () => clearInterval(iv);
    }, []);

    useEffect(() => { const iv = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(iv); }, []);

    /* live metrics computed directly from bus data */
    const total = buses.length;
    // On schedule = delay ≤ 5 min OR status is on_time (realistic Pune threshold)
    const onTimeN = buses.filter(b => b.delay_min <= 5 || b.status === 'on_time').length;
    const crowdedN = buses.filter(b => b.occupancy_pct > 85 || b.status === 'crowded').length;
    const delayedN = buses.filter(b => b.delay_min > 5 && b.status !== 'breakdown').length;
    const breakdownN = buses.filter(b => b.status === 'breakdown').length;
    const avgOcc = total ? Math.round(buses.reduce((s, b) => s + b.occupancy_pct, 0) / total) : 0;
    const onTimePct = total ? Math.round(onTimeN / total * 100) : 0;
    // Real PMPML: ~730 pax/bus/day (PMC 2023 report)
    const dailyEst = total * 730;

    const selObj = routes.find(r => r.route_id === selRoute);
    const visBuses = selRoute ? buses.filter(b => b.route_id === selRoute) : buses;
    const pendRecs = recs.filter(r => r.status === 'pending');

    const TabBtn = ({ id, label, badge }) => (
        <button onClick={() => setTab(id)} style={{
            flex: 1, padding: '8px 4px', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, borderRadius: 7, transition: 'all 0.15s',
            background: tab === id ? '#1a6cf5' : 'transparent', color: tab === id ? '#fff' : '#9aafc4',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}>
            {label}
            {badge > 0 && <span style={{ background: tab === id ? 'rgba(255,255,255,0.3)' : '#e53935', color: '#fff', fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 99 }}>{badge}</span>}
        </button>
    );

    if (loading) return (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7fc' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 34, height: 34, border: '3px solid #e8edf8', borderTop: '3px solid #1a6cf5', borderRadius: '50%', margin: '0 auto 14px', animation: 'spin 0.7s linear infinite' }} />
                <div style={{ color: '#4a5f80', fontWeight: 700, fontSize: 14 }}>Loading Transit Command…</div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#eef2f8', fontFamily: 'Inter,sans-serif' }}>

            {/* ══════ LEFT PANEL ══════ */}
            <div style={{
                width: leftOpen ? 240 : 0, flexShrink: 0, overflow: 'hidden',
                transition: 'width 0.25s ease', position: 'relative',
                background: '#fff', borderRight: '1px solid rgba(15,40,90,0.09)',
                display: 'flex', flexDirection: 'column',
            }}>
                {leftOpen && <>
                    {/* Header */}
                    <div style={{ padding: '12px 14px 10px', background: 'linear-gradient(135deg,#1a6cf5,#3b82f6)', color: '#fff', flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>🗺️ Route Control</div>
                        <div style={{ fontSize: 10, opacity: 0.8 }}>{routes.length} routes · {total} buses</div>
                    </div>

                    {/* System health row */}
                    <div style={{ padding: '8px 10px', background: '#f8fafc', borderBottom: '1px solid rgba(15,40,90,0.08)', display: 'flex', gap: 6, flexShrink: 0 }}>
                        {[
                            { v: onTimePct + '%', l: 'On Schedule', c: '#00a86b' },
                            { v: crowdedN, l: 'Crowded', c: '#e88c00' },
                            { v: breakdownN, l: 'Down', c: '#e53935' },
                        ].map(m => (
                            <div key={m.l} style={{ flex: 1, textAlign: 'center', background: '#fff', borderRadius: 8, padding: '6px 4px', border: '1px solid rgba(15,40,90,0.08)' }}>
                                <div style={{ fontSize: 15, fontWeight: 900, color: m.c, fontFamily: 'monospace' }}>{m.v}</div>
                                <div style={{ fontSize: 9, color: '#9aafc4', textTransform: 'uppercase' }}>{m.l}</div>
                            </div>
                        ))}
                    </div>

                    {/* Route list */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                        <button onClick={() => setSelRoute(null)} style={{
                            width: '100%', padding: '8px 10px', marginBottom: 6, borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                            background: !selRoute ? '#e8f0fe' : 'transparent', border: `1px solid ${!selRoute ? 'rgba(26,108,245,0.3)' : 'transparent'}`,
                            color: !selRoute ? '#1a6cf5' : '#4a5f80', fontSize: 12, fontWeight: 700,
                        }}>🗺️ All Routes ({total} buses)</button>

                        {routes.map(r => {
                            const rb = buses.filter(b => b.route_id === r.route_id);
                            const load = rb.length ? Math.round(rb.reduce((s, b) => s + b.occupancy_pct, 0) / rb.length) : 0;
                            const down = rb.filter(b => b.status === 'breakdown').length;
                            const del = rb.filter(b => b.status === 'delayed').length;
                            const lc = load > 80 ? '#e53935' : load > 60 ? '#e88c00' : '#00a86b';
                            const act = selRoute === r.route_id;
                            return (
                                <button key={r.route_id} onClick={() => setSelRoute(act ? null : r.route_id)} style={{
                                    width: '100%', padding: '10px', marginBottom: 5, borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                                    background: act ? '#f0f4ff' : '#f8fafc', border: `1px solid ${act ? 'rgba(26,108,245,0.3)' : 'rgba(15,40,90,0.08)'}`,
                                    transition: 'all 0.15s',
                                }}>
                                    {/* Name + dot */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                                        <div style={{ width: 9, height: 9, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: 12, fontWeight: 700, color: act ? '#1a6cf5' : '#0d1b3e', flex: 1 }}>{r.route_name}</span>
                                        <span style={{ fontSize: 9, color: '#9aafc4' }}>{rb.length} buses</span>
                                    </div>
                                    {/* Description */}
                                    <div style={{ fontSize: 10, color: '#9aafc4', paddingLeft: 16, marginBottom: 6, lineHeight: 1.3 }}>
                                        {(r.description || '').replace(' → ', '\n→ ')}
                                    </div>
                                    {/* Load bar */}
                                    <div style={{ paddingLeft: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                            <span style={{ fontSize: 9, color: '#c0ccdf' }}>AVG LOAD</span>
                                            <span style={{ fontSize: 9, fontWeight: 800, color: lc }}>{load}%</span>
                                        </div>
                                        <ProgressBar value={load} color={lc} height={3} />
                                    </div>
                                    {/* Status pills */}
                                    {(down > 0 || del > 0) && (
                                        <div style={{ display: 'flex', gap: 5, paddingLeft: 16, marginTop: 6 }}>
                                            {down > 0 && <Chip color="#e53935">{down} down</Chip>}
                                            {del > 0 && <Chip color="#e88c00">{del} delayed</Chip>}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Weather */}
                    {weather && (
                        <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(15,40,90,0.08)', background: weather.high_rain_risk ? '#fffbf0' : '#f8fafc', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 22 }}>{weather.icon}</span>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0d1b3e' }}>{weather.temperature_c?.toFixed(1)}°C · {weather.condition}</div>
                                    <div style={{ fontSize: 10, color: weather.high_rain_risk ? '#e88c00' : '#9aafc4' }}>
                                        {weather.high_rain_risk ? `⚠️ Rain risk ${weather.rain_probability}%` : `Rain prob: ${weather.rain_probability}%`}
                                    </div>
                                </div>
                            </div>
                            {weather.high_rain_risk && (
                                <div style={{ padding: '6px 10px', background: '#fff7e0', borderRadius: 8, border: '1px solid rgba(232,140,0,0.25)', fontSize: 10, color: '#e88c00', fontWeight: 600 }}>
                                    +{Math.round((weather.demand_multiplier - 1) * 100)}% demand surge expected — pre-position buses
                                </div>
                            )}
                        </div>
                    )}
                </>}
            </div>

            {/* ══════ CENTER MAP ══════ */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

                {/* ── Panel toggle buttons — always visible on map edges ── */}
                <button onClick={() => setLeftOpen(o => !o)} title={leftOpen ? 'Collapse left panel' : 'Expand left panel'} style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    zIndex: 700, width: 22, height: 52, borderRadius: '0 10px 10px 0',
                    background: 'linear-gradient(135deg,#1a6cf5,#3b82f6)', border: 'none', cursor: 'pointer',
                    color: '#fff', fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '2px 0 10px rgba(26,108,245,0.35)', transition: 'all 0.2s',
                }}>{leftOpen ? '‹' : '›'}</button>

                <button onClick={() => setRightOpen(o => !o)} title={rightOpen ? 'Collapse right panel' : 'Expand right panel'} style={{
                    position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                    zIndex: 700, width: 22, height: 52, borderRadius: '10px 0 0 10px',
                    background: 'linear-gradient(135deg,#1a6cf5,#3b82f6)', border: 'none', cursor: 'pointer',
                    color: '#fff', fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '-2px 0 10px rgba(26,108,245,0.35)', transition: 'all 0.2s',
                }}>{rightOpen ? '›' : '‹'}</button>

                {/* Top status bar */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 500,
                    background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(15,40,90,0.10)',
                    display: 'flex', alignItems: 'stretch',
                }}>
                    {[
                        { v: total, l: 'Total Buses', c: '#1a6cf5', icon: '🚌' },
                        { v: onTimePct + '%', l: 'On Schedule', c: '#00a86b', icon: '✅' },
                        { v: crowdedN, l: 'Crowded', c: '#e88c00', icon: '🟠' },
                        { v: delayedN, l: 'Delayed >5m', c: '#fb8c00', icon: '⏱️' },
                        { v: breakdownN, l: 'Breakdown', c: '#e53935', icon: '🔴' },
                        { v: avgOcc + '%', l: 'Avg Load', c: '#6c3acb', icon: '📊' },
                        { v: (dailyEst / 1e5).toFixed(1) + 'L', l: 'Est. Daily Riders', c: '#1a6cf5', icon: '👥' },
                    ].map(m => (
                        <div key={m.l} style={{ flex: 1, padding: '8px 10px', textAlign: 'center', borderRight: '1px solid rgba(15,40,90,0.07)' }}>
                            <div style={{ fontSize: 16, fontWeight: 900, color: m.c, fontFamily: 'JetBrains Mono,monospace' }}>{m.v}</div>
                            <div style={{ fontSize: 9, color: '#9aafc4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.icon} {m.l}</div>
                        </div>
                    ))}
                    <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00a86b', display: 'inline-block' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#00a86b' }}>LIVE</span>
                        <span style={{ fontSize: 10, color: '#9aafc4', fontFamily: 'monospace' }}>{now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                </div>

                {/* Route label */}
                {selObj && (
                    <div style={{ position: 'absolute', top: 50, left: 12, zIndex: 500, background: '#fff', borderRadius: 10, padding: '7px 13px', border: `1px solid ${selObj.color}44`, boxShadow: '0 2px 12px rgba(15,40,90,0.12)' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: selObj.color }}>{selObj.route_name}</div>
                        <div style={{ fontSize: 10, color: '#4a5f80' }}>{selObj.description}</div>
                    </div>
                )}

                {/* Heatmap overlay controls */}
                <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 500, background: 'rgba(255,255,255,0.96)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(15,40,90,0.09)', boxShadow: '0 2px 10px rgba(15,40,90,0.08)', display: 'flex', flexDirection: 'column', gap: 8, width: 170 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0d1b3e' }}>🌡️ Demand Heat</span>
                        <input type="checkbox" checked={showHeatmap} onChange={e => setShowHeatmap(e.target.checked)} />
                    </div>
                    {showHeatmap && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4a5f80', marginBottom: 4 }}>
                                <span>5AM</span>
                                <span style={{ fontWeight: 800, color: '#1a6cf5' }}>{heatmapHour <= 12 ? (heatmapHour === 12 ? '12PM' : heatmapHour + 'AM') : (heatmapHour - 12) + 'PM'}</span>
                                <span>11PM</span>
                            </div>
                            <input type="range" min="5" max="23" value={heatmapHour} onChange={e => setHeatmapHour(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#e53935' }} />
                        </div>
                    )}
                </div>

                {/* Map legend */}
                <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 500, background: 'rgba(255,255,255,0.96)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(15,40,90,0.09)', boxShadow: '0 2px 10px rgba(15,40,90,0.08)' }}>
                    {[['#00a86b', 'On Time'], ['#e88c00', 'Crowded'], ['#fb8c00', 'Delayed'], ['#e53935', 'Breakdown']].map(([c, l]) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                            <div style={{ width: 9, height: 9, borderRadius: '50%', background: c + '35', border: `2px solid ${c}` }} />
                            <span style={{ fontSize: 11, color: '#4a5f80' }}>{l}</span>
                        </div>
                    ))}
                </div>

                <MapContainer center={[18.5204, 73.8567]} zoom={12} style={{ height: '100%', width: '100%', paddingTop: 42 }} zoomControl={false}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' maxZoom={19} />
                    {routes.filter(r => !selRoute || r.route_id === selRoute).map(r => {
                        const c = (r.stop_coordinates || []).map(s => [s.lat, s.lon]);
                        return c.length > 1 ? <Polyline key={r.route_id} positions={c} color={r.color} weight={selRoute === r.route_id ? 5 : 2.5} opacity={selRoute && selRoute !== r.route_id ? 0.12 : 0.80} /> : null;
                    })}
                    {selObj?.stop_coordinates?.map((s, i) => (
                        <CircleMarker key={i} center={[s.lat, s.lon]} radius={6} color={selObj.color} fillColor="#fff" fillOpacity={0.95} weight={2.5}>
                            <Popup><div style={{ fontFamily: 'Inter,sans-serif', fontSize: 12 }}><strong>{s.name}</strong><br />Stop {i + 1} · {selObj.route_name}</div></Popup>
                        </CircleMarker>
                    ))}
                    {visBuses.map(b => (
                        <Marker key={b.bus_id} position={[b.lat, b.lon]} icon={busIcon(b.status)}>
                            <Popup>
                                <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, minWidth: 170, lineHeight: 1.7 }}>
                                    <strong style={{ fontSize: 14 }}>{b.bus_id}</strong> · {b.route_name}<br />
                                    Status: <strong>{b.status}</strong> · Load: <strong>{b.occupancy_pct}%</strong><br />
                                    Delay: <strong>{b.delay_min}m</strong> · Speed: <strong>{Math.round(b.speed_kmh)} km/h</strong><br />
                                    Next: <strong>{b.next_stop}</strong> in {b.eta_next_stop_min}m<br />
                                    Passengers: <strong>{b.passengers}/{b.capacity}</strong>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    {/* Heatmap overlay markers */}
                    {showHeatmap && heatmap.map((s, i) => {
                        const r = Math.max(4, s.demand_score * 22);
                        const c = s.demand_level === 'critical' ? '#e53935' : s.demand_level === 'high' ? '#e88c00' : s.demand_level === 'medium' ? '#1a6cf5' : '#00a86b';
                        return (
                            <CircleMarker key={'hm' + i} center={[s.lat, s.lon]} radius={r} color={c} fillColor={c} fillOpacity={0.6} weight={1}>
                                <Popup>
                                    <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 12 }}>
                                        <strong>{s.stop_name}</strong><br />
                                        Demand: <strong>{s.passengers} pax</strong> ({s.occupancy_pct}%)<br />
                                        Serving: <strong>{s.routes_serving} routes</strong>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        );
                    })}
                </MapContainer>
            </div>

            {/* ══════ RIGHT PANEL ══════ */}
            <div style={{
                width: rightOpen ? 346 : 0, flexShrink: 0, overflow: 'hidden',
                transition: 'width 0.25s ease', position: 'relative',
                background: '#f8fafc', borderLeft: '1px solid rgba(15,40,90,0.09)',
                display: 'flex', flexDirection: 'column',
            }}>
                {rightOpen && <>
                    {/* Tab bar */}
                    <div style={{ padding: '10px 10px 7px', background: '#fff', borderBottom: '1px solid rgba(15,40,90,0.08)', display: 'flex', gap: 4, flexShrink: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <TabBtn id="fleet" label="🚌 Fleet" />
                        <TabBtn id="demand" label="📊 Demand" />
                        <TabBtn id="optimize" label="⚙️ Optimize" />
                        <TabBtn id="alerts" label="🔔 Alerts" badge={alerts.length} />
                        <TabBtn id="ai" label="🤖 AI" />
                    </div>

                    {/* ── FLEET tab ── */}
                    {tab === 'fleet' && (
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <SectionHdr icon="📍" right="Live">Fleet Status</SectionHdr>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 12px 10px' }}>
                                <MiniStat icon="🚌" label="Total Buses" value={total} color="#1a6cf5" />
                                <MiniStat icon="✅" label="On Schedule" value={onTimePct + '%'} color="#00a86b" />
                                <MiniStat icon="🟠" label="Crowded >85%" value={crowdedN} color="#e88c00" />
                                <MiniStat icon="⏱️" label="Delayed >5m" value={delayedN} color="#fb8c00" />
                                <MiniStat icon="🔴" label="Breakdown" value={breakdownN} color="#e53935" />
                                <MiniStat icon="📊" label="Avg Load" value={avgOcc + '%'} color="#6c3acb" />
                            </div>

                            {/* Load breakdown bar */}
                            <div style={{ padding: '0 12px 12px' }}>
                                <div style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(15,40,90,0.09)' }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0d1b3e', marginBottom: 10 }}>Fleet Load Distribution</div>
                                    <div style={{ display: 'flex', gap: 2, height: 20, borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
                                        {[
                                            { n: onTimeN, c: '#00a86b', l: 'On Time' },
                                            { n: crowdedN, c: '#e88c00', l: 'Crowded' },
                                            { n: delayedN, c: '#fb8c00', l: 'Delayed' },
                                            { n: breakdownN, c: '#e53935', l: 'Breakdown' },
                                        ].map(s => total > 0 && s.n > 0 ? (
                                            <div key={s.l} title={`${s.l}: ${s.n}`} style={{ flex: s.n / total, background: s.c }} />
                                        ) : null)}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
                                        {[{ n: onTimeN, c: '#00a86b', l: 'On Time' }, { n: crowdedN, c: '#e88c00', l: 'Crowded' }, { n: delayedN, c: '#fb8c00', l: 'Delayed' }, { n: breakdownN, c: '#e53935', l: 'Breakdown' }].map(s => (
                                            <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.c }} />
                                                <span style={{ fontSize: 10, color: '#4a5f80' }}>{s.l} <strong>{s.n}</strong></span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Live bus list */}
                            <div style={{ padding: '0 12px 4px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: '#0d1b3e', textTransform: 'uppercase', letterSpacing: '0.07em' }}>🚌 Live Bus List</span>
                                <span style={{ fontSize: 10, color: '#9aafc4' }}>{visBuses.length} buses</span>
                            </div>
                            <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {visBuses.slice(0, 20).map(b => {
                                    const sc = b.status === 'breakdown' ? '#e53935' : b.status === 'crowded' ? '#e88c00' : b.status === 'delayed' ? '#fb8c00' : '#00a86b';
                                    return (
                                        <div key={b.bus_id} style={{ background: '#fff', borderRadius: 9, padding: '9px 11px', border: `1px solid ${sc}25`, display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc, flexShrink: 0 }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0d1b3e' }}>{b.bus_id}</span>
                                                    <span style={{ fontSize: 10, color: '#9aafc4' }}>{b.route_name}</span>
                                                </div>
                                                <div style={{ fontSize: 10, color: '#4a5f80', marginTop: 2 }}>
                                                    Next: <strong>{b.next_stop}</strong> · {b.eta_next_stop_min}m · {Math.round(b.speed_kmh)} km/h
                                                </div>
                                                <div style={{ marginTop: 5 }}>
                                                    <ProgressBar value={b.occupancy_pct} color={b.occupancy_pct > 85 ? '#e53935' : b.occupancy_pct > 65 ? '#e88c00' : '#00a86b'} height={3} />
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <div style={{ fontSize: 14, fontWeight: 900, color: sc, fontFamily: 'monospace' }}>{b.occupancy_pct}%</div>
                                                <div style={{ fontSize: 9, color: '#9aafc4' }}>load</div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {visBuses.length > 20 && <div style={{ textAlign: 'center', fontSize: 10, color: '#9aafc4', padding: '4px' }}>+{visBuses.length - 20} more buses</div>}
                            </div>

                            {/* AI Recommendations */}
                            <div style={{ padding: '0 12px 4px', borderTop: '1px solid rgba(15,40,90,0.08)', paddingTop: 10 }}>
                                <SectionHdr icon="🧠" right={`${pendRecs.length} pending`}>AI Recommendations</SectionHdr>
                            </div>
                            <div style={{ padding: '0 12px 16px' }}>
                                {pendRecs.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#9aafc4', fontSize: 12, background: '#fff', borderRadius: 10 }}>✅ No pending recommendations</div>
                                ) : pendRecs.map(r => <RecCard key={r.id} rec={r} onApprove={async (id) => { await api.approveRec(id); load(); }} onReject={async (id) => { await api.rejectRec(id); load(); }} />)}
                            </div>
                        </div>
                    )}

                    {/* ── DEMAND tab ── */}
                    {tab === 'demand' && (
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {selObj ? (
                                <>
                                    <SectionHdr icon="📈" right="next 4h">{selObj.route_name} Forecast</SectionHdr>
                                    <div style={{ padding: '0 12px 12px' }}>
                                        <div style={{ background: '#fff', borderRadius: 12, padding: '12px', border: '1px solid rgba(15,40,90,0.09)' }}>
                                            <ResponsiveContainer width="100%" height={180}>
                                                <AreaChart data={forecast[selObj.route_id] || []} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor={selObj.color} stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor={selObj.color} stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9aafc4' }} tickLine={false} />
                                                    <YAxis tick={{ fontSize: 10, fill: '#9aafc4' }} tickLine={false} axisLine={false} />
                                                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid rgba(15,40,90,0.12)' }} />
                                                    <Area type="monotone" dataKey="passengers" name="Passengers" stroke={selObj.color} strokeWidth={2.5} fill="url(#gF)" dot={false} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                        {/* Peak info */}
                                        {(forecast[selObj.route_id] || []).length > 0 && (() => {
                                            const fc = forecast[selObj.route_id] || [];
                                            const peak = fc.reduce((a, b) => b.passengers > a.passengers ? b : a, fc[0]);
                                            return (
                                                <div style={{ marginTop: 10, padding: '10px 12px', background: '#fff', borderRadius: 10, border: '1px solid rgba(15,40,90,0.09)' }}>
                                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0d1b3e', marginBottom: 4 }}>⚡ Peak Demand</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontSize: 10, color: '#4a5f80' }}>Time: <strong>{peak.time}</strong></span>
                                                        <span style={{ fontSize: 16, fontWeight: 900, color: selObj.color, fontFamily: 'monospace' }}>{peak.passengers} pax</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Time of Day Profiles */}
                                        {timeOfDayProfile && (
                                            <div style={{ marginTop: 14 }}>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: '#0d1b3e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>⏱️ Demand By Time of Day</div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
                                                    {Object.values(timeOfDayProfile.scenarios).map((s, i) => (
                                                        <div key={i} style={{ background: '#f8fafc', padding: '8px', borderRadius: 8, border: '1px solid rgba(15,40,90,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <div style={{ fontSize: 20 }}>{s.icon}</div>
                                                            <div>
                                                                <div style={{ fontSize: 9, color: '#9aafc4', textTransform: 'uppercase' }}>{s.label}</div>
                                                                <div style={{ fontSize: 13, fontWeight: 800, color: '#0d1b3e' }}>{s.passengers} pax</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ background: '#fff', borderRadius: 10, padding: '10px 10px 0', border: '1px solid rgba(15,40,90,0.09)' }}>
                                                    <div style={{ fontSize: 10, color: '#4a5f80', marginBottom: 6, fontWeight: 600 }}>Weekday vs Weekend Overview</div>
                                                    <ResponsiveContainer width="100%" height={120}>
                                                        <LineChart data={timeOfDayProfile.hourly_profile} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                                            <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#9aafc4' }} tickLine={false} interval={3} />
                                                            <YAxis tick={{ fontSize: 9, fill: '#9aafc4' }} tickLine={false} axisLine={false} />
                                                            <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                                                            <Legend wrapperStyle={{ fontSize: 10 }} />
                                                            <Line type="monotone" dataKey="weekday" name="Weekday" stroke={selObj.color} strokeWidth={2} dot={false} />
                                                            <Line type="monotone" dataKey="weekend" name="Weekend" stroke="#e88c00" strokeWidth={2} dot={false} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <SectionHdr icon="📊" right="peak next 2h">All Routes Demand</SectionHdr>
                                    {accuracy?.training_status === 'in_progress' && (
                                        <div style={{ margin: '0 12px 10px', padding: '12px 14px', background: '#fff8e1', borderRadius: 10, border: '1px solid rgba(232,140,0,0.3)', fontSize: 11, color: '#e88c00', lineHeight: 1.6 }}>
                                            ⏳ <strong>ML model training in background</strong> (~2 min)<br />
                                            <span style={{ fontSize: 10, color: '#9aafc4' }}>Showing rule-based baseline forecasts. Live ML predictions will appear once trained.</span>
                                        </div>
                                    )}
                                    <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {routes.map(r => {
                                            const fc = forecast[r.route_id] || [];
                                            const peak = fc.length ? Math.max(...fc.slice(0, 8).map(s => s.passengers)) : 0;
                                            const cur = fc[0]?.passengers || 0;
                                            return (
                                                <div key={r.route_id} style={{ background: '#fff', borderRadius: 11, padding: '11px 13px', border: '1px solid rgba(15,40,90,0.08)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color }} />
                                                            <span style={{ fontSize: 12, fontWeight: 700, color: '#0d1b3e' }}>{r.route_name}</span>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span style={{ fontSize: 15, fontWeight: 900, color: r.color, fontFamily: 'monospace' }}>{peak}</span>
                                                            <span style={{ fontSize: 9, color: '#9aafc4' }}> peak pax</span>
                                                        </div>
                                                    </div>
                                                    <ResponsiveContainer width="100%" height={48}>
                                                        <AreaChart data={fc.slice(0, 10)} margin={{ top: 2, right: 2, left: -30, bottom: 0 }}>
                                                            <defs><linearGradient id={`g${r.route_id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={r.color} stopOpacity={0.25} /><stop offset="95%" stopColor={r.color} stopOpacity={0} /></linearGradient></defs>
                                                            <Area type="monotone" dataKey="passengers" stroke={r.color} strokeWidth={2} fill={`url(#g${r.route_id})`} dot={false} />
                                                            <Tooltip contentStyle={{ fontSize: 9, borderRadius: 6, border: 'none', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                                        <span style={{ fontSize: 9, color: '#9aafc4' }}>Current: <strong style={{ color: '#0d1b3e' }}>{cur} pax</strong></span>
                                                        <span style={{ fontSize: 9, color: '#9aafc4' }}>Confidence: <strong style={{ color: '#00a86b' }}>{fc[0]?.confidence ? Math.round(fc[0].confidence * 100) + '%' : '—'}</strong></span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ── ALERTS tab ── */}
                    {tab === 'alerts' && (
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <SectionHdr icon="🔔" right={`${alerts.length} active`}>Anomaly Detection</SectionHdr>
                            <div style={{ padding: '0 12px 12px' }}>
                                {alerts.length === 0 ? (
                                    <div style={{ padding: '28px', textAlign: 'center', color: '#9aafc4', fontSize: 13, background: '#fff', borderRadius: 10 }}>✅ System normal — no anomalies</div>
                                ) : alerts.map((a, i) => <AlertItem key={i} a={a} />)}
                            </div>
                        </div>
                    )}

                    {/* ── AI tab ── */}
                    {tab === 'ai' && (
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {/* Model accuracy */}
                            <SectionHdr icon="🤖">Model Accuracy</SectionHdr>
                            <div style={{ padding: '0 12px 12px' }}>
                                <div style={{ background: '#fff', borderRadius: 12, padding: '14px', border: '1px solid rgba(15,40,90,0.09)', marginBottom: 10 }}>
                                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                        {[
                                            {
                                                v: accuracy?.avg_mape ? `${accuracy.avg_mape}%` : '…',
                                                l: 'Avg MAPE',
                                                c: accuracy?.avg_mape < 12 ? '#00a86b' : '#e88c00',
                                                note: 'lower is better'
                                            },
                                            {
                                                v: accuracy?.best_mape ? `${accuracy.best_mape}%` : '…',
                                                l: 'Best Route',
                                                c: '#00a86b',
                                                note: 'vs 18% baseline'
                                            },
                                        ].map(m => (
                                            <div key={m.l} style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#f8fafc', borderRadius: 9, border: `1px solid ${m.c}22` }}>
                                                <div style={{ fontSize: 24, fontWeight: 900, color: m.c, fontFamily: 'monospace' }}>{m.v}</div>
                                                <div style={{ fontSize: 10, color: '#9aafc4', textTransform: 'uppercase' }}>{m.l}</div>
                                                <div style={{ fontSize: 9, color: m.c, fontWeight: 600, marginTop: 2 }}>{m.note}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {accuracy?.training_status === 'in_progress' && (
                                        <div style={{ padding: '6px 10px', background: '#fff8e1', borderRadius: 7, border: '1px solid rgba(232,140,0,0.3)', fontSize: 10, color: '#e88c00', marginBottom: 10 }}>
                                            ⏳ Model training in background — accuracy improving…
                                        </div>
                                    )}
                                    <div style={{ padding: '9px 11px', borderRadius: 8, background: 'linear-gradient(135deg,#f0f4ff,#f4f0ff)', border: '1px solid rgba(26,108,245,0.14)', fontSize: 11, color: '#4a5f80', lineHeight: 1.55 }}>
                                        🤖 <strong>Hybrid Prophet + XGBoost</strong> — Prophet models seasonality, XGBoost corrects residuals using 3-year real Pune weather data (2022–2024).
                                    </div>
                                </div>
                            </div>

                            {/* SDG Impact */}
                            <SectionHdr icon="🌱" right="live">SDG Impact</SectionHdr>
                            <div style={{ padding: '0 12px 16px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                                {[
                                    { icon: '🏙️', label: 'CO₂ Saved Today', val: sdg ? `${sdg.sdg11.co2_saved_kg_today.toLocaleString()} kg` : '…', sdg: 11, c: '#f4a020' },
                                    { icon: '⚡', label: 'Fuel Saved Today', val: sdg ? `${sdg.sdg7.fuel_saved_litres_today}L` : '…', sdg: 7, c: '#fcc30b' },
                                    { icon: '💰', label: 'Cost Saved', val: sdg ? `₹${sdg.sdg7.cost_saved_inr_today.toLocaleString()}` : '…', sdg: 7, c: '#00a86b' },
                                    { icon: '🔧', label: 'Routes Optimised', val: sdg ? sdg.sdg9.routes_optimised : '…', sdg: 9, c: '#fd6925' },
                                    { icon: '🌍', label: 'Cars Off-Road Equiv.', val: sdg ? sdg.sdg13.cars_off_road_equivalent_today.toLocaleString() : '…', sdg: 13, c: '#3f7e44' },
                                    { icon: '⏱️', label: 'On-Time %', val: sdg ? `${sdg.sdg11.on_time_percentage}%` : `${onTimePct}%`, sdg: 11, c: '#1a6cf5' },
                                ].map((m, i) => (
                                    <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '10px 13px', border: '1px solid rgba(15,40,90,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontSize: 20, flexShrink: 0 }}>{m.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 9, color: '#9aafc4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>SDG {m.sdg} · {m.label}</div>
                                            <div style={{ fontSize: 18, fontWeight: 900, color: m.c, fontFamily: 'monospace' }}>{m.val}</div>
                                        </div>
                                    </div>
                                ))}
                                {sdg && <div style={{ textAlign: 'center', fontSize: 9, color: '#c0ccdf', paddingTop: 4 }}>Updated {new Date(sdg.timestamp).toLocaleTimeString('en-IN')}</div>}
                            </div>
                        </div>
                    )}
                    {/* ── OPTIMIZE tab ── */}
                    {tab === 'optimize' && tradeoffs && (
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <SectionHdr icon="⚙️" right="Multi-Objective">Fleet Strategies</SectionHdr>
                            <div style={{ padding: '0 12px 12px' }}>
                                <div style={{ fontSize: 11, color: '#4a5f80', marginBottom: 12, lineHeight: 1.5, background: '#fff', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(15,40,90,0.08)' }}>
                                    <strong>{tradeoffs.pending_recs} bottlenecks detected</strong> across {tradeoffs.total_routes} routes. Select an allocation strategy to prioritize either passenger wait time or fleet fuel cost.
                                </div>
                                <div style={{ background: '#fff', borderRadius: 12, padding: '10px', marginBottom: 16, border: '1px solid rgba(15,40,90,0.09)' }}>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                            { subject: 'Wait Score', A: tradeoffs.strategies[0].radar.wait_score, B: tradeoffs.strategies[1].radar.wait_score, C: tradeoffs.strategies[2].radar.wait_score, fullMark: 100 },
                                            { subject: 'Fuel Score', A: tradeoffs.strategies[0].radar.fuel_score, B: tradeoffs.strategies[1].radar.fuel_score, C: tradeoffs.strategies[2].radar.fuel_score, fullMark: 100 },
                                            { subject: 'Coverage', A: tradeoffs.strategies[0].radar.coverage_score, B: tradeoffs.strategies[1].radar.coverage_score, C: tradeoffs.strategies[2].radar.coverage_score, fullMark: 100 }
                                        ]}>
                                            <PolarGrid stroke="#eef1f8" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#4a5f80', fontSize: 10, fontWeight: 700 }} />
                                            <Radar name="Time-Optimal" dataKey="A" stroke={tradeoffs.strategies[0].color} fill={tradeoffs.strategies[0].color} fillOpacity={0.2} />
                                            <Radar name="Fuel-Optimal" dataKey="B" stroke={tradeoffs.strategies[1].color} fill={tradeoffs.strategies[1].color} fillOpacity={0.2} />
                                            <Radar name="Balanced" dataKey="C" stroke={tradeoffs.strategies[2].color} fill={tradeoffs.strategies[2].color} fillOpacity={0.2} />
                                            <Tooltip contentStyle={{ fontSize: 10 }} />
                                            <Legend wrapperStyle={{ fontSize: 10 }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {tradeoffs.strategies.map(st => (
                                        <div key={st.id} style={{
                                            background: st.recommended ? '#f4faf6' : '#fff',
                                            borderRadius: 12, padding: '12px 14px',
                                            border: `2px solid ${st.recommended ? st.color : 'rgba(15,40,90,0.08)'}`,
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <div style={{ fontSize: 13, fontWeight: 800, color: st.color }}>{st.name}</div>
                                                <div style={{ fontSize: 12, fontWeight: 900, color: '#0d1b3e' }}>+{st.extra_buses_needed} <span style={{ fontSize: 10, color: '#9aafc4' }}>buses</span></div>
                                            </div>
                                            <div style={{ fontSize: 10, color: '#4a5f80', marginBottom: 10 }}>{st.description}</div>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <div style={{ flex: 1, background: '#fff', borderRadius: 8, padding: '6px', border: '1px solid rgba(15,40,90,0.06)' }}>
                                                    <div style={{ fontSize: 9, color: '#9aafc4', textTransform: 'uppercase' }}>Avg Wait After</div>
                                                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0d1b3e' }}>{st.avg_wait_min_after}m <span style={{ color: '#00a86b', fontSize: 10 }}>(-{st.wait_reduction_pct}%)</span></div>
                                                </div>
                                                <div style={{ flex: 1, background: '#fff', borderRadius: 8, padding: '6px', border: '1px solid rgba(15,40,90,0.06)' }}>
                                                    <div style={{ fontSize: 9, color: '#9aafc4', textTransform: 'uppercase' }}>Fuel Cost / Day</div>
                                                    <div style={{ fontSize: 13, fontWeight: 800, color: '#e88c00' }}>₹{st.fuel_cost_inr_daily.toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <button style={{ width: '100%', padding: '8px', marginTop: 10, borderRadius: 8, border: 'none', background: st.color, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Apply Strategy</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>}
            </div>
        </div>
    );
}
