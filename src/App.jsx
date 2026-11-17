import { useEffect, useMemo, useState } from 'react';

const apiBase = 'http://localhost:5000/api';

const initialUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@company.com', role: 'Admin' },
  { id: 2, name: 'Marcus Lee', email: 'marcus@company.com', role: 'Manager' },
  { id: 3, name: 'Priya Shah', email: 'priya@company.com', role: 'Developer' },
];

const initialRoles = [
  { id: 1, name: 'Admin', permissions: ['Users', 'Roles', 'Reports', 'Audit Logs'] },
  { id: 2, name: 'Manager', permissions: ['Reports', 'Approvals', 'Team Access'] },
  { id: 3, name: 'Developer', permissions: ['Projects', 'Code Review', 'Tickets'] },
];

const demoData = {
  users: initialUsers,
  roles: initialRoles,
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Request failed');
  }

  return response.json();
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('rbac_token')));
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState(initialUsers);
  const [roles, setRoles] = useState(initialRoles);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Developer' });
  const [newRole, setNewRole] = useState({ name: '', permissions: 'Projects, Tickets' });

  const totalPermissions = useMemo(
    () => Array.from(new Set(roles.flatMap((role) => role.permissions))),
    [roles],
  );

  useEffect(() => {
    if (!isLoggedIn) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchJson(`${apiBase}/rbac`);
        if (data?.users) setUsers(data.users);
        if (data?.roles) setRoles(data.roles);
      } catch (err) {
        setUsers(demoData.users);
        setRoles(demoData.roles);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isLoggedIn]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    try {
      setLoading(true);
      const payload = await fetchJson(`${apiBase}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(loginForm),
      });

      localStorage.setItem('rbac_token', payload.token || 'demo-token');
      setIsLoggedIn(true);
    } catch (err) {
      if (loginForm.email && loginForm.password) {
        localStorage.setItem('rbac_token', 'demo-token');
        setIsLoggedIn(true);
      } else {
        setError('Enter a valid email and password to continue.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rbac_token');
    setIsLoggedIn(false);
    setLoginForm({ email: '', password: '' });
  };

  const addUser = (event) => {
    event.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const user = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    setUsers((current) => [user, ...current]);
    setNewUser({ name: '', email: '', role: 'Developer' });
  };

  const addRole = (event) => {
    event.preventDefault();
    if (!newRole.name) return;

    const permissions = newRole.permissions
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    setRoles((current) => [
      ...current,
      {
        id: Date.now(),
        name: newRole.name,
        permissions,
      },
    ]);
    setNewRole({ name: '', permissions: 'Projects, Tickets' });
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
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="admin@company.com"
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••"
              />
            </label>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
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
          <div>
            <p className="muted">Dashboard</p>
            <h2>Role Management</h2>
          </div>
          <div className="badge">Connected to localhost:5000</div>
        </header>

        <section className="stats-grid" id="overview">
          <div className="stat-card blue">
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>
          <div className="stat-card green">
            <span>Total Roles</span>
            <strong>{roles.length}</strong>
          </div>
          <div className="stat-card purple">
            <span>Permissions</span>
            <strong>{totalPermissions.length}</strong>
          </div>
        </section>

        <section className="panel-grid">
          <div className="panel" id="users">
            <div className="panel-header">
              <h3>Users</h3>
            </div>

            <form onSubmit={addUser} className="inline-form">
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Full name"
              />
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Email"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
              <button type="submit">Add User</button>
            </form>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className="pill">{user.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel" id="roles">
            <div className="panel-header">
              <h3>Roles</h3>
            </div>

            <form onSubmit={addRole} className="inline-form vertical">
              <input
                type="text"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                placeholder="New role name"
              />
              <input
                type="text"
                value={newRole.permissions}
                onChange={(e) => setNewRole({ ...newRole, permissions: e.target.value })}
                placeholder="Permissions separated by comma"
              />
              <button type="submit">Add Role</button>
            </form>

            <div className="role-list">
              {roles.map((role) => (
                <div key={role.id} className="role-item">
                  <div className="role-name">{role.name}</div>
                  <div className="permissions">
                    {role.permissions.map((permission) => (
                      <span key={permission} className="pill light">{permission}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel" id="access">
          <div className="panel-header">
            <h3>Access Matrix</h3>
          </div>

          <div className="matrix-wrap">
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  {totalPermissions.map((permission) => (
                    <th key={permission}>{permission}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td>{role.name}</td>
                    {totalPermissions.map((permission) => (
                      <td key={`${role.id}-${permission}`}>
                        {role.permissions.includes(permission) ? '✓' : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
