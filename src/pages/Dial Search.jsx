import React, { useState, useMemo } from "react";
import { Card, Badge, SkeletonLine, ErrorInline } from "../Components.jsx";
import { API_CONFIG, MOCK_CUSTOMER_EXPERIENCE, useApiData } from "../api.js";
import { Search } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import "./Dial Search.css";

export default function DialSearch() {
  const [searchPhone, setSearchPhone] = useState("");
  const [activePhone, setActivePhone] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const filteredMockData = useMemo(() => {
    if (!activePhone) return [];
    return MOCK_CUSTOMER_EXPERIENCE.filter(item => item.phone.includes(activePhone));
  }, [activePhone]);

  const { data: apiResult, status, retry } = useApiData(
    API_CONFIG.endpoints.customerExperience,
    { phone: activePhone },
    filteredMockData,
    { enabled: hasSearched && activePhone.length > 0 }
  );

  const resultData = apiResult && apiResult.length > 0 ? apiResult[0] : null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;
    setActivePhone(searchPhone);
    setHasSearched(true);
  };

  return (
    <div className="page-container">
      <Card className="search-card">
        <h2 className="card-title" style={{ fontSize: 18, marginBottom: 6 }}>Find what a customer experienced</h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginBottom: 16 }}>
          Enter a phone number to see which enhancement(s) qualified this dial and when.
        </p>

        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 12 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              className="phone-search-input"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="Enter phone number..."
            />
          </div>
          <button type="submit" className="btn btn--primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Search size={16} /> Search
          </button>
        </form>

        {/* إعادة أزرار الـ Try السريعة */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 12, color: "var(--color-text-muted)" }}>
          <span>Try:</span>
          <span className="try-badge" onClick={() => { setSearchPhone("0106547242"); setActivePhone("0106547242"); setHasSearched(true); }}>010•••••42</span>
          <span className="try-badge" onClick={() => { setSearchPhone("0123456789"); setActivePhone("0123456789"); setHasSearched(true); }}>012•••••47</span>
          <span className="try-badge" onClick={() => { setSearchPhone("0111222333"); setActivePhone("0111222333"); setHasSearched(true); }}>011•••••12</span>
        </div>
      </Card>

      {hasSearched && (
        <>
          {status === "loading" && <Card><SkeletonLine width="100%" height={220} /></Card>}
          {status === "error" && <Card><ErrorInline onRetry={retry} /></Card>}

          {status === "success" && (
            resultData ? (
              <Card className="result-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div className="field-label" style={{ marginBottom: 4 }}>DIAL</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text-dark)" }}>
                      {resultData.phone.replace(/(\d{3})\d{5}(\d{2})/, "$1•••••$2")}
                    </div>
                  </div>
                  <Badge variant="success" shape="pill">{resultData.status}</Badge>
                </div>

                <div className="result-content-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", alignItems: "center" }}>

                  <div className="result-grid-fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <div className="field-label">SITE / CELL</div>
                      <div className="field-value" style={{ fontSize: 14, marginTop: 2 }}>{resultData.site_name}</div>
                    </div>
                    <div>
                      <div className="field-label">ENHANCEMENT</div>
                      <div className="field-value" style={{ fontSize: 14, marginTop: 2 }}>{resultData.enhancement}</div>
                    </div>
                    <div>
                      <div className="field-label">BENEFIT</div>
                      <div className="field-value" style={{ fontSize: 14, marginTop: 2 }}>{resultData.benefit}</div>
                    </div>
                    <div>
                      <div className="field-label">GO-LIVE DATE</div>
                      <div className="field-value" style={{ fontSize: 14, marginTop: 2 }}>{resultData.go_live_date}</div>
                    </div>
                    <div>
                      <div className="field-label">ENHANCEMENT HISTORY</div>
                      <div className="field-value" style={{ fontSize: 14, marginTop: 2 }}>Jun 22, Jun 29</div>
                    </div>
                    <div>
                      <div className="field-label">DAY COUNT</div>
                      <div className="field-value" style={{ fontSize: 14, marginTop: 2 }}>{resultData.day_count}</div>
                    </div>
                  </div>

                  <div className="result-map-container" style={{ height: "160px", borderRadius: "8px", overflow: "hidden", position: "relative", border: "1px solid var(--color-border)" }}>
                    <MapContainer
                      center={[resultData.lat || 30.04, resultData.lng || 31.23]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                      dragging={false}
                      zoomControl={false}
                      scrollWheelZoom={false}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <CircleMarker
                        center={[resultData.lat || 30.04, resultData.lng || 31.23]}
                        radius={8}
                        pathOptions={{ color: "#0e9384", fillColor: "#0e9384", fillOpacity: 0.8 }}
                      />
                    </MapContainer>
                    <div style={{ position: "absolute", bottom: 4, left: 8, fontSize: 10, color: "#667085", background: "rgba(255,255,255,0.8)", padding: "2px 4px", borderRadius: "4px", zIndex: 1000 }}>
                      {resultData.site_name}
                    </div>
                  </div>

                </div>
              </Card>
            ) : (
              <Card>
                <div className="empty-state">No enhancement records found for this phone number.</div>
              </Card>
            )
          )}
        </>
      )}
    </div>
  );
}