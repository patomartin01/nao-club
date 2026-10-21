'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { HomeView } from '../components/Home/HomeView';
import { RouteExplorerView } from '../components/Routes/RouteExplorerView';
import { CrewView } from '../components/Crews/CrewView';
import { GarageView } from '../components/Garage/GarageView';
import { ProposeRouteModal } from '../components/Modals/ProposeRouteModal';
import { JoinCrewModal } from '../components/Modals/JoinCrewModal';
import { CreateCrewModal } from '../components/Modals/CreateCrewModal';
import { CreateRodadaModal } from '../components/Modals/CreateRodadaModal';
import { PilotProfileModal } from '../components/Modals/PilotProfileModal';
import { LiveRouteRecorderModal } from '../components/Modals/LiveRouteRecorderModal';
import { BottomBar } from '../components/Navigation/BottomBar';

export default function Home() {
  const { activeNavTab } = useApp();

  // Modal states
  const [proposeRouteOpen, setProposeRouteOpen] = useState(false);
  const [joinCrewOpen, setJoinCrewOpen] = useState(false);
  const [createCrewOpen, setCreateCrewOpen] = useState(false);
  const [createRodadaOpen, setCreateRodadaOpen] = useState(false);
  const [recordRouteOpen, setRecordRouteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0A09] text-chalk flex flex-col antialiased selection:bg-earth selection:text-white">
      
      {/* 1. Superficial-Style Navbar */}
      <Navbar
        onOpenCreateRodada={() => setCreateRodadaOpen(true)}
        onOpenProposeRoute={() => setProposeRouteOpen(true)}
        onOpenJoinCrew={() => setJoinCrewOpen(true)}
        onOpenCreateCrew={() => setCreateCrewOpen(true)}
        onOpenRecordRoute={() => setRecordRouteOpen(true)}
      />

      {/* 2. Main Architectural Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12">
        {activeNavTab === 'home' && (
          <HomeView
            onOpenCreateCrew={() => setCreateCrewOpen(true)}
            onOpenJoinCrew={() => setJoinCrewOpen(true)}
            onOpenCreateRodada={() => setCreateRodadaOpen(true)}
          />
        )}

        {(activeNavTab === 'rodada' || activeNavTab === 'crew') && (
          <CrewView 
            onOpenCreateCrew={() => setCreateCrewOpen(true)}
            onOpenJoinCrew={() => setJoinCrewOpen(true)}
            onOpenCreateRodada={() => setCreateRodadaOpen(true)}
            onOpenProposeRoute={() => setProposeRouteOpen(true)}
            onOpenRecordRoute={() => setRecordRouteOpen(true)}
          />
        )}

        {activeNavTab === 'rutas' && (
          <RouteExplorerView 
            onOpenProposeRoute={() => setProposeRouteOpen(true)} 
            onOpenRecordRoute={() => setRecordRouteOpen(true)}
          />
        )}

        {activeNavTab === 'garaje' && (
          <GarageView />
        )}
      </main>

      {/* 3. Swiss Architectural Footer */}
      <footer className="border-t border-white/10 bg-[#080706] pt-12 pb-28 sm:pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 font-mono text-xs">
          
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="font-display font-extrabold text-2xl tracking-[0.25em] text-white">
                NAO
              </span>
              <span className="text-[10px] uppercase tracking-widest text-ash">
                // MOTO EXPEDITIONS NETWORK
              </span>
            </div>
            <p className="text-ash text-xs max-w-md leading-relaxed font-light">
              Plataforma de exploración comunitaria para rodadas en motos doble propósito y trail. Votación de rutas en consenso, navegación GPX y organización de grupos.
            </p>
          </div>

          <div className="md:col-span-3 space-y-2">
            <span className="text-[10px] text-earth uppercase tracking-widest font-bold block">Destinos de Ruta</span>
            <p className="text-ash">01. Corral de Piedra // Amanalco</p>
            <p className="text-ash">02. Cañón de Bucareli // Querétaro</p>
            <p className="text-ash">03. Los Azufres // Michoacán</p>
          </div>

          <div className="md:col-span-3 space-y-2 md:text-right">
            <span className="text-[10px] text-earth uppercase tracking-widest font-bold block">Red de Pilotos</span>
            <p className="text-white font-bold">NAO CLUB // 2026</p>
            <p className="text-ash text-[11px]">Diseñado para la comunidad off-road.</p>
          </div>

        </div>
      </footer>

      {/* 4. Native App Bottom Action Bar (Dock) */}
      <BottomBar 
        onOpenProposeRoute={() => setProposeRouteOpen(true)}
        onOpenJoinCrew={() => setJoinCrewOpen(true)}
        onOpenCreateRodada={() => setCreateRodadaOpen(true)}
        onOpenRecordRoute={() => setRecordRouteOpen(true)}
      />

      {/* Modals */}
      <ProposeRouteModal 
        isOpen={proposeRouteOpen} 
        onClose={() => setProposeRouteOpen(false)} 
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

      <LiveRouteRecorderModal 
        isOpen={recordRouteOpen} 
        onClose={() => setRecordRouteOpen(false)} 
      />

    </div>
  );
}
