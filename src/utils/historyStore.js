// DeepGuard AI — Scan History Persistence (localStorage)

const STORAGE_KEY = 'deepguard_scan_history'
const MAX_ENTRIES = 200

const getAll = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch { return [] }
}

const persist = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Save a scan result to history.
 * @param {Object} entry - { source, fileName, url, score, isManipulated, verdict, details, timestamp }
 */
export const saveResult = (entry) => {
    const history = getAll()
    const record = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        timestamp: new Date().toISOString(),
        ...entry,
    }
    history.unshift(record)
    // Cap at MAX_ENTRIES
    if (history.length > MAX_ENTRIES) history.length = MAX_ENTRIES
    persist(history)
    return record
}

/** Get all history, optionally filtered. */
export const getHistory = (filters = {}) => {
    let history = getAll()

    if (filters.search) {
        const q = filters.search.toLowerCase()
        history = history.filter(h =>
            (h.fileName || '').toLowerCase().includes(q) ||
            (h.url || '').toLowerCase().includes(q) ||
            (h.source || '').toLowerCase().includes(q)
        )
    }
    if (filters.verdict) {
        history = history.filter(h =>
            filters.verdict === 'manipulated' ? h.isManipulated : !h.isManipulated
        )
    }
    if (filters.minScore !== undefined) {
        history = history.filter(h => h.score >= filters.minScore)
    }
    if (filters.source) {
        history = history.filter(h => h.source === filters.source)
    }
    return history
}

/** Delete a single entry by ID. */
export const deleteResult = (id) => {
    const history = getAll().filter(h => h.id !== id)
    persist(history)
}

/** Clear all history. */
export const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY)
}

/** Get summary stats. */
export const getStats = () => {
    const history = getAll()
    return {
        total: history.length,
        authentic: history.filter(h => !h.isManipulated).length,
        manipulated: history.filter(h => h.isManipulated).length,
        avgScore: history.length
            ? (history.reduce((a, h) => a + (h.score || 0), 0) / history.length).toFixed(1)
            : 0,
    }
}

/** Export history as CSV string. */
export const exportCSV = (entries) => {
    const headers = ['ID', 'Source', 'File/URL', 'Score', 'Verdict', 'Timestamp']
    const rows = entries.map(e => [
        e.id,
        e.source || '',
        e.fileName || e.url || '',
        e.score || '',
        e.isManipulated ? 'Manipulated' : 'Authentic',
        e.timestamp || '',
    ])
    return [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
}
