import React, { useState } from 'react'
import VerificationProof from './VerificationProof'
import './UrlScanner.css'

export default function UrlScanner() {
    const [url, setUrl] = useState('')
    const [scanning, setScanning] = useState(false)
    const [results, setResults] = useState([])
    const [progress, setProgress] = useState(0)

    const handleScan = async (e) => {
        e.preventDefault()
        if (!url) return

        setScanning(true)
        setProgress(0)

        const interval = setInterval(() => {
            setProgress(prev => Math.min(prev + 3, 90))
        }, 50)

        try {
            const ai = await import('../utils/aiEngine')
            const result = await ai.analyzeUrl(url)

            clearInterval(interval)
            setProgress(100)
            setScanning(false)
            setResults([result, ...results].slice(0, 5))
            setUrl('')
        } catch (err) {
            console.error(err)
            clearInterval(interval)
            setScanning(false)
        }
    }

    return (
        <section className="url-scanner section" id="url-scanner">
            <div className="container">
                <div className="section-header">
                    <div className="badge" style={{ marginBottom: '16px' }}>
                        <span>🔗</span> URL Scanner
                    </div>
                    <h2>Scan <span className="gradient-text">Any URL</span></h2>
                    <p style={{ margin: '0 auto' }}>Paste a social media URL and our AI will extract and analyze the embedded media for manipulation artifacts.</p>
                </div>

                <div className="url-scanner__main">
                    <form className="url-scanner__input-row" onSubmit={handleScan}>
                        <div className="url-scanner__input-wrapper">
                            <span className="url-scanner__input-icon">🌐</span>
                            <input
                                type="text"
                                placeholder="Paste any URL with media content..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="url-scanner__input"
                                disabled={scanning}
                            />
                        </div>
                        <button type="submit" className="btn btn-glow" disabled={scanning}>
                            {scanning ? 'Scanning...' : 'Scan URL'}
                        </button>
                    </form>

                    {scanning && (
                        <div className="url-scanner__progress">
                            <div className="url-scanner__progress-bar">
                                <div className="url-scanner__progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="url-scanner__progress-steps">
                                <span className={progress > 10 ? 'active' : ''}>Fetching media</span>
                                <span className={progress > 35 ? 'active' : ''}>Extracting frames</span>
                                <span className={progress > 60 ? 'active' : ''}>Running AI models</span>
                                <span className={progress > 85 ? 'active' : ''}>Finalizing cryptographic proof</span>
                            </div>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="url-scanner__results">
                            <h4>Recent Scans</h4>
                            <div className="url-scanner__results-list">
                                {results.map((r, i) => (
                                    <div key={i} className={`url-scanner__result-item url-scanner__result-item--${r.verdict}`}>
                                        <div className="url-scanner__result-left">
                                            <span className="url-scanner__result-url">{r.url}</span>
                                            <span className="url-scanner__result-type">{r.type}</span>
                                            <div className="url-scanner__result-hash">
                                                <span>REF: {Math.random().toString(36).substring(2, 10).toUpperCase()}-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <div className="url-scanner__result-right">
                                            <span className={`url-scanner__result-badge url-scanner__result-badge--${r.verdict}`}>
                                                {r.verdict === 'suspicious' ? `${r.score}% Suspicious` : `${100 - r.score}% Authentic`}
                                            </span>
                                            <span className="url-scanner__result-time">{r.timestamp}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.length === 0 && !scanning && (
                        <div className="url-scanner__empty">
                            <p>Paste a URL above to start analyzing. Results from your scans will appear here.</p>
                        </div>
                    )}
                </div>

                <VerificationProof
                    active={results.length > 0}
                    score={results.length > 0 ? (results[0].verdict === 'suspicious' ? results[0].score : 100 - results[0].score) : 0}
                    isManipulated={results.length > 0 && results[0].verdict === 'suspicious'}
                    inputType="URL Extraction"
                    detectorName="URL Scanner"
                    analyzing={scanning}
                    prefix="us"
                />
            </div>
        </section>
    )
}
