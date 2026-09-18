import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Flame, Star, X, Check, Snail, RotateCcw } from 'lucide-react';
import { AudioSettings, SentenceEvaluation, SpellingExercise } from '../../types';
import { speechService } from '../../services/speechService';
import { soundEffects } from '../../services/soundEffects';
import { evaluateSpelling } from '../../services/spellingEngine';
import { Mascot } from '../common/Mascot';
import { SentenceResult } from './SentenceResult';

interface SpellingArenaProps {
  exercise: SpellingExercise;
  sentences: string[];
  audioSettings: AudioSettings;
  onFinishSession: (results: SentenceEvaluation[], totalScore: number) => void;
  onQuit: () => void;
  onRecordWeakWord: (expected: string, actual: string, errorType: any, grade: any) => void;
}

export const SpellingArena: React.FC<SpellingArenaProps> = ({
  exercise,
  sentences,
  audioSettings,
  onFinishSession,
  onQuit,
  onRecordWeakWord,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<SentenceEvaluation | null>(null);
  const [allEvaluations, setAllEvaluations] = useState<SentenceEvaluation[]>([]);
  const [sessionScore, setSessionScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [streakBonusAwarded, setStreakBonusAwarded] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentSentence = sentences[currentIndex] || '';

  // Subscribe to speech state
  useEffect(() => {
    const unsub = speechService.subscribeState((speaking, paused) => {
      setIsSpeaking(speaking);
      setIsPaused(paused);
    });
    return () => {
      unsub();
      speechService.stop();
    };
  }, []);

  // When moving to new sentence, reset input & evaluation and auto-play
  useEffect(() => {
    setUserInput('');
    setCurrentEvaluation(null);
    setStreakBonusAwarded(null);

    // Auto-focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 250);

    // Auto-read sentence once when entering
    const timer = setTimeout(() => {
      handlePlayAudio(audioSettings.rate);
    }, 450);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handlePlayAudio = (customRate?: number) => {
    soundEffects.playClick();
    const rateToUse = customRate ?? audioSettings.rate;

    speechService.speak(currentSentence, {
      rate: rateToUse,
      voiceURI: audioSettings.voiceURI,
      onEnd: () => {
        // If auto-repeat is enabled, read again after a delay
        if (audioSettings.autoRepeat) {
          setTimeout(() => {
            speechService.speak(currentSentence, {
              rate: rateToUse,
              voiceURI: audioSettings.voiceURI,
            });
          }, (audioSettings.repeatDelay || 1.5) * 1000);
        }
      },
    });
  };

  const handlePauseResume = () => {
    soundEffects.playClick();
    if (isPaused) {
      speechService.resume();
    } else {
      speechService.pause();
    }
  };

  const handleCheckSpelling = () => {
    soundEffects.playClick();
    speechService.stop();

    const evaluation = evaluateSpelling(currentSentence, userInput);

    // Compute streaks and bonus
    let bonus = 0;
    let newStreak = currentStreak;
    if (evaluation.isFullyCorrect) {
      newStreak += 1;
      soundEffects.playCorrect();

      // Streak rewards (Prompt section 10):
      // 3 consecutive -> +5 pts; 5 consecutive -> +10 pts
      if (newStreak === 3) {
        bonus = 5;
        setStreakBonusAwarded('🔥 Chuỗi 3 câu đúng: Thưởng +5 điểm!');
        soundEffects.playStreak();
      } else if (newStreak === 5) {
        bonus = 10;
        setStreakBonusAwarded('🔥🔥 Siêu đẳng! Chuỗi 5 câu đúng: Thưởng +10 điểm!');
        soundEffects.playStreak();
      }
    } else {
      newStreak = 0;
      soundEffects.playEncouragement();

      // Record weak words for long term practice
      evaluation.errors.forEach((err) => {
        if (err.expected && err.type !== 'missing_word' && err.type !== 'extra_word') {
          onRecordWeakWord(err.expected, err.actual, err.type, exercise.grade);
        }
      });
    }

    setCurrentStreak(newStreak);
    const addedScore = evaluation.score + bonus;
    setSessionScore((prev) => prev + addedScore);
    setCurrentEvaluation(evaluation);
    setAllEvaluations((prev) => [...prev, evaluation]);
  };

  const handleNextSentence = () => {
    if (currentIndex + 1 < sentences.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all sentences in this session
      soundEffects.playFanfare();
      onFinishSession(allEvaluations, sessionScore);
    }
  };

  const progressPercentage = Math.round(((currentIndex + 1) / sentences.length) * 100);

  return (
    <div id="spelling-arena" className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Bar: Progress, Question Counter & Score */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Exercise info & Question count */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            id="quit-practice-btn"
            type="button"
            onClick={() => {
              soundEffects.playClick();
              if (window.confirm('Con có chắc muốn tạm dừng bài luyện tập không?')) {
                speechService.stop();
                onQuit();
              }
            }}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            title="Thoát bài luyện tập"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="font-kid font-bold text-lg sm:text-xl text-slate-800 flex items-center gap-2">
              <span>{exercise.icon} {exercise.title}</span>
            </div>
            <div className="text-xs font-bold text-amber-700">
              Câu {currentIndex + 1} / {sentences.length} • Lớp {exercise.grade}
            </div>
          </div>
        </div>

        {/* Center: Progress bar */}
        <div className="w-full sm:w-56 bg-slate-100 rounded-full h-3.5 p-0.5 border border-slate-200">
          <div
            className="bg-linear-to-r from-amber-400 to-orange-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Right: Score & Streak */}
        <div className="flex items-center gap-2.5">
          {currentStreak > 1 && (
            <div
              id="active-streak-pill"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 border border-orange-300 rounded-2xl text-orange-800 font-extrabold text-sm animate-bounce"
            >
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span>Chuỗi {currentStreak}</span>
            </div>
          )}

          <div
            id="active-score-pill"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 text-amber-950 font-kid font-extrabold text-base rounded-2xl shadow-xs"
          >
            <Star className="w-4 h-4 fill-amber-950" />
            <span>{sessionScore} điểm</span>
          </div>
        </div>
      </div>

      {/* Streak bonus banner if triggered */}
      {streakBonusAwarded && (
        <div className="mb-4 p-3 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 text-white font-kid font-bold text-center text-sm shadow-md animate-in slide-in-from-top-2 duration-300">
          {streakBonusAwarded}
        </div>
      )}

      {/* Main Content Area */}
      {!currentEvaluation ? (
        <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-xl border-4 border-amber-200 text-slate-800">
          {/* Mascot & Audio Section */}
          <div className="flex flex-col items-center justify-center text-center mb-7">
            <Mascot
              mood={isSpeaking ? 'listening' : 'idle'}
              size="lg"
              className="mb-3"
            />

            <h2 className="font-kid font-bold text-xl sm:text-2xl text-slate-800 mb-2">
              Lắng nghe và viết lại thật chuẩn nhé!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
              Bé bấm nút loa để nghe câu chính tả, sau đó gõ câu trả lời vào khung bên dưới.
            </p>

            {/* Giant Prominent Listen Button */}
            <div className="mt-5 mb-3 flex flex-wrap items-center justify-center gap-3">
              <button
                id="listen-sentence-giant-btn"
                type="button"
                onClick={() => handlePlayAudio()}
                className={`relative px-8 py-4 sm:px-10 sm:py-5 rounded-3xl font-kid font-extrabold text-xl sm:text-2xl flex items-center gap-3 shadow-lg transition-all transform active:scale-95 cursor-pointer ${
                  isSpeaking
                    ? 'bg-blue-600 text-white ring-8 ring-blue-200 animate-pulse'
                    : 'bg-linear-to-r from-blue-500 via-indigo-600 to-blue-700 hover:from-blue-600 hover:to-indigo-700 text-white hover:shadow-xl'
                }`}
              >
                <Volume2 className={`w-8 h-8 ${isSpeaking ? 'animate-bounce' : ''}`} />
                <span>{isSpeaking ? 'ĐANG ĐỌC CÂU...' : '🔊 NGHE CÂU'}</span>
              </button>
            </div>

            {/* Secondary audio buttons (Replay, Slow, Pause) */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <button
                id="replay-audio-btn"
                type="button"
                onClick={() => handlePlayAudio()}
                className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Nghe lại</span>
              </button>

              <button
                id="slow-audio-btn"
                type="button"
                onClick={() => handlePlayAudio(0.7)}
                className="px-4 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                title="Đọc chậm 0.7x"
              >
                <Snail className="w-4 h-4 text-emerald-600" />
                <span>🐢 Đọc chậm</span>
              </button>

              {isSpeaking && (
                <button
                  id="pause-audio-btn"
                  type="button"
                  onClick={handlePauseResume}
                  className="px-4 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span>{isPaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Big Input Box */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              ✏️ Viết lại câu con vừa nghe được:
            </label>
            <div className="relative">
              <textarea
                ref={inputRef}
                id="child-spelling-input"
                rows={3}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (userInput.trim()) handleCheckSpelling();
                  }
                }}
                placeholder="✏️ Hãy viết những gì con vừa nghe..."
                className="w-full p-4 sm:p-5 rounded-3xl bg-slate-50/80 border-3 border-amber-300 focus:border-blue-500 focus:bg-white text-lg sm:text-xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all shadow-inner resize-none leading-relaxed"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1.5 px-2">
              <span>Mẹo: Nhấn phím Enter để nộp bài nhanh</span>
              <span>{userInput.trim().split(/\s+/).filter(Boolean).length} từ</span>
            </div>
          </div>

          {/* Submit Check Button */}
          <div className="flex justify-end">
            <button
              id="submit-answer-btn"
              type="button"
              onClick={handleCheckSpelling}
              disabled={!userInput.trim()}
              className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-kid font-bold text-xl flex items-center justify-center gap-3 shadow-md transition-all transform active:scale-98 cursor-pointer ${
                userInput.trim()
                  ? 'bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-amber-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-6 h-6 stroke-[3]" />
              <span>✓ XONG (KIỂM TRA)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Evaluation View */
        <SentenceResult
          evaluation={currentEvaluation}
          onNextSentence={handleNextSentence}
          audioRate={audioSettings.rate}
          voiceURI={audioSettings.voiceURI}
        />
      )}
    </div>
  );
};
