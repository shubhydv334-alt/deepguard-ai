import React, { useState, useEffect } from 'react'
import ParticleCanvas from './ParticleCanvas'
import './Hero.css'

const TYPED_TEXTS = [
    'Deepfakes',
    'Voice Clones',
    'Synthetic Faces',
    'AI Manipulation',
    'Forged Media',
]

export default function Hero() {
    const [textIndex, setTextIndex] = useState(0)
    const [charIndex, setCharIndex] = useState(0)
    const [isDeleting, setIsDeleting] = useState(false)
    const [displayText, setDisplayText] = useState('')
    const [scanProgress, setScanProgress] = useState(0)

    useEffect(() => {
        const currentWord = TYPED_TEXTS[textIndex]
        let timeout

        if (!isDeleting && charIndex <= currentWord.length) {
            timeout = setTimeout(() => {
                setDisplayText(currentWord.slice(0, charIndex))
                setCharIndex(charIndex + 1)
            }, 80)
        } else if (!isDeleting && charIndex > currentWord.length) {
            timeout = setTimeout(() => setIsDeleting(true), 1800)
        } else if (isDeleting && charIndex > 0) {
            timeout = setTimeout(() => {
                setCharIndex(charIndex - 1)
                setDisplayText(currentWord.slice(0, charIndex - 1))
            }, 40)
        } else if (isDeleting && charIndex === 0) {
            setIsDeleting(false)
            setTextIndex((textIndex + 1) % TYPED_TEXTS.length)
        }

        return () => clearTimeout(timeout)
    }, [charIndex, isDeleting, textIndex])

    // Animated scan progress
    useEffect(() => {
        const interval = setInterval(() => {
            setScanProgress(prev => (prev >= 100 ? 0 : prev + 0.5))
        }, 50)
        return () => clearInterval(interval)
    }, [])

    const threatLevel = scanProgress > 65 ? 'MANIPULATED' : scanProgress > 30 ? 'ANALYZING...' : 'SCANNING...'
    const threatColor = scanProgress > 65 ? '#ff6b6b' : scanProgress > 30 ? '#fbbf24' : 'var(--accent)'

    return (
        <section className="hero" id="hero">
            <ParticleCanvas />

            {/* Background visual effects */}
            <div className="hero__glow hero__glow--1"></div>
            <div className="hero__glow hero__glow--2"></div>

            <div className="hero__content container">
                <div className="hero__left">


                    <h1 className="hero__title">
                        <span className="hero__title-line">Detect</span>
                        <span className="hero__title-line">&amp; Expose</span>
                        <span className="hero__title-line hero__accent">{displayText}<span className="hero__cursor">_</span></span>
                    </h1>

                    <p className="hero__subtitle">
                        AI-powered deepfake detection analyzing facial movements,
                        audio sync, and pixel forensics — protecting truth in real-time.
                    </p>

                    <div className="hero__actions">
                        <a href="#analyze" className="btn btn-glow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                            Start Scanning
                        </a>
                        <a href="#live-demo" className="btn hero__play-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                            Play Demo
                        </a>
                    </div>

                    {/* Tech stack badges — only what's actually used */}

                </div>

                <div className="hero__right">
                    <div className="hero__preview-card">
                        <div className="hero__preview-header">
                            <div className="hero__preview-dots">
                                <span></span><span></span><span></span>
                            </div>
                            <span className="hero__preview-title">deepguard —analysis</span>
                            <span className="hero__preview-live" style={{ color: threatColor }}>● LIVE</span>
                        </div>

                        <div className="hero__preview-media">
                            <div className="hero__preview-face">
                                <div className="hero__preview-face-box" style={{ borderColor: threatColor }}></div>
                                <div className="hero__preview-scan-line" style={{ top: `${scanProgress}%` }}></div>
                                {/* Corner target markers */}
                                <div className="hero__preview-corner hero__preview-corner--tl"></div>
                                <div className="hero__preview-corner hero__preview-corner--tr"></div>
                                <div className="hero__preview-corner hero__preview-corner--bl"></div>
                                <div className="hero__preview-corner hero__preview-corner--br"></div>
                            </div>
                            <div className="hero__preview-grid-lines"></div>
                            {/* Status text on media */}
                            <div className="hero__preview-status-text" style={{ color: threatColor }}>
                                {threatLevel}
                            </div>
                        </div>

                        <div className="hero__preview-results">
                            <div className="hero__preview-score-row">
                                <span>Confidence</span>
                                <span style={{ color: threatColor, fontWeight: 700 }}>{scanProgress > 65 ? '87.4%' : `${Math.min(scanProgress * 1.5, 100).toFixed(0)}%`}</span>
                            </div>
                            <div className="hero__preview-bar">
                                <div className="hero__preview-bar-fill" style={{ width: `${Math.min(scanProgress * 1.5, 100)}%`, background: threatColor }}></div>
                            </div>

                            <div className="hero__preview-checks">
                                <div className={`hero__preview-check ${scanProgress > 15 ? 'done' : ''}`}>
                                    <span>✓</span> Face mesh analysis
                                </div>
                                <div className={`hero__preview-check ${scanProgress > 35 ? 'done' : ''}`}>
                                    <span>✓</span> Audio-visual sync
                                </div>
                                <div className={`hero__preview-check ${scanProgress > 55 ? 'done' : ''}`}>
                                    <span>✓</span> Pixel forensics
                                </div>
                                <div className={`hero__preview-check ${scanProgress > 75 ? 'done' : ''}`}>
                                    <span>✓</span> GAN artifact scan
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hero__scroll-indicator">
                <span>Scroll</span>
                <div className="hero__scroll-line"></div>
            </div>
        </section>
    )
}
