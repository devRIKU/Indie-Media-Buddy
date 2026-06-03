export function formatViews(n?: number): string {
  if (!n) return "—";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + " min ago";
  if (diff < 86400) return Math.floor(diff / 3600) + " hr ago";
  if (diff < 86400 * 7) return Math.floor(diff / 86400) + " days ago";
  if (diff < 86400 * 30) return Math.floor(diff / (86400 * 7)) + " weeks ago";
  if (diff < 86400 * 365) return Math.floor(diff / (86400 * 30)) + " months ago";
  return Math.floor(diff / (86400 * 365)) + " years ago";
}

export function pad(n: number) {
  return n < 10 ? "0" + n : String(n);
}

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}
