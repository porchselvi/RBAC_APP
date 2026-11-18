import { useEffect, useMemo, useState } from 'react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const emptyUsers = [];
const emptyRoles = [];

const fetchJson = async (path, options = {}) => {
  const token = localStorage.getItem('rbac_token');
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof body === 'string' ? body : body.message || body.error || 'Request failed';
    throw new Error(message);
  }
  return body;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('rbac_token')));
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState(emptyUsers);
  const [roles, setRoles] = useState(emptyRoles);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'DEVELOPER' });
  const [newRole, setNewRole] = useState({ name: '', permissions: 'Projects, Tickets' });

  const totalPermissions = useMemo(
    () => Array.from(new Set(roles.flatMap((role) => role.permissions))),
    [roles],
  );

  const loadData = async () => {
    const data = await fetchJson('/rbac');
    setUsers(data.users || []);
    setRoles(data.roles || []);
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    loadData()
      .catch((err) => {
        setError(`Could not load RBAC data: ${err.message}. Check that the backend is running at ${apiBase}.`);
        if (err.message.includes('403') || err.message.includes('401')) {
          localStorage.removeItem('rbac_token');
          setIsLoggedIn(false);
        }
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = await fetchJson('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      });
      localStorage.setItem('rbac_token', payload.token);
      setIsLoggedIn(true);
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials and backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rbac_token');
    setIsLoggedIn(false);
    setUsers([]);
    setRoles([]);
    setLoginForm({ email: '', password: '' });
    setError('');
  };

  const addUser = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await fetchJson('/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      });
      setNewUser({ name: '', email: '', password: '', role: roles[0]?.name || 'USER' });
      await loadData();
    } catch (err) {
      setError(`Could not create user: ${err.message}`);
    }
  };

  const addRole = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const permissions = newRole.permissions.split(',').map((item) => item.trim()).filter(Boolean);
      await fetchJson('/roles', {
        method: 'POST',
        body: JSON.stringify({ name: newRole.name, permissions }),
      });
      setNewRole({ name: '', permissions: 'Projects, Tickets' });
      await loadData();
    } catch (err) {
      setError(`Could not create role: ${err.message}`);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="brand-block">
            <span className="eyebrow">Access Control</span>
            <h1>RBAC Admin</h1>
            <p>Secure role-based management for your organization.</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <h2>Login</h2>
            <label>
              <span>Email</span>
              <input type="email" required autoComplete="username" value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="admin@company.com" />
            </label>
            <label>
              <span>Password</span>
              <input type="password" required autoComplete="current-password" value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="Your password" />
            </label>
            {error && <p className="error-text" role="alert">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
            <p className="login-hint">Local development default: admin@company.com / ChangeMe123!</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="logo">RBAC</div>
        <nav>
          <a className="active" href="#overview">Overview</a>
          <a href="#users">Users</a>
          <a href="#roles">Roles</a>
          <a href="#access">Access</a>
        </nav>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div><p className="muted">Dashboard</p><h2>Role Management</h2></div>
          <div className="badge">API: {apiBase}</div>
        </header>
        {error && <p className="error-banner" role="alert">{error}</p>}
        {loading && <p className="muted">Loading RBAC data…</p>}
        <section className="stats-grid" id="overview">
          <div className="stat-card blue"><span>Total Users</span><strong>{users.length}</strong></div>
          <div className="stat-card green"><span>Total Roles</span><strong>{roles.length}</strong></div>
          <div className="stat-card purple"><span>Permissions</span><strong>{totalPermissions.length}</strong></div>
        </section>
        <section className="panel-grid">
          <div className="panel" id="users">
            <div className="panel-header"><h3>Users</h3></div>
            <form onSubmit={addUser} className="inline-form user-form">
              <input required type="text" value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Full name" />
              <input required type="email" value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="Email" />
              <input required minLength="8" type="password" value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Temporary password" />
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                {roles.map((role) => <option key={role.id} value={role.name}>{role.name}</option>)}
              </select>
              <button type="submit">Add User</button>
            </form>
            <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
              <tbody>{users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td>
                <td><span className="pill">{user.role}</span></td></tr>)}</tbody>
            </table></div>
          </div>
          <div className="panel" id="roles">
            <div className="panel-header"><h3>Roles</h3></div>
            <form onSubmit={addRole} className="inline-form vertical">
              <input required type="text" value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} placeholder="New role name" />
              <input required type="text" value={newRole.permissions}
                onChange={(e) => setNewRole({ ...newRole, permissions: e.target.value })}
                placeholder="Permissions separated by comma" />
              <button type="submit">Add Role</button>
            </form>
            <div className="role-list">{roles.map((role) => <div key={role.id} className="role-item">
              <div className="role-name">{role.name}</div><div className="permissions">
                {role.permissions.map((permission) => <span key={permission} className="pill light">{permission}</span>)}
              </div></div>)}</div>
          </div>
        </section>
        <section className="panel" id="access">
          <div className="panel-header"><h3>Access Matrix</h3></div>
          <div className="matrix-wrap"><table><thead><tr><th>Role</th>
            {totalPermissions.map((permission) => <th key={permission}>{permission}</th>)}</tr></thead>
            <tbody>{roles.map((role) => <tr key={role.id}><td>{role.name}</td>
              {totalPermissions.map((permission) => <td key={`${role.id}-${permission}`}>
                {role.permissions.includes(permission) ? '✓' : '—'}</td>)}</tr>)}</tbody>
          </table></div>
        </section>
      </main>
    </div>
  );
}

export default App;
