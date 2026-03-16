/* Transit-IQ API Client — v2 (Round 2) */
const BASE = 'http://localhost:8000';

async function fetcher(path) {
    const r = await fetch(`${BASE}${path}`);
    if (!r.ok) throw new Error(`API error: ${r.status} on ${path}`);
    return r.json();
}

export const api = {
    // ── Core ─────────────────────────────────────────────────────────────
    getRoutes: () => fetcher('/api/routes'),
    getBuses: () => fetcher('/api/buses'),
    getStops: () => fetcher('/api/stops'),
    getWeather: () => fetcher('/api/weather'),
    getMetrics: () => fetcher('/api/health'),
    getMetro: () => fetcher('/api/metro'),

    // ── Demand ───────────────────────────────────────────────────────────
    getForecast: (routeId) => fetcher(routeId ? `/api/demand/forecast/${routeId}` : '/api/demand/forecast'),
    refreshForecast: () => fetch(`${BASE}/api/demand/refresh`, { method: 'POST' }).then(r => r.json()),

    // ── Fleet ────────────────────────────────────────────────────────────
    getRecommendations: () => fetcher('/api/recommendations'),
    getAlerts: () => fetcher('/api/alerts'),
    approveRec: (id) => fetch(`${BASE}/api/recommendations/${id}/approve`, { method: 'POST' }).then(r => r.json()),
    rejectRec: (id) => fetch(`${BASE}/api/recommendations/${id}/reject`, { method: 'POST' }).then(r => r.json()),

    // ── Journey ──────────────────────────────────────────────────────────
    planJourney: (origin, dest) =>
        fetcher(`/api/journey/plan?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}`),

    // ── Round 2: Model Accuracy ──────────────────────────────────────────
    getModelAccuracy: () => fetcher('/api/model/accuracy'),
    getAccuracySummary: () => fetcher('/api/model/accuracy/summary'),
    getPredictedVsActual: (routeId, days = 14) => fetcher(`/api/model/predicted-vs-actual/${routeId}?days=${days}`),

    // ── Round 2: SDG Impact ──────────────────────────────────────────────
    getSdgImpact: () => fetcher('/api/sdg-impact'),

    // ── Round 2: RAPTOR Route Planning ───────────────────────────────────
    planRoute: (origin, dest, time_min = 480) =>
        fetcher(`/api/route/plan?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&time_min=${time_min}`),
    searchStops: (q) => fetcher(`/api/route/stops/search?q=${encodeURIComponent(q)}`),

    // ── Round 2: Demand Heatmap ──────────────────────────────────────────
    getDemandHeatmap: (hour = 8) => fetcher(`/api/demand/heatmap?hour=${hour}`),

    // ── Round 2: Time-of-Day Profiles ────────────────────────────────────
    getTimeofdayProfile: (routeId) => fetcher(`/api/demand/timeofday/${routeId}`),

    // ── Round 2: Multi-Objective Optimization ────────────────────────────
    getOptimizeTradeoffs: () => fetcher('/api/optimize/tradeoffs'),
    applyStrategy: (strategyId) => fetch(`${BASE}/api/optimize/apply/${strategyId}`, { method: 'POST' }).then(r => r.json()),

    // ── Round 3: Bus Bunching Detector ───────────────────────────────────
    getBunching: () => fetcher('/api/bunching'),

    // ── Round 3: Scenario Simulator ──────────────────────────────────────
    runScenario: (id) => fetcher(`/api/scenario/${id}`),

    // ── Round 3: Passenger Issue Reporter ────────────────────────────────
    getIssues: () => fetcher('/api/issues'),
    submitIssue: (data) => fetch(`${BASE}/api/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(r => r.json()),

    // ── Round 3: Revenue Loss Counter ────────────────────────────────────
    getRevenueLoss: () => fetcher('/api/revenue-loss'),

    // ── Round 3: Metro Feeder Desert Map ─────────────────────────────────
    getMetroFeeder: () => fetcher('/api/metro-feeder'),
};

export default api;
