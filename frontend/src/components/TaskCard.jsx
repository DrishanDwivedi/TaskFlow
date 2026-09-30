import React from 'react';

export const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'In Progress': return 'badge-progress';
      case 'Completed': return 'badge-completed';
      default: return 'badge-todo';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      default: return 'badge-low';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const cycleStatus = () => {
    const statuses = ['To Do', 'In Progress', 'Completed'];
    const currentIndex = statuses.indexOf(task.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    onStatusChange(task.id, nextStatus);
  };

  return (
    <div className="task-card">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="task-header">
          <h3 className="task-title">{task.title}</h3>
        </div>

        <p className="task-description">{task.description || 'No description provided.'}</p>

        <div className="task-badges">
          <span
            className={`badge ${getStatusBadgeClass(task.status)}`}
            style={{ cursor: 'pointer' }}
            title="Click to cycle status"
            onClick={cycleStatus}
          >
            {task.status === 'Completed' ? '✓ ' : '• '}
            {task.status}
          </span>

          <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
            {task.priority} Priority
          </span>
        </div>
      </div>

      <div className="task-footer">
        <div>
          {task.due_date ? (
            <span>📅 Due {formatDate(task.due_date)}</span>
          ) : (
            <span>No due date</span>
          )}
        </div>

        <div className="task-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(task.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
