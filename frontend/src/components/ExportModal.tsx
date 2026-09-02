import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  X, 
  FileSpreadsheet, 
  FileCode, 
  Printer, 
  Check
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

  const dateRangeLabel = startDate === endDate ? startDate : `${startDate} → ${endDate}`;
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
    setTimeout(() => setDownloading(null), 1000);
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
    setTimeout(() => setDownloading(null), 1000);
  };

  // ── 3. Print / PDF Defense Brief ──
  const handlePrintDossier = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ThermalWatch AI — Intelligence Brief (${dateRangeLabel})</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #111; line-height: 1.4; }
            h1 { font-size: 20px; text-transform: uppercase; margin: 0 0 4px 0; color: #09090b; }
            .subtitle { font-size: 12px; color: #71717a; margin-bottom: 16px; }
            .meta-bar { background: #f4f4f5; padding: 10px 14px; border-radius: 6px; font-size: 11px; margin-bottom: 16px; display: flex; justify-content: space-between; border: 1px solid #e4e4e7; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .card { background: #fafafa; padding: 10px 12px; border-radius: 6px; border: 1px solid #e4e4e7; }
            .card-title { font-size: 9px; text-transform: uppercase; color: #71717a; font-weight: 600; letter-spacing: 0.05em; }
            .card-val { font-size: 18px; font-weight: 700; margin-top: 3px; color: #09090b; }
            .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin: 20px 0 8px 0; border-bottom: 1.5px solid #09090b; padding-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; font-family: -apple-system, monospace; }
            th, td { border: 1px solid #e4e4e7; padding: 5px 6px; text-align: left; }
            th { background: #f4f4f5; font-weight: 600; color: #27272a; text-transform: uppercase; font-size: 8px; }
            tr:nth-child(even) { background: #fafafa; }
            .tag { display: inline-block; padding: 2px 5px; border-radius: 3px; font-weight: 600; font-size: 8px; }
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
          <h1>ThermalWatch AI · Multi-Modal Hotspot Brief</h1>
          <div class="subtitle">NTRO / SDMA / NDRF Incident Verification & Anomaly Assessment Dossier</div>
          
          <div class="meta-bar">
            <div><strong>Window:</strong> ${dateRangeLabel}</div>
            <div><strong>UTC Hour:</strong> ${String(activeHour).padStart(2, '0')}:00 UTC</div>
            <div><strong>Generated:</strong> ${new Date().toUTCString()}</div>
          </div>

          <div class="grid">
            <div class="card"><div class="card-title">Total Hotspots</div><div class="card-val">${totalCount.toLocaleString()}</div></div>
            <div class="card"><div class="card-title">Peak FRP</div><div class="card-val">${maxFrp.toFixed(1)} MW</div></div>
            <div class="card"><div class="card-title">Mean Radiance</div><div class="card-val">${avgBright} K</div></div>
            <div class="card"><div class="card-title">Accidental Surges</div><div class="card-val">${(classCounts[4] || 0) + (classCounts[2] || 0)}</div></div>
          </div>

          <div class="section-title">Verified Hotspot Observation Log (${filteredFeatures.length} Total Records)</div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Coordinates</th>
                <th>Time (UTC)</th>
                <th>Class</th>
                <th>Brightness</th>
                <th>FRP</th>
                <th>Elevation</th>
                <th>NO₂</th>
                <th>SO₂</th>
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
                    <td>${p.land_cover || 'Ground'}</td>
                    <td>${p.source || 'VIIRS_JPSS1'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
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
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
        onClick={() => setExportOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 480,
            background: 'var(--neu-base)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-xl)',
            padding: '20px',
            boxShadow: 'var(--neu-shadow-out-lg)',
            fontFamily: 'var(--font-ui)',
            color: 'var(--neu-text-strong)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Download size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>
                  Export Telemetry Data
                </h3>
                <span style={{ fontSize: 11, color: 'var(--neu-text-disabled)' }}>
                  Filtered 2024 satellite observations
                </span>
              </div>
            </div>

            <button
              onClick={() => setExportOpen(false)}
              className="neu-icon-btn"
              style={{ width: 26, height: 26 }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Active Filter Scope Overview Card */}
          <div
            style={{
              background: 'var(--neu-base-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-md)',
              padding: '12px 14px',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 9, color: 'var(--neu-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  Target Range
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginTop: 1 }}>
                  {dateRangeLabel} · {String(activeHour).padStart(2, '0')}:00 UTC
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: 'var(--neu-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  Observations
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--neu-text-strong)', marginTop: 1 }}>
                  {totalCount.toLocaleString()} pts
                </div>
              </div>
            </div>

            {/* Class Breakdown Chips */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {Object.entries(CLASS_META).map(([id, meta]) => {
                const count = classCounts[Number(id)] || 0;
                return (
                  <div
                    key={id}
                    style={{
                      background: 'var(--neu-base)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 4,
                      padding: '2px 6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 10,
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.color }} />
                    <span style={{ color: 'var(--neu-text)' }}>{meta.name}:</span>
                    <span style={{ color: 'var(--neu-text-strong)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* 1. GeoJSON */}
            <button
              onClick={handleExportGeoJSON}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--neu-base-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-md)',
                padding: '10px 14px',
                color: 'var(--neu-text-strong)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileCode size={16} color="var(--accent)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>GeoJSON Feature Collection</div>
                  <div style={{ fontSize: 10, color: 'var(--neu-text-disabled)' }}>Spatial vector geometries &amp; attributes (.geojson)</div>
                </div>
              </div>
              {downloading === 'geojson' ? <Check size={14} color="#22c55e" /> : <Download size={14} color="var(--neu-text-disabled)" />}
            </button>

            {/* 2. CSV Spreadsheet */}
            <button
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--neu-base-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-md)',
                padding: '10px 14px',
                color: 'var(--neu-text-strong)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileSpreadsheet size={16} color="#60a5fa" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Tabular Dataset (.csv)</div>
                  <div style={{ fontSize: 10, color: 'var(--neu-text-disabled)' }}>Coordinates, brightness, FRP MW, trace gases</div>
                </div>
              </div>
              {downloading === 'csv' ? <Check size={14} color="#22c55e" /> : <Download size={14} color="var(--neu-text-disabled)" />}
            </button>

            {/* 3. Printable Brief */}
            <button
              onClick={handlePrintDossier}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--neu-base-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-md)',
                padding: '10px 14px',
                color: 'var(--neu-text-strong)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Printer size={16} color="#34d399" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Intelligence Brief (Print / PDF)</div>
                  <div style={{ fontSize: 10, color: 'var(--neu-text-disabled)' }}>Executive incident report for NDMA / NDRF audits</div>
                </div>
              </div>
              <Download size={14} color="var(--neu-text-disabled)" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
