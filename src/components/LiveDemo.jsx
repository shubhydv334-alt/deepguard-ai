import React, { useRef, useState, useEffect, useCallback } from 'react'
import VerificationProof from './VerificationProof'
import './LiveDemo.css'

export default function LiveDemo() {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const [streaming, setStreaming] = useState(false)
    const [score, setScore] = useState(97.3)
    const [error, setError] = useState(null)
    const animRef = useRef(null)

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' },
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setStreaming(true)
                setError(null)
                drawOverlay()
            }
        } catch (err) {
            setError('Camera access denied. Please allow camera permissions.')
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

    const drawOverlay = useCallback(() => {
        const canvas = canvasRef.current
        const video = videoRef.current
        if (!canvas || !video) return
        const ctx = canvas.getContext('2d')
        canvas.width = 640
        canvas.height = 480

        const draw = () => {
            ctx.clearRect(0, 0, 640, 480)

            // Face detection rectangle (simulated)
            const cx = 320 + Math.sin(Date.now() / 2000) * 5
            const cy = 200 + Math.cos(Date.now() / 3000) * 3
            const w = 160 + Math.sin(Date.now() / 4000) * 8
            const h = 190 + Math.cos(Date.now() / 3500) * 8

            ctx.strokeStyle = 'rgba(197, 248, 42, 0.5)'
            ctx.lineWidth = 1.5
            ctx.setLineDash([6, 4])

            // Face box
            ctx.beginPath()
            const r = 10
            ctx.moveTo(cx - w / 2 + r, cy - h / 2)
            ctx.lineTo(cx + w / 2 - r, cy - h / 2)
            ctx.arcTo(cx + w / 2, cy - h / 2, cx + w / 2, cy - h / 2 + r, r)
            ctx.lineTo(cx + w / 2, cy + h / 2 - r)
            ctx.arcTo(cx + w / 2, cy + h / 2, cx + w / 2 - r, cy + h / 2, r)
            ctx.lineTo(cx - w / 2 + r, cy + h / 2)
            ctx.arcTo(cx - w / 2, cy + h / 2, cx - w / 2, cy + h / 2 - r, r)
            ctx.lineTo(cx - w / 2, cy - h / 2 + r)
            ctx.arcTo(cx - w / 2, cy - h / 2, cx - w / 2 + r, cy - h / 2, r)
            ctx.stroke()
            ctx.setLineDash([])

            // Feature points
            const points = [
                [cx - 30, cy - 10], [cx + 30, cy - 10],  // Eyes
                [cx, cy + 15],                              // Nose
                [cx - 20, cy + 40], [cx + 20, cy + 40],    // Mouth
                [cx - 50, cy], [cx + 50, cy],               // Temples
            ]

            points.forEach(([px, py]) => {
                const jx = px + Math.sin(Date.now() / 1000 + px) * 2
                const jy = py + Math.cos(Date.now() / 1200 + py) * 2
                ctx.beginPath()
                ctx.arc(jx, jy, 3, 0, Math.PI * 2)
                ctx.fillStyle = 'rgba(197, 248, 42, 0.7)'
                ctx.fill()
                ctx.beginPath()
                ctx.arc(jx, jy, 6, 0, Math.PI * 2)
                ctx.strokeStyle = 'rgba(197, 248, 42, 0.2)'
                ctx.lineWidth = 1
                ctx.stroke()
            })

            // Connect feature points
            ctx.beginPath()
            ctx.strokeStyle = 'rgba(200, 182, 255, 0.12)'
            ctx.lineWidth = 1
            for (let i = 0; i < points.length; i++) {
                for (let j = i + 1; j < points.length; j++) {
                    ctx.moveTo(points[i][0], points[i][1])
                    ctx.lineTo(points[j][0], points[j][1])
                }
            }
            ctx.stroke()

            // Label
            ctx.fillStyle = 'rgba(197, 248, 42, 0.8)'
            ctx.font = '11px "JetBrains Mono", monospace'
            ctx.fillText('FACE DETECTED', cx - w / 2, cy - h / 2 - 8)

            // Scan line
            const scanY = (Date.now() / 15) % 480
            ctx.beginPath()
            ctx.moveTo(0, scanY)
            ctx.lineTo(640, scanY)
            const grad = ctx.createLinearGradient(0, scanY, 640, scanY)
            grad.addColorStop(0, 'rgba(197,248,42,0)')
            grad.addColorStop(0.5, 'rgba(197,248,42,0.1)')
            grad.addColorStop(1, 'rgba(197,248,42,0)')
            ctx.strokeStyle = grad
            ctx.lineWidth = 2
            ctx.stroke()

            // Fluctuate score
            setScore(prev => {
                const delta = (Math.random() - 0.5) * 0.4
                return Math.max(90, Math.min(99.9, prev + delta))
            })

            animRef.current = requestAnimationFrame(draw)
        }

        draw()
    }, [])

    useEffect(() => {
        return () => stopCamera()
    }, [stopCamera])

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
                        Experience real-time deepfake detection with your webcam.
                        Our AI analyzes your face at 30fps to verify authenticity.
                    </p>
                </div>

                <div className="live-demo__container">
                    <div className="live-demo__viewport glass-card">
                        <div className="live-demo__screen">
                            <video ref={videoRef} autoPlay playsInline muted className="live-demo__video" />
                            <canvas ref={canvasRef} className="live-demo__canvas" />

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
                        <VerificationProof
                            active={streaming}
                            score={streaming ? score : 0}
                            isManipulated={streaming && score < 80}
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
