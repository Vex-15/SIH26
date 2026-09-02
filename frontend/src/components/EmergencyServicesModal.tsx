import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Truck,
  Building2,
  Navigation,
  SendHorizontal,
  CheckCircle2,
  RefreshCw,
  Clock,
  Radio,
  ChevronDown,
  ChevronUp,
  MapPin,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import {
  fetchEmergencyServices,
  sendTelegramDispatchWebhook,
  type EmergencyServiceStation,
  type TelegramDispatchPayload,
} from '../utils/emergencyServices';
import { playTacticalAlertSound } from '../utils/windSpreadModel';

export function EmergencyServicesModal() {
  const {
    isEmergencyServicesOpen,
    setEmergencyServicesOpen,
    activeEmergencyIncident,
    selectedCluster,
    map,
    emergencyServicesList,
    setEmergencyServicesList,
    selectedEmergencyRoute,
    setSelectedEmergencyRoute,
    dispatchedStations,
    dispatchEmergencyStation,
    isFetchingEmergencyServices,
    setIsFetchingEmergencyServices,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'all' | 'fire' | 'hospital' | 'dispatched'>('all');
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [lastTelegramPayload, setLastTelegramPayload] = useState<TelegramDispatchPayload | null>(null);
  const [showTelegramReceipt, setShowTelegramReceipt] = useState<boolean>(false);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(25);

  const incidentLat = activeEmergencyIncident?.lat ?? selectedCluster?.lat ?? 29.3909;
  const incidentLon = activeEmergencyIncident?.lon ?? selectedCluster?.lon ?? 76.9635;
  const incidentName =
    activeEmergencyIncident?.name ??
    (selectedCluster?.isAnomaly
      ? 'Accidental Industrial Fire Zone'
      : selectedCluster?.landCover
      ? `${selectedCluster.landCover} Incident`
      : 'Panipat Industrial Zone');
  const incidentFrp = activeEmergencyIncident?.frp ?? selectedCluster?.maxFrp ?? 18.5;
  const incidentZScore = activeEmergencyIncident?.zScore ?? selectedCluster?.zScore ?? 4.12;

  useEffect(() => {
    if (!isEmergencyServicesOpen) return;

    let isMounted = true;
    const loadServices = async () => {
      setIsFetchingEmergencyServices(true);
      try {
        const services = await fetchEmergencyServices(incidentLat, incidentLon, searchRadiusKm * 1000);
        if (isMounted) {
          setEmergencyServicesList(services);
          if (services.length > 0 && !selectedEmergencyRoute) {
            setSelectedEmergencyRoute(services[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load emergency services:', err);
      } finally {
        if (isMounted) {
          setIsFetchingEmergencyServices(false);
        }
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, [isEmergencyServicesOpen, incidentLat, incidentLon, searchRadiusKm]);

  if (!isEmergencyServicesOpen) return null;

  const handleSelectRoute = (station: EmergencyServiceStation) => {
    setSelectedEmergencyRoute(station);

    if (map && (window as any).maplibregl?.LngLatBounds) {
      const bounds = new (window as any).maplibregl.LngLatBounds();
      bounds.extend([incidentLon, incidentLat]);
      bounds.extend([station.lon, station.lat]);
      for (const coord of station.routeGeometry) {
        bounds.extend(coord);
      }
      try {
        map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 900 });
      } catch (e) {
        console.warn('Map bounds fitting failed:', e);
      }
    }
  };

  const handleDispatch = async (station: EmergencyServiceStation) => {
    if (dispatchingId || dispatchedStations[station.id]) return;

    setDispatchingId(station.id);
    playTacticalAlertSound();

    try {
      const payload = await sendTelegramDispatchWebhook(station, {
        lat: incidentLat,
        lon: incidentLon,
        name: incidentName,
        frp: incidentFrp,
        zScore: incidentZScore,
      });

      dispatchEmergencyStation(station.id, {
        timestamp: new Date().toLocaleTimeString(),
        unitType: station.unitsAvailable[0] || 'Emergency Unit',
        dispatchId: payload.incidentId,
      });

      setLastTelegramPayload(payload);
      setShowTelegramReceipt(true);
      setSelectedEmergencyRoute(station);
      playTacticalAlertSound();
    } catch (err) {
      console.error('Dispatch failed:', err);
    } finally {
      setDispatchingId(null);
    }
  };

  const filteredList = emergencyServicesList.filter((s) => {
    if (activeTab === 'fire') return s.type === 'fire_station';
    if (activeTab === 'hospital') return s.type === 'hospital';
    if (activeTab === 'dispatched') return Boolean(dispatchedStations[s.id]);
    return true;
  });

  const totalDispatchedCount = Object.keys(dispatchedStations).length;

  return (
    <AnimatePresence>
      {/* ── Backdrop ── */}
      <motion.div
        key="emergency-services-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setEmergencyServicesOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 1010,
        }}
      />

      {/* ── Command HUD Modal ── */}
      <motion.div
        key="emergency-services-modal"
        initial={{ opacity: 0, scale: 0.96, y: '-48%', x: '-50%' }}
        animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
        exit={{ opacity: 0, scale: 0.96, y: '-48%', x: '-50%' }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          zIndex: 1011,
          width: '92%',
          maxWidth: 720,
          maxHeight: '86vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--neu-base)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--neu-shadow-out-lg)',
          fontFamily: 'var(--font-ui)',
          color: 'var(--neu-text-strong)',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--neu-base-raised)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--accent-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                  flexShrink: 0,
                }}
              >
                <Truck size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--neu-text-disabled)',
                    }}
                  >
                    OSM Overpass · OSRM Routing
                  </span>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} />
                    Live ETA
                  </span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '2px 0 0', color: 'var(--neu-text-strong)', letterSpacing: '-0.01em' }}>
                  Nearest Emergency Services Grid
                </h3>
              </div>
            </div>

            <button
              onClick={() => setEmergencyServicesOpen(false)}
              className="neu-icon-btn"
              style={{ width: 26, height: 26 }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Incident Telemetry Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--neu-base)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-sm)',
              padding: '8px 12px',
              marginTop: 12,
              fontSize: 11,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={13} color="var(--accent)" />
              <span style={{ fontWeight: 600, color: 'var(--neu-text-strong)' }}>{incidentName}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neu-text-disabled)' }}>
                {incidentLat.toFixed(4)}° N, {incidentLon.toFixed(4)}° E
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 10 }}>
              <span style={{ color: 'var(--accent)' }}>FRP: {incidentFrp.toFixed(1)} MW</span>
              <span style={{ color: '#ef4444' }}>Z: +{incidentZScore.toFixed(2)}σ</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--neu-text)' }}>
                <span>Radius:</span>
                <select
                  value={searchRadiusKm}
                  onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
                  style={{
                    background: 'var(--neu-base-raised)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--neu-text-strong)',
                    borderRadius: 'var(--r-sm)',
                    padding: '2px 4px',
                    fontSize: 10,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value={15}>15 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--neu-base)',
          }}
        >
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { id: 'all', label: `All (${emergencyServicesList.length})` },
              { id: 'fire', label: `Fire Stations (${emergencyServicesList.filter((s) => s.type === 'fire_station').length})` },
              { id: 'hospital', label: `Hospitals (${emergencyServicesList.filter((s) => s.type === 'hospital').length})` },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--r-sm)',
                    border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                    background: isActive ? 'var(--neu-base-raised)' : 'transparent',
                    color: isActive ? 'var(--neu-text-strong)' : 'var(--neu-text)',
                    fontSize: 11,
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}

            {totalDispatchedCount > 0 && (
              <button
                onClick={() => setActiveTab('dispatched')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--r-sm)',
                  border: activeTab === 'dispatched' ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  background: activeTab === 'dispatched' ? 'var(--accent-subtle)' : 'transparent',
                  color: 'var(--accent)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                En Route ({totalDispatchedCount})
              </button>
            )}
          </div>

          {isFetchingEmergencyServices && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              <RefreshCw size={11} className="animate-spin" />
              <span>Routing...</span>
            </div>
          )}
        </div>

        {/* ── Station List Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--neu-text-disabled)' }}>
              <Building2 size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: 12 }}>No emergency facilities found matching filter.</p>
            </div>
          ) : (
            filteredList.map((station, index) => {
              const isDispatched = Boolean(dispatchedStations[station.id]);
              const isSelectedRoute = selectedEmergencyRoute?.id === station.id;
              const isFire = station.type === 'fire_station';
              const themeColor = isFire ? '#f97316' : '#a855f7';

              return (
                <div
                  key={station.id}
                  style={{
                    background: isSelectedRoute ? 'var(--neu-base-raised)' : 'var(--neu-base)',
                    borderRadius: 'var(--r-md)',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    border: '1px solid',
                    borderColor: isSelectedRoute ? 'var(--accent)' : 'var(--border-subtle)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 'var(--r-sm)',
                          background: `${themeColor}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: themeColor,
                          flexShrink: 0,
                        }}
                      >
                        {isFire ? <Truck size={15} /> : <Building2 size={15} />}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--neu-text-strong)' }}>
                            {station.name}
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              padding: '1px 5px',
                              borderRadius: 3,
                              background: `${themeColor}15`,
                              color: themeColor,
                            }}
                          >
                            {isFire ? 'Fire' : 'Hospital'}
                          </span>
                          {index === 0 && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                padding: '1px 5px',
                                borderRadius: 3,
                                background: 'rgba(34, 197, 94, 0.12)',
                                color: '#22c55e',
                              }}
                            >
                              Fastest
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: 10, color: 'var(--neu-text)', marginTop: 2 }}>
                          {station.address} · <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neu-text-disabled)' }}>{station.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* ETA */}
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: isDispatched ? '#22c55e' : 'var(--neu-text-strong)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Clock size={13} color={isDispatched ? '#22c55e' : themeColor} />
                        <span>{station.etaMinutes} min</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--neu-text-disabled)', fontFamily: 'var(--font-mono)' }}>
                        {station.distanceKm} km
                      </div>
                    </div>
                  </div>

                  {/* Units */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {station.unitsAvailable.map((unit, uIdx) => (
                      <span
                        key={uIdx}
                        style={{
                          fontSize: 9,
                          fontWeight: 500,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'var(--neu-base-raised)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--neu-text-em)',
                        }}
                      >
                        {unit}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 6,
                      borderTop: '1px solid var(--border-subtle)',
                      gap: 8,
                    }}
                  >
                    <button
                      onClick={() => handleSelectRoute(station)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--r-sm)',
                        border: '1px solid',
                        borderColor: isSelectedRoute ? 'var(--accent)' : 'var(--border-subtle)',
                        background: isSelectedRoute ? 'var(--accent-subtle)' : 'transparent',
                        color: isSelectedRoute ? 'var(--accent)' : 'var(--neu-text)',
                        fontSize: 10,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                      }}
                    >
                      <Navigation size={11} />
                      <span>{isSelectedRoute ? 'Active Route' : 'View Route'}</span>
                    </button>

                    <button
                      onClick={() => handleDispatch(station)}
                      disabled={isDispatched || dispatchingId === station.id}
                      className={isDispatched ? "neu-btn" : "neu-btn-accent"}
                      style={{
                        padding: '5px 12px',
                        fontSize: 11,
                        cursor: isDispatched ? 'default' : 'pointer',
                      }}
                    >
                      {dispatchingId === station.id ? (
                        <>
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              border: '2px solid rgba(255,255,255,0.4)',
                              borderTopColor: '#ffffff',
                            }}
                            className="animate-spin"
                          />
                          <span>Transmitting...</span>
                        </>
                      ) : isDispatched ? (
                        <>
                          <CheckCircle2 size={12} color="#22c55e" />
                          <span style={{ color: '#22c55e' }}>En Route ({dispatchedStations[station.id]?.timestamp})</span>
                        </>
                      ) : (
                        <>
                          <SendHorizontal size={12} />
                          <span>Dispatch Unit</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Telegram Receipt */}
        {lastTelegramPayload && (
          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--neu-base-raised)',
              padding: '10px 20px',
            }}
          >
            <div
              onClick={() => setShowTelegramReceipt(!showTelegramReceipt)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#22c55e', fontWeight: 600 }}>
                <Radio size={13} />
                <span>Telegram Webhook Transmitted · {lastTelegramPayload.authCode}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--neu-text-disabled)' }}>
                <span>{showTelegramReceipt ? 'Hide Payload' : 'View Payload'}</span>
                {showTelegramReceipt ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </div>
            </div>

            {showTelegramReceipt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: 8 }}
              >
                <pre
                  style={{
                    background: 'var(--neu-base)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--r-sm)',
                    padding: '8px 10px',
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--neu-text-em)',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                  }}
                >
                  {lastTelegramPayload.telegramMessage}
                </pre>
              </motion.div>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: '10px 20px',
            background: 'var(--neu-base)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 10,
            color: 'var(--neu-text-disabled)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>OSM OVERPASS QL · OSRM ENGINE</span>
          <button
            onClick={() => setEmergencyServicesOpen(false)}
            className="neu-btn"
            style={{ padding: '3px 10px', fontSize: 10 }}
          >
            Close Grid
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
