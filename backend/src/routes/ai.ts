import { Router } from 'express';
import { analyzeProject, ProjectSuggestion } from '../ai/projectAnalyzer';
import { analyzeExperience, ExperienceSuggestion } from '../ai/experienceAnalyzer';
import { suggestSkillsForRole, autocompleteSkillCategory } from '../ai/skillRecommender';
import { calculateResumeScore } from '../ai/resumeScore';
import type { Project, Experience } from '../types/resume';

const router = Router();

router.post('/analyze', (req, res) => {
  try {
    const { projects = [], experience = [], summary = '', targetRole = '' } = req.body as {
      projects: Project[];
      experience: Experience[];
      skills: any[];
      summary: string;
      targetRole: string;
    };

    const suggestions: any[] = [];
    
    // Analyze Projects
    projects.forEach((proj, index) => {
      const projSuggestions = analyzeProject(proj.description || '');
      if (projSuggestions.length > 0) {
        suggestions.push({
          section: 'projects',
          index,
          tips: projSuggestions
        });
      }
    });

    // Analyze Experience
    experience.forEach((exp, index) => {
      const expSuggestions = analyzeExperience(exp.bulletPoints || []);
      if (expSuggestions.length > 0) {
        suggestions.push({
          section: 'experience',
          index,
          tips: expSuggestions
        });
      }
    });

    // Skill Recommendations
    const skillRecommendations = targetRole ? suggestSkillsForRole(targetRole) : null;

    // Output Score
    const resumeScore = calculateResumeScore(projects, experience, summary);

    res.json({
      suggestions,
      skillRecommendations,
      resumeScore
    });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

router.get('/skills/autocomplete', (req, res) => {
  try {
    const category = req.query.category as string;
    if (!category) {
      return res.json({ suggestions: [] });
    }
    const autocompleteSuggestions = autocompleteSkillCategory(category);
    res.json({ suggestions: autocompleteSuggestions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skill suggestions' });
  }
});

export default router;
