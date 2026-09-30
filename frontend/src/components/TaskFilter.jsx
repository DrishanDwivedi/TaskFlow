import React from 'react';

export const TaskFilter = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  onNewTask,
}) => {
  const statuses = ['All', 'To Do', 'In Progress', 'Completed'];

  return (
    <div className="filter-bar">
      <div className="filter-left">
        <input
          type="text"
          className="search-input"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <div className="status-tabs">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              className={`tab-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => onStatusChange(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <select
          className="select-input"
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
        >
          <option value="All">All Priorities</option>
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>
      </div>

      <button className="btn btn-primary" onClick={onNewTask}>
        + New Task
      </button>
    </div>
  );
};
