import skillDict from './dictionaries/skillSuggestions.json';

type SkillCategories = {
  languages: string[];
  tools: string[];
  databases: string[];
};

export const suggestSkillsForRole = (role: string): SkillCategories | null => {
  if (!role || role.trim() === '') return null;
  
  const query = role.toLowerCase().trim();
  
  // Exact match
  if (skillDict[query as keyof typeof skillDict]) {
    return skillDict[query as keyof typeof skillDict];
  }
  
  // Partial match fallback
  for (const [key, value] of Object.entries(skillDict)) {
    if (key.includes(query) || query.includes(key)) {
      return value;
    }
  }

  return null;
};

export const autocompleteSkillCategory = (category: string): string[] => {
  const query = category.toLowerCase().trim();
  
  // Aggregate all unique skills under this category
  const allSkills = new Set<string>();
  
  Object.values(skillDict).forEach(roleSkills => {
    if (query.includes('program') || query.includes('language') || query.includes('lang')) {
      roleSkills.languages.forEach(s => allSkills.add(s));
    } else if (query.includes('tool') || query.includes('framework') || query.includes('tech')) {
      roleSkills.tools.forEach(s => allSkills.add(s));
    } else if (query.includes('data') || query.includes('db')) {
      roleSkills.databases.forEach(s => allSkills.add(s));
    }
  });

  return Array.from(allSkills).slice(0, 15); // Return top 15 matches ideally
};
