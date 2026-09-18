import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, RotateCcw, Home, Target, CheckCircle2 } from 'lucide-react';
import { SentenceEvaluation, SpellingExercise, WeakWordRecord } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import { Mascot } from '../common/Mascot';

interface CompletionScreenProps {
  exercise: SpellingExercise;
  evaluations: SentenceEvaluation[];
  totalScore: number;
  onRetryExercise: () => void;
  onGoHome: () => void;
  onPracticeWeakWords: () => void;
  allWeakWords: WeakWordRecord[];
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  exercise,
  evaluations,
  totalScore,
  onRetryExercise,
  onGoHome,
  onPracticeWeakWords,
  allWeakWords,
}) => {
  const totalSentences = evaluations.length || 1;
  const correctSentences = evaluations.filter((e) => e.isFullyCorrect).length;

  let totalWords = 0;
  let correctWords = 0;
  const sessionErrors: Array<{ actual: string; expected: string; count: number }> = [];

  evaluations.forEach((evaluation) => {
    evaluation.tokenDiffs.forEach((t) => {
      if (t.status === 'correct') {
        totalWords += 1;
        correctWords += 1;
      } else if (t.status === 'incorrect' || t.status === 'missing') {
        totalWords += 1;
        if (t.expected) {
          const existing = sessionErrors.find((se) => se.expected.toLowerCase() === t.expected.toLowerCase());
          if (existing) {
            existing.count += 1;
          } else {
            sessionErrors.push({
              actual: t.actual || '(bỏ trống)',
              expected: t.expected,
              count: 1,
            });
          }
        }
      }
    });
  });

  const accuracyPct = Math.round((correctWords / Math.max(1, totalWords)) * 100);

  // Star Rating (Section 11)
  let starsCount = 1;
  let starLabel = 'Cần luyện thêm';
  let bannerMessage = 'Bé cố gắng luyện thêm để đạt kết quả cao hơn nhé!';

  if (accuracyPct >= 90) {
    starsCount = 3;
    starLabel = '⭐⭐⭐ Xuất sắc!';
    bannerMessage = 'Bé viết chính tả quá đỉnh, xứng danh Trạng Nguyên nhí!';
  } else if (accuracyPct >= 70) {
    starsCount = 2;
    starLabel = '⭐⭐ Rất tốt!';
    bannerMessage = 'Bé nghe rất giỏi, chỉ cần chú ý một chút nữa là hoàn hảo!';
  } else if (accuracyPct >= 50) {
    starsCount = 1;
    starLabel = '⭐ Tiến bộ tốt!';
    bannerMessage = 'Bé đã rất nỗ lực hoàn thành bài tập, cùng luyện tập thêm nào!';
  }

  // Trigger confetti burst on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FBBF24', '#F59E0B', '#3B82F6', '#10B981', '#EC4899'],
      });
    } catch {
      // Ignore
    }
  }, []);

  return (
    <div id="exercise-completion-view" className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-2xl border-4 border-amber-300 text-slate-800 text-center relative overflow-hidden">
        {/* Mascot */}
        <Mascot mood="celebrating" size="lg" className="mx-auto mb-3" />

        {/* Title */}
        <div className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-kid font-bold text-xs sm:text-sm mb-2">
          {exercise.icon} {exercise.title}
        </div>
        <h1 className="font-kid font-extrabold text-2xl sm:text-4xl text-slate-900 mb-2">
          🎉 CON ĐÃ HOÀN THÀNH!
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-semibold mb-6">
          {bannerMessage}
        </p>

        {/* Star Rating Display */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`p-3 rounded-2xl transition-all transform ${
                s <= starsCount
                  ? 'bg-amber-100 text-amber-500 scale-110 shadow-xs'
                  : 'bg-slate-100 text-slate-300 opacity-60'
              }`}
            >
              <Star
                className={`w-9 h-9 sm:w-11 sm:h-11 ${
                  s <= starsCount ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </div>
          ))}
        </div>
        <div className="font-kid font-bold text-lg text-amber-900 mb-7">
          {starLabel}
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-8">
          <div className="p-3 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="text-[11px] sm:text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
              ⭐ Tổng điểm
            </div>
            <div className="font-kid font-extrabold text-xl sm:text-3xl text-amber-950">
              {totalScore}
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-blue-50 border border-blue-200">
            <div className="text-[11px] sm:text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">
              📝 Số câu đúng
            </div>
            <div className="font-kid font-extrabold text-xl sm:text-3xl text-blue-950">
              {correctSentences} / {totalSentences}
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="text-[11px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              🎯 Từ viết đúng
            </div>
            <div className="font-kid font-extrabold text-xl sm:text-3xl text-emerald-950">
              {correctWords} / {totalWords}
            </div>
          </div>
        </div>

        {/* Section 12: Những từ con cần luyện thêm table */}
        {sessionErrors.length > 0 ? (
          <div className="mb-8 text-left">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-kid font-bold text-base sm:text-lg text-slate-800 flex items-center gap-2">
                <span>🎯 Những từ con cần luyện thêm</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  {sessionErrors.length} từ
                </span>
              </h3>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-sm border-collapse bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                    <th className="py-3 px-4">Từ con viết</th>
                    <th className="py-3 px-4">Đáp án đúng</th>
                    <th className="py-3 px-4 text-center">Số lần sai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessionErrors.map((err, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-rose-600 line-through">
                        {err.actual}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-emerald-700">
                        {err.expected}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                          {err.count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                id="practice-weak-words-btn"
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onPracticeWeakWords();
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-rose-200 transition-colors cursor-pointer"
              >
                <Target className="w-4 h-4 text-rose-600" />
                <span>🔄 Luyện lại từ sai ngay</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Thật tuyệt vời! Bài này con không mắc một lỗi chính tả nào cả!</span>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            id="retry-exercise-btn"
            type="button"
            onClick={() => {
              soundEffects.playClick();
              onRetryExercise();
            }}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm lại bài này</span>
          </button>

          <button
            id="back-to-home-btn"
            type="button"
            onClick={() => {
              soundEffects.playClick();
              onGoHome();
            }}
            className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-kid font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all transform active:scale-98 cursor-pointer"
          >
            <Home className="w-5 h-5" />
            <span>VỀ TRANG CHỦ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
