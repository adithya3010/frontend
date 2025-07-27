// components/StatusSummary.jsx
export default function StatusSummary({ statusCounts }) {
  return (
    <div>
      <h3>Status Summary:</h3>
      <ul>
        <li>Available: {statusCounts?.available || 0}</li>
        <li>Plugged In: {statusCounts?.['plugged in'] || 0}</li>
        <li>Faulty: {statusCounts?.faulty || 0}</li>
      </ul>
    </div>
  );
}
