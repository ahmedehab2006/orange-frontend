import React, { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

/* ==========================================================
   عناصر UI عامة — مش خاصة بأي صفحة معينة، أي صفحة جديدة
   (زي Sites, Reports...) تقدر تستوردها من هنا زي ما هي.
   ========================================================== */

export function Badge({ variant = 'neutral', shape = 'pill', children, className = '' }) {
    return <span className={`badge badge--${shape} badge--${variant} ${className}`}>{children}</span>;
}

export function Card({ title, children, className = '' }) {
    return (
        <div className={`card ${className}`}>
            {title && <div className="card-title">{title}</div>}
            {children}
        </div>
    );
}

export function Select({ label, value, options, onChange }) {
    return (
        <div className="filter-group">
            <span className="filter-label">{label}</span>
            <select className="filter-select" value={value} onChange={(e) => onChange(e.target.value)}>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}

/* ==========================================================
   شريط الفلاتر — مشترك بين أي صفحة محتاجة فلترة (Dashboard,
   Analytics...). كان معرّف جوه Dashboard بس، نقلناه هنا عشان
   أي صفحة تقدر تستخدم نفس الفلاتر بدل ما تعمل نسخة تانية.
   ========================================================== */

export const DEFAULT_FILTERS = { category: "All", mode: "Year only", year: "2026", weekFrom: 18, weekTo: 27 };

const DATE_MODES = ["Calendar dates", "Year + weeks", "Year only"];
const CATEGORY_OPTIONS = ["All", "New Site", "Upgrade"];
const YEAR_OPTIONS = ["2026", "2025", "2024"];
const WEEK_FIELDS = [
    { key: "weekFrom", label: "Week From", fallback: 18 },
    { key: "weekTo", label: "Week To", fallback: 27 },
];

export function FiltersBar({ draft, setDraft, onApply, onClear }) {
    const patch = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

    // أول ما الكومبوننت يفتح، لو مفيش mode متحدد أو لو فاضي، خليه Year only تلقائياً
    useEffect(() => {
        if (!draft.mode) {
            patch("mode", "Year only");
        }
        if (!draft.year) {
            patch("year", "2026");
        }
    }, []);

    const currentMode = draft.mode || "Year only";

    return (
        <div className="filters-bar">
            <Select label="Category" value={draft.category} options={CATEGORY_OPTIONS} onChange={(v) => patch("category", v)} />

            <div className="filter-group">
                <span className="filter-label">Date Range Mode</span>
                <div className="segmented">
                    {DATE_MODES.map((m) => (
                        <button
                            key={m}
                            type="button"
                            className={m === currentMode ? "active" : ""}
                            onClick={() => patch("mode", m)}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {/* عند اختيار Calendar dates تظهر حقول التاريخ From و To */}
            {currentMode === "Calendar dates" ? (
                <>
                    <div className="filter-group">
                        <span className="filter-label">From</span>
                        <input
                            type="date"
                            className="filter-select filter-week"
                            value={draft.fromDate || "2026-05-01"}
                            onChange={(e) => patch("fromDate", e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <span className="filter-label">To</span>
                        <input
                            type="date"
                            className="filter-select filter-week"
                            value={draft.toDate || "2026-07-06"}
                            onChange={(e) => patch("toDate", e.target.value)}
                        />
                    </div>
                </>
            ) : (
                /* في الأوضاع الأخرى تظهر السنة فقط، وتختفي الأسابيع لو الوضع Year only */
                <>
                    <Select label="Year" value={draft.year || "2026"} options={YEAR_OPTIONS} onChange={(v) => patch("year", v)} />

                    {currentMode === "Year + weeks" && WEEK_FIELDS.map(({ key, label, fallback }) => (
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
                </>
            )}

            <div className="filters-actions">
                <button type="button" className="btn btn--outline" onClick={onClear}>Clear</button>
                <button type="button" className="btn btn--primary" onClick={onApply}>Apply</button>
            </div>
        </div>
    );
}

export function SkeletonLine({ width = "60%", height = 14 }) {
    return <div className="skeleton-line" style={{ width, height }} />;
}

export function ErrorInline({ onRetry }) {
    return (
        <div className="error-inline">
            <span>تعذر تحميل البيانات</span>
            <button onClick={onRetry}><RotateCcw size={13} /> إعادة المحاولة</button>
        </div>
    );
}

/* صف "تسمية + شريط تقدم" — أي مكان محتاج يعرض نسبة (تكنولوجيا، أهداف، مهام...).
   wide=true للنصوص الطويلة عشان العمود مايبقاش ضيق. */
export function BarRow({ label, display, percent, color = 'var(--color-orange)', wide = false }) {
    return (
        <div className={`tech-row${wide ? ' tech-row--wide' : ''}`}>
            <span className="tech-name">{label}</span>
            <div className="tech-track"><div className="tech-fill" style={{ width: percent, background: color }} /></div>
            <span className="tech-value">{display}</span>
        </div>
    );
}

/* صف "عنصر شمال + عنصر يمين" — أي قايمة تفاصيل أو ترتيب. */
export function ListRow({ left, right }) {
    return (
        <div className="detail-row">
            <span>{left}</span>
            {right}
        </div>
    );
}

/* حقل "تسمية صغيرة فوق + قيمة تحتها" — بيتكرر في أي كارت تفاصيل. */
export function Field({ label, value }) {
    return (
        <div>
            <div className="field-label">{label}</div>
            <div className="field-value">{value}</div>
        </div>
    );
}
export function BreakdownRow({
    label,
    count,
    percentage,
    color = "gray",
}) {
    return (
        <div className="breakdown-item">

            <div className="breakdown-info">
                <span>
                    <span className={`legend-dot ${color}`} />
                    {label}
                </span>

                <strong>{count}</strong>
            </div>

            <div className="progress-bar">
                <div
                    className={`progress-fill ${color}`}
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>

            <span className="percentage">
                {percentage}%
            </span>

        </div>
    );
}

export function TrendBar({
    value,
    height,
    label,
    color = "both",
}) {
    return (
        <div className="bar-wrapper">

            <div
                className="bar-column"
                style={{ height: `${height}%` }}
            >
                <span className="bar-value">
                    {value}
                </span>

                <div className={`trend-bar ${color}`} />
            </div>

            <span className="week-label">
                {label}
            </span>

        </div>
    );
}
/* مجموعة أزرار toggle (زي Both/New/Upgrade أو Site/Cell-level).
   options: [[value, label], ...] */
export function ToggleGroup({ options, value, onChange }) {
    return (
        <div className="control-group">
            {options.map(([val, label]) => (
                <button
                    key={val}
                    className={`control-button${value === val ? " active" : ""}`}
                    onClick={() => onChange(val)}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

/* كارت "عنوان + subtitle + قايمة BreakdownRow" — بيتكرر في صفحة
   Analytics 3 مرات (Type / Effect / Improvement) بنفس الهيكل بالظبط،
   الفرق بس في العنوان والـ rows، فبقى component واحد بياخدهم كـ props. */
export function BreakdownCard({ title, subtitle, rows }) {
    return (
        <Card className="analytics-card">
            <div className="section-header">
                <div>
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                </div>
            </div>

            <div className="breakdown-list">
                {rows.map((row) => (
                    <BreakdownRow key={row.label} {...row} />
                ))}
            </div>
        </Card>
    );
}

export function RolloutBar({
    value,
    height,
    label,
}) {
    return (
        <div className="rollout-bar-wrapper">

            <span className="rollout-value">
                {value}
            </span>

            <div
                className="rollout-bar"
                style={{
                    height: `${height}%`,
                }}
            />

            <span className="rollout-label">
                {label}
            </span>

        </div>
    );
}