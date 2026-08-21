import { Search, User } from "lucide-react";
import { useLocation } from "react-router-dom";

function Header({ title, searchQuery, setSearchQuery, suggestions = [], onSelectSuggestion }) {
    const location = useLocation();
    const isDataTable = location.pathname === "/data-table";

    return (
        <header className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
            <h1>{title}</h1>

            <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {isDataTable && (
                    <div style={{ position: "relative", width: "300px" }}>
                        <div className="header-search" style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "0 12px", background: "#fff", border: "1px solid var(--color-border)", borderRadius: 8 }}>
                            <Search size={16} color="#64748b" />
                            <input
                                type="text"
                                placeholder="Search site, code..."
                                value={searchQuery || ""}
                                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                                style={{ border: "none", outline: "none", width: "100%", height: "36px", background: "transparent", fontSize: "13px" }}
                            />
                        </div>

                        {/* قائمة الاقتراحات المنسدلة تحت السيرش في الهيدر */}
                        {suggestions.length > 0 && searchQuery && (
                            <div style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                background: "#ffffff",
                                border: "1px solid var(--color-border)",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                zIndex: 1000,
                                marginTop: "4px",
                                maxHeight: "200px",
                                overflowY: "auto"
                            }}>
                                {suggestions.map(s => (
                                    <div
                                        key={s.site_code}
                                        onClick={() => {
                                            if (onSelectSuggestion) onSelectSuggestion(s.site_name);
                                        }}
                                        style={{
                                            padding: "10px 14px",
                                            fontSize: "13px",
                                            color: "var(--color-text-dark)",
                                            cursor: "pointer",
                                            borderBottom: "1px solid #f2f4f7"
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = "#fffaf0"}
                                        onMouseLeave={(e) => e.target.style.background = "transparent"}
                                    >
                                        <strong>{s.site_name}</strong> ({s.site_code})
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <button className="header-user">
                    <User size={19} />
                </button>
            </div>
        </header>
    );
}

export default Header;