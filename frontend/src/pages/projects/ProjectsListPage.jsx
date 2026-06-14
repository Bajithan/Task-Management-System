import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProjects, createProject, deleteProject } from '../../api/projectsApi';

export default function ProjectsListPage() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', status: 'Planning' });
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await getAllProjects();
      setProjects(res.data || []);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    try {
      await createProject(newProject);
      setShowForm(false);
      setNewProject({ name: '', description: '', status: 'Planning' });
      fetchProjects();
    } catch (err) {
      setError('Failed to create project');
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(projectId);
      fetchProjects();
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <p style={{ padding: '2rem' }}>Loading projects...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Projects</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem', flex: 1 }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.5rem' }}>
          <option value="">All Statuses</option>
          <option value="Planning">Planning</option>
          <option value="Active">Active</option>
          <option value="On Hold">On Hold</option>
          <option value="Completed">Completed</option>
        </select>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '0.5rem 1rem' }}>
          + Create Project
        </button>
      </div>

      {showForm && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
          <h3>New Project</h3>
          <input
            placeholder="Project name"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            style={{ display: 'block', marginBottom: '0.5rem', padding: '0.5rem', width: '100%' }}
          />
          <textarea
            placeholder="Description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            style={{ display: 'block', marginBottom: '0.5rem', padding: '0.5rem', width: '100%' }}
          />
          <select
            value={newProject.status}
            onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
            style={{ marginBottom: '0.5rem', padding: '0.5rem' }}
          >
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleCreate} style={{ padding: '0.5rem 1rem' }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem' }}>Name</th>
            <th style={{ padding: '0.75rem' }}>Description</th>
            <th style={{ padding: '0.75rem' }}>Status</th>
            <th style={{ padding: '0.75rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={4} style={{ padding: '1rem' }}>No projects found.</td></tr>
          ) : (
            filtered.map((project) => (
              <tr key={project.project_id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>{project.name}</td>
                <td style={{ padding: '0.75rem' }}>{project.description || '—'}</td>
                <td style={{ padding: '0.75rem' }}>{project.status}</td>
                <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => navigate(`/projects/${project.project_id}`)}>View</button>
                  <button onClick={() => handleDelete(project.project_id)} style={{ color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}