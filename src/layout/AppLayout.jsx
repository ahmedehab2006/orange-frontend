import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import '../App.css'; // تأكدي من استدعاء ملف التنسيقات

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

    // تعريف حالة البحث هنا لتكون مشتركة بين الهيدر وصفحة الداتا تيبل
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                {/* تمرير الـ searchQuery و setSearchQuery للهيدر */}
                <Header
                    title={title}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                {/* تمرير الـ searchQuery للـ Outlet لكي تستقبله صفحة DataTable */}
                <div className="page-wrapper">
                    <Outlet context={{ searchQuery, setSearchQuery }} />
                </div>
            </div>
        </div>
    );
}