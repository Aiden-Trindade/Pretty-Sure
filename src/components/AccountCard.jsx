const STATUS = {
  syncing: "Syncing…",
  synced: "Synced",
  error: "Offline. Changes will sync later",
  off: "",
};

// Signed out: a card inviting you to sync. Signed in: one line saying whose deck this is.
export default function AccountCard({ account }) {
  if (!account?.available) return null; // no Supabase keys: the app just stays local

  const { user, syncState, onSignIn, onSignOut } = account;

  if (!user) {
    return (
      <section className="slip account-card">
        <div className="slip-head">
          <span className="title">Take your deck everywhere</span>
        </div>
        <p className="account-copy">
          Sign in to keep the same calls on your phone and laptop. Anything
          already here comes with you.
        </p>
        <div className="actions">
          <button className="btn google-btn" type="button" onClick={onSignIn}>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="google-g">
              <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z" />
              <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7H2.1a11 11 0 0 0 0 10z" />
              <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z" />
            </svg>
            Continue with Google
          </button>
        </div>
      </section>
    );
  }

  const name = user.user_metadata?.full_name || user.email;

  return (
    <p className="account-line">
      <span className={`sync-dot ${syncState}`} aria-hidden="true" />
      <span>
        {name}
        {STATUS[syncState] && <> · {STATUS[syncState]}</>}
      </span>
      <button className="link-btn" type="button" onClick={onSignOut}>
        Sign out
      </button>
    </p>
  );
}
