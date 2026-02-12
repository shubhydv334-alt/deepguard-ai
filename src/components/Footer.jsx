import React from 'react'
import './Footer.css'

export default function Footer() {
    return (
        <footer className="footer" id="footer">
            <div className="footer__gradient-line"></div>
            <div className="container">
                <div className="footer__top">
                    <div className="footer__brand">
                        <div className="footer__logo">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#c5f82a" />
                            </svg>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase' }}>
                                DeepGuard
                            </span>
                        </div>
                        <p className="footer__tagline">
                            AI-powered deepfake detection prototype — analyzing facial movements,
                            audio sync, and pixel forensics.
                        </p>
                    </div>

                    <div className="footer__links-group">
                        <h4>Explore</h4>
                        <a href="#features">Features</a>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#analyze">Analyze Media</a>
                        <a href="#url-scanner">URL Scanner</a>
                        <a href="#live-demo">Live Demo</a>
                    </div>

                    <div className="footer__newsletter">
                        <h4>Built With</h4>
                        <p>React + Vite • WebRTC • Canvas API</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                            Multi-modal analysis pipeline prototype for media authenticity verification.
                        </p>
                    </div>
                </div>

                <div className="footer__bottom-banner">
                    <div className="footer__bottom-logo">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#c5f82a" />
                        </svg>
                        DeepGuard AI
                    </div>
                    <div className="footer__bottom-links-wrap">
                        <a href="#hero" className="footer__bottom-link">
                            Back to Top ↗
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
