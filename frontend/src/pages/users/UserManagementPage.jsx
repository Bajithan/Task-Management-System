import { useState, useEffect } from 'react';
import usersApi from '../../api/usersApi';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const ROLES = ['Admin', 'Project Manager', 'Collaborator'];

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'Collaborator',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getUsers(search, roleFilter);
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await usersApi.createUser(form);
      setSuccess('User created. Welcome email sent.');
      setShowModal(false);
      setForm({ first_name: '', last_name: '', email: '', role: 'Collaborator' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create user');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await usersApi.deactivateUser(userId);
      setSuccess('User deactivated');
      fetchUsers();
    } catch (err) {
      setError('Failed to deactivate user');
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar title="User Management" />
        <div style={styles.content}>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <div style={styles.toolbar}>
            <input
              style={styles.searchInput}
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              style={styles.select}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button
              style={styles.button}
              onClick={() => setShowModal(true)}
            >
              + Create User
            </button>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id} style={styles.tr}>
                    <td style={styles.td}>
                      {user.first_name} {user.last_name}
                    </td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>{user.role}</td>
                    <td style={styles.td}>
                      <span style={user.is_active ? styles.active : styles.inactive}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {user.is_active && (
                        <button
                          style={styles.deactivateBtn}
                          onClick={() => handleDeactivate(user.user_id)}
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} style={styles.empty}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Create New User</h3>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleCreate}>
              {['first_name', 'last_name', 'email'].map((field) => (
                <div key={field} style={styles.field}>
                  <label style={styles.label}>
                    {field.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </label>
                  <input
                    style={styles.input}
                    type={field === 'email' ? 'email' : 'text'}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    required
                  />
                </div>
              ))}

              <div style={styles.field}>
                <label style={styles.label}>Role</label>
                <select
                  style={styles.input}
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.button}>
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  layout: { display: 'flex', height: '100vh', overflow: 'hidden' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  content: { flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#f0f2f5' },
  toolbar: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  searchInput: {
    padding: '8px 12px', border: '1px solid #ddd',
    borderRadius: '4px', fontSize: '14px', flex: 1, minWidth: '200px',
  },
  select: {
    padding: '8px 12px', border: '1px solid #ddd',
    borderRadius: '4px', fontSize: '14px',
  },
  button: {
    padding: '8px 16px', backgroundColor: '#4f46e5',
    color: '#fff', border: 'none', borderRadius: '4px',
    cursor: 'pointer', fontSize: '14px',
  },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px' },
  th: { padding: '12px 16px', textAlign: 'left', backgroundColor: '#f8f9fa', fontSize: '13px', color: '#555' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#333' },
  empty: { padding: '24px', textAlign: 'center', color: '#999' },
  active: { color: '#16a34a', fontWeight: '500' },
  inactive: { color: '#dc2626', fontWeight: '500' },
  deactivateBtn: {
    padding: '4px 10px', backgroundColor: '#fee2e2',
    color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
  },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px 12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' },
  success: { backgroundColor: '#dcfce7', color: '#16a34a', padding: '10px 12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '440px' },
  modalTitle: { marginBottom: '20px', fontSize: '18px', color: '#1a1a2e' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
  cancelBtn: { padding: '8px 16px', backgroundColor: '#f0f0f0', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default UserManagementPage;