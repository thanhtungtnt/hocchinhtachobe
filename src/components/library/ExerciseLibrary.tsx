import React, { useState } from 'react';
import { Search, Plus, BookOpen, Star, Play, Sparkles } from 'lucide-react';
import { Grade, SpellingExercise } from '../../types';
import { soundEffects } from '../../services/soundEffects';

interface ExerciseLibraryProps {
  exercises: SpellingExercise[];
  onSelectExercise: (exercise: SpellingExercise) => void;
  onOpenCreator: () => void;
  activeGrade: Grade;
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  exercises,
  onSelectExercise,
  onOpenCreator,
  activeGrade,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>(activeGrade);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique topics
  const topics = Array.from(new Set(exercises.map((e) => e.topic))).filter(Boolean);

  const filtered = exercises.filter((ex) => {
    if (selectedGrade !== 'all' && ex.grade !== selectedGrade) return false;
    if (selectedTopic !== 'all' && ex.topic !== selectedTopic) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ex.title.toLowerCase().includes(q);
      const matchTopic = ex.topic.toLowerCase().includes(q);
      const matchSentences = ex.sentences.some((s) => s.toLowerCase().includes(q));
      if (!matchTitle && !matchTopic && !matchSentences) return false;
    }
    return true;
  });

  return (
    <div id="exercise-library-view" className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-kid font-bold text-xs mb-1.5">
            <BookOpen className="w-3.5 h-3.5" /> KHO BÀI KIỂM TRA CHÍNH TẢ
          </div>
          <h1 className="font-kid font-extrabold text-2xl sm:text-3xl text-slate-900">
            Chọn bài tập phù hợp cho bé
          </h1>
        </div>

        <button
          id="open-creator-from-library-btn"
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onOpenCreator();
          }}
          className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-kid font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Soạn bài mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200 mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="library-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên bài, chủ đề hoặc từ khóa..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-400 focus:outline-hidden"
          />
        </div>

        {/* Grade tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Lớp:</span>
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setSelectedGrade('all');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedGrade === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả lớp
          </button>
          {[1, 2, 3, 4, 5].map((g) => (
            <button
              key={g}
              type="button"
              id={`filter-grade-tab-${g}`}
              onClick={() => {
                soundEffects.playClick();
                setSelectedGrade(g);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedGrade === g
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Lớp {g}
            </button>
          ))}
        </div>

        {/* Topic filter chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 mr-1">Chủ đề:</span>
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setSelectedTopic('all');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedTopic === 'all'
                ? 'bg-amber-100 text-amber-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tất cả
          </button>
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setSelectedTopic(t);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedTopic === t
                  ? 'bg-amber-100 text-amber-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Exercises */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const diffStars =
            item.difficulty === 'easy' ? '⭐ Dễ' : item.difficulty === 'medium' ? '⭐⭐ Vừa' : '⭐⭐⭐ Khó';

          return (
            <div
              key={item.id}
              id={`exercise-card-${item.id}`}
              className="bg-white rounded-3xl p-5 shadow-xs hover:shadow-md border-2 border-slate-200/80 hover:border-amber-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Card header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                    {item.icon || '📖'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.isCustom && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                        Tự tạo
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      Lớp {item.grade}
                    </span>
                  </div>
                </div>

                {/* Title & Topic */}
                <h3 className="font-kid font-bold text-lg text-slate-800 mb-1 leading-snug group-hover:text-amber-900 transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <span className="font-semibold text-amber-700">#{item.topic}</span>
                  <span>•</span>
                  <span>{item.sentences.length} câu</span>
                  <span>•</span>
                  <span>{diffStars}</span>
                </div>

                {/* Preview first sentence snippet */}
                <p className="text-xs text-slate-500 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
                  &ldquo;{item.sentences[0]}&rdquo;
                </p>
              </div>

              {/* Start Button */}
              <button
                id={`start-ex-btn-${item.id}`}
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onSelectExercise(item);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-kid font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-amber-950" />
                <span>Luyện bài này</span>
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="font-bold text-base text-slate-600 mb-1">
              Không tìm thấy bài tập nào phù hợp
            </p>
            <p className="text-xs text-slate-400">
              Hãy thử tìm với từ khóa khác hoặc bấm &quot;Soạn bài mới&quot;!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
