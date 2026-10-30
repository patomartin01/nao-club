'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { InicioFeedView } from '../components/Feed/InicioFeedView';
import { RouteExplorerView } from '../components/Routes/RouteExplorerView';
import { TribusView } from '../components/Tribus/TribusView';
import { TuProfileView } from '../components/Profile/TuProfileView';
import { CrewView } from '../components/Crews/CrewView';
import { GarageView } from '../components/Garage/GarageView';
import { HomeView } from '../components/Home/HomeView';
import { ProposeRouteModal } from '../components/Modals/ProposeRouteModal';
import { JoinCrewModal } from '../components/Modals/JoinCrewModal';
import { CreateCrewModal } from '../components/Modals/CreateCrewModal';
import { CreateRodadaModal } from '../components/Modals/CreateRodadaModal';
import { PilotProfileModal } from '../components/Modals/PilotProfileModal';
import { LiveRouteRecorderModal } from '../components/Modals/LiveRouteRecorderModal';
import { AuthModal } from '../components/Modals/AuthModal';
import { WelcomeLoginGate } from '../components/Auth/WelcomeLoginGate';
import { InitialOnboardingModal } from '../components/Auth/InitialOnboardingModal';
import { FounderWelcomeModal } from '../components/Modals/FounderWelcomeModal';
import { BottomBar } from '../components/Navigation/BottomBar';
import { AdminDashboardView } from '../components/Admin/AdminDashboardView';

export default function Home() {
  const { activeNavTab, setActiveNavTab, isAuthenticated, isAuthLoading, openPilotProfileById } = useApp();

  // Modal states
  const [proposeRouteOpen, setProposeRouteOpen] = useState(false);
  const [joinCrewOpen, setJoinCrewOpen] = useState(false);
  const [createCrewOpen, setCreateCrewOpen] = useState(false);
  const [createRodadaOpen, setCreateRodadaOpen] = useState(false);
  const [recordRouteOpen, setRecordRouteOpen] = useState(false);

  // Handle URL profile sharing: ?piloto=@handle or ?piloto=id
  const pilotParamHandledRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pilotParamHandledRef.current) return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pilotParam = urlParams.get('piloto');
      if (pilotParam) {
        pilotParamHandledRef.current = true;
        setTimeout(() => {
          openPilotProfileById(pilotParam);
        }, 400);
      }
    } catch {}
  }, [openPilotProfileById]);

  // If session is still verifying, show clean minimalist loader
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F4EEDB] text-[#1A1918] flex flex-col items-center justify-center p-6 antialiased">
        <div className="w-12 h-12 rounded-2xl bg-[#E6332A] flex items-center justify-center border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] animate-bounce">
          <span className="font-display font-black text-white text-xl">N</span>
        </div>
        <p className="mt-4 font-mono text-xs uppercase font-bold tracking-widest text-[#1A1918]/60">
          CONECTANDO CON EL CLUB...
        </p>
      </div>
    );
  }

  // If pilot is not authenticated, show full-screen Welcome Gate (Instagram style)
  if (!isAuthenticated) {
    return <WelcomeLoginGate />;
  }

  return (
    <div className="min-h-screen bg-[#F4EEDB] text-[#1A1918] flex flex-col antialiased selection:bg-[#E6332A] selection:text-white">
      
      {/* 1. Deus Ex Machina Editorial Masthead Navbar */}
      <Navbar
        onOpenCreateRodada={() => setCreateRodadaOpen(true)}
        onOpenProposeRoute={() => setProposeRouteOpen(true)}
        onOpenJoinCrew={() => setJoinCrewOpen(true)}
        onOpenCreateCrew={() => setCreateCrewOpen(true)}
        onOpenRecordRoute={() => setRecordRouteOpen(true)}
      />

      {/* 2. Main Architectural Container */}
      <main className={`flex-1 w-full mx-auto ${
        (activeNavTab === 'mapas' || activeNavTab === 'rutas')
          ? 'p-0 max-w-none h-[calc(100dvh-60px)] overflow-hidden relative'
          : 'max-w-[1520px] px-2.5 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-24'
      }`}>
        {/* TAB 01: INICIO (DESPACHO TÁCTICO Y OPERACIONES) */}
        {(activeNavTab === 'inicio' || activeNavTab === 'home') && (
          <InicioFeedView
            onOpenRecordRoute={() => setRecordRouteOpen(true)}
            onOpenCreateRodada={() => setCreateRodadaOpen(true)}
            onOpenProposeRoute={() => setProposeRouteOpen(true)}
          />
        )}

        {/* TAB 02: MAPAS (EXPLORADOR CARTOGRÁFICO DE RUTAS) */}
        {(activeNavTab === 'mapas' || activeNavTab === 'rutas') && (
          <RouteExplorerView 
            onOpenProposeRoute={() => setProposeRouteOpen(true)} 
            onOpenRecordRoute={() => setRecordRouteOpen(true)}
          />
        )}

        {/* TAB 03: TRIBUS (FLOTILLAS, PRÓXIMA RODADA EN CHIQUITO Y SISTEMA DE VOTACIÓN ESTRELLA) */}
        {(activeNavTab === 'tribus' || activeNavTab === 'grupos' || activeNavTab === 'rodada' || activeNavTab === 'crew') && (
          <TribusView
            onOpenCreateCrew={() => setCreateCrewOpen(true)}
            onOpenJoinCrew={() => setJoinCrewOpen(true)}
            onOpenCreateRodada={() => setCreateRodadaOpen(true)}
            onOpenProposeRoute={() => setProposeRouteOpen(true)}
            onOpenRecordRoute={() => setRecordRouteOpen(true)}
          />
        )}

        {/* TAB 04: TÚ (PERFIL DE PILOTO: PROGRESO, HISTORIAL, GALERÍA, MÁS) */}
        {activeNavTab === 'tu' && (
          <TuProfileView
            onOpenGarage={() => setActiveNavTab('garaje')}
          />
        )}

        {/* HANGAR / GARAJE TÉCNICO */}
        {activeNavTab === 'garaje' && (
          <GarageView />
        )}

        {/* ADMIN DASHBOARD (CONTROL DE USABILIDAD Y USUARIOS) */}
        {activeNavTab === 'admin' && (
          <AdminDashboardView />
        )}
      </main>

      {/* Native App Bottom Action Bar (Dock) */}
      <BottomBar 
        onOpenRecordRoute={() => setRecordRouteOpen(true)}
      />

      {/* Modals */}
      <ProposeRouteModal 
        isOpen={proposeRouteOpen} 
        onClose={() => setProposeRouteOpen(false)} 
        onOpenRecordRoute={() => setRecordRouteOpen(true)}
      />

      <JoinCrewModal 
        isOpen={joinCrewOpen} 
        onClose={() => setJoinCrewOpen(false)} 
      />

      <CreateCrewModal 
        isOpen={createCrewOpen} 
        onClose={() => setCreateCrewOpen(false)} 
      />

      <CreateRodadaModal 
        isOpen={createRodadaOpen} 
        onClose={() => setCreateRodadaOpen(false)} 
      />

      <PilotProfileModal />

      <AuthModal />
      <InitialOnboardingModal />
      <FounderWelcomeModal />

      <LiveRouteRecorderModal 
        isOpen={recordRouteOpen || activeNavTab === 'registrar'} 
        onClose={() => {
          setRecordRouteOpen(false);
          if (activeNavTab === 'registrar') setActiveNavTab('inicio');
        }} 
      />

    </div>
  );
}
