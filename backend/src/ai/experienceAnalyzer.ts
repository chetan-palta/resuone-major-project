import nlp from 'compromise';
import weakVerbsDict from './dictionaries/weakVerbs.json';

const dict = weakVerbsDict as Record<string, string>;
const weakVerbsList = Object.keys(dict);

export interface ExperienceSuggestion {
  bulletIndex: number;
  message: string;
  type: 'length' | 'missing-action-verb' | 'weak-verb' | 'missing-tech-impact';
}

export const analyzeExperience = (bullets: string[]): ExperienceSuggestion[] => {
  const suggestions: ExperienceSuggestion[] = [];

  bullets.forEach((bullet, index) => {
    if (!bullet || bullet.trim() === '') return;

    const words = bullet.trim().split(/\s+/).filter(Boolean);
    const doc = nlp(bullet);

    // 1. Check max 15 words
    if (words.length > 15) {
      suggestions.push({
        bulletIndex: index,
        type: 'length',
        message: `Bullet point is too long (${words.length} words). Keep it under 15 words for maximum impact.`
      });
    }

    // 2. Check if starts with / contains an action verb
    const verbs = doc.verbs().out('array');
    if (verbs.length === 0) {
      suggestions.push({
        bulletIndex: index,
        type: 'missing-action-verb',
        message: 'Add a strong action verb (e.g., Developed, Directed, Engineered) to describe your impact.'
      });
    }

    // 3. Scan for weak verbs using our dictionary
    weakVerbsList.forEach(weakVerb => {
      // Direct match
      if (doc.match(weakVerb).found) {
        const strongAlternative = dict[weakVerb];
        suggestions.push({
          bulletIndex: index,
          type: 'weak-verb',
          message: `Consider replacing the weak phrase "${weakVerb}" with "${strongAlternative}".`
        });
      }
    });

    // 4. Heuristic for tech or impact (numbers/tools)
    const hasNumbers = /\d+/.test(bullet);
    const hasTechOrImpact = hasNumbers || bullet.toLowerCase().includes('using') || bullet.toLowerCase().includes('by') || bullet.toLowerCase().includes('resulting in');
    
    if (!hasTechOrImpact) {
      suggestions.push({
        bulletIndex: index,
        type: 'missing-tech-impact',
        message: 'Elevate this point by including specific technologies used or quantifying the business impact (numbers/%).'
      });
    }
  });

  return suggestions;
};
