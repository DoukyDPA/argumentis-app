// src/constants/modules.jsx
import React from 'react';
import { PenTool, ShieldCheck, MessageSquare, Mail, Share2, Brain } from 'lucide-react';

export const APP_MODULES = [
  { id: 'discours', label: 'Discours', sub: 'Allocutions officielles', icon: <PenTool size={24} /> },
  { id: 'langage', label: 'Fiches argumentaires', sub: 'Éléments de langage', icon: <ShieldCheck size={24} /> },
  { id: 'argumentaire', label: 'Note de synthèse', sub: 'Aide à la décision factuelle', icon: <MessageSquare size={24} /> },
  { id: 'mail', label: 'Courriel personnel', sub: 'Correspondance ciblée', icon: <Mail size={24} /> },
  { id: 'social', label: 'Réseaux sociaux', sub: 'Storytelling & engagement', icon: <Share2 size={24} /> },
  { id: 'memoriser', label: 'Mémoriser', sub: 'Astuces mnémotechniques', icon: <Brain size={24} /> },
];
