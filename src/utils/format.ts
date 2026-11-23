const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const currencyCents = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export function formatMoney(value: number | null | undefined, { cents = false } = {}) {
  if (value == null || Number.isNaN(value)) return "—";
  return (cents ? currencyCents : currency).format(value);
}

/** Valores grandes de forma compacta: R$ 1,47 mi · R$ 960 mil. */
export function formatMoneyCompact(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 1e9) return `${sign}R$ ${decimal.format(abs / 1e9)} bi`;
  if (abs >= 1e6) return `${sign}R$ ${decimal.format(abs / 1e6)} mi`;
  if (abs >= 1e4) return `${sign}R$ ${Math.round(abs / 1e3).toLocaleString("pt-BR")} mil`;
  return formatMoney(value);
}

/** Recebe uma fração (0.032) e devolve "3,2%". */
export function formatPercent(fraction: number | null | undefined, digits = 1) {
  if (fraction == null || Number.isNaN(fraction)) return "—";
  return `${(fraction * 100).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: digits })}%`;
}

/** Variação relativa entre dois valores, como "+57,8%". Null quando a base é zero. */
export function formatChange(value: number, reference: number) {
  if (!reference) return null;
  const change = (value - reference) / Math.abs(reference);
  const text = formatPercent(Math.abs(change));
  return `${change >= 0 ? "+" : "−"}${text}`;
}

export function formatNumber(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return decimal.format(value);
}

const dateFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return dateFormat.format(new Date(iso));
}

/** "Hoje, 10:42" · "Ontem, 16:20" · "18 de jun., 09:10". */
export function formatRelative(iso: string | null | undefined, now = new Date()) {
  if (!iso) return "—";
  const date = new Date(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = timeFormat.format(date);
  if (sameDay(date, now)) return `Hoje, ${time}`;
  if (sameDay(date, yesterday)) return `Ontem, ${time}`;
  const base = date.getFullYear() === now.getFullYear() ? shortDate.format(date) : formatDate(iso);
  return `${base}, ${time}`;
}

export function paybackLabel(month: number | null | undefined) {
  return month == null ? "Não atingido" : `Mês ${month}`;
}

export function formatMonths(months: number) {
  return `${months} ${months === 1 ? "mês" : "meses"}`;
}

/** Iniciais para avatares: "Marina Costa" → "MC". */
export function initials(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return letters.toUpperCase();
}

/** Identificador curto e estável para exibir uma simulação: "#A1B2C3". */
export function shortId(id: string) {
  return `#${id.slice(-6).toUpperCase()}`;
}

export function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
