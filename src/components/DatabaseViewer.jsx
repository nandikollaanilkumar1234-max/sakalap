// =============================================================================
// src/components/DatabaseViewer.jsx
// Admin Raw Database Inspector — tabular grid of all SQLite tables
// =============================================================================

import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Database, RefreshCw, Table, Loader2 } from 'lucide-react';

export default function DatabaseViewer() {
  const [dbData, setDbData]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [activeTable, setActiveTable] = useState('slots');
  const [error, setError]       = useState(null);

  async function loadDb() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRawDb();
      setDbData(res.tables);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDb(); }, []);

  if (loading && !dbData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Loader2 size={32} style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite', color: '#2d6a4f' }}/>
        <p style={{ color: '#4a6741', fontWeight: 600 }}>Loading database…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#dc2626' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
        <p style={{ fontWeight: 600 }}>Database error: {error}</p>
        <button onClick={loadDb} className="btn btn-primary" style={{ marginTop: '16px' }}>
          <RefreshCw size={14}/> Retry
        </button>
      </div>
    );
  }

  const tables = dbData ? Object.keys(dbData) : [];
  const current = dbData?.[activeTable];

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a3a2a, #2d6a4f)',
        borderRadius: '16px 16px 0 0',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0',
      }}>
        <div className="flex items-center gap-3">
          <div style={{ fontSize: '24px' }}>🗄️</div>
          <div>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 800 }}>Visual Database Inspector</h3>
            <p style={{ color: '#95d5b2', fontSize: '12px' }}>Live SQLite data — direct from server collections</p>
          </div>
        </div>
        <button
          onClick={loadDb}
          disabled={loading}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 14px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', fontWeight: 600,
          }}
        >
          {loading
            ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }}/>
            : <RefreshCw size={14}/>
          }
          Refresh
        </button>
      </div>

      {/* Table selector */}
      <div style={{
        background: '#f0faf4',
        padding: '12px 24px',
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #d8f3dc',
        overflowX: 'auto',
      }}>
        {tables.map(tbl => (
          <button
            key={tbl}
            onClick={() => setActiveTable(tbl)}
            style={{
              flexShrink: 0,
              padding: '6px 16px',
              borderRadius: '20px',
              border: `2px solid ${activeTable === tbl ? '#2d6a4f' : '#d8f3dc'}`,
              background: activeTable === tbl ? '#2d6a4f' : '#fff',
              color: activeTable === tbl ? '#fff' : '#4a6741',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <Table size={12}/>
            {tbl}
            <span style={{
              background: activeTable === tbl ? 'rgba(255,255,255,0.25)' : '#d8f3dc',
              color: activeTable === tbl ? '#fff' : '#2d6a4f',
              borderRadius: '10px',
              padding: '0 6px',
              fontSize: '11px',
              fontWeight: 700,
            }}>
              {dbData?.[tbl]?.rows?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {current && (
        <div>
          {/* Table meta */}
          <div style={{
            padding: '12px 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #d8f3dc',
            fontSize: '13px',
          }}>
            <span style={{ color: '#4a6741', fontWeight: 600 }}>
              <strong style={{ color: '#1a2e1e' }}>{current.rows.length}</strong> rows
              &nbsp;•&nbsp; <strong style={{ color: '#1a2e1e' }}>{current.columns.length}</strong> columns
              &nbsp;•&nbsp; Table: <code style={{ background: '#f0faf4', padding: '2px 6px', borderRadius: '4px', color: '#2d6a4f' }}>{activeTable}</code>
            </span>
            <span style={{ color: '#7a9b7f', fontSize: '11px' }}>
              {new Date().toLocaleTimeString('en-IN')} — Live snapshot
            </span>
          </div>

          <div className="data-table-wrap" style={{ borderRadius: '0 0 16px 16px', maxHeight: '420px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ background: '#1a3a2a', color: '#95d5b2', minWidth: '36px' }}>#</th>
                  {current.columns.map(col => (
                    <th key={col} style={{ background: '#1a3a2a', color: '#95d5b2', whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {current.rows.length === 0 ? (
                  <tr>
                    <td colSpan={current.columns.length + 1} style={{ textAlign: 'center', padding: '32px', color: '#7a9b7f' }}>
                      No records in this table
                    </td>
                  </tr>
                ) : current.rows.map((row, ri) => (
                  <tr key={ri}>
                    <td style={{ fontWeight: 700, color: '#7a9b7f', background: '#f8fffe', minWidth: '36px' }}>
                      {ri + 1}
                    </td>
                    {current.columns.map(col => {
                      const val = row[col];
                      let display = val ?? <span style={{ color: '#d1d5db', fontStyle: 'italic' }}>null</span>;

                      // Format special columns
                      if (col === 'source') {
                        display = val === 'IVR / Feature Phone'
                          ? <span className="badge badge-ivr">📞 {val}</span>
                          : <span className="badge badge-app">📱 {val}</span>;
                      } else if (col === 'queue_status') {
                        const cls = val === 'pending' ? 'badge-pending' : val === 'serving' ? 'badge-serving' : 'badge-completed';
                        display = <span className={`badge ${cls}`}>{val}</span>;
                      } else if (col === 'payment_status') {
                        const cls = val === 'disbursed' ? 'badge-disbursed' : val === 'invoice_generated' ? 'badge-green' : 'badge-amber';
                        display = <span className={`badge ${cls}`}>{val}</span>;
                      } else if (col === 'id' && typeof val === 'string' && val.length > 20) {
                        display = <code style={{ fontSize: '10px', color: '#7a9b7f' }}>{val.substring(0,20)}…</code>;
                      } else if (col === 'message' && typeof val === 'string' && val.length > 60) {
                        display = <span title={val}>{val.substring(0,60)}…</span>;
                      } else if ((col === 'created_at' || col === 'sent_at' || col === 'performed_at') && val) {
                        display = new Date(val).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
                      }

                      return (
                        <td key={col} style={{ fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
