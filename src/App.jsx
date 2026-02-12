import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import UploadAnalysis from './components/UploadAnalysis'
import UrlScanner from './components/UrlScanner'
import LiveDemo from './components/LiveDemo'
import Stats from './components/Stats'
import Team from './components/Team'
import Footer from './components/Footer'

export default function App() {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible')
                    }
                })
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        )

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    return (
        <>
            <Navbar />
            <Hero />
            <Features />
            <HowItWorks />
            <UploadAnalysis />
            <UrlScanner />
            <LiveDemo />
            <Stats />
            <Team />
            <Footer />
        </>
    )
}
