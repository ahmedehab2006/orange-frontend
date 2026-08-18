import { Routes, Route } from "react-router-dom";

import AppLayout from "../layout/AppLayout";

import Dashboard from "../pages/Dashboard";
import Analytics from "../pages/Analytics";
import DialSearch from "../pages/Dial Search";
import DataTable from "../pages/Data Table";
import Upload from "../pages/Upload";

function AppRoutes() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/dial-search" element={<DialSearch />} />
                <Route path="/data-table" element={<DataTable />} />
                <Route path="/upload" element={<Upload />} />
            </Route>
        </Routes>
    );
}

export default AppRoutes;