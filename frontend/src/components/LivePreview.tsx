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
      <div className="resume-paper">
        {/* Header Section */}
        <div className="resume-header">
          <div className="resume-name">{personalDetails.fullName || 'FIRST NAME LAST NAME'}</div>
          <div className="resume-contact">
            {personalDetails.phone && <span>{personalDetails.phone} |</span>}
            {personalDetails.email && (
              <span>
                <a href={`mailto:${personalDetails.email}`} target="_blank" rel="noopener noreferrer">{personalDetails.email}</a> |
              </span>
            )}
            {personalDetails.linkedin && (
              <span>
                <a href={ensureHref(personalDetails.linkedin)} target="_blank" rel="noopener noreferrer">{personalDetails.linkedin.replace(/^https?:\/\//, '')}</a> |
              </span>
            )}
            {personalDetails.github && (
              <span>
                <a href={ensureHref(personalDetails.github)} target="_blank" rel="noopener noreferrer">{personalDetails.github.replace(/^https?:\/\//, '')}</a> |
              </span>
            )}
            {personalDetails.location && <span>{personalDetails.location}</span>}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="resume-section">
            <div className="resume-section-title">Career Summary</div>
            <div className="resume-summary">{summary}</div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && education[0].institution && (
          <div className="resume-section">
            <div className="resume-section-title">Education</div>
            {education.map(edu => (
              <div key={edu.id} className="resume-item">
                <div className="resume-item-header">
                  <span className="resume-item-title">{edu.degree}</span>
                  <span className="resume-item-date">{edu.startDate} – {edu.endDate}</span>
                </div>
                <div className="resume-item-header">
                  <span className="resume-item-subtitle">• {edu.institution}, {edu.location} | {edu.score && `Score: ${edu.score}`}</span>
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
                <div key={skill.id} className="resume-skill-row">
                  <span className="resume-item-subtitle mr-2" style={{ marginRight: '6px' }}>• <b>{skill.name}:</b></span>
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
                  <span className="resume-item-title">{proj.title} {proj.technologies && `(${proj.technologies})`}</span>
                  <span className="resume-item-date">{proj.date}</span>
                </div>
                {(proj.link || proj.github) && (
                  <div style={{ fontSize: '10pt', marginBottom: '1px' }}>
                    {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'black' }}>Live</a>} 
                    {proj.link && proj.github && ' | '}
                    {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'black' }}>GitHub</a>}
                  </div>
                )}
                <div>{proj.description}</div>
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
                  <span className="resume-item-title">{exp.company}</span>
                  <span className="resume-item-date">{exp.startDate} – {exp.endDate}</span>
                </div>
                <div className="resume-item-header">
                  <span className="resume-item-subtitle">{exp.role}</span>
                </div>
                <div style={{ fontSize: '10pt', fontStyle: 'italic', marginBottom: '2px' }}>{exp.type} | {exp.location}</div>
                <ul className="resume-list">
                  {exp.bulletPoints.map((bp, i) => bp && <li key={i}>{bp}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Extra Curricular */}
        {extraCurricular.some(e => e) && (
          <div className="resume-section">
            <div className="resume-section-title">Extra Curricular Activities</div>
            <ul className="resume-list">
              {extraCurricular.map((item, i) => item && <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && certifications.some(c => c.title || c.description) && (
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
