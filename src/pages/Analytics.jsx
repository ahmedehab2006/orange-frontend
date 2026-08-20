import { useMemo, useState } from "react";
import "./Analytics.css";

import {
    API_CONFIG,
    MOCK_ANALYTICS_TREND,
    MOCK_ANALYTICS_KPIS,
    useApiData,
} from "../api";

import {
    Card,
    BreakdownRow,
    TrendBar,
    RolloutBar,
} from "../Components.jsx";

function Analytics() {
    const [trendSplit, setTrendSplit] = useState("both");
    const [trendLevel, setTrendLevel] = useState("site");

    const { data: trendResult } = useApiData(
        API_CONFIG.endpoints.analyticsTrend,
        {},
        MOCK_ANALYTICS_TREND
    );

    const { data: kpiResult } = useApiData(
        API_CONFIG.endpoints.analyticsKpis,
        {},
        MOCK_ANALYTICS_KPIS
    );

    const trendData = trendResult || [];
    const kpiData = kpiResult || [];
    const trend = useMemo(() => {
        return trendData.map((item) => {
            let total = item.customers_total;
            let newSites = item.new_sites_total;

            if (trendLevel === "cell") {
                total *= 3.4;
                newSites *= 3.4;
            }

            if (trendSplit === "new") return newSites;
            if (trendSplit === "upgrade") return total - newSites;

            return total;
        });
    }, [trendData, trendSplit, trendLevel]);

    const maxTrend = Math.max(...trend, 1);

    const rollout = useMemo(
        () =>
            trendData.map((item) => ({
                week: `W${item.week_number}`,
                value: Math.max(
                    1,
                    Math.round(item.new_sites_total / 40)
                ),
            })),
        [trendData]
    );

    const maxRollout = Math.max(
        ...rollout.map((item) => item.value),
        1
    );

    const count = (key, value) =>
        kpiData.filter((item) => item[key] === value).length;

    const percentage = (value, total) =>
        total ? Math.round((value / total) * 100) : 0;

    const newSites = count("category", "New Site");
    const upgrades = count("category", "Upgrade");

    const major = count("effect_type", "Major");
    const minor = count("effect_type", "Minor");

    const outdoor = count("improvement", "Outdoor");
    const indoor = count("improvement", "Indoor");

    const leaderboard = useMemo(() => {
        const max = Math.max(
            ...kpiData.map((item) => item.customers_total),
            1
        );

        return [...kpiData]
            .sort(
                (a, b) =>
                    b.customers_total - a.customers_total
            )
            .map((site) => ({
                ...site,
                percentage: Math.round(
                    (site.customers_total / max) * 100
                ),
            }));
    }, [kpiData]);

    const totalCustomers = kpiData.reduce(
        (sum, item) => sum + item.customers_total,
        0
    );

    return (
        <div className="analytics-page">

            <div className="analytics-header">
                <h1>Analytics & Trends</h1>
                <p>
                    Track network enhancement trends and
                    performance.
                </p>
            </div>

            <div className="analytics-controls">

                <div className="control-group">
                    {[
                        ["both", "Both"],
                        ["new", "New Sites"],
                        ["upgrade", "Upgrades"],
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            className={
                                trendSplit === value
                                    ? "control-button active"
                                    : "control-button"
                            }
                            onClick={() =>
                                setTrendSplit(value)
                            }
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="control-group">
                    {[
                        ["site", "Site-level"],
                        ["cell", "Cell-level"],
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            className={
                                trendLevel === value
                                    ? "control-button active"
                                    : "control-button"
                            }
                            onClick={() =>
                                setTrendLevel(value)
                            }
                        >
                            {label}
                        </button>
                    ))}
                </div>

            </div>

            <div className="analytics-charts">

                <Card className="analytics-card">
                    <div className="section-header">
                        <div>
                            <h2>
                                Customers Reached —
                                Weekly Trend
                            </h2>
                            <p>
                                {trendLevel === "site"
                                    ? "Site-level"
                                    : "Cell-level"}{" "}
                                ·{" "}
                                {trendSplit === "both"
                                    ? "New + Upgrades combined"
                                    : trendSplit === "new"
                                        ? "New sites only"
                                        : "Upgrades only"}
                            </p>
                        </div>
                    </div>

                    <div className="trend-chart">

                        <div className="chart-y-axis">
                            <span>
                                {maxTrend.toLocaleString()}
                            </span>
                            <span>
                                {Math.round(
                                    maxTrend * 0.75
                                ).toLocaleString()}
                            </span>
                            <span>
                                {Math.round(
                                    maxTrend * 0.5
                                ).toLocaleString()}
                            </span>
                            <span>
                                {Math.round(
                                    maxTrend * 0.25
                                ).toLocaleString()}
                            </span>
                            <span>0</span>
                        </div>

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
                                        value={Math.round(
                                            value
                                        ).toLocaleString()}
                                        height={
                                            (value /
                                                maxTrend) *
                                            100
                                        }
                                        label={`W${trendData[index]
                                            ?.week_number
                                            }`}
                                        color={trendSplit}
                                    />
                                ))}
                            </div>

                        </div>
                    </div>
                </Card>

                <Card className="analytics-card">
                    <div className="section-header">
                        <div>
                            <h2>Rollout Over Time</h2>
                            <p>
                                Sites going live per week
                            </p>
                        </div>
                    </div>

                    <div className="rollout-chart">
                        {rollout.map((item, index) => (
                            <RolloutBar
                                key={index}
                                value={item.value}
                                height={
                                    (item.value /
                                        maxRollout) *
                                    100
                                }
                                label={item.week}
                            />
                        ))}
                    </div>
                </Card>

            </div>

            <div className="breakdown-grid">

                <Card className="analytics-card">
                    <div className="section-header">
                        <div>
                            <h2>Type Breakdown</h2>
                            <p>
                                Enhancement distribution
                            </p>
                        </div>
                    </div>

                    <div className="breakdown-list">
                        <BreakdownRow
                            label="New Sites"
                            count={newSites}
                            percentage={percentage(
                                newSites,
                                newSites + upgrades
                            )}
                            color="orange"
                        />

                        <BreakdownRow
                            label="Upgrades"
                            count={upgrades}
                            percentage={percentage(
                                upgrades,
                                newSites + upgrades
                            )}
                            color="teal"
                        />
                    </div>
                </Card>

                <Card className="analytics-card">
                    <div className="section-header">
                        <div>
                            <h2>Effect Breakdown</h2>
                            <p>
                                Impact level distribution
                            </p>
                        </div>
                    </div>

                    <div className="breakdown-list">
                        <BreakdownRow
                            label="Major"
                            count={major}
                            percentage={percentage(
                                major,
                                major + minor
                            )}
                            color="gray"
                        />

                        <BreakdownRow
                            label="Minor"
                            count={minor}
                            percentage={percentage(
                                minor,
                                major + minor
                            )}
                            color="gray"
                        />
                    </div>
                </Card>

                <Card className="analytics-card">
                    <div className="section-header">
                        <div>
                            <h2>
                                Improvement Breakdown
                            </h2>
                            <p>
                                Improvement type distribution
                            </p>
                        </div>
                    </div>

                    <div className="breakdown-list">
                        <BreakdownRow
                            label="Outdoor"
                            count={outdoor}
                            percentage={percentage(
                                outdoor,
                                outdoor + indoor
                            )}
                            color="orange"
                        />

                        <BreakdownRow
                            label="Indoor"
                            count={indoor}
                            percentage={percentage(
                                indoor,
                                outdoor + indoor
                            )}
                            color="teal"
                        />
                    </div>
                </Card>

            </div>

            <Card className="analytics-card leaderboard-card">

                <div className="section-header">
                    <div>
                        <h2>
                            Customer Reach Leaderboard
                        </h2>
                        <p>
                            Sites ranked by total customers
                        </p>
                    </div>

                    <strong className="total-customers">
                        {totalCustomers.toLocaleString()}
                    </strong>
                </div>

                <div className="leaderboard">
                    {leaderboard.map((site, index) => (
                        <div
                            className="leaderboard-row"
                            key={site.site_name}
                        >
                            <div className="rank">
                                #{index + 1}
                            </div>

                            <div>
                                <div className="site-name">
                                    {site.site_name}
                                </div>

                                <div className="site-objective">
                                    {site.objective}
                                </div>
                            </div>

                            <div className="leaderboard-bar">
                                <div
                                    className="leaderboard-fill"
                                    style={{
                                        width: `${site.percentage}%`,
                                    }}
                                />
                            </div>

                            <div className="customer-value">
                                {site.customers_total.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>

            </Card>

        </div>
    );
}

export default Analytics;