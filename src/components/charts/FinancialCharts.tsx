import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactElement } from "react";
import type { MonthlyProjection } from "@/types/api";
import { formatMoney, formatMoneyCompact } from "@/utils/format";
import { axisProps, chartColors, gridProps, tooltipProps } from "./theme";

const moneyTick = (value: number) => formatMoneyCompact(value).replace("R$ ", "");
const monthLabel = (month: number) => `Mês ${month}`;
const tooltipMoney = (value: number | string) => formatMoney(Number(value));

function ChartFrame({ height = 240, label, children }: { height?: number; label: string; children: ReactElement }) {
  return (
    <div className="chart-frame" style={{ height }} role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

/** Receita total versus custos operacionais, mês a mês. */
export function RevenueCostChart({ data }: { data: MonthlyProjection[] }) {
  return (
    <ChartFrame label="Gráfico de receita versus custos por mês" height={260}>
      <LineChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="month" {...axisProps} tickFormatter={(m) => `M${m}`} minTickGap={24} />
        <YAxis {...axisProps} tickFormatter={moneyTick} width={56} />
        <Tooltip {...tooltipProps} formatter={tooltipMoney} labelFormatter={monthLabel} />
        <Line type="monotone" dataKey="totalRevenue" name="Receita" stroke={chartColors.revenue} strokeWidth={2.3} dot={false} />
        <Line type="monotone" dataKey="operatingCosts" name="Custos" stroke={chartColors.cost} strokeWidth={2.3} dot={false} />
      </LineChart>
    </ChartFrame>
  );
}

/** Resultado operacional (EBITDA) por mês; barras negativas em vermelho. */
export function MonthlyResultChart({ data }: { data: MonthlyProjection[] }) {
  return (
    <ChartFrame label="Gráfico de resultado operacional mensal">
      <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="month" {...axisProps} tickFormatter={(m) => `M${m}`} minTickGap={24} />
        <YAxis {...axisProps} tickFormatter={moneyTick} width={56} />
        <Tooltip {...tooltipProps} cursor={{ fill: "rgba(139, 92, 246, 0.06)" }} formatter={tooltipMoney} labelFormatter={monthLabel} />
        <ReferenceLine y={0} stroke={chartColors.zero} strokeDasharray="4 4" />
        <Bar dataKey="ebitda" name="Resultado operacional" radius={[3, 3, 0, 0]}>
          {data.map((row) => (
            <Cell key={row.month} fill={row.ebitda >= 0 ? chartColors.revenue : chartColors.negative} fillOpacity={0.75} />
          ))}
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}

/** Fluxo de caixa acumulado (começa negativo pelo investimento) com marcação do payback. */
export function CumulativeCashChart({ data, paybackMonth }: { data: MonthlyProjection[]; paybackMonth: number | null }) {
  return (
    <ChartFrame label="Gráfico de fluxo de caixa acumulado">
      <AreaChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="cumulativeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.revenue} stopOpacity={0.3} />
            <stop offset="100%" stopColor={chartColors.revenue} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="month" {...axisProps} tickFormatter={(m) => `M${m}`} minTickGap={24} />
        <YAxis {...axisProps} tickFormatter={moneyTick} width={56} />
        <Tooltip {...tooltipProps} formatter={tooltipMoney} labelFormatter={monthLabel} />
        <ReferenceLine y={0} stroke={chartColors.zero} strokeDasharray="4 4" />
        {paybackMonth != null && <ReferenceLine x={paybackMonth} stroke={chartColors.positive} strokeDasharray="3 3" />}
        <Area
          type="monotone"
          dataKey="accumulatedCashFlow"
          name="Fluxo acumulado"
          stroke={chartColors.revenue}
          strokeWidth={2.3}
          fill="url(#cumulativeFill)"
        />
      </AreaChart>
    </ChartFrame>
  );
}

export interface ComparisonSeries {
  id: string;
  name: string;
  color: string;
  values: number[];
}

/** Fluxo acumulado de vários cenários sobrepostos (horizontes diferentes são tolerados). */
export function ComparisonCashChart({ series }: { series: ComparisonSeries[] }) {
  const months = Math.max(0, ...series.map((s) => s.values.length));
  const rows = Array.from({ length: months }, (_, i) => {
    const row: Record<string, number | null> = { month: i + 1 };
    for (const s of series) row[s.id] = s.values[i] ?? null;
    return row;
  });
  return (
    <ChartFrame label="Gráfico comparativo do fluxo de caixa acumulado por cenário" height={280}>
      <LineChart data={rows} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="month" {...axisProps} tickFormatter={(m) => `M${m}`} minTickGap={24} />
        <YAxis {...axisProps} tickFormatter={moneyTick} width={56} />
        <Tooltip {...tooltipProps} formatter={tooltipMoney} labelFormatter={monthLabel} />
        <ReferenceLine y={0} stroke={chartColors.zero} strokeDasharray="4 4" />
        {series.map((s) => (
          <Line key={s.id} type="monotone" dataKey={s.id} name={s.name} stroke={s.color} strokeWidth={2.3} dot={false} connectNulls={false} />
        ))}
      </LineChart>
    </ChartFrame>
  );
}

/** Simulações executadas por mês (dashboard). */
export function ActivityChart({ data }: { data: { label: string; count: number }[] }) {
  return (
    <ChartFrame label="Gráfico de simulações executadas por mês" height={220}>
      <AreaChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} allowDecimals={false} />
        <Tooltip {...tooltipProps} formatter={(v) => [`${v}`, "Simulações"]} />
        <Area type="monotone" dataKey="count" stroke="#9c6cf7" strokeWidth={2.3} fill="url(#activityFill)" />
      </AreaChart>
    </ChartFrame>
  );
}
