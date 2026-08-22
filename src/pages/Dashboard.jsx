import React, { useState, useMemo } from "react";
import { X, MapPin, TrendingUp, Radio } from "lucide-react";
import './Dashboard.css';
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { Badge, Card, SkeletonLine, ErrorInline, BarRow, ListRow, Field, FiltersBar, DEFAULT_FILTERS } from "../Components.jsx";
import { useApiData, API_CONFIG, MOCK_SITES, MOCK_KPIS, mockSiteDetail } from "../api.js";

/* ==========================================================
   كروت الإحصائيات العلوية (بالتصميم الملموم والأيقونات)
   ========================================================== */
function StatCard({ label, value, sub, loading, icon: Icon, iconColor, iconBg }) {
    if (!Icon) {
        return (
            <Card>
                <div className="stat-label" style={{ marginBottom: '12px' }}>{label}</div>
                {loading ? <SkeletonLine width="40%" height={28} /> : (
                    <div className="stat-content">
                        <div className="stat-value">{value}</div>
                        {sub && <div className="stat-sub">{sub}</div>}
                    </div>
                )}
            </Card>
        );
    }

    return (
        <Card>
            <div className="stat-card-inner">
                <div className="stat-header">
                    <div className="stat-label">{label}</div>
                    <div className="stat-icon-wrapper" style={{ backgroundColor: iconBg }}>
                        <Icon size={18} color={iconColor} />
                    </div>
                </div>

                {loading ? <SkeletonLine width="40%" height={28} /> : (
                    <div className="stat-content">
                        <div className="stat-value">{value}</div>
                        {sub && <div className="stat-sub">{sub}</div>}
                    </div>
                )}
            </div>
        </Card>
    );
}

function buildStatsSummary(sites, kpis) {
    const siteList = sites || [];
    const newSites = siteList.filter((s) => s.category === "New Site").length;
    const upgradedSites = siteList.filter((s) => s.category === "Upgrade").length;
    const totalCells = siteList.reduce((sum, s) => sum + (s.total_cells || 0), 0);
    const totalSites = siteList.length;

    const techMap = {};
    (kpis || []).forEach((k) => {
        (k.cells_technology || []).forEach((t) => {
            techMap[t.technology] = (techMap[t.technology] || 0) + (t.count || 0);
        });
    });
    const techTotal = Object.values(techMap).reduce((a, b) => a + b, 0) || 1;
    const techBreakdown = Object.entries(techMap).map(([name, value]) => ({
        name, value,
        percent: `${(value / techTotal) * 100}%`,
        color: name === "4G" ? "var(--color-green)" : name === "U900" ? "var(--color-orange)" : "#98a2b3",
    }));

    return {
        newSites,
        upgradedSites,
        totalCells,
        totalSites,
        techBreakdown,
        newSitesSub: null,
        upgradedSitesSub: null,
        totalCellsSub: totalSites ? `across ${totalSites} sites` : null,
    };
}

function StatCards({ sitesStatus, sites, kpis, onRetry }) {
    const summary = useMemo(() => buildStatsSummary(sites, kpis), [sites, kpis]);

    if (sitesStatus === "error") {
        return <div className="stat-grid"><Card className="stat-error-card"><ErrorInline onRetry={onRetry} /></Card></div>;
    }
    const loading = sitesStatus === "loading" && !summary;

    return (
        <div className="stat-grid">
            <StatCard
                label="New Sites"
                value={summary.newSites}
                sub={summary.newSitesSub}
                loading={loading}
                icon={MapPin}
                iconColor="var(--color-orange)"
                iconBg="var(--color-orange-bg)"
            />
            <StatCard
                label="Upgraded Sites"
                value={summary.upgradedSites}
                sub={summary.upgradedSitesSub}
                loading={loading}
                icon={TrendingUp}
                iconColor="var(--color-teal)"
                iconBg="var(--color-teal-bg)"
            />
            <StatCard
                label="Total Cells Affected"
                value={summary.totalCells}
                sub={summary.totalCellsSub}
                loading={loading}
                icon={Radio}
                iconColor="#475467"
                iconBg="#f2f4f7"
            />

            <Card>
                <div className="stat-label" style={{ marginTop: '4px', marginBottom: '12px' }}>Cells by Technology</div>
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
const MAP_MARKER_COLOR = { new: "#ff7900", upgrade: "#0e9384" };

function EnhancementMap({ sitesStatus, sites, onRetry, onSelectSite }) {
    const [heatmap, setHeatmap] = useState(false);
    const validSites = (sites || []).filter(s => s.lat && s.long);

    return (
        <Card className="map-card">
            <div className="map-card-header">
                <div className="map-header-left">
                    <h2 className="map-card-title">Enhancement Map</h2>
                    <p className="map-coords">CAIRO / GIZA METRO · 30.04°N, 31.24°E</p>
                </div>
                <div className="map-legend">
                    <span className="legend-item"><span className="legend-dot legend-dot--new" />New Sites</span>
                    <span className="legend-item"><span className="legend-dot legend-dot--upgrade" />Upgrades</span>
                </div>
            </div>

            <div className="map-area">
                {sitesStatus === "loading" && <div className="map-loading">جاري تحميل الخريطة الحقيقية…</div>}
                {sitesStatus === "error" && <div className="map-loading"><ErrorInline onRetry={onRetry} /></div>}

                {sitesStatus !== "loading" && sitesStatus !== "error" && (
                    <MapContainer
                        center={[30.0444, 31.2357]}
                        zoom={11}
                        className="leaflet-fill"
                        style={{ height: "100%", width: "100%" }}
                        scrollWheelZoom={false}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {validSites.map((s) => {
                            const isNew = s.category === "New Site";
                            const color = isNew ? MAP_MARKER_COLOR.new : MAP_MARKER_COLOR.upgrade;
                            const radius = Math.min(Math.max((s.total_cells || 1) * 1.5, 8), 22);

                            return (
                                <CircleMarker
                                    key={s.site_code}
                                    center={[s.lat, s.long]}
                                    radius={radius}
                                    pathOptions={{
                                        color: color,
                                        fillColor: color,
                                        fillOpacity: 0.7,
                                        weight: 2
                                    }}
                                    eventHandlers={{
                                        click: () => onSelectSite(s.site_code)
                                    }}
                                >
                                    <Popup>
                                        <div className="map-popup-title">{s.site_code}</div>
                                        <div>{s.category}</div>
                                    </Popup>
                                </CircleMarker>
                            );
                        })}
                    </MapContainer>
                )}
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
                        <div className="reach-left">
                            <Badge variant={item.category === "New Site" ? 'new' : 'upgrade'} shape="tag">
                                {item.category === "New Site" ? 'N' : 'U'}
                            </Badge>
                            <div>
                                <div className="reach-code">{item.site_code}</div>
                                <div className="field-label">{item.objective || item.improvement_type || 'General'}</div>
                            </div>
                        </div>
                    }
                    right={
                        <span className="top-reach-value">{item.total_cells || 0} cells</span>
                    }
                />
            ))}
        </Card>
    );
}

/* ==========================================================
   كارت التحسينات حسب الهدف (معدل ليقرأ من KPIs)
   ========================================================== */
function EnhancementsByObjectiveCard({ kpis }) {
    const objectiveMap = {};
    (kpis || []).forEach((k) => {
        const obj = k.objective || 'General';
        objectiveMap[obj] = (objectiveMap[obj] || 0) + 1;
    });

    const totalSites = (kpis || []).length || 1;
    const objectivesList = Object.entries(objectiveMap).map(([name, count]) => ({
        name, count, percent: `${Math.round((count / totalSites) * 100)}%`,
    }));
    const displayList = objectivesList.length > 0 ? objectivesList : [{ name: "General", count: 0, percent: "0%" }];

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
function siteDetailFields(data) {
    return [
        { label: "IMPROVEMENT", value: data.improvement_type },
        { label: "EFFECT", value: data.effect },
        { label: "OBJECTIVE", value: data.objective },
        { label: "BENEFIT", value: data.benefit },
    ];
}
const TREND_HEIGHTS = [35, 42, 50, 55, 65, 70, 75, 85];

function SiteDetailModal({ siteCode, onClose }) {
    const { data, status } = useApiData(
        siteCode ? API_CONFIG.endpoints.siteDetail(siteCode) : null,
        {},
        siteCode ? mockSiteDetail(siteCode) : null,
        { enabled: !!siteCode }
    );

    if (!siteCode) return null;

    return (
        <div className="modal-overlay modal-overlay--side" onClick={onClose}>
            <div className="modal-panel modal-panel--detail" onClick={(e) => e.stopPropagation()}>

                {status === "loading" && <div className="empty-state" style={{ marginTop: 'auto', marginBottom: 'auto' }}>جاري تحميل التفاصيل...</div>}
                {status === "error" && <div className="empty-state" style={{ color: 'var(--color-red)', marginTop: 'auto', marginBottom: 'auto' }}>فشل تحميل البيانات</div>}

                {status === "success" && data && (
                    <>
                        <div className="modal-header">
                            <div>
                                <div className="modal-header-meta">
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
                                <div className="field-label modal-tech-label">TECHNOLOGIES</div>
                                <div className="tech-chip-list">
                                    {data.technologies?.filter((t) => t.count > 0).map((t) => (
                                        <span key={t.technology} className="tech-chip">{t.technology} ({t.count})</span>
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
                                <div className="field-label modal-trend-caption">8-week trend</div>
                            </div>

                            {data.cells?.length > 0 && (
                                <div className="modal-section">
                                    <div className="modal-section-title">Cells on site ({data.cells.length})</div>
                                    {data.cells.map((cell) => (
                                        <ListRow
                                            key={cell.cgi}
                                            left={<span className="modal-cell-name">{cell.cgi}</span>}
                                            right={<span className="modal-cell-count">{cell.customers_total} customers</span>}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button className="btn btn--outline">View customer list</button>
                                <button className="btn btn--primary">Export</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ==========================================================
   صفحة الداشبورد الرئيسية
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

            <div className="dashboard-grid-2col">
                <TopReachCard sites={sites} />
                <EnhancementsByObjectiveCard kpis={kpis} />
            </div>

            <SiteDetailModal siteCode={selectedSite} onClose={() => setSelectedSite(null)} />
        </div>
    );
}