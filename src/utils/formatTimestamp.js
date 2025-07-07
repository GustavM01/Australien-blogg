export function formatTimestamp(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== "function") return "";

  const date = timestamp.toDate();
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) {
    return `Idag • ${time}`;
  } else if (isYesterday) {
    return `Igår • ${time}`;
  } else {
    return `${date.toLocaleDateString("sv-SE")} • ${time}`;
  }
}
