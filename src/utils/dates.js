export function formatDate(dateString) {
  if (!dateString) return "";
  return dateString.split("-").reverse().join("/");
}

export function isOverdue(call) {
  if (!call || call.outcome !== null || !call.dueDate) {
    return false;
  }

  // Today's local date as YYYY-MM-DD ("en-CA" happens to use that format).
  // toISOString() would use UTC, which can be a day behind just after midnight.
  const today = new Date().toLocaleDateString("en-CA");
  return call.dueDate < today;
}