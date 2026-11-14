import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import NotFound from "./NotFound";
import { getReturn } from "../utils/points";
import { formatDate } from "../utils/dates";
import useTitle from "../utils/useTitle";

export default function Call({ calls = [], onSettle, onDelete, balance = 0 }) {
  const { id } = useParams();
  const call = calls.find((c) => c.id === id);
  useTitle(call ? call.text : "Not found");

  const navigate = useNavigate();

  // Only true right after a click, so the animation doesn't replay on every visit
  const [justSettled, setJustSettled] = useState(false);

  if (!call) {
    return <NotFound />;
  }

  const settled = call.outcome !== null;

  function handleDelete() {
    if (!window.confirm("Delete this call? It's gone from every device and can't be undone.")) return;
    onDelete(call.id);
    navigate("/");
  }

  function handleSettle(outcome) {
    setJustSettled(true);
    onSettle(call.id, outcome);
  }

  const flipClass =
    "card-flip" +
    (settled ? " flipped" : "") +
    (justSettled ? " flipping" : "") +
    (settled ? (call.outcome ? " won" : " lost") : "");

  const payout = getReturn(call);
  const alreadyChained = calls.some((c) => c.parentId === call.id);

  const canDoubleOrNothing =
    call.outcome === true &&
    payout > 0 &&
    payout <= balance &&
    !alreadyChained;

  return (
    <div className={flipClass}>
      {/* Front Face */}
      <div className="card-face front slip">
        <div className="slip-head">
          <span className="label">Call</span>
          <span className="label">{call.kind}</span>
        </div>

        <div className="boxes">
          <div className="box tall">
            <span className="label">Selection</span>
            <span className="entry">{call.text}</span>
          </div>
        </div>

        <div className="boxes">
          <div className="box">
            <span className="label">Odds</span>
            <span className="entry">{call.confidence}%</span>
          </div>
          <div className="box">
            <span className="label">Stake</span>
            <span className="entry">{call.stake ?? 0}</span>
          </div>
          <div className="box">
            <span className="label">To return</span>
            <span className="entry">{payout}</span>
          </div>
          <div className="box">
            <span className="label">Settles</span>
            <span className="entry">{formatDate(call.dueDate)}</span>
          </div>
        </div>

        <div className="actions">
          <button
            className="btn solid"
            type="button"
            onClick={() => handleSettle(true)}
          >
            Won
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => handleSettle(false)}
          >
            Lost
          </button>
        </div>

        <button className="link-btn delete-btn" type="button" onClick={handleDelete}>
          Delete call
        </button>
      </div>

      {/* Back Face */}
      <div className="card-face back slip">
        <span className="label">Settled</span>
        <span className={`result ${call.outcome ? "won" : "lost"}`}>
          {call.outcome ? "Won" : "Lost"}
        </span>
        <span className="entry">{call.text}</span>

        {canDoubleOrNothing && (
          <Link className="btn solid" to={`/new?from=${call.id}`}>
            Double or nothing
          </Link>
        )}

        <Link className="btn" to="/">
          Back to your calls
        </Link>

        <button className="link-btn delete-btn" type="button" onClick={handleDelete}>
          Delete call
        </button>
      </div>
    </div>
  );
}