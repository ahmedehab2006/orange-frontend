// Analytics page — weekly trend, rollout, breakdowns, and the
// customer-reach leaderboard.

import { useMemo, useState } from "react";
import "./Analytics.css";
import "./Dashboard.css"; // نفس ستايل شريط الفلاتر المستخدم في Dashboard

import {
    API_CONFIG,
    MOCK_ANALYTICS_TREND,
    MOCK_ANALYTICS_KPIS,
    useApiData,
} from "../api";

import {
    Badge,
    Card,
    ToggleGroup,
    BreakdownCard,
    TrendBar,
    RolloutBar,
    SkeletonLine,
    ErrorInline,
    FiltersBar,
    DEFAULT_FILTERS,
} from "../Components.jsx";

const TREND_SPLIT_OPTIONS = [
    ["both", "Both"],
    ["new", "New Sites"],
    ["upgrade", "Upgrades"],
];

// فلترة بيانات الـ trend حسب أسابيع الفلتر (نفس فكرة فلترة الـ category
// في Dashboard: بنجهز الـ mock المفلتر ونمرره لـ useApiData بدل ما
// نكرر منطق فلترة تاني بعد الجلب).
function filterTrendByWeeks(data, filters) {
    if (filters.mode !== "Year + weeks") return data;
    const from = Number(filters.weekFrom) || 1;
    const to = Number(filters.weekTo) || data.length;
    return data.filter((item) => item.week_number >= from && item.week_number <= to);
}

// فلترة الـ KPIs حسب الـ category — نفس المنطق المستخدم بالظبط في
// Dashboard (filteredMockSites) لكن على بيانات الـ Analytics.
function filterKpisByCategory(data, filters) {
    if (filters.category === "All") return data;
    return data.filter((item) => item.category === filters.category);
}

function Analytics() {
    const [trendSplit, setTrendSplit] = useState("both");
    const [draft, setDraft] = useState(DEFAULT_FILTERS);
    const [applied, setApplied] = useState(DEFAULT_FILTERS);

    const filteredMockTrend = useMemo(
        () => filterTrendByWeeks(MOCK_ANALYTICS_TREND, applied),
        [applied.mode, applied.weekFrom, applied.weekTo]
    );

    const filteredMockKpis = useMemo(
        () => filterKpisByCategory(MOCK_ANALYTICS_KPIS, applied),
        [applied.category]
    );

    const {
        data: trendResult,
        status: trendStatus,
        retry: retryTrend,
    } = useApiData(API_CONFIG.endpoints.analyticsTrend, applied, filteredMockTrend);

    const {
        data: kpiResult,
        status: kpiStatus,
        retry: retryKpi,
    } = useApiData(API_CONFIG.endpoints.analyticsKpis, applied, filteredMockKpis);

    const trendData = trendResult || [];
    const kpiData = kpiResult || [];

    // Weekly trend values, filtered by split (both/new/upgrade).
    const trend = useMemo(() => {
        return trendData.map((item) => {
            const total = item.customers_total;
            const newSites = item.new_sites_total;

            if (trendSplit === "new") return newSites;
            if (trendSplit === "upgrade") return total - newSites;
            return total;
        });
    }, [trendData, trendSplit]);

    // Scale the visible weeks to the available chart height.
    const maxTrend = Math.max(...trend, 1);

    // Sites going live per week (mock calculation on the frontend).
    const rollout = useMemo(
        () =>
            trendData.map((item) => ({
                week: `W${item.week_number}`,
                value: Math.max(1, Math.round(item.new_sites_total / 40)),
            })),
        [trendData]
    );

    const maxRollout = Math.max(...rollout.map((item) => item.value), 1);

    // Single pass over kpiData to get every breakdown count at once,
    // instead of filtering the array separately for each one.
    const counts = useMemo(() => {
        const acc = { category: {}, effect: {}, improvement: {} };
        for (const item of kpiData) {
            acc.category[item.category] = (acc.category[item.category] || 0) + 1;
            acc.effect[item.effect_type] = (acc.effect[item.effect_type] || 0) + 1;
            acc.improvement[item.improvement] = (acc.improvement[item.improvement] || 0) + 1;
        }
        return acc;
    }, [kpiData]);

    const percentage = (value, total) => (total ? Math.round((value / total) * 100) : 0);

    const newSites = counts.category["New Site"] || 0;
    const upgrades = counts.category["Upgrade"] || 0;
    const major = counts.effect["Major"] || 0;
    const minor = counts.effect["Minor"] || 0;
    const outdoor = counts.improvement["Outdoor"] || 0;
    const indoor = counts.improvement["Indoor"] || 0;

    const breakdownCards = [
        {
            title: "By Enhancement Type",
            subtitle: "Enhancement distribution",
            rows: [
                { label: "New Sites", count: newSites, percentage: percentage(newSites, newSites + upgrades), color: "orange" },
                { label: "Upgrades", count: upgrades, percentage: percentage(upgrades, newSites + upgrades), color: "teal" },
            ],
        },
        {
            title: "By Effect Type",
            subtitle: "Impact level distribution",
            rows: [
                { label: "Major", count: major, percentage: percentage(major, major + minor), color: "gray" },
                { label: "Minor", count: minor, percentage: percentage(minor, major + minor), color: "gray" },
            ],
        },
        {
            title: "By Improvement Type",
            subtitle: "Improvement type distribution",
            rows: [
                { label: "Outdoor", count: outdoor, percentage: percentage(outdoor, outdoor + indoor), color: "purple" },
                { label: "Indoor", count: indoor, percentage: percentage(indoor, outdoor + indoor), color: "purple" },
            ],
        },
    ];

    // Leaderboard: sorted by customers, with a performance color.
    const leaderboard = useMemo(() => {
        const max = Math.max(...kpiData.map((item) => item.customers_total), 1);
        return [...kpiData]
            .sort((a, b) => b.customers_total - a.customers_total)
            .map((site) => {
                const performance =
                    site.customers_total < 50
                        ? "low"
                        : site.customers_total < 200
                            ? "average"
                            : "good";
                return {
                    ...site,
                    percentage: Math.round((site.customers_total / max) * 100),
                    performance,
                };
            });
    }, [kpiData]);

    const totalCustomers = kpiData.reduce((sum, item) => sum + item.customers_total, 0);

    const trendSubtitle = `Weekly customers reached · ${trendSplit === "both"
        ? "New + Upgrades combined"
        : trendSplit === "new"
            ? "New sites only"
            : "Upgrades only"
        }`;

    return (
        <div className="analytics-page">
            <FiltersBar
                draft={draft}
                setDraft={setDraft}
                onApply={() => setApplied(draft)}
                onClear={() => { setDraft(DEFAULT_FILTERS); setApplied(DEFAULT_FILTERS); }}
            />

            <div className="analytics-controls">
                <ToggleGroup options={TREND_SPLIT_OPTIONS} value={trendSplit} onChange={setTrendSplit} />
            </div>

            <div className="analytics-charts">
                {/* Customers Reached — Weekly Trend */}
                <Card className="analytics-card">
                    <div className="section-header">
                        <div>
                            <h2>Customers Reached — Weekly Trend</h2>
                            <p>{trendSubtitle}</p>
                        </div>
                    </div>

                    {trendStatus === "error" && <ErrorInline onRetry={retryTrend} />}

                    {trendStatus === "loading" && (
                        <div className="trend-chart">
                            <SkeletonLine width="100%" height={300} />
                        </div>
                    )}

                    {trendStatus === "success" && (
                        <div className="trend-chart">
                            <div className="chart-area">

                                <div className="chart-grid">
                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                </div>

                                {/* منطقة قابلة للتمرير أفقيًا لما عدد الأسابيع يكبر عن
                                    المساحة المتاحة، بدل ما الأعمدة تتضغط جوه الكارت. */}
                                <div className="bars-scroll">
                                    <div className="bars">
                                        {trend.map((value, index) => (
                                            <TrendBar
                                                key={index}
                                                value={Math.round(value).toLocaleString()}
                                                height={Math.max(3, (value / maxTrend) * 100)}
                                                label={`W${trendData[index]?.week_number}`}
                                                color={trendSplit}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Rollout Over Time */}
                <Card className="analytics-card">
                    <div className="section-header">
                        <div>
                            <h2>Rollout Over Time</h2>
                            <p>Sites going live per week</p>
                        </div>
                    </div>

                    {trendStatus === "error" && <ErrorInline onRetry={retryTrend} />}

                    {trendStatus === "loading" && (
                        <div className="rollout-chart">
                            <SkeletonLine width="100%" height={280} />
                        </div>
                    )}

                    {trendStatus === "success" && (
                        <div className="rollout-chart">
                            {rollout.map((item, index) => (
                                <RolloutBar
                                    key={index}
                                    value={item.value}
                                    height={(item.value / maxRollout) * 100}
                                    label={item.week}
                                />
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Breakdowns: Type / Effect / Improvement */}
            {kpiStatus === "error" ? (
                <Card className="analytics-card">
                    <ErrorInline onRetry={retryKpi} />
                </Card>
            ) : (
                <div className="breakdown-grid">
                    {breakdownCards.map((card) => (
                        <BreakdownCard key={card.title} {...card} />
                    ))}
                </div>
            )}

            {/* Customer Reach Leaderboard */}
            <Card className="analytics-card leaderboard-card">
                <div className="section-header">
                    <div>
                        <h2>Enhancement Leaderboard</h2>
                        <p>Ranked by customers reached · red bars are likely misconfigured or not yet live, not truly low-value</p>
                    </div>
                    {kpiStatus === "success" && (
                        <strong className="total-customers">{totalCustomers.toLocaleString()}</strong>
                    )}
                </div>

                {kpiStatus === "error" && <ErrorInline onRetry={retryKpi} />}

                {kpiStatus === "loading" && <SkeletonLine width="100%" height={160} />}

                {kpiStatus === "success" && (
                    <div className="leaderboard">
                        {leaderboard.map((site, index) => (
                            <div className="leaderboard-row" key={site.site_name}>
                                <div className="rank">#{index + 1}</div>

                                <div>
                                    <div className="site-name">{site.site_name}</div>
                                    <div className="site-objective">{site.objective}</div>
                                </div>

                                <div className="leaderboard-bar">
                                    <div
                                        className={`leaderboard-fill ${site.performance}`}
                                        style={{ width: `${site.percentage}%` }}
                                    />
                                </div>

                                <div className="customer-value">
                                    {site.customers_total.toLocaleString()}
                                    {site.performance === "low" && (
                                        <Badge variant="danger" className="investigate-badge">
                                            ⚑ investigate
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

export default Analytics;