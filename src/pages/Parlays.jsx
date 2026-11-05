import { useState } from "react";
import { getLegs, getParlayOutcome, getParlayReturn } from "../utils/parlays";

export default function Parlays({ calls = [], parlays = [], balance = 0, onAdd }) {
  const [picked, setPicked] = useState([]);
  const [stake, setStake] = useState(0);

  const openCalls = calls.filter((c) => c.outcome === null);

  function toggle(id) {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const selectedLegs = calls.filter((c) => picked.includes(c.id));
  const estimatedReturn = getParlayReturn(stake, selectedLegs);

  function handleSubmit(e) {
    e.preventDefault();
    if (picked.length < 2) return;

    const newParlay = {
      id: crypto.randomUUID(),
      legIds: picked,
      stake: Number(stake) || 0,
      createdAt: new Date().toISOString(),
    };

    onAdd(newParlay);
    setPicked([]);
    setStake(0);
  }

  return (
    <>
      {/* Builder Form Card */}
      {openCalls.length < 2 ? (
        <p className="fine-print">
          You need at least 2 open calls to build a parlay.
        </p>
      ) : (
        <form className="slip" onSubmit={handleSubmit}>
          <div className="slip-head">
            <span className="title">Build a parlay</span>
          </div>

          <div className="parlay-legs">
            {openCalls.map((call) => (
              <label className="leg" key={call.id}>
                <input
                  type="checkbox"
                  checked={picked.includes(call.id)}
                  onChange={() => toggle(call.id)}
                />
                <span className="entry">{call.text}</span>
                <span className="label">{call.confidence}%</span>
              </label>
            ))}
          </div>

          <div className="boxes">
            <label className="box">
              <span className="label">Stake</span>
              <input
                type="number"
                min="0"
                max={balance}
                value={stake}
                onChange={(e) => setStake(e.target.value)}
              />
            </label>

            <div className="box">
              <span className="label">To return</span>
              <span className="entry">{estimatedReturn}</span>
            </div>
          </div>

          <div className="actions">
            <button
              className="btn solid"
              type="submit"
              disabled={picked.length < 2}
            >
              Place parlay
            </button>
          </div>
        </form>
      )}

      {/* Parlays List */}
      {parlays.length > 0 && (
        <div className="parlay-list">
          {parlays.map((parlay) => {
            const legs = getLegs(parlay, calls);
            const payout = getParlayReturn(parlay.stake, legs);
            const outcome = getParlayOutcome(parlay, calls);

            const resultText =
              outcome === true ? "Won" : outcome === false ? "Lost" : "Open";

            return (
              <div className="slip" key={parlay.id}>
                <div className="slip-head">
                  <span className="label">Parlay</span>
                  <span
                    className={`result ${
                      outcome === true
                        ? "won"
                        : outcome === false
                        ? "lost"
                        : ""
                    }`}
                  >
                    {resultText}
                  </span>
                </div>

                <div className="boxes">
                  <div className="box">
                    <span className="label">Stake</span>
                    <span className="entry">{parlay.stake}</span>
                  </div>
                  <div className="box">
                    <span className="label">To return</span>
                    <span className="entry">{payout}</span>
                  </div>
                </div>

                <div className="parlay-legs">
                  {legs.map((leg) => (
                    <div className="parlay-leg" key={leg.id}>
                      <span className="entry">{leg.text}</span>
                      <span className="label">{leg.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}