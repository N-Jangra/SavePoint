// Shared currency table, detection and conversion (Settings → Tracking → Currency display).
// Rates are approximate units per 1 USD; the user can override the selected currency's rate in Settings.
(() => {
  const CURRENCIES = [
    ["USD", "US Dollar", 1], ["EUR", "Euro", 0.92], ["GBP", "British Pound", 0.79], ["INR", "Indian Rupee", 94.8], ["JPY", "Japanese Yen", 150],
    ["CAD", "Canadian Dollar", 1.37], ["AUD", "Australian Dollar", 1.52], ["NZD", "New Zealand Dollar", 1.65], ["CHF", "Swiss Franc", 0.88],
    ["CNY", "Chinese Yuan", 7.2], ["HKD", "Hong Kong Dollar", 7.8], ["SGD", "Singapore Dollar", 1.34], ["KRW", "South Korean Won", 1370],
    ["BRL", "Brazilian Real", 5.4], ["MXN", "Mexican Peso", 18], ["TRY", "Turkish Lira", 35], ["RUB", "Russian Ruble", 90], ["UAH", "Ukrainian Hryvnia", 41],
    ["PLN", "Polish Zloty", 4], ["SEK", "Swedish Krona", 10.5], ["NOK", "Norwegian Krone", 10.7], ["DKK", "Danish Krone", 6.9], ["CZK", "Czech Koruna", 23],
    ["ZAR", "South African Rand", 18], ["AED", "UAE Dirham", 3.67], ["SAR", "Saudi Riyal", 3.75], ["THB", "Thai Baht", 35], ["IDR", "Indonesian Rupiah", 16000],
    ["PHP", "Philippine Peso", 57], ["VND", "Vietnamese Dong", 25000], ["MYR", "Malaysian Ringgit", 4.5], ["PKR", "Pakistani Rupee", 280]
  ];
  const info = new Map(CURRENCIES.map(([code, name, rate]) => [code, { code, name, rate }]));
  const NO_DECIMALS = new Set(["JPY", "KRW", "IDR", "VND"]);
  const symbolCache = new Map();
  function symbol(code) {
    if (symbolCache.has(code)) return symbolCache.get(code);
    let value = code;
    try { value = new Intl.NumberFormat("en", { style: "currency", currency: code, currencyDisplay: "narrowSymbol" }).formatToParts(0).find(part => part.type === "currency")?.value || code; } catch (_) {}
    symbolCache.set(code, value);
    return value;
  }
  const rate = (prefs, code) => {
    if (code === "USD") return 1;
    const custom = Number(prefs?.currencyRates?.[code]);
    if (custom > 0) return custom;
    if (code === "INR" && Number(prefs?.usdToInrRate) > 0) return Number(prefs.usdToInrRate);
    return info.get(code)?.rate || 1;
  };
  function detect(text) {
    const value = String(text ?? "");
    if (/R\$|\bBRL\b/i.test(value)) return "BRL";
    if (/₹|\bINR\b|\bRs\.?(?=\s|\d)/i.test(value)) return "INR";
    if (/€|\bEUR\b/i.test(value)) return "EUR";
    if (/£|\bGBP\b/i.test(value)) return "GBP";
    if (/₩|\bKRW\b/i.test(value)) return "KRW";
    if (/₺|\bTRY\b/i.test(value)) return "TRY";
    if (/₽|\bRUB\b/i.test(value)) return "RUB";
    if (/₴|\bUAH\b/i.test(value)) return "UAH";
    if (/zł|\bPLN\b/i.test(value)) return "PLN";
    if (/¥|\bJPY\b/.test(value)) return "JPY";
    const code = value.match(/\b[A-Z]{3}\b/g)?.find(candidate => info.has(candidate));
    if (code) return code;
    return /\$/.test(value) ? "USD" : "";
  }
  const convert = (amount, from, to, prefs) => !from || from === to || !info.has(from) || !info.has(to) ? amount : amount / rate(prefs, from) * rate(prefs, to);
  function format(amount, code) {
    const digits = NO_DECIMALS.has(code) ? 0 : 2;
    try { return new Intl.NumberFormat(code === "INR" ? "en-IN" : "en-US", { style: "currency", currency: code, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(amount); }
    catch (_) { return `${amount.toFixed(digits)} ${code}`; }
  }
  window.SplitAppCurrency = Object.freeze({
    list: CURRENCIES.map(([code, name]) => ({ code, name, symbol: symbol(code) })),
    has: code => info.has(code), symbol, rate, detect, convert, format,
    target: prefs => info.has(prefs?.currencyDisplay) ? prefs.currencyDisplay : "USD"
  });
})();
