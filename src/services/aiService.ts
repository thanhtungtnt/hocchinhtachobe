import { SpellingExercise, WeakWordRecord } from '../types';

export interface AIAnalysisResult {
  summary: string;
  topWeakPhonics: string[];
  parentAdvice: string;
  encouragementForChild: string;
}

export interface AIGenerateExerciseParams {
  grade: 1 | 2 | 3 | 4 | 5;
  targetSounds?: string;
  count?: number;
  topic?: string;
}

class AIService {
  // Analyze child's error history
  public async analyzeProfile(
    childName: string,
    grade: number,
    weakWords: WeakWordRecord[],
    errorStats: Record<string, number>
  ): Promise<AIAnalysisResult> {
    try {
      const response = await fetch('/api/ai/analyze-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childName, grade, weakWords, errorStats }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.summary) return data;
      }
    } catch {
      // Fallback to local rule-based analysis
    }

    return this.generateFallbackAnalysis(childName, weakWords, errorStats);
  }

  // Generate personalized exercises targeting child's weak sounds
  public async generateExercise(params: AIGenerateExerciseParams): Promise<SpellingExercise> {
    try {
      const response = await fetch('/api/ai/generate-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.sentences && Array.isArray(data.sentences) && data.sentences.length > 0) {
          return {
            id: `ai-gen-${Date.now()}`,
            title: data.title || `Bài luyện theo âm yếu Lớp ${params.grade}`,
            grade: params.grade,
            difficulty: 'medium',
            topic: params.topic || 'Luyện âm trọng tâm',
            icon: '✨',
            sentences: data.sentences,
            isCustom: true,
            author: 'AI Trợ lý học tập',
            createdAt: new Date().toISOString(),
          };
        }
      }
    } catch {
      // Fallback
    }

    return this.generateFallbackExercise(params);
  }

  // Smart pedagogical rule-based fallback
  private generateFallbackAnalysis(
    childName: string,
    weakWords: WeakWordRecord[],
    errorStats: Record<string, number>
  ): AIAnalysisResult {
    const totalErrors = weakWords.reduce((sum, w) => sum + w.count, 0);

    const phonics: string[] = [];
    if (errorStats.initial_consonant) {
      phonics.push('Phân biệt các phụ âm đầu dễ lẫn: s/x, tr/ch, l/n');
    }
    if (errorStats.tone_mark) {
      phonics.push('Phân biệt dấu hỏi (?) và dấu ngã (~)');
    }
    if (errorStats.vowel_rhyme) {
      phonics.push('Rèn luyện các vần có âm đệm và âm cuối (iêu/iu, an/ang)');
    }
    if (phonics.length === 0) {
      phonics.push('Chính tả cơ bản và chữ cái đầu câu');
    }

    return {
      summary: `${childName || 'Bé'} đã rất tích cực luyện tập với ${totalErrors > 0 ? totalErrors + ' lượt cần lưu ý' : 'kết quả rất tốt'}. Bé có phản xạ nghe nhanh và luôn nỗ lực trong từng câu viết!`,
      topWeakPhonics: phonics,
      parentAdvice: `Phụ huynh nên dành 10-15 phút mỗi ngày cùng ${childName || 'bé'} nghe lại các từ hay nhầm lẫn. Khi đọc, bố mẹ có thể phát âm chậm và rõ khẩu hình môi để bé dễ dàng ghi nhớ.`,
      encouragementForChild: `Bé ${childName || 'cưng'} làm giỏi lắm! Đôi tai của con đang ngày càng thính như chú thỏ thông minh vậy đó!`,
    };
  }

  private generateFallbackExercise(params: AIGenerateExerciseParams): SpellingExercise {
    const grade = params.grade;
    const pool = [
      'Mặt trời buổi sớm tỏa ánh nắng sưởi ấm khắp sân trường.',
      'Dòng sông xanh biếc uốn lượn hiền hòa qua xóm nhỏ làng em.',
      'Những chú chim xinh xắn ríu rít ca vang trên cành cây cao.',
      'Bé An chăm chỉ đọc sách và viết bài ngay ngắn sạch đẹp.',
      'Mùa xuân đến, cây cối đâm chồi nảy lộc xanh tươi mơn mởn.',
      'Chúng em cùng nhau chơi nhảy dây vui vẻ dưới bóng mát râm ran.',
    ];

    return {
      id: `ai-gen-${Date.now()}`,
      title: `Bài Luyện Đặc Biệt Cho Bé (Lớp ${grade})`,
      grade,
      difficulty: 'medium',
      topic: 'Luyện tập cá nhân hóa',
      icon: '🎯',
      sentences: pool.slice(0, params.count || 5),
      isCustom: true,
      author: 'Trợ lý học tập thông minh',
      createdAt: new Date().toISOString(),
    };
  }
}

export const aiService = new AIService();
