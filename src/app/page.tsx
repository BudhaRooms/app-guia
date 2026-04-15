"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { AudioPlayer } from '../components/AudioPlayer';
import { createClient } from '../utils/supabase/client';

const GLOBAL_CATEGORIES = [
  { name: 'Restaurantes',        emoji: '🍽️', gradient: 'from-amber-950/60 to-black',   accent: '#d4954a' },
  { name: 'Playas',              emoji: '🏖️', gradient: 'from-blue-950/60 to-black',     accent: '#4a9fd4' },
  { name: 'Centros Comerciales', emoji: '🛍️', gradient: 'from-purple-950/60 to-black',  accent: '#9f4ad4' },
  { name: 'Ocio Nocturno',       emoji: '🎶', gradient: 'from-pink-950/60 to-black',     accent: '#d44a9f' },
  { name: 'Zonas Concurridas',   emoji: '🚶', gradient: 'from-green-950/60 to-black',    accent: '#4ad48f' },
  { name: 'Monumentos',          emoji: '🏛️', gradient: 'from-yellow-950/60 to-black',  accent: '#d4c44a' },
  { name: 'Culturales',          emoji: '🎭', gradient: 'from-red-950/60 to-black',      accent: '#d44a4a' },
];

const ZONE_NAMES = ['Mercado Central', 'Corte Inglés', 'Plaza de Toros', 'Puente Rojo', 'Auditorio'];
const GLOBAL_ZONE = 'Recomendaciones Globales';

export default function GuiaPage() {
  const supabase = createClient();

  type View = 'home' | 'category' | 'zone_detail' | 'urgencias';
  const [view, setView] = useState<View>('home');  const [activeCatMeta, setActiveCatMeta] = useState<typeof GLOBAL_CATEGORIES[0] | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeCatObj, setActiveCatObj] = useState<any>(null);
  const [activeZone, setActiveZone] = useState<string>('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pois, setPois] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [musicUrl, setMusicUrl] = useState('');
  const [appMusicEnabled, setAppMusicEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [catsRes, poisRes, emsRes, settingsRes] = await Promise.all([
      supabase.from('guide_categories').select('*'),
      supabase.from('guide_pois').select('*').order('created_at', { ascending: false }),
      supabase.from('emergency_numbers').select('*').order('created_at', { ascending: true }),
      supabase.from('global_settings').select('*').limit(1).maybeSingle(),
    ]);
    if (catsRes.data) setCategories(catsRes.data);
    if (poisRes.data) setPois(poisRes.data);
    if (emsRes.data) setEmergencies(emsRes.data);
    if (settingsRes.data) {
      setMusicUrl(settingsRes.data.music_url || '');
      setAppMusicEnabled(settingsRes.data.app_music_enabled ?? true);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const init = async () => { await fetchAll(); };
    void init();
    const channel = supabase
      .channel('guide_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guide_pois' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guide_categories' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_numbers' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'global_settings' }, () => {
        supabase.from('global_settings').select('*').limit(1).maybeSingle().then(({ data }) => {
          if (data) { setMusicUrl(data.music_url || ''); setAppMusicEnabled(data.app_music_enabled ?? true); }
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAll, supabase]);

  const getCatPoisByName = (catName: string) => {
    const cat = categories.find(c => c.name === catName && c.zone === GLOBAL_ZONE);
    return cat ? pois.filter(p => p.category_id === cat.id) : [];
  };
  const getZonePois = (zoneName: string) => {
    const zoneCats = categories.filter(c => c.zone === zoneName);
    return pois.filter(p => zoneCats.some(c => c.id === p.category_id));
  };

  const goBack = () => {
    if (view === 'home') window.location.href = 'https://budharooms.com';
    else { setView('home'); window.scrollTo(0, 0); }
  };

  const openCategory = (meta: typeof GLOBAL_CATEGORIES[0]) => {
    const catObj = categories.find(c => c.name === meta.name && c.zone === GLOBAL_ZONE);
    setActiveCatMeta(meta);
    setActiveCatObj(catObj ?? null);
    setView('category');
    window.scrollTo(0, 0);
  };

  return (
    <main className="bg-background text-on-surface font-body min-h-screen pb-28 relative overflow-x-hidden">
      {/* Subtle logo watermark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] max-w-2xl -z-10 opacity-[0.025] pointer-events-none grayscale" src="/logo_stitch.png" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5">
        <div className="flex justify-between items-center px-5 h-16 max-w-2xl mx-auto">
          <button onClick={goBack} className="w-10 h-10 flex items-center justify-center rounded-full text-[#d2b86b] hover:bg-white/5 active:scale-90 transition-all">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="font-headline text-sm font-black uppercase tracking-[0.12em] text-transparent bg-clip-text bg-linear-to-r from-[#d2b86b] via-white to-[#d2b86b]">
            BUDHA ROOMS
          </span>
          <div className="w-10 h-10 rounded-full border border-[#d2b86b]/30 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Logo" className="w-full h-full object-cover" src="/logo_stitch.png" />
          </div>
        </div>
      </header>

      {/* ═══════════ HOME ═══════════ */}
      {view === 'home' && (
        <div className="pt-24 px-4 max-w-2xl mx-auto">

          {/* Emergency Banner */}
          <button onClick={() => { setView('urgencias'); window.scrollTo(0, 0); }}
            className="w-full mb-8 relative overflow-hidden bg-linear-to-r from-red-950/80 to-red-900/50 rounded-2xl border border-red-500/20 p-4 flex items-center justify-between active:scale-[0.98] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-red-400 text-xl">emergency</span>
              </div>
              <div className="text-left">
                <p className="text-red-300 font-black text-xs uppercase tracking-[0.2em]">Emergencias</p>
                <p className="text-red-400/70 text-[10px] mt-0.5">Números de contacto inmediato</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-red-400/50">chevron_right</span>
          </button>

          {/* Hero */}
          <div className="mb-10">
            <h1 className="font-headline text-5xl font-black tracking-tight text-white leading-[0.95] mb-3">
              GUÍA DE<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#d2b86b] to-[#f0d891]">HUÉSPEDES</span>
            </h1>
            <p className="text-gray-500 text-sm tracking-[0.15em] uppercase font-semibold">Alicante · Budha Rooms</p>
          </div>

          {/* ── 7 Categories ── */}
          <div className="mb-2">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4">Lo mejor de Alicante</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[1,2,3,4,5,6,7].map(i => <div key={i} className={`h-28 bg-[#1c1c1c] rounded-2xl animate-pulse ${i === 7 ? 'col-span-2' : ''}`} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-10">
              {GLOBAL_CATEGORIES.map((cat, i) => {
                const count = getCatPoisByName(cat.name).length;
                const isLast = i === GLOBAL_CATEGORIES.length - 1;
                return (
                  <button
                    key={cat.name}
                    onClick={() => openCategory(cat)}
                    className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-linear-to-br ${cat.gradient} border border-white/5 text-left overflow-hidden active:scale-[0.97] transition-all duration-200 ${isLast ? 'col-span-2 flex-row items-center gap-4' : 'min-h-[110px]'}`}
                    style={{ boxShadow: `0 0 0 0px ${cat.accent}` }}
                  >
                    {/* Glow on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ boxShadow: `inset 0 0 30px ${cat.accent}20` }} />

                    <span className={`text-3xl leading-none ${isLast ? '' : 'mb-2'}`}>{cat.emoji}</span>
                    <div className={isLast ? 'flex-1' : ''}>
                      <p className="font-headline font-black text-white text-sm leading-tight uppercase tracking-wide group-hover:text-white transition-colors">
                        {cat.name}
                      </p>
                      <p className="text-[10px] mt-1 font-semibold" style={{ color: `${cat.accent}99` }}>
                        {count === 0 ? 'Próximamente' : `${count} ${count === 1 ? 'lugar' : 'lugares'}`}
                      </p>
                    </div>
                    {isLast && (
                      <span className="material-symbols-outlined text-gray-600 group-hover:text-gray-400 transition-colors">chevron_right</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Zones ── */}
          <div className="mb-2">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4">Por Zona</p>
          </div>
          <div className="space-y-2 mb-8">
            {ZONE_NAMES.map(zone => {
              const count = getZonePois(zone).length;
              return (
                <button
                  key={zone}
                  onClick={() => { setActiveZone(zone); setView('zone_detail'); window.scrollTo(0, 0); }}
                  className="group w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-[#141414] border border-white/5 hover:border-[#d2b86b]/20 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#d2b86b]/50 text-lg">📍</span>
                    <span className="font-bold text-white text-sm group-hover:text-[#d2b86b] transition-colors uppercase tracking-wide">{zone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-gray-600">{count} lugares</span>
                    <span className="material-symbols-outlined text-gray-700 text-sm">chevron_right</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════ CATEGORY VIEW ═══════════ */}
      {view === 'category' && activeCatMeta && (
        <div className="pt-20 max-w-2xl mx-auto animate-in slide-in-from-right duration-300">
          {/* Category Hero Banner */}
          <div className={`relative mx-4 mt-4 mb-6 p-6 rounded-2xl bg-linear-to-br ${activeCatMeta.gradient} border border-white/5 overflow-hidden`}>
            <div className="absolute right-4 top-4 text-6xl opacity-20">{activeCatMeta.emoji}</div>
            <span className="text-4xl">{activeCatMeta.emoji}</span>
            <h2 className="font-headline text-2xl font-black text-white uppercase tracking-wide mt-2 leading-tight">{activeCatMeta.name}</h2>
            <p className="text-[10px] font-bold mt-1 uppercase tracking-[0.2em]" style={{ color: `${activeCatMeta.accent}99` }}>
              Recomendaciones Globales
            </p>
          </div>

          <div className="px-4">
            {(() => {
              const catPois = activeCatObj ? pois.filter(p => p.category_id === activeCatObj.id) : [];
              return catPois.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-5xl">{activeCatMeta.emoji}</span>
                  <p className="text-gray-500 mt-4 text-sm">Pronto habrá recomendaciones aquí.</p>
                </div>
              ) : (
                <div className="space-y-4 pb-8">
                  {catPois.map((poi, idx) => (
                    <div key={idx} className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-all">
                      {poi.image_url && (
                        <div className="relative w-full h-48 overflow-hidden bg-[#0a0a0a]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={poi.image_url} alt={poi.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-linear-to-t from-[#141414] via-transparent to-transparent" />
                          {poi.price && (
                            <span className="absolute bottom-3 right-3 font-bold text-xs px-3 py-1 rounded-full text-black" style={{ background: activeCatMeta.accent }}>{poi.price}</span>
                          )}
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-headline text-lg font-bold text-white mb-1">{poi.name}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-4">{poi.description}</p>
                        {poi.maps_link && (
                          <a href={poi.maps_link} target="_blank" rel="noreferrer"
                            className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs tracking-widest uppercase text-black transition-all active:scale-[0.97]"
                            style={{ background: activeCatMeta.accent }}>
                            <span className="material-symbols-outlined text-sm">map</span> Ver en Mapa
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ═══════════ ZONE DETAIL ═══════════ */}
      {view === 'zone_detail' && (
        <div className="pt-20 max-w-2xl mx-auto animate-in slide-in-from-right duration-300">
          <div className="relative mx-4 mt-4 mb-6 p-6 rounded-2xl bg-linear-to-br from-[#1a1a1a] to-black border border-white/5 overflow-hidden">
            <div className="absolute right-4 top-4 text-6xl opacity-10">📍</div>
            <span className="text-4xl">📍</span>
            <h2 className="font-headline text-2xl font-black text-white uppercase tracking-wide mt-2">{activeZone}</h2>
            <p className="text-[10px] font-bold mt-1 text-[#d2b86b]/60 uppercase tracking-[0.2em]">Zona Local · Alicante</p>
          </div>
          <div className="px-4">
            {(() => {
              const zonePois = getZonePois(activeZone);
              return zonePois.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-5xl">📍</span>
                  <p className="text-gray-500 mt-4 text-sm">Pronto habrá recomendaciones para esta zona.</p>
                </div>
              ) : (
                <div className="space-y-4 pb-8">
                  {zonePois.map((poi, idx) => (
                    <div key={idx} className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-all">
                      {poi.image_url && (
                        <div className="relative w-full h-48 overflow-hidden bg-[#0a0a0a]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={poi.image_url} alt={poi.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-linear-to-t from-[#141414] via-transparent to-transparent" />
                          {poi.price && (
                            <span className="absolute bottom-3 right-3 bg-[#d2b86b] text-black font-bold text-xs px-3 py-1 rounded-full">{poi.price}</span>
                          )}
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-headline text-lg font-bold text-white mb-1">{poi.name}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-4">{poi.description}</p>
                        {poi.maps_link && (
                          <a href={poi.maps_link} target="_blank" rel="noreferrer"
                            className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#d2b86b] font-bold text-xs tracking-widest uppercase text-black active:scale-[0.97] transition-all">
                            <span className="material-symbols-outlined text-sm">map</span> Ver en Mapa
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ═══════════ URGENCIAS ═══════════ */}
      {view === 'urgencias' && (
        <div className="pt-20 px-4 max-w-2xl mx-auto animate-in slide-in-from-bottom duration-300">
          <div className="relative mt-4 mb-8 p-6 rounded-2xl bg-linear-to-br from-red-950/80 to-black border border-red-500/10 overflow-hidden">
            <div className="absolute right-4 top-4 text-6xl opacity-10">🚨</div>
            <span className="text-4xl">🚨</span>
            <h2 className="font-headline text-2xl font-black text-red-300 uppercase tracking-wide mt-2">Emergencias</h2>
            <p className="text-[10px] font-bold mt-1 text-red-500/60 uppercase tracking-[0.2em]">Contacto inmediato · 24h</p>
          </div>
          <div className="space-y-3">
            {emergencies.length === 0 ? (
              <p className="text-gray-500 italic text-center py-16 text-sm">Sin números de emergencia configurados.</p>
            ) : emergencies.map((item, idx) => (
              <a key={idx} href={`tel:${item.phone}`}
                className="flex items-center justify-between p-4 bg-[#141414] rounded-2xl border border-white/5 active:border-red-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-red-950/50 text-red-400 flex items-center justify-center border border-red-500/20">
                    <span className="material-symbols-outlined text-xl">{item.icon || 'phone'}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    {item.note && <p className="text-xs text-gray-500">{item.note}</p>}
                  </div>
                </div>
                <span className="text-[#d2b86b] font-mono font-bold text-sm">{item.phone}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-black/80 backdrop-blur-2xl border-t border-white/5 z-50">
        <div className="flex justify-around items-center py-3 pb-7 max-w-2xl mx-auto px-8">
          <button onClick={() => { setView('home'); window.scrollTo(0, 0); }}
            className={`flex flex-col items-center gap-0.5 transition-colors ${view !== 'urgencias' ? 'text-[#d2b86b]' : 'text-gray-600 hover:text-gray-400'}`}>
            <span className="material-symbols-outlined text-2xl">explore</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">Explorar</span>
          </button>
          <button onClick={() => { setView('urgencias'); window.scrollTo(0, 0); }}
            className={`flex flex-col items-center gap-0.5 transition-colors ${view === 'urgencias' ? 'text-red-400' : 'text-gray-600 hover:text-red-400'}`}>
            <span className="material-symbols-outlined text-2xl">emergency</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">Urgencias</span>
          </button>
        </div>
      </nav>

      {/* Audio */}
      {appMusicEnabled && musicUrl && <AudioPlayer url={musicUrl} enabled={true} />}
    </main>
  );
}
