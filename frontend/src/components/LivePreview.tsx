import React from 'react';
import type { ResumeData } from '../types/resume';

interface LivePreviewProps {
  data: ResumeData;
}

/** Ensure a URL has a protocol prefix for href */
const ensureHref = (url: string): string => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.includes('@')) return `mailto:${url}`;
  return `https://${url}`;
};

export const LivePreview: React.FC<LivePreviewProps> = ({ data }) => {
  const { personalDetails, summary, education, skills, projects, experience, extraCurricular, certifications = [] } = data;

  return (
    <div id="resume-container" className="a4-container">
      {/* Header Section */}
      <div className="resume-header">
        <div className="resume-name">{personalDetails.fullName || 'FIRST NAME LAST NAME'}</div>
        <div className="resume-contact">
          {personalDetails.phone && <span>{personalDetails.phone}</span>}
          {personalDetails.email && (
            <span>
              <a href={`mailto:${personalDetails.email}`} target="_blank" rel="noopener noreferrer">{personalDetails.email}</a>
            </span>
          )}
          {personalDetails.linkedin && (
            <span>
              <a href={ensureHref(personalDetails.linkedin)} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </span>
          )}
          {personalDetails.github && (
            <span>
              <a href={ensureHref(personalDetails.github)} target="_blank" rel="noopener noreferrer">GitHub</a>
            </span>
          )}
          {personalDetails.leetcode && (
            <span>
              <a href={ensureHref(personalDetails.leetcode)} target="_blank" rel="noopener noreferrer">LeetCode</a>
            </span>
          )}
          {personalDetails.portfolio && (
            <span>
              <a href={ensureHref(personalDetails.portfolio)} target="_blank" rel="noopener noreferrer">Portfolio</a>
            </span>
          )}
          {personalDetails.location && <span>{personalDetails.location}</span>}
        </div>
      </div>

      {/* Global spacing reduction applied via inline style for paper */}
      <div className="resume-paper" style={{ lineHeight: '1.2', padding: '8mm 15mm' }}>
        
        {/* Summary */}
        {summary && (
          <div className="resume-section">
            <div className="resume-section-title">Career Summary</div>
            <div className="resume-summary">{summary}</div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && education[0].institution && (
          <div className="resume-section" style={{ marginBottom: '1.5mm' }}>
            <div className="resume-section-title">Education</div>
            {education.map(edu => (
              <div key={edu.id} className="resume-item" style={{ marginBottom: '1mm' }}>
                <div className="resume-item-header">
                  <span className="resume-item-title">{edu.degree}</span>
                  <span className="resume-item-date">{edu.startDate} – {edu.endDate}</span>
                </div>
                <div style={{ fontSize: '9.5pt', fontStyle: 'italic', marginTop: '-1px' }}>
                  {edu.institution}{edu.location ? `, ${edu.location}` : ''} | {edu.score ? (edu.scoreType?.includes('Percentage') ? `Percentage: ${edu.score}%` : `CGPA: ${edu.score}`) : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.some(s => s.name && s.items) && (
          <div className="resume-section">
            <div className="resume-section-title">Skills</div>
            <div className="resume-skills-group">
              {skills.map(skill => skill.name && skill.items && (
                <div key={skill.id} className="resume-skill-row" style={{ display: 'flex', alignItems: 'baseline', marginBottom: '1px' }}>
                  <span className="resume-item-subtitle" style={{ whiteSpace: 'nowrap', marginRight: '6px', fontWeight: 'bold' }}>
                    • {skill.name}:
                  </span>
                  <span>{skill.items}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && projects[0].title && (
          <div className="resume-section">
            <div className="resume-section-title">Projects</div>
            {projects.map(proj => (
              <div key={proj.id} className="resume-item">
                <div className="resume-item-header">
                  <span className="resume-item-title">
                    <span style={{ fontSize: '10pt', marginRight: '4px' }}>●</span>
                    {proj.title} {proj.technologies && `(${proj.technologies})`}
                    {(proj.link || proj.github) && <span style={{ fontWeight: 'normal' }}>{' — '}</span>}
                    {proj.link && <a href={ensureHref(proj.link)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'black', fontWeight: 'normal' }}>Live</a>}
                    {proj.link && proj.github && <span style={{ fontWeight: 'normal' }}>{' | '}</span>}
                    {proj.github && <a href={ensureHref(proj.github)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'black', fontWeight: 'normal' }}>GitHub</a>}
                  </span>
                  <span className="resume-item-date">{proj.date ? `— ${proj.date}` : ''}</span>
                </div>
                <div style={{ paddingLeft: '5.5mm' }}>{proj.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && experience[0].company && (
          <div className="resume-section">
            <div className="resume-section-title">Experience / Internships</div>
            {experience.map(exp => (
              <div key={exp.id} className="resume-item">
                <div className="resume-item-header">
                  <span className="resume-item-title">
                    <span style={{ fontSize: '10pt', marginRight: '4px' }}>●</span>
                    {exp.company}
                  </span>
                  <span className="resume-item-date">{exp.location} {exp.type && `(${exp.type})`}</span>
                </div>
                <div className="resume-item-header" style={{ fontStyle: 'italic', fontSize: '9.5pt', marginTop: '-2px' }}>
                  <span style={{ marginLeft: '1.5mm' }}>
                    {exp.role}
                  </span>
                  <span className="resume-item-date">{exp.startDate} – {exp.endDate}</span>
                </div>
                <ul className="resume-list" style={{ marginTop: '1px' }}>
                  {exp.bulletPoints.map((bp, i) => bp && <li key={i}>{bp}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Extra Curricular (Above Certifications) */}
        {extraCurricular.some(e => e.trim()) && (
          <div className="resume-section">
            <div className="resume-section-title">Extra Curricular Activities</div>
            <ul className="resume-list">
              {extraCurricular.map((item, i) => item.trim() && <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}

        {/* Certifications (Only if No ECs) */}
        {!extraCurricular.some(e => e.trim()) && certifications.length > 0 && certifications.some(c => c.title.trim() || c.description.trim()) && (
          <div className="resume-section">
            <div className="resume-section-title">Certifications</div>
            {certifications.map(cert => (
              <div key={cert.id} className="resume-item">
                {cert.title ? (
                  <>
                    <div className="resume-item-header">
                      <span className="resume-item-title">
                        {cert.link ? (
                          <a href={ensureHref(cert.link)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'black' }}>{cert.title}</a>
                        ) : (
                          cert.title
                        )}
                        {cert.issuer && ` — ${cert.issuer}`}
                      </span>
                      {cert.date && <span className="resume-item-date">{cert.date}</span>}
                    </div>
                  </>
                ) : cert.description ? (
                  <div style={{ marginBottom: '2px' }}>• {cert.description}</div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
