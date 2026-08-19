import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const PAGE_TITLES = {
    '/': 'Main Dashboard',
    '/analytics': 'Analytics & Trends',
    '/dial-search': 'Dial Search',
    '/data-table': 'Site / Cell Data Table',
    '/upload': 'Upload & Validation',
};

export default function AppLayout() {
    const location = useLocation();
    const title = PAGE_TITLES[location.pathname] || 'NEI';

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header title={title} />
                <Outlet />
            </div>
        </div>
    );
}