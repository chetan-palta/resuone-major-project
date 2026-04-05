import type { ResumeData, Education, SkillCategory, Project, Experience, Certification } from '../types/resume';

export const renderHtml = (data: ResumeData): string => {
  const { personalDetails, summary, education, skills, projects, experience, extraCurricular, certifications = [] } = data;

  const ensureHref = (url: string): string => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (url.includes('@')) return `mailto:${url}`;
    return `https://${url}`;
  };

  const style = `
    :root {
      --font-serif: 'Times New Roman', Times, serif;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; }
    .a4-container { width: 210mm; background: white; margin: 0 auto; }
    .resume-paper { padding: 8mm 15mm; width: 100%; font-family: var(--font-serif); color: black; font-size: 11pt; line-height: 1.2; box-sizing: border-box; }
    .resume-header { text-align: center; margin-bottom: 3mm; }
    .resume-name { font-family: 'Times New Roman', serif; font-size: 24pt; font-weight: 700; margin-bottom: 2mm; text-transform: uppercase; color: #0b2239; }
    .resume-contact { font-size: 11pt; margin-bottom: 2px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
    .resume-contact span { border-right: 1px solid #777; padding-right: 8px; margin-right: 0; }
    .resume-contact span:last-child { border-right: none; }
    .resume-contact a { color: black; text-decoration: none; }
    .resume-section { margin-bottom: 2mm; }
    .resume-section-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid black; margin-bottom: 1.5mm; padding-bottom: 1px; color: #000; }
    .resume-item { margin-bottom: 1.5mm; }
    .resume-summary { text-align: justify; margin-bottom: 2.5mm; }
    .resume-item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
    .resume-item-title { font-weight: bold; font-size: 11pt; }
    .resume-item-subtitle { font-style: italic; font-size: 11pt; }
    .resume-item-date { font-size: 11pt; white-space: nowrap; }
    .resume-list { padding-left: 6mm; margin-top: 1px; list-style-type: disc; }
    .resume-list li { margin-bottom: 1px; text-align: justify; }
    .resume-skills-group { margin-bottom: 1px; display: grid; grid-template-columns: 1fr 1fr; gap: 0 10px; }
    .resume-skill-row { margin-bottom: 1px; display: flex; align-items: flex-start; }
    .resume-skill-row b { min-width: 100px; display: inline-block; }
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Resume</title>
      <style>${style}</style>
    </head>
    <body>
      <div class="a4-container">
        <div class="resume-paper">
          <div class="resume-header">
            <div class="resume-name">${personalDetails.fullName || 'FIRST NAME LAST NAME'}</div>
            <div class="resume-contact">
              ${personalDetails.phone ? `<span>${personalDetails.phone}</span>` : ''}
              ${personalDetails.email ? `<span><a href="mailto:${personalDetails.email}">${personalDetails.email}</a></span>` : ''}
              ${personalDetails.linkedin ? `<span><a href="${ensureHref(personalDetails.linkedin)}">LinkedIn</a></span>` : ''}
              ${personalDetails.github ? `<span><a href="${ensureHref(personalDetails.github)}">GitHub</a></span>` : ''}
              ${personalDetails.leetcode ? `<span><a href="${ensureHref(personalDetails.leetcode)}">LeetCode</a></span>` : ''}
              ${personalDetails.portfolio ? `<span><a href="${ensureHref(personalDetails.portfolio)}">Portfolio</a></span>` : ''}
              ${personalDetails.location ? `<span>${personalDetails.location}</span>` : ''}
            </div>
          </div>

          ${summary ? `
            <div class="resume-section">
              <div class="resume-section-title">Career Summary</div>
              <div class="resume-summary">${summary}</div>
            </div>
          ` : ''}

          ${education.length > 0 && education[0].institution ? `
            <div class="resume-section" style="margin-bottom: 1.5mm;">
              <div class="resume-section-title">Education</div>
              ${education.map((edu: Education) => `
                <div class="resume-item" style="margin-bottom: 1mm;">
                  <div class="resume-item-header">
                    <span class="resume-item-title">${edu.degree}</span>
                    <span class="resume-item-date">${edu.startDate} – ${edu.endDate}</span>
                  </div>
                  <div style="font-size: 9.5pt; font-style: italic; margin-top: -1px;">
                    ${edu.institution}${edu.location ? `, ${edu.location}` : ''} | ${edu.score ? (edu.scoreType?.includes('Percentage') ? `Percentage: ${edu.score}%` : `CGPA: ${edu.score}`) : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${skills.some((s: SkillCategory) => s.name && s.items) ? `
            <div class="resume-section">
              <div class="resume-section-title">Skills</div>
              <div class="resume-skills-group">
                ${skills.map((skill: SkillCategory) => skill.name && skill.items ? `
                  <div class="resume-skill-row">
                    <span class="resume-item-subtitle" style="margin-right: 6px">• <b>${skill.name}:</b></span>
                    <span>${skill.items}</span>
                  </div>
                ` : '').join('')}
              </div>
            </div>
          ` : ''}

          ${projects.length > 0 && projects[0].title ? `
            <div class="resume-section">
              <div class="resume-section-title">Projects</div>
              ${projects.map((proj: Project) => `
                <div class="resume-item">
                  <div class="resume-item-header">
                    <span class="resume-item-title">
                      <span style="font-size: 10pt; margin-right: 4px;">●</span>
                      ${proj.title} ${proj.technologies ? `(${proj.technologies})` : ''}
                      ${(proj.link || proj.github) ? ' — ' : ''}
                      ${proj.link ? `<a href="${ensureHref(proj.link)}" style="text-decoration: underline; color: black;">Live</a>` : ''} 
                      ${(proj.link && proj.github) ? ' | ' : ''}
                      ${proj.github ? `<a href="${ensureHref(proj.github)}" style="text-decoration: underline; color: black;">GitHub</a>` : ''}
                    </span>
                    <span class="resume-item-date">${proj.date ? `— ${proj.date}` : ''}</span>
                  </div>
                  <div style="padding-left: 5.5mm;">${proj.description}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${experience.length > 0 && experience[0].company ? `
            <div class="resume-section">
              <div class="resume-section-title">Experience / Internships</div>
              ${experience.map((exp: Experience) => `
                <div class="resume-item">
                  <div class="resume-item-header">
                    <span class="resume-item-title">
                      <span style="font-size: 10pt; margin-right: 4px;">●</span>
                      ${exp.company}
                    </span>
                    <span class="resume-item-date">${exp.location} ${exp.type ? `(${exp.type})` : ''}</span>
                  </div>
                  <div class="resume-item-header" style="font-style: italic; font-size: 9.5pt; margin-top: -2px;">
                    <span style="margin-left: 1.5mm;">
                      <span style="font-size: 9pt; margin-right: 4px;">○</span>
                      ${exp.role}
                    </span>
                    <span class="resume-item-date">${exp.startDate} – ${exp.endDate}</span>
                  </div>
                  <ul class="resume-list" style="margin-top: 1px;">
                    ${exp.bulletPoints.map((bp: string) => bp ? `<li>${bp}</li>` : '').join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${extraCurricular.some((e: string) => e.trim()) ? `
            <div class="resume-section">
              <div class="resume-section-title">Extra Curricular Activities</div>
              <ul class="resume-list">
                ${extraCurricular.map((item: string) => item.trim() ? `<li>${item}</li>` : '').join('')}
              </ul>
            </div>
          ` : (!extraCurricular.some((e: string) => e.trim()) && certifications.length > 0 && certifications.some(c => c.title.trim() || c.description.trim())) ? `
            <div class="resume-section">
              <div class="resume-section-title">Certifications</div>
              ${certifications.map((cert: Certification) => `
                <div class="resume-item">
                  ${cert.title ? `
                    <div class="resume-item-header">
                      <span class="resume-item-title">
                        ${cert.link ? `<a href="${ensureHref(cert.link)}" style="text-decoration: underline; color: black;">${cert.title}</a>` : cert.title}
                        ${cert.issuer ? ` — ${cert.issuer}` : ''}
                      </span>
                      ${cert.date ? `<span class="resume-item-date">${cert.date}</span>` : ''}
                    </div>
                  ` : cert.description ? `
                    <div style="margin-bottom: 2px">• ${cert.description}</div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
};
