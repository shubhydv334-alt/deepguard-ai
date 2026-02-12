import React, { useState } from 'react'
import './Testimonials.css'

const TESTIMONIALS = [
    {
        quote: "DeepGuard AI caught a sophisticated deepfake video that had bypassed three other detection tools. It's become essential to our fact-checking workflow.",
        name: 'Sarah Chen',
        role: 'Chief Editor, Reuters Digital',
        avatar: 'SC',
        color: '#06d6a0',
    },
    {
        quote: "The real-time API integration was seamless. We now scan every uploaded video automatically, preventing misinformation before it spreads on our platform.",
        name: 'Marcus Williams',
        role: 'CTO, SocialGuard Inc.',
        avatar: 'MW',
        color: '#4fc3f7',
    },
    {
        quote: "The blockchain certification feature gives our legal team the evidence chain they need. Manipulated media is flagged with forensic-grade analysis.",
        name: 'Dr. Priya Patel',
        role: 'Director of Cyber Forensics, Interpol',
        avatar: 'PP',
        color: '#e040fb',
    },
    {
        quote: "We integrated DeepGuard into our election monitoring system. It detected 94% more manipulated content than our previous solution.",
        name: 'James Morrison',
        role: 'VP Engineering, ElectionWatch',
        avatar: 'JM',
        color: '#ff9100',
    },
]

export default function Testimonials() {
    const [activeIndex, setActiveIndex] = useState(0)

    return (
        <section className="section testimonials" id="testimonials">
            <div className="container">
                <div className="section-header">
                    <div className="badge" style={{ marginBottom: 16 }}>
                        <span>💬</span> Testimonials
                    </div>
                    <h2>
                        Trusted by <span className="gradient-text">Industry Leaders</span>
                    </h2>
                    <p>
                        See how organizations worldwide rely on DeepGuard AI to protect
                        against deepfakes and digital manipulation.
                    </p>
                </div>

                <div className="testimonials__carousel">
                    <div className="testimonials__cards">
                        {TESTIMONIALS.map((t, i) => (
                            <div
                                className={`testimonials__card glass-card ${i === activeIndex ? 'testimonials__card--active' : ''}`}
                                key={i}
                                onClick={() => setActiveIndex(i)}
                            >
                                <div className="testimonials__quote">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(6,214,160,0.2)">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
                                    </svg>
                                    <p>{t.quote}</p>
                                </div>
                                <div className="testimonials__author">
                                    <div className="testimonials__avatar" style={{ background: t.color + '20', color: t.color, borderColor: t.color + '40' }}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div className="testimonials__name">{t.name}</div>
                                        <div className="testimonials__role">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="testimonials__dots">
                        {TESTIMONIALS.map((_, i) => (
                            <button
                                key={i}
                                className={`testimonials__dot ${i === activeIndex ? 'testimonials__dot--active' : ''}`}
                                onClick={() => setActiveIndex(i)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
