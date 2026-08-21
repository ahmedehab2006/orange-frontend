import React, { useState, useMemo } from "react";
import { Card, Badge, SkeletonLine, ErrorInline } from "../Components.jsx";
import { API_CONFIG, MOCK_DATA_TABLE, useApiData } from "../api.js";
import { Search, ChevronRight, ChevronDown, Download } from "lucide-react";
import "./DataTable.css";

export default function DataTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSites, setExpandedSites] = useState({});
  const [techFilter, setTechFilter] = useState("All");
  const [objectiveFilter, setObjectiveFilter] = useState("All");

  const { data: apiData, status, retry } = useApiData(
    API_CONFIG.endpoints.dataTable,
    {},
    MOCK_DATA_TABLE
  );

  const dataList = Array.isArray(apiData) ? apiData : MOCK_DATA_TABLE;

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
    <div style={{ width: "100%", maxWidth: "100%", padding: "0 16px", boxSizing: "border-box" }}>
      {/* الهيدر العلوي وعنوان الصفحة */}
      <div className="table-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>

        <div style={{ position: "relative", width: "320px" }}>
          <div className="header-search" style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "0 12px", background: "#fff", border: "1px solid var(--color-border)", borderRadius: 8 }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search site, code, or dial number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: "none", outline: "none", width: "100%", height: "38px" }}
            />
          </div>
        </div>
      </div>

      {/* شريط التحكم (الفلاتر وزر التصدير) */}
      <div className="analytics-controls" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "16px", background: "var(--color-white)", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--color-border)", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select className="filter-select" value={techFilter} onChange={(e) => setTechFilter(e.target.value)}>
            <option value="All">All technologies</option>
            <option value="U900">U900</option>
            <option value="4G">4G</option>
          </select>

          <select className="filter-select" value={objectiveFilter} onChange={(e) => setObjectiveFilter(e.target.value)}>
            <option value="All">All Objectives</option>
            <option value="Road">Road</option>
            <option value="Corporate">Corporate</option>
            <option value="Roaming">Roaming</option>
            <option value="Densification">Densification</option>
          </select>

          <button className="btn btn--outline" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>



      {/* الجدول الرئيسي الممتد بعرض الشاشة مع دعم التمرير للكميات الكبيرة */}
      <Card style={{ padding: 0, width: "100%", overflow: "hidden" }}>
        {status === "loading" && <div style={{ padding: 20 }}><SkeletonLine width="100%" height={300} /></div>}
        {status === "error" && <div style={{ padding: 20 }}><ErrorInline onRetry={retry} /></div>}

        {status === "success" && (
          <div style={{ width: "100%", overflowX: "auto", maxHeight: "650px", overflowY: "auto" }}>
            <table className="custom-data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px", minWidth: "900px" }}>
              <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
                <tr>
                  <th style={{ padding: "14px 20px", color: "#64748b", borderBottom: "1px solid #ddd" }}>SITE / CELL</th>
                  <th style={{ padding: "14px 20px", color: "#64748b", borderBottom: "1px solid #ddd" }}>CODE</th>
                  <th style={{ padding: "14px 20px", color: "#64748b", borderBottom: "1px solid #ddd" }}>TYPE</th>
                  <th style={{ padding: "14px 20px", color: "#64748b", borderBottom: "1px solid #ddd" }}>TECH</th>
                  <th style={{ padding: "14px 20px", color: "#64748b", borderBottom: "1px solid #ddd" }}>GO-LIVE</th>
                  <th style={{ padding: "14px 20px", color: "#64748b", borderBottom: "1px solid #ddd" }}>CELLS</th>
                  <th style={{ padding: "14px 20px", color: "#64748b", borderBottom: "1px solid #ddd", textAlign: "right" }}>CUSTOMERS REACHED</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
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
                        <tr style={{ background: "#fff" }}>
                          <td style={{ padding: "14px 20px", borderBottom: "1px solid #ddd" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {hasCells && (
                                <span style={{ cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => toggleExpand(item.site_code)}>
                                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </span>
                              )}
                              <span style={{ fontWeight: 700, color: "#1a1d29" }}>{item.site_name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "14px 20px", borderBottom: "1px solid #ddd", color: "#64748b", fontFamily: "monospace" }}>{item.site_code}</td>
                          <td style={{ padding: "14px 20px", borderBottom: "1px solid #ddd" }}>
                            <Badge variant={item.category === "New Site" ? "new" : "upgrade"} shape="pill">
                              {item.category}
                            </Badge>
                          </td>
                          <td style={{ padding: "14px 20px", borderBottom: "1px solid #ddd" }}>{Array.isArray(item.technology) ? item.technology.join("+") : ""}</td>
                          <td style={{ padding: "14px 20px", borderBottom: "1px solid #ddd", color: "#64748b" }}>{item.go_live_date}</td>
                          <td style={{ padding: "14px 20px", borderBottom: "1px solid #ddd" }}>{item.cells_count}</td>
                          <td style={{ padding: "14px 20px", borderBottom: "1px solid #ddd", textAlign: "right", fontWeight: 800, color: "#1a1d29" }}>
                            {item.customers_total ? item.customers_total.toLocaleString() : 0}
                          </td>
                        </tr>

                        {/* عرض الخلايا للـ Upgrade فقط عند التوسيع */}
                        {hasCells && isExpanded && item.cells.map((cellObj, idx) => (
                          <tr key={`${item.site_code}-cell-${idx}`} style={{ background: "#f8f9fa" }}>
                            <td style={{ padding: "10px 20px 10px 44px", borderBottom: "1px solid #ddd", color: "#64748b", fontSize: "12px" }}>
                              ↳ {cellObj.cell}
                            </td>
                            <td style={{ borderBottom: "1px solid #ddd" }}></td>
                            <td style={{ borderBottom: "1px solid #ddd" }}></td>
                            <td style={{ padding: "10px 20px", borderBottom: "1px solid #ddd", fontSize: "12px", color: "#64748b" }}>{Array.isArray(item.technology) ? item.technology[0] : ""}</td>
                            <td style={{ borderBottom: "1px solid #ddd" }}></td>
                            <td style={{ borderBottom: "1px solid #ddd" }}></td>
                            <td style={{ padding: "10px 20px", borderBottom: "1px solid #ddd", textAlign: "right", fontWeight: 700, fontSize: "12px", color: "#1a1d29" }}>
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