import React, { useState, useRef, useCallback } from 'react'
import { saveResult } from '../utils/historyStore'
import ExportPanel from './ExportPanel'
import './ComparisonMode.css'

export default function ComparisonMode() {
    const [fileA, setFileA] = useState(null)
    const [fileB, setFileB] = useState(null)
    const [previewA, setPreviewA] = useState(null)
    const [previewB, setPreviewB] = useState(null)
    const [resultA, setResultA] = useState(null)
    const [resultB, setResultB] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [diffData, setDiffData] = useState(null)
    const canvasRef = useRef(null)
    const inputARef = useRef(null)
    const inputBRef = useRef(null)

    const handleFile = (file, side) => {
        if (!file || !file.type.startsWith('image/')) return
        const url = URL.createObjectURL(file)
        if (side === 'A') { setFileA(file); setPreviewA(url); setResultA(null) }
        else { setFileB(file); setPreviewB(url); setResultB(null) }
        setDiffData(null)
    }

    const runComparison = async () => {
        if (!fileA || !fileB) return
        setAnalyzing(true)
        setResultA(null)
        setResultB(null)
        setDiffData(null)

        try {
            const ai = await import('../utils/aiEngine')
            await ai.loadModels()

            // Analyze both images
            const imgA = new Image()
            imgA.src = previewA
            await new Promise(r => { imgA.onload = r })

            const imgB = new Image()
            imgB.src = previewB
            await new Promise(r => { imgB.onload = r })

            const [resA, resB] = await Promise.all([
                ai.analyzeImage(imgA),
                ai.analyzeImage(imgB),
            ])

            const rA = {
                score: parseFloat(resA.result.overall.toFixed(1)),
                isManipulated: resA.result.isManipulated,
                details: resA.result.details,
                fileName: fileA.name,
                timestamp: new Date().toISOString(),
            }
            const rB = {
                score: parseFloat(resB.result.overall.toFixed(1)),
                isManipulated: resB.result.isManipulated,
                details: resB.result.details,
                fileName: fileB.name,
                timestamp: new Date().toISOString(),
            }

            setResultA(rA)
            setResultB(rB)

            // Save to history
            saveResult({ ...rA, source: 'compare' })
            saveResult({ ...rB, source: 'compare' })
            window.dispatchEvent(new Event('deepguard-scan-complete'))

            // Compute pixel diff
            computeDiff(imgA, imgB)
        } catch (err) {
            console.error(err)
        }
        setAnalyzing(false)
    }

    const computeDiff = (imgA, imgB) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const w = Math.min(imgA.width, imgB.width, 500)
        const h = Math.min(imgA.height, imgB.height, 400)
        canvas.width = w
        canvas.height = h

        const ctxA = document.createElement('canvas')
        ctxA.width = w; ctxA.height = h
        const ca = ctxA.getContext('2d')
        ca.drawImage(imgA, 0, 0, w, h)
        const dataA = ca.getImageData(0, 0, w, h)

        const ctxB = document.createElement('canvas')
        ctxB.width = w; ctxB.height = h
        const cb = ctxB.getContext('2d')
        cb.drawImage(imgB, 0, 0, w, h)
        const dataB = cb.getImageData(0, 0, w, h)

        const ctx = canvas.getContext('2d')
        const diff = ctx.createImageData(w, h)
        let totalDiff = 0
        const pixelCount = w * h

        for (let i = 0; i < dataA.data.length; i += 4) {
            const dr = Math.abs(dataA.data[i] - dataB.data[i])
            const dg = Math.abs(dataA.data[i + 1] - dataB.data[i + 1])
            const db = Math.abs(dataA.data[i + 2] - dataB.data[i + 2])
            const d = (dr + dg + db) / 3

            totalDiff += d

            // Heatmap: low diff = dark, high diff = red/yellow
            if (d < 10) {
                diff.data[i] = 0
                diff.data[i + 1] = 0
                diff.data[i + 2] = 0
            } else if (d < 50) {
                diff.data[i] = 255
                diff.data[i + 1] = Math.floor(255 - d * 3)
                diff.data[i + 2] = 0
            } else {
                diff.data[i] = 255
                diff.data[i + 1] = 0
                diff.data[i + 2] = 0
            }
            diff.data[i + 3] = Math.min(255, d * 4 + 30)
        }

        ctx.putImageData(diff, 0, 0)
        setDiffData({
            similarity: (100 - (totalDiff / pixelCount) / 2.55).toFixed(1),
        })
    }

    const reset = () => {
        setFileA(null); setFileB(null)
        setPreviewA(null); setPreviewB(null)
        setResultA(null); setResultB(null)
        setDiffData(null)
    }

    const delta = resultA && resultB
        ? Math.abs(resultA.score - resultB.score).toFixed(1)
        : null

    return (
        <section className="section compare-section" id="compare">
            <div className="container">
                <div className="section-header">
                    <div className="badge" style={{ marginBottom: 16 }}>
                        <span>⚖️</span> Comparison Mode
                    </div>
                    <h2>
                        Side-by-Side <span className="gradient-text">Analysis</span>
                    </h2>
                    <p>Compare an original with a suspected fake. Visualize pixel differences and confidence deltas.</p>
                </div>

                <div className="cm__grid">
                    {/* Side A */}
                    <div className="cm__side glass-card">
                        <div className="cm__side-label">Original</div>
                        {!previewA ? (
                            <div className="cm__upload" onClick={() => inputARef.current?.click()}>
                                <input ref={inputARef} type="file" accept="image/*" onChange={e => handleFile(e.target.files[0], 'A')} hidden />
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                                <span>Upload Original</span>
                            </div>
                        ) : (
                            <div className="cm__preview">
                                <img src={previewA} alt="Original" />
                                {resultA && (
                                    <div className="cm__result-overlay">
                                        <span className={`cm__score ${resultA.isManipulated ? 'cm__score--fake' : 'cm__score--real'}`}>
                                            {resultA.score}%
                                        </span>
                                        <span className={`cm__verdict ${resultA.isManipulated ? 'cm__verdict--fake' : 'cm__verdict--real'}`}>
                                            {resultA.isManipulated ? '⚠ Suspicious' : '✓ Authentic'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Center Delta */}
                    <div className="cm__center">
                        {delta !== null ? (
                            <div className="cm__delta">
                                <span className="cm__delta-label">Delta</span>
                                <span className="cm__delta-val">{delta}%</span>
                            </div>
                        ) : (
                            <div className="cm__vs">VS</div>
                        )}
                    </div>

                    {/* Side B */}
                    <div className="cm__side glass-card">
                        <div className="cm__side-label">Suspected</div>
                        {!previewB ? (
                            <div className="cm__upload" onClick={() => inputBRef.current?.click()}>
                                <input ref={inputBRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files[0], 'B')} hidden />
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                                <span>Upload Suspected</span>
                            </div>
                        ) : (
                            <div className="cm__preview">
                                <img src={previewB} alt="Suspected" />
                                {resultB && (
                                    <div className="cm__result-overlay">
                                        <span className={`cm__score ${resultB.isManipulated ? 'cm__score--fake' : 'cm__score--real'}`}>
                                            {resultB.score}%
                                        </span>
                                        <span className={`cm__verdict ${resultB.isManipulated ? 'cm__verdict--fake' : 'cm__verdict--real'}`}>
                                            {resultB.isManipulated ? '⚠ Suspicious' : '✓ Authentic'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="cm__actions">
                    {fileA && fileB && !analyzing && !resultA && (
                        <button className="btn btn-primary" onClick={runComparison}>
                            ⚡ Run Comparison
                        </button>
                    )}
                    {analyzing && (
                        <button className="btn btn-secondary" disabled>
                            Analyzing both images...
                        </button>
                    )}
                    {(fileA || fileB) && !analyzing && (
                        <button className="btn btn-secondary" onClick={reset}>Reset</button>
                    )}
                </div>

                {/* Diff Heatmap */}
                {diffData && (
                    <div className="cm__diff glass-card">
                        <div className="cm__diff-header">
                            <h4>Pixel Difference Heatmap</h4>
                            <span className="cm__similarity">
                                Similarity: <strong>{diffData.similarity}%</strong>
                            </span>
                        </div>
                        <div className="cm__diff-canvas-wrap">
                            <canvas ref={canvasRef} className="cm__diff-canvas" />
                        </div>
                        <div className="cm__diff-legend">
                            <span><span className="cm__legend-dot" style={{ background: '#000' }} /> Identical</span>
                            <span><span className="cm__legend-dot" style={{ background: '#ffaa00' }} /> Minor Diff</span>
                            <span><span className="cm__legend-dot" style={{ background: '#ff0000' }} /> Major Diff</span>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
