import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';
import type { ResumeData, PersonalDetails, Education, SkillCategory, Project, Experience, Certification } from '../types/resume';

// ───────────────────────────────────────────
//  CONSTANTS — strict system limits
// ───────────────────────────────────────────
const LIMITS = {
  SUMMARY_WORDS: 55,
  MAX_PROJECTS: 5,
  PROJECT_DESC_WORDS: 35,
  MAX_EXP_BULLETS: 3,
  EXP_BULLET_WORDS: 20,
  MAX_SKILL_CATEGORIES: 6,
  MAX_SKILLS_PER_CATEGORY: 6,
};

const COMMON_BULLETS = /[•●○■◆▪►▸\-*]/g;
const DATE_REGEX = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\b\d{1,2}\/\d{2,4}|\b\d{4}\b/gi;
const DATE_RANGE_REGEX = /((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\b\d{4}\b|\bPresent\b)\s*[-–—to]+\s*((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\b\d{4}\b|\bPresent\b)/gi;

// ───────────────────────────────────────────
//  TEXT EXTRACTION
// ───────────────────────────────────────────
export const extractTextFromPdf = async (buffer: Buffer): Promise<string> => {
  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();
  await parser.destroy();
  return data.text || '';
};

export const extractTextFromDocx = async (buffer: Buffer): Promise<string> => {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || '';
};

// ───────────────────────────────────────────
//  TEXT CLEANING
// ───────────────────────────────────────────
export const cleanText = (raw: string): string => {
  let text = raw;
  // Normalize line breaks
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Remove page numbers
  text = text.replace(/^[\s]*page\s*\d+[\s]*$/gim, '');
  text = text.replace(/^\s*\d+\s*of\s*\d+\s*$/gim, '');
  text = text.replace(/^\s*\d{1,3}\s*$/gm, '');
  // Remove repeated headings (consecutive identical lines)
  text = text.replace(/^(.+)\n\1$/gm, '$1');
  // Normalize bullets instead of removing them
  text = text.replace(/[●○■◆▪►▸]/g, '•');
  // Collapse excessive white space within lines
  text = text.replace(/[ \t]{2,}/g, ' ');
  // Trim each line
  text = text.split('\n').map(l => l.trim()).join('\n');
  // Collapse excessive newlines
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
};

// ───────────────────────────────────────────
//  SECTION DETECTION  (Rule-based NLP)
// ───────────────────────────────────────────

interface SectionBlock {
  type: string;
  lines: string[];
}

const SECTION_KEYWORDS: Record<string, string[]> = {
  personal: ['contact', 'personal information', 'personal details', 'contact information', 'contact details'],
  summary: ['summary', 'objective', 'career summary', 'professional summary', 'about me', 'profile'],
  education: ['education', 'academic', 'academic background', 'qualification', 'qualifications', 'university', 'college', 'school', 'degree', 'academics'],
  skills: ['skills', 'technical skills', 'technologies', 'tools', 'competencies', 'proficiencies', 'core competencies', 'areas of expertise', 'technical expertise', 'expertise'],
  projects: ['projects', 'project experience', 'personal projects', 'academic projects', 'key projects', 'major projects'],
  experience: ['experience', 'work experience', 'professional experience', 'internship', 'internships', 'employment', 'work history', 'professional background', 'professional experience'],
  certifications: ['certifications', 'certificates', 'courses', 'licenses', 'credentials', 'professional development', 'certifications & courses'],
  extracurricular: ['extra curricular', 'extracurricular', 'activities', 'achievements', 'awards', 'honors', 'leadership', 'volunteering', 'co-curricular', 'positions of responsibility'],
};

const detectSections = (text: string): SectionBlock[] => {
  const lines = text.split('\n').filter(l => l.trim() !== '');
  const blocks: SectionBlock[] = [];
  let currentType = 'unknown';
  let currentLines: string[] = [];

  for (const line of lines) {
    const originalLine = line.trim();
    // Normalize heading: lowercase, remove non-alphanumeric at start/end
    const lower = originalLine.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
    let matched = false;

    // A line is likely a heading if it's short and matches a keyword
    if (lower.length > 0 && originalLine.length < 40) {
      for (const [sectionType, keywords] of Object.entries(SECTION_KEYWORDS)) {
        if (keywords.includes(lower) || keywords.some(kw => lower === kw.replace(/\s+/g, ''))) {
          // Save previous section
          if (currentLines.length > 0) {
            blocks.push({ type: currentType, lines: [...currentLines] });
          }
          currentType = sectionType;
          currentLines = [];
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      currentLines.push(originalLine);
    }
  }

  if (currentLines.length > 0) {
    blocks.push({ type: currentType, lines: [...currentLines] });
  }

  return blocks;
};

// ───────────────────────────────────────────
//  FIELD EXTRACTION HELPERS
// ───────────────────────────────────────────

const extractEmail = (text: string): string => {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : '';
};

const extractPhone = (text: string): string => {
  const match = text.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/);
  return match ? match[0].trim() : '';
};

const extractLinkedIn = (text: string): string => {
  const match = text.match(/(?:linkedin\.com\/in\/|linkedin:?\s*)([a-zA-Z0-9_-]+)/i);
  return match ? `linkedin.com/in/${match[1]}` : '';
};

const extractGitHub = (text: string): string => {
  const match = text.match(/(?:github\.com\/|github:?\s*)([a-zA-Z0-9_-]+)/i);
  return match ? `github.com/${match[1]}` : '';
};

const extractLeetCode = (text: string): string => {
  const match = text.match(/(?:leetcode\.com\/|leetcode:?\s*)([a-zA-Z0-9_-]+)/i);
  return match ? `leetcode.com/${match[1]}` : '';
};

const extractLiveLink = (text: string): string => {
  const urls = text.match(/https?:\/\/[^\s,;)]+/g) || [];
  // Exclude common social media and known developer platforms
  const excluded = ['linkedin.com', 'github.com', 'leetcode.com', 'geeksforgeeks', 'hackerrank', 'twitter.com', 'facebook.com', 'instagram.com'];
  const live = urls.find(url => !excluded.some(ex => url.toLowerCase().includes(ex)));
  return live || '';
};

const trimWords = (text: string, maxWords: number): string => {
  if (!text) return '';
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ');
};

const extractDateRange = (text: string): { startDate: string; endDate: string } => {
  const match = text.match(DATE_RANGE_REGEX);
  if (match) {
    const parts = match[0].split(/[-–—to]+/i);
    if (parts.length >= 2) {
      return { startDate: parts[0].trim(), endDate: parts[1].trim() };
    }
  }
  // Try single date as end date
  const singleMatch = text.match(DATE_REGEX);
  if (singleMatch) {
    return { startDate: '', endDate: singleMatch[singleMatch.length - 1].trim() };
  }
  return { startDate: '', endDate: '' };
};

const refineText = (text: string): string => {
  if (!text) return '';
  // Improve verbs quietly (refine phrasing)
  return text
    .replace(/\b(worked on|did|made)\b/gi, 'Developed')
    .replace(/\b(helped with|was helping)\b/gi, 'Supported')
    .replace(/\b(used|utilised)\b/gi, 'Leveraged')
    .replace(/\b(got|took)\b/gi, 'Spearheaded')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

// ───────────────────────────────────────────
//  MAP SECTIONS → STRUCTURED ResumeData
// ───────────────────────────────────────────

const mapPersonalInfo = (blocks: SectionBlock[], fullText: string): PersonalDetails => {
  const personalBlock = blocks.find(b => b.type === 'personal');
  const personalText = personalBlock ? personalBlock.lines.join(' ') : '';
  const searchText = personalText || fullText;

  // Header detection: usually the first few lines contain name and core info
  const firstLines = fullText.split('\n').filter(l => l.trim() !== '').slice(0, 5);
  let name = '';
  for (const line of firstLines) {
    // If the line is short, capitalized, and doesn't contain contact symbols
    if (line.length < 40 && /^[A-Z]/.test(line) && !line.includes('@') && !line.includes('www.') && !line.includes('/') && !COMMON_BULLETS.test(line)) {
      name = line;
      break;
    }
  }

  return {
    fullName: name,
    email: extractEmail(searchText),
    phone: extractPhone(searchText),
    linkedin: extractLinkedIn(searchText),
    github: extractGitHub(searchText),
    leetcode: extractLeetCode(searchText),
    portfolio: extractLiveLink(searchText),
    location: '',
  };
};

const mapSummary = (blocks: SectionBlock[]): string => {
  const summaryBlock = blocks.find(b => b.type === 'summary');
  if (!summaryBlock) return '';
  const text = summaryBlock.lines.join(' ').trim();
  return trimWords(text, LIMITS.SUMMARY_WORDS);
};

const mapEducation = (blocks: SectionBlock[]): Education[] => {
  const block = blocks.find(b => b.type === 'education');
  if (!block) return [{ id: uuidv4(), degree: '', institution: '', location: '', scoreType: 'CGPA (out of 10)', score: '', startDate: '', endDate: '' }];

  const entries: Education[] = [];
  let currentLines: string[] = [];
  
  const degreePattern = /\b(b\.?tech|m\.?tech|b\.?e|m\.?e|b\.?sc|m\.?sc|b\.?a|m\.?a|bca|mca|bba|mba|ph\.?d|diploma|high school|12th|10th|bachelor|master|doctor|secondary|intermediate)\b/i;

  for (const line of block.lines) {
    if (degreePattern.test(line) && currentLines.length > 0) {
      entries.push(parseEducationEntry(currentLines));
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }
  
  if (currentLines.length > 0) {
    entries.push(parseEducationEntry(currentLines));
  }

  return entries.length > 0 ? entries : [{ id: uuidv4(), degree: '', institution: '', location: '', scoreType: 'CGPA (out of 10)', score: '', startDate: '', endDate: '' }];
};

const parseEducationEntry = (lines: string[]): Education => {
  const fullText = lines.join(' ');
  const { startDate, endDate } = extractDateRange(fullText);

  let scoreType = 'CGPA (out of 10)';
  let score = '';
  const scoreMatch = fullText.match(/(?:cgpa|gpa|percentage|marks|aggregate|score)\s*:?\s*(\d+\.?\d*)\s*(?:\/\s*(\d+\.?\d*))?/i);
  const percentMatch = fullText.match(/(\d+\.?\d*)\s*%/);

  if (scoreMatch) {
    score = scoreMatch[1];
    const outOf = scoreMatch[2];
    if (outOf === '4' || parseFloat(score) <= 4.0 && !outOf) scoreType = 'GPA (out of 4)';
    else if (outOf === '9.5') scoreType = 'CGPA (out of 9.5)';
    else if (parseFloat(score) > 10) scoreType = 'Percentage (%)';
  } else if (percentMatch) {
    score = percentMatch[1];
    scoreType = 'Percentage (%)';
  }

  let degree = '';
  let institution = '';

  const degreePattern = /\b(b\.?tech|m\.?tech|b\.?e|m\.?e|b\.?sc|m\.?sc|b\.?a|m\.?a|bca|mca|bba|mba|ph\.?d|diploma|high school|12th|10th|bachelor|master|doctor|secondary|intermediate)\b/i;
  
  for (const line of lines) {
    if (degreePattern.test(line)) {
      degree = line.replace(DATE_RANGE_REGEX, '').replace(DATE_REGEX, '').replace(/[:|\-]/g, '').trim();
    } else if (!institution && line.length > 5 && !line.includes('%') && !line.match(/cgpa|gpa/i)) {
      institution = line.trim();
    }
  }

  return {
    id: uuidv4(),
    degree: degree || lines[0],
    institution: institution || (lines.length > 1 ? lines[1] : ''),
    location: '',
    scoreType,
    score,
    startDate,
    endDate,
  };
};

const mapSkills = (blocks: SectionBlock[]): SkillCategory[] => {
  const block = blocks.find(b => b.type === 'skills');
  if (!block) return [
    { id: uuidv4(), name: 'Languages', items: '' },
    { id: uuidv4(), name: 'Tools & Technologies', items: '' },
  ];

  const categories: SkillCategory[] = [];

  for (const line of block.lines) {
    // Detect categories like "Languages: Python, C++"
    const catMatch = line.match(/^(.+?)\s*[:|\-]\s*(.+)$/);
    if (catMatch) {
      const name = catMatch[1].trim();
      if (name.length > 30) continue; 
      const rawItems = catMatch[2].trim();
      const items = rawItems.split(/[,;|•●○■◆]/).map(s => s.trim()).filter(Boolean).slice(0, LIMITS.MAX_SKILLS_PER_CATEGORY).join(', ');
      if (items) categories.push({ id: uuidv4(), name, items });
    } else {
      const items = line.split(/[,;|•●○■◆]/).map(s => s.trim()).filter(Boolean);
      if (items.length > 0) {
        if (categories.length === 0) {
          categories.push({ id: uuidv4(), name: 'Technical Expertise', items: '' });
        }
        const lastCat = categories[categories.length - 1];
        const existing = lastCat.items ? lastCat.items.split(', ') : [];
        const combined = [...new Set([...existing, ...items])].slice(0, LIMITS.MAX_SKILLS_PER_CATEGORY);
        lastCat.items = combined.join(', ');
      }
    }
    if (categories.length >= LIMITS.MAX_SKILL_CATEGORIES) break;
  }

  return categories;
};

const mapProjects = (blocks: SectionBlock[]): Project[] => {
  const block = blocks.find(b => b.type === 'projects');
  if (!block) return [];

  const projects: Project[] = [];
  let currentLines: string[] = [];

  for (const line of block.lines) {
    // A line is likely a title if it matches project name patterns and is not a bullet
    const looksLikeTitle = line.length < 60 && !COMMON_BULLETS.test(line) && /^[A-Z0-9]/.test(line);
    
    if (looksLikeTitle && currentLines.length > 0) {
      projects.push(parseProjectEntry(currentLines));
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    projects.push(parseProjectEntry(currentLines));
  }

  return projects.slice(0, LIMITS.MAX_PROJECTS);
};

const parseProjectEntry = (lines: string[]): Project => {
  const header = lines[0] || '';
  const rest = lines.slice(1).join(' ');

  // Extract date from header or rest
  const { endDate } = extractDateRange(header + ' ' + rest);
  const date = endDate; // Use end date or just the range string if found

  // Extract tech stack in parentheses from header
  const techInParentheses = header.match(/\((.+?)\)/);
  let technologies = techInParentheses ? techInParentheses[1].trim() : '';

  // If not found in title, check "Tech:", "built with", etc.
  if (!technologies) {
    const techMatch = rest.match(/(?:tech(?:nologies)?|built with|stack|using)\s*:?\s*(.+?)(?:\.|$)/i);
    technologies = techMatch ? techMatch[1].trim() : '';
  }

  // Extract links
  const github = extractGitHub(rest);
  const link = extractLiveLink(rest);

  // Clean title: remove tech stack, dates, and links
  let title = header
    .replace(/\(.*?\)/, '')
    .replace(DATE_RANGE_REGEX, '')
    .replace(DATE_REGEX, '')
    .replace(/[:|\-]/g, '')
    .trim();

  // Description: merge lines that aren't titles or metadata
  const descriptionLines = lines.slice(1)
    .map(l => l.replace(COMMON_BULLETS, '').trim())
    .filter(l => l.length > 10 && !l.includes('http') && !l.match(/tech|stack/i));
  
  const description = trimWords(descriptionLines.join(' '), LIMITS.PROJECT_DESC_WORDS);

  return {
    id: uuidv4(),
    title: title || 'Untitled Project',
    technologies,
    description,
    link,
    github,
    date,
  };
};

const mapExperience = (blocks: SectionBlock[]): Experience[] => {
  const block = blocks.find(b => b.type === 'experience');
  if (!block) return [];

  const experiences: Experience[] = [];
  let currentLines: string[] = [];

  for (const line of block.lines) {
    // New entry usually starts with a role/company line that isn't a bullet
    const isNewEntry = line.length < 80 && !COMMON_BULLETS.test(line) && (
      /\b(intern|engineer|developer|analyst|manager|lead|associate|executive|designer|consultant|trainee)\b/i.test(line) ||
      /\b(at|@)\b/i.test(line)
    );

    if (isNewEntry && currentLines.length > 0) {
      experiences.push(parseExperienceEntry(currentLines));
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    experiences.push(parseExperienceEntry(currentLines));
  }

  return experiences;
};

const parseExperienceEntry = (lines: string[]): Experience => {
  const header = lines[0] || '';
  const { startDate, endDate } = extractDateRange(lines.join(' '));

  let role = '', company = '';
  // Try common patterns: "Role @ Company", "Company | Role", "Role, Company"
  const separators = [/\s+@\s+/, /\s+at\s+/, /\s*\|\s*/, /\s*-\s*/, /,\s*/];
  for (const sep of separators) {
    const parts = header.split(sep);
    if (parts.length >= 2) {
      role = parts[0].trim();
      company = parts[1].replace(DATE_REGEX, '').replace(DATE_RANGE_REGEX, '').trim();
      break;
    }
  }

  if (!role) role = header.replace(DATE_REGEX, '').replace(DATE_RANGE_REGEX, '').trim();

  let type = '';
  const fullText = lines.join(' ');
  if (/intern/i.test(fullText)) type = 'Internship';
  else if (/full.?time/i.test(fullText)) type = 'Full-time';
  else if (/part.?time/i.test(fullText)) type = 'Part-time';
  else if (/freelance/i.test(fullText)) type = 'Freelance';

  // Extract bullets: merge lines starting with bullets or lines following a role header
  const bullets: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length < 5 || line.match(DATE_RANGE_REGEX)) continue;
    
    // Clean bullet symbols
    const cleaned = line.replace(COMMON_BULLETS, '').trim();
    if (cleaned) bullets.push(trimWords(cleaned, LIMITS.EXP_BULLET_WORDS));
    if (bullets.length >= LIMITS.MAX_EXP_BULLETS) break;
  }

  while (bullets.length < 3) bullets.push('');

  return {
    id: uuidv4(),
    company: company || 'Company',
    role: role || 'Role',
    location: '',
    type,
    startDate,
    endDate,
    bulletPoints: bullets as [string, string, string],
  };
};

const mapCertifications = (blocks: SectionBlock[]): Certification[] => {
  const block = blocks.find(b => b.type === 'certifications');
  if (!block) return [];

  return block.lines
    .filter(l => l.trim().length > 5)
    .map(line => {
      // Common format: Certification Name - Organization - Date
      const parts = line.split(/[-–—|]/).map(p => p.trim());
      const title = parts[0] || '';
      const issuer = parts[1] || '';
      const dateMatch = line.match(DATE_REGEX);
      const date = dateMatch ? dateMatch[0] : '';

      return {
        id: uuidv4(),
        title,
        issuer,
        link: extractLiveLink(line),
        date,
        description: '',
      };
    });
};

const mapExtraCurricular = (blocks: SectionBlock[]): string[] => {
  const block = blocks.find(b => b.type === 'extracurricular');
  if (!block) return [''];

  const items = block.lines.filter(l => l.trim() !== '');
  return items.length > 0 ? items : [''];
};

// ───────────────────────────────────────────
//  AI IMPORT ANALYSIS
// ───────────────────────────────────────────

export interface ImportSuggestion {
  section: string;
  field?: string;
  index?: number;
  message: string;
  severity: 'info' | 'warning' | 'improvement';
}

const analyzeImportedContent = (data: ResumeData): ImportSuggestion[] => {
  const suggestions: ImportSuggestion[] = [];

  // Check for missing sections
  if (!data.personalDetails.fullName) {
    suggestions.push({ section: 'personal', message: 'Could not detect your name. Please fill it in manually.', severity: 'warning' });
  }
  if (!data.personalDetails.email) {
    suggestions.push({ section: 'personal', message: 'No email address detected. Add your email for contact visibility.', severity: 'warning' });
  }
  if (!data.personalDetails.linkedin) {
    suggestions.push({ section: 'personal', message: 'LinkedIn profile not detected. Adding a LinkedIn profile is recommended.', severity: 'info' });
  }
  if (!data.personalDetails.github) {
    suggestions.push({ section: 'personal', message: 'GitHub profile not detected. Consider adding it for tech roles.', severity: 'info' });
  }

  // Summary
  if (!data.summary) {
    suggestions.push({ section: 'summary', message: 'No career summary detected. A strong summary helps recruiters understand your profile quickly.', severity: 'warning' });
  } else {
    const wordCount = data.summary.split(/\s+/).filter(Boolean).length;
    if (wordCount < 15) {
      suggestions.push({ section: 'summary', message: 'Career summary is too short. Aim for 30-55 words for maximum impact.', severity: 'improvement' });
    }
  }

  // Projects
  if (data.projects.length === 0) {
    suggestions.push({ section: 'projects', message: 'No projects detected. Adding projects significantly improves your resume. (Missing section)', severity: 'warning' });
  } else {
    data.projects.forEach((proj, i) => {
      if (!proj.description) {
        suggestions.push({ section: 'projects', index: i, message: `Project "${proj.title}" has no description. Add a concise description for impact.`, severity: 'improvement' });
      }
      if (!proj.technologies) {
        suggestions.push({ section: 'projects', index: i, message: `Project "${proj.title}" missing technologies. List the tech stack used.`, severity: 'improvement' });
      }
      // Check for weak verbs in description
      const weakVerbs = ['worked on', 'did', 'made', 'helped', 'used', 'tried'];
      weakVerbs.forEach(wv => {
        if (proj.description.toLowerCase().includes(wv)) {
          suggestions.push({
            section: 'projects',
            index: i,
            message: `Replace "${wv}" with a stronger action verb like "Developed", "Engineered", or "Implemented" in project description.`,
            severity: 'improvement',
          });
        }
      });
    });
  }

  // Experience
  if (data.experience.length === 0) {
    suggestions.push({ section: 'experience', message: 'No experience/internships detected. Add relevant work experience if available.', severity: 'info' });
  } else {
    data.experience.forEach((exp, i) => {
      const filledBullets = exp.bulletPoints.filter(bp => bp.trim() !== '');
      if (filledBullets.length === 0) {
        suggestions.push({ section: 'experience', index: i, message: `Experience at "${exp.company || 'Unknown'}" has no bullet points. Describe your key contributions.`, severity: 'improvement' });
      }
      filledBullets.forEach((bp, bi) => {
        const weakVerbs = ['worked on', 'did', 'made', 'helped', 'used', 'tried'];
        weakVerbs.forEach(wv => {
          if (bp.toLowerCase().includes(wv)) {
            suggestions.push({
              section: 'experience',
              index: i,
              field: `bullet-${bi}`,
              message: `Replace weak verb "${wv}" with a stronger action verb (e.g., "Developed", "Optimized", "Spearheaded").`,
              severity: 'improvement',
            });
          }
        });
      });
      // Check for quantification
      const hasNumbers = filledBullets.some(bp => /\d+/.test(bp));
      if (!hasNumbers) {
        suggestions.push({ section: 'experience', index: i, message: 'Quantify your achievements with numbers, percentages, or metrics for stronger impact.', severity: 'improvement' });
      }
    });
  }

  // Skills
  if (data.skills.length === 0 || data.skills.every(s => !s.items.trim())) {
    suggestions.push({ section: 'skills', message: 'No skills detected. Add relevant technical and soft skills.', severity: 'warning' });
  }

  // Education
  if (data.education.every(e => !e.degree && !e.institution)) {
    suggestions.push({ section: 'education', message: 'Education details not fully parsed. Please review and complete.', severity: 'info' });
  }

  return suggestions;
};

// ───────────────────────────────────────────
//  MAIN PIPELINE
// ───────────────────────────────────────────

export interface ImportResult {
  resumeData: ResumeData;
  suggestions: ImportSuggestion[];
  sectionsDetected: string[];
}

export const processResumeImport = async (
  buffer: Buffer,
  mimeType: string
): Promise<ImportResult> => {
  // 1. Extract text
  let rawText: string;
  if (mimeType === 'application/pdf') {
    rawText = await extractTextFromPdf(buffer);
  } else {
    rawText = await extractTextFromDocx(buffer);
  }

  if (!rawText || rawText.trim().length === 0) {
    throw new Error('EMPTY_FILE');
  }

  // 2. Clean text
  const cleanedText = cleanText(rawText);

  // 3. Detect sections
  const sections = detectSections(cleanedText);
  const sectionsDetected = [...new Set(sections.map(s => s.type).filter(t => t !== 'unknown'))];

  // 4. Map to structured data
  const resumeData: ResumeData = {
    personalDetails: mapPersonalInfo(sections, cleanedText),
    summary: mapSummary(sections),
    education: mapEducation(sections),
    skills: mapSkills(sections),
    projects: mapProjects(sections).map(p => ({ ...p, description: refineText(p.description) })),
    experience: mapExperience(sections).map(e => ({ ...e, bulletPoints: e.bulletPoints.map(bp => refineText(bp)) as [string, string, string] })),
    certifications: mapCertifications(sections),
    extraCurricular: mapExtraCurricular(sections),
  };

  // 5. AI analysis / suggestions
  const suggestions = analyzeImportedContent(resumeData);

  return { resumeData, suggestions, sectionsDetected };
};
