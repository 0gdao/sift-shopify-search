export function currencyExponent(currency: string): number {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
    }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

export function toMinorUnits(amount: number, currency: string): number {
  return Math.round(amount * 10 ** currencyExponent(currency));
}

export function formatMoney(
  amount: number,
  currency: string,
  locale?: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currencyExponent(currency),
  }).format(amount / 10 ** currencyExponent(currency));
}
