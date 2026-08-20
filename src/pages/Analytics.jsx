import { useEffect, useState } from "react";
import "./Analytics.css";

/*
|--------------------------------------------------------------------------
| API Endpoints
|--------------------------------------------------------------------------
*/

const TREND_API = "/api/v1/analytics/trend";
const KPIS_API = "/api/v1/analytics/kpis";

/*
|--------------------------------------------------------------------------
| Dummy Data
| Temporary data with the SAME shape as the APIs
|--------------------------------------------------------------------------
*/

const dummyTrendData = [
    {
        week_number: 18,
        customers_total: 4200,
        new_sites_total: 2200,
    },
    {
        week_number: 19,
        customers_total: 4550,
        new_sites_total: 2400,
    },
    {
        week_number: 20,
        customers_total: 4300,
        new_sites_total: 2250,
    },
    {
        week_number: 21,
        customers_total: 4800,
        new_sites_total: 2500,
    },
    {
        week_number: 22,
        customers_total: 5100,
        new_sites_total: 2700,
    },
    {
        week_number: 23,
        customers_total: 5400,
        new_sites_total: 2850,
    },
    {
        week_number: 24,
        customers_total: 5200,
        new_sites_total: 2700,
    },
    {
        week_number: 25,
        customers_total: 5800,
        new_sites_total: 3050,
    },
    {
        week_number: 26,
        customers_total: 6100,
        new_sites_total: 3200,
    },
    {
        week_number: 27,
        customers_total: 6450,
        new_sites_total: 3400,
    },
];

const dummyKpiData = [
    {
        site_name: "NASR-CITY-MALL-07",
        customers_total: 1850,
        improvement: "Outdoor",
        objective: "Densification",
        effect_type: "Major",
        category: "New Site",
    },
    {
        site_name: "BADR-CITY-IND",
        customers_total: 1610,
        improvement: "Outdoor",
        objective: "Densification",
        effect_type: "Major",
        category: "New Site",
    },
    {
        site_name: "FAISAL-PYRAMIDS",
        customers_total: 520,
        improvement: "Outdoor",
        objective: "Road",
        effect_type: "Minor",
        category: "Upgrade",
    },
    {
        site_name: "OBOUR-CITY-GATE",
        customers_total: 180,
        improvement: "Outdoor",
        objective: "Densification",
        effect_type: "Minor",
        category: "New Site",
    },
    {
        site_name: "MAADI-CORNICHE-02",
        customers_total: 740,
        improvement: "Indoor",
        objective: "Coverage",
        effect_type: "Major",
        category: "Upgrade",
    },
    {
        site_name: "ZAMALEK-26JULY",
        customers_total: 430,
        improvement: "Indoor",
        objective: "Capacity",
        effect_type: "Minor",
        category: "Upgrade",
    },
    {
        site_name: "AIN-SHAMS-UNI",
        customers_total: 980,
        improvement: "Outdoor",
        objective: "Coverage",
        effect_type: "Major",
        category: "New Site",
    },
    {
        site_name: "GIZA-PYRAMIDS-RD",
        customers_total: 620,
        improvement: "Outdoor",
        objective: "Road",
        effect_type: "Minor",
        category: "Upgrade",
    },
];

/*
|--------------------------------------------------------------------------
| Analytics Component
|--------------------------------------------------------------------------
*/

function Analytics() {
    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [trendData, setTrendData] = useState(dummyTrendData);
    const [kpiData, setKpiData] = useState(dummyKpiData);

    const [trendSplit, setTrendSplit] = useState("both");
    const [trendLevel, setTrendLevel] = useState("site");

    /*
    |--------------------------------------------------------------------------
    | API Calls
    |--------------------------------------------------------------------------
    | Currently using dummy data.
    | When backend is ready, uncomment the code inside this useEffect.
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        /*
        const fetchAnalytics = async () => {
          try {
            const [trendResponse, kpiResponse] = await Promise.all([
              fetch(TREND_API),
              fetch(KPIS_API),
            ]);
    
            if (!trendResponse.ok || !kpiResponse.ok) {
              throw new Error("Failed to fetch analytics data");
            }
    
            const trendResult = await trendResponse.json();
            const kpiResult = await kpiResponse.json();
    
            setTrendData(trendResult);
            setKpiData(kpiResult);
          } catch (error) {
            console.error("Analytics API Error:", error);
          }
        };
    
        fetchAnalytics();
        */
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Trend Calculations
    |--------------------------------------------------------------------------
    */

    const getTrendSeries = () => {
        return trendData.map((item) => {
            /*
             * Site-level
             */
            if (trendLevel === "site") {
                if (trendSplit === "new") {
                    return item.new_sites_total;
                }

                if (trendSplit === "upgrade") {
                    return (
                        item.customers_total -
                        item.new_sites_total
                    );
                }

                return item.customers_total;
            }

            /*
             * Cell-level
             * Temporary calculation until backend provides
             * separate cell-level values.
             */
            const cellTotal = item.customers_total * 3.4;
            const cellNew = item.new_sites_total * 3.4;

            if (trendSplit === "new") {
                return cellNew;
            }

            if (trendSplit === "upgrade") {
                return cellTotal - cellNew;
            }

            return cellTotal;
        });
    };

    const trendSeries = getTrendSeries();

    const maxTrendValue = Math.max(
        ...trendSeries,
        1
    );

    /*
    |--------------------------------------------------------------------------
    | Trend Subtitle
    |--------------------------------------------------------------------------
    */

    const trendSubtitle =
        `${trendLevel === "site" ? "Site-level" : "Cell-level"} · ` +
        (
            trendSplit === "both"
                ? "New + Upgrades combined"
                : trendSplit === "new"
                    ? "New sites only"
                    : "Upgrades only"
        );

    /*
    |--------------------------------------------------------------------------
    | KPI Calculations
    |--------------------------------------------------------------------------
    */

    const totalCustomers = kpiData.reduce(
        (total, site) =>
            total + site.customers_total,
        0
    );

    /*
    |--------------------------------------------------------------------------
    | Type Breakdown
    |--------------------------------------------------------------------------
    */

    const newSitesCount = kpiData.filter(
        (site) => site.category === "New Site"
    ).length;

    const upgradeSitesCount = kpiData.filter(
        (site) => site.category === "Upgrade"
    ).length;

    const typeTotal =
        newSitesCount + upgradeSitesCount;

    const typeBreakdown = [
        {
            label: "New Sites",
            count: newSitesCount,
            percentage: typeTotal
                ? Math.round(
                    (newSitesCount / typeTotal) * 100
                )
                : 0,
            className: "orange",
        },
        {
            label: "Upgrades",
            count: upgradeSitesCount,
            percentage: typeTotal
                ? Math.round(
                    (upgradeSitesCount / typeTotal) * 100
                )
                : 0,
            className: "teal",
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | Effect Breakdown
    |--------------------------------------------------------------------------
    */

    const majorCount = kpiData.filter(
        (site) => site.effect_type === "Major"
    ).length;

    const minorCount = kpiData.filter(
        (site) => site.effect_type === "Minor"
    ).length;

    const effectTotal =
        majorCount + minorCount;

    const effectBreakdown = [
        {
            label: "Major",
            count: majorCount,
            percentage: effectTotal
                ? Math.round(
                    (majorCount / effectTotal) * 100
                )
                : 0,
        },
        {
            label: "Minor",
            count: minorCount,
            percentage: effectTotal
                ? Math.round(
                    (minorCount / effectTotal) * 100
                )
                : 0,
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | Improvement Breakdown
    |--------------------------------------------------------------------------
    */

    const outdoorCount = kpiData.filter(
        (site) => site.improvement === "Outdoor"
    ).length;

    const indoorCount = kpiData.filter(
        (site) => site.improvement === "Indoor"
    ).length;

    const improvementTotal =
        outdoorCount + indoorCount;

    const improvementBreakdown = [
        {
            label: "Outdoor",
            count: outdoorCount,
            percentage: improvementTotal
                ? Math.round(
                    (outdoorCount / improvementTotal) * 100
                )
                : 0,
        },
        {
            label: "Indoor",
            count: indoorCount,
            percentage: improvementTotal
                ? Math.round(
                    (indoorCount / improvementTotal) * 100
                )
                : 0,
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | Leaderboard
    |--------------------------------------------------------------------------
    */

    const leaderboard = [...kpiData]
        .sort(
            (a, b) =>
                b.customers_total -
                a.customers_total
        )
        .map((site) => ({
            ...site,
            percentage: Math.max(
                2,
                Math.round(
                    (site.customers_total /
                        Math.max(
                            ...kpiData.map(
                                (item) =>
                                    item.customers_total
                            )
                        )) *
                    100
                )
            ),
        }));

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="analytics-page">

            {/* =====================================================
          PAGE HEADER
      ===================================================== */}

            <div className="analytics-header">
                <div>
                    <h1>Analytics & Trends</h1>

                    <p>
                        Track network enhancement trends
                        and performance.
                    </p>
                </div>
            </div>

            {/* =====================================================
          TREND SECTION
      ===================================================== */}

            <section className="analytics-card">

                <div className="section-header">

                    <div>
                        <h2>Customer Trend</h2>

                        <p>
                            {trendSubtitle}
                        </p>
                    </div>

                    <div className="controls">

                        {/* Trend Split */}

                        <div className="control-group">

                            <button
                                className={
                                    trendSplit === "both"
                                        ? "control-button active"
                                        : "control-button"
                                }
                                onClick={() =>
                                    setTrendSplit("both")
                                }
                            >
                                Both
                            </button>

                            <button
                                className={
                                    trendSplit === "new"
                                        ? "control-button active"
                                        : "control-button"
                                }
                                onClick={() =>
                                    setTrendSplit("new")
                                }
                            >
                                New Sites
                            </button>

                            <button
                                className={
                                    trendSplit === "upgrade"
                                        ? "control-button active"
                                        : "control-button"
                                }
                                onClick={() =>
                                    setTrendSplit("upgrade")
                                }
                            >
                                Upgrades
                            </button>

                        </div>

                        {/* Trend Level */}

                        <div className="control-group">

                            <button
                                className={
                                    trendLevel === "site"
                                        ? "control-button active"
                                        : "control-button"
                                }
                                onClick={() =>
                                    setTrendLevel("site")
                                }
                            >
                                Site-level
                            </button>

                            <button
                                className={
                                    trendLevel === "cell"
                                        ? "control-button active"
                                        : "control-button"
                                }
                                onClick={() =>
                                    setTrendLevel("cell")
                                }
                            >
                                Cell-level
                            </button>

                        </div>

                    </div>
                </div>

                {/* Chart */}

                <div className="trend-chart">

                    <div className="chart-y-axis">

                        <span>
                            {maxTrendValue.toLocaleString()}
                        </span>

                        <span>
                            {Math.round(
                                maxTrendValue * 0.75
                            ).toLocaleString()}
                        </span>

                        <span>
                            {Math.round(
                                maxTrendValue * 0.5
                            ).toLocaleString()}
                        </span>

                        <span>
                            {Math.round(
                                maxTrendValue * 0.25
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

                            {trendSeries.map(
                                (value, index) => {

                                    const height =
                                        Math.max(
                                            6,
                                            (value /
                                                maxTrendValue) *
                                            100
                                        );

                                    return (
                                        <div
                                            className="bar-wrapper"
                                            key={
                                                trendData[index]
                                                    .week_number
                                            }
                                        >

                                            <span className="bar-value">
                                                {Math.round(
                                                    value
                                                ).toLocaleString()}
                                            </span>

                                            <div
                                                className={`trend-bar ${trendSplit}`}
                                                style={{
                                                    height:
                                                        `${height}%`,
                                                }}
                                            />

                                            <span className="week-label">
                                                W
                                                {
                                                    trendData[index]
                                                        .week_number
                                                }
                                            </span>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </div>

                </div>

            </section>

            {/* =====================================================
          KPI BREAKDOWNS
      ===================================================== */}

            <div className="breakdown-grid">

                {/* Type */}

                <section className="analytics-card">

                    <div className="section-header">
                        <div>
                            <h2>Type Breakdown</h2>
                            <p>Enhancement distribution</p>
                        </div>
                    </div>

                    <div className="breakdown-list">

                        {typeBreakdown.map(
                            (item) => (
                                <div
                                    className="breakdown-item"
                                    key={item.label}
                                >

                                    <div className="breakdown-info">

                                        <span>
                                            <span
                                                className={`legend-dot ${item.className}`}
                                            />

                                            {item.label}
                                        </span>

                                        <strong>
                                            {item.count}
                                        </strong>

                                    </div>

                                    <div className="progress-bar">
                                        <div
                                            className={`progress-fill ${item.className}`}
                                            style={{
                                                width:
                                                    `${item.percentage}%`,
                                            }}
                                        />
                                    </div>

                                    <span className="percentage">
                                        {item.percentage}%
                                    </span>

                                </div>
                            )
                        )}

                    </div>

                </section>

                {/* Effect */}

                <section className="analytics-card">

                    <div className="section-header">
                        <div>
                            <h2>Effect Breakdown</h2>
                            <p>Impact level distribution</p>
                        </div>
                    </div>

                    <div className="breakdown-list">

                        {effectBreakdown.map(
                            (item) => (
                                <div
                                    className="breakdown-item"
                                    key={item.label}
                                >

                                    <div className="breakdown-info">

                                        <span>
                                            <span className="legend-dot gray" />
                                            {item.label}
                                        </span>

                                        <strong>
                                            {item.count}
                                        </strong>

                                    </div>

                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill gray"
                                            style={{
                                                width:
                                                    `${item.percentage}%`,
                                            }}
                                        />
                                    </div>

                                    <span className="percentage">
                                        {item.percentage}%
                                    </span>

                                </div>
                            )
                        )}

                    </div>

                </section>

                {/* Improvement */}

                <section className="analytics-card">

                    <div className="section-header">
                        <div>
                            <h2>Improvement Breakdown</h2>
                            <p>Improvement type distribution</p>
                        </div>
                    </div>

                    <div className="breakdown-list">

                        {improvementBreakdown.map(
                            (item) => (
                                <div
                                    className="breakdown-item"
                                    key={item.label}
                                >

                                    <div className="breakdown-info">

                                        <span>
                                            <span className="legend-dot gray" />
                                            {item.label}
                                        </span>

                                        <strong>
                                            {item.count}
                                        </strong>

                                    </div>

                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill gray"
                                            style={{
                                                width:
                                                    `${item.percentage}%`,
                                            }}
                                        />
                                    </div>

                                    <span className="percentage">
                                        {item.percentage}%
                                    </span>

                                </div>
                            )
                        )}

                    </div>

                </section>

            </div>

            {/* =====================================================
          LEADERBOARD
      ===================================================== */}

            <section className="analytics-card leaderboard-card">

                <div className="section-header">

                    <div>
                        <h2>Customer Reach Leaderboard</h2>

                        <p>
                            Sites ranked by total customers
                        </p>
                    </div>

                    <strong className="total-customers">
                        {totalCustomers.toLocaleString()}
                    </strong>

                </div>

                <div className="leaderboard">

                    {leaderboard.map(
                        (site, index) => (
                            <div
                                className="leaderboard-row"
                                key={site.site_name}
                            >

                                <div className="rank">
                                    #{index + 1}
                                </div>

                                <div className="site-info">

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
                                            width:
                                                `${site.percentage}%`,
                                        }}
                                    />

                                </div>

                                <div className="customer-value">
                                    {site.customers_total.toLocaleString()}
                                </div>

                            </div>
                        )
                    )}

                </div>

            </section>

        </div>
    );
}

export default Analytics;