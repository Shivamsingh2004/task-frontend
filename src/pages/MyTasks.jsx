import { useState, useEffect } from 'react';
import api from '../api';
import './MyTasks.css';

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks/my-tasks');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'done' ? 'todo' : 'done';
      await api.put(`/tasks/${taskId}`, {
        status: newStatus
      });
      fetchTasks();
    } catch(err) {
      console.error(err);
      alert('ERROR UPDATING TASK');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status !== 'done';
    return task.status === filter;
  });

  if (loading) return <div className="loading">LOADING YOUR TASKS...</div>;

  return (
    <div className="mytasks-container">
      <div className="mytasks-header">
        <h1>MY TASKS</h1>
        <p>WORK ASSIGNED TO YOU.</p>
      </div>

      <div className="task-filters" style={{ marginBottom: '30px' }}>
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>ALL</button>
        <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>PENDING</button>
        <button className={`filter-btn ${filter === 'done' ? 'active' : ''}`} onClick={() => setFilter('done')}>DONE</button>
      </div>

      <div className="mytasks-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">NO TASKS FOUND.</div>
        ) : (
          filteredTasks.map(task => {
            const isCompleted = task.status === 'done';
            return (
              <div key={task._id} className={`my-task-card ${isCompleted ? 'completed' : ''}`} style={{ border: '2px solid #000', padding: '20px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>{task.title.toUpperCase()}</h3>
                  <p style={{ color: '#555', margin: '5px 0' }}>{task.projectId ? task.projectId.name.toUpperCase() : 'N/A'}</p>
                  <span className="badge">{task.priority ? task.priority.toUpperCase() : 'MEDIUM'}</span>
                </div>
                <button className="btn-mark-done" onClick={() => handleMarkDone(task._id, task.status)}>
                  {isCompleted ? 'REOPEN' : 'DONE'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default MyTasks;
