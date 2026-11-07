import EmptyState from "../components/EmptyState";

export default function NotFound() {
  return (
    <EmptyState
      suit="♠"
      title="No such slip"
      text="This card isn’t in the deck."
      to="/"
      action="Back to your calls"
    />
  );
}