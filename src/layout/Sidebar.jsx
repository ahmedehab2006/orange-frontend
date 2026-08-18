import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <aside className="sidebar">

            <div className="logo">
                Orange
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/Dashboard">Dashboard</NavLink>
                <NavLink to="/analytics">Analytics</NavLink>
                <NavLink to="/dial-search">Dial Search</NavLink>
                <NavLink to="/data-table">Data Table</NavLink>
                <NavLink to="/upload">Upload</NavLink>
            </nav>

        </aside>
    );
}

export default Sidebar;