import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { joinTable } from "../utils/tables";
import LoadingCards from "../components/LoadingCards";
import useTitle from "../utils/useTitle";

// The invite link: /join/<code>. Signed in, it seats you and opens the table.
export default function Join({ account }) {
  useTitle("Joining a table");
  const { code } = useParams();
  const userId = account?.user?.id;
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    joinTable(code)
      .then((tableId) => {
        // replace: the back button skips this page instead of joining again
        if (!cancelled) navigate(`/t/${tableId}`, { replace: true });
      })
      .catch((err) => !cancelled && setError(err.message));

    return () => {
      cancelled = true;
    };
  }, [userId, code, navigate]);

  if (!account?.available) {
    return (
      <div className="slip empty">
        <span className="empty-suit red">♦</span>
        <span className="title">Friends are offline</span>
        <p className="fine-print">
          Playing with friends isn't available right now. Your own calls still work.
        </p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="slip empty">
        <span className="empty-suit red">♦</span>
        <span className="title">You've been dealt in</span>
        <p className="fine-print">
          A friend invited you to their table. Sign in so they know it's you.
        </p>
        <div className="actions">
          <button className="btn solid" type="button" onClick={account.onSignIn}>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="slip empty">
        <span className="empty-suit red">♦</span>
        <span className="title">That invite didn't work</span>
        <p className="fine-print">{error}</p>
        <div className="actions">
          <Link className="btn" to="/tables">
            Your tables
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="loading">Pulling up a chair…</p>
      <LoadingCards count={1} />
    </>
  );
}
