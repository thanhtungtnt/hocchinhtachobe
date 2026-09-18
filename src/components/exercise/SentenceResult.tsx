import React, { useState } from 'react';
import { Volume2, ArrowRight, Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { SentenceEvaluation } from '../../types';
import { speechService } from '../../services/speechService';
import { soundEffects } from '../../services/soundEffects';

interface SentenceResultProps {
  evaluation: SentenceEvaluation;
  onNextSentence: () => void;
  audioRate: number;
  voiceURI: string;
}

export const SentenceResult: React.FC<SentenceResultProps> = ({
  evaluation,
  onNextSentence,
  audioRate,
  voiceURI,
}) => {
  const [retryWord, setRetryWord] = useState('');
  const [retrySuccess, setRetrySuccess] = useState<Record<number, boolean>>({});
  const [retryInputs, setRetryInputs] = useState<Record<number, string>>({});

  const handleReplay = () => {
    soundEffects.playClick();
    speechService.speak(evaluation.originalSentence, {
      rate: audioRate,
      voiceURI,
    });
  };

  const handleRetrySubmit = (expected: string, idx: number) => {
    const input = (retryInputs[idx] || '').trim().toLowerCase();
    const cleanExpected = expected.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()"'“”…]/g, '').trim();

    if (input === cleanExpected) {
      soundEffects.playCorrect();
      setRetrySuccess((prev) => ({ ...prev, [idx]: true }));
    } else {
      soundEffects.playEncouragement();
    }
  };

  return (
    <div
      id="sentence-result-card"
      className="w-full bg-white rounded-3xl p-5 sm:p-7 shadow-xl border-4 border-slate-100 animate-in zoom-in-95 duration-200 text-slate-800"
    >
      {/* Header Banner */}
      <div
        className={`p-4 rounded-2xl mb-6 flex items-center justify-between gap-3 ${
          evaluation.isFullyCorrect
            ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950'
            : 'bg-amber-50 border-2 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl sm:text-4xl">
            {evaluation.isFullyCorrect ? '🎉' : '💪'}
          </div>
          <div>
            <h3 className="font-kid font-bold text-xl sm:text-2xl leading-tight">
              {evaluation.isFullyCorrect ? 'Tuyệt vời! Con giỏi lắm!' : 'Gần đúng rồi, cố lên nhé!'}
            </h3>
            <p className="text-xs sm:text-sm font-semibold opacity-90">
              {evaluation.encouragement}
            </p>
          </div>
        </div>

        {/* Score pill */}
        <div
          id="sentence-score-badge"
          className={`px-4 py-2 rounded-2xl font-kid font-extrabold text-lg sm:text-xl shadow-xs whitespace-nowrap ${
            evaluation.isFullyCorrect
              ? 'bg-emerald-500 text-white'
              : 'bg-amber-400 text-amber-950'
          }`}
        >
          +{evaluation.score} điểm
        </div>
      </div>

      {/* Comparison View */}
      <div className="space-y-4 mb-6">
        {/* Child's typed sentence with highlighted tokens */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span>✏️ Câu con vừa viết:</span>
          </div>
          <div className="text-base sm:text-lg font-bold flex flex-wrap gap-1.5 items-center leading-relaxed">
            {evaluation.tokenDiffs.map((token, i) => {
              if (token.status === 'correct') {
                return (
                  <span key={i} className="text-emerald-700 font-semibold">
                    {token.actual}
                  </span>
                );
              }
              if (token.status === 'incorrect') {
                return (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 border border-rose-300 line-through decoration-rose-500 font-bold"
                  >
                    {token.actual || '(trống)'}
                  </span>
                );
              }
              if (token.status === 'extra') {
                return (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-600 border border-rose-200 line-through"
                  >
                    {token.actual}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Expected Sentence */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đáp án chuẩn:</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-emerald-950 leading-relaxed">
            {evaluation.tokenDiffs.map((token, i) => {
              if (token.status === 'correct') {
                return (
                  <span key={i} className="text-slate-800 font-medium mr-1.5">
                    {token.expected}
                  </span>
                );
              }
              return (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-lg bg-emerald-200/90 text-emerald-900 border border-emerald-400 font-extrabold mr-1.5 underline decoration-2"
                >
                  {token.expected}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Errors detail & Friendly tips */}
      {evaluation.errors.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            🔍 Những từ con cần chú ý:
          </div>

          <div className="space-y-2.5">
            {evaluation.errors.map((err, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className="text-rose-500 font-bold text-base mt-0.5">❌</div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                      <span className="text-rose-600 line-through font-bold">
                        {err.actual || '(chưa viết)'}
                      </span>
                      <span>→</span>
                      <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-lg">
                        {err.expected}
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 font-medium mt-1">
                      💡 {err.friendlyTip}
                    </p>
                  </div>
                </div>

                {/* Quick retry widget for this specific wrong word */}
                {err.expected && (
                  <div className="shrink-0 flex items-center gap-1.5">
                    {retrySuccess[idx] ? (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-300">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Đúng rồi!
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          placeholder={`Gõ lại: ${err.expected}`}
                          value={retryInputs[idx] || ''}
                          onChange={(e) =>
                            setRetryInputs({ ...retryInputs, [idx]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRetrySubmit(err.expected, idx);
                          }}
                          className="w-28 sm:w-32 px-2.5 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRetrySubmit(err.expected, idx)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs shadow-xs"
                        >
                          Kiểm tra
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          id="replay-sentence-btn"
          type="button"
          onClick={handleReplay}
          className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center gap-2 border border-blue-200 transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          <span>Nghe lại câu này</span>
        </button>

        <button
          id="next-sentence-btn"
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onNextSentence();
          }}
          className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-kid font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all transform active:scale-98 cursor-pointer"
        >
          <span>CÂU TIẾP THEO</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
