import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, Badge, SkeletonLine, ErrorInline } from "../Components.jsx";
import { API_CONFIG, MOCK_DATA_TABLE, useApiData } from "../api.js";
import { ChevronRight, ChevronDown, Download } from "lucide-react";
import "./DataTable.css";

export default function DataTable() {
  // استقبال قيمة البحث القادمة من الهيدر عبر الـ AppLayout[cite: 2]
  const outletContext = useOutletContext() || {};
  const searchQuery = outletContext.searchQuery || "";

  const [expandedSites, setExpandedSites] = useState({});
  const [techFilter, setTechFilter] = useState("All");
  const [objectiveFilter, setObjectiveFilter] = useState("All");

  const { data: apiData, status, retry } = useApiData(
    API_CONFIG.endpoints.dataTable,
    {},
    MOCK_DATA_TABLE
  );

  const dataList = Array.isArray(apiData) ? apiData : MOCK_DATA_TABLE;

  // دالة لتصدير البيانات الحالية إلى ملف CSV
  const handleExportCSV = () => {
    if (!filteredData || filteredData.length === 0) return;

    const headers = ["Site / Cell", "Code", "Type", "Tech", "Go-Live", "Cells", "Customers Reached"];
    const rows = filteredData.map(item => [
      `"${item.site_name || ""}"`,
      `"${item.site_code || ""}"`,
      `"${item.category || ""}"`,
      `"${Array.isArray(item.technology) ? item.technology.join("+") : ""}"`,
      `"${item.go_live_date || ""}"`,
      item.cells_count || 0,
      item.customers_total || 0
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "site_data_table.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = useMemo(() => {
    if (!Array.isArray(dataList)) return [];
    return dataList.filter(item => {
      const siteName = item?.site_name || "";
      const siteCode = item?.site_code || "";
      const matchesSearch =
        siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        siteCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTech = techFilter === "All" || (Array.isArray(item?.technology) && item.technology.includes(techFilter));
      const matchesObjective = objectiveFilter === "All" || item?.objective === objectiveFilter;

      return matchesSearch && matchesTech && matchesObjective;
    });
  }, [dataList, searchQuery, techFilter, objectiveFilter]);

  const toggleExpand = (code) => {
    setExpandedSites(prev => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <div className="datatable-page">

      {/* شريط التحكم (الفلاتر وزر التصدير) */}
      <div className="datatable-controls">
        <div className="datatable-controls-actions">
          <select className="filter-select" value={techFilter} onChange={(e) => setTechFilter(e.target.value)}>
            <option value="All">All technologies</option>
            <option value="U900">U900</option>
            <option value="4G">4G</option>
            <option value="2G">2G</option>
            <option value="3G">3G</option>
          </select>

          <select className="filter-select" value={objectiveFilter} onChange={(e) => setObjectiveFilter(e.target.value)}>
            <option value="All">All Objectives</option>
            <option value="Road">Road</option>
            <option value="Corporate">Corporate</option>
            <option value="Roaming">Roaming</option>
            <option value="Densification">Densification</option>
          </select>

          <button
            className="btn btn--outline btn--icon"
            onClick={handleExportCSV}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* الجدول الرئيسي الممتد بعرض الشاشة مع دعم التمرير للكميات الكبيرة */}
      <Card className="table-card">
        {status === "loading" && <div className="table-status-pad"><SkeletonLine width="100%" height={300} /></div>}
        {status === "error" && <div className="table-status-pad"><ErrorInline onRetry={retry} /></div>}

        {status === "success" && (
          <div className="table-responsive">
            <table className="custom-data-table">
              <thead className="table-head-sticky">
                <tr>
                  <th>SITE / CELL</th>
                  <th>CODE</th>
                  <th>TYPE</th>
                  <th>TECH</th>
                  <th>GO-LIVE</th>
                  <th>CELLS</th>
                  <th className="col-right">CUSTOMERS REACHED</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      No matching data found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
                    const isExpanded = !!expandedSites[item.site_code];
                    const isUpgrade = item.category === "Upgrade";
                    const hasCells = isUpgrade && Array.isArray(item.cells) && item.cells.length > 0;

                    return (
                      <React.Fragment key={item.site_code}>
                        <tr>
                          <td>
                            <div className="site-name-wrap">
                              {hasCells && (
                                <span className="expand-toggle" onClick={() => toggleExpand(item.site_code)}>
                                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </span>
                              )}
                              <span className="cell-site-name">{item.site_name}</span>
                            </div>
                          </td>
                          <td className="cell-code">{item.site_code}</td>
                          <td>
                            <Badge variant={item.category === "New Site" ? "new" : "upgrade"} shape="pill">
                              {item.category}
                            </Badge>
                          </td>
                          <td>{Array.isArray(item.technology) ? item.technology.join("+") : ""}</td>
                          <td className="cell-muted">{item.go_live_date}</td>
                          <td>{item.cells_count}</td>
                          <td className="cell-customers">
                            {item.customers_total ? item.customers_total.toLocaleString() : 0}
                          </td>
                        </tr>

                        {/* عرض الخلايا للـ Upgrade فقط عند التوسيع */}
                        {hasCells && isExpanded && item.cells.map((cellObj, idx) => (
                          <tr key={`${item.site_code}-cell-${idx}`} className="cell-row">
                            <td className="cell-row-indent">
                              ↳ {cellObj.cell}
                            </td>
                            <td></td>
                            <td></td>
                            <td className="cell-row-tech">{Array.isArray(item.technology) ? item.technology[0] : ""}</td>
                            <td></td>
                            <td></td>
                            <td className="cell-row-count">
                              {cellObj.count ? cellObj.count.toLocaleString() : 0}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}