// Analytics page — weekly trend, rollout, breakdowns, and the
// customer-reach leaderboard.

import { useMemo, useState } from "react";
import "./Analytics.css";

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
} from "../Components.jsx";

const TREND_SPLIT_OPTIONS = [
    ["both", "Both"],
    ["new", "New Sites"],
    ["upgrade", "Upgrades"],
];

const TREND_LEVEL_OPTIONS = [
    ["site", "Site-level"],
    ["cell", "Cell-level"],
];

// Show a compact fixed number of weeks at a time.
// Pagination keeps the chart readable even with a long history.
const WEEKS_PER_PAGE = 15;

// Cell-level is derived from the site-level mock by scaling up —
// there's no separate cell-level endpoint yet.
const CELL_LEVEL_SCALE = 3.4;

function Analytics() {
    const [trendSplit, setTrendSplit] = useState("both");
    const [trendLevel, setTrendLevel] = useState("site");
    const [weekPage, setWeekPage] = useState(0);

    const {
        data: trendResult,
        status: trendStatus,
        retry: retryTrend,
    } = useApiData(API_CONFIG.endpoints.analyticsTrend, {}, MOCK_ANALYTICS_TREND);

    const {
        data: kpiResult,
        status: kpiStatus,
        retry: retryKpi,
    } = useApiData(API_CONFIG.endpoints.analyticsKpis, {}, MOCK_ANALYTICS_KPIS);

    const fullTrendData = trendResult || [];
    const kpiData = kpiResult || [];

    // Show only a compact page of weeks at a time.
    const totalWeekPages = Math.max(
        1,
        Math.ceil(fullTrendData.length / WEEKS_PER_PAGE)
    );

    const currentWeekPage = Math.min(
        weekPage,
        totalWeekPages - 1
    );

    const startWeek = currentWeekPage * WEEKS_PER_PAGE;
    const endWeek = startWeek + WEEKS_PER_PAGE;

    const trendData = useMemo(() => {
        return fullTrendData.slice(startWeek, endWeek);
    }, [fullTrendData, startWeek, endWeek]);

    // Weekly trend values, filtered by split (both/new/upgrade) and
    // scaled by level (site/cell).
    const trend = useMemo(() => {
        return trendData.map((item) => {
            const scale = trendLevel === "cell" ? CELL_LEVEL_SCALE : 1;
            const total = item.customers_total * scale;
            const newSites = item.new_sites_total * scale;

            if (trendSplit === "new") return newSites;
            if (trendSplit === "upgrade") return total - newSites;
            return total;
        });
    }, [trendData, trendSplit, trendLevel]);

    // Scale the visible 15-week page to the available chart height.
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

    const trendSubtitle = `${trendLevel === "site" ? "Site-level" : "Cell-level"} · ${trendSplit === "both"
        ? "New + Upgrades combined"
        : trendSplit === "new"
            ? "New sites only"
            : "Upgrades only"
        }`;

    return (
        <div className="analytics-page">
            <div className="analytics-controls">
                <ToggleGroup options={TREND_SPLIT_OPTIONS} value={trendSplit} onChange={setTrendSplit} />

                <div className="analytics-right-controls">
                    <div className="week-pagination">
                        <button
                            className="week-page-button"
                            onClick={() =>
                                setWeekPage((page) => Math.max(page - 1, 0))
                            }
                            disabled={weekPage === 0}
                            aria-label="Previous weeks"
                        >
                            ‹
                        </button>

                        <span className="week-page-info">
                            {startWeek + 1}–{Math.min(endWeek, trendData.length)}
                        </span>

                        <button
                            className="week-page-button"
                            onClick={() =>
                                setWeekPage((page) =>
                                    Math.min(page + 1, totalWeekPages - 1)
                                )
                            }
                            disabled={weekPage >= totalWeekPages - 1}
                            aria-label="Next weeks"
                        >
                            ›
                        </button>
                    </div>

                    <ToggleGroup
                        options={TREND_LEVEL_OPTIONS}
                        value={trendLevel}
                        onChange={setTrendLevel}
                    />
                </div>
            </div>

            <div className="analytics-charts">
                {/* Customers Reached — Weekly Trend */}
                <Card className="analytics-card">
                    <div className="section-header">
                        <div>
                            <h2>Customers Reached — Weekly Trend</h2>
                            <p>
                                Weekly customers reached through network enhancements
                            </p>
                        </div>
                    </div>

                    <div className="trend-chart">
                        <div className="chart-area">

                            <div className="chart-grid">
                                <span />
                                <span />
                                <span />
                                <span />
                                <span />
                            </div>

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