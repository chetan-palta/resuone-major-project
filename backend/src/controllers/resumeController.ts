import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import pool from '../config/db';
import { analyzeDescription } from '../services/aiService';
import { generatePdf } from '../services/pdfService';

export const getResumeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query('SELECT * FROM resumes WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Fetch resume error:', error);
    res.status(500).json({ error: 'Internal server error while fetching resume', details: error instanceof Error ? error.message : String(error) });
  }
};

export const analyzeText = (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const suggestions = analyzeDescription(text);
    res.json({ suggestions });
  } catch (error) {
    console.error('Text analysis error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
  }
};

export const submitResume = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Server-side validation
    if (data.summary && data.summary.split(/\s+/).filter(Boolean).length > 70) {
      return res.status(400).json({ error: 'Summary exceeds 70 words limit' });
    }
    if (data.projects && data.projects.some((p: any) => p.description && p.description.split(/\s+/).filter(Boolean).length > 30)) {
      return res.status(400).json({ error: 'Project description exceeds 30 words limit' });
    }
    if (data.projects && data.projects.length > 4) {
      return res.status(400).json({ error: 'Maximum 4 projects allowed' });
    }
    // other limits can be enforced similarly
    
    const id = randomUUID();
    const { personalDetails, summary, education, skills, projects, experience, extraCurricular } = data;

    const [result] = await pool.query(
      `INSERT INTO resumes (id, personal_details, summary, education, skills, projects, experience, extra_curricular) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        JSON.stringify(personalDetails || {}), 
        summary || '', 
        JSON.stringify(education || []), 
        JSON.stringify(skills || []), 
        JSON.stringify(projects || []), 
        JSON.stringify(experience || []), 
        JSON.stringify(extraCurricular || [])
      ]
    );

    res.status(201).json({ id, message: 'Resume saved successfully' });
  } catch (error) {
    console.error('Submit resume error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
  }
};

export const getResumePdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Fetch from database
    const [rows]: any = await pool.query('SELECT * FROM resumes WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const dbData = rows[0];

    // Map DB snake_case columns back to frontend camelCase
    const resumeData = {
      personalDetails: dbData.personal_details || {},
      summary: dbData.summary || '',
      education: dbData.education || [],
      skills: dbData.skills || [],
      projects: dbData.projects || [],
      experience: dbData.experience || [],
      extraCurricular: dbData.extra_curricular || []
    };

    // Generate PDF buffer using server-side template
    const pdfBuffer = await generatePdf(resumeData as any);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': `attachment; filename="resume_${id}.pdf"`
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Internal server error while generating PDF', details: error instanceof Error ? error.message : String(error) });
  }
};

export const exportDirect = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Generate PDF buffer using server-side template
    const pdfBuffer = await generatePdf(data as any);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': 'attachment; filename="resume.pdf"'
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Direct PDF generation error:', error);
    res.status(500).json({ error: 'Internal server error while generating PDF', details: error instanceof Error ? error.message : String(error) });
  }
};
