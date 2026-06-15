import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Download, FileText } from "lucide-react";
import { getToken } from "../auth";

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? "";

interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}

interface SpendingSummary {
  month: string;
  totalAmount: number;
  categoryBreakdown: CategoryBreakdown[];
}

interface TrendPoint {
  label: string;
  monthLabel: string;
  value: number;
}

interface CategoryComparison {
  name: string;
  current: number;
  previous: number;
  color: string;
}

const CATEGORY_COLORS = ["#FB2C36", "#2B7FFF", "#00C950", "#F0B100"];

const formatCurrency = (value: number) => `€${Math.round(value).toLocaleString()}`;

const monthStart = (offset: number) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + offset, 1);
};

const monthParam = (date: Date) => date.toISOString();

const shortMonth = (date: Date) =>
  date.toLocaleString("default", { month: "short" });

const longMonth = (date: Date) =>
  date.toLocaleString("default", { month: "long", year: "numeric" });

const calculateChange = (current: number, previous: number) => {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
};

const escapePdfText = (value: string) =>
  value
    .replace(/€/g, "EUR ")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const createPdfBlob = (lines: string[]) => {
  const content = [
    "BT",
    "/F1 18 Tf",
    "48 790 Td",
    "(Bill Buddy Analytics) Tj",
    "/F1 11 Tf",
    "0 -28 Td",
    ...lines.flatMap((line) => [
      `(${escapePdfText(line)}) Tj`,
      "0 -18 Td",
    ]),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const buildLinePath = (points: TrendPoint[]) => {
  if (!points.length) return "";

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 500;
  const height = 185;
  const xStep = points.length > 1 ? width / (points.length - 1) : width;

  return points
    .map((point, index) => {
      const x = index * xStep;
      const y = height - ((point.value - min) / range) * 150 - 18;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
};

export default function AnalyticsPage() {
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [currentSummary, setCurrentSummary] = useState<SpendingSummary | null>(
    null,
  );
  const [previousSummary, setPreviousSummary] = useState<SpendingSummary | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const months = Array.from({ length: 7 }, (_, index) =>
        monthStart(index - 6),
      );

      try {
        const responses = await Promise.all(
          months.map((month) =>
            fetch(
              `${ALLOWED_HOST}:3000/expenses/spendingSummary?month=${encodeURIComponent(
                monthParam(month),
              )}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            ),
          ),
        );

        const summaries = await Promise.all(
          responses.map(async (response) =>
            response.ok ? ((await response.json()) as SpendingSummary) : null,
          ),
        );

        setTrend(
          summaries.map((summary, index) => ({
            label: shortMonth(months[index]),
            monthLabel: longMonth(months[index]),
            value: summary?.totalAmount ?? 0,
          })),
        );

        setCurrentSummary(summaries[summaries.length - 1]);
        setPreviousSummary(summaries[summaries.length - 2]);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const comparisons = useMemo<CategoryComparison[]>(() => {
    const previousByName = new Map(
      previousSummary?.categoryBreakdown.map((category) => [
        category.categoryName,
        category.amount,
      ]) ?? [],
    );

    return (currentSummary?.categoryBreakdown ?? [])
      .slice(0, 4)
      .map((category, index) => ({
        name: category.categoryName,
        current: category.amount,
        previous: previousByName.get(category.categoryName) ?? 0,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }));
  }, [currentSummary, previousSummary]);

  const totalChange = calculateChange(
    currentSummary?.totalAmount ?? 0,
    previousSummary?.totalAmount ?? 0,
  );

  const bestCategory = useMemo(() => {
    if (!comparisons.length) return null;

    return [...comparisons].sort((a, b) => {
      const aChange = calculateChange(a.current, a.previous) ?? a.current;
      const bChange = calculateChange(b.current, b.previous) ?? b.current;
      return aChange - bChange;
    })[0];
  }, [comparisons]);

  const attentionCategory = useMemo(() => {
    if (!comparisons.length) return null;

    return [...comparisons].sort((a, b) => {
      const aChange = calculateChange(a.current, a.previous) ?? a.current;
      const bChange = calculateChange(b.current, b.previous) ?? b.current;
      return bChange - aChange;
    })[0];
  }, [comparisons]);

  const exportCsv = () => {
    const rows = [
      ["Month", "Total"],
      ...trend.map((point) => [point.monthLabel, point.value.toFixed(2)]),
      [],
      ["Category", "This Month", "Last Month"],
      ...comparisons.map((category) => [
        category.name,
        category.current.toFixed(2),
        category.previous.toFixed(2),
      ]),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, "bill-buddy-analytics.csv");
  };

  const exportPdf = () => {
    const totalChangeLabel =
      totalChange === null
        ? "No previous month data"
        : `${totalChange >= 0 ? "+" : ""}${totalChange.toFixed(
            1,
          )}% vs last month`;

    const lines = [
      `Report month: ${currentMonth}`,
      `Monthly change: ${totalChangeLabel}`,
      "",
      "Monthly Spending Trend",
      ...trend.map((point) => `${point.monthLabel}: ${formatCurrency(point.value)}`),
      "",
      "Category Breakdown",
      ...comparisons.map(
        (category) =>
          `${category.name}: this month ${formatCurrency(
            category.current,
          )}, last month ${formatCurrency(category.previous)}`,
      ),
      "",
      `Best Category: ${bestCategory?.name ?? "No data"}`,
      `Needs Attention: ${attentionCategory?.name ?? "No data"}`,
    ];

    downloadBlob(createPdfBlob(lines), "bill-buddy-analytics.pdf");
  };

  const trendPath = buildLinePath(trend);
  const currentMonth = longMonth(monthStart(0));
  const maxCategoryAmount = Math.max(
    1,
    ...comparisons.flatMap((category) => [category.current, category.previous]),
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f6fa] dark:bg-[#121212] flex items-center justify-center">
        <p className="font-inter text-[#101828] dark:text-white">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6fa] dark:bg-[#121212] pb-[110px]">
      <div className="mx-auto max-w-[430px] px-4 pt-5">
        <section className="rounded-[14px] border border-[#dedede] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-[#1e1e1e]">
          <h1 className="font-arimo text-[22px] font-bold text-[#101828] dark:text-white">
            Monthly Spending Trend
          </h1>

          <div className="mt-8 h-[270px]">
            <svg
              viewBox="-10 0 520 220"
              className="h-[210px] w-full overflow-visible"
              role="img"
              aria-label="Monthly spending trend line chart"
            >
              {trendPath && (
                <path
                  d={trendPath}
                  fill="none"
                  stroke="#1E5128"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="5"
                />
              )}
              {trend.map((point, index) => {
                const values = trend.map((item) => item.value);
                const min = Math.min(...values);
                const max = Math.max(...values);
                const range = max - min || 1;
                const x = (500 / Math.max(1, trend.length - 1)) * index;
                const y = 185 - ((point.value - min) / range) * 150 - 18;

                return (
                  <g key={point.monthLabel}>
                    <circle cx={x} cy={y} r="7" fill="#1E5128" />
                    <text
                      x={x}
                      y="212"
                      textAnchor="middle"
                      className="fill-[#667085] text-[18px] font-medium"
                    >
                      {point.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-1 flex items-center justify-between gap-3 rounded-xl bg-[#f8f9fb] px-3 py-2 dark:bg-[#2a2a2a]">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                  (totalChange ?? 0) > 0
                    ? "bg-red-100 text-red-600"
                    : "bg-[#d9f0a0] text-brand-green"
                }`}
              >
                {(totalChange ?? 0) > 0 ? (
                  <ArrowUp size={17} />
                ) : (
                  <ArrowDown size={17} />
                )}
              </span>
              <span className="min-w-0 font-inter text-sm font-semibold leading-tight text-[#344054] dark:text-gray-100">
                {totalChange === null
                  ? "No previous month data"
                  : `${totalChange >= 0 ? "+" : ""}${totalChange.toFixed(
                      1,
                    )}% vs last month`}
              </span>
            </div>
            <span className="shrink-0 rounded-lg bg-[#eceef2] px-3 py-1.5 font-inter text-xs font-semibold leading-tight text-[#101828] dark:bg-gray-700 dark:text-white">
              {currentMonth}
            </span>
          </div>
        </section>

        <section className="mt-6 rounded-[14px] border border-[#dedede] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-[#1e1e1e]">
          <div className="mb-5 flex items-center gap-3">
            <Download size={24} className="text-[#475467] dark:text-gray-300" />
            <h2 className="font-arimo text-[22px] font-bold text-[#101828] dark:text-white">
              Export Data
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex h-[110px] flex-col items-center justify-center gap-3 rounded-[14px] border border-[#dedede] bg-white font-inter text-lg font-semibold text-[#344054] dark:border-gray-700 dark:bg-[#1e1e1e] dark:text-gray-100"
              onClick={exportCsv}
            >
              <FileText size={34} />
              Export CSV
            </button>
            <button
              type="button"
              className="flex h-[110px] flex-col items-center justify-center gap-3 rounded-[14px] border border-[#dedede] bg-white font-inter text-lg font-semibold text-[#344054] dark:border-gray-700 dark:bg-[#1e1e1e] dark:text-gray-100"
              onClick={exportPdf}
            >
              <FileText size={34} />
              Export PDF
            </button>
          </div>

          <p className="mt-5 font-inter text-lg leading-snug text-[#667085] dark:text-gray-400">
            Export your expense data for backup or analysis in other tools.
          </p>
        </section>

        <section className="mt-6 rounded-[14px] border border-[#dedede] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-[#1e1e1e]">
          <h2 className="mb-6 font-arimo text-[22px] font-bold text-[#101828] dark:text-white">
            Category Breakdown
          </h2>

          <div className="flex flex-col gap-7">
            {comparisons.length > 0 ? (
              comparisons.map((category) => (
                <article key={category.name}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-inter text-lg font-semibold text-[#344054] dark:text-gray-100">
                      {category.name}
                    </h3>
                    <span className="font-inter text-lg text-[#667085] dark:text-gray-300">
                      {formatCurrency(category.current)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-8 overflow-hidden rounded-xl bg-[#f0f1f4]">
                      <div
                        className="h-full rounded-xl"
                        style={{
                          width: `${Math.max(
                            8,
                            (category.current / maxCategoryAmount) * 100,
                          )}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                    <div className="h-8 overflow-hidden rounded-xl bg-[#f0f1f4]">
                      <div
                        className="h-full rounded-xl bg-[#c8cdd5]"
                        style={{
                          width: `${Math.max(
                            8,
                            (category.previous / maxCategoryAmount) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between font-inter text-base text-[#667085] dark:text-gray-400">
                    <span>This Month</span>
                    <span>Last Month</span>
                  </div>
                </article>
              ))
            ) : (
              <p className="font-inter text-sm text-[#667085] dark:text-gray-400">
                No category data for this month.
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-4">
          <InsightCard
            direction="down"
            label="Best Category"
            category={bestCategory?.name ?? "No data"}
            value={bestCategory}
            positive
          />
          <InsightCard
            direction="up"
            label="Needs Attention"
            category={attentionCategory?.name ?? "No data"}
            value={attentionCategory}
          />
        </section>
      </div>
    </main>
  );
}

function InsightCard({
  direction,
  label,
  category,
  value,
  positive = false,
}: {
  direction: "up" | "down";
  label: string;
  category: string;
  value: CategoryComparison | null;
  positive?: boolean;
}) {
  const change = value ? calculateChange(value.current, value.previous) : null;
  const tone = positive ? "text-[#00a63e]" : "text-red-600";

  return (
    <article className="rounded-[14px] border border-[#dedede] bg-white px-3 py-5 text-center shadow-sm dark:border-gray-700 dark:bg-[#1e1e1e]">
      <div
        className={`mx-auto mb-4 flex h-[58px] w-[58px] items-center justify-center rounded-3xl ${
          positive ? "bg-[#d9f0a0] text-brand-green" : "bg-red-100 text-red-600"
        }`}
      >
        {direction === "down" ? <ArrowDown size={30} /> : <ArrowUp size={30} />}
      </div>
      <p className="font-inter text-base text-[#667085] dark:text-gray-400">
        {label}
      </p>
      <h3 className="mt-2 truncate font-arimo text-xl font-bold text-[#101828] dark:text-white">
        {category}
      </h3>
      <p className={`mt-2 font-inter text-base font-semibold ${tone}`}>
        {change === null
          ? "No comparison"
          : `${change >= 0 ? "+" : ""}${change.toFixed(0)}% ${
              positive ? "saved" : "over"
            }`}
      </p>
    </article>
  );
}
