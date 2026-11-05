export function getLegs(parlay, calls = []) {
  return calls.filter((c) => parlay.legIds.includes(c.id));
}

export function getParlayOutcome(parlay, calls = []) {
  const legs = getLegs(parlay, calls);
  if (legs.length === 0) return null;

  // Any lost leg fails the parlay immediately
  if (legs.some((leg) => leg.outcome === false)) {
    return false;
  }

  // Every leg must be won for the parlay to win
  if (legs.every((leg) => leg.outcome === true)) {
    return true;
  }

  return null;
}

export function getParlayReturn(stake = 0, legs = []) {
  const numericStake = Number(stake) || 0;
  if (legs.length === 0 || numericStake === 0) return numericStake;

  // Multiply leg probabilities together (e.g. 50% -> 0.5)
  const combinedProb = legs.reduce((acc, leg) => {
    const prob = (Number(leg.confidence) || 1) / 100;
    return acc * prob;
  }, 1);

  if (combinedProb === 0) return 0;
  return Math.round(numericStake / combinedProb);
}

export function getParlaysChange(parlays = [], calls = []) {
  return parlays.reduce((acc, parlay) => {
    const stake = Number(parlay.stake) || 0;
    let change = -stake;

    if (getParlayOutcome(parlay, calls) === true) {
      const legs = getLegs(parlay, calls);
      change += getParlayReturn(stake, legs);
    }

    return acc + change;
  }, 0);
}