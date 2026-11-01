import { Link } from "react-router-dom";

export default function Home({ calls = [] }) {
  return (
    <>
      <div className="slip-head">
        <span className="title">Your calls</span>
      </div>

      {calls.length === 0 ? (
        <p className="fine-print">
          No calls yet. <Link to="/new">Make one</Link>
        </p>
      ) : (
        calls.map((call) => {
          const formattedDate = call.dueDate
            ? call.dueDate.split("-").reverse().join("/")
            : "";

          return (
            <Link
              to={`/p/${call.id}`}
              className="slip"
              key={call.id}
            >
              <div className="boxes">
                <div className="box tall">
                  <span className="label">Selection</span>
                  <span className="entry">{call.text}</span>
                </div>

                <div className="box">
                  <span className="label">Odds</span>
                  <span className="entry">{call.confidence}%</span>
                </div>

                <div className="box">
                  <span className="label">Settles</span>
                  <span className="entry">{formattedDate}</span>
                </div>
              </div>
            </Link>
          );
        })
      )}
    </>
  );
}