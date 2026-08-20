// ======================================================
// 1) Imports
// بنستورد React hooks + CSS + الـ API + الـ Components المشتركة
// ======================================================

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


// ======================================================
// 2) Analytics Component
// ده الـ component الرئيسي الخاص بصفحة Analytics
// ======================================================

function Analytics() {

    // --------------------------------------------------
    // 3) State الخاصة بالـ Trend
    // trendSplit:
    // Both / New Sites / Upgrades
    //
    // trendLevel:
    // Site-level / Cell-level
    // --------------------------------------------------

    const [trendSplit, setTrendSplit] = useState("both");
    const [trendLevel, setTrendLevel] = useState("site");


    // ==================================================
    // 4) API Call رقم 1 - Weekly Trend
    //
    // بيجيب بيانات الـ Customers Reached لكل أسبوع.
    // حاليًا MOCK_MODE = true لذلك بياخد
    // MOCK_ANALYTICS_TREND من api.js.
    // ==================================================

    const { data: trendResult } = useApiData(
        API_CONFIG.endpoints.analyticsTrend,
        {},
        MOCK_ANALYTICS_TREND
    );


    // ==================================================
    // 5) API Call رقم 2 - Analytics KPIs
    //
    // بيجيب بيانات المواقع المستخدمة في:
    // - Breakdowns
    // - Leaderboard
    // ==================================================

    const { data: kpiResult } = useApiData(
        API_CONFIG.endpoints.analyticsKpis,
        {},
        MOCK_ANALYTICS_KPIS
    );


    // ==================================================
    // 6) حماية من null
    //
    // useApiData بيبدأ data بـ null.
    // لذلك لو البيانات لسه مجاش:
    // نستخدم Array فاضية بدل null
    // عشان نقدر نستخدم map / filter بدون Error.
    // ==================================================

    const trendData = trendResult || [];
    const kpiData = kpiResult || [];


    // ==================================================
    // 7) تجهيز بيانات Weekly Trend
    //
    // هنا بنحدد القيمة اللي هتظهر في الـ chart
    // حسب اختيار المستخدم:
    //
    // Both     -> كل العملاء
    // New      -> العملاء من New Sites
    // Upgrade  -> العملاء من Upgrades
    // ==================================================

    const trend = useMemo(() => {

        return trendData.map((item) => {

            let total = item.customers_total;
            let newSites = item.new_sites_total;


            // ------------------------------------------
            // لو المستخدم اختار Cell-level
            // بنعمل scaling للـ mock data الحالية.
            // ------------------------------------------

            if (trendLevel === "cell") {
                total *= 3.4;
                newSites *= 3.4;
            }


            // ------------------------------------------
            // New Sites فقط
            // ------------------------------------------

            if (trendSplit === "new") {
                return newSites;
            }


            // ------------------------------------------
            // Upgrades فقط
            // ------------------------------------------

            if (trendSplit === "upgrade") {
                return total - newSites;
            }


            // ------------------------------------------
            // Both
            // ------------------------------------------

            return total;

        });

    }, [trendData, trendSplit, trendLevel]);


    // ==================================================
    // 8) أكبر قيمة في الـ Trend
    //
    // بنستخدمها عشان نحسب ارتفاع كل Bar
    // كنسبة من أكبر Bar.
    // ==================================================

    const maxTrend = Math.max(...trend, 1);


    // ==================================================
    // 9) تجهيز بيانات Rollout
    //
    // بنستخدم بيانات الـ Trend الحالية ونطلع منها
    // عدد الـ sites اللي هتظهر في كل أسبوع.
    //
    // حاليًا ده Mock calculation في الـ frontend.
    // ==================================================

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


    // ==================================================
    // 10) أكبر قيمة في Rollout
    // عشان نحدد ارتفاع كل Bar.
    // ==================================================

    const maxRollout = Math.max(
        ...rollout.map((item) => item.value),
        1
    );


    // ==================================================
    // 11) Helper لحساب عدد العناصر
    //
    // مثال:
    // count("category", "New Site")
    //
    // معناها:
    // هات عدد المواقع اللي category بتاعتها New Site.
    // ==================================================

    const count = (key, value) =>
        kpiData.filter((item) => item[key] === value).length;


    // ==================================================
    // 12) Helper لحساب النسبة المئوية
    //
    // مثال:
    // 4 من 8 = 50%
    // ==================================================

    const percentage = (value, total) =>
        total ? Math.round((value / total) * 100) : 0;


    // ==================================================
    // 13) Type Breakdown
    //
    // بنحسب عدد:
    // New Sites
    // Upgrades
    // ==================================================

    const newSites = count("category", "New Site");
    const upgrades = count("category", "Upgrade");


    // ==================================================
    // 14) Effect Breakdown
    //
    // بنحسب:
    // Major
    // Minor
    // ==================================================

    const major = count("effect_type", "Major");
    const minor = count("effect_type", "Minor");


    // ==================================================
    // 15) Improvement Breakdown
    //
    // بنحسب:
    // Outdoor
    // Indoor
    // ==================================================

    const outdoor = count("improvement", "Outdoor");
    const indoor = count("improvement", "Indoor");


    // ==================================================
    // 16) تجهيز Leaderboard
    //
    // بنرتب المواقع من الأعلى في عدد العملاء
    // إلى الأقل.
    // ==================================================

    const leaderboard = useMemo(() => {

        // ----------------------------------------------
        // أكبر عدد عملاء عند أي Site
        // ----------------------------------------------

        const max = Math.max(
            ...kpiData.map(
                (item) => item.customers_total
            ),
            1
        );


        // ----------------------------------------------
        // Sort + حساب نسبة كل Site
        // ----------------------------------------------

        return [...kpiData]
            .sort(
                (a, b) =>
                    b.customers_total -
                    a.customers_total
            )
            .map((site) => ({
                ...site,

                percentage: Math.round(
                    (site.customers_total / max) * 100
                ),
            }));

    }, [kpiData]);


    // ==================================================
    // 17) إجمالي عدد العملاء
    //
    // reduce بتجمع customers_total لكل المواقع.
    // ==================================================

    const totalCustomers = kpiData.reduce(
        (sum, item) =>
            sum + item.customers_total,
        0
    );


    // ==================================================
    // 18) بداية الـ UI
    // ==================================================

    return (
        <div className="analytics-page">


            {/* ==========================================
                19) Page Header
                عنوان صفحة Analytics
               ========================================== */}

            <div className="analytics-header">
                <h1>Analytics & Trends</h1>

                <p>
                    Track network enhancement trends
                    and performance.
                </p>
            </div>


            {/* ==========================================
                20) Trend Controls
                أزرار Both / New Sites / Upgrades
                و Site-level / Cell-level
               ========================================== */}

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


            {/* ==================================================
                21) Charts Section
                فيها:
                - Customers Reached — Weekly Trend
                - Rollout Over Time
               ================================================== */}

            <div className="analytics-charts">


                {/* ==============================================
                    22) Customers Reached — Weekly Trend
                   ============================================== */}

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


                    {/* ------------------------------------------
                        الـ Chart نفسه
                       ------------------------------------------ */}

                    <div className="trend-chart">


                        {/* Y Axis */}

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

                            {/* Grid Lines */}

                            <div className="chart-grid">
                                <span />
                                <span />
                                <span />
                                <span />
                                <span />
                            </div>


                            {/* Bars */}

                            <div className="bars">

                                {trend.map(
                                    (value, index) => (

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

                                    )
                                )}

                            </div>

                        </div>

                    </div>

                </Card>


                {/* ==============================================
                    23) Rollout Over Time
                   ============================================== */}

                <Card className="analytics-card">

                    <div className="section-header">

                        <div>

                            <h2>
                                Rollout Over Time
                            </h2>

                            <p>
                                Sites going live per week
                            </p>

                        </div>

                    </div>


                    <div className="rollout-chart">

                        {rollout.map(
                            (item, index) => (

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

                            )
                        )}

                    </div>

                </Card>

            </div>


            {/* ==================================================
                24) Breakdowns
                ثلاثة Cards:
                - Type
                - Effect
                - Improvement
               ================================================== */}

            <div className="breakdown-grid">


                {/* Type Breakdown */}

                <Card className="analytics-card">

                    <div className="section-header">

                        <div>
                            <h2>
                                By Enhancement Type
                            </h2>

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


                {/* Effect Breakdown */}

                <Card className="analytics-card">

                    <div className="section-header">

                        <div>
                            <h2>
                                By Effect Type
                            </h2>

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


                {/* Improvement Breakdown */}

                <Card className="analytics-card">

                    <div className="section-header">

                        <div>
                            <h2>
                                By Improvement Type
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


            {/* ==================================================
                25) Customer Reach Leaderboard
                ترتيب المواقع حسب عدد العملاء.
               ================================================== */}

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


                    {/* إجمالي العملاء */}

                    <strong className="total-customers">
                        {totalCustomers.toLocaleString()}
                    </strong>

                </div>


                {/* قائمة المواقع */}

                <div className="leaderboard">

                    {leaderboard.map(
                        (site, index) => (

                            <div
                                className="leaderboard-row"
                                key={site.site_name}
                            >

                                {/* Rank */}

                                <div className="rank">
                                    #{index + 1}
                                </div>


                                {/* Site Info */}

                                <div>

                                    <div className="site-name">
                                        {site.site_name}
                                    </div>

                                    <div className="site-objective">
                                        {site.objective}
                                    </div>

                                </div>


                                {/* Progress Bar */}

                                <div className="leaderboard-bar">

                                    <div
                                        className="leaderboard-fill"
                                        style={{
                                            width:
                                                `${site.percentage}%`,
                                        }}
                                    />

                                </div>


                                {/* Customers */}

                                <div className="customer-value">
                                    {site.customers_total.toLocaleString()}
                                </div>

                            </div>

                        )
                    )}

                </div>

            </Card>

        </div>
    );
}


// ======================================================
// 26) Export
// بنخلي Analytics هو الـ default export
// عشان AppRoutes يقدر يستورده.
// ======================================================

export default Analytics;