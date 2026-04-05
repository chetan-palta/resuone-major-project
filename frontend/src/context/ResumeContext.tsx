import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ResumeData } from '../types/resume';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'resuone_form_data';

export interface AISuggestion {
  section: 'projects' | 'experience';
  index: number;
  tips: Array<{
    type: string;
    message: string;
    suggestion?: string;
    originalText?: string;
  }>;
}

export interface AISkillCategory {
  languages: string[];
  tools: string[];
  databases: string[];
}

interface ResumeContextType {
  data: ResumeData;
  aiScore: number | null;
  aiSuggestions: AISuggestion[];
  aiSkillRecommendations: AISkillCategory | null;
  isAnalyzing: boolean;
  updatePersonalDetails: (field: string, value: string) => void;
  updateSummary: (value: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, field: string, value: string) => void;
  removeEducation: (id: string) => void;
  addSkillCategory: () => void;
  updateSkillCategory: (id: string, field: string, value: string) => void;
  removeSkillCategory: (id: string) => void;
  addProject: () => void;
  updateProject: (id: string, field: string, value: string) => void;
  removeProject: (id: string) => void;
  addExperience: () => void;
  updateExperience: (id: string, field: string, value: string) => void;
  updateExperienceBullet: (expId: string, index: number, value: string) => void;
  removeExperience: (id: string) => void;
  updateExtraCurricular: (index: number, value: string) => void;
  addExtraCurricular: () => void;
  removeExtraCurricular: (index: number) => void;
  addCertification: () => void;
  updateCertification: (id: string, field: string, value: string) => void;
  removeCertification: (id: string) => void;
  clearSavedData: () => void;
  setResumeData: (data: ResumeData) => void;
}

const defaultData: ResumeData = {
  personalDetails: {
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    leetcode: '',
    portfolio: '',
    location: ''
  },
  summary: '',
  education: [
    { id: uuidv4(), degree: '', institution: '', location: '', scoreType: 'CGPA (out of 10)', score: '', startDate: '', endDate: '' }
  ],
  skills: [
    { id: uuidv4(), name: 'Languages', items: '' },
    { id: uuidv4(), name: 'Technologies', items: '' }
  ],
  projects: [],
  experience: [],
  extraCurricular: [''],
  certifications: []
};

/** Load saved form data from localStorage, falling back to defaults */
const loadSavedData = (): ResumeData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as ResumeData;
      // Ensure certifications array exists for backward compatibility
      if (!parsed.certifications) {
        parsed.certifications = [];
      }
      return {
        ...defaultData,
        ...parsed,
        personalDetails: { ...defaultData.personalDetails, ...parsed.personalDetails }
      };
    }
  } catch {
    // If parse fails, fall through to default
  }
  return defaultData;
};

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ResumeData>(loadSavedData);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiSkillRecommendations, setAiSkillRecommendations] = useState<AISkillCategory | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Debounced AI Analysis
  useEffect(() => {
    const handler = setTimeout(async () => {
      // Only analyze if there's meaningful data
      const hasContent = data.projects.length > 0 || data.experience.length > 0 || data.summary;
      if (!hasContent) return;

      setIsAnalyzing(true);
      try {
        const response = await fetch('http://localhost:5000/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          const result = await response.json();
          setAiScore(result.resumeScore);
          setAiSuggestions(result.suggestions || []);
          setAiSkillRecommendations(result.skillRecommendations || null);
        }
      } catch (err) {
        console.error('Failed to run AI analysis:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1000); // 1-second debounce to avoid overloading requests on each keystroke

    return () => clearTimeout(handler);
  }, [data]);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Silently fail if localStorage is full or unavailable
    }
  }, [data]);

  const clearSavedData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const setResumeData = (newData: ResumeData) => {
    setData(newData);
  };

  const updatePersonalDetails = (field: string, value: string) => {
    setData(prev => ({ ...prev, personalDetails: { ...prev.personalDetails, [field]: value } }));
  };

  const updateSummary = (value: string) => {
    // Basic word limit validation: New limit 55 words
    if (value.split(/\s+/).filter(Boolean).length <= 55) {
      setData(prev => ({ ...prev, summary: value }));
    }
  };

  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, { id: uuidv4(), degree: '', institution: '', location: '', scoreType: 'CGPA (out of 10)', score: '', startDate: '', endDate: '' }]
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  const addSkillCategory = () => {
    setData(prev => {
      if (prev.skills.length >= 6) return prev;
      return {
        ...prev,
        skills: [...prev.skills, { id: uuidv4(), name: '', items: '' }]
      };
    });
  };

  const updateSkillCategory = (id: string, field: string, value: string) => {
    if (field === 'items') {
      const parts = value.split(',').filter(x => x.trim() !== '');
      if (parts.length > 6) return; // Enforce max 6 skills per category
    }
    setData(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const removeSkillCategory = (id: string) => {
    setData(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) }));
  };

  const addProject = () => {
    if (data.projects.length < 4) {
      setData(prev => ({
        ...prev,
        projects: [...prev.projects, { id: uuidv4(), title: '', technologies: '', description: '', link: '', github: '', date: '' }]
      }));
    }
  };

  const updateProject = (id: string, field: string, value: string) => {
    if (field === 'description' && value.split(/\s+/).filter(Boolean).length > 25) return;
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const removeProject = (id: string) => {
    setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: uuidv4(), company: '', role: '', location: '', type: '', startDate: '', endDate: '', bulletPoints: ['', '', ''] }]
    }));
  };

  const updateExperience = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const updateExperienceBullet = (expId: string, index: number, value: string) => {
    if (value.split(/\s+/).filter(Boolean).length > 15) return; // Enforce max 15 words
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(e => {
        if (e.id === expId) {
          const newBullets = [...e.bulletPoints];
          newBullets[index] = value;
          return { ...e, bulletPoints: newBullets };
        }
        return e;
      })
    }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  };

  const updateExtraCurricular = (index: number, value: string) => {
    setData(prev => {
      const newItems = [...prev.extraCurricular];
      newItems[index] = value;
      return { ...prev, extraCurricular: newItems };
    });
  };

  const addExtraCurricular = () => {
    setData(prev => ({ ...prev, extraCurricular: [...prev.extraCurricular, ''] }));
  };

  const removeExtraCurricular = (index: number) => {
    setData(prev => ({ ...prev, extraCurricular: prev.extraCurricular.filter((_, i) => i !== index) }));
  };

  // Certifications CRUD
  const addCertification = () => {
    setData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { id: uuidv4(), title: '', issuer: '', link: '', date: '', description: '' }]
    }));
  };

  const updateCertification = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      certifications: prev.certifications.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const removeCertification = (id: string) => {
    setData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c.id !== id) }));
  };

  return (
    <ResumeContext.Provider value={{
      data,
      aiScore, aiSuggestions, aiSkillRecommendations, isAnalyzing,
      updatePersonalDetails, updateSummary,
      addEducation, updateEducation, removeEducation,
      addSkillCategory, updateSkillCategory, removeSkillCategory,
      addProject, updateProject, removeProject,
      addExperience, updateExperience, updateExperienceBullet, removeExperience,
      updateExtraCurricular, addExtraCurricular, removeExtraCurricular,
      addCertification, updateCertification, removeCertification,
      clearSavedData, setResumeData
    }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) throw new Error('useResume must be used within a ResumeProvider');
  return context;
};
