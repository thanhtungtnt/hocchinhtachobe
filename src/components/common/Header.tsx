import React from 'react';
import { Volume2, VolumeX, Settings, Flame, Star, BookOpen, Target, Award, Users } from 'lucide-react';
import { UserProfile } from '../../types';
import { soundEffects } from '../../services/soundEffects';

interface HeaderProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  activeProfile: UserProfile;
  onOpenProfileModal: () => void;
  onOpenAudioSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  activeProfile,
  onOpenProfileModal,
  onOpenAudioSettings,
  soundEnabled,
  onToggleSound,
}) => {
  const avatarEmoji = {
    cat: '🐱',
    bear: '🐻',
    rabbit: '🐰',
    lion: '🦁',
    dog: '🐶',
    penguin: '🐧',
  }[activeProfile.avatar] || '👧';

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div
          id="nav-logo-btn"
          onClick={() => {
            soundEffects.playClick();
            onNavigate('home');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-400 flex items-center justify-center text-2xl shadow-sm transform group-hover:rotate-6 transition-transform">
            🎒
          </div>
          <div>
            <span className="font-kid font-bold text-lg sm:text-xl text-amber-900 tracking-tight block leading-tight">
              Bé Vui Học Chính Tả
            </span>
            <span className="text-[11px] sm:text-xs text-amber-700 font-semibold hidden xs:block">
              Nghe thật kỹ – Viết thật hay!
            </span>
          </div>
        </div>

        {/* Center Nav for tablet & desktop */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60">
          <button
            id="nav-home"
            onClick={() => {
              soundEffects.playClick();
              onNavigate('home');
            }}
            className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
              currentScreen === 'home'
                ? 'bg-white text-amber-900 shadow-xs font-kid'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Trang chủ
          </button>
          <button
            id="nav-library"
            onClick={() => {
              soundEffects.playClick();
              onNavigate('library');
            }}
            className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all ${
              currentScreen === 'library'
                ? 'bg-white text-blue-600 shadow-xs font-kid'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Kho bài
          </button>
          <button
            id="nav-weak-words"
            onClick={() => {
              soundEffects.playClick();
              onNavigate('weak-words');
            }}
            className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all ${
              currentScreen === 'weak-words'
                ? 'bg-white text-rose-600 shadow-xs font-kid'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4" /> Luyện từ sai
          </button>
          <button
            id="nav-achievements"
            onClick={() => {
              soundEffects.playClick();
              onNavigate('achievements');
            }}
            className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all ${
              currentScreen === 'achievements'
                ? 'bg-white text-amber-600 shadow-xs font-kid'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" /> Thành tích
          </button>
          <button
            id="nav-parent"
            onClick={() => {
              soundEffects.playClick();
              onNavigate('parent');
            }}
            className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all ${
              currentScreen === 'parent'
                ? 'bg-white text-purple-700 shadow-xs font-kid'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> Phụ huynh
          </button>
        </nav>

        {/* Right side stats & Profile */}
        <div className="flex items-center gap-2">
          {/* Streak badge */}
          <div
            id="badge-streak-header"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 font-extrabold text-xs"
            title="Chuỗi ngày luyện tập liên tiếp"
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{activeProfile.currentStreak} ngày</span>
          </div>

          {/* XP Stars */}
          <div
            id="badge-xp-header"
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 font-extrabold text-xs"
            title="Điểm kinh nghiệm chính tả"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{activeProfile.xp} XP</span>
          </div>

          {/* Active Profile Chip */}
          <button
            id="profile-switch-btn"
            onClick={() => {
              soundEffects.playClick();
              onOpenProfileModal();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-900 transition-colors"
            title="Đổi hồ sơ bé"
          >
            <span className="text-base">{avatarEmoji}</span>
            <div className="text-left text-xs font-bold leading-tight hidden xs:block">
              <span className="block truncate max-w-[80px]">{activeProfile.name}</span>
              <span className="text-[10px] text-blue-600 font-normal">Lớp {activeProfile.grade}</span>
            </div>
          </button>

          {/* Audio Quick Toggle */}
          <button
            id="audio-quick-toggle-btn"
            onClick={() => {
              soundEffects.playClick();
              onToggleSound();
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
            aria-label="Chuyển đổi âm thanh"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Settings modal button */}
          <button
            id="audio-settings-btn"
            onClick={() => {
              soundEffects.playClick();
              onOpenAudioSettings();
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Cài đặt giọng đọc & tốc độ"
            aria-label="Cài đặt giọng đọc"
          >
            <Settings className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </header>
  );
};
