export const STARTING_BALANCE = 100;

export function getReturn(call) {
  const stake = Number(call.stake) || 0;
  const confidence = Number(call.confidence) || 1;
  return Math.round((stake * 100) / confidence);
}

export function getBalance(calls = []) {
  return calls.reduce((acc, call) => {
    const stake = Number(call.stake) || 0;
    let balanceChange = -stake;

    if (call.outcome === true) {
      balanceChange += getReturn(call);
    }

    return acc + balanceChange;
  }, STARTING_BALANCE);
}