import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  X, 
  FileSpreadsheet, 
  FileCode, 
  Printer, 
  CheckCircle
} from 'lucide-react';

import { useAppStore, CLASS_META } from '../store/useAppStore';

export function ExportModal() {
  const { 
    isExportOpen, 
    setExportOpen, 
    startDate, 
    endDate,
    currentHour, 
  } = useAppStore();

  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/india_hotspots_precision_points.geojson')
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.warn('Failed to load points for export:', err));
  }, []);

  if (!isExportOpen) return null;

  // Filter features matching active date range
  const activeHour = Math.floor(currentHour);
  const filteredFeatures = (geojsonData?.features || []).filter((f: any) => {
    const p = f.properties;
    return p.acq_date >= startDate && p.acq_date <= endDate;
  });


  const totalCount = filteredFeatures.length;
  const maxFrp = filteredFeatures.reduce((m: number, f: any) => Math.max(m, f.properties.frp || 0), 0);
  const avgBright = totalCount > 0
    ? (filteredFeatures.reduce((s: number, f: any) => s + (f.properties.brightness || 0), 0) / totalCount).toFixed(1)
    : '0';

  const classCounts = filteredFeatures.reduce((acc: Record<number, number>, f: any) => {
    const c = f.properties.cls ?? 1;
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const dateRangeLabel = startDate === endDate ? startDate : `${startDate} ➔ ${endDate}`;
  const dateFileName = startDate === endDate ? startDate : `${startDate}_to_${endDate}`;

  // ── 1. Export GeoJSON ──
  const handleExportGeoJSON = () => {
    setDownloading('geojson');
    const exportFC = {
      type: 'FeatureCollection',
      metadata: {
        title: 'ThermalWatch AI Defense Hotspot Export',
        exported_at: new Date().toISOString(),
        date_range: dateRangeLabel,
        start_date: startDate,
        end_date: endDate,
        active_hour_utc: activeHour,
        total_hotspots: totalCount,
      },
      features: filteredFeatures,
    };

    const blob = new Blob([JSON.stringify(exportFC, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ThermalWatch_Hotspots_${dateFileName}_${String(activeHour).padStart(2, '0')}00UTC.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(null), 1200);
  };


  // ── 2. Export CSV ──
  const handleExportCSV = () => {
    setDownloading('csv');
    const headers = [
      'id',
      'latitude',
      'longitude',
      'acq_date',
      'acq_time',
      'brightness_k',
      'frp_mw',
      'class_id',
      'class_name',
      'elevation_m',
      'land_cover',
      'no2_mmol_m2',
      'so2_mdu',
      'source_satellite',
      'is_anomaly',
    ];

    const rows = filteredFeatures.map((f: any) => {
      const p = f.properties;
      const coords = f.geometry.coordinates;
      const clsName = CLASS_META[p.cls]?.name || 'Unknown';
      return [
        p.id,
        coords[1],
        coords[0],
        p.acq_date,
        p.acq_time || `${String(p.acq_hour || 12).padStart(2, '0')}:00`,
        p.brightness,
        p.frp,
        p.cls,
        `"${clsName}"`,
        p.elevation,
        `"${p.land_cover || 'Unknown'}"`,
        p.no2,
        p.so2,
        p.source || 'VIIRS_JPSS1',
        p.is_anomaly ? 'TRUE' : 'FALSE',
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ThermalWatch_Hotspots_${dateFileName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(null), 1200);
  };

  // ── 3. Print / PDF Defense Brief ──
  const handlePrintDossier = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ThermalWatch AI — Tactical Defense Intelligence Brief (${dateRangeLabel})</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #111; line-height: 1.4; }
            h1 { font-size: 22px; text-transform: uppercase; margin: 0 0 4px 0; color: #09090b; }
            .subtitle { font-size: 13px; color: #71717a; margin-bottom: 16px; }
            .meta-bar { background: #f4f4f5; padding: 12px 16px; border-radius: 8px; font-size: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; border: 1px solid #e4e4e7; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
            .card { background: #fafafa; padding: 12px 14px; border-radius: 8px; border: 1px solid #e4e4e7; }
            .card-title { font-size: 10px; text-transform: uppercase; color: #71717a; font-weight: 600; letter-spacing: 0.05em; }
            .card-val { font-size: 20px; font-weight: 800; margin-top: 4px; color: #09090b; }
            .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin: 24px 0 10px 0; border-bottom: 2px solid #09090b; padding-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; font-family: -apple-system, monospace; }
            th, td { border: 1px solid #e4e4e7; padding: 6px 8px; text-align: left; }
            th { background: #f4f4f5; font-weight: 700; color: #27272a; text-transform: uppercase; font-size: 9px; }
            tr:nth-child(even) { background: #fafafa; }
            .tag { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 9px; }
            .tag-0 { background: #fee2e2; color: #dc2626; }
            .tag-1 { background: #fef3c7; color: #d97706; }
            .tag-2 { background: #e0e7ff; color: #4338ca; }
            .tag-3 { background: #f3e8ff; color: #7e22ce; }
            .tag-4 { background: #fee2e2; color: #ef4444; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>ThermalWatch AI · Multi-Modal Hotspot Defense Brief</h1>
          <div class="subtitle">NTRO / SDMA / NDRF Incident Verification & Anomaly Assessment Dossier</div>
          
          <div class="meta-bar">
            <div><strong>Target Date Window:</strong> ${dateRangeLabel}</div>
            <div><strong>Active UTC Hour:</strong> ${String(activeHour).padStart(2, '0')}:00 UTC</div>
            <div><strong>Generated:</strong> ${new Date().toUTCString()}</div>
          </div>

          <div class="grid">
            <div class="card"><div class="card-title">Total Active Hotspots</div><div class="card-val">${totalCount.toLocaleString()}</div></div>
            <div class="card"><div class="card-title">Peak Radiative Power (FRP)</div><div class="card-val">${maxFrp.toFixed(1)} MW</div></div>
            <div class="card"><div class="card-title">Mean Brightness Temperature</div><div class="card-val">${avgBright} K</div></div>
            <div class="card"><div class="card-title">Accidental / Industrial Surges</div><div class="card-val">${(classCounts[4] || 0) + (classCounts[2] || 0)}</div></div>
          </div>

          <div class="section-title">Multi-Modal AI Classification Distribution</div>
          <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
            ${Object.entries(CLASS_META).map(([id, meta]) => `
              <div style="background: #f4f4f5; border: 1px solid #e4e4e7; padding: 6px 12px; border-radius: 6px; font-size: 11px;">
                <strong>${meta.name}:</strong> ${classCounts[Number(id)] || 0} detections
              </div>
            `).join('')}
          </div>

          <div class="section-title">Verified Hotspot Observation Log (${filteredFeatures.length} Total Records)</div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Coordinates</th>
                <th>Time (UTC)</th>
                <th>AI Classification</th>
                <th>Brightness</th>
                <th>FRP</th>
                <th>Elevation</th>
                <th>NO₂ Plume</th>
                <th>SO₂ Gas</th>
                <th>Land Cover</th>
                <th>Sensor</th>
              </tr>
            </thead>
            <tbody>
              ${filteredFeatures.slice(0, 100).map((f: any) => {
                const p = f.properties;
                const coords = f.geometry.coordinates;
                const clsId = p.cls ?? 1;
                const clsName = CLASS_META[clsId]?.name || 'Fire';
                return `
                  <tr>
                    <td><strong>#${p.id}</strong></td>
                    <td>${coords[1].toFixed(4)}°N, ${coords[0].toFixed(4)}°E</td>
                    <td>${p.acq_time || (String(p.acq_hour || 12).padStart(2, '0') + ':00')}</td>
                    <td><span class="tag tag-${clsId}">${clsName}</span></td>
                    <td>${p.brightness ? p.brightness.toFixed(1) + ' K' : '—'}</td>
                    <td><strong>${p.frp ? p.frp.toFixed(1) + ' MW' : '—'}</strong></td>
                    <td>${p.elevation ? p.elevation + 'm' : '—'}</td>
                    <td>${p.no2 ? p.no2.toFixed(3) : '0.000'}</td>
                    <td>${p.so2 ? p.so2.toFixed(3) : '0.000'}</td>
                    <td>${p.land_cover || 'Ground Surface'}</td>
                    <td>${p.source || 'VIIRS_JPSS1'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          ${filteredFeatures.length > 100 ? `<div style="margin-top: 10px; font-size: 10px; color: #71717a; text-align: center;">Showing first 100 of ${filteredFeatures.length} records. For the full dataset, export via CSV or GeoJSON.</div>` : ''}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
        onClick={() => setExportOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 540,
            background: '#18181b',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            padding: '24px 26px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 0, 0, 0.5)',
            fontFamily: 'Space Grotesk, sans-serif',
            color: '#fafafa',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Download size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', margin: 0 }}>
                  Export Tactical Fire Intelligence
                </h3>
                <span style={{ fontSize: 11, color: '#71717a' }}>
                  Download filtered 2024 satellite observations & defense telemetry
                </span>
              </div>
            </div>

            <button
              onClick={() => setExportOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#71717a',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Active Filter Scope Overview Card */}
          <div
            style={{
              background: '#121214',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  ACTIVE TARGET FILTER
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Geist Mono, monospace', color: '#f59e0b', marginTop: 2 }}>
                  {dateRangeLabel} · {String(activeHour).padStart(2, '0')}:00 UTC
                </div>

              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  MATCHED DETECTIONS
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Geist Mono, monospace', color: '#ffffff', marginTop: 2 }}>
                  {totalCount.toLocaleString()} Hotspots
                </div>
              </div>
            </div>

            {/* Class Breakdown Chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(CLASS_META).map(([id, meta]) => {
                const count = classCounts[Number(id)] || 0;
                return (
                  <div
                    key={id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 6,
                      padding: '3px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 10,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: 2, background: meta.color }} />
                    <span style={{ color: '#a1a1aa' }}>{meta.name}:</span>
                    <strong style={{ color: '#fafafa' }}>{count}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* 1. GeoJSON */}
            <button
              onClick={handleExportGeoJSON}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                padding: '12px 16px',
                color: '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#f59e0b')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileCode size={20} color="#f59e0b" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>GeoJSON Feature Collection (.geojson)</div>
                  <div style={{ fontSize: 10, color: '#71717a' }}>Full spatial precision geometries with ML feature metadata</div>
                </div>
              </div>
              {downloading === 'geojson' ? <CheckCircle size={18} color="#10b981" /> : <Download size={16} color="#71717a" />}
            </button>

            {/* 2. CSV Spreadsheet */}
            <button
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                padding: '12px 16px',
                color: '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileSpreadsheet size={20} color="#6366f1" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Defense Tabular Spreadsheet (.csv)</div>
                  <div style={{ fontSize: 10, color: '#71717a' }}>Coordinates, Kelvin temperatures, FRP MW & classification</div>
                </div>
              </div>
              {downloading === 'csv' ? <CheckCircle size={18} color="#10b981" /> : <Download size={16} color="#71717a" />}
            </button>

            {/* 3. Printable Defense Brief */}
            <button
              onClick={handlePrintDossier}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                padding: '12px 16px',
                color: '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#10b981')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Printer size={20} color="#10b981" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Tactical Command Brief (Print / PDF)</div>
                  <div style={{ fontSize: 10, color: '#71717a' }}>Formal executive summary for SDMA / NDRF incident response</div>
                </div>
              </div>
              <Download size={16} color="#71717a" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
