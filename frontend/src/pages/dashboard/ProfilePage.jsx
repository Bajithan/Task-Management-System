import { useState } from "react";
import axios from "axios";
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ProfilePage() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async () => {
    setMessage(null);
    setError(null);

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/users/me`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>My Profile</h1>

      {/* User Info Card */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Account Information</h2>
        <div style={styles.infoRow}>
          <span style={styles.label}>Name</span>
          <span style={styles.value}>{user?.name || "—"}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Email</span>
          <span style={styles.value}>
          {user?.first_name && user?.last_name
          ? `${user.first_name} ${user.last_name}`
         : "—"}
       </span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Role</span>
          <span style={styles.roleBadge}>{user?.role || "—"}</span>
        </div>
      </div>

      {/* Password Change Card */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Change Password</h2>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.formGroup}>
          <label style={styles.label}>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={styles.input}
            placeholder="Enter current password"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input}
            placeholder="Enter new password"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            placeholder="Confirm new password"
          />
        </div>

        <button
          onClick={handlePasswordChange}
          disabled={loading}
          style={loading ? styles.buttonDisabled : styles.button}
        >
          {loading ? "Saving..." : "Change Password"}
        </button>
      </div>
    </div>
  );
}

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
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    maxWidth: "600px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#1e293b",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "12px",
  },
  label: {
    width: "120px",
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "500",
  },
  value: {
    fontSize: "15px",
    color: "#1e293b",
  },
  roleBadge: {
    backgroundColor: "#ede9fe",
    color: "#6d28d9",
    padding: "4px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "600",
  },
  formGroup: {
    marginBottom: "16px",
  },
  input: {
    display: "block",
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    marginTop: "6px",
    outline: "none",
    boxSizing: "border-box",
  },
  button: {
    backgroundColor: "#6366f1",
    color: "#ffffff",
    padding: "10px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
  buttonDisabled: {
    backgroundColor: "#a5b4fc",
    color: "#ffffff",
    padding: "10px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "not-allowed",
    marginTop: "8px",
  },
  success: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
};