import { Link } from "react-router-dom";

// Linked from Google's sign-in screen. Plain words: what's kept, where, and how to remove it.
export default function Privacy() {
  return (
    <article className="slip privacy">
      <div className="slip-head">
        <span className="title">Privacy</span>
        <span className="label">Pretty Sure</span>
      </div>

      <h2>What's kept</h2>
      <ul>
        <li>
          <b>Your calls and parlays:</b> what you wrote, your odds, stakes,
          dates and results.
        </li>
        <li>
          <b>Your Google name and email</b>, if you sign in, so your deck
          follows you between devices.
        </li>
        <li>
          <b>A random device number</b> for the player count. It isn't linked
          to your name.
        </li>
      </ul>

      <h2>Where it's kept</h2>
      <p>
        On your device, and in a Supabase database once you sign in. Database
        rules mean only you can read or change your calls.
      </p>

      <h2>What isn't done with it</h2>
      <p>
        It's never sold, shared, shown to anyone else, or used for ads. There
        are no trackers.
      </p>

      <h2>Removing it</h2>
      <p>
        Clearing this site's data in your browser removes what's on your
        device. To delete your account and everything synced, email{" "}
        <a href="mailto:ajef1479@gmail.com">ajef1479@gmail.com</a>.
      </p>

      <p className="fine-print">Last updated 8 November 2026.</p>

      <div className="actions">
        <Link className="btn" to="/">
          Back to your calls
        </Link>
      </div>
    </article>
  );
}
