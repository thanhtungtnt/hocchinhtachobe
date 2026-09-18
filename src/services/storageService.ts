import { AudioSettings, ExerciseHistoryRecord, SpellingExercise, UserProfile, WeakWordRecord } from '../types';
import { DEFAULT_EXERCISES } from '../data/sampleExercises';

const STORAGE_KEYS = {
  PROFILES: 'be_vui_chinh_ta_profiles_v1',
  ACTIVE_PROFILE_ID: 'be_vui_chinh_ta_active_profile_id_v1',
  CUSTOM_EXERCISES: 'be_vui_chinh_ta_custom_exercises_v1',
  WEAK_WORDS: 'be_vui_chinh_ta_weak_words_v1',
  HISTORY: 'be_vui_chinh_ta_history_v1',
  AUDIO_SETTINGS: 'be_vui_chinh_ta_audio_settings_v1',
};

// Default profile on first launch
const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'profile-an',
    name: 'Bé An',
    grade: 2,
    avatar: 'cat',
    totalExercises: 3,
    totalWordsPracticed: 28,
    totalCorrectWords: 26,
    highestScore: 95,
    currentStreak: 2,
    lastActiveDate: new Date().toISOString().split('T')[0],
    xp: 280,
    unlockedBadges: ['badge-first'],
  },
  {
    id: 'profile-minh',
    name: 'Bé Minh',
    grade: 4,
    avatar: 'bear',
    totalExercises: 1,
    totalWordsPracticed: 10,
    totalCorrectWords: 9,
    highestScore: 85,
    currentStreak: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    xp: 90,
    unlockedBadges: ['badge-first'],
  },
];

// Initial weak words demo to show parent analytics immediately
const DEFAULT_WEAK_WORDS: WeakWordRecord[] = [
  {
    id: 'ww-1',
    word: 'líu',
    wrongSpellings: ['liếu'],
    count: 3,
    lastEncountered: new Date().toISOString(),
    errorType: 'vowel_rhyme',
    grade: 2,
  },
  {
    id: 'ww-2',
    word: 'trời',
    wrongSpellings: ['chời'],
    count: 2,
    lastEncountered: new Date().toISOString(),
    errorType: 'initial_consonant',
    grade: 2,
  },
  {
    id: 'ww-3',
    word: 'sông',
    wrongSpellings: ['xông'],
    count: 1,
    lastEncountered: new Date().toISOString(),
    errorType: 'initial_consonant',
    grade: 2,
  },
  {
    id: 'ww-4',
    word: 'sữa',
    wrongSpellings: ['sửa'],
    count: 2,
    lastEncountered: new Date().toISOString(),
    errorType: 'tone_mark',
    grade: 2,
  },
];

const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  rate: 0.85,
  voiceURI: '',
  autoRepeat: false,
  repeatDelay: 1.5,
};

class StorageService {
  // Profiles
  public getProfiles(): UserProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (!data) {
        this.saveProfiles(DEFAULT_PROFILES);
        return DEFAULT_PROFILES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_PROFILES;
    }
  }

  public saveProfiles(profiles: UserProfile[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    } catch (e) {
      console.error('Storage save profiles error', e);
    }
  }

  public getActiveProfileId(): string {
    try {
      const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
      if (id) return id;
      const profiles = this.getProfiles();
      const firstId = profiles[0]?.id || 'profile-an';
      this.setActiveProfileId(firstId);
      return firstId;
    } catch {
      return 'profile-an';
    }
  }

  public setActiveProfileId(id: string) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);
    } catch (e) {
      console.error('Storage set active profile error', e);
    }
  }

  public getActiveProfile(): UserProfile {
    const profiles = this.getProfiles();
    const activeId = this.getActiveProfileId();
    const found = profiles.find((p) => p.id === activeId);
    return found || profiles[0] || DEFAULT_PROFILES[0];
  }

  public updateActiveProfile(updates: Partial<UserProfile>) {
    const profiles = this.getProfiles();
    const activeId = this.getActiveProfileId();
    const index = profiles.findIndex((p) => p.id === activeId);
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...updates };
      this.saveProfiles(profiles);
    }
  }

  public createProfile(name: string, grade: 1 | 2 | 3 | 4 | 5, avatar: string): UserProfile {
    const profiles = this.getProfiles();
    const newProfile: UserProfile = {
      id: `profile-${Date.now()}`,
      name: name.trim(),
      grade,
      avatar,
      totalExercises: 0,
      totalWordsPracticed: 0,
      totalCorrectWords: 0,
      highestScore: 0,
      currentStreak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      xp: 0,
      unlockedBadges: [],
    };
    profiles.push(newProfile);
    this.saveProfiles(profiles);
    this.setActiveProfileId(newProfile.id);
    return newProfile;
  }

  // Custom Exercises (Created by parents or teachers)
  public getCustomExercises(): SpellingExercise[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public saveCustomExercise(exercise: SpellingExercise) {
    const list = this.getCustomExercises();
    const existingIdx = list.findIndex((e) => e.id === exercise.id);
    if (existingIdx !== -1) {
      list[existingIdx] = exercise;
    } else {
      list.unshift(exercise);
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(list));
  }

  public getAllExercises(): SpellingExercise[] {
    const custom = this.getCustomExercises();
    return [...custom, ...DEFAULT_EXERCISES];
  }

  // Weak Words tracking (key: profileId)
  public getWeakWords(profileId?: string): WeakWordRecord[] {
    const pid = profileId || this.getActiveProfileId();
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.WEAK_WORDS}_${pid}`);
      if (!raw) {
        if (pid === 'profile-an') {
          this.saveWeakWords(DEFAULT_WEAK_WORDS, pid);
          return DEFAULT_WEAK_WORDS;
        }
        return [];
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveWeakWords(words: WeakWordRecord[], profileId?: string) {
    const pid = profileId || this.getActiveProfileId();
    try {
      localStorage.setItem(`${STORAGE_KEYS.WEAK_WORDS}_${pid}`, JSON.stringify(words));
    } catch (e) {
      console.error('Storage save weak words error', e);
    }
  }

  public recordWeakWord(expected: string, actual: string, errorType: WeakWordRecord['errorType'], grade: 1 | 2 | 3 | 4 | 5) {
    const words = this.getWeakWords();
    const cleanExp = expected.toLowerCase().trim();
    const cleanAct = actual.toLowerCase().trim();

    const existingIdx = words.findIndex((w) => w.word.toLowerCase() === cleanExp);
    if (existingIdx !== -1) {
      const item = words[existingIdx];
      item.count += 1;
      item.lastEncountered = new Date().toISOString();
      if (!item.wrongSpellings.includes(cleanAct) && cleanAct) {
        item.wrongSpellings.push(cleanAct);
      }
    } else {
      words.unshift({
        id: `ww-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        word: expected.trim(),
        wrongSpellings: cleanAct ? [cleanAct] : [],
        count: 1,
        lastEncountered: new Date().toISOString(),
        errorType,
        grade,
      });
    }
    this.saveWeakWords(words);
  }

  public removeWeakWord(id: string) {
    const words = this.getWeakWords();
    const filtered = words.filter((w) => w.id !== id);
    this.saveWeakWords(filtered);
  }

  // History tracking
  public getHistory(profileId?: string): ExerciseHistoryRecord[] {
    const pid = profileId || this.getActiveProfileId();
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.HISTORY}_${pid}`);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public addHistory(record: ExerciseHistoryRecord, profileId?: string) {
    const pid = profileId || this.getActiveProfileId();
    const history = this.getHistory(pid);
    history.unshift(record);
    try {
      localStorage.setItem(`${STORAGE_KEYS.HISTORY}_${pid}`, JSON.stringify(history));
    } catch (e) {
      console.error('Storage save history error', e);
    }
  }

  // Audio Settings
  public getAudioSettings(): AudioSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUDIO_SETTINGS);
      if (!raw) return DEFAULT_AUDIO_SETTINGS;
      return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_AUDIO_SETTINGS;
    }
  }

  public saveAudioSettings(settings: AudioSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIO_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Storage save audio settings error', e);
    }
  }
}

export const storageService = new StorageService();
