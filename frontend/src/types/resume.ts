export interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
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
  type: string; // Full-time, Part-time, Internship
  startDate: string;
  endDate: string;
  bulletPoints: string[];
}

export interface Certification {
  id: string;
  title: string;
  link: string;
  date: string;
  description: string;
}

export interface ResumeData {
  personalDetails: PersonalDetails;
  summary: string;
  education: Education[];
  skills: SkillCategory[];
  projects: Project[];
  experience: Experience[];
  extraCurricular: string[];
  certifications: Certification[];
}
