export interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  leetcode: string;
  portfolio: string;
  location: string;
  targetRole?: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  scoreType: string;
  score: string;
  startDate: string;
  endDate: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  items: string;
}

export interface Project {
  id: string;
  title: string;
  technologies: string;
  description: string;
  link: string;
  github: string;
  date: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  type: string;
  startDate: string;
  endDate: string;
  bulletPoints: string[];
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  link: string;
  date: string;
  description: string;
}

export interface ResumeData {
  id?: string;
  personalDetails: PersonalDetails;
  summary: string;
  education: Education[];
  skills: SkillCategory[];
  projects: Project[];
  experience: Experience[];
  extraCurricular: string[];
  certifications: Certification[];
}
