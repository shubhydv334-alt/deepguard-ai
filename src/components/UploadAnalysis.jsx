import React, { useState, useRef, useCallback, useEffect } from 'react'
import * as faceapi from 'face-api.js'
import VerificationProof from './VerificationProof'
import './UploadAnalysis.css'

const ANALYSIS_FACTORS = [
    { name: 'Facial Consistency', key: 'facial' },
    { name: 'Audio-Visual Sync', key: 'audio' },
    { name: 'Pixel Forensics', key: 'pixel' },
    { name: 'Metadata Analysis', key: 'metadata' },
    { name: 'Temporal Coherence', key: 'temporal' },
]

function generateResults() {
    const isDeepfake = Math.random() > 0.5
    const base = isDeepfake ? 65 + Math.random() * 30 : 5 + Math.random() * 25
    const scores = {}
    ANALYSIS_FACTORS.forEach(f => {
        const variance = (Math.random() - 0.5) * 30
        scores[f.key] = Math.max(5, Math.min(98, base + variance))
    })
    const overall = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
    return { overall: Math.round(overall * 10) / 10, scores, isDeepfake: overall > 45 }
}

function RadialGauge({ value, size = 180 }) {
    const radius = (size - 20) / 2
    const circumference = 2 * Math.PI * radius
    const [animatedValue, setAnimatedValue] = useState(0)

    useEffect(() => {
        let start = 0
        const duration = 1500
        const startTime = Date.now()
        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setAnimatedValue(value * eased)
            if (progress < 1) requestAnimationFrame(animate)
        }
        animate()
    }, [value])

    const offset = circumference - (animatedValue / 100) * circumference
    const color = animatedValue > 60 ? '#ff5252' : animatedValue > 30 ? '#ff9100' : '#69f0ae'

    return (
        <div className="radial-gauge" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="10"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke 0.5s' }}
                />
            </svg>
            <div className="radial-gauge__text">
                <span className="radial-gauge__value" style={{ color }}>{Math.round(animatedValue)}%</span>
                <span className="radial-gauge__label">Manipulation</span>
            </div>
        </div>
    )
}

export default function UploadAnalysis() {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [results, setResults] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef(null)
    const canvasRef = useRef(null)
    const imgRef = useRef(null)

    const handleFile = useCallback((f) => {
        if (!f) return
        setFile(f)
        setResults(null)
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target.result)
        reader.readAsDataURL(f)
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setDragActive(false)
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
    }, [handleFile])

    const startAnalysis = async () => {
        if (!file) return

        setAnalyzing(true)
        setProgress(0)
        setResults(null)

        // Progress simulation while AI loads/processes
        const interval = setInterval(() => {
            setProgress(prev => Math.min(prev + 5, 90))
        }, 100)

        try {
            // Create image element for analysis
            const img = new Image()
            img.src = URL.createObjectURL(file)
            await new Promise(r => img.onload = r)

            // Run AI Analysis
            const aiResults = await import('../utils/aiEngine').then(mod => mod.analyzeImage(img))

            clearInterval(interval)
            setProgress(100)

            // Format results for UI
            const formattedResults = {
                overall: aiResults.result.overall.toFixed(1),
                scores: aiResults.result.details,
                isDeepfake: aiResults.result.isManipulated,
                detections: aiResults.detections
            }

            setAnalyzing(false)
            setResults(formattedResults)

            // Draw detections if any
            if (aiResults.detections.length > 0) {
                drawDetections(aiResults.detections)
            }

        } catch (error) {
            console.error(error)
            clearInterval(interval)
            setAnalyzing(false)
            // Fallback to error results or mock
        }
    }

    const drawDetections = (detections) => {
        if (!canvasRef.current || !imgRef.current) return

        const canvas = canvasRef.current
        const img = imgRef.current

        // Match canvas dimensions to displayed image
        const displaySize = { width: img.width, height: img.height }
        faceapi.matchDimensions(canvas, displaySize)

        // Resize detections
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        // Draw
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        resizedDetections.forEach(det => {
            const box = det.detection.box

            // Draw Box
            ctx.strokeStyle = '#c5f82a'
            ctx.lineWidth = 2
            ctx.strokeRect(box.x, box.y, box.width, box.height)

            // Draw Label
            ctx.fillStyle = '#c5f82a'
            ctx.font = 'bold 14px "JetBrains Mono"'
            ctx.fillText(`${Math.round(det.detection.score * 100)}%`, box.x, box.y - 5)
        })
    }

    const reset = () => {
        setFile(null)
        setPreview(null)
        setResults(null)
        setProgress(0)
        setAnalyzing(false)
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d')
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
    }

    return (
        <section className="section upload-section" id="analyze">
            <div className="container">
                <div className="section-header">
                    <div className="badge" style={{ marginBottom: 16 }}>
                        <span>🔍</span> Media Analysis
                    </div>
                    <h2>
                        Analyze <span className="gradient-text">Your Media</span>
                    </h2>
                    <p>
                        Upload any image or video to run our AI-powered deepfake detection analysis.
                        Get instant results with confidence scores and heatmap overlays.
                    </p>
                </div>

                <div className="upload__container">
                    {/* Upload Zone */}
                    {!file && (
                        <div
                            className={`upload__dropzone ${dragActive ? 'upload__dropzone--active' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,video/*"
                                onChange={(e) => handleFile(e.target.files[0])}
                                hidden
                            />
                            <div className="upload__dropzone-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>
                            <h3>Drop your media here</h3>
                            <p>or click to browse • Supports images and videos</p>
                            <div className="upload__formats">
                                {['JPG', 'PNG', 'MP4', 'AVI', 'MOV', 'WEBP'].map(f => (
                                    <span key={f} className="upload__format-tag">{f}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preview + Analysis */}
                    {file && (
                        <div className="upload__analysis-area">
                            <div className="upload__preview-panel">
                                <div className="upload__preview-wrapper">
                                    {preview && file.type.startsWith('image') && (
                                        <>
                                            <img ref={imgRef} src={preview} alt="Preview" className="upload__preview-img" />
                                            <canvas ref={canvasRef} className="upload__detection-layer" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
                                        </>
                                    )}
                                    {preview && file.type.startsWith('video') && (
                                        <video src={preview} controls className="upload__preview-img" />
                                    )}

                                    {/* Scan overlay */}
                                    {analyzing && (
                                        <div className="upload__scan-overlay">
                                            <div className="upload__scan-line" style={{ top: `${progress}%` }}></div>
                                        </div>
                                    )}

                                    {/* Heatmap overlay */}
                                    {results && results.isDeepfake && (
                                        <div className="upload__heatmap-overlay">
                                            <div className="upload__heatmap-region upload__heatmap-region--1"></div>
                                            <div className="upload__heatmap-region upload__heatmap-region--2"></div>
                                            <div className="upload__heatmap-region upload__heatmap-region--3"></div>
                                        </div>
                                    )}
                                </div>

                                <div className="upload__file-info">
                                    <span>{file.name}</span>
                                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>

                                <div className="upload__actions">
                                    {!analyzing && !results && (
                                        <button className="btn btn-primary" onClick={startAnalysis}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                            </svg>
                                            Start Analysis
                                        </button>
                                    )}
                                    <button className="btn btn-secondary" onClick={reset}>
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {/* Progress / Results Panel */}
                            <div className="upload__results-panel">
                                {analyzing && (
                                    <div className="upload__progress-container glass-card">
                                        <h4>Analyzing Media...</h4>
                                        <div className="upload__progress-bar">
                                            <div
                                                className="upload__progress-fill"
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="upload__progress-steps">
                                            <div className={`upload__step ${progress > 10 ? 'upload__step--done' : ''}`}>
                                                <span className="upload__step-dot"></span> Facial Analysis
                                            </div>
                                            <div className={`upload__step ${progress > 30 ? 'upload__step--done' : ''}`}>
                                                <span className="upload__step-dot"></span> Audio-Visual Sync
                                            </div>
                                            <div className={`upload__step ${progress > 55 ? 'upload__step--done' : ''}`}>
                                                <span className="upload__step-dot"></span> Pixel Forensics
                                            </div>
                                            <div className={`upload__step ${progress > 75 ? 'upload__step--done' : ''}`}>
                                                <span className="upload__step-dot"></span> Metadata Scan
                                            </div>
                                            <div className={`upload__step ${progress > 90 ? 'upload__step--done' : ''}`}>
                                                <span className="upload__step-dot"></span> Generating Report
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {results && (
                                    <div className="upload__results glass-card">
                                        <div className="upload__verdict-header">
                                            <div className={`upload__verdict-badge ${results.isDeepfake ? 'upload__verdict-badge--fake' : 'upload__verdict-badge--real'}`}>
                                                {results.isDeepfake ? '⚠ Likely Manipulated' : '✓ Likely Authentic'}
                                            </div>
                                            <div className="upload__verdict-id">
                                                ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}-{Math.random().toString(36).substring(2, 6).toUpperCase()}
                                            </div>
                                        </div>

                                        <div className="upload__gauge-row">
                                            <RadialGauge value={results.overall} />
                                        </div>

                                        <div className="upload__score-breakdown">
                                            {ANALYSIS_FACTORS.map(f => {
                                                const score = results.scores[f.key]
                                                const color = score > 60 ? '#ff5252' : score > 30 ? '#ff9100' : '#69f0ae'
                                                return (
                                                    <div className="upload__score-item" key={f.key}>
                                                        <div className="upload__score-label">
                                                            <span>{f.name}</span>
                                                            <span style={{ color }}>{Math.round(score)}%</span>
                                                        </div>
                                                        <div className="upload__score-bar">
                                                            <div
                                                                className="upload__score-fill"
                                                                style={{ width: `${score}%`, background: color, boxShadow: `0 0 8px ${color}40` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={reset}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="23 4 23 10 17 10" />
                                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                            </svg>
                                            Analyze Another File
                                        </button>
                                    </div>
                                )}

                                {!analyzing && !results && (
                                    <div className="upload__ready glass-card">
                                        <div className="upload__ready-icon">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5">
                                                <circle cx="11" cy="11" r="8" />
                                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                                <line x1="11" y1="8" x2="11" y2="14" />
                                                <line x1="8" y1="11" x2="14" y2="11" />
                                            </svg>
                                        </div>
                                        <h4>Ready to Analyze</h4>
                                        <p>Click "Start Analysis" to begin the deepfake detection scan on your uploaded media.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <VerificationProof
                    active={!!results}
                    score={results ? results.overall : 0}
                    isManipulated={results ? results.isDeepfake : false}
                    inputType="File Upload"
                    detectorName="Media Analysis"
                    analyzing={analyzing}
                    prefix="uf"
                />
            </div>
        </section>
    )
}
