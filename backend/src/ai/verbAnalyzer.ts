import nlp from 'compromise';
import weakVerbsDict from './dictionaries/weakVerbs.json';

const dict = weakVerbsDict as Record<string, string>;
const weakVerbsList = Object.keys(dict);

export interface VerbSuggestion {
  originalText: string;
  suggestion: string;
  type: 'weak-verb';
  message: string;
}

/**
 * Analyzes a text string for weak verbs and proposes stronger alternatives. 
 */
export const analyzeVerbs = (text: string): VerbSuggestion[] => {
  if (!text || text.trim() === '') return [];

  const suggestions: VerbSuggestion[] = [];
  const doc = nlp(text.toLowerCase());

  // Check against our specific dictionary of phrases/words
  weakVerbsList.forEach(weakVerb => {
    // compromise exact match search
    if (doc.match(weakVerb).found) {
      const strongAlternative = dict[weakVerb];
      suggestions.push({
        originalText: weakVerb,
        suggestion: strongAlternative,
        type: 'weak-verb',
        message: `Consider replacing the weak verb "${weakVerb}" with "${strongAlternative}".`
      });
    }
  });

  return suggestions;
};
