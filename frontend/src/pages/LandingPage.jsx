import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { Users, Bus, Map, Banknote, Brain, Zap, CloudRain, Ticket, Search, Satellite, Github, Twitter, Mail } from 'lucide-react';

const stats = [
    { value: '2.5M', label: 'Daily Commuters', icon: <Users size={28} /> },
    { value: '2,100+', label: 'PMPML Buses', icon: <Bus size={28} /> },
    { value: '500+', label: 'Routes Covered', icon: <Map size={28} /> },
    { value: '₹0', label: 'Tool Cost', icon: <Banknote size={28} /> },
];

const features = [
    { icon: <Brain size={26} />, title: 'Demand Forecasting', desc: 'Facebook Prophet predicts passenger demand per route per 15-minute slot — up to 4 hours ahead.' },
    { icon: <Zap size={26} />, title: 'Fleet Optimization', desc: 'Google OR-Tools computes optimal bus frequency per route based on live demand signals.' },
    { icon: <CloudRain size={26} />, title: 'Rain-to-Bus Model', desc: 'Pune-specific: rain forecast shifts 2-wheeler commuters to buses — system pre-positions fleet.' },
    { icon: <Ticket size={26} />, title: 'Event-Aware AI', desc: 'Ganpati, IPL, college exams — model integrates Pune event calendar as input features.' },
    { icon: <Search size={26} />, title: 'Anomaly Detection', desc: 'IsolationForest flags routes deviating >30% from forecast for immediate operator review.' },
    { icon: <Map size={26} />, title: 'Multi-Modal Planner', desc: 'Bus + Metro + Yulu treated as one unified network for seamless journey planning.' },
];

const stack = ['FastAPI', 'Facebook Prophet', 'OR-Tools', 'React', 'Leaflet.js', 'Open-Meteo', 'SQLite', 'scikit-learn'];

function AnimatedNumber({ value }) {
    const match = value.match(/(₹)?([0-9.,]+)(M|\+)?/);
    if (!match) return <span>{value}</span>;
    
    const prefix = match[1] || '';
    const rawNumStr = match[2].replace(/,/g, '');
    const isFloat = rawNumStr.includes('.');
    const target = parseFloat(rawNumStr);
    const suffix = match[3] || '';
    
    const count = useMotionValue(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: false, margin: "-50px" });
    
    useEffect(() => {
        if (!inView) {
            count.set(0);
            return;
        }

        if (target === 0) {
            count.set(0);
            return;
        }
        
        let timeoutId;
        let isCancelled = false;
        
        const triggerNextIncrement = () => {
            if (isCancelled) return;
            const current = count.get();
            if (current >= target) return;

            // Random pause: 400ms to 1200ms
            const delay = Math.random() * 800 + 400; 
            timeoutId = setTimeout(() => {
                if (isCancelled) return;
                const remaining = target - count.get();
                
                // Jump by 10% to 25% of the total target
                let step = target * (Math.random() * 0.15 + 0.10);
                if (step > remaining || remaining < target * 0.08) {
                    step = remaining; // Snap to the end if close
                }
                
                const nextVal = count.get() + step;
                
                // Quickly slide to the new step (makes the "chunk" visible)
                animate(count, nextVal, { duration: 0.4, ease: "easeOut" }).then(() => {
                    triggerNextIncrement();
                });
            }, delay);
        };
        
        triggerNextIncrement();
        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);
        };
    }, [inView, target, count]);
    
    const formatted = useTransform(count, (latest) => {
        if (target === 0) return prefix + "0" + suffix;
        if (isFloat) {
            return prefix + latest.toFixed(1) + suffix;
        } else {
            return prefix + Math.floor(latest).toLocaleString() + suffix;
        }
    });
    
    return <motion.span ref={ref}>{formatted}</motion.span>;
}

export default function LandingPage() {
    const WORDS = ["Intelligent", "Smart", "Predictive", "Adaptive"];
    const [wordIdx, setWordIdx] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIdx((prev) => (prev + 1) % WORDS.length);
        }, 2200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            height: '100vh', overflowY: 'auto', overflowX: 'hidden',
            background: '#f0f4f9',
            fontFamily: 'Inter, sans-serif',
        }}>
            {/* Nav */}
            <nav style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 48px', height: 64,
                background: '#ffffff',
                borderBottom: '1px solid rgba(15,40,90,0.10)',
                position: 'sticky', top: 0, zIndex: 100,
                boxShadow: '0 2px 12px rgba(15,40,90,0.07)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                        fontSize: 20, fontFamily: 'Orbitron, sans-serif', fontWeight: 900,
                        color: '#1a6cf5', letterSpacing: '0.04em',
                    }}>TRANSIT-IQ</span>
                    <span style={{
                        fontSize: 10, color: '#1a6cf5', fontWeight: 700, letterSpacing: '0.12em',
                        padding: '3px 9px', background: '#e8f0fe',
                        border: '1px solid rgba(26,108,245,0.25)', borderRadius: 5,
                    }}>BlueBit 4.0 · PS4</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Link to="/operator"><button className="btn btn-ghost"><Satellite size={16} /> Operator</button></Link>
                    <Link to="/passenger"><button className="btn btn-primary"><Bus size={16} /> Passenger App</button></Link>
                </div>
            </nav>

            {/* Hero */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                background: 'linear-gradient(135deg, #1a6cf5 0%, #0f4bb0 60%, #6c3acb 100%)',
                padding: '80px 48px 72px', textAlign: 'center', color: '#fff',
            }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
                    padding: '6px 16px', background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.3)', borderRadius: 99,
                }}>
                    <span className="live-dot" style={{ background: '#6fffb8' }} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Live Demo — Pune Transit Intelligence</span>
                </div>

                <h1 style={{
                    fontSize: 'clamp(34px,5vw,64px)', fontWeight: 900, lineHeight: 1.1,
                    fontFamily: 'Orbitron, sans-serif', marginBottom: 24, letterSpacing: '0.01em',
                }}>
                    <span style={{ display: 'inline-block', position: 'relative', overflow: 'hidden' }}>
                        <AnimatePresence mode="popLayout">
                            <motion.span
                                key={WORDS[wordIdx]}
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -30, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                style={{ display: 'inline-block', color: '#6fffb8' }}
                            >
                                {WORDS[wordIdx]}
                            </motion.span>
                        </AnimatePresence>
                    </span> Brain<br />for Pune's Buses
                </h1>

                <p style={{
                    fontSize: 17, lineHeight: 1.75, maxWidth: 650, margin: '0 auto 40px',
                    color: 'rgba(255,255,255,0.85)'
                }}>
                    Every morning, <strong style={{ color: '#fff' }}>2.5 million Pune commuters</strong> don't
                    know if their bus is 5 minutes away or 45. Transit-IQ changes that — with ML demand
                    forecasting, OR-Tools fleet optimization, and real-time operator intelligence.
                </p>

                <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/operator">
                        <button style={{
                            padding: '14px 34px', fontSize: 15, fontWeight: 700,
                            background: '#fff', color: '#1a6cf5', borderRadius: 10,
                            border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                        ><Satellite size={16} /> Open Operator Dashboard</button>
                    </Link>
                    <Link to="/passenger">
                        <button style={{
                            padding: '14px 34px', fontSize: 15, fontWeight: 700,
                            background: 'rgba(255,255,255,0.18)', color: '#fff', borderRadius: 10,
                            border: '2px solid rgba(255,255,255,0.45)', cursor: 'pointer',
                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                        ><Bus size={16} /> Plan My Journey</button>
                    </Link>
                </div>
            </motion.section>

            {/* Stats */}
            <section style={{
                display: 'flex', justifyContent: 'center', gap: 20,
                padding: '52px 48px 40px', flexWrap: 'wrap', maxWidth: 900, margin: '0 auto',
            }}>
                {stats.map((s, i) => (
                    <motion.div key={s.label} className="metric-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        style={{ minWidth: 170, alignItems: 'center', textAlign: 'center', gap: 6, flex: 1 }}>
                        <span style={{ color: '#1a6cf5', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 38 }}>{s.icon}</span>
                        <span className="metric-value"><AnimatedNumber value={s.value} /></span>
                        <span className="metric-label">{s.label}</span>
                    </motion.div>
                ))}
            </section>

            {/* Features */}
            <section style={{ padding: '0 48px 60px', maxWidth: 1100, margin: '0 auto' }}>
                <h2 style={{
                    textAlign: 'center', fontSize: 26, fontWeight: 800,
                    color: '#0d1b3e', marginBottom: 32
                }}>What Makes Transit-IQ Different</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                    {features.map((f, i) => (
                        <motion.div key={f.title} className="metric-card" style={{ padding: '22px 20px', gap: 10 }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                        >
                            <span style={{ color: '#1a6cf5', display: 'flex', alignContent: 'center', height: 32 }}>{f.icon}</span>
                            <strong style={{ fontSize: 14, color: '#1a6cf5' }}>{f.title}</strong>
                            <span style={{ fontSize: 13, color: '#4a5f80', lineHeight: 1.65 }}>{f.desc}</span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Professional Modern Footer */}
            <footer style={{
                background: '#0a101f', // Deep dark blue for professional look
                color: '#fff',
                padding: '60px 48px 30px',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between', marginBottom: 40 }}>
                    {/* Brand Col */}
                    <div style={{ flex: '1 1 300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#1a6cf5,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Satellite size={18} color="#fff" />
                            </div>
                            <span style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Orbitron, sans-serif' }}>Transit-IQ</span>
                        </div>
                        <p style={{ color: '#9aafc4', fontSize: 13, lineHeight: 1.6, maxWidth: 320 }}>
                            Intelligent transit operations using advanced machine learning and operational research to improve commute reliability for 2.5 million daily riders.
                        </p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                            <a href="https://github.com/Ayush-Jayatkar/Transit-IQ.git" style={{ color: '#9aafc4', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#9aafc4'}><Github size={20} /></a>
                            <a href="#" style={{ color: '#9aafc4', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#9aafc4'}><Twitter size={20} /></a>
                            <a href="#" style={{ color: '#9aafc4', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#9aafc4'}><Mail size={20} /></a>
                        </div>
                    </div>


                    {/* Platform Col */}
                    <div style={{ flex: '1 1 150px' }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, color: '#fff' }}>Platform</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {['Operator Dashboard', 'Passenger App'].map(l => (
                                <Link key={l} to={l.includes('Operator') ? '/operator' : '/passenger'} style={{ color: '#b3c4d9', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s', width: 'fit-content' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#b3c4d9'}>
                                    {l}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Developers Col */}
                    <div style={{ flex: '1 1 150px' }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, color: '#fff' }}>Developers</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <Link to="/api-docs" style={{ color: '#b3c4d9', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s', width: 'fit-content' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#b3c4d9'}>
                                API Documentation
                            </Link>
                            <a href="https://github.com/Ayush-Jayatkar/Transit-IQ.git" target="_blank" rel="noopener noreferrer" style={{ color: '#b3c4d9', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s', width: 'fit-content' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#b3c4d9'}>
                                Git-Hub Repo
                            </a>
                            
                        </div>
                    </div>
                </div>

                <div style={{ 
                    maxWidth: 1100, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
                    alignItems: 'center', gap: 16
                }}>
                    <div style={{ fontSize: 12, color: '#68809e' }}>
                        © {new Date().getFullYear()} Transit-IQ. All rights reserved.
                    </div>
                    <div style={{ fontSize: 12, color: '#68809e', display: 'flex', gap: 16 }}>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
