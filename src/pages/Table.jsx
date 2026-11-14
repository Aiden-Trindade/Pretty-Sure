import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import LoadingCards from "../components/LoadingCards";
import { formatDate } from "../utils/dates";
import {
  tableDetails,
  createTableCall,
  placeBet,
  settleTableCall,
  inviteLink,
  getPools,
  bettingOpen,
  listenToTables,
} from "../utils/tables";
import useTitle from "../utils/useTitle";

// One table: who's at it, the calls on it, and the bets on each call
export default function Table({ account, balance = 0, onBank }) {
  const { id } = useParams();
  const me = account?.user?.id;
  const [details, setDetails] = useState(null); // null while loading
  const [error, setError] = useState("");
  useTitle(details?.table?.name ?? "Table");

  const load = useCallback(() => {
    return tableDetails(id)
      .then((data) => {
        setDetails(data);
        setError("");
      })
      .catch((err) => setError(err.message));
  }, [id]);

  // Load once, then again whenever anyone at the table bets, calls or joins
  useEffect(() => {
    if (!me) return;
    load();
    return listenToTables(`table-${id}`, () => {
      load();
      onBank?.();
    });
  }, [me, id, load, onBank]);

  if (!me) {
    return (
      <EmptyState
        suit="♣"
        title="Sign in to see this table"
        text="Tables are only visible to the friends sitting at them."
        to="/tables"
        action="Your tables"
      />
    );
  }

  if (error) return <p className="form-error on-felt">{error}</p>;
  if (!details) return <LoadingCards count={3} />;

  if (!details.table) {
    return (
      <EmptyState
        suit="♣"
        title="No such table"
        text="It doesn't exist, or you're not sitting at it. Ask a friend for the invite link."
        to="/tables"
        action="Your tables"
      />
    );
  }

  const { table, members, calls, bets } = details;
  const nameOf = (userId) =>
    userId === me ? "You" : members.find((m) => m.user_id === userId)?.name ?? "Someone";

  // After you do something, reload the table and the bank straight away
  // (realtime would catch it too, but this feels instant)
  function refresh() {
    load();
    onBank?.();
  }

  return (
    <>
      <div className="slip-head table-head">
        <span className="title">{table.name}</span>
        <InviteButton table={table} />
      </div>

      <p className="members">
        {members.map((m) => (
          <span key={m.user_id} className="member">
            {m.user_id === me ? "You" : m.name}
            {m.role === "owner" && (
              <svg className="host-icon" viewBox="0 0 16 16" role="img" aria-label="host">
                <path d="M2 12h12l1-8-4 3-3-5-3 5-4-3z" />
              </svg>
            )}
          </span>
        ))}
      </p>

      <NewTableCall tableId={table.id} members={members} me={me} onDone={refresh} />

      {calls.length === 0 ? (
        <EmptyState
          suit="♠"
          title="No calls on the table"
          text="Put one up above, about anyone sitting here."
        />
      ) : (
        calls.map((call) => (
          <TableCall
            key={call.id}
            call={call}
            bets={bets.filter((b) => b.call_id === call.id)}
            me={me}
            nameOf={nameOf}
            balance={balance}
            onDone={refresh}
          />
        ))
      )}

      <div className="actions">
        <Link className="btn on-felt" to="/tables">
          All tables
        </Link>
      </div>
    </>
  );
}

// Share the invite with the phone's share sheet, or copy it on a laptop
function InviteButton({ table }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = inviteLink(table);
    try {
      if (navigator.share) {
        await navigator.share({ title: `Join ${table.name} on Pretty Sure`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // closing the share sheet counts as an error; nothing to do
    }
  }

  return (
    <button className="btn invite-btn" type="button" onClick={share}>
      {copied ? "Link copied" : "Invite"}
    </button>
  );
}

function NewTableCall({ tableId, members, me, onDone }) {
  const [text, setText] = useState("");
  const [about, setAbout] = useState(me);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    try {
      await createTableCall(tableId, text.trim(), about, dueDate);
      setText("");
      setDueDate("");
      onDone();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <form className="slip" onSubmit={handleSubmit}>
      <div className="slip-head">
        <span className="title">Put a call up</span>
      </div>

      <div className="boxes">
        <label className="box tall">
          <span className="label">Selection</span>
          <textarea
            value={text}
            maxLength={200}
            placeholder="5K under 30 by Saturday"
            onChange={(e) => setText(e.target.value)}
            required
          />
        </label>
      </div>

      <div className="boxes">
        <label className="box">
          <span className="label">About</span>
          <select value={about} onChange={(e) => setAbout(e.target.value)}>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.user_id === me ? "Me" : m.name}
              </option>
            ))}
          </select>
        </label>

        <label className="box">
          <span className="label">Settles</span>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}
      <div className="actions">
        <button className="btn solid" type="submit" disabled={busy}>
          Put it up
        </button>
      </div>
    </form>
  );
}

function TableCall({ call, bets, me, nameOf, balance, onDone }) {
  const [stake, setStake] = useState(10);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const { forPool, againstPool } = getPools(bets);
  const mine = bets.find((b) => b.user_id === me);
  const open = call.outcome === null;
  const aboutMe = call.about === me;
  const isCaller = call.created_by === me;

  async function act(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
      onDone();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  function bet(side) {
    const amount = Math.floor(Number(stake));
    if (!(amount > 0)) return setError("Stake at least 1 chip.");
    if (amount > balance) return setError(`You only have ${balance} chips.`);
    act(() => placeBet(call.id, side, amount));
  }

  const resultClass = open ? "" : call.outcome ? " won" : " lost";

  return (
    <article className={`slip table-call${resultClass}`}>
      <div className="slip-head">
        <span className="label">On {nameOf(call.about)}</span>
        {!open && <span className="label">{call.outcome ? "It happened" : "It didn't"}</span>}
      </div>

      <p className="table-call-text">{call.text}</p>

      <div className="boxes">
        <div className="box">
          <span className="label">For</span>
          <span className="entry">{forPool}</span>
        </div>
        <div className="box">
          <span className="label">Against</span>
          <span className="entry">{againstPool}</span>
        </div>
        <div className="box">
          <span className="label">Settles</span>
          <span className="entry">{formatDate(call.due_date)}</span>
        </div>
      </div>

      {/* Who's on which side */}
      {bets.length > 0 && (
        <ul className="bettors">
          {bets.map((b) => (
            <li key={b.user_id}>
              <span className={b.side ? "side-for" : "side-against"}>
                {b.side ? "For" : "Against"}
              </span>{" "}
              {nameOf(b.user_id)} · {b.stake}
              {!open && b.change !== 0 && (
                <b className={b.change > 0 ? "up" : "down"}>
                  {" "}
                  {b.change > 0 ? `+${b.change}` : b.change}
                </b>
              )}
            </li>
          ))}
        </ul>
      )}

      {open && !mine && !bettingOpen(call) && (
        <p className="fine-print closed-note">Betting closed on the settle date.</p>
      )}

      {open && !mine && bettingOpen(call) && (
        <div className="bet-row">
          <label className="box stake-box">
            <span className="label">Stake</span>
            <input
              type="number"
              min="1"
              max={balance}
              value={stake}
              onChange={(e) => setStake(e.target.value)}
            />
          </label>
          <button className="btn solid" type="button" disabled={busy} onClick={() => bet(true)}>
            Back it
          </button>
          {!aboutMe && (
            <button className="btn" type="button" disabled={busy} onClick={() => bet(false)}>
              Bet against
            </button>
          )}
        </div>
      )}

      {open && isCaller && (
        <div className="actions">
          <button
            className="btn"
            type="button"
            disabled={busy}
            onClick={() => act(() => settleTableCall(call.id, true))}
          >
            It happened
          </button>
          <button
            className="btn"
            type="button"
            disabled={busy}
            onClick={() => act(() => settleTableCall(call.id, false))}
          >
            It didn't
          </button>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
    </article>
  );
}
