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

  // 1. تصليح الكراش الأول: بنرجع النتايج الوهمية بدون ما نبحث في حقل phone لأنه مش موجود
  const filteredMockData = useMemo(() => {
    if (!activePhone) return [];
    // هنرجع البيانات الوهمية بس عشان الـ UI يشتغل
    return MOCK_CUSTOMER_EXPERIENCE;
  }, [activePhone]);

  // 2. تصليح طريقة استدعاء الـ API (تمرير رقم التليفون للدالة)
  const { data: apiResult, status, retry } = useApiData(
    activePhone ? API_CONFIG.endpoints.customerExperience(activePhone) : null,
    {},
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
        <h2 className="card-title search-card-title">Find what a customer experienced</h2>
        <p className="search-card-subtitle">
          Enter a phone number to see which enhancement(s) qualified this dial and when.
        </p>

        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrap">
            <input
              type="text"
              className="phone-search-input"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="Enter phone number..."
            />
          </div>
          <button type="submit" className="btn btn--primary btn--icon">
            <Search size={16} /> Search
          </button>
        </form>

        <div className="try-row">
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
                <div className="result-header">
                  <div>
                    <div className="field-label result-dial-label">DIAL</div>
                    <div className="result-dial-value">
                      {/* 3. تصليح الكراش التاني: بنستخدم activePhone بدل resultData.phone */}
                      {activePhone.replace(/(\d{3})\d{5}(\d{2})/, "$1•••••$2")}
                    </div>
                  </div>
                  {/* استخدمت كلمة ثابتة هنا لحد ما الباك إند يبرمج حقل الـ status */}
                  <Badge variant="success" shape="pill">{resultData.status || "Consistently impacted"}</Badge>
                </div>

                <div className="result-content-grid">

                  <div className="result-grid-fields">
                    <div>
                      <div className="field-label">SITE / CELL</div>
                      <div className="field-value">{resultData.site_name}</div>
                    </div>
                    <div>
                      <div className="field-label">ENHANCEMENT</div>
                      <div className="field-value">{resultData.enhancement}</div>
                    </div>
                    <div>
                      <div className="field-label">BENEFIT</div>
                      <div className="field-value">{resultData.benefit}</div>
                    </div>
                    <div>
                      <div className="field-label">GO-LIVE DATE</div>
                      <div className="field-value">{resultData.go_live_date}</div>
                    </div>
                    <div>
                      <div className="field-label">ENHANCEMENT HISTORY</div>
                      <div className="field-value">Jun 22, Jun 29</div>
                    </div>
                    <div>
                      <div className="field-label">DAY COUNT</div>
                      <div className="field-value">{resultData.day_count}</div>
                    </div>
                  </div>

                  <div className="result-map-container">
                    <MapContainer
                      center={[resultData.lat || 30.04, resultData.lng || 31.23]}
                      zoom={13}
                      className="leaflet-fill"
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
                    <div className="map-caption">
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