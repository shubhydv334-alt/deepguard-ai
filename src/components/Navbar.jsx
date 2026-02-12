import React, { useState, useEffect } from 'react'
import './Navbar.css'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Analyze', href: '#analyze' },
        { label: 'Live Demo', href: '#live-demo' },
        { label: 'Stats', href: '#stats' },
    ]

    return (
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
            <div className="navbar__inner container">
                <a href="#" className="navbar__logo">
                    <div className="navbar__logo-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#c5f82a" />
                        </svg>
                    </div>
                    <span>DeepGuard</span>
                </a>

                <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
                    {navLinks.map(link => (
                        <a key={link.label} href={link.href} className="navbar__link" onClick={() => setMobileOpen(false)}>
                            {link.label}
                        </a>
                    ))}
                </div>


                <button className={`navbar__hamburger ${mobileOpen ? 'navbar__hamburger--open' : ''}`}
                    onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </nav>
    )
}
