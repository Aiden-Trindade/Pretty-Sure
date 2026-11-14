import EmptyState from "../components/EmptyState";
import useTitle from "../utils/useTitle";

export default function NotFound() {
  useTitle("Not found");
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