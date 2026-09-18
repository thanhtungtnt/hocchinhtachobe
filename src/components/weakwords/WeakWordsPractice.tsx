import React, { useState } from 'react';
import { Volume2, Check, ArrowRight, Sparkles, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { AudioSettings, WeakWordRecord } from '../../types';
import { speechService } from '../../services/speechService';
import { soundEffects } from '../../services/soundEffects';
import { Mascot } from '../common/Mascot';

interface WeakWordsPracticeProps {
  weakWords: WeakWordRecord[];
  onRemoveWord: (id: string) => void;
  onAwardXp: (amount: number) => void;
  audioSettings: AudioSettings;
  onStartExerciseWithWords: (words: string[]) => void;
}

export const WeakWordsPractice: React.FC<WeakWordsPracticeProps> = ({
  weakWords,
  onRemoveWord,
  onAwardXp,
  audioSettings,
  onStartExerciseWithWords,
}) => {
  const [activeWordIdx, setActiveWordIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const activeWord = weakWords[activeWordIdx];

  const handleSpeakWord = (wordToSpeak: string) => {
    soundEffects.playClick();
    speechService.speak(wordToSpeak, {
      rate: 0.75, // slow and crisp for single word
      voiceURI: audioSettings.voiceURI,
    });
  };

  const handleCheck = () => {
    if (!activeWord) return;
    soundEffects.playClick();

    const cleanInput = userInput.trim().toLowerCase();
    const cleanExpected = activeWord.word.trim().toLowerCase();

    if (cleanInput === cleanExpected) {
      soundEffects.playCorrect();
      setFeedback('correct');
      onAwardXp(15);
    } else {
      soundEffects.playEncouragement();
      setFeedback('incorrect');
    }
  };

  const handleNextWord = (removeCurrent: boolean = false) => {
    soundEffects.playClick();
    if (removeCurrent && activeWord) {
      onRemoveWord(activeWord.id);
    }
    setUserInput('');
    setFeedback('idle');
    if (activeWordIdx < weakWords.length - 1) {
      setActiveWordIdx((prev) => prev + 1);
    } else {
      setActiveWordIdx(0);
    }
  };

  if (weakWords.length === 0) {
    return (
      <div id="weak-words-empty-view" className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-md border-4 border-emerald-200">
          <Mascot mood="celebrating" size="lg" className="mx-auto mb-4" />
          <h2 className="font-kid font-bold text-2xl text-slate-800 mb-2">
            Không có từ sai nào cần luyện! 🎉
          </h2>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            Bé viết chính tả rất tốt và chưa có từ nào bị ghi nhận là viết sai. Hãy làm thêm các bài kiểm tra nhé!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="weak-words-practice-view" className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 font-kid font-bold text-xs sm:text-sm mb-2">
          <span>🎯 CHẾ ĐỘ LUYỆN TỪ SAI</span>
        </div>
        <h1 className="font-kid font-extrabold text-2xl sm:text-3xl text-slate-900 mb-1">
          Rèn luyện những từ con từng viết nhầm
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Nghe thật kỹ từng từ, luyện gõ lại cho đến khi nhớ nằm lòng nhé bé!
        </p>
      </div>

      {/* Main Interactive Flashcard */}
      {activeWord && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-rose-200 text-slate-800 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Từ {activeWordIdx + 1} / {weakWords.length}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
              Đã nhầm {activeWord.count} lần
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center my-4">
            <Mascot
              mood={feedback === 'correct' ? 'celebrating' : feedback === 'incorrect' ? 'thinking' : 'listening'}
              size="md"
              className="mb-2"
            />

            {/* Listen Button for this word */}
            <button
              id="listen-weak-word-btn"
              type="button"
              onClick={() => handleSpeakWord(activeWord.word)}
              className="px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-kid font-bold text-lg sm:text-xl flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer mb-4"
            >
              <Volume2 className="w-6 h-6" />
              <span>🔊 NGHE PHÁT ÂM TỪ</span>
            </button>

            {/* Tricky notes */}
            {activeWord.wrongSpellings.length > 0 && (
              <div className="text-xs text-slate-500 mb-4 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                Lưu ý: Trước đây con từng viết nhầm thành:{' '}
                <span className="text-rose-600 font-bold line-through">
                  {activeWord.wrongSpellings.join(', ')}
                </span>
              </div>
            )}

            {/* Input field */}
            <div className="w-full max-w-sm mb-4">
              <input
                id="weak-word-input"
                type="text"
                autoFocus
                placeholder="✏️ Gõ từ con vừa nghe được..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCheck();
                }}
                className="w-full p-4 text-center rounded-2xl bg-slate-50 border-3 border-rose-300 focus:border-rose-500 focus:bg-white text-xl font-kid font-bold text-slate-900 focus:outline-hidden transition-all shadow-inner"
              />
            </div>

            {/* Feedback alert */}
            {feedback === 'correct' && (
              <div className="w-full max-w-sm p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-sm flex items-center justify-center gap-2 mb-4 animate-in zoom-in-95">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Tuyệt vời! Con đã viết đúng từ &quot;{activeWord.word}&quot; (+15 XP)</span>
              </div>
            )}

            {feedback === 'incorrect' && (
              <div className="w-full max-w-sm p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 font-bold text-sm flex items-center justify-center gap-2 mb-4 animate-in zoom-in-95">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>
                  Chưa chính xác rồi. Đáp án đúng là: &quot;<strong className="text-emerald-700">{activeWord.word}</strong>&quot;. Con thử lại nhé!
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {feedback !== 'correct' ? (
                <button
                  id="check-weak-word-btn"
                  type="button"
                  onClick={handleCheck}
                  disabled={!userInput.trim()}
                  className={`py-3 px-6 rounded-2xl font-kid font-bold text-base flex items-center gap-2 shadow-sm transition-all ${
                    userInput.trim()
                      ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-5 h-5" />
                  <span>Kiểm tra</span>
                </button>
              ) : (
                <>
                  <button
                    id="mastered-weak-word-btn"
                    type="button"
                    onClick={() => handleNextWord(true)}
                    className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Con đã thuộc (Xóa khỏi danh sách)</span>
                  </button>

                  <button
                    id="next-weak-word-btn"
                    type="button"
                    onClick={() => handleNextWord(false)}
                    className="py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Luyện từ tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overview Table of Weak Words */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-kid font-bold text-lg text-slate-800">
            Danh sách tất cả từ cần nhớ ({weakWords.length} từ)
          </h3>
          <button
            id="create-exercise-from-weak-words-btn"
            type="button"
            onClick={() => onStartExerciseWithWords(weakWords.map((w) => w.word))}
            className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 border border-blue-200 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" /> Tạo bài kiểm tra từ này
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {weakWords.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveWordIdx(idx);
                setUserInput('');
                setFeedback('idle');
              }}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                idx === activeWordIdx
                  ? 'border-rose-400 bg-rose-50/60 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeakWord(item.word);
                  }}
                  className="w-9 h-9 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 flex items-center justify-center text-sm"
                  title="Nghe từ"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <div>
                  <div className="font-kid font-bold text-base text-slate-800">
                    {item.word}
                  </div>
                  <div className="text-xs text-rose-600">
                    {item.wrongSpellings.length > 0 && `Nhầm: ${item.wrongSpellings.join(', ')}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">
                  {item.count} lần
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveWord(item.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Xóa từ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
