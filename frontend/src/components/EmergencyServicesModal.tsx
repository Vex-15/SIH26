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

  // Determine incident target coordinates (selected cluster or active emergency preset)
  const incidentLat = activeEmergencyIncident?.lat ?? selectedCluster?.lat ?? 29.3909;
  const incidentLon = activeEmergencyIncident?.lon ?? selectedCluster?.lon ?? 76.9635;
  const incidentName =
    activeEmergencyIncident?.name ??
    (selectedCluster?.isAnomaly
      ? 'Anomalous Accidental Industrial Fire Zone'
      : selectedCluster?.landCover
      ? `${selectedCluster.landCover} Incident`
      : 'Panipat MIDC Industrial Complex');
  const incidentFrp = activeEmergencyIncident?.frp ?? selectedCluster?.maxFrp ?? 18.5;
  const incidentZScore = activeEmergencyIncident?.zScore ?? selectedCluster?.zScore ?? 4.12;

  // Auto-fetch OSM Overpass & OSRM routes when modal opens or coordinates change
  useEffect(() => {
    if (!isEmergencyServicesOpen) return;

    let isMounted = true;
    const loadServices = async () => {
      setIsFetchingEmergencyServices(true);
      try {
        const services = await fetchEmergencyServices(incidentLat, incidentLon, searchRadiusKm * 1000);
        if (isMounted) {
          setEmergencyServicesList(services);
          // Default select the closest route to display on map if none selected
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

    // If map is available, fit bounds to include incident and station
    if (map && (window as any).maplibregl?.LngLatBounds) {
      const bounds = new (window as any).maplibregl.LngLatBounds();
      bounds.extend([incidentLon, incidentLat]);
      bounds.extend([station.lon, station.lat]);
      for (const coord of station.routeGeometry) {
        bounds.extend(coord);
      }
      try {
        map.fitBounds(bounds, { padding: 100, maxZoom: 14, duration: 1000 });
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
          background: 'rgba(5, 5, 8, 0.72)',
          backdropFilter: 'none',
          zIndex: 1010,
        }}
      />

      {/* ── Defense Command HUD Modal (Feature 3 Spec) ── */}
      <motion.div
        key="emergency-services-modal"
        initial={{ opacity: 0, scale: 0.94, y: '-48%', x: '-50%' }}
        animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
        exit={{ opacity: 0, scale: 0.94, y: '-48%', x: '-50%' }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          zIndex: 1011,
          width: '94%',
          maxWidth: 780,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--neu-base)',
          border: 'none',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--neu-shadow-out)',
          fontFamily: 'var(--font-ui)',
          color: 'var(--neu-text-strong)',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'var(--neu-base)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--r-md)',
                  background: 'var(--neu-base-raised)',
                  boxShadow: 'var(--neu-shadow-out-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                }}
              >
                <Truck size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--neu-text-muted)',
                      background: 'var(--neu-base-raised)',
                      padding: '3px 10px',
                      borderRadius: 'var(--r-sm)',
                      boxShadow: 'var(--neu-shadow-in-sm)',
                    }}
                  >
                    OSM OVERPASS · OSRM ROUTING ENGINE
                  </span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} className="animate-ping" />
                    LIVE ETA CALCULATION
                  </span>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: '4px 0 0', color: 'var(--neu-text-strong)' }}>
                  Nearest Emergency Services & First Responder Dispatch
                </h2>
              </div>
            </div>

            <button
              onClick={() => setEmergencyServicesOpen(false)}
              style={{
                background: 'var(--neu-base)',
                border: 'none',
                color: 'var(--neu-text)',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 'var(--r-sm)',
                boxShadow: 'var(--neu-shadow-out-sm)',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Incident Telemetry Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--neu-base-raised)',
              border: 'none',
              borderRadius: 'var(--r-md)',
              padding: '10px 14px',
              marginTop: 14,
              fontSize: 12,
              boxShadow: 'var(--neu-shadow-out-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={15} color="var(--accent)" />
              <span style={{ fontWeight: 600, color: 'var(--neu-text-strong)' }}>{incidentName}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neu-text)' }}>
                ({incidentLat.toFixed(4)}° N, {incidentLon.toFixed(4)}° E)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              <span style={{ color: 'var(--accent)' }}>FRP: {incidentFrp.toFixed(1)} MW</span>
              <span style={{ color: 'var(--wildfire)' }}>Z-Score: +{incidentZScore.toFixed(2)}σ</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--neu-text)' }}>
                <span>Radius:</span>
                <select
                  value={searchRadiusKm}
                  onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
                  style={{
                    background: 'var(--neu-base-raised)',
                    border: '1px solid var(--surface-border)',
                    color: 'var(--neu-text-strong)',
                    borderRadius: 'var(--r-sm)',
                    padding: '2px 6px',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  <option value={15}>15 km</option>
                  <option value={25}>25 km (Standard)</option>
                  <option value={50}>50 km (Regional)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs & Status Filter ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            borderBottom: '1px solid var(--surface-border)',
            background: 'var(--neu-base)',
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-sm)',
                border: 'none',
                background: activeTab === 'all' ? 'var(--accent-subtle)' : 'transparent',
                color: activeTab === 'all' ? 'var(--accent)' : 'var(--neu-text)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All Facilities ({emergencyServicesList.length})
            </button>
            <button
              onClick={() => setActiveTab('fire')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-sm)',
                border: 'none',
                background: activeTab === 'fire' ? 'var(--agricultural)' : 'transparent',
                color: activeTab === 'fire' ? '#000000' : 'var(--neu-text)',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <Truck size={14} color={activeTab === 'fire' ? '#000000' : 'var(--agricultural)'} />
              <span>Fire Stations ({emergencyServicesList.filter((s) => s.type === 'fire_station').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('hospital')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-sm)',
                border: 'none',
                background: activeTab === 'hospital' ? 'var(--industrial)' : 'transparent',
                color: activeTab === 'hospital' ? '#000000' : 'var(--neu-text)',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <Building2 size={14} color={activeTab === 'hospital' ? '#000000' : 'var(--industrial)'} />
              <span>Hospitals & Trauma ({emergencyServicesList.filter((s) => s.type === 'hospital').length})</span>
            </button>
            {totalDispatchedCount > 0 && (
              <button
                onClick={() => setActiveTab('dispatched')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--r-sm)',
                  border: 'none',
                  background: activeTab === 'dispatched' ? 'var(--accent-subtle)' : 'transparent',
                  color: activeTab === 'dispatched' ? 'var(--accent)' : 'var(--neu-text)',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <CheckCircle2 size={14} />
                <span>En Route ({totalDispatchedCount})</span>
              </button>
            )}
          </div>

          {isFetchingEmergencyServices && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              <RefreshCw size={13} className="animate-spin" />
              <span>Computing OSRM Drive Routes...</span>
            </div>
          )}
        </div>

        {/* ── Station List Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--neu-text-disabled)' }}>
              <Building2 size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: 13 }}>No emergency facilities found matching filter.</p>
            </div>
          ) : (
            filteredList.map((station, index) => {
              const isDispatched = Boolean(dispatchedStations[station.id]);
              const isSelectedRoute = selectedEmergencyRoute?.id === station.id;
              const isFire = station.type === 'fire_station';
              const themeColor = isFire ? 'var(--agricultural)' : 'var(--industrial)';

              return (
                <div
                  key={station.id}
                  style={{
                    background: isSelectedRoute
                      ? 'var(--neu-base-raised)'
                      : 'var(--neu-base)',
                    borderRadius: 'var(--r-md)',
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'visible',
                    boxShadow: 'var(--neu-shadow-out-sm)',
                    border: isSelectedRoute
                      ? `2px solid ${themeColor}`
                      : '1px solid var(--surface-border)',
                  }}
                >
                  {/* Left accent indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: 4,
                      background: isDispatched ? 'var(--accent)' : themeColor,
                    }}
                  />

                  {/* Station Header: Icon, Name, Distance & ETA */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: `${themeColor}20`,
                          border: `1px solid ${themeColor}50`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: themeColor,
                        }}
                      >
                        {isFire ? <Truck size={18} /> : <Building2 size={18} />}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--neu-text-strong)' }}>
                            {station.name}
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: `${themeColor}22`,
                              color: themeColor,
                              letterSpacing: '0.05em',
                            }}
                          >
                            {isFire ? 'Fire Station' : 'Hospital / Trauma'}
                          </span>
                          {index === 0 && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: 'rgba(34, 197, 94, 0.18)',
                                color: 'var(--accent)',
                                border: '1px solid rgba(34, 197, 94, 0.4)',
                              }}
                            >
                              ⚡ FASTEST RESPONSE
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: 11, color: 'var(--neu-text)', marginTop: 2 }}>
                          {station.address} · <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neu-text-muted)' }}>{station.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* ETA & Distance Telemetry Box */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'right' }}>
                      <div>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            fontFamily: 'JetBrains Mono, Consolas, monospace',
                            color: isDispatched ? 'var(--accent)' : 'var(--neu-text-strong)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            justifyContent: 'flex-end',
                          }}
                        >
                          <Clock size={15} color={isDispatched ? '#22c55e' : themeColor} />
                          <span>ETA {station.etaMinutes} min</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--neu-text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {station.distanceKm} km · via OSRM Drive Route
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Units & Specialized Capabilities Pill Grid */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                    {station.unitsAvailable.map((unit, uIdx) => (
                      <span
                        key={uIdx}
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: 'var(--neu-base-raised)',
                          border: 'none',
                          color: 'var(--neu-text-em)',
                          boxShadow: 'var(--neu-shadow-in-sm)',
                        }}
                      >
                        🛡️ {unit}
                      </span>
                    ))}
                  </div>

                  {/* Action Controls: View Route + Dispatch Webhook */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 6,
                      paddingTop: 8,
                      borderTop: '1px solid var(--surface-border)',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* View route toggle */}
                    <button
                      onClick={() => handleSelectRoute(station)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--r-sm)',
                        border: isSelectedRoute ? `2px solid ${themeColor}` : 'none',
                        background: isSelectedRoute ? `${themeColor}20` : 'var(--neu-base-raised)',
                        color: isSelectedRoute ? themeColor : 'var(--neu-text-em)',
                        fontSize: 11,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        boxShadow: isSelectedRoute ? 'none' : 'var(--neu-shadow-in-sm)',
                      }}
                    >
                      <Navigation size={13} />
                      <span>{isSelectedRoute ? '✓ ROUTE ACTIVE ON MAP' : 'VIEW ROUTE ON MAP'}</span>
                    </button>

                    {/* Dispatch unit button */}
                    <button
                      onClick={() => handleDispatch(station)}
                      disabled={isDispatched || dispatchingId === station.id}
                      style={{
                        padding: '7px 16px',
                        borderRadius: 'var(--r-sm)',
                        border: 'none',
                        background: isDispatched
                          ? 'var(--accent-subtle)'
                          : 'var(--accent)',
                        color: isDispatched ? 'var(--accent)' : '#000000',
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: isDispatched ? 'default' : 'pointer',
                        boxShadow: isDispatched ? 'var(--neu-shadow-in-sm)' : 'var(--neu-shadow-out-sm)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {dispatchingId === station.id ? (
                        <>
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              border: '2px solid rgba(255,255,255,0.4)',
                              borderTopColor: '#ffffff',
                            }}
                            className="animate-spin"
                          />
                          <span>TRANSMITTING DISPATCH...</span>
                        </>
                      ) : isDispatched ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>EN ROUTE (DISPATCHED {dispatchedStations[station.id]?.timestamp})</span>
                        </>
                      ) : (
                        <>
                          <SendHorizontal size={14} />
                          <span>DISPATCH [{isFire ? 'FIRE SQUAD' : 'TRAUMA TEAM'}]</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Bottom Telegram Webhook & Transmission Receipt Accordion ── */}
        {lastTelegramPayload && (
          <div
            style={{
              borderTop: '1px solid rgba(34, 197, 94, 0.3)',
              background: '#0d1610',
              padding: '12px 24px',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                <Radio size={15} />
                <span>TELEGRAM EMERGENCY WEBHOOK TRANSMITTED · {lastTelegramPayload.authCode}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--neu-text-muted)' }}>
                <span>{showTelegramReceipt ? 'Hide Transmission Receipt' : 'View Payload Receipt'}</span>
                {showTelegramReceipt ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </div>

            {showTelegramReceipt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: 10 }}
              >
                <pre
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono, Consolas, monospace',
                    color: '#86efac',
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

        {/* ── Footer ── */}
        <div
          style={{
            padding: '12px 24px',
            background: 'var(--neu-base)',
            borderTop: '1px solid var(--surface-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: 'var(--neu-text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>OSM OVERPASS QL · PROJECT OSRM ROUTER · PROTOCOL V3</span>
          <button
            onClick={() => setEmergencyServicesOpen(false)}
            style={{
              background: 'var(--neu-base-raised)',
              border: 'none',
              color: 'var(--neu-text-strong)',
              borderRadius: 'var(--r-sm)',
              padding: '4px 12px',
              fontSize: 11,
              cursor: 'pointer',
              boxShadow: 'var(--neu-shadow-out-sm)',
            }}
          >
            Close Grid
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
