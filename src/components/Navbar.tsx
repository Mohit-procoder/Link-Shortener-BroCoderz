'use client';

import { useState } from 'react';
import { store } from '@/lib/store';
import {
  Activity,
  Zap,
  Shield,
  Layers,
  Upload,
  Plus,
  PlayCircle,
  Users,
  ChevronDown,
  Bell,
  CheckCheck
} from 'lucide-react';

interface NavbarProps {
  onOpenCreate: () => void;
  onOpenBulk: () => void;
  onOpenSimulator: () => void;
  onToggleScenarios: () => void;
  showScenarios: boolean;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
}

export function Navbar({
  onOpenCreate,
  onOpenBulk,
  onOpenSimulator,
  onToggleScenarios,
  showScenarios,
  unreadAlertsCount,
  onOpenAlerts,
}: NavbarProps) {
  const state = store.getState();
  const [showTeamPopover, setShowTeamPopover] = useState(false);
  const user = state.currentUser;

  const toggleRole = () => {
    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    store.setUserRole(nextRole);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-[#07090e]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <Activity className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                  Link<span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">Pulse</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono tracking-tight hidden sm:block">
                every link, a living signal
              </p>
            </div>

            {/* Brocoderz / GEHU Team Badge */}
            <div className="relative ml-2 hidden md:block">
              <button
                onClick={() => setShowTeamPopover(!showTeamPopover)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-900/80 border border-gray-800 hover:border-gray-700 text-xs text-gray-300 transition-colors"
                title="View Brocoderz Presentation Team"
              >
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                <span className="font-semibold text-gray-200">Brocoderz</span>
                <span className="text-[10px] text-gray-400">· GEHU</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {showTeamPopover && (
                <div className="absolute left-0 mt-2 w-72 p-4 bg-[#0d131f] border border-gray-700 rounded-2xl shadow-2xl z-50 text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <div>
                      <p className="font-bold text-white">Graphic Era Hill University</p>
                      <p className="text-[10px] text-indigo-400 font-mono">Team Brocoderz · Tech Geeks</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-gray-300">
                    <div className="flex justify-between items-center text-emerald-400 font-medium">
                      <span>Mohit Dubey</span>
                      <span className="text-[10px] text-gray-400">Frontend · UI/UX</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Raj Rai</span>
                      <span className="text-[10px] text-gray-400">Backend</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Vageesh Raj</span>
                      <span className="text-[10px] text-gray-400">Data & Analytics</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Shivanshu Mishra</span>
                      <span className="text-[10px] text-gray-400">DevOps · Testing</span>
                    </div>
                    <div className="flex justify-between items-center text-pink-400 font-medium pt-1 border-t border-gray-800">
                      <span>Sanchay Naresh Gupta</span>
                      <span className="text-[10px] text-gray-400">Team Leader</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics & Badges */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900/60 border border-gray-800 font-mono text-gray-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Hot-Path:</span>
              <span className="text-emerald-400 font-semibold">&lt; 20ms</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900/60 border border-gray-800 font-mono text-gray-300">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Shield:</span>
              <span className="text-indigo-300 font-semibold">5-Hop Active</span>
            </div>
          </div>

          {/* Actions & Role Switcher */}
          <div className="flex items-center gap-2">
            {/* Scenarios Walkthrough Trigger */}
            <button
              onClick={onToggleScenarios}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showScenarios
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/20'
                  : 'bg-gray-900/90 border-gray-800 text-gray-300 hover:border-gray-700'
              }`}
            >
              <PlayCircle className="w-4 h-4 text-pink-400" />
              <span className="hidden sm:inline">Demo Scenarios</span>
            </button>

            {/* Redirect Simulator Button */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-900/90 border border-gray-800 hover:border-gray-700 text-gray-300 transition-all"
              title="Test 7-step redirect engine with custom device / bot UA"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Simulator</span>
            </button>

            {/* Bulk CSV Import */}
            <button
              onClick={onOpenBulk}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-900/90 border border-gray-800 hover:border-gray-700 text-gray-300 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Bulk CSV</span>
            </button>

            {/* New Link Creation Wizard */}
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Link</span>
            </button>

            {/* Alerts Bell */}
            <button
              onClick={onOpenAlerts}
              className="relative p-2 rounded-xl bg-gray-900/90 border border-gray-800 hover:border-gray-700 text-gray-300 transition-colors"
              title="Pulse Alerts & Anomalies"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center animate-bounce">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Role Switcher (User vs Admin for 1-Second Kill Switch) */}
            <button
              onClick={toggleRole}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium border transition-colors ${
                user.role === 'ADMIN'
                  ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                  : 'bg-gray-900 border-gray-800 text-gray-400'
              }`}
              title="Switch role to test Admin 1-Second Kill-Switch"
            >
              <span className={`w-2 h-2 rounded-full ${user.role === 'ADMIN' ? 'bg-rose-400 animate-pulse' : 'bg-gray-400'}`}></span>
              <span>{user.role}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
