'use client';

import React, { useState } from 'react';
import { RouteProposal } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Bookmark, Plus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SaveToListModalProps {
  route: RouteProposal | null;
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
    savedRouteIds
  } = useApp();

  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen || !route) return null;

  const handleToggleList = (listId: string, isIncluded: boolean) => {
    if (isIncluded) {
      removeRouteFromList(listId, route.id);
    } else {
      addRouteToList(listId, route.id);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="bg-[#0D0B0A] border border-white/15 w-full max-w-md text-chalk p-5 sm:p-8 shadow-2xl relative font-mono space-y-5 my-auto max-h-[94vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-earth" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-ash">
              ORGANIZAR EN LISTAS // WIKILOC SYNC
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 border border-white/15 text-ash hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider line-clamp-1">
            {route.title}
          </h4>
          <p className="text-[11px] text-ash mt-0.5">
            Selecciona en qué listas o carpetas deseas guardar esta ruta:
          </p>
        </div>

        {/* Existing Lists */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {routeLists.map(list => {
            const isIncluded = list.routeIds.includes(route.id);
            return (
              <div 
                key={list.id}
                onClick={() => handleToggleList(list.id, isIncluded)}
                className={`p-3 border flex items-center justify-between cursor-pointer transition ${
                  isIncluded 
                    ? 'bg-earth/15 border-earth text-white' 
                    : 'bg-white/[0.02] border-white/10 text-white/70 hover:border-white/30'
                }`}
              >
                <div>
                  <p className="font-bold text-xs uppercase">{list.name}</p>
                  <p className="text-[10px] text-ash">{list.routeIds.length} rutas en esta lista</p>
                </div>
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                  isIncluded ? 'bg-earth border-earth text-white' : 'border-white/30 bg-black/40'
                }`}>
                  {isIncluded && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New List Form */}
        {isCreating ? (
          <form onSubmit={handleCreateList} className="space-y-3 pt-2 border-t border-white/10">
            <input 
              type="text"
              placeholder="Ej. Rutas Huasteca Potosina"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full bg-black/60 border border-white/20 px-3 py-2 text-xs text-white placeholder-ash focus:outline-none focus:border-earth"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-earth hover:bg-earth/80 text-white font-bold text-[10px] uppercase tracking-wider transition"
              >
                Guardar Lista
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-2 bg-white/5 border border-white/15 text-ash hover:text-white text-[10px] uppercase font-bold"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-2.5 border border-dashed border-white/20 hover:border-earth text-ash hover:text-earth text-xs uppercase font-bold tracking-wider transition flex items-center justify-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Nueva Colección</span>
          </button>
        )}

        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white text-obsidian font-bold text-xs uppercase tracking-wider hover:bg-chalk transition"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
