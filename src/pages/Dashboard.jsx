import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import './Dashboard.css';
import { Badge, Card, Select, SkeletonLine, ErrorInline, BarRow, ListRow, Field } from "../Components.jsx";
import { useApiData, API_CONFIG, MOCK_SITES, MOCK_KPIS, mockSiteDetail } from "../api.js";

const DEFAULT_FILTERS = { category: "All", mode: "Year + weeks", year: "2026", weekFrom: 18, weekTo: 27 };

/* ==========================================================
   شريط الفلاتر
   ========================================================== */
const DATE_MODES = ["Calendar dates", "Year + weeks", "Year only"];
const CATEGORY_OPTIONS = ["All", "New Site", "Upgrade"];
const YEAR_OPTIONS = ["2026", "2025", "2024"];
// حقلين Week From / Week To نفس الشكل بالظبط، فبنولدهم من array واحدة بدل ما نكتب كل واحد لوحده
const WEEK_FIELDS = [
    { key: "weekFrom", label: "Week From", fallback: 18 },
    { key: "weekTo", label: "Week To", fallback: 27 },
];

function FiltersBar({ draft, setDraft, onApply, onClear }) {
    const patch = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

    return (
        <div className="filters-bar">
            <Select label="Category" value={draft.category} options={CATEGORY_OPTIONS} onChange={(v) => patch("category", v)} />

            <div className="filter-group">
                <span className="filter-label">Date Range Mode</span>
                <div className="segmented">
                    {DATE_MODES.map((m) => (
                        <button key={m} className={m === draft.mode ? "active" : ""} onClick={() => patch("mode", m)}>
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            <Select label="Year" value={draft.year} options={YEAR_OPTIONS} onChange={(v) => patch("year", v)} />

            {draft.mode === "Year + weeks" && WEEK_FIELDS.map(({ key, label, fallback }) => (
                <div className="filter-group" key={key}>
                    <span className="filter-label">{label}</span>
                    <input
                        type="number"
                        className="filter-select filter-week"
                        value={draft[key] || fallback}
                        onChange={(e) => patch(key, e.target.value)}
                    />
                </div>
            ))}

            <div className="filters-spacer" />
            <button className="btn btn--outline" onClick={onClear}>Clear</button>
            <button className="btn btn--primary" onClick={onApply}>Apply</button>
        </div>
    );
}

/* ==========================================================
   كروت الإحصائيات العلوية
   ========================================================== */
// كارت رقم بسيط (تسمية + قيمة + تفصيل اختياري) — 3 من الـ 4 كروت شكلهم متطابق
function StatCard({ label, value, sub, loading }) {
    return (
        <Card>
            <div className="stat-label">{label}</div>
            {loading ? <SkeletonLine width="40%" height={28} /> : (
                <>
                    <div className="stat-value">{value}</div>
                    {sub && <div className="stat-sub">{sub}</div>}
                </>
            )}
        </Card>
    );
}

function buildStatsSummary(sites, kpis) {
    const newSites = sites.filter((s) => s.category === "New Site").length;
    const upgradedSites = sites.filter((s) => s.category === "Upgrade").length;
    const totalCells = sites.reduce((sum, s) => sum + s.total_cells, 0);

    const techMap = {};
    (kpis || []).forEach((k) => {
        (k.technologies || []).forEach((t) => {
            techMap[t.technology] = (techMap[t.technology] || 0) + (t.cells || 0);
        });
    });
    const techTotal = Object.values(techMap).reduce((a, b) => a + b, 0) || 1;
    const techBreakdown = Object.entries(techMap).map(([name, value]) => ({
        name, value,
        percent: `${(value / techTotal) * 100}%`,
        color: name === "4G" ? "var(--color-green)" : name === "U900" ? "var(--color-orange)" : "#98a2b3",
    }));

    return { newSites, upgradedSites, totalCells, totalSites: sites.length, techBreakdown };
}

function StatCards({ sitesStatus, sites, kpis, onRetry }) {
    const summary = useMemo(() => (sites ? buildStatsSummary(sites, kpis) : null), [sites, kpis]);

    if (sitesStatus === "error") {
        return <div className="stat-grid"><Card className="stat-error-card"><ErrorInline onRetry={onRetry} /></Card></div>;
    }
    const loading = sitesStatus === "loading" || !summary;

    return (
        <div className="stat-grid">
            <StatCard label="New Sites" value={summary?.newSites} loading={loading} />
            <StatCard label="Upgraded Sites" value={summary?.upgradedSites} loading={loading} />
            <StatCard label="Total Cells Affected" value={summary?.totalCells} sub={summary && `across ${summary.totalSites} sites`} loading={loading} />
            <Card>
                <div className="stat-label">Cells by Technology</div>
                {loading
                    ? [1, 2, 3, 4].map((i) => <div className="tech-row" key={i}><SkeletonLine width="100%" height={6} /></div>)
                    : summary.techBreakdown.map((t) => <BarRow key={t.name} label={t.name} display={t.value} percent={t.percent} color={t.color} />)
                }
            </Card>
        </div>
    );
}

/* ==========================================================
   خريطة القاهرة الكبرى
   ========================================================== */
const DOT_COLOR = { new: "var(--color-orange)", upgrade: "#0e9384" };

function projectSites(sites) {
    if (!sites || sites.length === 0) return [];
    const lats = sites.map((s) => s.lat), longs = sites.map((s) => s.long);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLong = Math.min(...longs), maxLong = Math.max(...longs);
    const cellsMax = Math.max(...sites.map((s) => s.total_cells), 1);

    return sites.map((s) => ({
        id: s.site_code,
        x: maxLong === minLong ? 50 : ((s.long - minLong) / (maxLong - minLong)) * 90 + 5,
        y: maxLat === minLat ? 50 : (1 - (s.lat - minLat) / (maxLat - minLat)) * 90 + 5,
        size: 12 + (s.total_cells / cellsMax) * 16,
        type: s.category === "New Site" ? "new" : "upgrade",
        raw: s,
    }));
}

function EnhancementMap({ sitesStatus, sites, onRetry, onSelectSite }) {
    const [heatmap, setHeatmap] = useState(false);
    const dots = useMemo(() => projectSites(sites || []), [sites]);

    return (
        <Card className="map-card">
            <div className="map-card-header">
                <div className="card-title" style={{ marginBottom: 0 }}>Enhancement Map — Greater Cairo</div>
                <div className="map-legend">
                    <span className="legend-item"><span className="legend-dot" style={{ background: DOT_COLOR.new }} />New Sites</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: DOT_COLOR.upgrade }} />Upgrades</span>
                    <span className="legend-toggle">
                        <span className={`toggle ${heatmap ? "on" : ""}`} onClick={() => setHeatmap((v) => !v)}><span className="toggle-knob" /></span> Customer reach heatmap
                    </span>
                </div>
            </div>
            <div className="map-coords">Cairo / Giza Metro · 30.04°N, 31.24°E</div>
            <div className="map-area">
                {sitesStatus === "loading" && <div className="map-loading">جاري تحميل مواقع الخريطة…</div>}
                {sitesStatus === "error" && <div className="map-loading"><ErrorInline onRetry={onRetry} /></div>}
                {sitesStatus === "success" && dots.map((d) => (
                    <div
                        key={d.id}
                        className="map-dot"
                        title={`${d.raw.site_code} · ${d.raw.total_cells} cells`}
                        onClick={() => onSelectSite(d.id)}
                        style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size, background: DOT_COLOR[d.type] }}
                    />
                ))}
            </div>
        </Card>
    );
}

/* ==========================================================
   كارت أعلى وصول
   ========================================================== */
function TopReachCard({ sites }) {
    const topSites = [...(sites || [])].sort((a, b) => (b.total_cells || 0) - (a.total_cells || 0)).slice(0, 5);

    if (topSites.length === 0) {
        return <Card title="This Week's Top Reach"><div className="empty-state">لا توجد بيانات متاحة</div></Card>;
    }

    return (
        <Card title="This Week's Top Reach">
            {topSites.map((item) => (
                <ListRow
                    key={item.site_code}
                    left={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Badge variant={item.category === "New Site" ? 'new' : 'upgrade'} shape="tag">
                                {item.category === "New Site" ? 'N' : 'U'}
                            </Badge>
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--color-text-dark)' }}>{item.site_code}</div>
                                <div className="field-label">{item.objective || item.improvement_type || 'General'}</div>
                            </div>
                        </div>
                    }
                    right={<span style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-text-dark)' }}>{item.total_cells * 120 || 1500}</span>}
                />
            ))}
        </Card>
    );
}

/* ==========================================================
   كارت التحسينات حسب الهدف
   ========================================================== */
function EnhancementsByObjectiveCard({ sites }) {
    const objectiveMap = {};
    (sites || []).forEach((s) => {
        const obj = s.objective || 'Densification';
        objectiveMap[obj] = (objectiveMap[obj] || 0) + 1;
    });

    const totalSites = (sites || []).length || 1;
    const objectivesList = Object.entries(objectiveMap).map(([name, count]) => ({
        name, count, percent: `${Math.round((count / totalSites) * 100)}%`,
    }));
    const displayList = objectivesList.length > 0 ? objectivesList : [{ name: "Densification", count: 0, percent: "0%" }];

    return (
        <Card title="Enhancements by Objective">
            {displayList.map((obj) => (
                <BarRow key={obj.name} label={obj.name} display={`${obj.count} sites`} percent={obj.percent} wide />
            ))}
        </Card>
    );
}

/* ==========================================================
   المودال — تفاصيل الموقع
   ========================================================== */
// نفس شكل "تسمية فوق + قيمة" بيتكرر 4 مرات، فبنولدهم من array
function siteDetailFields(data) {
    return [
        { label: "IMPROVEMENT", value: data.improvement_type },
        { label: "EFFECT", value: data.effect },
        { label: "OBJECTIVE", value: data.objective },
        { label: "BENEFIT", value: data.benefit },
    ];
}
const TREND_HEIGHTS = [35, 42, 50, 55, 65, 70, 75, 85]; // شكل تريند وهمي لآخر 8 أسابيع

function SiteDetailModal({ siteCode, onClose }) {
    if (!siteCode) return null;
    const data = mockSiteDetail(siteCode);

    return (
        <div className="modal-overlay modal-overlay--side" onClick={onClose}>
            <div className="modal-panel modal-panel--detail" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Badge variant="new">{data.category || 'New Build'}</Badge>
                            <span className="field-label">{data.site_code}</span>
                        </div>
                        <h2 className="modal-title">{data.site_name}</h2>
                        <div className="field-label">Go-live {data.go_live_date}</div>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                <hr className="modal-divider" />

                <div className="modal-body">
                    <div className="field-grid">
                        {siteDetailFields(data).map((f) => <Field key={f.label} {...f} />)}
                    </div>

                    <div className="modal-section">
                        <div className="field-label" style={{ marginBottom: 8 }}>TECHNOLOGIES</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {data.technologies?.filter((t) => t.cells > 0).map((t) => (
                                <span key={t.technology} className="tech-chip">{t.technology} ({t.cells})</span>
                            ))}
                        </div>
                    </div>

                    <hr className="modal-divider" />

                    <div className="modal-section">
                        <div className="field-label">CUSTOMERS REACHED</div>
                        <div className="modal-big-number">{data.customers_total}</div>
                        <div className="trend-bars">
                            {TREND_HEIGHTS.map((h, i) => <div key={i} className="trend-bar" style={{ height: `${h}%` }} />)}
                        </div>
                        <div className="field-label" style={{ marginTop: 4 }}>8-week trend</div>
                    </div>

                    {data.cells?.length > 0 && (
                        <div className="modal-section">
                            <div className="modal-section-title">Cells on site ({data.cells.length})</div>
                            {data.cells.map((cell) => (
                                <ListRow
                                    key={cell.cgi}
                                    left={<span style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{cell.cgi}</span>}
                                    right={<span style={{ fontWeight: 800 }}>{cell.customers_total} customers</span>}
                                />
                            ))}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button className="btn btn--outline">View customer list</button>
                        <button className="btn btn--primary">Export</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ==========================================================
   صفحة الداشبورد نفسها
   ========================================================== */
export default function Dashboard() {
    const [draft, setDraft] = useState(DEFAULT_FILTERS);
    const [applied, setApplied] = useState(DEFAULT_FILTERS);
    const [selectedSite, setSelectedSite] = useState(null);

    const filteredMockSites = MOCK_SITES.filter(
        (site) => applied.category === "All" || site.category === applied.category
    );

    const { data: sites, status: sitesStatus, retry: retrySites } = useApiData(API_CONFIG.endpoints.sites, applied, filteredMockSites);
    const { data: kpis, status: kpisStatus, retry: retryKpis } = useApiData(API_CONFIG.endpoints.kpis, applied, MOCK_KPIS);

    return (
        <div className="page-container">
            <FiltersBar
                draft={draft} setDraft={setDraft}
                onApply={() => setApplied(draft)}
                onClear={() => { setDraft(DEFAULT_FILTERS); setApplied(DEFAULT_FILTERS); }}
            />

            <StatCards
                sitesStatus={sitesStatus} sites={sites} kpis={kpis}
                onRetry={() => { retrySites(); retryKpis(); }}
            />

            <EnhancementMap
                sitesStatus={sitesStatus} sites={sites}
                onRetry={retrySites} onSelectSite={setSelectedSite}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <TopReachCard sites={sites} />
                <EnhancementsByObjectiveCard sites={sites} />
            </div>

            <SiteDetailModal siteCode={selectedSite} onClose={() => setSelectedSite(null)} />
        </div>
    );
}