import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend,
} from "recharts";
import { getDashboardSummary } from "../../api/dashboardApi";

// Colors for the pie chart slices
const PRIORITY_COLORS = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#ef4444",
};

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data when page loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardSummary();
        setSummary(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Show loading message while fetching
  if (loading) {
    return (
      <div style={styles.center}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Show error message if fetch failed
  if (error) {
    return (
      <div style={styles.center}>
        <p style={{ color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  // Prepare data for bar chart
  const barData = [
    { name: "To Do", count: summary.byStatus["To Do"] || 0 },
    { name: "In Progress", count: summary.byStatus["In Progress"] || 0 },
    { name: "Completed", count: summary.byStatus["Completed"] || 0 },
  ];

  // Prepare data for pie chart
  const pieData = Object.entries(summary.byPriority).map(
    ([name, value]) => ({ name, value })
  );

  // Prepare project progress list
  const projectList = Object.entries(summary.projectProgress).map(
    ([id, val]) => ({ id, ...val })
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Dashboard</h1>

      {/* Summary Cards */}
      <div style={styles.cardRow}>
        <SummaryCard
          label="Total Tasks"
          value={summary.summary.total}
          color="#6366f1"
        />
        <SummaryCard
          label="Completed"
          value={summary.summary.completed}
          color="#22c55e"
        />
        <SummaryCard
          label="In Progress"
          value={summary.summary.inProgress}
          color="#f59e0b"
        />
        <SummaryCard
          label="Overdue"
          value={summary.summary.overdue}
          color="#ef4444"
        />
      </div>

      {/* Charts Row */}
      <div style={styles.chartRow}>

        {/* Bar Chart - Tasks by Status */}
        <div style={styles.chartBox}>
          <h2 style={styles.chartTitle}>Tasks by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Tasks by Priority */}
        <div style={styles.chartBox}>
          <h2 style={styles.chartTitle}>Tasks by Priority</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {pieData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={PRIORITY_COLORS[entry.name] || "#8884d8"}
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Progress List */}
      <div style={styles.projectBox}>
        <h2 style={styles.chartTitle}>Project Progress</h2>
        {projectList.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          projectList.map((project) => {
            const percent =
              project.total > 0
                ? Math.round((project.completed / project.total) * 100)
                : 0;
            return (
              <div key={project.id} style={styles.projectRow}>
                <span style={styles.projectId}>Project {project.id}</span>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${percent}%`,
                    }}
                  />
                </div>
                <span style={styles.projectPercent}>{percent}%</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Reusable Summary Card Component
function SummaryCard({ label, value, color }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <p style={styles.cardLabel}>{label}</p>
      <p style={{ ...styles.cardValue, color }}>{value}</p>
    </div>
  );
}

// Styles
const styles = {
  container: {
    padding: "24px",
    fontFamily: "sans-serif",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "24px",
    color: "#1e293b",
  },
  cardRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "32px",
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px 24px",
    flex: "1",
    minWidth: "150px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  cardLabel: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "8px",
  },
  cardValue: {
    fontSize: "36px",
    fontWeight: "700",
  },
  chartRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "32px",
    flexWrap: "wrap",
  },
  chartBox: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    flex: "1",
    minWidth: "300px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  chartTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#1e293b",
  },
  projectBox: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  projectRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  projectId: {
    width: "100px",
    fontSize: "14px",
    color: "#475569",
  },
  progressBar: {
    flex: "1",
    height: "10px",
    backgroundColor: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: "999px",
    transition: "width 0.3s ease",
  },
  projectPercent: {
    width: "40px",
    fontSize: "14px",
    color: "#475569",
    textAlign: "right",
  },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
};