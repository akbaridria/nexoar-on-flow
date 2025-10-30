export class OptionsPricing {
  private readonly VOLATILITY: number = 0.8;
  private readonly DAYS_PER_YEAR: number = 365.0;
  private readonly TIME_VALUE_COEFF: number = 0.496;
  private readonly MAX_PCT_DISTANCE: number = 1.0;

  /**
   * Calculate total option premium = intrinsic + time value
   * @param spot Current price of the underlying asset
   * @param strike Strike price of the option
   * @param duration Days until expiration
   * @param isCall true for call option, false for put
   * @returns Premium in the same units as spot/strike
   */
  public calculatePremium(
    spot: number,
    strike: number,
    duration: number,
    isCall: boolean
  ): number {
    const intrinsic = this.calculateIntrinsic(spot, strike, isCall);
    const sqrtTime = this.getSqrtTime(duration);
    const timeValue = this.calculateTimeValue(spot, strike, sqrtTime);
    return intrinsic + timeValue;
  }

  /**
   * Calculate intrinsic value of the option
   */
  private calculateIntrinsic(
    spot: number,
    strike: number,
    isCall: boolean
  ): number {
    if (isCall) {
      return spot > strike ? spot - strike : 0.0;
    } else {
      return strike > spot ? strike - spot : 0.0;
    }
  }

  /**
   * Absolute difference between two numbers
   */
  private absDiff(a: number, b: number): number {
    return a > b ? a - b : b - a;
  }

  /**
   * Moneyness distance as % of strike (how far OTM/ITM)
   */
  private getMoneynessDistance(spot: number, strike: number): number {
    if (strike <= 0.0) {
      return 1.0;
    }
    const diff = this.absDiff(spot, strike);
    return diff / strike;
  }

  /**
   * Convert duration in days to sqrt(years)
   */
  private getSqrtTime(duration: number): number {
    const T = duration / this.DAYS_PER_YEAR;
    return this.sqrt(T);
  }

  /**
   * Calculate time value with ATM base and linear decay from moneyness
   */
  private calculateTimeValue(
    spot: number,
    strike: number,
    sqrtTime: number
  ): number {
    const atmTimeValue =
      strike * this.VOLATILITY * sqrtTime * this.TIME_VALUE_COEFF;
    const moneynessPct = this.getMoneynessDistance(spot, strike);
    const moneynessDecay = 1.0 - moneynessPct / this.MAX_PCT_DISTANCE;
    const clampedDecay = moneynessDecay > 0.0 ? moneynessDecay : 0.0;
    return atmTimeValue * clampedDecay;
  }

  /**
   * Babylonian/heron's method for square root (same as Cadence)
   * @param n Number to take square root of
   * @returns Approximation of sqrt(n)
   */
  private sqrt(n: number): number {
    if (n === 0.0) {
      return 0.0;
    }

    let x = n;
    let y = (x + 1.0) / 2.0;
    const epsilon = 0.000001;

    while (this.absDiff(x, y) > epsilon) {
      x = y;
      y = (x + n / x) / 2.0;
    }

    return y;
  }
}
