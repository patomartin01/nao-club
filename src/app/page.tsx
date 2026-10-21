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

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono">
            🏍️ <strong className="text-slate-300">MotoMami ADV Club</strong> — Rodadas, Basecamp & Terracería
          </p>
          <p className="text-slate-600">
            Diseñado para pilotos doble propósito • Salidas desde Interlomas, Edomex
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
