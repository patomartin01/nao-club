'use client';

import React, { useState } from 'react';
import { RouteProposal, ActivityPost } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Bookmark, Plus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SaveToListModalProps {
  route: RouteProposal | ActivityPost | { id: string; title: string; [key: string]: any } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SaveToListModal: React.FC<SaveToListModalProps> = ({
  route,
  isOpen,
  onClose
}) => {
  const { 
    routeLists, 
    addRouteToList, 
    removeRouteFromList, 
    createRouteList,
    toggleSavedRoute,
    savedRouteIds,
    saveActivityAsRoute
  } = useApp();

  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen || !route) return null;

  const handleToggleList = (listId: string, isIncluded: boolean) => {
    if (isIncluded) {
      removeRouteFromList(listId, route.id);
    } else {
      addRouteToList(listId, route.id);
      if (!savedRouteIds.includes(route.id)) {
        toggleSavedRoute(route.id);
      }
      if ('distanceKm' in route && 'coordinates' in route) {
        saveActivityAsRoute(route as ActivityPost);
      }
      confetti({ particleCount: 20, spread: 40 });
    }
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    createRouteList(newListName.trim());
    setNewListName('');
    setIsCreating(false);
    confetti({ particleCount: 30, spread: 60 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1918]/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        className="bg-[#FAF6ED] border-2 border-[#1A1918] w-full max-w-md text-[#1A1918] p-6 sm:p-7 shadow-[8px_8px_0px_#1A1918] relative font-sans space-y-5 my-auto max-h-[94vh] overflow-y-auto rounded-[28px] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#E6332A]" />
            <span className="text-[10px] uppercase font-mono font-black tracking-widest text-[#E6332A]">
              ★ ORGANIZAR EN LISTAS ★
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#FAF6ED] border-2 border-[#1A1918] text-[#1A1918] hover:bg-[#E6332A] hover:text-white flex items-center justify-center transition shadow-[2px_2px_0px_#1A1918]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h4 className="font-display font-black text-lg text-[#1A1918] uppercase tracking-wide line-clamp-1">
            {route.title}
          </h4>
          <p className="text-xs text-[#1A1918]/70 mt-1 font-serif italic">
            Selecciona en qué colecciones deseas archivar esta ruta:
          </p>
        </div>

        {/* Existing Lists */}
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {routeLists.map(list => {
            const isIncluded = list.routeIds.includes(route.id);
            return (
              <div 
                key={list.id}
                onClick={() => handleToggleList(list.id, isIncluded)}
                className={`p-3.5 border-2 border-[#1A1918] rounded-xl flex items-center justify-between cursor-pointer transition shadow-[2px_2px_0px_#1A1918] ${
                  isIncluded 
                    ? 'bg-[#F4EEDB]' 
                    : 'bg-[#FAF6ED] hover:bg-[#F4EEDB]'
                }`}
              >
                <div>
                  <p className="font-display font-black text-xs uppercase text-[#1A1918]">{list.name}</p>
                  <p className="text-[10px] text-[#1A1918]/60 font-mono font-bold">{list.routeIds.length} rutas en esta lista</p>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 border-[#1A1918] flex items-center justify-center shadow-[1px_1px_0px_#1A1918] ${
                  isIncluded ? 'bg-[#E6332A] text-white' : 'bg-[#FAF6ED]'
                }`}>
                  {isIncluded && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New List Form */}
        {isCreating ? (
          <form onSubmit={handleCreateList} className="space-y-3 pt-2 border-t-2 border-[#1A1918]">
            <input 
              type="text"
              placeholder="Ej. Rutas Huasteca Potosina"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] px-3.5 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none focus:border-[#E6332A] rounded-xl shadow-[2px_2px_0px_#1A1918] font-bold"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#E6332A] hover:bg-[#d02c24] text-white font-display font-black text-xs uppercase tracking-wider rounded-xl transition border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                Guardar Lista
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2.5 bg-[#FAF6ED] border-2 border-[#1A1918] text-[#1A1918] hover:bg-[#F4EEDB] text-xs uppercase font-display font-black rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-3 border-2 border-[#1A1918] bg-[#F4EEDB] hover:bg-[#EDE6D3] text-[#1A1918] text-xs uppercase font-display font-black tracking-wider transition flex items-center justify-center gap-2 rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Plus className="w-3.5 h-3.5 text-[#E6332A] stroke-[3]" />
            <span>Crear Nueva Colección</span>
          </button>
        )}

        <div className="pt-2 border-t-2 border-[#1A1918] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] font-display font-black text-xs uppercase tracking-widest transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shadow-[3px_3px_0px_#1A1918] border-2 border-[#1A1918] rounded-xl"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
