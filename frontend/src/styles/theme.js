export const theme = {
  color: {
    bg: '#F8F9FB',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    borderStrong: '#D1D5DB',
    ink: '#18181B',
    inkSoft: '#6B7280',
    inkFaint: '#9CA3AF',
    accent: '#6366F1',
    accentSoft: '#EEF2FF',
    success: '#16A34A',
    successSoft: '#F0FDF4',
    warning: '#D97706',
    warningSoft: '#FFFBEB',
    danger: '#DC2626',
    dangerSoft: '#FEF2F2',
    sidebar: '#14151A',
    sidebarBorder: 'rgba(255,255,255,0.06)',
    sidebarText: 'rgba(255,255,255,0.55)',
    sidebarActive: 'rgba(255,255,255,0.08)',
  },
  font: {
    body: '"Inter", -apple-system, sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  radius: { sm: '6px', md: '8px', lg: '10px' },
};

export const priorityColor = (p) => {
  if (p === 'High') return theme.color.danger;
  if (p === 'Medium') return theme.color.warning;
  return theme.color.success;
};

export const statusColor = (s) => {
  if (s === 'Completed') return theme.color.success;
  if (s === 'In Progress') return theme.color.accent;
  return theme.color.inkSoft;
};