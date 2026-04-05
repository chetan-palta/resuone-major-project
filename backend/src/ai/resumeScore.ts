import { analyzeVerbs } from './verbAnalyzer';
import { analyzeExperience } from './experienceAnalyzer';
import { analyzeProject } from './projectAnalyzer';
import type { Project, Experience } from '../types/resume';

export const calculateResumeScore = (projects: Project[], experiences: Experience[], summary: string): number => {
  let score = 100;
  
  // 1. Summary logic
  if (!summary || summary.trim().split(/\s+/).length < 10) {
    score -= 5;
  }

  // 2. Projects logic
  if (projects.length === 0) {
    score -= 10;
  } else {
    projects.forEach(p => {
      const suggestions = analyzeProject(p.description || '');
      score -= (suggestions.length * 2); // -2 per suggestion 
    });
  }

  // 3. Experience logic
  if (experiences.length === 0) {
    score -= 10;
  } else {
    experiences.forEach(e => {
      const suggestions = analyzeExperience(e.bulletPoints || []);
      score -= (suggestions.length * 1.5); // -1.5 per weak point
    });
  }

  // Cap the score bounds
  if (score > 100) return 100;
  if (score < 0) return 0;

  return Math.round(score);
};
