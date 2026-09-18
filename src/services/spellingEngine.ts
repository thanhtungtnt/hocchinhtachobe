import { ErrorType, SentenceEvaluation, SpellingError, TokenDiff } from '../types';

// Vietnamese Tone and Vowel maps for precise linguistic categorization
const TONE_SIGNS: Record<string, string> = {
  // ngang (không dấu)
  a: 'ngang', ă: 'ngang', â: 'ngang', e: 'ngang', ê: 'ngang', i: 'ngang', o: 'ngang', ô: 'ngang', ơ: 'ngang', u: 'ngang', ư: 'ngang', y: 'ngang',
  // huyền
  à: 'huyền', ằ: 'huyền', ầ: 'huyền', è: 'huyền', ề: 'huyền', ì: 'huyền', ò: 'huyền', ồ: 'huyền', ờ: 'huyền', ù: 'huyền', ừ: 'huyền', ỳ: 'huyền',
  // sắc
  á: 'sắc', ắ: 'sắc', ấ: 'sắc', é: 'sắc', ế: 'sắc', í: 'sắc', ó: 'sắc', tố: 'sắc', ố: 'sắc', ớ: 'sắc', ú: 'sắc', ứ: 'sắc', ý: 'sắc',
  // hỏi
  ả: 'hỏi', ẳ: 'hỏi', ẩ: 'hỏi', ẻ: 'hỏi', ể: 'hỏi', ỉ: 'hỏi', ỏ: 'hỏi', ổ: 'hỏi', ở: 'hỏi', ủ: 'hỏi', ử: 'hỏi', ỷ: 'hỏi',
  // ngã
  ã: 'ngã', ẵ: 'ngã', ẫ: 'ngã', ẽ: 'ngã', ễ: 'ngã', ĩ: 'ngã', õ: 'ngã', ỗ: 'ngã', ỡ: 'ngã', ũ: 'ngã', ữ: 'ngã', ỹ: 'ngã',
  // nặng
  ạ: 'nặng', ặ: 'nặng', ậ: 'nặng', ẹ: 'nặng', ệ: 'nặng', ị: 'nặng', ọ: 'nặng', ộ: 'nặng', ợ: 'nặng', ụ: 'nặng', ự: 'nặng', ỵ: 'nặng',
};

// Base vowel strip (remove tone mark but preserve vowel base character like ă, â, ê, ô, ơ, ư)
const BASE_VOWEL_MAP: Record<string, string> = {
  à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a',
  ằ: 'ă', ắ: 'ă', ẳ: 'ă', ẵ: 'ă', ặ: 'ă',
  ầ: 'â', ấ: 'â', ẩ: 'â', ẫ: 'â', ậ: 'â',
  è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
  ề: 'ê', ế: 'ê', ể: 'ê', ễ: 'ê', ệ: 'ê',
  ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
  ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
  ồ: 'ô', ố: 'ô', ổ: 'ô', ỗ: 'ô', ộ: 'ô',
  ờ: 'ơ', ớ: 'ơ', ở: 'ơ', ỡ: 'ơ', ợ: 'ơ',
  ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
  ừ: 'ư', ứ: 'ư', ử: 'ư', ữ: 'ư', ự: 'ư',
  ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
};

// Extract tone mark name of a word
function detectTone(word: string): string {
  for (const char of word.toLowerCase()) {
    if (TONE_SIGNS[char]) return TONE_SIGNS[char];
  }
  return 'ngang';
}

// Strip tone mark from a word while preserving base Vietnamese vowels
function stripTone(word: string): string {
  return word
    .toLowerCase()
    .split('')
    .map((c) => BASE_VOWEL_MAP[c] || c)
    .join('');
}

// Strip punctuation from word for core comparison
export function cleanWord(raw: string): string {
  return raw.replace(/^[.,/#!$%^&*;:{}=\-_`~()"'“”…]+|[.,/#!$%^&*;:{}=\-_`~()"'“”…]+$/g, '').trim();
}

// Standard Levenshtein Distance
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return d[m][n];
}

// Extract initial consonant
function getInitialConsonant(word: string): string {
  const w = word.toLowerCase();
  const initials = ['ngh', 'ng', 'tr', 'th', 'ch', 'ph', 'nh', 'kh', 'gh', 'gi', 'qu', 'b', 'c', 'd', 'đ', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'x'];
  for (const init of initials) {
    if (w.startsWith(init)) return init;
  }
  return '';
}

// Analyze specific error type between expected word and actual word
export function classifyWordError(expectedRaw: string, actualRaw: string, pos: number): SpellingError {
  const exp = cleanWord(expectedRaw);
  const act = cleanWord(actualRaw);

  const expLower = exp.toLowerCase();
  const actLower = act.toLowerCase();

  // 1. Capitalization check
  if (expLower === actLower && exp !== act) {
    return {
      expected: expectedRaw,
      actual: actualRaw,
      type: 'capitalization',
      position: pos,
      explanation: `Viết hoa chưa chính xác: "${actualRaw}" → "${expectedRaw}"`,
      friendlyTip: 'Con hãy chú ý viết hoa chữ cái đầu câu hoặc tên riêng nhé!',
    };
  }

  // 2. Initial consonant confusion (s/x, tr/ch, l/n, r/d/gi, c/k/q, ng/ngh)
  const expInit = getInitialConsonant(expLower);
  const actInit = getInitialConsonant(actLower);

  if (expInit && actInit && expInit !== actInit) {
    const expRest = expLower.slice(expInit.length);
    const actRest = actLower.slice(actInit.length);
    if (expRest === actRest || levenshteinDistance(expRest, actRest) <= 1) {
      let tip = `Con chú ý phân biệt phụ âm "${expInit.toUpperCase()}" và "${actInit.toUpperCase()}" nhé!`;
      if ((expInit === 's' && actInit === 'x') || (expInit === 'x' && actInit === 's')) {
        tip = `Từ này viết bằng "${expInit}", con nhớ phân biệt sờ (s) và ích (x) nha!`;
      } else if ((expInit === 'tr' && actInit === 'ch') || (expInit === 'ch' && actInit === 'tr')) {
        tip = `Từ này viết bằng "${expInit}", con nhớ uốn lưỡi khi phát âm "tr" nhé!`;
      } else if ((expInit === 'l' && actInit === 'n') || (expInit === 'n' && actInit === 'l')) {
        tip = `Con chú ý phân biệt âm "l" và "n" nhé!`;
      } else if (['r', 'd', 'gi'].includes(expInit) && ['r', 'd', 'gi'].includes(actInit)) {
        tip = `Từ này bắt đầu bằng "${expInit}", hãy để ý cách viết của r, d và gi nha!`;
      }
      return {
        expected: expectedRaw,
        actual: actualRaw,
        type: 'initial_consonant',
        position: pos,
        explanation: `Sai phụ âm đầu: "${actualRaw}" → "${expectedRaw}"`,
        friendlyTip: tip,
      };
    }
  }

  // 3. Tone Mark confusion (dấu hỏi, ngã, sắc, huyền, nặng, không dấu)
  const expTone = detectTone(expLower);
  const actTone = detectTone(actLower);
  const expStripped = stripTone(expLower);
  const actStripped = stripTone(actLower);

  if (expStripped === actStripped && expTone !== actTone) {
    let tip = `Con chú ý đặt đúng dấu thanh: từ này dùng dấu ${expTone}!`;
    if ((expTone === 'hỏi' && actTone === 'ngã') || (expTone === 'ngã' && actTone === 'hỏi')) {
      tip = `Từ này mang dấu ${expTone}. Con chú ý phân biệt dấu hỏi (?) và dấu ngã (~) nhé!`;
    }
    return {
      expected: expectedRaw,
      actual: actualRaw,
      type: 'tone_mark',
      position: pos,
      explanation: `Sai dấu thanh: dấu ${actTone} → dấu ${expTone}`,
      friendlyTip: tip,
    };
  }

  // 4. Missing or Extra letter
  if (expLower.includes(actLower) && expLower.length > actLower.length) {
    return {
      expected: expectedRaw,
      actual: actualRaw,
      type: 'missing_letter',
      position: pos,
      explanation: `Viết thiếu chữ cái: "${actualRaw}" → "${expectedRaw}"`,
      friendlyTip: `Con nhìn kỹ xem từ "${expectedRaw}" có những chữ cái nào nhé!`,
    };
  }

  if (actLower.includes(expLower) && actLower.length > expLower.length) {
    return {
      expected: expectedRaw,
      actual: actualRaw,
      type: 'extra_letter',
      position: pos,
      explanation: `Viết thừa chữ cái: "${actualRaw}" → "${expectedRaw}"`,
      friendlyTip: `Từ chuẩn là "${expectedRaw}", con hãy gõ gọn gàng hơn nhé!`,
    };
  }

  // 5. Vowel / Rhyme confusion (sai âm / vần, e.g. líu -> liếu, iu -> iêu, an -> ang)
  return {
    expected: expectedRaw,
    actual: actualRaw,
    type: 'vowel_rhyme',
    position: pos,
    explanation: `Sai vần/chính tả: "${actualRaw}" → "${expectedRaw}"`,
    friendlyTip: `Con hãy đọc lại vần của từ "${expectedRaw}" để viết chuẩn xác nhé!`,
  };
}

// Encouragement generator based on score
function getEncouragement(score: number, errorCount: number): string {
  if (score === 10) {
    const list = [
      '🎉 Xuất sắc! Con viết đúng từng từ rồi!',
      '🌟 Tuyệt vời lắm bé ơi, điểm 10 trọn vẹn!',
      '👏 Hoan hô! Đôi tai thính và đôi tay khéo quá!',
      '🏆 Siêu nhân chính tả đây rồi, con làm rất tốt!',
    ];
    return list[Math.floor(Math.random() * list.length)];
  }
  if (errorCount === 1) {
    return '💪 Gần chuẩn tuyệt đối rồi! Con chỉ nhầm 1 từ nhỏ thôi, cố lên nhé!';
  }
  if (errorCount === 2) {
    return '✨ Rất đáng khen! Con nghe tốt lắm, chỉ cần chú ý 2 từ nữa là điểm 10 rồi!';
  }
  return '🌱 Không sao cả, mình cùng nghe lại và luyện thêm từng từ nhé, bé làm được mà!';
}

// Tokenize sentence into array of word tokens preserving structure
function tokenizeSentence(sentence: string): string[] {
  return sentence.trim().split(/\s+/).filter(Boolean);
}

// Core Evaluation Engine aligning expected and user tokens
export function evaluateSpelling(expectedSentence: string, userSentence: string): SentenceEvaluation {
  const expectedTokens = tokenizeSentence(expectedSentence);
  const userTokens = tokenizeSentence(userSentence);

  if (userTokens.length === 0) {
    return {
      originalSentence: expectedSentence,
      userSentence,
      isFullyCorrect: false,
      score: 0,
      tokenDiffs: expectedTokens.map((t, idx) => ({
        expected: t,
        actual: '',
        status: 'missing',
        error: {
          expected: t,
          actual: '',
          type: 'missing_word',
          position: idx,
          explanation: `Chưa điền từ: "${t}"`,
          friendlyTip: 'Bé nhớ nhấn nút Nghe và gõ lại đầy đủ câu nhé!',
        },
      })),
      errors: [
        {
          expected: expectedSentence,
          actual: '',
          type: 'missing_word',
          position: 0,
          explanation: 'Bé chưa nhập câu trả lời',
          friendlyTip: 'Hãy nhấn nút Nghe để bắt đầu nghe câu văn nào!',
        },
      ],
      encouragement: 'Bé hãy bấm nút "Nghe câu" rồi gõ những gì con nghe được nhé!',
    };
  }

  // Dynamic programming alignment (Needleman-Wunsch / Sequence Alignment)
  // Scoring parameters
  const MATCH = 3;
  const MISMATCH = -1;
  const GAP = -2;

  const n = expectedTokens.length;
  const m = userTokens.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i * GAP;
  for (let j = 0; j <= m; j++) dp[0][j] = j * GAP;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const expClean = cleanWord(expectedTokens[i - 1]);
      const actClean = cleanWord(userTokens[j - 1]);

      let simScore = MISMATCH;
      if (expectedTokens[i - 1] === userTokens[j - 1]) {
        simScore = MATCH + 1; // exact match including casing & punctuation
      } else if (expClean.toLowerCase() === actClean.toLowerCase()) {
        simScore = MATCH; // exact word match
      } else {
        const dist = levenshteinDistance(expClean.toLowerCase(), actClean.toLowerCase());
        const maxLen = Math.max(expClean.length, actClean.length);
        if (dist <= 2 && dist / maxLen < 0.5) {
          simScore = 1; // close match (probably misspelling of same word)
        }
      }

      dp[i][j] = Math.max(
        dp[i - 1][j - 1] + simScore,
        dp[i - 1][j] + GAP,
        dp[i][j - 1] + GAP
      );
    }
  }

  // Backtrack to find optimal alignment
  let i = n;
  let j = m;
  const alignedPairs: Array<{ expected?: string; actual?: string; expIdx?: number }> = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const expClean = cleanWord(expectedTokens[i - 1]);
      const actClean = cleanWord(userTokens[j - 1]);
      let simScore = MISMATCH;
      if (expectedTokens[i - 1] === userTokens[j - 1]) {
        simScore = MATCH + 1;
      } else if (expClean.toLowerCase() === actClean.toLowerCase()) {
        simScore = MATCH;
      } else {
        const dist = levenshteinDistance(expClean.toLowerCase(), actClean.toLowerCase());
        const maxLen = Math.max(expClean.length, actClean.length);
        if (dist <= 2 && dist / maxLen < 0.5) {
          simScore = 1;
        }
      }

      if (dp[i][j] === dp[i - 1][j - 1] + simScore) {
        alignedPairs.unshift({ expected: expectedTokens[i - 1], actual: userTokens[j - 1], expIdx: i - 1 });
        i--;
        j--;
        continue;
      }
    }

    if (i > 0 && (j === 0 || dp[i][j] === dp[i - 1][j] + GAP)) {
      alignedPairs.unshift({ expected: expectedTokens[i - 1], actual: undefined, expIdx: i - 1 });
      i--;
    } else {
      alignedPairs.unshift({ expected: undefined, actual: userTokens[j - 1] });
      j--;
    }
  }

  // Generate TokenDiffs and Errors
  const tokenDiffs: TokenDiff[] = [];
  const errors: SpellingError[] = [];

  alignedPairs.forEach((pair, idx) => {
    if (pair.expected && pair.actual) {
      const expClean = cleanWord(pair.expected);
      const actClean = cleanWord(pair.actual);

      if (pair.expected === pair.actual) {
        tokenDiffs.push({
          expected: pair.expected,
          actual: pair.actual,
          status: 'correct',
        });
      } else if (expClean === actClean) {
        // Only punctuation or minor spacing discrepancy
        tokenDiffs.push({
          expected: pair.expected,
          actual: pair.actual,
          status: 'correct',
        });
      } else {
        const err = classifyWordError(pair.expected, pair.actual, idx);
        errors.push(err);
        tokenDiffs.push({
          expected: pair.expected,
          actual: pair.actual,
          status: 'incorrect',
          error: err,
        });
      }
    } else if (pair.expected && !pair.actual) {
      const err: SpellingError = {
        expected: pair.expected,
        actual: '',
        type: 'missing_word',
        position: idx,
        explanation: `Thiếu từ: "${pair.expected}"`,
        friendlyTip: `Câu còn thiếu từ "${pair.expected}", con nhớ nghe kỹ từng từ nhé!`,
      };
      errors.push(err);
      tokenDiffs.push({
        expected: pair.expected,
        actual: '',
        status: 'missing',
        error: err,
      });
    } else if (!pair.expected && pair.actual) {
      const err: SpellingError = {
        expected: '',
        actual: pair.actual,
        type: 'extra_word',
        position: idx,
        explanation: `Thừa từ: "${pair.actual}"`,
        friendlyTip: `Từ "${pair.actual}" không có trong câu đọc đâu con nha.`,
      };
      errors.push(err);
      tokenDiffs.push({
        expected: '',
        actual: pair.actual,
        status: 'extra',
        error: err,
      });
    }
  });

  const isFullyCorrect = errors.length === 0;

  // Game Scoring rules specified in prompt:
  // - Đúng hoàn toàn: +10 điểm
  // - Sai 1 từ: +7 điểm
  // - Sai 2 từ: +5 điểm
  // - Sai nhiều lỗi: +2 điểm
  // - Bỏ trống: 0 điểm
  let score = 2;
  if (isFullyCorrect) {
    score = 10;
  } else if (errors.length === 1) {
    score = 7;
  } else if (errors.length === 2) {
    score = 5;
  }

  return {
    originalSentence: expectedSentence,
    userSentence,
    isFullyCorrect,
    score,
    tokenDiffs,
    errors,
    encouragement: getEncouragement(score, errors.length),
  };
}
