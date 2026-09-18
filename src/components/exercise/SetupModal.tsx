import React, { useState } from 'react';
import { X, Play, Sparkles } from 'lucide-react';
import { Difficulty, Grade, SpellingExercise } from '../../types';
import { soundEffects } from '../../services/soundEffects';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGrade: Grade;
  onStartCustomPractice: (grade: Grade, difficulty: Difficulty, sentenceCount: number) => void;
  onSelectSpecificExercise: (exercise: SpellingExercise) => void;
  availableExercises: SpellingExercise[];
}

export const SetupModal: React.FC<SetupModalProps> = ({
  isOpen,
  onClose,
  defaultGrade,
  onStartCustomPractice,
}) => {
  const [grade, setGrade] = useState<Grade>(defaultGrade);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [sentenceCount, setSentenceCount] = useState<number>(5);

  if (!isOpen) return null;

  const handleStart = () => {
    soundEffects.playClick();
    onStartCustomPractice(grade, difficulty, sentenceCount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="setup-practice-dialog"
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-300 relative text-slate-800"
      >
        <button
          id="close-setup-modal-btn"
          onClick={() => {
            soundEffects.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-2xl shadow-xs">
            🎮
          </div>
          <div>
            <h3 className="font-kid font-bold text-2xl text-slate-900">Bắt đầu luyện tập</h3>
            <p className="text-xs text-slate-500">Chọn cấp độ và số câu để bắt đầu nghe viết</p>
          </div>
        </div>

        {/* 1. Grade selection */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            1. Chọn lớp học của con:
          </label>
          <div className="grid grid-cols-5 gap-2">
            {([1, 2, 3, 4, 5] as Grade[]).map((g) => (
              <button
                key={g}
                type="button"
                id={`setup-grade-btn-${g}`}
                onClick={() => {
                  soundEffects.playClick();
                  setGrade(g);
                }}
                className={`py-3 rounded-2xl font-kid font-bold text-sm sm:text-base border-2 transition-all ${
                  grade === g
                    ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-sm scale-105'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                Lớp {g}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Difficulty */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            2. Mức độ thử thách:
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'easy' as Difficulty, label: '⭐ Dễ', desc: 'Câu ngắn, từ quen thuộc' },
              { id: 'medium' as Difficulty, label: '⭐⭐ Vừa', desc: 'Độ dài tiêu chuẩn' },
              { id: 'hard' as Difficulty, label: '⭐⭐⭐ Khó', desc: 'Nhiều âm vần phức tạp' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                id={`setup-diff-btn-${d.id}`}
                onClick={() => {
                  soundEffects.playClick();
                  setDifficulty(d.id);
                }}
                className={`p-3 rounded-2xl border-2 text-center transition-all ${
                  difficulty === d.id
                    ? 'border-amber-400 bg-amber-50 text-amber-950 font-bold shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div className="font-kid font-bold text-sm">{d.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Number of sentences */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            3. Số câu luyện tập:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 20].map((count) => (
              <button
                key={count}
                type="button"
                id={`setup-count-btn-${count}`}
                onClick={() => {
                  soundEffects.playClick();
                  setSentenceCount(count);
                }}
                className={`py-2.5 rounded-2xl border-2 font-bold text-sm transition-all ${
                  sentenceCount === count
                    ? 'border-blue-400 bg-blue-50 text-blue-900 shadow-xs scale-105'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                {count} câu
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          id="confirm-start-practice-btn"
          type="button"
          onClick={handleStart}
          className="w-full py-4 px-6 rounded-2xl bg-linear-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-kid font-bold text-lg sm:text-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 transform active:scale-98 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-white" />
          <span>BẮT ĐẦU NGAY NÀO!</span>
          <Sparkles className="w-5 h-5 text-amber-200 animate-spin" />
        </button>
      </div>
    </div>
  );
};
