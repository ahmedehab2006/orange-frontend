
import { NavLink } from 'react-router-dom';

const navItems = [
    { path: '/', label: 'Dashboard', icon: '▦' },
    { path: '/analytics', label: 'Analytics', icon: '▤' },
    { path: '/dial-search', label: 'Dial Search', icon: '⌕' },
    { path: '/data-table', label: 'Data Table', icon: '☰' },
    { path: '/upload', label: 'Upload', icon: '⇧' },
];

export default function Sidebar() {
    return (
        <div className="sidebar">
            <div className="logo">
                <div className="logo-icon">N</div>
                <div>
                    <h3>NEI</h3>
                    <span>Orange Egypt</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => (isActive ? 'active' : '')}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="data-freshness">
                <small>DATA FRESHNESS</small>
                <strong>Updated Jul 6, 2026</strong>
                <span>Weekly batch · 15 sites</span>
            </div>
        </div>
    );
}