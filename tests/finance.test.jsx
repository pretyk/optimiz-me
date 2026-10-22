import { describe, expect, it } from 'vitest';
import { calculate, DEFAULT_STATE, feedbackFor, pmt, taxStatus, trajectory, validateState } from '../src/App.jsx';

describe('monthly end-of-period drawdown', () => {
  it('matches the specified Excel PMT formula, correcting the PRD benchmark', () => {
    expect(pmt(3000000, 0, 0.04 / 12, 204)).toBeCloseTo(20291.80465685561, 8);
  });
  it('supports zero interest and arbitrarily small positive rates', () => {
    expect(pmt(3000000, 500000, 0, 200)).toBe(12500);
    expect(pmt(3000000, 500000, 1e-14, 200)).toBeCloseTo(12500, 5);
  });
  it('rejects zero duration instead of dividing by zero', () => {
    expect(() => pmt(300, 0, 0.01, 0)).toThrow(RangeError);
  });
  it.each([0, 4, 10])('leaves exactly the target at %s percent return', (annualReturn) => {
    const state = { ...DEFAULT_STATE, annualReturn };
    const result = calculate(state);
    let balance = result.pv;
    for (let month = 0; month < result.months; month++) balance = balance * (1 + result.rate) - result.gross;
    expect(balance).toBeCloseTo(state.targetCapital, 5);
    expect(trajectory(state, result).at(-1).capital).toBeCloseTo(state.targetCapital, 5);
  });
  it('compounds pre-bridge assets annually without new contributions', () => {
    expect(calculate(DEFAULT_STATE).pv).toBeCloseTo(3000000 * 1.04 ** 2, 6);
  });
  it('taxes only the liquid proportion and never creates tax credits for negative withdrawals', () => {
    const state = { ...DEFAULT_STATE, liquidSavings: 1000000, hishtalmut: 3000000 };
    expect(calculate(state).bridgeTax).toBe(0.0375);
    const impossible = calculate({ ...state, targetCapital: 100000000 });
    expect(impossible.gross).toBeLessThan(0);
    expect(impossible.net).toBe(impossible.gross);
  });
  it('keeps exempt-only draws untaxed', () => {
    const result = calculate({ ...DEFAULT_STATE, liquidSavings: 0 });
    expect(result.net).toBe(result.gross);
  });
  it('handles an empty portfolio', () => {
    const result = calculate({ ...DEFAULT_STATE, liquidSavings: 0, hishtalmut: 0, targetCapital: 0 });
    expect(result.net).toBe(0);
    expect(result.bridgeTax).toBe(0);
  });
  it('preserves signed deficits and charts actual capital without invented deposits', () => {
    const state = { ...DEFAULT_STATE, annualReturn: 0, targetCapital: 5000000 };
    const result = calculate(state);
    expect(result.reachable).toBe(false);
    expect(result.gross).toBeLessThan(0);
    expect(trajectory(state, result).at(-1).capital).toBe(3000000);
  });
  it('allows same-day bridge and pension start without inventing a monthly payment', () => {
    const result = calculate({ ...DEFAULT_STATE, bridgeStartAge: 67 });
    expect(result.months).toBe(0);
    expect(result.gross).toBeNull();
    expect(result.net).toBeNull();
    expect(result.reachable).toBe(true);
  });
  it('flags a zero-duration capital deficit', () => {
    expect(calculate({ ...DEFAULT_STATE, bridgeStartAge: 67, targetCapital: 100000000 }).reachable).toBe(false);
  });
});

describe('pension and tax scenario assumptions', () => {
  it.each([
    ['male', 59, 'danger', 0.35], ['male', 60, 'warning', 0.2], ['male', 66, 'warning', 0.2],
    ['male', 67, 'success', 0.05], ['female', 64, 'warning', 0.2], ['female', 65, 'success', 0.05],
  ])('%s age %i gets %s', (gender, age, level, rate) => {
    expect(taxStatus(gender, age)).toMatchObject({ level, rate });
  });
  it.each([[60, 228], [67, 200], [70, 191], [75, 176]])('uses the requested conversion factor at age %i', (pensionAge, factor) => {
    const result = calculate({ ...DEFAULT_STATE, pensionAge });
    expect(result.factor).toBe(factor);
    expect(result.pensionFinal).toBeCloseTo(2500000 * 1.04 ** (pensionAge - 50), 6);
    expect(result.pensionNet).toBeCloseTo(result.pensionFinal / factor * (1 - result.tax.rate), 6);
  });
});

describe('validation and trajectories', () => {
  it.each(['liquidSavings', 'hishtalmut'])('caps %s at 10 million inclusive', (key) => {
    for (const value of [0, 9999999.99, 10000000]) {
      const state = { ...DEFAULT_STATE, [key]: value };
      expect(validateState(state)).toEqual([]);
      expect(calculate(state).valid).toBe(true);
    }
    for (const value of [10000000.01, 10000001, 100000000]) {
      const state = { ...DEFAULT_STATE, [key]: value };
      expect(validateState(state).length).toBeGreaterThan(0);
      expect(calculate(state).valid).toBe(false);
    }
  });
  it('allows both liquid assets at their individual maximum', () => {
    expect(calculate({ ...DEFAULT_STATE, liquidSavings: 10000000, hishtalmut: 10000000 }))
      .toMatchObject({ valid: true, startingCapital: 20000000 });
  });
  it.each(['targetCapital', 'pensionBalance'])('retains the 100 million maximum for %s', (key) => {
    expect(validateState({ ...DEFAULT_STATE, [key]: 100000000 })).toEqual([]);
    expect(calculate({ ...DEFAULT_STATE, [key]: 100000000 }).valid).toBe(true);
    expect(validateState({ ...DEFAULT_STATE, [key]: 100000000.01 }).length).toBeGreaterThan(0);
  });
  it.each([
    { pensionAge: 50 }, { bridgeStartAge: 49 }, { currentAge: NaN }, { liquidSavings: -1 },
    { annualReturn: Infinity }, { currentAge: 50.5 }, { gender: 'unknown' },
  ])('rejects invalid state %j explicitly', (changes) => {
    expect(validateState({ ...DEFAULT_STATE, ...changes }).length).toBeGreaterThan(0);
    expect(calculate({ ...DEFAULT_STATE, ...changes }).valid).toBe(false);
  });

  describe('feedback thresholds', () => {
    it.each([
      [4999.99, 67, true, 'shake'], [5000, 67, true, 'saved'],
      [11999.99, 67, true, 'saved'], [12000, 60, true, 'confetti'],
      [12000, 59, true, 'shake'], [15000, 67, false, 'shake'],
      [null, 67, true, 'saved'],
    ])('classifies net %s at age %s and reachable %s as %s', (net, age, reachable, expected) => {
      expect(feedbackFor({ valid: true, net, reachable }, age)).toBe(expected);
    });
  });
  it('renders a finite single point when all ages match', () => {
    const state = { ...DEFAULT_STATE, currentAge: 67, bridgeStartAge: 67, pensionAge: 67 };
    expect(trajectory(state, calculate(state))).toEqual([{ age: 67, capital: 3000000, pension: 2500000 }]);
  });
  it('supports portfolios that grow during a feasible low-withdrawal bridge', () => {
    const state = { ...DEFAULT_STATE, targetCapital: 4000000 };
    const result = calculate(state);
    expect(result.reachable).toBe(true);
    expect(trajectory(state, result).at(-1).capital).toBeCloseTo(4000000, 5);
  });
});
