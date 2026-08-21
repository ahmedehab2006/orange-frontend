import React from 'react';
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