import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NewCall({ onAdd }) {
  const [text, setText] = useState("");
  const [confidence, setConfidence] = useState(70);
  const [dueDate, setDueDate] = useState("");
  const [kind, setKind] = useState("task");

  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();

    if (!text.trim()) return;

    const newCall = {
      id: crypto.randomUUID(),
      text: text.trim(),
      confidence: Number(confidence),
      dueDate,
      createdAt: new Date().toISOString(),
      outcome: null,
      kind,
      stake: 0,
    };

    onAdd(newCall);
    navigate("/");
  }

  return (
    <form className="slip" onSubmit={handleSubmit}>
      <div className="slip-head">
        <span className="title">Make a call</span>
      </div>

      <div className="boxes">
        <label className="box tall">
          <span className="label">Selection</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </label>
      </div>

      <div className="boxes">
        <label className="box">
          <span className="label">Type</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="task">task</option>
            <option value="prediction">prediction</option>
          </select>
        </label>

        <label className="box">
          <span className="label">Odds %</span>
          <input
            type="number"
            min="1"
            max="99"
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
          />
        </label>

        <label className="box">
          <span className="label">Settles</span>
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>
      </div>

      <div className="actions">
        <button className="btn solid" type="submit">
          Place it
        </button>
        <Link className="btn" to="/">
          Cancel
        </Link>
      </div>
    </form>
  );
}