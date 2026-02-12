import React, { useEffect, useRef } from 'react'
import './Features.css'

const FEATURES = [
    {
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 10h.01M15 10h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            </svg>
        ),
        title: 'Facial Movement Analysis',
        description: 'Analyzes micro-expressions, lip-sync patterns, and facial geometry for inconsistencies commonly found in face-swapped or generated content.',
        color: 'cyan',
    },
    {
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
        ),
        title: 'Audio-Visual Sync',
        description: 'Checks temporal alignment between audio waveforms and visual lip movements to detect dubbed or synthetically generated speech.',
        color: 'blue',
    },
    {
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <rect x="7" y="7" width="3" height="3" />
                <rect x="14" y="7" width="3" height="3" />
                <rect x="7" y="14" width="3" height="3" />
                <rect x="14" y="14" width="3" height="3" />
            </svg>
        ),
        title: 'Pixel-Level Forensics',
        description: 'Examines compression artifacts, noise patterns, and spectral inconsistencies to identify spliced or manipulated regions in media.',
        color: 'magenta',
    },
    {
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
        title: 'Real-Time Processing',
        description: 'Designed for live video stream analysis through browser-based webcam access, enabling on-the-fly face authenticity checks.',
        color: 'cyan',
    },
    {
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
        ),
        title: 'URL Media Extraction',
        description: 'Paste any social media URL and we automatically extract embedded media for analysis — no manual downloading required.',
        color: 'blue',
    },
    {
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
        title: 'Detailed Reports',
        description: 'Get per-factor confidence breakdowns with visual heatmaps showing exactly which regions triggered manipulation alerts.',
        color: 'magenta',
    },
]

export default function Features() {
    const sectionRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add('visible')
                })
            },
            { threshold: 0.1 }
        )

        const cards = sectionRef.current?.querySelectorAll('.feature-card')
        cards?.forEach((card) => observer.observe(card))

        return () => observer.disconnect()
    }, [])

    return (
        <section className="section features" id="features" ref={sectionRef}>
            <div className="container">
                <div className="section-header">
                    <div className="badge" style={{ marginBottom: 16 }}>
                        <span>✦</span> Core Capabilities
                    </div>
                    <h2>
                        What DeepGuard <span className="gradient-text">Does</span>
                    </h2>
                    <p>
                        Six analysis techniques working together to verify media authenticity
                        — each one you can try right here in the demo.
                    </p>
                </div>

                <div className="features__grid">
                    {FEATURES.map((feature, i) => (
                        <div
                            className={`feature-card reveal feature-card--${feature.color}`}
                            key={i}
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className={`feature-card__icon feature-card__icon--${feature.color}`}>
                                {feature.icon}
                            </div>
                            <h3 className="feature-card__title">{feature.title}</h3>
                            <p className="feature-card__desc">{feature.description}</p>
                            <div className="feature-card__shine"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
