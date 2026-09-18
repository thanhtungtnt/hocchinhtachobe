import React from 'react';
import { Play, BookOpen, Target, Award, Users, Flame, Star, Sparkles, ArrowRight } from 'lucide-react';
import { SpellingExercise, UserProfile, WeakWordRecord } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import { Mascot } from '../common/Mascot';

interface HomeScreenProps {
  profile: UserProfile;
  weakWords: WeakWordRecord[];
  onStartPractice: () => void;
  onNavigate: (screen: string) => void;
  onSelectExercise: (exercise: SpellingExercise) => void;
  recommendedExercise: SpellingExercise;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  weakWords,
  onStartPractice,
  onNavigate,
  onSelectExercise,
  recommendedExercise,
}) => {
  return (
    <div id="home-screen" className="max-w-5xl mx-auto px-4 py-6 sm:py-8 text-slate-800">
      {/* Hero Section */}
      <div className="bg-linear-to-br from-amber-300 via-amber-400 to-orange-400 rounded-3xl p-6 sm:p-9 shadow-xl border-4 border-amber-200 text-slate-900 mb-8 relative overflow-hidden">
        {/* Soft background circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/20 blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-orange-300/30 blur-lg pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/30 backdrop-blur-xs text-amber-950 font-kid font-bold text-xs sm:text-sm mb-3 shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-900" />
              <span>ỨNG DỤNG LUYỆN VIẾT CHÍNH TẢ TIỂU HỌC</span>
            </div>

            <h1 className="font-kid font-extrabold text-3xl sm:text-5xl text-amber-950 tracking-tight leading-tight mb-2">
              Bé Vui Học Chính Tả
            </h1>

            <p className="text-base sm:text-lg font-bold text-amber-900/90 mb-6">
              Chào <span className="underline decoration-wavy decoration-orange-600">{profile.name}</span>! Hôm nay con đã sẵn sàng nghe thật kỹ và viết thật hay chưa nào?
            </p>

            {/* Giant Start Practice Button */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                id="hero-start-practice-btn"
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onStartPractice();
                }}
                className="px-8 py-4 sm:px-10 sm:py-4.5 rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-kid font-extrabold text-lg sm:text-xl shadow-lg hover:shadow-xl transition-all transform active:scale-95 cursor-pointer flex items-center gap-3 ring-4 ring-white/40"
              >
                <Play className="w-6 h-6 fill-white" />
                <span>BẮT ĐẦU LUYỆN TẬP</span>
              </button>

              <button
                id="hero-library-btn"
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onNavigate('library');
                }}
                className="px-5 py-3.5 rounded-2xl bg-white/80 hover:bg-white text-slate-800 font-kid font-bold text-sm sm:text-base transition-colors shadow-xs"
              >
                <span>Kho bài ({profile.grade > 0 ? `Lớp ${profile.grade}` : 'Tất cả'})</span>
              </button>
            </div>
          </div>

          {/* Interactive Mascot with Speech Bubble */}
          <div className="flex flex-col items-center shrink-0">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-md border-2 border-amber-200 text-xs font-kid font-bold text-amber-900 mb-2 relative animate-bounce">
              Lắng nghe kỹ từng âm nhé! ✏️
              <div className="w-3 h-3 bg-white border-r-2 border-b-2 border-amber-200 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
            </div>
            <Mascot mood="idle" size="lg" />
          </div>
        </div>
      </div>

      {/* Recommended Exercise for Active Grade */}
      {recommendedExercise && (
        <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-white border-2 border-blue-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl shrink-0">
              {recommendedExercise.icon || '⭐'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Gợi ý hôm nay • Lớp {recommendedExercise.grade}
                </span>
                <span className="text-xs text-slate-500 font-semibold">#{recommendedExercise.topic}</span>
              </div>
              <h3 className="font-kid font-bold text-base sm:text-lg text-slate-800">
                {recommendedExercise.title} ({recommendedExercise.sentences.length} câu)
              </h3>
            </div>
          </div>

          <button
            id="start-recommended-btn"
            type="button"
            onClick={() => {
              soundEffects.playClick();
              onSelectExercise(recommendedExercise);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-kid font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Luyện ngay bài này</span>
          </button>
        </div>
      )}

      {/* Navigation Feature Cards (Section 2 & 13) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Kho bài */}
        <div
          id="home-card-library"
          onClick={() => {
            soundEffects.playClick();
            onNavigate('library');
          }}
          className="p-5 rounded-3xl bg-white border-2 border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
              📚
            </div>
            <h3 className="font-kid font-bold text-lg text-slate-800 mb-1">
              Kho Bài Tập
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hơn 15 bài kiểm tra chuẩn hóa Lớp 1 - Lớp 5 theo nhiều chủ đề sinh động.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-blue-600 gap-1">
            <span>Khám phá ngay</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Luyện từ sai */}
        <div
          id="home-card-weak-words"
          onClick={() => {
            soundEffects.playClick();
            onNavigate('weak-words');
          }}
          className="p-5 rounded-3xl bg-white border-2 border-slate-200 hover:border-rose-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform relative">
              🎯
              {weakWords.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                  {weakWords.length}
                </span>
              )}
            </div>
            <h3 className="font-kid font-bold text-lg text-slate-800 mb-1">
              Luyện Từ Sai
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Rèn lại các từ con từng gõ nhầm (s/x, tr/ch, dấu hỏi/ngã) để không mắc lỗi lại.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-rose-600 gap-1">
            <span>{weakWords.length > 0 ? `${weakWords.length} từ cần nhớ` : 'Xem danh sách'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Thành tích */}
        <div
          id="home-card-achievements"
          onClick={() => {
            soundEffects.playClick();
            onNavigate('achievements');
          }}
          className="p-5 rounded-3xl bg-white border-2 border-slate-200 hover:border-amber-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
              🏆
            </div>
            <h3 className="font-kid font-bold text-lg text-slate-800 mb-1">
              Huy Hiệu &amp; Thưởng
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mở khóa các danh hiệu như &quot;Vua chính tả&quot;, &quot;Đôi tai thỏ&quot; và tích lũy điểm XP.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-amber-600 gap-1">
            <span>Bảng vinh danh</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Góc phụ huynh */}
        <div
          id="home-card-parent"
          onClick={() => {
            soundEffects.playClick();
            onNavigate('parent');
          }}
          className="p-5 rounded-3xl bg-white border-2 border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
              👨‍🏫
            </div>
            <h3 className="font-kid font-bold text-lg text-slate-800 mb-1">
              Phụ Huynh &amp; AI
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Báo cáo lỗi ngữ âm, phân tích AI và công cụ soạn bài riêng cho học sinh.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-purple-600 gap-1">
            <span>Xem báo cáo</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Progress & Quick Stats */}
      <div className="bg-slate-50 rounded-3xl p-5 sm:p-6 border border-slate-200">
        <h3 className="font-kid font-bold text-base text-slate-800 mb-4 flex items-center gap-2">
          <span>📊 Quá trình rèn luyện của {profile.name}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-white rounded-2xl border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold mb-0.5">Số bài hoàn thành</div>
            <div className="font-kid font-extrabold text-xl text-blue-600">{profile.totalExercises} bài</div>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold mb-0.5">Điểm cao nhất</div>
            <div className="font-kid font-extrabold text-xl text-amber-500">{profile.highestScore} ⭐</div>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold mb-0.5">Chuỗi liên tiếp</div>
            <div className="font-kid font-extrabold text-xl text-orange-500 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 fill-orange-500" />
              <span>{profile.currentStreak} ngày</span>
            </div>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold mb-0.5">Tổng điểm kinh nghiệm</div>
            <div className="font-kid font-extrabold text-xl text-emerald-600 flex items-center justify-center gap-1">
              <Star className="w-5 h-5 fill-emerald-500" />
              <span>{profile.xp} XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
