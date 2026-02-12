import React, { useState, useRef, useCallback } from 'react'
import ExportPanel from './ExportPanel'
import { saveResult, exportCSV } from '../utils/historyStore'
import './BatchAnalysis.css'

export default function BatchAnalysis() {
    const [files, setFiles] = useState([]) // { file, status, progress, result }
    const [processing, setProcessing] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const inputRef = useRef(null)
    const abortRef = useRef(false)

    const addFiles = useCallback((newFiles) => {
        const items = Array.from(newFiles)
            .filter(f => f.type.startsWith('image/'))
            .slice(0, 50)
            .map(f => ({ file: f, status: 'pending', progress: 0, result: null }))
        setFiles(prev => [...prev, ...items].slice(0, 50))
    }, [])

    const handleDrop = (e) => {
        e.preventDefault()
        setDragActive(false)
        addFiles(e.dataTransfer.files)
    }

    const removeFile = (idx) => {
        setFiles(prev => prev.filter((_, i) => i !== idx))
    }

    const startBatch = async () => {
        if (files.length === 0) return
        setProcessing(true)
        abortRef.current = false

        const aiModule = await import('../utils/aiEngine')
        await aiModule.loadModels()

        for (let i = 0; i < files.length; i++) {
            if (abortRef.current) break
            if (files[i].status === 'done') continue

            setFiles(prev => prev.map((f, idx) =>
                idx === i ? { ...f, status: 'analyzing', progress: 10 } : f
            ))

            try {
                const img = new Image()
                img.src = URL.createObjectURL(files[i].file)
                await new Promise(r => { img.onload = r })

                // Progress simulation
                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, progress: 50 } : f
                ))

                const aiResults = await aiModule.analyzeImage(img)

                const result = {
                    score: parseFloat(aiResults.result.overall.toFixed(1)),
                    isManipulated: aiResults.result.isManipulated,
                    verdict: aiResults.result.verdict,
                    details: aiResults.result.details,
                    fileName: files[i].file.name,
                    timestamp: new Date().toISOString(),
                }

                // Save to history
                saveResult({ ...result, source: 'batch' })
                window.dispatchEvent(new Event('deepguard-scan-complete'))

                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'done', progress: 100, result } : f
                ))

                URL.revokeObjectURL(img.src)
            } catch (err) {
                console.error(err)
                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'error', progress: 0 } : f
                ))
            }
        }

        setProcessing(false)
    }

    const stopBatch = () => {
        abortRef.current = true
        setProcessing(false)
    }

    const completedFiles = files.filter(f => f.status === 'done')
    const totalScore = completedFiles.length
        ? (completedFiles.reduce((a, f) => a + f.result.score, 0) / completedFiles.length).toFixed(1)
        : null

    const handleExportCSV = () => {
        const entries = completedFiles.map(f => f.result)
        const csv = exportCSV(entries)
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `deepguard-batch-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const resetAll = () => {
        abortRef.current = true
        setProcessing(false)
        setFiles([])
    }

    return (
        <section className="section batch-section" id="batch">
            <div className="container">
                <div className="section-header">
                    <div className="badge" style={{ marginBottom: 16 }}>
                        <span>📦</span> Bulk Analysis
                    </div>
                    <h2>
                        Batch <span className="gradient-text">Processing</span>
                    </h2>
                    <p>Upload up to 50 images for sequential AI analysis. Get results for all files with a single click.</p>
                </div>

                {/* Upload Zone */}
                {files.length === 0 && (
                    <div
                        className={`ba__dropzone ${dragActive ? 'ba__dropzone--active' : ''}`}
                        onDragOver={e => { e.preventDefault(); setDragActive(true) }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={e => addFiles(e.target.files)}
                            hidden
                        />
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <h3>Drop multiple images here</h3>
                        <p>or click to browse • up to 50 images • JPG, PNG, WEBP</p>
                    </div>
                )}

                {/* File Queue */}
                {files.length > 0 && (
                    <div className="ba__workspace">
                        {/* Status Bar */}
                        <div className="ba__status-bar glass-card">
                            <div className="ba__status-info">
                                <span className="ba__count">{files.length} file{files.length > 1 ? 's' : ''}</span>
                                <span className="ba__progress-text">
                                    {completedFiles.length}/{files.length} analyzed
                                </span>
                            </div>
                            <div className="ba__status-actions">
                                {!processing && files.some(f => f.status === 'pending') && (
                                    <button className="btn btn-primary" onClick={startBatch}>
                                        ▶ Start Batch Analysis
                                    </button>
                                )}
                                {processing && (
                                    <button className="btn btn-secondary" onClick={stopBatch}>
                                        ⏹ Stop
                                    </button>
                                )}
                                {!processing && (
                                    <button className="btn btn-secondary" onClick={() => inputRef.current?.click()}>
                                        + Add More
                                    </button>
                                )}
                                {completedFiles.length > 0 && !processing && (
                                    <button className="btn btn-secondary" onClick={handleExportCSV}>
                                        📥 Export CSV
                                    </button>
                                )}
                                <button className="btn btn-secondary" onClick={resetAll}>Reset</button>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={e => addFiles(e.target.files)}
                                    hidden
                                />
                            </div>
                        </div>

                        {/* Summary */}
                        {completedFiles.length > 0 && (
                            <div className="ba__summary glass-card">
                                <div className="ba__summary-item">
                                    <span className="ba__summary-val">{totalScore}%</span>
                                    <span className="ba__summary-label">Avg Score</span>
                                </div>
                                <div className="ba__summary-item">
                                    <span className="ba__summary-val" style={{ color: 'var(--accent)' }}>
                                        {completedFiles.filter(f => !f.result.isManipulated).length}
                                    </span>
                                    <span className="ba__summary-label">Authentic</span>
                                </div>
                                <div className="ba__summary-item">
                                    <span className="ba__summary-val" style={{ color: 'var(--accent-coral)' }}>
                                        {completedFiles.filter(f => f.result.isManipulated).length}
                                    </span>
                                    <span className="ba__summary-label">Suspicious</span>
                                </div>
                            </div>
                        )}

                        {/* File List */}
                        <div className="ba__queue">
                            {files.map((item, idx) => (
                                <div key={idx} className={`ba__item glass-card ba__item--${item.status}`}>
                                    <div className="ba__item-name">
                                        {item.file.name}
                                        <span className="ba__item-size">{(item.file.size / 1024).toFixed(0)} KB</span>
                                    </div>

                                    {item.status === 'pending' && (
                                        <span className="ba__item-status">Pending</span>
                                    )}
                                    {item.status === 'analyzing' && (
                                        <div className="ba__item-progress">
                                            <div className="ba__item-bar">
                                                <div className="ba__item-fill" style={{ width: `${item.progress}%` }} />
                                            </div>
                                            <span>Analyzing...</span>
                                        </div>
                                    )}
                                    {item.status === 'done' && item.result && (
                                        <div className="ba__item-result">
                                            <span className={`ba__item-badge ${item.result.isManipulated ? 'ba__item-badge--fake' : 'ba__item-badge--real'}`}>
                                                {item.result.isManipulated ? '⚠ Suspicious' : '✓ Authentic'}
                                            </span>
                                            <span className="ba__item-score" style={{
                                                color: item.result.isManipulated ? 'var(--accent-coral)' : 'var(--accent)'
                                            }}>
                                                {item.result.score}%
                                            </span>
                                        </div>
                                    )}
                                    {item.status === 'error' && (
                                        <span className="ba__item-status" style={{ color: 'var(--accent-coral)' }}>Error</span>
                                    )}

                                    {!processing && (
                                        <button className="ba__item-remove" onClick={() => removeFile(idx)}>×</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
