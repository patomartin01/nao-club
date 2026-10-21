'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { RodadaDetailView } from '../components/Rodadas/RodadaDetailView';
import { RouteExplorerView } from '../components/Routes/RouteExplorerView';
import { CrewView } from '../components/Crews/CrewView';
import { GarageView } from '../components/Garage/GarageView';
import { BrandShowcaseView } from '../components/Brand/BrandShowcaseView';
import { ProposeRouteModal } from '../components/Modals/ProposeRouteModal';
import { JoinCrewModal } from '../components/Modals/JoinCrewModal';
import { CreateCrewModal } from '../components/Modals/CreateCrewModal';
import { CreateRodadaModal } from '../components/Modals/CreateRodadaModal';

export default function Home() {
  const { activeNavTab } = useApp();

  // Modal states
  const [proposeRouteOpen, setProposeRouteOpen] = useState(false);
  const [joinCrewOpen, setJoinCrewOpen] = useState(false);
  const [createCrewOpen, setCreateCrewOpen] = useState(false);
  const [createRodadaOpen, setCreateRodadaOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#06090D] flex flex-col">
      {/* Navigation Bar */}
      <Navbar
        onOpenCreateRodada={() => setCreateRodadaOpen(true)}
        onOpenProposeRoute={() => setProposeRouteOpen(true)}
        onOpenJoinCrew={() => setJoinCrewOpen(true)}
        onOpenCreateCrew={() => setCreateCrewOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeNavTab === 'rodada' && (
          <RodadaDetailView 
            onOpenProposeRoute={() => setProposeRouteOpen(true)} 
          />
        )}

        {activeNavTab === 'rutas' && (
          <RouteExplorerView 
            onOpenProposeRoute={() => setProposeRouteOpen(true)} 
          />
        )}

        {activeNavTab === 'crew' && (
          <CrewView 
            onOpenCreateCrew={() => setCreateCrewOpen(true)}
            onOpenJoinCrew={() => setJoinCrewOpen(true)}
          />
        )}

        {activeNavTab === 'garaje' && (
          <GarageView />
        )}

        {activeNavTab === 'brand' && (
          <BrandShowcaseView />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/[0.06] bg-[#060709] py-8 text-center text-xs text-white/40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
          <p>
            <strong className="text-white tracking-widest">N A O</strong> — Navana Expeditions // Hospitalidad & Brechas Off-Road
          </p>
          <p className="text-white/30">
            Amanalco · Valle de Bravo · Interlomas
          </p>
        </div>
      </footer>

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
    </div>
  );
}
