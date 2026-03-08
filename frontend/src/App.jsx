import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Satellite, Bus } from 'lucide-react';
import LandingPage from './pages/LandingPage.jsx';
import OperatorDashboard from './pages/OperatorDashboard.jsx';
import PassengerApp from './pages/PassengerApp.jsx';
import ApiDocs from './pages/ApiDocs.jsx';

export default function App() {
  const loc = useLocation();

  if (loc.pathname === '/operator' || loc.pathname === '/passenger') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f4f9' }}>
        {/* Top Nav */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', height: 54, flexShrink: 0,
          background: '#ffffff',
          borderBottom: '1px solid rgba(15,40,90,0.10)',
          boxShadow: '0 2px 8px rgba(15,40,90,0.07)',
          zIndex: 9999,
        }}>
          {/* Brand */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 17, fontFamily: 'Orbitron,sans-serif', fontWeight: 900,
              color: '#1a6cf5', letterSpacing: '0.04em',
            }}>TRANSIT-IQ</span>
            <span style={{
              fontSize: 9, color: '#1a6cf5', fontWeight: 700, letterSpacing: '0.12em',
              padding: '2px 7px', background: '#e8f0fe',
              borderRadius: 4, border: '1px solid rgba(26,108,245,0.22)',
            }}>PMPML PUNE</span>
          </Link>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', gap: 3,
            background: '#f0f4f9', padding: 4, borderRadius: 12,
            border: '1px solid rgba(15,40,90,0.10)',
          }}>
            {[
              { label: 'Operator', path: '/operator', icon: <Satellite size={16} /> },
              { label: 'Passenger', path: '/passenger', icon: <Bus size={16} /> }
            ].map(({ label, path, icon }) => (
              <Link key={path} to={path} style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '7px 20px', borderRadius: 8,
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600,
                  background: loc.pathname === path ? '#ffffff' : 'transparent',
                  color: loc.pathname === path ? '#1a6cf5' : '#4a5f80',
                  boxShadow: loc.pathname === path ? '0 1px 6px rgba(15,40,90,0.10)' : 'none',
                  transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 6
                }}>
                  {icon} {label}
                </button>
              </Link>
            ))}
          </div>

          {/* Status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="live-dot" />
            <span style={{ fontSize: 11, color: '#00a86b', fontWeight: 700 }}>LIVE</span>
            <span style={{ width: 1, height: 16, background: 'rgba(15,40,90,0.12)', margin: '0 4px' }} />
            <span style={{ fontSize: 11, color: '#4a5f80', fontFamily: 'JetBrains Mono,monospace' }}>
              {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </nav>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Routes>
            <Route path="/operator" element={<OperatorDashboard />} />
            <Route path="/passenger" element={<PassengerApp />} />
          </Routes>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/operator" element={<OperatorDashboard />} />
      <Route path="/passenger" element={<PassengerApp />} />
      <Route path="/api-docs" element={<ApiDocs />} />
    </Routes>
  );
}
