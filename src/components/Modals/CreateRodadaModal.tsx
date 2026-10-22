'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import { StepByStepRodadaModal } from '../Tribus/StepByStepRodadaModal';

interface CreateRodadaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRodadaModal: React.FC<CreateRodadaModalProps> = ({ isOpen, onClose }) => {
  const { createRodada, proposeRoute, setActiveNavTab, currentUser, rodadas } = useApp();
  const activeRodada = rodadas[0] || null;

  const formatHumanDate = (start: string, end?: string, includeYear?: boolean) => {
    if (!start) return 'Fecha por definir';
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const pStart = start.split('-');
    if (pStart.length < 3) return start;
    const mIdx = parseInt(pStart[1], 10) - 1;
    const startDay = parseInt(pStart[2], 10);
    const yr = includeYear ? ` ${pStart[0]}` : '';

    if (end && end !== start) {
      const pEnd = end.split('-');
      if (pEnd.length === 3) {
        const endDay = parseInt(pEnd[2], 10);
        return `${startDay} - ${endDay} ${months[mIdx]}${yr}`;
      }
    }
    return `${startDay} ${months[mIdx]}${yr}`;
  };

  const handleConvokeSubmit = (data: any) => {
    const newRodada = createRodada({
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      category: data.category,
      startDate: data.startDate,
      endDate: data.endDate,
      originPoint: data.originPoint
    });

    if (data.proposal && newRodada) {
      proposeRoute({ ...data.proposal, rodadaId: newRodada.id });
    }

    confetti({ particleCount: 70 });
    setActiveNavTab('tribus');
    onClose();
  };

  return (
    <StepByStepRodadaModal
      isOpen={isOpen}
      mode="convoke"
      activeRodada={activeRodada}
      currentUser={currentUser}
      onClose={onClose}
      onSubmitConvoke={handleConvokeSubmit}
      formatHumanDate={formatHumanDate}
    />
  );
};
