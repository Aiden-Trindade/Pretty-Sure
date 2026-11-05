const RANGES = [
  { min: 1, max: 20 },
  { min: 21, max: 40 },
  { min: 41, max: 60 },
  { min: 61, max: 80 },
  { min: 81, max: 100 },
];

export function getSettled(calls = []) {
  return calls.filter((call) => call.outcome !== null);
}

export function getWinRate(calls = []) {
  const settled = getSettled(calls);
  if (settled.length === 0) return 0;

  const won = settled.filter((call) => call.outcome === true).length;
  return Math.round((won / settled.length) * 100);
}

export function getCalibration(calls = []) {
  const settled = getSettled(calls);

  return RANGES.map((range) => {
    const rangeCalls = settled.filter(
      (call) => call.confidence >= range.min && call.confidence <= range.max
    );

    return {
      min: range.min,
      max: range.max,
      count: rangeCalls.length,
      winRate: getWinRate(rangeCalls),
    };
  });
}