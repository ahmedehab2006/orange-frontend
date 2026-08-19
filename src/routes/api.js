import { useState, useEffect, useCallback } from "react";

export const MOCK_MODE = true;

export const API_CONFIG = {
    baseUrl: "/api",
    endpoints: {
        sites: "/v1/map/sites",
        kpis: "/v1/map/kpis",
        siteDetail: (siteCode) => `/v1/map/sites/${siteCode}`,
    },
};

export const MOCK_SITES = [
    { site_code: "CAI-001", total_cells: 6, category: "New Site", lat: 30.062, long: 31.248 },
    { site_code: "CAI-002", total_cells: 4, category: "New Site", lat: 30.041, long: 31.226 },
    { site_code: "CAI-003", total_cells: 5, category: "New Site", lat: 30.071, long: 31.263 },
    { site_code: "CAI-004", total_cells: 3, category: "Upgrade", lat: 30.045, long: 31.284 },
    { site_code: "CAI-005", total_cells: 9, category: "New Site", lat: 30.088, long: 31.315 },
    { site_code: "CAI-006", total_cells: 4, category: "Upgrade", lat: 30.020, long: 31.226 },
    { site_code: "CAI-007", total_cells: 2, category: "Upgrade", lat: 30.017, long: 31.232 },
    { site_code: "CAI-008", total_cells: 3, category: "Upgrade", lat: 30.024, long: 31.243 },
    { site_code: "CAI-009", total_cells: 4, category: "Upgrade", lat: 30.014, long: 31.249 },
    { site_code: "CAI-010", total_cells: 7, category: "Upgrade", lat: 30.030, long: 31.267 },
    { site_code: "CAI-011", total_cells: 8, category: "New Site", lat: 30.005, long: 31.183 },
    { site_code: "CAI-012", total_cells: 5, category: "New Site", lat: 29.995, long: 31.196 },
    { site_code: "CAI-013", total_cells: 2, category: "Upgrade", lat: 29.985, long: 31.207 },
    { site_code: "CAI-014", total_cells: 6, category: "New Site", lat: 29.965, long: 31.243 },
    { site_code: "CAI-015", total_cells: 6, category: "New Site", lat: 30.010, long: 31.300 },
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

export function mockSiteDetail(siteCode) {
    const site = MOCK_SITES.find((s) => s.site_code === siteCode);
    if (!site) return null;
    const isUpgrade = site.category === "Upgrade";

    return {
        go_live_date: "2024-06-12",
        site_code: site.site_code,
        site_name: `Site ${site.site_code}`,
        category: site.category,
        improvement_type: isUpgrade ? "Capacity" : "New coverage",
        objective: isUpgrade ? "Capacity upgrade" : "Coverage expansion",
        benefit: isUpgrade ? "Reduced congestion in busy hours" : "New area coverage",
        effect: isUpgrade ? "+18% throughput" : "+1.2k customers reached",
        technologies: [
            { technology: "2G", cells: 0 },
            { technology: "3G", cells: 0 },
            { technology: "U900", cells: Math.round(site.total_cells * 0.35) },
            { technology: "4G", cells: Math.round(site.total_cells * 0.6) },
        ],
        customers_total: 320,
        customers_list: [],
        ...(isUpgrade
            ? {
                cells: [
                    { cgi: `${site.site_code}-C1`, customers_total: 120 },
                    { cgi: `${site.site_code}-C2`, customers_total: 200 },
                ],
            }
            : {}),
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
            }, 350);
            return () => clearTimeout(timer);
        }

        const query = new URLSearchParams(params).toString();
        fetch(`${API_CONFIG.baseUrl}${path}${query ? `?${query}` : ""}`, {
            signal: controller.signal,
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((json) => {
                setData(json);
                setStatus("success");
            })
            .catch((err) => {
                if (err.name !== "AbortError") setStatus("error");
            });

        return () => controller.abort();
    }, [path, JSON.stringify(params), reloadKey, enabled]);

    return { data, status, retry };
}