import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import './Projects.css';

function Projects() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', { name, description, startDate, deadline, priority });
      setProjects([res.data, ...projects]);
      setName('');
      setDescription('');
      setStartDate('');
      setDeadline('');
      setPriority('medium');
    } catch (err) {
      console.error(err);
      alert('ERROR CREATING PROJECT');
    }
  };

  if (loading) return <div className="loading">LOADING PROJECTS...</div>;

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>PROJECTS</h1>
      </div>

      {user.role === 'admin' && (
        <div className="create-project-card">
          <h2>NEW PROJECT</h2>
          <form onSubmit={handleCreate}>
            <div className="form-group form-group-full">
              <label>NAME</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="PROJECT NAME" />
            </div>
            <div className="form-group form-group-full">
              <label>DESCRIPTION</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
                placeholder="DESCRIPTION"
                style={{ width: '100%', padding: '12px', border: '1px solid #000', minHeight: '100px' }}
              />
            </div>
            <div className="form-group">
              <label>START DATE</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>DEADLINE</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="form-group form-group-full">
              <label>PRIORITY</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ border: '1px solid #000' }}>
                <option value="low">LOW</option>
                <option value="medium">MEDIUM</option>
                <option value="high">HIGH</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">LAUNCH PROJECT</button>
          </form>
        </div>
      )}

      <div className="projects-grid">
        {projects.map(project => (
          <div key={project._id} className="project-card">
            <div className="project-header">
              <h3>{project.name.toUpperCase()}</h3>
              <p>{project.description}</p>
            </div>

            <div className="project-badges">
              <span className={`badge badge-status-${project.status || 'active'}`}>
                {project.status ? project.status.replace('_', ' ').toUpperCase() : 'ACTIVE'}
              </span>
              <span className="badge">
                {project.priority ? project.priority.toUpperCase() : 'MEDIUM'}
              </span>
            </div>

            <div className="project-dates">
              {project.startDate && (
                <div>START: {new Date(project.startDate).toLocaleDateString()}</div>
              )}
              {project.deadline && (
                <div>END: {new Date(project.deadline).toLocaleDateString()}</div>
              )}
            </div>

            <div className="progress-container">
              <div className="progress-header">
                <span>PROGRESS</span>
                <span>{project.progress || 0}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${project.progress || 0}%` }}></div>
              </div>
            </div>

            <Link to={`/projects/${project._id}`} className="btn-view">
              OPEN
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;
