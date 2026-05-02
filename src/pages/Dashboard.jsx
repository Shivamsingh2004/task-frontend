import { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/tasks/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">LOADING...</div>;
  if (!stats) return <div className="error-msg">FAILED TO LOAD DATA</div>;

  const getActivityIcon = (type) => {
    switch(type) {
      case 'project_created': return <span className="activity-icon">+</span>;
      case 'task_created': return <span className="activity-icon">+</span>;
      case 'task_status_changed': return <span className="activity-icon">!</span>;
      case 'task_completed': return <span className="activity-icon">√</span>;
      case 'member_added': return <span className="activity-icon">@</span>;
      default: return <span className="activity-icon">.</span>;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>HI, {user.name.toUpperCase()}</h1>
        <p>PROJECT OVERVIEW AND RECENT UPDATES.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>PROJECTS</h3>
          <div className="stat-value">{stats.totalProjects}</div>
        </div>
        <div className="stat-card">
          <h3>TASKS</h3>
          <div className="stat-value">{stats.totalTasks}</div>
        </div>
        <div className="stat-card">
          <h3>DONE</h3>
          <div className="stat-value">{stats.completedTasks}</div>
        </div>
        <div className="stat-card">
          <h3>OVERDUE</h3>
          <div className="stat-value" style={{ color: stats.overdueTasks > 0 ? '#dc3545' : '#000' }}>
            {stats.overdueTasks || 0}
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="dashboard-section">
            <h2>UPCOMING TASKS</h2>
            {stats.upcomingTasks && stats.upcomingTasks.length > 0 ? (
              <div className="task-list">
                {stats.upcomingTasks.map(task => (
                  <div key={task._id} className="task-item">
                    <h4>{task.title.toUpperCase()}</h4>
                    <div className="task-meta">
                      <span className="priority-badge">
                        {task.priority ? task.priority.toUpperCase() : 'MEDIUM'}
                      </span>
                      <span>PROJECT: {task.projectId ? task.projectId.name.toUpperCase() : 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">NO UPCOMING TASKS.</div>
            )}
          </div>

          <div className="dashboard-section">
            <h2>RECENTLY FINISHED</h2>
            {stats.recentlyCompleted && stats.recentlyCompleted.length > 0 ? (
              <div className="task-list">
                {stats.recentlyCompleted.map(task => (
                  <div key={task._id} className="task-item">
                    <h4>{task.title.toUpperCase()}</h4>
                    <div className="task-meta">
                      <span className="status-badge status-completed">DONE</span>
                      <span>BY: {task.completedBy ? task.completedBy.name.toUpperCase() : 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">NO RECENTLY FINISHED TASKS.</div>
            )}
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="dashboard-section">
            <h2>TEAM ACTIVITY</h2>
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="activity-feed">
                {stats.recentActivity.map(activity => (
                  <div key={activity._id} className="activity-item">
                    {getActivityIcon(activity.type)}
                    <div className="activity-content">
                      <div className="activity-text">
                        <strong>{activity.userId ? activity.userId.name.toUpperCase() : 'SYSTEM'}</strong> {activity.message.toUpperCase()}
                      </div>
                      <div className="activity-time">
                        {new Date(activity.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">NO ACTIVITY RECORDED.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
