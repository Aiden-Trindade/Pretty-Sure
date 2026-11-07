import { Link } from "react-router-dom";
import { formatDate, isOverdue } from "../utils/dates";
import EmptyState from "../components/EmptyState";
import InstallCard from "../components/InstallCard";

export default function Home({ calls = [] }) {
  return (
    <>
      <div className="slip-head">
        <span className="title">Your calls</span>
      </div>

      {calls.length === 0 ? (
        <EmptyState
          suit="♥"
          color="red"
          title="Deal your first call"
          text="Say what you think will happen and how sure you are."
          to="/new"
          action="Make a call"
        />
      ) : (
        calls.map((call) => {
          const late = isOverdue(call);

          return (
            <Link
              to={`/p/${call.id}`}
              className={`slip${late ? " overdue" : ""}`}
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
                  <span className="entry">{formatDate(call.dueDate)}</span>
                </div>
              </div>
            </Link>
          );
        })
      )}

      <InstallCard />
    </>
  );
}