import React from 'react';

export const Dashboard = ({ tasks = [] }) => {
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === 'To Do').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const highPriority = tasks.filter((t) => t.priority === 'High' && t.status !== 'Completed').length;

  const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Tasks</div>
            <div className="stat-value">{total}</div>
          </div>
          <div className="stat-icon total">📋</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">To Do</div>
            <div className="stat-value">{todo}</div>
          </div>
          <div className="stat-icon todo">⏳</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{inProgress}</div>
          </div>
          <div className="stat-icon progress">⚡</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{completed}</div>
          </div>
          <div className="stat-icon completed">✅</div>
        </div>
      </div>

      {total > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Task Completion Rate</span>
            <span>{completionPercent}% ({completed} of {total} completed) {highPriority > 0 && `• ${highPriority} High Priority Pending`}</span>
          </div>
          <div style={{
            height: '8px',
            background: 'var(--bg-input)',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${completionPercent}%`,
              background: 'linear-gradient(90deg, #6366f1, #10b981)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      )}
    </div>
  );
};
