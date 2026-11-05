import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getReturn } from "../utils/points";

export default function NewCall({ onAdd, balance, calls = [] }) {
  const [searchParams] = useSearchParams();
  const parent = calls.find((c) => c.id === searchParams.get("from"));

  const [text, setText] = useState("");
  const [confidence, setConfidence] = useState(70);
  const [dueDate, setDueDate] = useState("");
  const [kind, setKind] = useState("task");
  const [stake, setStake] = useState(parent ? getReturn(parent) : 0);

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
      stake: Number(stake) || 0,
      parentId: parent ? parent.id : null,
    };

    onAdd(newCall);
    navigate("/");
  }

  return (
    <form className="slip" onSubmit={handleSubmit}>
      <div className="slip-head">
        <span className="title">
          {parent ? "Double or nothing" : "Make a call"}
        </span>
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
            max="100"
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
          />
        </label>

        <label className="box">
          <span className="label">Stake</span>
          <input
            type="number"
            min="0"
            max={balance}
            readOnly={Boolean(parent)}
            value={stake}
            onChange={(e) => setStake(e.target.value)}
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