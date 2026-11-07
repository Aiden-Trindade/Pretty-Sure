import { Link } from "react-router-dom";

export default function EmptyState({ suit, title, text, to, action, color = "black" }) {
  return (
    <div className="slip empty">
      <span className={`empty-suit ${color}`}>{suit}</span>
      <span className="title">{title}</span>
      <p className="fine-print">{text}</p>
      {to && action && (
        <Link to={to} className="btn solid">
          {action}
        </Link>
      )}
    </div>
  );
}