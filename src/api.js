import { useState, useEffect, useCallback } from "react";

/* =========================================================
   MOCK MODE (Set to 'false' to connect to Java Backend)
   ========================================================= */
export const MOCK_MODE = (import.meta.env.VITE_MOCK_MODE ?? "true") === "true";

/* =========================================================
   API CONFIG
   ========================================================= */
export const API_CONFIG = {
    baseUrl: "/api",
    endpoints: {
        sites: "/v1/map/sites",                                 // 1st API
        kpis: "/v1/map/kpis",                                   // 2nd API
        siteDetail: (siteCode) => `/v1/map/sites/siteCode/${siteCode}`, // 3rd API
        analyticsTrend: "/v1/analytics/trend",                  // 4th API
        analyticsKpis: "/v1/analytics/kpis",                    // 5th API
        customerExperience: (msisdn) => `/v1/customer/dialSearch/${msisdn}`, // 6th API
        dataTable: "/v1/dataTable/",                            // 7th API
    },
};

/* =========================================================
   1st API: GET /api/v1/map/sites
   Response Object: site_code, total_cells, category, lat, long
========================================================= */
export const MOCK_SITES = [
    { site_code: "CAI-001", total_cells: 6, category: "New Site", lat: 30.05, long: 31.32, _name: "Nasr City Mall 07", _obj: "Densification", _imp: "Capacity Expansion" },
    { site_code: "CAI-002", total_cells: 9, category: "New Site", lat: 29.98, long: 30.95, _name: "6th of October Ind 14", _obj: "Corporate", _imp: "New Coverage" },
    { site_code: "CAI-003", total_cells: 4, category: "Upgrade", lat: 30.02, long: 31.48, _name: "New Cairo 90 St", _obj: "Suburban", _imp: "Speed Boost" },
    { site_code: "CAI-004", total_cells: 5, category: "New Site", lat: 30.12, long: 31.24, _name: "Shobra Abu Farg", _obj: "Road", _imp: "Coverage Extension" },
    { site_code: "CAI-005", total_cells: 8, category: "New Site", lat: 30.13, long: 31.74, _name: "Badr City Industrial", _obj: "Densification", _imp: "Capacity Expansion" },
    { site_code: "CAI-006", total_cells: 3, category: "Upgrade", lat: 29.96, long: 31.25, _name: "Maadi Corniche", _obj: "Roaming", _imp: "Network Optimization" },
    { site_code: "CAI-007", total_cells: 7, category: "Upgrade", lat: 30.09, long: 31.33, _name: "Heliopolis Merghany", _obj: "Corporate", _imp: "Bandwidth Upgrade" },
    { site_code: "CAI-008", total_cells: 6, category: "New Site", lat: 30.06, long: 31.22, _name: "Zamalek Island", _obj: "Suburban", _imp: "New Coverage" },
];
// ملاحظة: احتفظت بالأسماء والأهداف بـ underscore (_) عشان نستخدمها في باقي الـ Mocks بس الـ API نفسه هيرجع الـ 5 حقول الأساسية بس.

/* =========================================================
   2nd API: GET /api/v1/map/kpis
   Response Object: site_name, objective, customers_total, cells_technology []
========================================================= */
export const MOCK_KPIS = MOCK_SITES.map((site, index) => ({
    site_name: site._name,
    objective: site._obj,
    customers_total: 200 + index * 37,
    cells_technology: [
        { technology: "2G", count: index % 5 === 0 ? 1 : 0 },
        { technology: "3G", count: index % 4 === 0 ? 1 : 0 },
        { technology: "4G", count: Math.max(1, Math.round(site.total_cells * 0.6)) },
    ],
}));

/* =========================================================
   3rd API: GET /api/v1/map/sites/siteCode/{site_code}
   Response Object: 12 specific fields (cells for Upgrade only)
========================================================= */
export function mockSiteDetail(siteCode) {
    const site = MOCK_SITES.find((item) => item.site_code === siteCode) || MOCK_SITES[0];
    const isUpgrade = site.category === "Upgrade";
    const baseNum = parseInt(site.site_code.replace("CAI-", ""), 10) || 1;
    const dynamicCustomers = 150 + ((baseNum * 73) % 850);
    const cellsCount = site.total_cells || 4;

    const generatedCells = isUpgrade ? Array.from({ length: cellsCount }, (_, index) => ({
        cell: `${site.site_code}-C${index + 1}`,
        customers_total: 50 + ((baseNum + index) * 31) % 250,
    })) : undefined;

    return {
        go_live_date: "2026-06-29",
        site_code: site.site_code,
        site_name: site._name,
        category: site.category,
        improvement_type: site._imp,
        objective: site._obj,
        benefit: isUpgrade ? "Reduced congestion in busy hours" : "New area coverage",
        effect: isUpgrade ? "+18% throughput" : `+${dynamicCustomers} customers reached`,
        technologies: [
            { technology: "2G", count: 0 },
            { technology: "3G", count: 0 },
            { technology: "4G", count: Math.max(1, Math.round(cellsCount * 0.6)) },
        ],
        customers_total: dynamicCustomers,
        customers_list: [],
        ...(isUpgrade && { cells: generatedCells }), // Returns cells only if it's an upgraded site
    };
}

/* =========================================================
   4th API: GET /api/v1/analytics/trend
   Response Object: week_number, customers_total, new_sites_total
========================================================= */
export const MOCK_ANALYTICS_TREND = Array.from({ length: 52 }, (_, index) => ({
    week_number: index + 1,
    customers_total: 100 + Math.round(index * 8 + Math.sin(index / 3) * 12),
    new_sites_total: 60 + Math.round(index * 3.2 + Math.sin(index / 4) * 8),
}));

/* =========================================================
   5th API: GET /api/v1/analytics/kpis
   Response Object: site_name, customers_total, improvement, objective, effect_type, category
========================================================= */
export const MOCK_ANALYTICS_KPIS = [
    { site_name: "Nasr City Mall 07", customers_total: 500, improvement: "Outdoor", objective: "Densification", effect_type: "Major", category: "New Site" },
    { site_name: "New Cairo 90 St", customers_total: 320, improvement: "Indoor", objective: "Capacity", effect_type: "Minor", category: "Upgrade" },
    { site_name: "Badr City Industrial", customers_total: 250, improvement: "Outdoor", objective: "Coverage", effect_type: "Major", category: "New Site" },
    { site_name: "Heliopolis Merghany", customers_total: 430, improvement: "Outdoor", objective: "Corporate", effect_type: "Major", category: "Upgrade" },
    { site_name: "Maadi Corniche", customers_total: 190, improvement: "Indoor", objective: "Roaming", effect_type: "Minor", category: "Upgrade" },
];

/* =========================================================
   6th API: GET /api/v1/customer/dialSearch/{msisdn}
   Response Object: site_name, enhancement, go_live_date, benefit, day_count, notification_date, lat, lng
========================================================= */
export const MOCK_CUSTOMER_EXPERIENCE = [
    { site_name: "NASR-CITY-MALL-07", enhancement: "Upgrade", go_live_date: "2026-06-29", benefit: "Data", day_count: "11 days active", notification_date: "2026-06-25", lat: 30.05, lng: 31.32 },
    { site_name: "6TH-OF-OCTOBER-IND-14", enhancement: "New Site", go_live_date: "2026-06-15", benefit: "Voice & Data", day_count: "25 days active", notification_date: "2026-06-10", lat: 29.98, lng: 30.95 },
    { site_name: "NEW-CAIRO-90-ST", enhancement: "Upgrade", go_live_date: "2026-07-01", benefit: "Speed Boost", day_count: "5 days active", notification_date: "2026-06-28", lat: 30.02, lng: 31.48 },
];

/* =========================================================
   7th API: GET /api/v1/dataTable/
   Response Object: site_name, site_code, category, technology [], go_live_date, cells_count, customers_total, cells [], objective
========================================================= */
export const MOCK_DATA_TABLE = [
    { site_name: "SHBRA-ABU-FARG", site_code: "0E80CA", category: "New Site", technology: ["4G"], go_live_date: "2026-05-11", cells_count: 5, customers_total: 1840, cells: [], objective: "Road" },
    { site_name: "U_S_0279CA_ABDINE", site_code: "0E12CB", category: "Upgrade", technology: ["4G"], go_live_date: "2026-05-25", cells_count: 3, customers_total: 1120, cells: [{ cell: "0E12CB4G001", count: 420 }, { cell: "0E12CB4G002", count: 400 }], objective: "Corporate" },
    { site_name: "MAADI-CORNICHE-02", site_code: "0E33DA", category: "New Site", technology: ["U900"], go_live_date: "2026-05-04", cells_count: 4, customers_total: 860, cells: [], objective: "Roaming" },
];

/* =========================================================
   ANALYTICS FILTERS BUILDER
========================================================= */
export function buildAnalyticsParams({ category, from, to, year, weekFrom, weekTo } = {}) {
    const params = {};
    if (category) params.category = category;
    if (from) params.from = from;
    if (to) params.to = to;
    if (year !== undefined && year !== null) params.year = year;
    if (weekFrom !== undefined && weekFrom !== null) params.weekFrom = weekFrom;
    if (weekTo !== undefined && weekTo !== null) params.weekTo = weekTo;
    return params;
}

/* =========================================================
   GENERIC API HOOK
========================================================= */
export function useApiData(path, params = {}, mockData, { enabled = true } = {}) {
    const [data, setData] = useState(null);
    const [status, setStatus] = useState(enabled ? "loading" : "idle");
    const [error, setError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    const retry = useCallback(() => setReloadKey((key) => key + 1), []);

    useEffect(() => {
        if (!enabled) {
            setStatus("idle");
            return;
        }

        const controller = new AbortController();
        setStatus("loading");
        setError(null);

        if (MOCK_MODE) {
            const timer = setTimeout(() => {
                try {
                    const result = typeof mockData === "function" ? mockData() : mockData;
                    setData(result);
                    setStatus("success");
                } catch (err) {
                    console.error("Mock API error:", err);
                    setError(err);
                    setStatus("error");
                }
            }, 200);
            return () => clearTimeout(timer);
        }

        const query = new URLSearchParams(params || {}).toString();
        const url = `${API_CONFIG.baseUrl}${path}${query ? `?${query}` : ""}`;

        fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then((json) => {
                setData(json);
                setStatus("success");
            })
            .catch((err) => {
                if (err.name === "AbortError") return;
                console.error("API request failed:", err);
                setError(err);
                setStatus("error");
            });

        return () => controller.abort();
    }, [path, JSON.stringify(params), reloadKey, enabled]);

    return { data, status, error, retry };
}