import React, { useState } from 'react';
import { X, Plus, Trash2, Wand2, Check, Sparkles } from 'lucide-react';
import { Difficulty, Grade, SpellingExercise } from '../../types';
import { soundEffects } from '../../services/soundEffects';

interface ExerciseCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExercise: (exercise: SpellingExercise) => void;
}

export const ExerciseCreator: React.FC<ExerciseCreatorProps> = ({
  isOpen,
  onClose,
  onSaveExercise,
}) => {
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState<Grade>(2);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [topic, setTopic] = useState('Trường học');
  const [icon, setIcon] = useState('📖');
  const [rawParagraph, setRawParagraph] = useState('');
  const [sentences, setSentences] = useState<string[]>([]);

  if (!isOpen) return null;

  // Auto split paragraph into sentences
  const handleAutoSplit = () => {
    soundEffects.playClick();
    if (!rawParagraph.trim()) return;

    // Split by sentence terminators (. ! ?) while keeping quotes/punctuation reasonable
    const split = rawParagraph
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 3);

    if (split.length > 0) {
      setSentences(split);
    } else {
      setSentences([rawParagraph.trim()]);
    }
  };

  const handleAddEmptySentence = () => {
    soundEffects.playClick();
    setSentences([...sentences, '']);
  };

  const handleUpdateSentence = (index: number, val: string) => {
    const next = [...sentences];
    next[index] = val;
    setSentences(next);
  };

  const handleRemoveSentence = (index: number) => {
    soundEffects.playClick();
    setSentences(sentences.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validSentences = sentences.map((s) => s.trim()).filter((s) => s.length > 0);
    if (!title.trim() || validSentences.length === 0) {
      alert('Vui lòng nhập tiêu đề bài và ít nhất 1 câu chính tả nhé!');
      return;
    }

    soundEffects.playCorrect();
    const newExercise: SpellingExercise = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      grade,
      difficulty,
      topic,
      icon,
      sentences: validSentences,
      isCustom: true,
      author: 'Giáo viên / Phụ huynh',
      createdAt: new Date().toISOString(),
    };

    onSaveExercise(newExercise);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div
        id="exercise-creator-dialog"
        className="w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-amber-300 relative text-slate-800 my-auto"
      >
        <button
          id="close-exercise-creator-btn"
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-2xl shadow-xs">
            ✍️
          </div>
          <div>
            <h3 className="font-kid font-bold text-xl sm:text-2xl text-slate-900">
              Tạo bài kiểm tra chính tả mới
            </h3>
            <p className="text-xs text-slate-500">
              Dành cho giáo viên và phụ huynh soạn bài riêng cho học sinh
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Icon */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tiêu đề bài kiểm tra:
              </label>
              <input
                id="creator-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Buổi sáng trên bãi biển..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:border-amber-400 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Biểu tượng:
              </label>
              <select
                id="creator-icon-select"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base focus:border-amber-400 focus:outline-hidden"
              >
                <option value="📖">📖 Sách</option>
                <option value="🏫">🏫 Trường học</option>
                <option value="🌳">🌳 Thiên nhiên</option>
                <option value="🐶">🐶 Động vật</option>
                <option value="👨‍👩‍👧">👨‍👩‍👧 Gia đình</option>
                <option value="🇻🇳">🇻🇳 Quê hương</option>
                <option value="🌸">🌸 Mùa xuân</option>
              </select>
            </div>
          </div>

          {/* Grade, Difficulty, Topic */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lớp:
              </label>
              <select
                id="creator-grade-select"
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as Grade)}
                className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:border-amber-400 focus:outline-hidden"
              >
                {[1, 2, 3, 4, 5].map((g) => (
                  <option key={g} value={g}>Lớp {g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Độ khó:
              </label>
              <select
                id="creator-difficulty-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:border-amber-400 focus:outline-hidden"
              >
                <option value="easy">⭐ Dễ</option>
                <option value="medium">⭐⭐ Vừa</option>
                <option value="hard">⭐⭐⭐ Khó</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chủ đề:
              </label>
              <input
                id="creator-topic-input"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Trường học, Thiên nhiên..."
                className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:border-amber-400 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Paragraph import widget */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Cách nhanh: Dán cả đoạn văn để hệ thống tự tách câu</span>
              </label>
            </div>
            <textarea
              id="creator-paragraph-textarea"
              rows={3}
              value={rawParagraph}
              onChange={(e) => setRawParagraph(e.target.value)}
              placeholder="Dán đoạn văn tiếng Việt vào đây (các câu cách nhau bằng dấu chấm . hoặc ! hoặc ?)..."
              className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-amber-500 resize-none leading-relaxed"
            />
            <div className="mt-2 flex justify-end">
              <button
                id="auto-split-sentences-btn"
                type="button"
                onClick={handleAutoSplit}
                disabled={!rawParagraph.trim()}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Tự động tách câu</span>
              </button>
            </div>
          </div>

          {/* Sentences List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Danh sách các câu đọc ({sentences.length} câu):
              </label>
              <button
                id="add-single-sentence-btn"
                type="button"
                onClick={handleAddEmptySentence}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm câu
              </button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {sentences.map((sent, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-xs font-bold text-slate-400 text-right">
                    {i + 1}.
                  </span>
                  <input
                    type="text"
                    value={sent}
                    onChange={(e) => handleUpdateSentence(i, e.target.value)}
                    placeholder={`Câu ${i + 1}...`}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-amber-400 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSentence(i)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Xóa câu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {sentences.length === 0 && (
                <div className="text-center py-5 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Chưa có câu nào. Dán đoạn văn ở trên hoặc bấm &quot;Thêm câu&quot; nhé!
                </div>
              )}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
            >
              Hủy
            </button>
            <button
              id="save-created-exercise-btn"
              type="submit"
              disabled={sentences.filter((s) => s.trim()).length === 0}
              className="flex-1 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Lưu bài kiểm tra</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
