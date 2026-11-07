import { getSettled, getWinRate, getCalibration } from "../utils/stats";
import CalibrationChart from "../components/CalibrationChart";
import EmptyState from "../components/EmptyState";

export default function Stats({ calls = [], balance = 0 }) {
  const settled = getSettled(calls);
  const wonCount = settled.filter((c) => c.outcome === true).length;
  const lostCount = settled.filter((c) => c.outcome === false).length;
  const overallWinRate = getWinRate(calls);

  const calibration = getCalibration(calls).filter((range) => range.count > 0);

  return (
    <>
      {/* First Card: Record Overview */}
      <div className="slip">
        <div className="slip-head">
          <span className="title">Your record</span>
        </div>

        <div className="boxes">
          <div className="box">
            <span className="label">Balance</span>
            <span className="entry">{balance}</span>
          </div>

          <div className="box">
            <span className="label">Won</span>
            <span className="entry">{wonCount}</span>
          </div>

          <div className="box">
            <span className="label">Lost</span>
            <span className="entry">{lostCount}</span>
          </div>

          <div className="box">
            <span className="label">Win rate</span>
            <span className="entry">{overallWinRate}%</span>
          </div>
        </div>
      </div>

      {settled.length === 0 ? (
        <EmptyState
          suit="♣"
          title="Nothing to measure yet"
          text="Settle some calls to see how accurate your confidence is."
          to="/"
          action="Back to your calls"
        />
      ) : (
        <div className="slip">
          <div className="slip-head">
            <span className="title">Are you as sure as you say?</span>
          </div>

          <CalibrationChart calibration={calibration} />

          {calibration.map((range) => (
            <div className="boxes" key={range.min}>
              <div className="box">
                <span className="label">You said</span>
                <span className="entry">
                  {range.min}–{range.max}%
                </span>
              </div>

              <div className="box">
                <span className="label">You won</span>
                <span className="entry">{range.winRate}%</span>
              </div>

              <div className="box">
                <span className="label">Calls</span>
                <span className="entry">{range.count}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}