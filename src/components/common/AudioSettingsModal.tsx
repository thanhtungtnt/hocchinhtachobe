import React, { useState, useEffect } from 'react';
import { X, Volume2, Play, Check, AlertCircle } from 'lucide-react';
import { AudioSettings } from '../../types';
import { speechService } from '../../services/speechService';
import { soundEffects } from '../../services/soundEffects';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioSettings;
  onSave: (settings: AudioSettings) => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [current, setCurrent] = useState<AudioSettings>(settings);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [viVoices, setViVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setCurrent(settings);
  }, [settings]);

  useEffect(() => {
    if (!isOpen) return;
    const updateVoices = () => {
      const all = speechService.getVoices();
      const vi = speechService.getVietnameseVoices();
      setVoices(all);
      setViVoices(vi);
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestVoice = () => {
    soundEffects.playClick();
    setIsTesting(true);
    speechService.speak('Xin chào bé! Chúc bé nghe thật kỹ và viết chính tả thật hay nhé!', {
      rate: current.rate,
      voiceURI: current.voiceURI,
      onEnd: () => setIsTesting(false),
      onError: () => setIsTesting(false),
    });
  };

  const handleSave = () => {
    soundEffects.playClick();
    onSave(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="audio-settings-dialog"
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-300 relative text-slate-800"
      >
        {/* Close button */}
        <button
          id="close-audio-settings-btn"
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
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl">
            🔊
          </div>
          <div>
            <h3 className="font-kid font-bold text-xl text-slate-800">Cài đặt giọng đọc</h3>
            <p className="text-xs text-slate-500">Tùy chỉnh âm thanh và tốc độ đọc chính tả</p>
          </div>
        </div>

        {/* Speed Option */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Tốc độ đọc cho bé:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { rate: 0.7, label: '🐢 Đọc chậm', desc: '0.7x (Lớp 1-2)' },
              { rate: 0.85, label: '🚶 Vừa phải', desc: '0.85x (Chuẩn)' },
              { rate: 1.0, label: '🏃 Nhanh', desc: '1.0x (Lớp 4-5)' },
            ].map((item) => (
              <button
                key={item.rate}
                type="button"
                id={`speed-btn-${item.rate}`}
                onClick={() => {
                  soundEffects.playClick();
                  setCurrent({ ...current, rate: item.rate });
                }}
                className={`p-2.5 rounded-2xl border-2 text-center transition-all ${
                  current.rate === item.rate
                    ? 'border-amber-400 bg-amber-50 font-bold text-amber-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <div className="text-sm">{item.label}</div>
                <div className="text-[11px] text-slate-400 font-medium">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Selector */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            Chọn giọng đọc tiếng Việt:
          </label>
          {viVoices.length > 0 ? (
            <select
              id="voice-select-dropdown"
              value={current.voiceURI}
              onChange={(e) => setCurrent({ ...current, voiceURI: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:border-amber-400 focus:outline-hidden"
            >
              <option value="">Giọng đọc mặc định (Hệ thống đề xuất)</option>
              {viVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  🇻🇳 {v.name} ({v.lang})
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Đang dùng giọng đọc tổng hợp của trình duyệt.</p>
                <p className="text-amber-700 mt-0.5">
                  Để có giọng tiếng Việt tự nhiên nhất, bạn có thể bật &quot;Google Tiếng Việt&quot; trong cài đặt trình duyệt Chrome/Edge.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Auto repeat toggle */}
        <div className="mb-6 flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <div className="text-sm font-bold text-slate-800">Đọc lặp lại 2 lần</div>
            <div className="text-xs text-slate-500">Giúp bé nghe rõ hơn trước khi viết</div>
          </div>
          <button
            type="button"
            id="auto-repeat-toggle"
            onClick={() => {
              soundEffects.playClick();
              setCurrent({ ...current, autoRepeat: !current.autoRepeat });
            }}
            className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors ${
              current.autoRepeat ? 'bg-amber-400 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            id="test-voice-btn"
            type="button"
            onClick={handleTestVoice}
            disabled={isTesting}
            className="flex-1 py-3 px-4 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center gap-2 border border-blue-200 transition-colors"
          >
            <Play className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Đang đọc thử...' : 'Nghe thử'}</span>
          </button>

          <button
            id="save-audio-settings-btn"
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Lưu cài đặt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
