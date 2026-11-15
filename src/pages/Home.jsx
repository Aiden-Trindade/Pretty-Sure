import { Link } from "react-router-dom";
import { formatDate, isOverdue } from "../utils/dates";
import EmptyState from "../components/EmptyState";
import InstallCard from "../components/InstallCard";
import AccountCard from "../components/AccountCard";
import useTitle from "../utils/useTitle";

export default function Home({ calls = [], account }) {
  useTitle("Your calls");
  const open = calls.filter((call) => call.outcome === null);
  const settled = calls.filter((call) => call.outcome !== null);

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
        <>
          {open.map((call) => (
            <CallCard call={call} key={call.id} />
          ))}

          {/* Settled calls go in their own pile, under the ones still in play */}
          {settled.length > 0 && (
            <div className="slip-head">
              <span className="title">Settled</span>
            </div>
          )}
          {settled.map((call) => (
            <CallCard call={call} key={call.id} />
          ))}
        </>
      )}

      <AccountCard account={account} />
      <InstallCard />
    </>
  );
}
// One call as a small card. Settled ones are stamped Won or Lost.
function CallCard({ call }) {
  const late = isOverdue(call);
  const result = call.outcome === null ? "" : call.outcome ? " won" : " lost";

  return (
    <Link to={`/p/${call.id}`} className={`slip${late ? " overdue" : ""}${result}`}>
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
}
