import React, { useState, useMemo } from 'react'
import './VerificationProof.css'

/**
 * Generate a fake SHA-256-style hash for demo purposes.
 */
function generateHash(seed = '') {
    const chars = '0123456789abcdef'
    let hash = ''
    for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)]
    }
    return hash
}

/**
 * Shared Verification Proof panel used across all detectors.
 *
 * Props:
 *   - active: boolean — is the detector currently active/has results
 *   - score: number — the authenticity/scan score (0-100)
 *   - isManipulated: boolean — true if the result indicates manipulation
 *   - inputType: string — e.g. "File Upload", "URL Extraction", "Camera Stream"
 *   - detectorName: string — e.g. "Upload Analysis", "URL Scanner", "Live Demo"
 *   - analyzing: boolean — is the detector currently processing
 *   - prefix: string — prefix for session ID like "uf", "us", "ld"
 */
export default function VerificationProof({
    active,
    score,
    isManipulated,
    inputType,
    detectorName,
    analyzing,
    prefix = 'dg',
}) {
    const [copied, setCopied] = useState(false)
    const hash = useMemo(() => (active ? generateHash() : null), [active])
    const timestamp = useMemo(() => (active ? new Date().toISOString() : null), [active])
    const sessionId = useMemo(() => `${prefix}-${Math.random().toString(36).substring(2, 10)}`, [prefix, active])
    const confidenceMargin = useMemo(() => (1.5 + Math.random() * 2.5).toFixed(1), [active])

    const scoreColor = active
        ? (isManipulated ? 'var(--accent-coral)' : 'var(--accent)')
        : 'var(--accent)'

    const verdict = active
        ? (isManipulated ? 'MANIPULATED' : 'AUTHENTIC')
        : null

    const handleCopyProof = () => {
        const proof = [
            `═══════════════════════════════════════════`,
            `  DeepGuard AI — Verification Certificate  `,
            `═══════════════════════════════════════════`,
            ``,
            `Detector:      ${detectorName}`,
            `Verdict:       ${verdict || 'N/A'}`,
            `Score:         ${active ? score.toFixed(1) : '--.-'}% (±${confidenceMargin}%)`,
            `Input Source:  ${active ? inputType : 'None'}`,
            `Timestamp:     ${timestamp || 'N/A'}`,
            `Session ID:    ${sessionId}`,
            ``,
            `Verification Hash (SHA-256):`,
            `${hash || 'N/A'}`,
            ``,
            `═══════════════════════════════════════════`,
            `This is a prototype verification certificate.`,
            `Generated client-side for demonstration.`,
        ].join('\n')

        navigator.clipboard.writeText(proof).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    return (
        <div className="vp">
            {/* Score + Verdict Card */}
            <div className="vp__score-card glass-card">
                <div className="vp__header">
                    <span className="vp__label">Authenticity Score</span>
                    <span className={`vp__status ${analyzing ? 'vp__status--analyzing' : active ? 'vp__status--active' : ''}`}>
                        {analyzing ? '● ANALYZING' : active ? '● VERIFIED' : '○ IDLE'}
                    </span>
                </div>

                <div className="vp__score" style={{ color: scoreColor }}>
                    {active ? score.toFixed(1) : analyzing ? '...' : '--.-'}<span className="vp__score-pct">%</span>
                </div>

                {active && (
                    <div className="vp__confidence">
                        Confidence Range: <strong style={{ color: scoreColor }}>{(score - parseFloat(confidenceMargin)).toFixed(1)}% – {(score + parseFloat(confidenceMargin)).toFixed(1)}%</strong>
                    </div>
                )}

                <div className="vp__bar-bg">
                    <div
                        className="vp__bar-fill"
                        style={{
                            width: active ? `${score}%` : analyzing ? '60%' : '0%',
                            background: scoreColor,
                        }}
                    ></div>
                </div>

                {active && verdict && (
                    <div className={`vp__verdict ${isManipulated ? 'vp__verdict--fake' : 'vp__verdict--real'}`}>
                        <span className="vp__verdict-icon">{isManipulated ? '⚠' : '✓'}</span>
                        {isManipulated ? 'Likely Manipulated' : 'Likely Authentic'}
                    </div>
                )}
            </div>

            {/* Session Metrics + Verification Hash Card */}
            <div className="vp__proof-card glass-card">
                <h4>Verification Proof</h4>

                <div className="vp__metric">
                    <span>Input Source</span>
                    <span className="vp__metric-val">{active || analyzing ? inputType : 'None'}</span>
                </div>
                <div className="vp__metric">
                    <span>Detection State</span>
                    <span className="vp__metric-val">{analyzing ? 'Processing' : active ? 'Complete' : 'Idle'}</span>
                </div>
                <div className="vp__metric">
                    <span>Analysis Mode</span>
                    <span className="vp__metric-val" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>Multi-Layer AI</span>
                </div>
                <div className="vp__metric">
                    <span>Timestamp</span>
                    <span className="vp__metric-val vp__metric-val--mono" style={{ opacity: active ? 1 : 0.4 }}>
                        {timestamp ? new Date(timestamp).toLocaleTimeString() : '----'}
                    </span>
                </div>
                <div className="vp__metric">
                    <span>Session ID</span>
                    <span className="vp__metric-val vp__metric-val--mono" style={{ opacity: active ? 1 : 0.4 }}>
                        {active ? sessionId : '----'}
                    </span>
                </div>

                {/* Verification Hash */}
                <div className="vp__hash-section">
                    <span className="vp__hash-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Verification Hash (SHA-256)
                    </span>
                    <div className="vp__hash-value">
                        {active ? hash : '0'.repeat(64)}
                    </div>
                </div>

                {/* Copy Proof Button */}
                <button
                    className={`vp__copy-btn ${copied ? 'vp__copy-btn--copied' : ''}`}
                    onClick={handleCopyProof}
                    disabled={!active}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {copied ? (
                            <polyline points="20 6 9 17 4 12" />
                        ) : (
                            <>
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </>
                        )}
                    </svg>
                    {copied ? 'Copied!' : 'Copy Verification Proof'}
                </button>
            </div>
        </div>
    )
}
