import nlp from 'compromise';

// Common weak action verbs
const WEAK_VERBS = [
  'did', 'made', 'worked', 'helped', 'was', 'were', 'got', 'put', 'took', 'saw', 'used', 'tried'
];

type Suggestion = {
  original: string;
  suggestion: string;
  reason: string;
};

export const analyzeDescription = (text: string): Suggestion[] => {
  const doc = nlp(text);
  const suggestions: Suggestion[] = [];
  
  // Find verbs
  const verbs = doc.verbs().out('array');
  
  verbs.forEach((verbText: string) => {
    const v = verbText.toLowerCase().trim();
    if (WEAK_VERBS.includes(v)) {
      suggestions.push({
        original: v,
        suggestion: getStrongerVerb(v),
        reason: 'Consider using a stronger action verb for better impact.'
      });
    }
  });

  // Suggest active voice if "was <verb>ed" or "were <verb>ed" is detected
  const passives = doc.match('(was|were) #PastTense').out('array');
  passives.forEach((passive: string) => {
    suggestions.push({
      original: passive,
      suggestion: 'Rephrase to use active voice (e.g., "Developed" instead of "Was developed")',
      reason: 'Active voice sounds more confident and direct.'
    });
  });

  return suggestions;
};

const getStrongerVerb = (weakVerb: string): string => {
  switch (weakVerb) {
    case 'did': return 'Executed / Accomplished';
    case 'made': return 'Developed / Created / Engineered';
    case 'worked': return 'Collaborated / Facilitated';
    case 'helped': return 'Assisted / Supported / Guided';
    case 'used': return 'Leveraged / Utilized';
    default: return 'Implemented / Achieved';
  }
};
