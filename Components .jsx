
export function Badge({ variant = 'neutral', shape = 'pill', children, className = '' }) {
    return (
        <span className={`badge badge--${shape} badge--${variant} ${className}`}>
            {children}
        </span>
    );
}


export function Card({ title, children, className = '' }) {
    return (
        <div className={`card ${className}`}>
            {title && <div className="card-title">{title}</div>}
            {children}
        </div>
    );
}