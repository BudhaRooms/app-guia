"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { AudioPlayer } from '../components/AudioPlayer';
import { createClient } from '../utils/supabase/client';

export default function GuiaPage() {
  const supabase = createClient();
  const [activeView, setActiveView] = useState<'zones' | 'globals' | 'categories' | 'list' | 'urgencias'>('zones');
  const [activeZone, setActiveZone] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeCategory, setActiveCategory] = useState<any>(null);

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

    // ─── Realtime subscriptions: any change → re-fetch ───
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

  // Unique zones from categories (excluding 'Recomendaciones Globales')
  const GLOBAL_ZONE = 'Recomendaciones Globales';
  const dbZones = Array.from(
    new Set(
      categories
        .filter(c => c.zone && c.zone !== GLOBAL_ZONE)
        .map(c => c.zone as string)
    )
  );

  const globalCategories = categories.filter(c => !c.zone || c.zone === GLOBAL_ZONE);
  const zoneCategories = activeZone ? categories.filter(c => c.zone === activeZone) : [];
  const categoryPois = activeCategory ? pois.filter(p => p.category_id === activeCategory.id) : [];

  const goBack = () => {
    if (activeView === 'list') setActiveView(activeZone ? 'categories' : 'globals');
    else if (activeView === 'categories') setActiveView('zones');
    else if (activeView === 'globals') setActiveView('zones');
    else if (activeView === 'urgencias') setActiveView('zones');
    else window.location.href = 'https://budharooms.com';
  };

  return (
    <main className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary relative overflow-x-hidden min-h-screen pb-24">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Fondo"
        className="buddha-watermark object-contain fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] max-w-xl -z-10 opacity-[0.03] pointer-events-none filter grayscale brightness-150 contrast-125 saturate-0"
        src="/logo_stitch.png"
      />

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#131313]/70 backdrop-blur-xl shadow-[0_20px_50px_rgba(229,226,225,0.05)]">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="text-primary active:scale-95 duration-200">
              <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
            </button>
          </div>
          <div className="font-headline uppercase tracking-[0.05em] text-sm md:text-xl font-black md:tracking-widest text-transparent bg-clip-text bg-linear-to-br from-[#d2b86b] to-white">
            BUDHA ROOMS
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full border border-primary/30 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Perfil" className="w-full h-full object-cover scale-110" src="/logo_stitch.png" />
            </div>
          </div>
        </div>
      </header>

      {/* ─── ZONES VIEW ─── */}
      {activeView === 'zones' && (
        <div className="pt-24 px-6 max-w-7xl mx-auto relative z-10 w-full animate-in fade-in duration-500">

          {/* Emergency Call Banner */}
          <div className="mb-6 w-full">
            <button onClick={() => { setActiveView('urgencias'); window.scrollTo(0, 0); }} className="w-full bg-[#d83b3b]/10 border border-[#d83b3b]/50 shadow-[0_0_20px_rgba(216,59,59,0.2)] py-4 rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all relative overflow-hidden animate-pulse hover:bg-[#d83b3b]/20">
              <span className="material-symbols-outlined text-[#d83b3b] animate-bounce" data-icon="phone">phone</span>
              <span className="text-[#d83b3b] font-black tracking-[0.15em] text-xs uppercase drop-shadow-[0_0_5px_rgba(216,59,59,0.8)]">Números de Emergencia</span>
            </button>
          </div>

          <section className="mb-6 relative overflow-hidden rounded-xl h-[220px] flex flex-col justify-end p-8 shadow-2xl border border-[#d2b86b]/20">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-linear-to-t from-[#131313] via-[#131313]/60 to-transparent"></div>
            </div>
            <div className="relative z-10 text-center md:text-left">
              <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tight mb-2 text-white">Guía de Huéspedes</h1>
              <p className="font-body text-[#d2b86b] text-sm tracking-widest uppercase font-bold">Budha Rooms Alicante</p>
            </div>
          </section>

          {/* Recomendaciones Globales */}
          {globalCategories.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => { setActiveZone(null); setActiveView('globals'); window.scrollTo(0, 0); }}
                className="w-full group relative overflow-hidden rounded-xl bg-linear-to-br from-[#d2b86b]/20 to-[#131313] min-h-[90px] border border-[#d2b86b]/40 cursor-pointer flex items-center justify-between p-6 hover:border-[#d2b86b] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-[#d2b86b] text-3xl">public</span>
                  <div className="text-left">
                    <h3 className="font-headline font-bold text-xl tracking-wider text-white group-hover:text-[#d2b86b] transition-colors">Recomendaciones Globales</h3>
                    <p className="text-xs text-gray-400 mt-1">{globalCategories.length} categorías disponibles</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#d2b86b]/60">chevron_right</span>
              </button>
            </div>
          )}

          {/* Zone buttons */}
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Por Zona</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[#1e1e1e] rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dbZones.map((zone) => (
                <div
                  key={zone}
                  onClick={() => { setActiveZone(zone); setActiveView('categories'); window.scrollTo(0, 0); }}
                  className="group relative overflow-hidden rounded-xl bg-[#1e1e1e] min-h-[80px] border border-white/5 cursor-pointer flex items-center justify-between px-6 hover:border-[#d2b86b]/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#d2b86b]/70 text-2xl">location_on</span>
                    <h3 className="font-headline font-bold text-lg tracking-wider text-white group-hover:text-[#d2b86b] transition-colors">{zone}</h3>
                  </div>
                  <span className="material-symbols-outlined text-gray-600 group-hover:text-[#d2b86b]/60 transition-colors">chevron_right</span>
                </div>
              ))}
              {dbZones.length === 0 && !loading && (
                <p className="text-gray-500 italic col-span-2 text-center py-8">No hay zonas configuradas todavía.</p>
              )}
            </section>
          )}
        </div>
      )}

      {/* ─── GLOBAL RECOMMENDATIONS VIEW ─── */}
      {activeView === 'globals' && (
        <div className="pt-24 px-6 max-w-7xl mx-auto relative z-10 w-full animate-in slide-in-from-right duration-300">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#d2b86b]/10 border border-[#d2b86b]/20 rounded-full text-[#d2b86b] font-bold text-[10px] tracking-widest uppercase mb-3">
              <span className="material-symbols-outlined text-sm">public</span>
              Para toda Alicante
            </span>
            <h2 className="font-headline text-3xl font-black tracking-tight text-white uppercase">Recomendaciones Globales</h2>
          </div>

          {globalCategories.length === 0 ? (
            <p className="text-gray-400 italic mb-10">Todavía sin categorías globales publicadas.</p>
          ) : (
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {globalCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat); setActiveZone(null); setActiveView('list'); window.scrollTo(0, 0); }}
                  className="col-span-2 group relative overflow-hidden rounded-xl bg-[#1e1e1e] min-h-[150px] border border-white/5 cursor-pointer flex flex-col items-center justify-center p-6 text-center hover:border-[#d2b86b] transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-[#d2b86b] text-3xl mb-3">explore</span>
                  <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-white group-hover:text-[#d2b86b] transition-colors">{cat.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{pois.filter(p => p.category_id === cat.id).length} lugares</p>
                </div>
              ))}
            </section>
          )}
        </div>
      )}

      {/* ─── CATEGORIES BY ZONE VIEW ─── */}
      {activeView === 'categories' && activeZone && (
        <div className="pt-24 px-6 max-w-7xl mx-auto relative z-10 w-full animate-in slide-in-from-right duration-300">
          <div className="mb-6">
            <h2 className="font-headline text-3xl font-black tracking-tight text-white uppercase">{activeZone}</h2>
            <p className="font-body text-[#d2b86b] text-sm tracking-widest font-bold">Categorías Disponibles</p>
          </div>

          {zoneCategories.length === 0 ? (
            <p className="text-gray-400 italic mb-10">Todavía no hay categorías añadidas para esta zona.</p>
          ) : (
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {zoneCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat); setActiveView('list'); window.scrollTo(0, 0); }}
                  className="col-span-2 group relative overflow-hidden rounded-xl bg-[#1e1e1e] min-h-[150px] border border-white/5 cursor-pointer flex flex-col items-center justify-center p-6 text-center hover:border-[#d2b86b] transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-[#d2b86b] text-3xl mb-3">explore</span>
                  <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-white group-hover:text-[#d2b86b] transition-colors">{cat.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{pois.filter(p => p.category_id === cat.id).length} lugares</p>
                </div>
              ))}
            </section>
          )}
        </div>
      )}

      {/* ─── POI LIST VIEW ─── */}
      {activeView === 'list' && activeCategory && (
        <div className="pt-24 px-6 max-w-3xl mx-auto relative z-10 w-full animate-in slide-in-from-right duration-300">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#d2b86b]/10 border border-[#d2b86b]/20 rounded-full text-[#d2b86b] font-bold text-[10px] tracking-widest uppercase mb-4">
              <span>{activeZone || 'Global'}</span>
            </div>
            <h2 className="font-headline text-4xl font-black tracking-tight text-white uppercase">{activeCategory.name}</h2>
          </div>

          <section className="space-y-6">
            {categoryPois.length > 0 ? categoryPois.map((poi, idx) => (
              <div key={idx} className="bg-[#1e1e1e] border border-white/5 rounded-2xl overflow-hidden shadow-lg group">
                {poi.thumb && (
                  <div className="w-full h-48 sm:h-64 relative overflow-hidden bg-gray-900 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={poi.thumb} alt={poi.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-linear-to-t from-[#131313]/90 to-transparent"></div>
                    {poi.price && (
                      <div className="absolute bottom-4 right-4 bg-[#d2b86b] text-black font-bold text-xs px-3 py-1 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                        {poi.price}
                      </div>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-headline text-2xl font-bold text-white mb-2">{poi.name}</h3>
                  <p className="font-body text-gray-300 text-sm leading-relaxed mb-6">{poi.description}</p>
                  {poi.mapLink && (
                    <a href={poi.mapLink} target="_blank" rel="noreferrer" className="w-full inline-flex justify-center items-center gap-2 bg-white text-black py-3 px-6 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-gray-200 transition-colors">
                      <span className="material-symbols-outlined" data-icon="map">map</span> Ver en Mapa
                    </a>
                  )}
                </div>
              </div>
            )) : (
              <p className="text-gray-400 italic mb-10">Todavía no hay lugares en esta categoría.</p>
            )}
          </section>
        </div>
      )}

      {/* ─── URGENCIAS VIEW ─── */}
      {activeView === 'urgencias' && (
        <div className="pt-24 px-6 max-w-3xl mx-auto relative z-10 w-full animate-in slide-in-from-bottom duration-300">
          <h2 className="font-headline text-3xl font-black tracking-tight text-[#d83b3b] mb-2">URGENCIAS</h2>
          <p className="text-gray-400 text-sm mb-8">Directorio de contacto inmediato</p>
          <div className="space-y-3">
            {emergencies.length === 0 ? (
              <p className="text-gray-500 italic text-center py-8">No hay números de emergencia configurados.</p>
            ) : emergencies.map((item, idx) => (
              <a key={idx} href={`tel:${item.phone}`} className="flex items-center justify-between p-4 bg-[#1e1e1e] rounded-xl border border-white/5 active:border-[#d83b3b]/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#d83b3b]/10 text-[#d83b3b] flex items-center justify-center">
                    <span className="material-symbols-outlined" data-icon={item.icon}>{item.icon || 'phone'}</span>
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
      <nav className="fixed bottom-0 w-full bg-[#131313]/90 backdrop-blur-xl border-t border-white/5 py-4 pb-8 z-50 flex justify-center gap-8 px-6">
        <button onClick={() => { setActiveView('zones'); window.scrollTo(0, 0); }} className={`flex flex-col items-center gap-1 transition-colors ${activeView !== 'urgencias' ? 'text-[#d2b86b]' : 'text-gray-500 hover:text-[#d2b86b]'}`}>
          <span className="material-symbols-outlined text-2xl" data-icon="explore">explore</span>
          <span className="font-body text-[10px] font-bold uppercase tracking-wider mt-1">EXPLORAR</span>
        </button>
        <button onClick={() => { setActiveView('urgencias'); window.scrollTo(0, 0); }} className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'urgencias' ? 'text-[#d83b3b]' : 'text-gray-500 hover:text-[#d83b3b]'}`}>
          <span className="material-symbols-outlined text-2xl drop-shadow-[0_0_8px_rgba(216,59,59,0.5)]" data-icon="phone">phone</span>
          <span className="font-body text-[10px] font-bold uppercase tracking-wider mt-1 drop-shadow-[0_0_5px_rgba(216,59,59,0.8)]">URGENCIAS</span>
        </button>
      </nav>

      {/* Audio - starts muted, user clicks button to unmute */}
      {appMusicEnabled && musicUrl && (
        <AudioPlayer url={musicUrl} enabled={true} />
      )}
    </main>
  );
}
