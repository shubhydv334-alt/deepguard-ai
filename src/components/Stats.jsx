import React, { useState, useEffect, useRef } from 'react'
import './Stats.css'

function AnimatedNum({ end, suffix = '', prefix = '', duration = 2000 }) {
    const [value, setValue] = useState(0)
    const ref = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    const start = Date.now()
                    const animate = () => {
                        const elapsed = Date.now() - start
                        const progress = Math.min(elapsed / duration, 1)
                        const eased = 1 - Math.pow(1 - progress, 3)
                        setValue(Math.floor(eased * end))
                        if (progress < 1) requestAnimationFrame(animate)
                    }
                    animate()
                    observer.disconnect()
                }
            },
            { threshold: 0.3 }
        )
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [end, duration])

    return <span ref={ref}>{prefix}{value}{suffix}</span>
}

export default function Stats() {
    return (
        <section className="section stats" id="stats">
            <div className="container">
                <div className="section-header">
                    <div className="badge" style={{ marginBottom: 16 }}>
                        <span>📊</span> The Problem
                    </div>
                    <h2>Why This <span className="gradient-text">Matters</span></h2>
                    <p style={{ margin: '0 auto' }}>Deepfakes are a growing crisis. These are the real numbers driving our mission.</p>
                </div>

                {/* Real-world stats with sources */}
                <div className="stats__problem-grid">
                    <div className="stats__problem-card stats__problem-card--highlight">
                        <span className="stats__problem-num"><AnimatedNum end={550} suffix="%" /></span>
                        <span className="stats__problem-label">Growth in deepfake content online (2019–2023)</span>
                        <span className="stats__problem-source">— World Economic Forum, 2024</span>
                    </div>
                    <div className="stats__problem-card">
                        <span className="stats__problem-num"><AnimatedNum end={26} prefix="$" suffix="B" /></span>
                        <span className="stats__problem-label">Projected synthetic identity fraud losses by 2027</span>
                        <span className="stats__problem-source">— Deloitte Center for Financial Services</span>
                    </div>
                    <div className="stats__problem-card">
                        <span className="stats__problem-num"><AnimatedNum end={71} suffix="%" /></span>
                        <span className="stats__problem-label">Of people globally don't know what deepfakes are</span>
                        <span className="stats__problem-source">— iProov Threat Intelligence Report</span>
                    </div>
                </div>

                {/* Use Cases — shows product thinking */}
                <div className="stats__capabilities">
                    <h3 className="stats__cap-title">Real-World <span className="gradient-text">Use Cases</span></h3>
                    <div className="stats__cap-grid">
                        {[
                            { icon: '📰', title: 'Journalism & News', desc: 'Verify user-submitted footage before publishing — prevent viral misinformation at scale' },
                            { icon: '🏛️', title: 'Legal & Evidence', desc: 'Authenticate digital evidence in court proceedings — detect tampered video exhibits' },
                            { icon: '🏢', title: 'Corporate Security', desc: 'Protect against CEO deepfake voice scams and synthetic video impersonation attacks' },
                            { icon: '📱', title: 'Social Platforms', desc: 'Content moderation pipeline integration — flag synthetic media before it spreads' },
                            { icon: '🎓', title: 'Education', desc: 'Teaching media literacy — show students how deepfakes work and how to spot them' },
                            { icon: '🔐', title: 'Identity Verification', desc: 'Liveness detection for KYC flows — ensure a real human is behind the camera' },
                        ].map((cap, i) => (
                            <div key={i} className="stats__cap-card">
                                <span className="stats__cap-icon">{cap.icon}</span>
                                <div>
                                    <h4>{cap.title}</h4>
                                    <p>{cap.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
