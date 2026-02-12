import React, { useState, useEffect, useMemo } from 'react'
import { getHistory, deleteResult, clearHistory, getStats, exportCSV } from '../utils/historyStore'
import './ScanHistory.css'

export default function ScanHistory() {
    const [history, setHistory] = useState([])
    const [stats, setStats] = useState({ total: 0, authentic: 0, manipulated: 0, avgScore: 0 })
    const [search, setSearch] = useState('')
    const [verdictFilter, setVerdictFilter] = useState('')
    const [sourceFilter, setSourceFilter] = useState('')
    const [expanded, setExpanded] = useState(null)

    const refresh = () => {
        const filters = {}
        if (search) filters.search = search
        if (verdictFilter) filters.verdict = verdictFilter
        if (sourceFilter) filters.source = sourceFilter
        setHistory(getHistory(filters))
        setStats(getStats())
    }

    useEffect(() => { refresh() }, [search, verdictFilter, sourceFilter])

    // Listen for custom event from other components
    useEffect(() => {
        const handler = () => refresh()
        window.addEventListener('deepguard-scan-complete', handler)
        return () => window.removeEventListener('deepguard-scan-complete', handler)
    }, [])

    const handleDelete = (id) => {
        deleteResult(id)
        refresh()
    }

    const handleClear = () => {
        if (window.confirm('Clear all scan history?')) {
            clearHistory()
            refresh()
        }
    }

    const handleExportCSV = () => {
        const csv = exportCSV(history)
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `deepguard-history-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const formatTime = (ts) => {
        if (!ts) return '—'
        const d = new Date(ts)
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <section className="section history-section" id="history">
            <div className="container">
                <div className="section-header">
                    <div className="badge" style={{ marginBottom: 16 }}>
                        <span>📋</span> Scan History
                    </div>
                    <h2>
                        Results <span className="gradient-text">Dashboard</span>
                    </h2>
                    <p>Track and revisit all your past scans. Search, filter, and export your verification history.</p>
                </div>

                {/* Stats Bar */}
                <div className="sh__stats">
                    <div className="sh__stat glass-card">
                        <span className="sh__stat-val">{stats.total}</span>
                        <span className="sh__stat-label">Total Scans</span>
                    </div>
                    <div className="sh__stat glass-card">
                        <span className="sh__stat-val" style={{ color: 'var(--accent)' }}>{stats.authentic}</span>
                        <span className="sh__stat-label">Authentic</span>
                    </div>
                    <div className="sh__stat glass-card">
                        <span className="sh__stat-val" style={{ color: 'var(--accent-coral)' }}>{stats.manipulated}</span>
                        <span className="sh__stat-label">Manipulated</span>
                    </div>
                    <div className="sh__stat glass-card">
                        <span className="sh__stat-val">{stats.avgScore}%</span>
                        <span className="sh__stat-label">Avg Score</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="sh__filters glass-card">
                    <div className="sh__search-wrap">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            className="sh__search"
                            placeholder="Search by filename, URL, or source..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="sh__filter-row">
                        <select className="sh__select" value={verdictFilter} onChange={e => setVerdictFilter(e.target.value)}>
                            <option value="">All Verdicts</option>
                            <option value="authentic">Authentic</option>
                            <option value="manipulated">Manipulated</option>
                        </select>
                        <select className="sh__select" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
                            <option value="">All Sources</option>
                            <option value="upload">Upload</option>
                            <option value="url">URL Scanner</option>
                            <option value="batch">Batch</option>
                            <option value="compare">Comparison</option>
                        </select>
                        <button className="btn btn-secondary sh__btn-sm" onClick={handleExportCSV} disabled={history.length === 0}>
                            📥 Export CSV
                        </button>
                        <button className="btn btn-secondary sh__btn-sm sh__btn-danger" onClick={handleClear} disabled={history.length === 0}>
                            🗑️ Clear All
                        </button>
                    </div>
                </div>

                {/* Results List */}
                <div className="sh__list">
                    {history.length === 0 && (
                        <div className="sh__empty glass-card">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            <h4>No scan history yet</h4>
                            <p>Your analysis results will appear here automatically after scanning.</p>
                        </div>
                    )}

                    {history.map(entry => (
                        <div key={entry.id} className={`sh__entry glass-card ${expanded === entry.id ? 'sh__entry--expanded' : ''}`}>
                            <div className="sh__entry-main" onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}>
                                <div className={`sh__verdict-dot ${entry.isManipulated ? 'sh__verdict-dot--fake' : 'sh__verdict-dot--real'}`} />
                                <div className="sh__entry-info">
                                    <span className="sh__entry-name">{entry.fileName || entry.url || 'Unknown'}</span>
                                    <span className="sh__entry-meta">
                                        {entry.source || '—'} • {formatTime(entry.timestamp)}
                                    </span>
                                </div>
                                <div className="sh__entry-score" style={{ color: entry.isManipulated ? 'var(--accent-coral)' : 'var(--accent)' }}>
                                    {typeof entry.score === 'number' ? entry.score.toFixed(1) : entry.score}%
                                </div>
                                <div className={`sh__entry-badge ${entry.isManipulated ? 'sh__entry-badge--fake' : 'sh__entry-badge--real'}`}>
                                    {entry.isManipulated ? 'Manipulated' : 'Authentic'}
                                </div>
                                <svg className="sh__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>

                            {expanded === entry.id && (
                                <div className="sh__entry-details">
                                    {entry.details && typeof entry.details === 'object' && Object.entries(entry.details).map(([key, val]) => (
                                        <div className="sh__detail-row" key={key}>
                                            <span>{key}</span>
                                            <span>{typeof val === 'number' ? `${val.toFixed(1)}%` : val}</span>
                                        </div>
                                    ))}
                                    <div className="sh__entry-actions">
                                        <button className="btn btn-secondary sh__btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(entry.id) }}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
