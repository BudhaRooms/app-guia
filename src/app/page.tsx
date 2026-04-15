"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { AudioPlayer } from '../components/AudioPlayer';
import { createClient } from '../utils/supabase/client';

const GLOBAL_CATEGORIES = ['Restaurantes', 'Playas', 'Centros Comerciales', 'Ocio Nocturno', 'Zonas Concurridas', 'Monumentos', 'Culturales'];
const ZONE_NAMES = ['Mercado Central', 'Corte Inglés', 'Plaza de Toros', 'Puente Rojo', 'Auditorio'];
const GLOBAL_ZONE = 'Recomendaciones Globales';

const CAT_ICONS: Record<string, string> = {
  'Restaurantes': '🍽️',
  'Playas': '🏖️',
  'Centros Comerciales': '🛍️',
  'Ocio Nocturno': '🎶',
  'Zonas Concurridas': '🚶',
  'Monumentos': '🏛️',
  'Culturales': '🎭',
};

const CAT_GRADIENT: Record<string, string> = {
  'Restaurantes': 'from-orange-900/40 to-[#131313]',
  'Playas': 'from-blue-900/40 to-[#131313]',
  'Centros Comerciales': 'from-purple-900/40 to-[#131313]',
  'Ocio Nocturno': 'from-pink-900/40 to-[#131313]',
  'Zonas Concurridas': 'from-green-900/40 to-[#131313]',
  'Monumentos': 'from-yellow-900/40 to-[#131313]',
  'Culturales': 'from-red-900/40 to-[#131313]',
};

export default function GuiaPage() {
  const supabase = createClient();

  type View = 'home' | 'category' | 'zone_list' | 'zone_detail' | 'urgencias';

  const [view, setView] = useState<View>('home');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeCategory, setActiveCategory] = useState<any>(null);
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
      supabase.from('guide_categories').select('*').order('created_at', { ascending: true }),
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
    void (async () => { await fetchAll(); })();

    const channel = supabase
      .channel('guide_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guide_pois' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guide_categories' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_numbers' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'global_settings' }, () => {
        supabase.from('global_settings').select('*').limit(1).maybeSingle().then(({ data }) => {
          if (data) {
            setMusicUrl(data.music_url || '');
            setAppMusicEnabled(data.app_music_enabled ?? true);
          }
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAll, supabase]);

  // Derived data
  const getCategoryObject = (catName: string) =>
    categories.find(c => c.name === catName && c.zone === GLOBAL_ZONE);

  const getCatPois = (catName: string) => {
    const cat = getCategoryObject(catName);
    return cat ? pois.filter(p => p.category_id === cat.id) : [];
  };

  const getZonePois = (zoneName: string) => {
    const zoneCats = categories.filter(c => c.zone === zoneName);
    return pois.filter(p => zoneCats.some(c => c.id === p.category_id));
  };

  const goBack = () => {
    if (view === 'category') setView('home');
    else if (view === 'zone_detail') setView('zone_list');
    else if (view === 'zone_list') setView('home');
    else if (view === 'urgencias') setView('home');
    else window.location.href = 'https://budharooms.com';
  };

  return (
    <main className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary relative overflow-x-hidden min-h-screen pb-24">
      {/* Buddha watermark bg */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] max-w-xl -z-10 opacity-[0.03] pointer-events-none filter grayscale"
        src="/logo_stitch.png"
      />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#131313]/70 backdrop-blur-xl">
        <div className="flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
          <button onClick={goBack} className="text-primary active:scale-95 duration-200 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="font-headline uppercase tracking-[0.05em] text-sm font-black text-transparent bg-clip-text bg-linear-to-br from-[#d2b86b] to-white">
            BUDHA ROOMS
          </div>
          <div className="w-10 h-10 rounded-full border border-primary/30 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Logo" className="w-full h-full object-cover scale-110" src="/logo_stitch.png" />
          </div>
        </div>
      </header>

      {/* ─── HOME VIEW: 7 Categories + Zones link ─── */}
      {view === 'home' && (
        <div className="pt-24 pb-4 px-5 max-w-2xl mx-auto animate-in fade-in duration-500">

          {/* Emergency Banner */}
          <button
            onClick={() => { setView('urgencias'); window.scrollTo(0, 0); }}
            className="w-full mb-6 bg-[#d83b3b]/10 border border-[#d83b3b]/50 py-3.5 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[#d83b3b] text-xl">phone</span>
            <span className="text-[#d83b3b] font-black tracking-[0.15em] text-xs uppercase">Números de Emergencia</span>
          </button>

          {/* Hero */}
          <div className="mb-8">
            <h1 className="font-headline text-4xl font-black tracking-tight text-white leading-none mb-1">Guía de<br />Huéspedes</h1>
            <p className="text-[#d2b86b] text-xs tracking-widest uppercase font-bold">Budha Rooms Alicante</p>
          </div>

          {/* 7 Global Categories Grid */}
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Recomendaciones</h2>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[1,2,3,4].map(i => <div key={i} className="h-28 bg-[#1e1e1e] rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-8">
              {GLOBAL_CATEGORIES.map((catName) => {
                const count = getCatPois(catName).length;
                const cat = getCategoryObject(catName);
                return (
                  <button
                    key={catName}
                    onClick={() => {
                      setActiveCategory(cat);
                      setView('category');
                      window.scrollTo(0, 0);
                    }}
                    className={`group relative flex flex-col justify-between p-4 rounded-2xl bg-linear-to-br ${CAT_GRADIENT[catName]} border border-white/5 hover:border-[#d2b86b]/30 transition-all duration-300 text-left min-h-[100px] overflow-hidden`}
                  >
                    <span className="text-3xl leading-none">{CAT_ICONS[catName]}</span>
                    <div>
                      <p className="font-headline font-bold text-white text-sm leading-tight group-hover:text-[#d2b86b] transition-colors">{catName}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{count} {count === 1 ? 'lugar' : 'lugares'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Zones Section */}
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Por Zona</h2>
          <div className="grid grid-cols-1 gap-3">
            {ZONE_NAMES.map(zone => {
              const count = getZonePois(zone).length;
              return (
                <button
                  key={zone}
                  onClick={() => { setActiveZone(zone); setView('zone_detail'); window.scrollTo(0, 0); }}
                  className="group flex items-center justify-between px-5 py-4 rounded-2xl bg-[#1e1e1e] border border-white/5 hover:border-[#d2b86b]/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#d2b86b]/70 text-xl">📍</span>
                    <span className="font-semibold text-white group-hover:text-[#d2b86b] transition-colors">{zone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{count} lugares</span>
                    <span className="material-symbols-outlined text-gray-600 text-sm group-hover:text-[#d2b86b]/60">chevron_right</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── CATEGORY POI LIST ─── */}
      {view === 'category' && (
        <div className="pt-24 pb-8 px-5 max-w-2xl mx-auto animate-in slide-in-from-right duration-300">
          <div className="mb-8">
            <div className="text-4xl mb-3">{CAT_ICONS[activeCategory?.name] || '📍'}</div>
            <h2 className="font-headline text-3xl font-black tracking-tight text-white uppercase leading-tight">{activeCategory?.name}</h2>
            <p className="text-[#d2b86b] text-xs tracking-widest uppercase font-bold mt-1">Recomendaciones Globales</p>
          </div>

          {(() => {
            const catPois = activeCategory ? pois.filter(p => p.category_id === activeCategory.id) : [];
            return catPois.length === 0 ? (
              <p className="text-gray-500 italic text-center py-16">Pronto habrá recomendaciones aquí.</p>
            ) : (
              <div className="space-y-5">
                {catPois.map((poi, idx) => (
                  <div key={idx} className="bg-[#1e1e1e] border border-white/5 rounded-2xl overflow-hidden group">
                    {poi.thumb && (
                      <div className="relative w-full h-52 overflow-hidden bg-gray-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={poi.thumb} alt={poi.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-linear-to-t from-[#1e1e1e] to-transparent" />
                        {poi.price && (
                          <span className="absolute bottom-3 right-3 bg-[#d2b86b] text-black font-bold text-xs px-3 py-1 rounded-full">{poi.price}</span>
                        )}
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-headline text-xl font-bold text-white mb-2">{poi.name}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-5">{poi.description}</p>
                      {poi.map_link && (
                        <a href={poi.map_link} target="_blank" rel="noreferrer"
                          className="flex items-center justify-center gap-2 bg-white text-black py-3 px-6 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors">
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
      )}

      {/* ─── ZONE DETAIL ─── */}
      {view === 'zone_detail' && (
        <div className="pt-24 pb-8 px-5 max-w-2xl mx-auto animate-in slide-in-from-right duration-300">
          <div className="mb-8">
            <span className="text-4xl mb-3 block">📍</span>
            <h2 className="font-headline text-3xl font-black tracking-tight text-white uppercase leading-tight">{activeZone}</h2>
            <p className="text-[#d2b86b] text-xs tracking-widest uppercase font-bold mt-1">Zona Local</p>
          </div>

          {(() => {
            const zonePois = getZonePois(activeZone);
            return zonePois.length === 0 ? (
              <p className="text-gray-500 italic text-center py-16">Pronto habrá recomendaciones para esta zona.</p>
            ) : (
              <div className="space-y-5">
                {zonePois.map((poi, idx) => (
                  <div key={idx} className="bg-[#1e1e1e] border border-white/5 rounded-2xl overflow-hidden group">
                    {poi.thumb && (
                      <div className="relative w-full h-52 overflow-hidden bg-gray-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={poi.thumb} alt={poi.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-linear-to-t from-[#1e1e1e] to-transparent" />
                        {poi.price && (
                          <span className="absolute bottom-3 right-3 bg-[#d2b86b] text-black font-bold text-xs px-3 py-1 rounded-full">{poi.price}</span>
                        )}
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-headline text-xl font-bold text-white mb-2">{poi.name}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-5">{poi.description}</p>
                      {poi.map_link && (
                        <a href={poi.map_link} target="_blank" rel="noreferrer"
                          className="flex items-center justify-center gap-2 bg-white text-black py-3 px-6 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors">
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
      )}

      {/* ─── URGENCIAS ─── */}
      {view === 'urgencias' && (
        <div className="pt-24 pb-8 px-5 max-w-2xl mx-auto animate-in slide-in-from-bottom duration-300">
          <h2 className="font-headline text-3xl font-black text-[#d83b3b] mb-2 uppercase">Urgencias</h2>
          <p className="text-gray-500 text-sm mb-8">Contacto de emergencia inmediato</p>
          <div className="space-y-3">
            {emergencies.length === 0 ? (
              <p className="text-gray-500 italic text-center py-10">Sin números de emergencia configurados.</p>
            ) : emergencies.map((item, idx) => (
              <a key={idx} href={`tel:${item.phone}`}
                className="flex items-center justify-between p-4 bg-[#1e1e1e] rounded-2xl border border-white/5 active:border-[#d83b3b]/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#d83b3b]/10 text-[#d83b3b] flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">{item.icon || 'phone'}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    {item.note && <p className="text-xs text-gray-400">{item.note}</p>}
                  </div>
                </div>
                <span className="text-[#d2b86b] font-mono text-sm">{item.phone}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-[#131313]/90 backdrop-blur-xl border-t border-white/5 py-4 pb-8 z-50 flex justify-center gap-12 px-6">
        <button
          onClick={() => { setView('home'); window.scrollTo(0, 0); }}
          className={`flex flex-col items-center gap-0.5 transition-colors ${view !== 'urgencias' ? 'text-[#d2b86b]' : 'text-gray-500 hover:text-[#d2b86b]'}`}
        >
          <span className="material-symbols-outlined text-2xl">explore</span>
          <span className="text-[9px] font-bold uppercase tracking-wider">Explorar</span>
        </button>
        <button
          onClick={() => { setView('urgencias'); window.scrollTo(0, 0); }}
          className={`flex flex-col items-center gap-0.5 transition-colors ${view === 'urgencias' ? 'text-[#d83b3b]' : 'text-gray-500 hover:text-[#d83b3b]'}`}
        >
          <span className="material-symbols-outlined text-2xl drop-shadow-[0_0_8px_rgba(216,59,59,0.5)]">phone</span>
          <span className="text-[9px] font-bold uppercase tracking-wider drop-shadow-[0_0_5px_rgba(216,59,59,0.8)]">Urgencias</span>
        </button>
      </nav>

      {/* Audio */}
      {appMusicEnabled && musicUrl && (
        <AudioPlayer url={musicUrl} enabled={true} />
      )}
    </main>
  );
}
