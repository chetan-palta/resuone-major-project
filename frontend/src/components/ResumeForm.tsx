import React, { useState } from 'react';
import { useResume } from '../context/ResumeContext';
import { ChevronDown, ChevronRight, Plus, Trash2, Target, Sparkles } from 'lucide-react';
import { AIPanel } from './AIPanel';
import { API_URL } from '../config';


const SkillAutocomplete = ({ categoryName, currentItems, onSelect }: { categoryName: string, currentItems: string, onSelect: (items: string) => void }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!categoryName || categoryName.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/ai/skills/autocomplete?category=${encodeURIComponent(categoryName)}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    const handler = setTimeout(fetchSuggestions, 800);
    return () => clearTimeout(handler);
  }, [categoryName]);

  if (!categoryName || (suggestions.length === 0 && !loading)) return null;

  const handleAdd = (skill: string) => {
    const items = currentItems.split(',').map(s => s.trim()).filter(Boolean);
    if (!items.includes(skill) && items.length < 6) {
      onSelect([...items, skill].join(', '));
    }
  };

  return (
    <div className="mt-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
      <div className="text-xs font-semibold text-blue-800 flex items-center gap-1 mb-2">
        <Sparkles size={12} /> AI Suggestions
      </div>
      {loading ? (
        <div className="text-xs text-blue-600">Loading suggestions...</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => handleAdd(s)}
              className="px-2 py-1 bg-white text-blue-700 text-xs rounded border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div>
      <div className={`section-header ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span>{title}</span>
        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </div>
      {isOpen && <div className="section-body">{children}</div>}
    </div>
  );
};

export const ResumeForm = () => {
  const { 
    data, 
    updatePersonalDetails, 
    updateSummary,
    addEducation, updateEducation, removeEducation,
    addSkillCategory, updateSkillCategory, removeSkillCategory,
    addProject, updateProject, removeProject,
    addExperience, updateExperience, updateExperienceBullet, removeExperience,
    addExtraCurricular, updateExtraCurricular, removeExtraCurricular,
    addCertification, updateCertification, removeCertification,
    addCustomLink, updateCustomLink, removeCustomLink
  } = useResume();

  const handlePersonal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'fullName' && !/^[a-zA-Z\s]*$/.test(value)) return;
    if (name === 'phone' && !/^[0-9]*$/.test(value)) return;
    updatePersonalDetails(name, value);
  };

  const summaryWords = data.summary.split(/\s+/).filter(Boolean).length;
  const hasCertifications = data.certifications.length > 0 && data.certifications.some(c => c.title.trim() || c.description.trim());
  const hasExtraCurricular = data.extraCurricular.some(e => e.trim());

  return (
    <div>
      <AIPanel />

      <Section title="Personal Details" defaultOpen={true}>
        <div className="input-group">
          <label className="input-label bg-blue-50 text-blue-800 p-2 rounded-t-md mb-0 border-b border-blue-100 flex items-center gap-2">
            <Target size={16} /> Target Job Role (Powers AI Suggestions)
          </label>
          <input 
            className="input-field rounded-t-none border-t-0 bg-blue-50/30" 
            name="targetRole" 
            value={data.personalDetails.targetRole || ''} 
            onChange={handlePersonal} 
            placeholder="e.g. Full Stack Developer, Data Scientist" 
          />
        </div>

        <div className="input-group mt-4">
          <label className="input-label">Full Name</label>
          <input className="input-field" name="fullName" value={data.personalDetails.fullName} onChange={handlePersonal} placeholder="e.g. John Doe" />
        </div>
        <div className="input-row">
          <div className="input-group">
            <label className="input-label">Email</label>
            <input type="email" className="input-field" name="email" value={data.personalDetails.email} onChange={handlePersonal} placeholder="john@example.com" />
          </div>
          <div className="input-group">
            <label className="input-label">Phone</label>
            <input type="tel" className="input-field" name="phone" value={data.personalDetails.phone} onChange={handlePersonal} placeholder="1234567890" />
          </div>
        </div>
        <div className="input-row">
          <div className="input-group">
            <label className="input-label">LinkedIn</label>
            <input type="url" className="input-field" name="linkedin" value={data.personalDetails.linkedin} onChange={handlePersonal} placeholder="https://linkedin.com/in/johndoe" />
          </div>
          <div className="input-group">
            <label className="input-label">GitHub</label>
            <input type="url" className="input-field" name="github" value={data.personalDetails.github} onChange={handlePersonal} placeholder="https://github.com/johndoe" />
          </div>
        </div>
        <div className="input-row">
          <div className="input-group">
            <label className="input-label">LeetCode</label>
            <input type="url" className="input-field" name="leetcode" value={data.personalDetails.leetcode} onChange={handlePersonal} placeholder="https://leetcode.com/johndoe" />
          </div>
          <div className="input-group">
            <label className="input-label">Portfolio</label>
            <input type="url" className="input-field" name="portfolio" value={data.personalDetails.portfolio} onChange={handlePersonal} placeholder="https://johndoe.com" />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Location</label>
          <input className="input-field" name="location" value={data.personalDetails.location} onChange={handlePersonal} placeholder="City, Country" />
        </div>

        <div className="input-group mt-4">
          <label className="input-label font-semibold mb-2">Additional Links</label>
          {(data.personalDetails.customLinks || []).map((link, idx) => (
            <div key={idx} className="flex gap-2 items-end bg-gray-50 dark:bg-gray-800 p-3 rounded border mb-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Label Name</label>
                <input className="input-field py-1" value={link.label} onChange={(e) => updateCustomLink(idx, 'label', e.target.value)} placeholder="e.g. Custom Label" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Link URL</label>
                <input type="url" className="input-field py-1" value={link.url} onChange={(e) => updateCustomLink(idx, 'url', e.target.value)} placeholder="https://example.com" />
              </div>
              <button type="button" className="btn-danger p-2 h-[38px] w-[38px] flex items-center justify-center border border-red-200" onClick={() => removeCustomLink(idx)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button type="button" className="text-sm text-indigo-600 font-medium flex items-center hover:text-indigo-700" onClick={addCustomLink}>
            <Plus size={14} className="mr-1" /> Add another link
          </button>
        </div>
      </Section>

      <Section title="Career Summary">
        <div className="input-group">
          <div className="input-label">
            <span>Summary</span>
            <span className={`input-count-limit ${summaryWords >= 55 ? 'limit-reached' : ''}`}>
              {summaryWords}/55 words
            </span>
          </div>
          <textarea 
            className="input-field" 
            value={data.summary} 
            onChange={(e) => updateSummary(e.target.value)} 
            placeholder="A brief summary of your career objectives and highlights..."
            rows={4}
          />
        </div>
      </Section>

      <Section title="Education">
        {data.education.map((edu, idx) => (
          <div key={edu.id} className="array-item">
            <div className="array-item-title">
              School #{idx + 1}
              {data.education.length > 1 && (
                <button className="btn-danger p-1" onClick={() => removeEducation(edu.id)}><Trash2 size={16} /></button>
              )}
            </div>
            <div className="input-group">
              <label className="input-label">Degree / Certificate</label>
              <input className="input-field" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} placeholder={idx === 0 ? "10th" : idx === 1 ? "12th" : idx === 2 ? "BTech in Computer Science" : "B.Tech in Computer Science"} />
            </div>
            <div className="input-row">
              <div className="input-group">
                <label className="input-label">Institution</label>
                <input className="input-field" value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Location</label>
                <input className="input-field" value={edu.location} onChange={(e) => updateEducation(edu.id, 'location', e.target.value)} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label className="input-label">Marks / CGPA</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    className="input-field" 
                    value={edu.scoreType || 'CGPA (out of 10)'} 
                    onChange={(e) => updateEducation(edu.id, 'scoreType', e.target.value)}
                    style={{ flex: 1, paddingRight: '8px' }}
                  >
                    <option value="CGPA (out of 10)">CGPA (10)</option>
                    <option value="CGPA (out of 9.5)">CGPA (9.5)</option>
                    <option value="Percentage (%)">Percentage (%)</option>
                  </select>
                  <input className="input-field" style={{ flex: 1 }} value={edu.score} onChange={(e) => updateEducation(edu.id, 'score', e.target.value)} placeholder="e.g. 8.5" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Start & End Date</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="input-field" value={edu.startDate} onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)} placeholder="Aug 2020" />
                  <input className="input-field" value={edu.endDate} onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)} placeholder="May 2024" />
                </div>
              </div>
            </div>
          </div>
        ))}
        <button className="btn btn-outline w-full mt-2" onClick={addEducation}><Plus size={16} /> Add Education</button>
      </Section>

      <Section title="Skills">
        <div className="text-sm text-gray-500 mb-4 pb-2 border-b">
          Recommended: Use 4 skill categories for best formatting. (Min 3, Max 6 categories Allowed. Max 6 skills per category)
        </div>
        {data.skills.map((skill, idx) => (
          <div key={skill.id} className="array-item">
            <div className="array-item-title">
              Category #{idx + 1}
              <button className="btn-danger p-1" onClick={() => removeSkillCategory(skill.id)}><Trash2 size={16} /></button>
            </div>
            <div className="input-group">
              <label className="input-label">Category Name</label>
              <input className="input-field" value={skill.name} onChange={(e) => updateSkillCategory(skill.id, 'name', e.target.value)} placeholder="e.g. Languages" />
            </div>
            <div className="input-group">
              <label className="input-label">Skills (comma separated)</label>
              <input className="input-field" value={skill.items} onChange={(e) => updateSkillCategory(skill.id, 'items', e.target.value)} placeholder="Java, Python, C++" />
              <SkillAutocomplete 
                categoryName={skill.name} 
                currentItems={skill.items} 
                onSelect={(newItems) => updateSkillCategory(skill.id, 'items', newItems)} 
              />
            </div>
          </div>
        ))}
        <button className="btn btn-outline w-full mt-2" onClick={addSkillCategory} disabled={data.skills.length >= 6}>
          <Plus size={16} /> Add Skill Category
        </button>
      </Section>

      <Section title="Projects">
        <div className="text-sm text-gray-500 mb-4 pb-2 border-b">Maximum 4 projects allowed. AI feedback available for descriptions.</div>
        {data.projects.map((proj, idx) => {
          const descWords = proj.description.split(/\s+/).filter(Boolean).length;
          return (
          <div key={proj.id} className="array-item">
            <div className="array-item-title">
              Project #{idx + 1}
              <button className="btn-danger p-1" onClick={() => removeProject(proj.id)}><Trash2 size={16} /></button>
            </div>
            <div className="input-row">
              <div className="input-group flex-2">
                <label className="input-label">Title</label>
                <input className="input-field" value={proj.title} onChange={(e) => updateProject(proj.id, 'title', e.target.value)} placeholder="E-Commerce Platform" />
              </div>
              <div className="input-group">
                <label className="input-label">Date</label>
                <input className="input-field" value={proj.date} onChange={(e) => updateProject(proj.id, 'date', e.target.value)} placeholder="Jan 2024 - Mar 2024" />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Technologies Used</label>
              <input className="input-field" value={proj.technologies} onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)} placeholder="React, Node.js, MongoDB" />
            </div>
            <div className="input-row">
              <div className="input-group">
                <label className="input-label">Live Link</label>
                <input className="input-field" value={proj.link} onChange={(e) => updateProject(proj.id, 'link', e.target.value)} placeholder="https://..." />
              </div>
              <div className="input-group">
                <label className="input-label">GitHub</label>
                <input className="input-field" value={proj.github} onChange={(e) => updateProject(proj.id, 'github', e.target.value)} placeholder="https://github.com/..." />
              </div>
            </div>
            <div className="input-group">
              <div className="input-label">
                <span>Description</span>
                <span className={`input-count-limit ${descWords >= 25 ? 'limit-reached' : ''}`}>
                  {descWords}/25 words
                </span>
              </div>
              <textarea 
                className="input-field" 
                value={proj.description} 
                onChange={(e) => updateProject(proj.id, 'description', e.target.value)} 
                placeholder="A short description..."
                rows={2}
              />
            </div>
          </div>
        )})}
        <button className="btn btn-outline w-full mt-2" onClick={addProject} disabled={data.projects.length >= 4}>
          <Plus size={16} /> Add Project
        </button>
      </Section>

      <Section title="Experience / Internships">
        {data.experience.map((exp, idx) => (
          <div key={exp.id} className="array-item">
            <div className="array-item-title">
              Role #{idx + 1}
              <button className="btn-danger p-1" onClick={() => removeExperience(exp.id)}><Trash2 size={16} /></button>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label className="input-label">Company</label>
                <input className="input-field" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Role</label>
                <input className="input-field" value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label className="input-label">Location & Type</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="input-field" value={exp.location} onChange={(e) => updateExperience(exp.id, 'location', e.target.value)} placeholder="Remote" />
                  <input className="input-field" value={exp.type} onChange={(e) => updateExperience(exp.id, 'type', e.target.value)} placeholder="Internship" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Start & End Date</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="input-field" value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} placeholder="May 2023" />
                  <input className="input-field" value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} placeholder="Jul 2023" />
                </div>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Bullet Points (Max 3, 15 words max each)</label>
              {exp.bulletPoints.map((bp, bidx) => (
                 bidx < 3 && (
                  <div key={bidx} style={{ marginBottom: '8px' }}>
                    <textarea 
                      className="input-field" 
                      value={bp} 
                      onChange={(e) => updateExperienceBullet(exp.id, bidx, e.target.value)} 
                      placeholder={`Bullet point ${bidx + 1}`}
                      rows={2}
                    />
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
        <button className="btn btn-outline w-full mt-2" onClick={addExperience}><Plus size={16} /> Add Experience</button>
      </Section>

      <Section title="Extra Curricular Activities">
        <div className="text-sm text-gray-500 mb-2">
          Note: You can choose only ONE section — Extra Curricular Activities or Certifications (recommended: Extra Curricular Activities).
        </div>
        {hasCertifications && (
          <div className="text-sm text-error mb-2 font-medium">This section is disabled because the other is already in use.</div>
        )}
        <div className={hasCertifications ? 'opacity-50 pointer-events-none' : ''}>
          {data.extraCurricular.map((item, idx) => (
            <div key={idx} className="input-row" style={{ alignItems: 'center' }}>
              <div className="input-group flex-1" style={{ width: '100%', marginBottom: '8px' }}>
                <input 
                  className="input-field" 
                  value={item} 
                  onChange={(e) => updateExtraCurricular(idx, e.target.value)} 
                  placeholder="e.g. Winner of Hackathon 2023"
                  disabled={hasCertifications}
                />
              </div>
              <button 
                className="btn-danger p-1" 
                onClick={() => removeExtraCurricular(idx)}
                disabled={hasCertifications}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button 
            className="btn btn-outline w-full mt-2" 
            onClick={addExtraCurricular}
            disabled={hasCertifications}
          >
            <Plus size={16} /> Add Activity
          </button>
        </div>
      </Section>

      <Section title="Certifications">
        <div className="text-sm text-gray-500 mb-2">
          Note: You can choose only ONE section — Extra Curricular Activities or Certifications (recommended: Extra Curricular Activities).
        </div>
        {hasExtraCurricular && (
          <div className="text-sm text-error mb-2 font-medium">This section is disabled because the other is already in use.</div>
        )}
        <div className={hasExtraCurricular ? 'opacity-50 pointer-events-none' : ''}>
          <div className="text-sm text-gray-500 mb-4 pb-2 border-b">Add certification details (title, link, date) or a single descriptive line.</div>
          {(data.certifications || []).map((cert, idx) => (
            <div key={cert.id} className="array-item">
              <div className="array-item-title">
                Certification #{idx + 1}
                <button 
                  className="btn-danger p-1" 
                  onClick={() => removeCertification(cert.id)}
                  disabled={hasExtraCurricular}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="input-group">
                <label className="input-label">Certification Title</label>
                <input 
                  className="input-field" 
                  value={cert.title} 
                  onChange={(e) => updateCertification(cert.id, 'title', e.target.value)} 
                  placeholder="e.g. AWS Solutions Architect"
                  disabled={hasExtraCurricular}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Issuing Organisation</label>
                <input 
                  className="input-field" 
                  value={cert.issuer} 
                  onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)} 
                  placeholder="e.g. Amazon Web Services"
                  disabled={hasExtraCurricular}
                />
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label className="input-label">Link (optional)</label>
                  <input 
                    className="input-field" 
                    value={cert.link} 
                    onChange={(e) => updateCertification(cert.id, 'link', e.target.value)} 
                    placeholder="https://credential.url/..."
                    disabled={hasExtraCurricular}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Date (optional)</label>
                  <input 
                    className="input-field" 
                    value={cert.date} 
                    onChange={(e) => updateCertification(cert.id, 'date', e.target.value)} 
                    placeholder="Jan 2024"
                    disabled={hasExtraCurricular}
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">— OR — Single descriptive line</label>
                <input 
                  className="input-field" 
                  value={cert.description} 
                  onChange={(e) => updateCertification(cert.id, 'description', e.target.value)} 
                  placeholder="e.g. Certified Kubernetes Administrator (CKA) — Dec 2023"
                  disabled={hasExtraCurricular}
                />
              </div>
            </div>
          ))}
          <button 
            className="btn btn-outline w-full mt-2" 
            onClick={addCertification}
            disabled={hasExtraCurricular}
          >
            <Plus size={16} /> Add Certification
          </button>
        </div>
      </Section>

      <div style={{ height: '40px' }}></div>
    </div>
  );
};
