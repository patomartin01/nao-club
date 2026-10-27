'use client';

import React, { useState } from 'react';
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
import { BottomBar } from '../components/Navigation/BottomBar';

export default function Home() {
  const { activeNavTab, setActiveNavTab } = useApp();

  // Modal states
  const [proposeRouteOpen, setProposeRouteOpen] = useState(false);
  const [joinCrewOpen, setJoinCrewOpen] = useState(false);
  const [createCrewOpen, setCreateCrewOpen] = useState(false);
  const [createRodadaOpen, setCreateRodadaOpen] = useState(false);
  const [recordRouteOpen, setRecordRouteOpen] = useState(false);

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
          : 'max-w-[1520px] px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24'
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
