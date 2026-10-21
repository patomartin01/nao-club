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
import { BottomBar } from '../components/Navigation/BottomBar';

export default function Home() {
  const { activeNavTab } = useApp();

  // Modal states
  const [proposeRouteOpen, setProposeRouteOpen] = useState(false);
  const [joinCrewOpen, setJoinCrewOpen] = useState(false);
  const [createCrewOpen, setCreateCrewOpen] = useState(false);
  const [createRodadaOpen, setCreateRodadaOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0A09] text-chalk flex flex-col antialiased selection:bg-earth selection:text-white">
      
      {/* 1. Superficial-Style Navbar */}
      <Navbar
        onOpenCreateRodada={() => setCreateRodadaOpen(true)}
        onOpenProposeRoute={() => setProposeRouteOpen(true)}
        onOpenJoinCrew={() => setJoinCrewOpen(true)}
        onOpenCreateCrew={() => setCreateCrewOpen(true)}
      />

      {/* 2. Main Architectural Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12">
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

      {/* 3. Swiss Architectural Footer */}
      <footer className="border-t border-white/10 bg-[#080706] pt-12 pb-28 sm:pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 font-mono text-xs">
          
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="font-display font-extrabold text-2xl tracking-[0.25em] text-white">
                NAO
              </span>
              <span className="text-[10px] uppercase tracking-widest text-ash">
                // NAVANA EXPEDITIONS
              </span>
            </div>
            <p className="text-ash text-xs max-w-sm leading-relaxed font-light">
              Plataforma de exploración en motos doble propósito, consenso de rutas efímeras y refugios arquitectónicos. Cero clichés ruidosos; tierra, silencio y diseño.
            </p>
          </div>

          <div className="md:col-span-3 space-y-2">
            <span className="text-[10px] text-earth uppercase tracking-widest font-bold block">Destinos Base</span>
            <p className="text-ash">01. Navana Cabins // Amanalco</p>
            <p className="text-ash">02. El Mirador // Valle de Bravo</p>
            <p className="text-ash">03. Mineral del Chico // Diego Mateo</p>
          </div>

          <div className="md:col-span-4 space-y-2 text-right md:text-right">
            <span className="text-[10px] text-earth uppercase tracking-widest font-bold block">Hospitalidad & Comunidad</span>
            <p className="text-white font-bold">navanacabins.com</p>
            <p className="text-ash text-[11px]">Diseñado por y para exploradores dual-sport.</p>
          </div>

        </div>
      </footer>

      {/* 4. Native App Bottom Action Bar (Dock) */}
      <BottomBar 
        onOpenProposeRoute={() => setProposeRouteOpen(true)}
        onOpenJoinCrew={() => setJoinCrewOpen(true)}
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

    </div>
  );
}
