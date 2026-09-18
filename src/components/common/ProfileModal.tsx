import React, { useState } from 'react';
import { X, Plus, UserCheck } from 'lucide-react';
import { Grade, UserProfile } from '../../types';
import { soundEffects } from '../../services/soundEffects';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string, grade: Grade, avatar: string) => void;
}

const AVATAR_OPTIONS = [
  { id: 'cat', emoji: '🐱', label: 'Mèo con' },
  { id: 'bear', emoji: '🐻', label: 'Gấu nâu' },
  { id: 'rabbit', emoji: '🐰', label: 'Thỏ trắng' },
  { id: 'lion', emoji: '🦁', label: 'Sư tử' },
  { id: 'dog', emoji: '🐶', label: 'Cún cưng' },
  { id: 'penguin', emoji: '🐧', label: 'Cánh cụt' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState<Grade>(2);
  const [newAvatar, setNewAvatar] = useState('cat');

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    soundEffects.playClick();
    onCreateProfile(newName, newGrade, newAvatar);
    setIsCreating(false);
    setNewName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="profile-manager-dialog"
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-blue-200 relative text-slate-800"
      >
        <button
          id="close-profile-modal-btn"
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
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl">
            👧
          </div>
          <div>
            <h3 className="font-kid font-bold text-xl text-slate-800">Hồ sơ của bé</h3>
            <p className="text-xs text-slate-500">Mỗi bé có dữ liệu luyện tập và tiến bộ riêng</p>
          </div>
        </div>

        {!isCreating ? (
          <div>
            {/* List of profiles */}
            <div className="space-y-2.5 mb-5 max-h-60 overflow-y-auto pr-1">
              {profiles.map((p) => {
                const isActive = p.id === activeProfileId;
                const emoji = AVATAR_OPTIONS.find((a) => a.id === p.avatar)?.emoji || '🧒';

                return (
                  <div
                    key={p.id}
                    id={`profile-card-${p.id}`}
                    onClick={() => {
                      soundEffects.playClick();
                      onSelectProfile(p.id);
                      onClose();
                    }}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50/80 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-xs">
                        {emoji}
                      </div>
                      <div>
                        <div className="font-kid font-bold text-base text-slate-800 flex items-center gap-1.5">
                          {p.name}
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                            Lớp {p.grade}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Đã làm {p.totalExercises} bài • {p.xp} XP • Chuỗi {p.currentStreak} ngày
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <div className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-white px-2.5 py-1 rounded-xl shadow-xs border border-blue-100">
                        <UserCheck className="w-4 h-4" /> Đang chọn
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              id="add-profile-btn"
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setIsCreating(true);
              }}
              className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50/50 text-blue-700 font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm hồ sơ bé mới</span>
            </button>
          </div>
        ) : (
          /* Create Profile Form */
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên của bé:
              </label>
              <input
                id="new-profile-name-input"
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ví dụ: Bé An, Bé Minh..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:border-blue-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lớp học:
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {([1, 2, 3, 4, 5] as Grade[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setNewGrade(g);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      newGrade === g
                        ? 'bg-blue-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Lớp {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chọn linh vật đại diện:
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setNewAvatar(a.id);
                    }}
                    className={`w-11 h-11 rounded-2xl text-xl flex items-center justify-center transition-all border-2 ${
                      newAvatar === a.id
                        ? 'border-blue-500 bg-blue-50 scale-110 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                    title={a.label}
                  >
                    {a.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Quay lại
              </button>
              <button
                id="submit-create-profile-btn"
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Tạo hồ sơ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
