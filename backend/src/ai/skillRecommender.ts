import skillDict from './dictionaries/skillSuggestions.json';

type SkillCategories = {
  languages: string[];
  tools: string[];
  databases: string[];
};

export const suggestSkillsForRole = (role: string): SkillCategories | null => {
  if (!role || role.trim() === '') return null;
  
  const query = role.toLowerCase().trim();
  const dict = skillDict as Record<string, SkillCategories>;
  
  // Exact match
  if (dict[query]) {
    return dict[query];
  }
  
  // Partial match fallback
  for (const [key, value] of Object.entries(dict)) {
    if (key.includes(query) || query.includes(key)) {
      return value;
    }
  }

  return null;
};

export const autocompleteSkillCategory = (category: string): string[] => {
  const query = category.toLowerCase().trim();
  const dict = skillDict as Record<string, SkillCategories>;
  
  // Aggregate all unique skills under this category
  const allSkills = new Set<string>();
  
  Object.values(dict).forEach((roleSkills: SkillCategories) => {
    if (query.includes('program') || query.includes('language') || query.includes('lang')) {
      roleSkills.languages.forEach((s: string) => allSkills.add(s));
    } else if (query.includes('tool') || query.includes('framework') || query.includes('tech')) {
      roleSkills.tools.forEach((s: string) => allSkills.add(s));
    } else if (query.includes('data') || query.includes('db')) {
      roleSkills.databases.forEach((s: string) => allSkills.add(s));
    }
  });

  return Array.from(allSkills).slice(0, 15); // Return top 15 matches ideally
};
