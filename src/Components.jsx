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