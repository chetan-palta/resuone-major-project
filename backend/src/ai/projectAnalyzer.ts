import nlp from 'compromise';
import { analyzeVerbs, VerbSuggestion } from './verbAnalyzer';

export interface ProjectSuggestion {
  message: string;
  type: 'weak-verb' | 'missing-tech' | 'vague-impact';
}

export const analyzeProject = (description: string): ProjectSuggestion[] => {
  const suggestions: ProjectSuggestion[] = [];

  if (!description || description.trim() === '') return suggestions;

  const doc = nlp(description);
  
  // 1. Weak verb detection
  const verbSuggestions = analyzeVerbs(description);
  verbSuggestions.forEach(vs => {
    suggestions.push({
      type: 'weak-verb',
      message: vs.message
    });
  });

  // 2. Check for missing technologies (heuristics)
  // We'll look for common tech terms or capitalization heuristics, or simply prompt if we don't find numbers/acronyms
  const acronyms = doc.acronyms().out('array');
  const nouns = doc.nouns().out('array');
  
  // Simple heuristic: if it doesn't mention typical tech keywords or has no acronyms, it might lack tech mentions.
  // A better way is checking against a known tech list, but for our lightweight approach:
  const techKeywords = ['react', 'node', 'python', 'java', 'sql', 'api', 'database', 'frontend', 'backend', 'cloud', 'aws', 'docker'];
  const descLower = description.toLowerCase();
  const hasTechKeyword = techKeywords.some(tech => descLower.includes(tech)) || acronyms.length > 0;

  if (!hasTechKeyword) {
    suggestions.push({
      type: 'missing-tech',
      message: 'Consider explicitly mentioning the technologies, frameworks, or languages used in this project.'
    });
  }

  // 3. Vague impact / Missing results
  const hasNumbers = /\d+%/.test(description) || /\d+x/.test(description);
  if (!hasNumbers) {
    suggestions.push({
      type: 'vague-impact',
      message: 'Your description lacks quantifiable results. Add numbers, percentages, or metrics to demonstrate impact.'
    });
  }

  return suggestions;
};
