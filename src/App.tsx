import React, { useState, useEffect } from 'react';
import {
  AudioSettings,
  Difficulty,
  ExerciseHistoryRecord,
  Grade,
  SentenceEvaluation,
  SpellingExercise,
  UserProfile,
  WeakWordRecord,
} from './types';
import { storageService } from './services/storageService';
import { soundEffects } from './services/soundEffects';
import { speechService } from './services/speechService';
import { Header } from './components/common/Header';
import { HomeScreen } from './components/home/HomeScreen';
import { SpellingArena } from './components/exercise/SpellingArena';
import { CompletionScreen } from './components/exercise/CompletionScreen';
import { SetupModal } from './components/exercise/SetupModal';
import { ExerciseLibrary } from './components/library/ExerciseLibrary';
import { ExerciseCreator } from './components/library/ExerciseCreator';
import { WeakWordsPractice } from './components/weakwords/WeakWordsPractice';
import { AchievementsScreen } from './components/achievements/AchievementsScreen';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { AudioSettingsModal } from './components/common/AudioSettingsModal';
import { ProfileModal } from './components/common/ProfileModal';

export default function App() {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<string>('home');

  // Core data states
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [weakWords, setWeakWords] = useState<WeakWordRecord[]>([]);
  const [history, setHistory] = useState<ExerciseHistoryRecord[]>([]);
  const [exercises, setExercises] = useState<SpellingExercise[]>([]);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(storageService.getAudioSettings());
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isExerciseCreatorOpen, setIsExerciseCreatorOpen] = useState(false);

  // Active Practice Session State
  const [activeExercise, setActiveExercise] = useState<SpellingExercise | null>(null);
  const [activeSentences, setActiveSentences] = useState<string[]>([]);
  const [completedEvaluations, setCompletedEvaluations] = useState<SentenceEvaluation[]>([]);
  const [completedScore, setCompletedScore] = useState(0);

  // Initial data loading
  useEffect(() => {
    const loadedProfiles = storageService.getProfiles();
    const loadedActive = storageService.getActiveProfile();
    const loadedWeak = storageService.getWeakWords(loadedActive.id);
    const loadedHistory = storageService.getHistory(loadedActive.id);
    const loadedExercises = storageService.getAllExercises();
    const loadedAudio = storageService.getAudioSettings();

    setProfiles(loadedProfiles);
    setActiveProfile(loadedActive);
    setWeakWords(loadedWeak);
    setHistory(loadedHistory);
    setExercises(loadedExercises);
    setAudioSettings(loadedAudio);
  }, []);

  // Reload data whenever active profile changes
  const handleSelectProfile = (profileId: string) => {
    storageService.setActiveProfileId(profileId);
    const p = storageService.getActiveProfile();
    setActiveProfile(p);
    setWeakWords(storageService.getWeakWords(p.id));
    setHistory(storageService.getHistory(p.id));
  };

  const handleCreateProfile = (name: string, grade: Grade, avatar: string) => {
    const newP = storageService.createProfile(name, grade, avatar);
    setProfiles(storageService.getProfiles());
    setActiveProfile(newP);
    setWeakWords(storageService.getWeakWords(newP.id));
    setHistory(storageService.getHistory(newP.id));
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    soundEffects.toggleSound(next);
    setSoundEnabled(next);
  };

  const handleSaveAudioSettings = (newSettings: AudioSettings) => {
    storageService.saveAudioSettings(newSettings);
    setAudioSettings(newSettings);
  };

  // Start an exercise
  const handleStartExercise = (exercise: SpellingExercise, maxCount?: number) => {
    let sents = [...exercise.sentences];
    if (maxCount && maxCount < sents.length) {
      sents = sents.slice(0, maxCount);
    }
    setActiveExercise(exercise);
    setActiveSentences(sents);
    setCurrentScreen('arena');
  };

  // Start a custom practice from SetupModal (Grade, Diff, Count)
  const handleStartCustomPractice = (grade: Grade, difficulty: Difficulty, sentenceCount: number) => {
    const gradeMatches = exercises.filter((e) => e.grade === grade);
    const diffMatches = gradeMatches.filter((e) => e.difficulty === difficulty);
    const sourcePool = diffMatches.length > 0 ? diffMatches : gradeMatches.length > 0 ? gradeMatches : exercises;

    // Pick an exercise or assemble sentences
    const picked = sourcePool[Math.floor(Math.random() * sourcePool.length)];
    let pooledSentences: string[] = [];
    sourcePool.forEach((e) => pooledSentences.push(...e.sentences));

    // Shuffle sentences for variety
    const shuffled = [...pooledSentences].sort(() => 0.5 - Math.random());
    const finalSentences = shuffled.slice(0, sentenceCount);

    const generatedEx: SpellingExercise = {
      id: `session-${Date.now()}`,
      title: `Bài Luyện Lớp ${grade} (${sentenceCount} câu)`,
      grade,
      difficulty,
      topic: picked?.topic || 'Tổng hợp',
      icon: picked?.icon || '🎮',
      sentences: finalSentences.length > 0 ? finalSentences : picked?.sentences || ['Bé đi học rất vui.'],
    };

    setActiveExercise(generatedEx);
    setActiveSentences(generatedEx.sentences);
    setCurrentScreen('arena');
  };

  // Record weak word
  const handleRecordWeakWord = (
    expected: string,
    actual: string,
    errorType: WeakWordRecord['errorType'],
    grade: Grade
  ) => {
    if (!activeProfile) return;
    storageService.recordWeakWord(expected, actual, errorType, grade);
    setWeakWords(storageService.getWeakWords(activeProfile.id));
  };

  // Remove weak word when mastered
  const handleRemoveWeakWord = (id: string) => {
    if (!activeProfile) return;
    storageService.removeWeakWord(id);
    setWeakWords(storageService.getWeakWords(activeProfile.id));
  };

  // Award XP
  const handleAwardXp = (amount: number) => {
    if (!activeProfile) return;
    const newXp = (activeProfile.xp || 0) + amount;
    storageService.updateActiveProfile({ xp: newXp });
    setActiveProfile(storageService.getActiveProfile());
    setProfiles(storageService.getProfiles());
  };

  // Exercise completed handler
  const handleFinishSession = (evaluations: SentenceEvaluation[], score: number) => {
    if (!activeProfile || !activeExercise) return;

    let wordsTotal = 0;
    let wordsCorrect = 0;
    let sentencesCorrect = 0;

    evaluations.forEach((ev) => {
      if (ev.isFullyCorrect) sentencesCorrect += 1;
      ev.tokenDiffs.forEach((t) => {
        if (t.status === 'correct') {
          wordsTotal += 1;
          wordsCorrect += 1;
        } else if (t.status === 'incorrect' || t.status === 'missing') {
          wordsTotal += 1;
        }
      });
    });

    const accuracy = Math.round((wordsCorrect / Math.max(1, wordsTotal)) * 100);
    const calculatedStars: 1 | 2 | 3 = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;

    const newRecord: ExerciseHistoryRecord = {
      id: `hist-${Date.now()}`,
      exerciseId: activeExercise.id,
      exerciseTitle: activeExercise.title,
      grade: activeExercise.grade,
      completedAt: new Date().toLocaleDateString('vi-VN'),
      score,
      maxScore: evaluations.length * 10,
      totalSentences: evaluations.length,
      correctSentences: sentencesCorrect,
      totalWords: wordsTotal,
      correctWords: wordsCorrect,
      stars: calculatedStars,
    };

    storageService.addHistory(newRecord, activeProfile.id);
    setHistory(storageService.getHistory(activeProfile.id));

    // Update Profile statistics & Badges
    const nextTotalExercises = (activeProfile.totalExercises || 0) + 1;
    const nextWords = (activeProfile.totalWordsPracticed || 0) + wordsTotal;
    const nextCorrectWords = (activeProfile.totalCorrectWords || 0) + wordsCorrect;
    const nextHighest = Math.max(activeProfile.highestScore || 0, score);
    const nextXp = (activeProfile.xp || 0) + score;

    // Check Badge unlocks
    const currentBadges = new Set(activeProfile.unlockedBadges || []);
    if (nextTotalExercises >= 1) currentBadges.add('badge-first');
    if (nextTotalExercises >= 5) currentBadges.add('badge-5-lessons');
    if (score >= 100) currentBadges.add('badge-perfect-100');
    if (nextXp >= 500) currentBadges.add('badge-grade-master');

    const updatedProfileUpdates: Partial<UserProfile> = {
      totalExercises: nextTotalExercises,
      totalWordsPracticed: nextWords,
      totalCorrectWords: nextCorrectWords,
      highestScore: nextHighest,
      xp: nextXp,
      unlockedBadges: Array.from(currentBadges),
    };

    storageService.updateActiveProfile(updatedProfileUpdates);
    setActiveProfile(storageService.getActiveProfile());
    setProfiles(storageService.getProfiles());

    setCompletedEvaluations(evaluations);
    setCompletedScore(score);
    setCurrentScreen('completed');
  };

  // Custom Exercise Saved
  const handleSaveCreatedExercise = (newEx: SpellingExercise) => {
    storageService.saveCustomExercise(newEx);
    setExercises(storageService.getAllExercises());
  };

  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-amber-50/40 flex items-center justify-center p-4">
        <div className="text-center font-kid font-bold text-amber-900 text-lg">
          Đang khởi động Bé Vui Học Chính Tả... 🎒
        </div>
      </div>
    );
  }

  // Recommended lesson for active grade
  const gradeLessons = exercises.filter((e) => e.grade === activeProfile.grade);
  const recommendedLesson = gradeLessons[0] || exercises[0];

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-amber-50/50 via-white to-orange-50/30 text-slate-800 font-sans selection:bg-amber-200">
      {/* Global Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={(s) => {
          speechService.stop();
          setCurrentScreen(s);
        }}
        activeProfile={activeProfile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Screen Body */}
      <main className="flex-1 pb-16">
        {currentScreen === 'home' && (
          <HomeScreen
            profile={activeProfile}
            weakWords={weakWords}
            onStartPractice={() => setIsSetupModalOpen(true)}
            onNavigate={(s) => setCurrentScreen(s)}
            onSelectExercise={(ex) => handleStartExercise(ex)}
            recommendedExercise={recommendedLesson}
          />
        )}

        {currentScreen === 'arena' && activeExercise && (
          <SpellingArena
            exercise={activeExercise}
            sentences={activeSentences}
            audioSettings={audioSettings}
            onFinishSession={handleFinishSession}
            onQuit={() => setCurrentScreen('home')}
            onRecordWeakWord={handleRecordWeakWord}
          />
        )}

        {currentScreen === 'completed' && activeExercise && (
          <CompletionScreen
            exercise={activeExercise}
            evaluations={completedEvaluations}
            totalScore={completedScore}
            onRetryExercise={() => handleStartExercise(activeExercise)}
            onGoHome={() => setCurrentScreen('home')}
            onPracticeWeakWords={() => setCurrentScreen('weak-words')}
            allWeakWords={weakWords}
          />
        )}

        {currentScreen === 'library' && (
          <ExerciseLibrary
            exercises={exercises}
            onSelectExercise={(ex) => handleStartExercise(ex)}
            onOpenCreator={() => setIsExerciseCreatorOpen(true)}
            activeGrade={activeProfile.grade}
          />
        )}

        {currentScreen === 'weak-words' && (
          <WeakWordsPractice
            weakWords={weakWords}
            onRemoveWord={handleRemoveWeakWord}
            onAwardXp={handleAwardXp}
            audioSettings={audioSettings}
            onStartExerciseWithWords={(words) => {
              const customEx: SpellingExercise = {
                id: `custom-weak-${Date.now()}`,
                title: 'Luyện tập các từ con từng viết nhầm',
                grade: activeProfile.grade,
                difficulty: 'medium',
                topic: 'Luyện từ sai',
                icon: '🎯',
                sentences: words.map((w) => `Bé hãy viết từ ${w} cho thật chuẩn nhé.`),
              };
              handleStartExercise(customEx);
            }}
          />
        )}

        {currentScreen === 'achievements' && (
          <AchievementsScreen profile={activeProfile} />
        )}

        {currentScreen === 'parent' && (
          <ParentDashboard
            profile={activeProfile}
            allProfiles={profiles}
            onSwitchProfile={handleSelectProfile}
            weakWords={weakWords}
            history={history}
            onStartCustomExercise={(ex) => handleStartExercise(ex)}
          />
        )}
      </main>

      {/* Modals */}
      <SetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        defaultGrade={activeProfile.grade}
        onStartCustomPractice={handleStartCustomPractice}
        onSelectSpecificExercise={(ex) => handleStartExercise(ex)}
        availableExercises={exercises}
      />

      <AudioSettingsModal
        isOpen={isAudioSettingsOpen}
        onClose={() => setIsAudioSettingsOpen(false)}
        settings={audioSettings}
        onSave={handleSaveAudioSettings}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfile.id}
        onSelectProfile={handleSelectProfile}
        onCreateProfile={handleCreateProfile}
      />

      <ExerciseCreator
        isOpen={isExerciseCreatorOpen}
        onClose={() => setIsExerciseCreatorOpen(false)}
        onSaveExercise={handleSaveCreatedExercise}
      />
    </div>
  );
}
