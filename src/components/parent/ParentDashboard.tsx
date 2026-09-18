import React, { useState } from 'react';
import {
  Users,
  Award,
  Flame,
  Calendar,
  Sparkles,
  TrendingUp,
  Brain,
  Play,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ExerciseHistoryRecord, SpellingExercise, UserProfile, WeakWordRecord } from '../../types';
import { aiService, AIAnalysisResult } from '../../services/aiService';
import { soundEffects } from '../../services/soundEffects';

interface ParentDashboardProps {
  profile: UserProfile;
  allProfiles: UserProfile[];
  onSwitchProfile: (id: string) => void;
  weakWords: WeakWordRecord[];
  history: ExerciseHistoryRecord[];
  onStartCustomExercise: (exercise: SpellingExercise) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  profile,
  allProfiles,
  onSwitchProfile,
  weakWords,
  history,
  onStartCustomExercise,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isGeneratingAIExercise, setIsGeneratingAIExercise] = useState(false);
  const [generatedExercise, setGeneratedExercise] = useState<SpellingExercise | null>(null);

  // Compute error statistics
  const errorStats: Record<string, number> = {
    initial_consonant: 0,
    tone_mark: 0,
    vowel_rhyme: 0,
    capitalization: 0,
    other: 0,
  };

  weakWords.forEach((w) => {
    errorStats[w.errorType] = (errorStats[w.errorType] || 0) + w.count;
  });

  const totalErrors = Object.values(errorStats).reduce((a, b) => a + b, 0);

  const errorCategories = [
    {
      id: 'initial_consonant',
      label: 'Phụ âm đầu (s/x, tr/ch, l/n, r/d/gi)',
      count: errorStats.initial_consonant || 0,
      color: 'bg-blue-500',
      tag: 'Phụ âm',
    },
    {
      id: 'tone_mark',
      label: 'Dấu thanh (hỏi ? / ngã ~)',
      count: errorStats.tone_mark || 0,
      color: 'bg-amber-500',
      tag: 'Dấu thanh',
    },
    {
      id: 'vowel_rhyme',
      label: 'Vần & Âm cuối (iêu/iu, an/ang, uôi/ôi)',
      count: errorStats.vowel_rhyme || 0,
      color: 'bg-rose-500',
      tag: 'Vần ghép',
    },
    {
      id: 'capitalization',
      label: 'Chữ hoa đầu câu & tên riêng',
      count: errorStats.capitalization || 0,
      color: 'bg-purple-500',
      tag: 'Chữ hoa',
    },
  ];

  const handleRunAIAnalysis = async () => {
    soundEffects.playClick();
    setIsAnalyzing(true);
    try {
      const res = await aiService.analyzeProfile(profile.name, profile.grade, weakWords, errorStats);
      setAnalysisResult(res);
      soundEffects.playCorrect();
    } catch {
      // Handled in service fallback
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateAILesson = async () => {
    soundEffects.playClick();
    setIsGeneratingAIExercise(true);
    try {
      // Find top sounds
      const topSounds = weakWords.slice(0, 5).map((w) => w.word).join(', ');
      const ex = await aiService.generateExercise({
        grade: profile.grade,
        targetSounds: topSounds || 's, x, tr, ch',
        count: 5,
        topic: 'Luyện âm trọng tâm',
      });
      setGeneratedExercise(ex);
      soundEffects.playCorrect();
    } catch {
      // Handled
    } finally {
      setIsGeneratingAIExercise(false);
    }
  };

  const accuracyPct = Math.round(
    (profile.totalCorrectWords / Math.max(1, profile.totalWordsPracticed)) * 100
  );

  return (
    <div id="parent-dashboard-view" className="max-w-5xl mx-auto px-4 py-6 sm:py-8 text-slate-800">
      {/* Top Profile Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-3xl shadow-xs">
            👨‍🏫
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-1">
              <Users className="w-3.5 h-3.5" /> GÓC PHỤ HUYNH & GIÁO VIÊN
            </div>
            <h1 className="font-kid font-extrabold text-xl sm:text-2xl text-slate-900">
              Báo cáo tiến độ: <span className="text-purple-700">{profile.name} (Lớp {profile.grade})</span>
            </h1>
          </div>
        </div>

        {/* Switch child selector */}
        {allProfiles.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Xem bé khác:</span>
            <select
              value={profile.id}
              onChange={(e) => onSwitchProfile(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              {allProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Lớp {p.grade})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Stats Cards (Section 16) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Tổng bài đã làm
          </div>
          <div className="font-kid font-extrabold text-2xl sm:text-3xl text-blue-600">
            {profile.totalExercises} bài
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Độ chuẩn xác
          </div>
          <div className="font-kid font-extrabold text-2xl sm:text-3xl text-emerald-600">
            {accuracyPct}%
          </div>
          <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
            {profile.totalCorrectWords}/{profile.totalWordsPracticed} từ
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Điểm cao nhất
          </div>
          <div className="font-kid font-extrabold text-2xl sm:text-3xl text-amber-500">
            {profile.highestScore} điểm
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Chuỗi học tập
          </div>
          <div className="font-kid font-extrabold text-2xl sm:text-3xl text-orange-500 flex items-center gap-1">
            <Flame className="w-6 h-6 fill-orange-500" />
            <span>{profile.currentStreak} ngày</span>
          </div>
        </div>
      </div>

      {/* AI Assistant for Parents (Section 17 & 18) */}
      <div className="bg-linear-to-br from-purple-50 via-indigo-50/50 to-blue-50 rounded-3xl p-6 sm:p-7 border-2 border-purple-200 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl shadow-xs">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-kid font-bold text-lg sm:text-xl text-purple-950 flex items-center gap-2">
                <span>AI Trợ Lý Phân Tích &amp; Soạn Bài Riêng</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 text-[10px] font-extrabold">
                  Gemini AI
                </span>
              </h2>
              <p className="text-xs text-purple-800 font-medium">
                Tự động tìm ra các âm vần bé hay nhầm và tạo bài tập bổ trợ
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="run-ai-analysis-btn"
              type="button"
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Đang phân tích...' : 'Phân tích hồ sơ bé'}</span>
            </button>

            <button
              id="generate-ai-exercise-btn"
              type="button"
              onClick={handleGenerateAILesson}
              disabled={isGeneratingAIExercise}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-purple-700 font-bold text-xs sm:text-sm flex items-center gap-2 border border-purple-300 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <BookOpen className={`w-4 h-4 ${isGeneratingAIExercise ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAIExercise ? 'Đang tạo bài...' : 'Tự tạo bài luyện âm yếu'}</span>
            </button>
          </div>
        </div>

        {/* AI Analysis Result Display */}
        {analysisResult && (
          <div className="mt-4 p-5 rounded-2xl bg-white border border-purple-200 shadow-xs space-y-3 animate-in fade-in">
            <div>
              <div className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                📊 Nhận xét tổng quan:
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {analysisResult.summary}
              </p>
            </div>

            {analysisResult.topWeakPhonics.length > 0 && (
              <div>
                <div className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                  🎯 Các âm vần trọng tâm cần củng cố:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.topWeakPhonics.map((p, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-purple-100 text-purple-800 text-xs font-bold"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                💡 Lời khuyên dành cho phụ huynh / giáo viên:
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {analysisResult.parentAdvice}
              </p>
            </div>
          </div>
        )}

        {/* Generated Exercise Preview */}
        {generatedExercise && (
          <div className="mt-4 p-5 rounded-2xl bg-white border-2 border-emerald-300 shadow-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{generatedExercise.icon}</span>
                <div>
                  <h4 className="font-kid font-bold text-base text-slate-900">
                    {generatedExercise.title}
                  </h4>
                  <span className="text-xs text-emerald-700 font-bold">
                    Đã chuẩn bị sẵn {generatedExercise.sentences.length} câu đặc biệt
                  </span>
                </div>
              </div>

              <button
                id="start-generated-ai-ex-btn"
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onStartCustomExercise(generatedExercise);
                }}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-kid font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Cho bé làm ngay</span>
              </button>
            </div>

            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
              {generatedExercise.sentences.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <span className="font-bold text-slate-400">{i + 1}.</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Breakdown Statistics (Section 16) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8">
        <h3 className="font-kid font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-600" />
          <span>Thống kê phân loại lỗi chính tả bé thường gặp</span>
        </h3>

        <div className="space-y-4">
          {errorCategories.map((cat) => {
            const pct = totalErrors > 0 ? Math.round((cat.count / totalErrors) * 100) : 0;

            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-bold text-slate-700">{cat.label}</span>
                  <span className="font-bold text-slate-500">
                    {cat.count} lần ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${cat.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-kid font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>Lịch sử các bài kiểm tra gần đây</span>
        </h3>

        {history.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ngày</th>
                  <th className="py-3 px-4">Tên bài kiểm tra</th>
                  <th className="py-3 px-4 text-center">Điểm số</th>
                  <th className="py-3 px-4 text-center">Số câu đúng</th>
                  <th className="py-3 px-4 text-center">Độ chuẩn xác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.slice(0, 10).map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-500">{rec.completedAt}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{rec.exerciseTitle}</td>
                    <td className="py-3 px-4 text-center font-extrabold text-amber-600">
                      {rec.score}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600">
                      {rec.correctSentences}/{rec.totalSentences}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">
                      {Math.round((rec.correctWords / Math.max(1, rec.totalWords)) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Bé chưa làm bài kiểm tra nào. Hãy cùng bé bắt đầu bài đầu tiên nhé!
          </div>
        )}
      </div>
    </div>
  );
};
