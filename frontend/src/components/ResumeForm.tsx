import React, { useState } from 'react';
import { useResume } from '../context/ResumeContext';
import { ChevronDown, ChevronRight, Plus, Trash2, Wand2 } from 'lucide-react';

const AIFeedback = ({ text }: { text: string }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!text || text.trim().length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/resumes/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <button type="button" onClick={analyze} disabled={loading} className="ai-badge mb-2">
        <Wand2 size={12} />
        {loading ? 'Analyzing...' : 'AI Analyze'}
      </button>
      {suggestions.length > 0 && (
        <div className="ai-panel">
          <div className="ai-panel-title">
            <Wand2 size={16} /> Suggestions ({suggestions.length})
          </div>
          {suggestions.map((s, i) => (
            <div key={i} className="ai-suggestion">
              <div>Consider replacing <span className="ai-verb">"{s.original}"</span> with <span className="ai-suggestion-replace">"{s.suggestion}"</span></div>
              <div className="text-sm text-gray-500 mt-1">{s.reason}</div>
            </div>
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
    addCertification, updateCertification, removeCertification
  } = useResume();

  const handlePersonal = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePersonalDetails(e.target.name, e.target.value);
  };

  const summaryWords = data.summary.split(/\s+/).filter(Boolean).length;

  return (
    <div>
      <Section title="Personal Details" defaultOpen={true}>
        <div className="input-group">
          <label className="input-label">Full Name</label>
          <input className="input-field" name="fullName" value={data.personalDetails.fullName} onChange={handlePersonal} placeholder="e.g. John Doe" />
        </div>
        <div className="input-row">
          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="input-field" name="email" value={data.personalDetails.email} onChange={handlePersonal} placeholder="john@example.com" />
          </div>
          <div className="input-group">
            <label className="input-label">Phone</label>
            <input className="input-field" name="phone" value={data.personalDetails.phone} onChange={handlePersonal} placeholder="+1 234 567 8900" />
          </div>
        </div>
        <div className="input-row">
          <div className="input-group">
            <label className="input-label">LinkedIn</label>
            <input className="input-field" name="linkedin" value={data.personalDetails.linkedin} onChange={handlePersonal} placeholder="linkedin.com/in/johndoe" />
          </div>
          <div className="input-group">
            <label className="input-label">GitHub</label>
            <input className="input-field" name="github" value={data.personalDetails.github} onChange={handlePersonal} placeholder="github.com/johndoe" />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Location</label>
          <input className="input-field" name="location" value={data.personalDetails.location} onChange={handlePersonal} placeholder="City, Country" />
        </div>
      </Section>

      <Section title="Career Summary">
        <div className="input-group">
          <div className="input-label">
            <span>Summary</span>
            <span className={`input-count-limit ${summaryWords >= 70 ? 'limit-reached' : ''}`}>
              {summaryWords}/70 words
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
              <input className="input-field" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} placeholder="B.Tech in Computer Science" />
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
                <label className="input-label">Score / CGPA</label>
                <input className="input-field" value={edu.score} onChange={(e) => updateEducation(edu.id, 'score', e.target.value)} placeholder="8.5/10.0" />
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
            </div>
          </div>
        ))}
        <button className="btn btn-outline w-full mt-2" onClick={addSkillCategory}><Plus size={16} /> Add Skill Category</button>
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
                <span className={`input-count-limit ${descWords >= 30 ? 'limit-reached' : ''}`}>
                  {descWords}/30 words
                </span>
              </div>
              <textarea 
                className="input-field" 
                value={proj.description} 
                onChange={(e) => updateProject(proj.id, 'description', e.target.value)} 
                placeholder="A short description..."
                rows={2}
              />
              <AIFeedback text={proj.description} />
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
              <label className="input-label">Bullet Points (Max 3)</label>
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
                    <AIFeedback text={bp} />
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
        <button className="btn btn-outline w-full mt-2" onClick={addExperience}><Plus size={16} /> Add Experience</button>
      </Section>

      <Section title="Extra Curricular Activities">
        {data.extraCurricular.map((item, idx) => (
          <div key={idx} className="input-row" style={{ alignItems: 'center' }}>
            <div className="input-group flex-1" style={{ width: '100%', marginBottom: '8px' }}>
              <input className="input-field" value={item} onChange={(e) => updateExtraCurricular(idx, e.target.value)} placeholder="e.g. Winner of Hackathon 2023" />
            </div>
            <button className="btn-danger p-1" onClick={() => removeExtraCurricular(idx)}><Trash2 size={16} /></button>
          </div>
        ))}
        <button className="btn btn-outline w-full mt-2" onClick={addExtraCurricular}><Plus size={16} /> Add Activity</button>
      </Section>

      <Section title="Certifications">
        <div className="text-sm text-gray-500 mb-4 pb-2 border-b">Add certification details (title, link, date) or a single descriptive line.</div>
        {(data.certifications || []).map((cert, idx) => (
          <div key={cert.id} className="array-item">
            <div className="array-item-title">
              Certification #{idx + 1}
              <button className="btn-danger p-1" onClick={() => removeCertification(cert.id)}><Trash2 size={16} /></button>
            </div>
            <div className="input-group">
              <label className="input-label">Certification Title</label>
              <input className="input-field" value={cert.title} onChange={(e) => updateCertification(cert.id, 'title', e.target.value)} placeholder="e.g. AWS Solutions Architect" />
            </div>
            <div className="input-row">
              <div className="input-group">
                <label className="input-label">Link (optional)</label>
                <input className="input-field" value={cert.link} onChange={(e) => updateCertification(cert.id, 'link', e.target.value)} placeholder="https://credential.url/..." />
              </div>
              <div className="input-group">
                <label className="input-label">Date (optional)</label>
                <input className="input-field" value={cert.date} onChange={(e) => updateCertification(cert.id, 'date', e.target.value)} placeholder="Jan 2024" />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">— OR — Single descriptive line</label>
              <input className="input-field" value={cert.description} onChange={(e) => updateCertification(cert.id, 'description', e.target.value)} placeholder="e.g. Certified Kubernetes Administrator (CKA) — Dec 2023" />
            </div>
          </div>
        ))}
        <button className="btn btn-outline w-full mt-2" onClick={addCertification}><Plus size={16} /> Add Certification</button>
      </Section>

      <div style={{ height: '40px' }}></div>
    </div>
  );
};
