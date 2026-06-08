import React from 'react';

const UserManagementPage = () => {
  // Temporary mock data matching your backend requirements
  const mockUsers = [
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
    { id: 2, name: 'Regular Employee', email: 'user@example.com', role: 'User' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h2>User Management Dashboard</h2>
      <p>Manage application user credentials, security settings, and access roles here.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Email</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Role</th>
          </tr>
        </thead>
        <tbody>
          {mockUsers.map((user) => (
            <tr key={user.id}>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{user.id}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{user.name}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{user.email}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                <span style={{ padding: '0.25rem 0.5rem', backgroundColor: user.role === 'Admin' ? '#ffccd5' : '#e2e2e2', borderRadius: '4px' }}>
                  {user.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementPage;