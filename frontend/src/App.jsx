import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { TaskFilter } from './components/TaskFilter';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { api, getAuthToken, removeAuthToken } from './api/client';

export function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Check logged in user profile on load
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getProfile()
        .then((res) => {
          setUser(res.user);
          loadTasks();
        })
        .catch(() => {
          removeAuthToken();
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.getTasks();
      setTasks(res.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    loadTasks();
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    setTasks([]);
  };

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      await api.updateTask(editingTask.id, taskData);
    } else {
      await api.createTask(taskData);
    }
    await loadTasks();
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.deleteTask(id);
        setTasks(tasks.filter((t) => t.id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete task.');
      }
    }
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    const targetTask = tasks.find((t) => t.id === id);
    if (!targetTask) return;

    // Optimistic UI update
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));

    try {
      await api.updateTask(id, { ...targetTask, status: newStatus });
    } catch (err) {
      // Revert if error
      loadTasks();
    }
  };

  // Filter tasks locally based on search text and dropdowns
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="app-container">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
      />

      <main className="main-content">
        {!user ? (
          <div className="welcome-hero">
            <h1 className="welcome-title">Streamline Your Team's Productivity</h1>
            <p className="welcome-subtitle">
              TaskFlow is a lightweight, responsive task management system. Organize tasks, track priorities, and get things done efficiently.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => handleOpenAuth('register')}>
                Get Started Free
              </button>
              <button className="btn btn-secondary" onClick={() => handleOpenAuth('login')}>
                Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
            <Dashboard tasks={tasks} />

            <TaskFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityChange={setPriorityFilter}
              onNewTask={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
            />

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Loading tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <h3>No tasks found</h3>
                <p>
                  {tasks.length === 0
                    ? "You haven't created any tasks yet. Click '+ New Task' to get started!"
                    : "No tasks match your current filters."}
                </p>
                {tasks.length === 0 && (
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                    onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
                  >
                    + Create Your First Task
                  </button>
                )}
              </div>
            ) : (
              <div className="tasks-grid">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleQuickStatusChange}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        task={editingTask}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
      />
    </div>
  );
}

export default App;
