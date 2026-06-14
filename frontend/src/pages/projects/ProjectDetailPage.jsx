import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, updateProject } from '../../api/projectsApi';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await getProjectById(id);
        setProject(res.data);
        setForm(res.data);
      } catch (err) {
        setError('Project not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleUpdate = async () => {
    try {
      await updateProject(id, form);
      setProject(form);
      setEditing(false);
      setSuccess('Project updated successfully');
    } catch (err) {
      setError('Failed to update project');
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading project...</p>;
  if (error) return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <button onClick={() => navigate('/projects')} style={{ marginBottom: '1rem' }}>← Back to Projects</button>

      <h1>{project.name}</h1>
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {!editing ? (
        <div>
          <p><strong>Description:</strong> {project.description || '—'}</p>
          <p><strong>Status:</strong> {project.status}</p>
          <p><strong>Created:</strong> {new Date(project.created_at).toLocaleDateString()}</p>
          <button onClick={() => setEditing(true)} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
            Edit Project
          </button>
        </div>
      ) : (
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ display: 'block', marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
          />
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ display: 'block', marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
          />
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            style={{ display: 'block', marginBottom: '1rem', padding: '0.5rem' }}
          >
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleUpdate} style={{ padding: '0.5rem 1rem' }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}