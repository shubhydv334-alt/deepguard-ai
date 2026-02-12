import React, { useState, useEffect } from 'react'
import './ThreatFeed.css'

const THREAT_DATA = [
    { id: 1, platform: 'Twitter/X', type: 'Face Swap', severity: 'high', desc: 'Political deepfake video gaining traction — 12K shares in 2 hours', time: '3 min ago', region: '🇺🇸 US' },
    { id: 2, platform: 'TikTok', type: 'Voice Clone', severity: 'medium', desc: 'AI-generated audio imitating a public figure endorsing a product', time: '17 min ago', region: '🇬🇧 UK' },
    { id: 3, platform: 'YouTube', type: 'Lip Sync', severity: 'high', desc: 'Manipulated news anchor video spreading misinformation', time: '28 min ago', region: '🇮🇳 IN' },
    { id: 4, platform: 'Facebook', type: 'Full Synthetic', severity: 'critical', desc: 'Completely AI-generated person used in scam profile networks', time: '41 min ago', region: '🇧🇷 BR' },
    { id: 5, platform: 'Telegram', type: 'Face Swap', severity: 'medium', desc: 'Celebrity face-swap content being shared in closed groups', time: '1 hr ago', region: '🇷🇺 RU' },
    { id: 6, platform: 'Instagram', type: 'Image Edit', severity: 'low', desc: 'AI-enhanced photo with subtle facial modifications detected', time: '2 hr ago', region: '🇫🇷 FR' },
]

export default function ThreatFeed() {
    const [threats, setThreats] = useState(THREAT_DATA)
    const [filter, setFilter] = useState('all')
    const [liveCount, setLiveCount] = useState(1247)

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveCount(prev => prev + Math.floor(Math.random() * 3))
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const filtered = filter === 'all' ? threats : threats.filter(t => t.severity === filter)

    return (
        <section className="threat-feed section" id="threat-feed">
            <div className="container">
                <div className="section-header">
                    <div className="badge" style={{ marginBottom: '16px' }}>
                        <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>🔴</span> Live Feed
                    </div>
                    <h2>Real-Time <span className="gradient-text">Threat Feed</span></h2>
                    <p style={{ margin: '0 auto' }}>Monitor deepfake threats as they emerge across social platforms. AI-powered detection catches manipulation before it goes viral.</p>
                </div>

                <div className="threat-feed__main">
                    <div className="threat-feed__toolbar">
                        <div className="threat-feed__live-counter">
                            <span className="threat-feed__live-dot"></span>
                            <span className="threat-feed__live-text">{liveCount.toLocaleString()} threats detected today</span>
                        </div>
                        <div className="threat-feed__filters">
                            {['all', 'critical', 'high', 'medium', 'low'].map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className={`threat-feed__filter ${filter === f ? 'threat-feed__filter--active' : ''}`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="threat-feed__list">
                        {filtered.map(threat => (
                            <div key={threat.id} className={`threat-feed__item threat-feed__item--${threat.severity}`}>
                                <div className="threat-feed__item-header">
                                    <div className="threat-feed__item-tags">
                                        <span className={`threat-feed__severity threat-feed__severity--${threat.severity}`}>
                                            {threat.severity}
                                        </span>
                                        <span className="threat-feed__platform">{threat.platform}</span>
                                        <span className="threat-feed__type">{threat.type}</span>
                                    </div>
                                    <div className="threat-feed__item-meta">
                                        <span className="threat-feed__region">{threat.region}</span>
                                        <span className="threat-feed__time">{threat.time}</span>
                                    </div>
                                </div>
                                <p className="threat-feed__desc">{threat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
