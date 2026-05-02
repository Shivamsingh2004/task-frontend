import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import './ProjectDetail.css';

function ProjectDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  
  const [memberEmail, setMemberEmail] = useState('');

  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      setStatus(res.data.status || 'active');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${id}`, { status });
      fetchProject();
    } catch (err) {
      console.error(err);
      alert('ERROR UPDATING STATUS');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title: taskTitle,
        description: taskDesc,
        projectId: id,
        assignedTo: taskAssignee || null,
        priority: taskPriority
      });
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignee('');
      setTaskPriority('medium');
      fetchProject();
    } catch (err) {
      console.error(err);
      alert('ERROR ADDING TASK');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/add-member`, { email: memberEmail });
      setMemberEmail('');
      fetchProject();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'ERROR ADDING MEMBER');
    }
  };

  const handleMarkDone = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'done' ? 'todo' : 'done';
      await api.put(`/tasks/${taskId}`, {
        status: newStatus
      });
      fetchProject();
    } catch(err) {
      console.error(err);
      alert('ERROR UPDATING TASK');
    }
  };

  if (loading) return <div className="loading">LOADING DETAILS...</div>;
  if (!project) return <div className="error-msg">PROJECT NOT FOUND</div>;

  return (
    <div className="project-detail-container">
      <div className="pd-header">
        <h1>{project.name.toUpperCase()}</h1>
        <p>{project.description.toUpperCase()}</p>
        
        <div className="pd-meta">
          <div className="meta-item">
            <span className="badge">{project.status ? project.status.replace('_', ' ').toUpperCase() : 'ACTIVE'}</span>
          </div>
          <div className="meta-item">
            <span className="badge">{project.priority ? project.priority.toUpperCase() : 'MEDIUM'}</span>
          </div>
          <div className="meta-item">
            <span className="badge">{project.progress || 0}% DONE</span>
          </div>
        </div>
      </div>

      <div className="pd-content">
        <div className="pd-main">
          {user.role === 'admin' && (
            <div className="pd-section">
              <h2>STATUS</h2>
              <form onSubmit={handleUpdateStatus} className="inline-form" style={{ display: 'flex', gap: '10px' }}>
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ flex: 1, border: '1px solid #000' }}>
                  <option value="active">ACTIVE</option>
                  <option value="on_hold">ON HOLD</option>
                  <option value="completed">COMPLETED</option>
                </select>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 20px' }}>UPDATE</button>
              </form>
            </div>
          )}

          <div className="pd-section">
            <h2>TASKS</h2>
            
            {user.role === 'admin' && (
              <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #000' }}>
                <h3>NEW TASK</h3>
                <form onSubmit={handleAddTask}>
                  <div className="form-group">
                    <input type="text" value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} required placeholder="TITLE" style={{ border: '1px solid #000' }} />
                  </div>
                  <div className="form-group">
                    <input type="text" value={taskDesc} onChange={e=>setTaskDesc(e.target.value)} placeholder="DESCRIPTION" style={{ border: '1px solid #000' }} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                    <select value={taskAssignee} onChange={e=>setTaskAssignee(e.target.value)} style={{ flex: 1, border: '1px solid #000' }}>
                      <option value="">ASSIGN TO</option>
                      {project.members && project.members.map(m => (
                        <option key={m._id} value={m._id}>{m.name.toUpperCase()}</option>
                      ))}
                    </select>
                    <select value={taskPriority} onChange={e=>setTaskPriority(e.target.value)} style={{ flex: 1, border: '1px solid #000' }}>
                      <option value="low">LOW</option>
                      <option value="medium">MEDIUM</option>
                      <option value="high">HIGH</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary">ADD TASK</button>
                </form>
              </div>
            )}

            <div className="task-list">
              {project.tasks && project.tasks.map(task => {
                const isAssignedToMe = task.assignedTo && task.assignedTo._id === user.userId;
                const isCompleted = task.status === 'done';

                return (
                  <div key={task._id} className={`task-item ${isCompleted ? 'task-completed' : ''}`} style={{ border: '1px solid #000', marginBottom: '10px', padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>{task.title.toUpperCase()}</h4>
                        <p style={{ fontSize: '0.9rem' }}>{task.description}</p>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        <span className="badge">{task.priority.toUpperCase()}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>
                        {task.assignedTo ? task.assignedTo.name.toUpperCase() : 'UNASSIGNED'}
                      </span>
                      {(user.role === 'admin' || isAssignedToMe) && (
                        <button className="btn-mark-done" onClick={() => handleMarkDone(task._id, task.status)}>
                          {isCompleted ? 'REOPEN' : 'MARK DONE'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pd-sidebar">
          <div className="pd-section">
            <h2>MEMBERS</h2>
            {user.role === 'admin' && (
              <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                <input type="email" value={memberEmail} onChange={e=>setMemberEmail(e.target.value)} required placeholder="EMAIL" style={{ flex: 1, border: '1px solid #000' }} />
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 10px' }}>+</button>
              </form>
            )}
            <div>
              {project.members && project.members.map(m => (
                <div key={m._id} className="member-item" style={{ border: '1px solid #000', padding: '10px', marginBottom: '5px' }}>
                  <strong>{m.name.toUpperCase()}</strong>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pd-section">
            <h2>LOG</h2>
            <div style={{ fontSize: '0.8rem' }}>
              {project.activities && project.activities.map(act => (
                <div key={act._id} style={{ marginBottom: '10px', borderBottom: '1px solid #eee' }}>
                  <strong>{act.userId ? act.userId.name.toUpperCase() : 'SYSTEM'}</strong> {act.message.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
