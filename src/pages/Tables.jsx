import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import LoadingCards from "../components/LoadingCards";
import { myTables, createTable } from "../utils/tables";
import useTitle from "../utils/useTitle";

// Your tables of friends, and a way to start a new one
export default function Tables({ account }) {
  useTitle("Friends");
  const userId = account?.user?.id;
  const [tables, setTables] = useState(null); // null while loading
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    myTables()
      .then((rows) => !cancelled && setTables(rows))
      .catch((err) => !cancelled && setError(err.message));

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!account?.available || !userId) {
    return (
      <div className="slip empty">
        <span className="empty-suit black">♣</span>
        <span className="title">Play with friends</span>
        <p className="fine-print">
          Sit at a table with friends, put calls on each other, and bet for or
          against. Sign in first so they know it's you.
        </p>
        {account?.available && (
          <div className="actions">
            <button className="btn solid" type="button" onClick={account.onSignIn}>
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    );
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      const id = await createTable(name.trim());
      navigate(`/t/${id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <>
      <div className="slip-head">
        <span className="title">Your tables</span>
      </div>

      {tables === null && !error && <LoadingCards count={1} />}

      {tables?.length === 0 && (
        <EmptyState
          suit="♣"
          title="No tables yet"
          text="Start one below, then send your friends the invite link."
        />
      )}

      {tables?.map((table) => (
        <Link to={`/t/${table.id}`} className="slip table-row" key={table.id}>
          <span className="title">{table.name}</span>
          <span className="label">Open ›</span>
        </Link>
      ))}

      <form className="slip" onSubmit={handleCreate}>
        <div className="slip-head">
          <span className="title">Start a table</span>
        </div>
        <div className="boxes">
          <label className="box">
            <span className="label">Name</span>
            <input
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="actions">
          <button className="btn solid" type="submit" disabled={busy}>
            {busy ? "Dealing…" : "Start table"}
          </button>
        </div>
      </form>
    </>
  );
}
