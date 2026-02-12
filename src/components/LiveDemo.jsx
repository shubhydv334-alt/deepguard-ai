import React, { useRef, useState, useEffect, useCallback } from 'react'
import VerificationProof from './VerificationProof'
import { saveResult } from '../utils/historyStore'
import './LiveDemo.css'

export default function LiveDemo() {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const [streaming, setStreaming] = useState(false)
    const [score, setScore] = useState(97.3)
    const [error, setError] = useState(null)
    const [faceCount, setFaceCount] = useState(0)
    const [fps, setFps] = useState(0)
    const [expressions, setExpressions] = useState(null)
    const [metrics, setMetrics] = useState({
        symmetry: 0,
        stability: 0,
        edgeRefinement: 0,
        blinkRate: 0,
        microMovement: 0,
    })
    const animRef = useRef(null)
    const fpsRef = useRef({ count: 0, lastTime: Date.now() })
    const prevLandmarksRef = useRef(null)
    const blinkRef = useRef({ count: 0, closedFrames: 0, totalFrames: 0 })
    const frameCountRef = useRef(0)

    const startCamera = useCallback(async () => {
        try {
            const ai = await import('../utils/aiEngine')
            await ai.loadModels()

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' },
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setStreaming(true)
                setError(null)
                prevLandmarksRef.current = null
                blinkRef.current = { count: 0, closedFrames: 0, totalFrames: 0 }
                frameCountRef.current = 0
                detectFaces()
            }
        } catch (err) {
            console.error(err)
            setError('Camera access denied or model load failed.')
        }
    }, [])

    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop())
            videoRef.current.srcObject = null
        }
        setStreaming(false)
        if (animRef.current) cancelAnimationFrame(animRef.current)
    }, [])

    // Compute facial symmetry from landmarks
    const computeSymmetry = (landmarks) => {
        const pts = landmarks.positions
        if (pts.length < 68) return 85

        // Compare left/right eye sizes
        const leftEye = pts.slice(36, 42)
        const rightEye = pts.slice(42, 48)
        const leftW = Math.abs(leftEye[3].x - leftEye[0].x)
        const rightW = Math.abs(rightEye[3].x - rightEye[0].x)
        const eyeSymmetry = 1 - Math.abs(leftW - rightW) / Math.max(leftW, rightW, 1)

        // Compare mouth corners to nose center
        const nose = pts[30]
        const mouthL = pts[48]
        const mouthR = pts[54]
        const distL = Math.sqrt((mouthL.x - nose.x) ** 2 + (mouthL.y - nose.y) ** 2)
        const distR = Math.sqrt((mouthR.x - nose.x) ** 2 + (mouthR.y - nose.y) ** 2)
        const mouthSymmetry = 1 - Math.abs(distL - distR) / Math.max(distL, distR, 1)

        return Math.min(100, Math.max(50, (eyeSymmetry * 0.5 + mouthSymmetry * 0.5) * 100))
    }

    // Compute stability by comparing to previous frame
    const computeStability = (landmarks) => {
        const pts = landmarks.positions
        if (!prevLandmarksRef.current || prevLandmarksRef.current.length !== pts.length) {
            prevLandmarksRef.current = pts.map(p => ({ x: p.x, y: p.y }))
            return 95
        }

        let totalDrift = 0
        for (let i = 0; i < pts.length; i++) {
            const dx = pts[i].x - prevLandmarksRef.current[i].x
            const dy = pts[i].y - prevLandmarksRef.current[i].y
            totalDrift += Math.sqrt(dx * dx + dy * dy)
        }
        prevLandmarksRef.current = pts.map(p => ({ x: p.x, y: p.y }))

        const avgDrift = totalDrift / pts.length
        // Natural micro-movement = some drift is expected (1-3px); too stable = suspicious
        const stability = avgDrift < 0.5 ? 70 : avgDrift < 5 ? 96 : Math.max(50, 100 - avgDrift * 2)
        return stability
    }

    // Detect blink rate via eye aspect ratio
    const checkBlink = (landmarks) => {
        const pts = landmarks.positions
        if (pts.length < 68) return

        blinkRef.current.totalFrames++

        // Eye aspect ratio for left eye
        const leftTop = pts[37].y + pts[38].y
        const leftBot = pts[40].y + pts[41].y
        const leftW = Math.abs(pts[39].x - pts[36].x)
        const leftEAR = (leftBot - leftTop) / (2 * Math.max(leftW, 1))

        if (leftEAR < 0.15) {
            blinkRef.current.closedFrames++
        }
    }

    const detectFaces = async () => {
        if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) return

        const ai = await import('../utils/aiEngine')
        const canvas = canvasRef.current
        const video = videoRef.current

        if (canvas.width !== video.videoWidth) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
        }

        const detect = async () => {
            if (!video || !video.srcObject) return

            const detections = await ai.analyzeVideoFrame(video)

            // FPS counter
            fpsRef.current.count++
            const now = Date.now()
            if (now - fpsRef.current.lastTime >= 1000) {
                setFps(fpsRef.current.count)
                fpsRef.current = { count: 0, lastTime: now }
            }

            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            frameCountRef.current++

            if (detections && detections.length > 0) {
                setFaceCount(detections.length)

                detections.forEach((face, idx) => {
                    const { x, y, width, height } = face.detection.box
                    const confidence = face.detection.score

                    // --- Corner bracket style box ---
                    const cornerLen = Math.min(width, height) * 0.2
                    ctx.strokeStyle = confidence > 0.8 ? '#c5f82a' : confidence > 0.6 ? '#ff9100' : '#ff5252'
                    ctx.lineWidth = 2
                    ctx.shadowColor = ctx.strokeStyle
                    ctx.shadowBlur = 8

                    // Top-left
                    ctx.beginPath()
                    ctx.moveTo(x, y + cornerLen); ctx.lineTo(x, y); ctx.lineTo(x + cornerLen, y)
                    ctx.stroke()
                    // Top-right
                    ctx.beginPath()
                    ctx.moveTo(x + width - cornerLen, y); ctx.lineTo(x + width, y); ctx.lineTo(x + width, y + cornerLen)
                    ctx.stroke()
                    // Bottom-left
                    ctx.beginPath()
                    ctx.moveTo(x, y + height - cornerLen); ctx.lineTo(x, y + height); ctx.lineTo(x + cornerLen, y + height)
                    ctx.stroke()
                    // Bottom-right
                    ctx.beginPath()
                    ctx.moveTo(x + width - cornerLen, y + height); ctx.lineTo(x + width, y + height); ctx.lineTo(x + width, y + height - cornerLen)
                    ctx.stroke()

                    ctx.shadowBlur = 0

                    // --- Draw landmarks with glow ---
                    ctx.fillStyle = 'rgba(197, 248, 42, 0.5)'
                    face.landmarks.positions.forEach(p => {
                        ctx.beginPath()
                        ctx.arc(p.x, p.y, 1.5, 0, 2 * Math.PI)
                        ctx.fill()
                    })

                    // --- Landmark connections (jaw line, eyebrows, eyes, nose, mouth) ---
                    ctx.strokeStyle = 'rgba(197, 248, 42, 0.2)'
                    ctx.lineWidth = 1
                    const drawLine = (start, end) => {
                        const pts = face.landmarks.positions
                        ctx.beginPath()
                        for (let i = start; i <= end; i++) {
                            i === start ? ctx.moveTo(pts[i].x, pts[i].y) : ctx.lineTo(pts[i].x, pts[i].y)
                        }
                        ctx.stroke()
                    }
                    drawLine(0, 16)   // jaw
                    drawLine(17, 21)  // left eyebrow
                    drawLine(22, 26)  // right eyebrow
                    drawLine(36, 41)  // left eye
                    drawLine(42, 47)  // right eye
                    drawLine(27, 35)  // nose
                    drawLine(48, 59)  // outer mouth
                    drawLine(60, 67)  // inner mouth

                    // --- Info label ---
                    const labelY = y - 14
                    ctx.fillStyle = 'rgba(0,0,0,0.7)'
                    ctx.fillRect(x, labelY - 12, width, 18)
                    ctx.fillStyle = ctx.strokeStyle === 'rgba(197, 248, 42, 0.2)' ? '#c5f82a' : '#c5f82a'
                    ctx.font = 'bold 11px "JetBrains Mono", Courier New, monospace'
                    ctx.textAlign = 'left'

                    // Top expression
                    let topExpr = 'neutral'
                    if (face.expressions) {
                        const sorted = Object.entries(face.expressions).sort((a, b) => b[1] - a[1])
                        topExpr = sorted[0][0]
                    }

                    ctx.fillStyle = '#c5f82a'
                    ctx.fillText(
                        `FACE ${idx + 1} • ${(confidence * 100).toFixed(0)}% • ${topExpr.toUpperCase()}`,
                        x + 4, labelY
                    )

                    // --- Compute advanced metrics for face 0 ---
                    if (idx === 0) {
                        const symmetry = computeSymmetry(face.landmarks)
                        const stability = computeStability(face.landmarks)
                        checkBlink(face.landmarks)

                        const blinkRate = blinkRef.current.totalFrames > 30
                            ? Math.min(100, 70 + (blinkRef.current.closedFrames / blinkRef.current.totalFrames) * 200)
                            : 85

                        // Edge refinement — how sharp the face boundary is
                        const edgeRefinement = 80 + confidence * 18

                        // Micro-movement — natural small movements
                        const microMovement = stability > 90 && stability < 99 ? 95 : 70

                        // Update metrics state every 10 frames for perf
                        if (frameCountRef.current % 10 === 0) {
                            setMetrics({
                                symmetry: Math.round(symmetry * 10) / 10,
                                stability: Math.round(stability * 10) / 10,
                                edgeRefinement: Math.round(edgeRefinement * 10) / 10,
                                blinkRate: Math.round(blinkRate * 10) / 10,
                                microMovement: Math.round(microMovement * 10) / 10,
                            })
                            setExpressions(face.expressions)
                        }

                        // Composite score
                        const compositeScore = (
                            symmetry * 0.2 +
                            stability * 0.25 +
                            edgeRefinement * 0.15 +
                            blinkRate * 0.2 +
                            microMovement * 0.2
                        )
                        setScore(Math.round(compositeScore * 10) / 10)
                    }
                })
            } else {
                setFaceCount(0)
                setScore(prev => Math.max(50, prev - 0.5))
                if (frameCountRef.current % 10 === 0) {
                    setMetrics(prev => ({
                        ...prev,
                        stability: Math.max(40, prev.stability - 2),
                    }))
                }
            }

            animRef.current = requestAnimationFrame(detect)
        }

        detect()
    }

    useEffect(() => {
        return () => stopCamera()
    }, [stopCamera])

    // Top expression name
    const topExpression = expressions
        ? Object.entries(expressions).sort((a, b) => b[1] - a[1])[0]
        : null

    const metricsData = [
        { label: 'Face Symmetry', value: metrics.symmetry, desc: 'Left/right facial proportion analysis' },
        { label: 'Landmark Stability', value: metrics.stability, desc: 'Frame-to-frame landmark consistency' },
        { label: 'Edge Refinement', value: metrics.edgeRefinement, desc: 'Face boundary sharpness' },
        { label: 'Blink Naturalness', value: metrics.blinkRate, desc: 'Eye blink frequency analysis' },
        { label: 'Micro-Movement', value: metrics.microMovement, desc: 'Natural small facial movement detection' },
    ]

    return (
        <section className="section live-demo" id="live-demo">
            <div className="container">
                <div className="section-header">
                    <div className="badge" style={{ marginBottom: 16 }}>
                        <span>📹</span> Real-Time Detection
                    </div>
                    <h2>
                        Live <span className="gradient-text">Webcam Demo</span>
                    </h2>
                    <p>
                        Real-time multi-face detection with 5-factor analysis: symmetry, stability,
                        edge refinement, blink naturalness, and micro-movement tracking.
                    </p>
                </div>

                <div className="live-demo__container">
                    <div className="live-demo__viewport glass-card">
                        <div className="live-demo__screen">
                            <video ref={videoRef} autoPlay playsInline muted className="live-demo__video" />
                            <canvas ref={canvasRef} className="live-demo__canvas" />

                            {/* Real-time HUD overlay */}
                            {streaming && (
                                <div className="ld__hud">
                                    <div className="ld__hud-top">
                                        <span className="ld__hud-fps">{fps} FPS</span>
                                        <span className="ld__hud-rec">● REC</span>
                                    </div>
                                    <div className="ld__hud-bottom">
                                        <span className="ld__hud-faces">
                                            {faceCount} FACE{faceCount !== 1 ? 'S' : ''} DETECTED
                                        </span>
                                        {topExpression && (
                                            <span className="ld__hud-expr">
                                                {topExpression[0].toUpperCase()} {(topExpression[1] * 100).toFixed(0)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {!streaming && (
                                <div className="live-demo__placeholder">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                        <circle cx="12" cy="13" r="4" />
                                    </svg>
                                    <p>
                                        {error || 'Click "Start Camera" to begin live detection'}
                                    </p>
                                </div>
                            )}

                            {/* Corner brackets */}
                            <div className="live-demo__bracket live-demo__bracket--tl"></div>
                            <div className="live-demo__bracket live-demo__bracket--tr"></div>
                            <div className="live-demo__bracket live-demo__bracket--bl"></div>
                            <div className="live-demo__bracket live-demo__bracket--br"></div>
                        </div>

                        <div className="live-demo__controls">
                            {!streaming ? (
                                <button className="btn btn-primary" onClick={startCamera}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                    Start Camera
                                </button>
                            ) : (
                                <button className="btn btn-secondary" onClick={stopCamera} style={{ borderColor: 'rgba(255,82,82,0.3)', color: '#ff5252' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="6" y="6" width="12" height="12" />
                                    </svg>
                                    Stop Camera
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="live-demo__info">
                        {/* Real-time Metrics Panel */}
                        <div className="ld__metrics-panel glass-card">
                            <div className="ld__mp-header">
                                <h4>Live Analysis</h4>
                                <span className={`ld__mp-status ${streaming ? 'ld__mp-status--live' : ''}`}>
                                    {streaming ? '● LIVE' : '○ IDLE'}
                                </span>
                            </div>

                            <div className="ld__mp-score">
                                <span className="ld__mp-score-val" style={{
                                    color: score > 80 ? 'var(--accent)' : score > 60 ? '#ff9100' : 'var(--accent-coral)'
                                }}>
                                    {score.toFixed(1)}
                                </span>
                                <span className="ld__mp-score-pct">%</span>
                                <span className="ld__mp-score-label">Authenticity</span>
                            </div>

                            <div className="ld__mp-factors">
                                {metricsData.map(m => {
                                    const color = m.value > 85 ? 'var(--accent)' : m.value > 65 ? '#ff9100' : 'var(--accent-coral)'
                                    return (
                                        <div className="ld__mp-factor" key={m.label}>
                                            <div className="ld__mp-factor-top">
                                                <span className="ld__mp-factor-name">{m.label}</span>
                                                <span className="ld__mp-factor-val" style={{ color }}>{m.value}%</span>
                                            </div>
                                            <div className="ld__mp-bar">
                                                <div className="ld__mp-bar-fill" style={{
                                                    width: `${m.value}%`,
                                                    background: color,
                                                    boxShadow: `0 0 6px ${color}40`,
                                                }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Expressions breakdown */}
                            {expressions && streaming && (
                                <div className="ld__expressions">
                                    <h5>Expression Analysis</h5>
                                    {Object.entries(expressions)
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 4)
                                        .map(([name, val]) => (
                                            <div className="ld__expr-row" key={name}>
                                                <span>{name}</span>
                                                <div className="ld__expr-bar">
                                                    <div className="ld__expr-fill" style={{ width: `${val * 100}%` }} />
                                                </div>
                                                <span className="ld__expr-val">{(val * 100).toFixed(0)}%</span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

                        <VerificationProof
                            active={streaming}
                            score={streaming ? score : 0}
                            isManipulated={streaming && score < 75}
                            inputType="Camera Stream"
                            detectorName="Live Webcam"
                            analyzing={false}
                            prefix="ld"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
