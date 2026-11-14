// Card-shaped placeholders while something loads from the database
export default function LoadingCards({ count = 2 }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div className="slip skeleton" key={i} aria-hidden="true">
          <span className="bar wide" />
          <span className="bar" />
          <span className="bar short" />
        </div>
      ))}
    </div>
  );
}
