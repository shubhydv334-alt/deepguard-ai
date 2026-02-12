import React from 'react'
import './HowItWorks.css'

const STEPS = [
    {
        num: '01',
        title: 'Upload Media',
        desc: 'Drag & drop any video or image file — or paste a URL and we extract the media for you.',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
        ),
    },
    {
        num: '02',
        title: 'Multi-Layer Analysis',
        desc: 'Our pipeline runs facial, audio-visual, pixel-level, and metadata checks simultaneously.',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
            </svg>
        ),
    },
    {
        num: '03',
        title: 'Visual Results',
        desc: 'Get per-factor confidence scores, verdict badges, and heatmaps highlighting suspicious regions.',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        ),
    },
    {
        num: '04',
        title: 'Take Action',
        desc: 'Flag content, share analysis results, or export the full report for further review.',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
            </svg>
        ),
    },
]

export default function HowItWorks() {
    return (
        <section className="section how-it-works" id="how-it-works">
            <div className="container">
                <div className="section-header">
                    <div className="badge" style={{ marginBottom: 16 }}>
                        <span>⚡</span> Simple Workflow
                    </div>
                    <h2>
                        How <span className="gradient-text">It Works</span>
                    </h2>
                    <p>
                        From upload to verdict in four steps — try it yourself in the sections below.
                    </p>
                </div>

                <div className="hiw__timeline">
                    <div className="hiw__line"></div>
                    {STEPS.map((step, i) => (
                        <div className="hiw__step reveal" key={i}>
                            <div className="hiw__step-number">
                                <span>{step.num}</span>
                            </div>
                            <div className="hiw__step-content glass-card">
                                <div className="hiw__step-icon">{step.icon}</div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
