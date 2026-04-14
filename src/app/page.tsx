"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import Link from 'next/link';

import { createClient } from '../utils/supabase/client';

const emergencyData = [
  { name: 'Policía Local Alicante', phone: '965107200', icon: 'local_police', note: '' },
  { name: 'Bomberos Alicante', phone: '965982222', icon: 'fire_truck', note: '' },
  { name: 'Ambulancias (Sanidad)', phone: '965933000', icon: 'ambulance', note: '' },
  { name: 'Ambulancias (Alternativa)', phone: '965169400', icon: 'ecg_heart', note: '' },
  { name: 'Violencia Machista', phone: '965105086', icon: 'health_and_safety', note: '' },
  { name: 'Trata de Personas', phone: '900105090', icon: 'policy', note: '' },
  { name: 'Emergencia General', phone: '112', icon: 'emergency', note: '' },
  { name: 'Radio Taxi Alicante', phone: '965252511', icon: 'local_taxi', note: 'Recomendamos usar la App Pidetaxi' },
  { name: 'Soporte Budha Rooms', phone: '698947098', icon: 'support_agent', note: '' }
];

export default function GuiaPage() {
  const supabase = createClient();
  const [activeView, setActiveView] = useState<'home' | 'list' | 'urgencias'>('home');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pois, setPois] = useState<any[]>([]);

  React.useEffect(() => {
    supabase.from('guide_pois').select('*').then((response) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any[] | null = response.data;
      if (data) setPois(data);
    });
  }, [supabase]);

  const categoryPois = activeCategory ? pois.filter(p => p.category === activeCategory) : [];
  return (
    <main className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary relative overflow-x-hidden min-h-screen pb-24">
      {/* Buddha Background Watermark */}
      <img 
        alt="Fondo Buddha" 
        className="buddha-watermark object-contain fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] max-w-xl -z-10 opacity-[0.03] pointer-events-none filter grayscale brightness-150 contrast-125 saturate-0" 
        src="/logo_stitch.png"
      />

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#131313]/70 backdrop-blur-xl shadow-[0_20px_50px_rgba(229,226,225,0.05)]">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <a href="https://budharooms.com" className="text-primary active:scale-95 duration-200">
              <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
            </a>
          </div>
          <div className="font-headline uppercase tracking-[0.05em] text-sm md:text-xl font-black md:tracking-widest text-transparent bg-clip-text bg-linear-to-br from-primary to-primary-container">
            BUDHA ROOMS
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full border border-primary/30 overflow-hidden">
              <img 
                alt="Perfil Conserje" 
                className="w-full h-full object-cover scale-110" 
                src="/logo_stitch.png"
              />
            </div>
          </div>
        </div>
      </header>

      {activeView === 'home' && (
      <div className="pt-24 px-6 max-w-7xl mx-auto relative z-10 w-full animate-in fade-in duration-500">
        {/* Emergency Call Banner */}
        <div className="mb-8 w-full">
          <button onClick={() => { setActiveView('urgencias'); window.scrollTo(0, 0); }} className="w-full bg-[#d83b3b]/10 border border-[#d83b3b]/50 shadow-[0_0_20px_rgba(216,59,59,0.2)] py-4 rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all relative overflow-hidden animate-pulse hover:bg-[#d83b3b]/20">
            <span className="material-symbols-outlined text-[#d83b3b] animate-bounce" data-icon="phone">phone</span>
            <span className="text-[#d83b3b] font-black tracking-[0.15em] text-xs uppercase drop-shadow-[0_0_5px_rgba(216,59,59,0.8)]">Números de Emergencia</span>
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#d83b3b]/20 to-transparent -translate-x-[150%] animate-[shimmer_2s_infinite]"></div>
          </button>
        </div>

        {/* Hero Section */}
        <section className="mb-12 relative overflow-hidden rounded-xl h-[450px] flex flex-col justify-end p-8 shadow-2xl border border-primary/10">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Logo Budha Rooms Central" 
              className="w-full h-full object-contain p-12 opacity-30 drop-shadow-[0_0_30px_rgba(212,175,55,0.4)] absolute top-0 mix-blend-screen scale-110 hover:scale-125 transition-all duration-1000" 
              src="/logo_stitch.png"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent"></div>
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          <div className="relative z-10 text-center md:text-left">
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tight mb-4 text-on-surface flex flex-col items-center justify-center md:flex-row md:justify-start">
              Explora
              <span style={{ fontSize: '3rem', letterSpacing: '-0.025em' }}>&nbsp;</span>
              <span className="text-primary italic" spellCheck="false" style={{ fontSize: '3rem', letterSpacing: '-0.025em' }}>Alicante</span>
            </h1>
            <p className="font-body text-on-surface-variant max-w-lg mx-auto md:mx-0 text-lg leading-relaxed uppercase tracking-widest text-[11px] font-bold">
              Guía de Recomendaciones
            </p>
          </div>
        </section>

        {/* Bento Grid Categories */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          
          {/* Restaurants - Large */}
          <div onClick={() => { setActiveCategory('Restaurantes'); setActiveView('list'); window.scrollTo(0, 0); }} className="col-span-2 group relative overflow-hidden rounded-xl bg-surface-container-low min-h-[200px] border border-white/5 cursor-pointer">
            <img 
              alt="Restaurantes" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-50" 
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000"
            />
            <div className="absolute inset-0 bg-linear-to-br from-background/80 via-transparent to-transparent"></div>
            <div className="relative p-6 h-full flex flex-col justify-between">
              <span className="material-symbols-outlined text-primary text-2xl">restaurant</span>
              <div>
                <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-on-surface group-hover:text-primary transition-colors">RESTAURANTES</h3>
                <p className="text-[10px] text-on-surface-variant font-bold tracking-widest">ALGUNAS RECOMENDACIONES</p>
              </div>
            </div>
          </div>

          {/* Beaches */}
          <div onClick={() => { setActiveCategory('Playas'); setActiveView('list'); window.scrollTo(0, 0); }} className="col-span-2 group relative overflow-hidden rounded-xl bg-surface-container-low min-h-[200px] border border-white/5 cursor-pointer">
            <img 
              alt="Playas" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-50" 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000"
            />
            <div className="absolute inset-0 bg-linear-to-br from-background/80 via-transparent to-transparent"></div>
            <div className="relative p-6 h-full flex flex-col justify-between">
              <span className="material-symbols-outlined text-primary text-2xl">beach_access</span>
              <div>
                <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-on-surface group-hover:text-primary transition-colors">PLAYAS</h3>
                <p className="text-[10px] text-on-surface-variant font-bold tracking-widest">LAS MEJORES DE ALICANTE</p>
              </div>
            </div>
          </div>

          {/* Historical Monuments */}
          <div onClick={() => { setActiveCategory('Monumentos'); setActiveView('list'); window.scrollTo(0, 0); }} className="col-span-2 group relative overflow-hidden rounded-xl bg-surface-container-low min-h-[200px] border border-white/5 cursor-pointer">
            <img 
              alt="Monumentos" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40" 
              src="https://images.unsplash.com/photo-1489425993498-a690cb61c597?auto=format&fit=crop&q=80&w=1000"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent"></div>
            <div className="relative p-6 h-full flex flex-col justify-between">
              <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
              <div>
                <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-on-surface group-hover:text-primary transition-colors">MONUMENTOS</h3>
                <p className="text-[10px] text-on-surface-variant font-bold tracking-widest">LUGARES HISTÓRICOS</p>
              </div>
            </div>
          </div>

          {/* Nightlife - Wide */}
          <div onClick={() => { setActiveCategory('Ocio Nocturno'); setActiveView('list'); window.scrollTo(0, 0); }} className="col-span-2 md:col-span-4 lg:col-span-5 group relative overflow-hidden rounded-xl bg-surface-container-high h-48 border border-primary/5 cursor-pointer">
            <img 
              alt="Ocio Nocturno" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-30" 
              src="https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1000"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/90 to-transparent"></div>
            <div className="relative p-8 h-full flex items-center justify-between">
              <div className="z-10">
                <span className="material-symbols-outlined text-primary text-3xl mb-2">nightlife</span>
                <h3 className="font-headline font-bold text-2xl uppercase tracking-widest text-on-surface group-hover:text-primary transition-colors">OCIO NOCTURNO</h3>
                <p className="text-xs text-on-surface-variant font-medium">LOS MEJORES SITIOS</p>
              </div>
              <div className="w-32 h-32 rounded-full border border-outline-variant/20 flex items-center justify-center relative">
                <div className="absolute inset-0 gold-gradient opacity-10 rounded-full blur-xl group-hover:opacity-30 transition-all"></div>
                <span className="material-symbols-outlined text-primary text-5xl animate-pulse">local_bar</span>
              </div>
            </div>
          </div>



          {/* Popular Areas - Wide */}
          <div onClick={() => { setActiveCategory('Zonas Populares'); setActiveView('list'); window.scrollTo(0, 0); }} className="col-span-2 md:col-span-6 lg:col-span-6 group relative overflow-hidden rounded-xl bg-surface-container-low h-48 border border-white/5 cursor-pointer">
            <img 
              alt="Áreas Populares" 
              className="absolute inset-0 w-full h-full object-cover opacity-30 transform group-hover:scale-105 transition-transform duration-700" 
              src="https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&q=80&w=1000"
            />
            <div className="absolute inset-0 bg-linear-to-r from-background to-transparent"></div>
            <div className="relative p-8 h-full flex flex-col justify-center">
              <span className="material-symbols-outlined text-primary text-3xl mb-2">map</span>
              <h3 className="font-headline font-bold text-xl uppercase tracking-widest text-on-surface group-hover:text-primary transition-colors">ZONAS POPULARES</h3>
              <p className="text-[10px] text-on-surface-variant font-bold">DESCUBRE LAS ZONAS CONCURRIDAS</p>
            </div>
          </div>

        </section>

      </div>
      )}


      {activeView === 'urgencias' && (
        <div className="pt-24 px-6 max-w-3xl mx-auto relative z-10 w-full animate-in slide-in-from-bottom-8 fade-in duration-300 min-h-[70vh]">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setActiveView('home')} className="w-10 h-10 shrink-0 rounded-full bg-surface-container-high flex items-center justify-center text-primary border border-primary/20 hover:bg-primary/10 transition-all active:scale-95">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-widest text-[#d83b3b]">EMERGENCIAS</h1>
              <span className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase">TELÉFONOS DIRECTOS VERIFICADOS</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            {emergencyData.map((item, idx) => (
              <div key={idx} className="group flex flex-col sm:flex-row items-center justify-between p-5 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-[#d83b3b]/50 transition-all duration-300 gap-4">
                <div className="flex items-center gap-5 w-full">
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-lg bg-surface-container-high border border-primary/10 group-hover:border-[#d83b3b]/30 transition-colors">
                    <span className="material-symbols-outlined text-primary group-hover:text-[#d83b3b] text-2xl transition-colors">{item.icon}</span>
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-body font-bold text-on-surface text-base md:text-lg tracking-wide uppercase">{item.name}</h4>
                    {item.note && <p className="text-[9px] text-[#d83b3b] font-bold tracking-widest mt-1 uppercase">{item.note}</p>}
                  </div>
                </div>
                <a href={`tel:${item.phone}`} className="flex shrink-0 items-center justify-center gap-2 bg-linear-to-br from-primary to-primary-container text-[#131313] px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest w-full sm:w-max shadow-[0_0_15px_rgba(242,202,80,0.2)] active:scale-95 transition-all hover:brightness-110">
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  Llamar
                </a>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Global Category List View */}
      {activeView === 'list' && activeCategory && (
        <div className="pt-24 px-6 max-w-7xl mx-auto relative z-10 w-full animate-in slide-in-from-right-4 fade-in duration-300 min-h-[70vh]">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setActiveView('home')} className="w-10 h-10 shrink-0 rounded-full bg-surface-container-high flex items-center justify-center text-primary border border-primary/20 hover:bg-primary/10 transition-all active:scale-95">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="font-headline text-2xl md:text-3xl font-black uppercase text-on-surface tracking-widest leading-tight">{activeCategory}</h1>
              <span className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase">EXPLORAR CATEGORÍA</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            {categoryPois.length === 0 && <p className="text-on-surface-variant text-center my-8">Aún no hay recomendaciones en esta categoría.</p>}
            {categoryPois.map((item, idx) => (
               <div key={idx} className="flex gap-4 p-4 rounded-xl bg-surface-container-low border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden">
                {item.description && item.description.includes('Sitio Recomendado') && (
                  <div className="absolute top-0 right-0 bg-primary text-[#131313] px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-widest z-10">
                    Recomendado
                  </div>
                )}
                <div className="w-24 h-24 shrink-0 overflow-hidden rounded-lg bg-surface-container-high border border-white/5">
                  <img src={item.thumb} alt={item.name} className="w-full h-full object-cover brightness-75 group-hover:scale-110 transition-all duration-500" />
                </div>
                <div className="flex flex-col justify-between flex-1 py-1 relative z-10">
                  <div>
                    <h3 className="font-headline font-bold text-on-surface uppercase text-sm md:text-base tracking-widest leading-tight">{item.name}</h3>
                    <p className="text-[10px] md:text-xs text-on-surface-variant font-bold tracking-widest mt-1 uppercase max-h-8 overflow-hidden text-ellipsis">{item.description}</p>
                  </div>
                  <a href={item.mapLink} target="_blank" rel="noreferrer" className="mt-3 bg-linear-to-br from-primary to-primary-container text-[#131313] px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max shadow-[0_0_15px_rgba(242,202,80,0.2)] active:scale-95 transition-all hover:brightness-110">
                    <span className="material-symbols-outlined text-[14px]">map</span>
                    Ir con Google Maps
                  </a>
                </div>
              </div>
            ))}

          </div>
        </div>
      )}

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-4 pb-8 bg-[#1c1b1b]/90 backdrop-blur-3xl z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/5">
        <Link href="/" className="flex flex-col items-center justify-center bg-linear-to-br from-primary to-primary-container text-[#131313] rounded-xl px-5 py-2 scale-95 hover:scale-105 duration-300 ease-out shadow-[0_0_20px_rgba(242,202,80,0.3)]">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>home</span>
          <span className="font-body text-[10px] font-black uppercase tracking-wider mt-1">INICIO</span>
        </Link>
        <Link href="#explorar" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-primary hover:-translate-y-1 transition-all">
          <span className="material-symbols-outlined">explore</span>
          <span className="font-body text-[10px] font-bold uppercase tracking-wider mt-1">EXPLORAR</span>
        </Link>
        <button onClick={() => { setActiveView('urgencias'); window.scrollTo(0, 0); }} className={`flex flex-col items-center justify-center px-4 py-2 hover:-translate-y-1 transition-all animate-pulse ${activeView === 'urgencias' ? 'text-[#d83b3b] drop-shadow-[0_0_8px_rgba(216,59,59,0.8)]' : 'text-[#d83b3b]'}`}>
          <span className="material-symbols-outlined">phone</span>
          <span className="font-body text-[10px] font-bold uppercase tracking-wider mt-1 drop-shadow-[0_0_5px_rgba(216,59,59,0.8)]">URGENCIAS</span>
        </button>
      </nav>
    </main>
  );
}
