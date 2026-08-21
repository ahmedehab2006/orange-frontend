import { useState, useEffect, useCallback } from "react";

export const MOCK_MODE = true;

export const API_CONFIG = {
    baseUrl: "/api",
    endpoints: {
        sites: "/v1/map/sites",
        kpis: "/v1/map/kpis",
        siteDetail: (siteCode) => `/v1/map/sites/${siteCode}`,
        analyticsTrend: "/v1/analytics/trend",
        analyticsKpis: "/v1/analytics/kpis",
        customerExperience: "/v1/customer-experience/search",
        dataTable: "/v1/dataTable",
    },
};

export const MOCK_SITES = [
    { site_code: "CAI-001", site_name: "Nasr City Mall 07", category: "New Site", objective: "Densification", improvement_type: "Capacity Expansion", total_cells: 6, lat: 30.05, long: 31.32 },
    { site_code: "CAI-002", site_name: "6th of October Ind 14", category: "New Site", objective: "Corporate", improvement_type: "New Coverage", total_cells: 9, lat: 29.98, long: 30.95 },
    { site_code: "CAI-003", site_name: "New Cairo 90 St", category: "Upgrade", objective: "Suburban", improvement_type: "Speed Boost", total_cells: 4, lat: 30.02, long: 31.48 },
    { site_code: "CAI-004", site_name: "Shobra Abu Farg", category: "New Site", objective: "Road", improvement_type: "Coverage Extension", total_cells: 5, lat: 30.12, long: 31.24 },
    { site_code: "CAI-005", site_name: "Badr City Industrial", category: "New Site", objective: "Densification", improvement_type: "Capacity Expansion", total_cells: 8, lat: 30.13, long: 31.74 },
    { site_code: "CAI-006", site_name: "Maadi Corniche", category: "Upgrade", objective: "Roaming", improvement_type: "Network Optimization", total_cells: 3, lat: 29.96, long: 31.25 },
    { site_code: "CAI-007", site_name: "Heliopolis Merghany", category: "Upgrade", objective: "Corporate", improvement_type: "Bandwidth Upgrade", total_cells: 7, lat: 30.09, long: 31.33 },
    { site_code: "CAI-008", site_name: "Zamalek Island", category: "New Site", objective: "Suburban", improvement_type: "New Coverage", total_cells: 6, lat: 30.06, long: 31.22 }
];

export const MOCK_KPIS = MOCK_SITES.map((s, i) => ({
    site_name: `Site ${s.site_code}`,
    objective: i % 2 === 0 ? "Coverage expansion" : "Capacity upgrade",
    customers_total: 200 + i * 37,
    technologies: [
        { technology: "2G", cells: i % 5 === 0 ? 1 : 0 },
        { technology: "3G", cells: i % 4 === 0 ? 1 : 0 },
        { technology: "U900", cells: Math.round(s.total_cells * 0.35) },
        { technology: "4G", cells: Math.round(s.total_cells * 0.6) },
    ],
}));

export const MOCK_ANALYTICS_TREND = Array.from({ length: 100 }, (_, i) => ({
    week_number: i + 1,
    customers_total: 100 + Math.round(i * 8 + Math.sin(i / 3) * 12),
    new_sites_total: 60 + Math.round(i * 3.2 + Math.sin(i / 4) * 8),
}));

export const MOCK_ANALYTICS_KPIS = [
    { site_name: "Nasr City Mall 07", customers_total: 500, improvement: "Outdoor", objective: "Densification", effect_type: "Major", category: "New Site" },
    { site_name: "New Cairo 90 St", customers_total: 320, improvement: "Indoor", objective: "Capacity", effect_type: "Minor", category: "Upgrade" },
    { site_name: "Badr City Industrial", customers_total: 250, improvement: "Outdoor", objective: "Coverage", effect_type: "Major", category: "New Site" },
    { site_name: "Heliopolis Merghany", customers_total: 430, improvement: "Outdoor", objective: "Corporate", effect_type: "Major", category: "Upgrade" },
    { site_name: "Maadi Corniche", customers_total: 190, improvement: "Indoor", objective: "Roaming", effect_type: "Minor", category: "Upgrade" },
    { site_name: "Zamalek Island", customers_total: 370, improvement: "Outdoor", objective: "Suburban", effect_type: "Major", category: "New Site" },
    { site_name: "6th of October Ind 14", customers_total: 280, improvement: "Indoor", objective: "Corporate", effect_type: "Minor", category: "New Site" },
    { site_name: "Shobra Abu Farg", customers_total: 150, improvement: "Outdoor", objective: "Road", effect_type: "Minor", category: "Upgrade" },
    { site_name: "al alamen", customers_total: 30, improvement: "Outdoor", objective: "Road", effect_type: "Minor", category: "Upgrade" },
    { site_name: "al alamen", customers_total: 49, improvement: "Outdoor", objective: "Road", effect_type: "Minor", category: "Upgrade" }
];

export const MOCK_CUSTOMER_EXPERIENCE = [
    { site_name: "NASR-CITY-MALL-07", enhancement: "Upgrade", go_live_date: "2026-06-29", benefit: "Data", day_count: "11 days active", notification_date: "2026-06-25", lat: 30.05, lng: 31.32, phone: "0106547242", status: "Consistently impacted" },
    { site_name: "6TH-OF-OCTOBER-IND-14", enhancement: "New Site", go_live_date: "2026-06-15", benefit: "Voice & Data", day_count: "25 days active", notification_date: "2026-06-10", lat: 29.98, lng: 30.95, phone: "0123456789", status: "Consistently impacted" },
    { site_name: "NEW-CAIRO-90-ST", enhancement: "Upgrade", go_live_date: "2026-07-01", benefit: "Speed Boost", day_count: "5 days active", notification_date: "2026-06-28", lat: 30.02, lng: 31.48, phone: "0111222333", status: "Partially impacted" }
];

export const MOCK_DATA_TABLE = [
    {
        site_name: "SHBRA-ABU-FARG",
        site_code: "0E80CA",
        category: "New Site",
        technology: ["U900", "4G"],
        go_live_date: "2026-05-11",
        cells_count: 5,
        customers_total: 1840,
        objective: "Road",
        cells: []
    },
    {
        site_name: "U_S_0279CA_ABDINE",
        site_code: "0E12CB",
        category: "Upgrade",
        technology: ["4G"],
        go_live_date: "2026-05-25",
        cells_count: 3,
        customers_total: 1120,
        objective: "Corporate",
        cells: [
            { cell: "0E12CB4G001", count: 420 },
            { cell: "0E12CB4G002", count: 400 },
            { cell: "0E12CB4G003", count: 300 }
        ]
    },
    {
        site_name: "MAADI-CORNICHE-02",
        site_code: "0E33DA",
        category: "New Site",
        technology: ["U900"],
        go_live_date: "2026-05-04",
        cells_count: 4,
        customers_total: 860,
        objective: "Roaming",
        cells: []
    },
    {
        site_name: "NASR-CITY-MALL-07",
        site_code: "0E45FE",
        category: "Upgrade",
        technology: ["4G"],
        go_live_date: "2026-06-29",
        cells_count: 6,
        customers_total: 2380,
        objective: "Densification",
        cells: [
            { cell: "0E45FE4G001", count: 600 },
            { cell: "0E45FE4G002", count: 650 },
            { cell: "0E45FE4G003", count: 550 },
            { cell: "0E45FE4G004", count: 580 }
        ]
    },
    {
        site_name: "6OCT-INDUSTRIAL-14",
        site_code: "0E56AB",
        category: "New Site",
        technology: ["U900", "4G"],
        go_live_date: "2026-06-08",
        cells_count: 7,
        customers_total: 2050,
        objective: "Corporate",
        cells: []
    }
];

export function mockSiteDetail(siteCode) {
    const site = MOCK_SITES.find((s) => s.site_code === siteCode) || MOCK_SITES[0];
    const isUpgrade = site.category === "Upgrade";
    const baseNum = parseInt(site.site_code.replace("CAI-", "")) || 1;
    const dynamicCustomers = 150 + (baseNum * 73) % 850;
    const cellsCount = site.total_cells || 4;
    const generatedCells = Array.from({ length: Math.min(cellsCount, 4) }, (_, i) => ({
        cgi: `${site.site_code}-C${i + 1}`,
        customers_total: 50 + ((baseNum + i) * 31) % 250,
        technology: i % 2 === 0 ? "4G" : "U900"
    }));

    return {
        go_live_date: "2026-06-29",
        site_code: site.site_code,
        site_name: site.site_name,
        category: site.category,
        improvement_type: site.improvement_type || (isUpgrade ? "Capacity" : "New coverage"),
        objective: site.objective || (isUpgrade ? "Capacity upgrade" : "Coverage expansion"),
        benefit: isUpgrade ? "Reduced congestion in busy hours" : "New area coverage",
        effect: isUpgrade ? "+18% throughput" : `+${dynamicCustomers} customers reached`,
        technologies: [
            { technology: "U900", cells: Math.round(cellsCount * 0.4) },
            { technology: "4G", cells: Math.round(cellsCount * 0.6) },
        ],
        customers_total: dynamicCustomers,
        customers_list: [],
        cells: generatedCells,
    };
}

export function useApiData(path, params, mockData, { enabled = true } = {}) {
    const [data, setData] = useState(null);
    const [status, setStatus] = useState(enabled ? "loading" : "idle");
    const [reloadKey, setReloadKey] = useState(0);
    const retry = useCallback(() => setReloadKey((k) => k + 1), []);

    useEffect(() => {
        if (!enabled) return;
        const controller = new AbortController();
        setStatus("loading");

        if (MOCK_MODE) {
            const timer = setTimeout(() => {
                setData(typeof mockData === "function" ? mockData() : mockData);
                setStatus("success");
            }, 200);
            return () => clearTimeout(timer);
        }

        const query = new URLSearchParams(params).toString();
        fetch(`${API_CONFIG.baseUrl}${path}${query ? `?${query}` : ""}`, { signal: controller.signal })
            .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
            .then((json) => { setData(json); setStatus("success"); })
            .catch((err) => { if (err.name !== "AbortError") setStatus("error"); });

        return () => controller.abort();
    }, [path, JSON.stringify(params), reloadKey, enabled]);

    return { data, status, retry };
}