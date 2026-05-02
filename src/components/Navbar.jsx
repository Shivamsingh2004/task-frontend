import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">TASK MANAGER</Link>
      </div>
      {user && (
        <div className="navbar-links">
          <Link to="/">DASHBOARD</Link>
          <Link to="/projects">PROJECTS</Link>
          <Link to="/my-tasks">MY TASKS</Link>
          <div className="navbar-user">
            <span>{user.name.toUpperCase()}</span>
            <span className={`user-role role-${user.role}`}>{user.role.toUpperCase()}</span>
            <button onClick={handleLogout} className="btn-logout">LOGOUT</button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
