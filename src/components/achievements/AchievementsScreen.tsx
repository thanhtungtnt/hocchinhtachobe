import React from 'react';
import { Award, Star, Flame, Lock, CheckCircle2 } from 'lucide-react';
import { BADGES } from '../../data/badges';
import { UserProfile } from '../../types';
import { Mascot } from '../common/Mascot';

interface AchievementsScreenProps {
  profile: UserProfile;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ profile }) => {
  const unlockedIds = new Set(profile.unlockedBadges);
  const unlockedCount = unlockedIds.size;

  return (
    <div id="achievements-screen" className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-amber-400 via-amber-500 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs font-kid font-bold text-xs mb-2">
            <Award className="w-4 h-4" /> BẢNG VINH DANH TRẠNG NGUYÊN NHÍ
          </div>
          <h1 className="font-kid font-extrabold text-2xl sm:text-3xl mb-2">
            Huy hiệu của {profile.name}! 🏆
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 max-w-md">
            Mỗi bài kiểm tra chính tả con hoàn thành sẽ mang lại điểm kinh nghiệm và những huy hiệu danh giá!
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-kid font-extrabold">{unlockedCount} / {BADGES.length}</div>
            <div className="text-[11px] font-semibold text-amber-100">Huy hiệu</div>
          </div>
          <div className="w-px h-10 bg-white/30" />
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-kid font-extrabold flex items-center justify-center gap-1">
              <span>{profile.xp}</span>
            </div>
            <div className="text-[11px] font-semibold text-amber-100">Điểm XP</div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {BADGES.map((b) => {
          const isUnlocked = unlockedIds.has(b.id);

          return (
            <div
              key={b.id}
              id={`badge-card-${b.id}`}
              className={`p-5 rounded-3xl border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-white border-amber-300 shadow-md hover:shadow-lg'
                  : 'bg-slate-50 border-slate-200 opacity-75'
              }`}
            >
              {/* Badge Icon & Status */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xs ${
                      isUnlocked ? 'bg-amber-100 border border-amber-200' : 'bg-slate-200 grayscale'
                    }`}
                  >
                    {b.icon}
                  </div>

                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã đạt
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                      <Lock className="w-3.5 h-3.5 text-slate-500" /> Chưa mở
                    </span>
                  )}
                </div>

                <h3 className="font-kid font-bold text-base text-slate-800 mb-1">
                  {b.name}
                </h3>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  {b.description}
                </p>
              </div>

              {/* Requirement pill */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Mục tiêu:</span>
                <span className="font-bold text-amber-800">{b.requirement}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
