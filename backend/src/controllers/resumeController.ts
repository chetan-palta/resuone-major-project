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
    
    // Map traditional structure or single resume_data column
    const dbData = rows[0];
    if (dbData.resume_data) {
      return res.json({ id: dbData.id, ...dbData.resume_data });
    }
    
    // Fallback mapping for old data
    const resumeData = {
      id: dbData.id,
      personalDetails: dbData.personal_details || {},
      summary: dbData.summary || '',
      education: dbData.education || [],
      skills: dbData.skills || [],
      projects: dbData.projects || [],
      experience: dbData.experience || [],
      extraCurricular: dbData.extra_curricular || []
    };
    res.json(resumeData);
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
    const authReq = req as any;
    const userId = authReq.user?.id;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Server-side validation
    if (data.summary && data.summary.split(/\s+/).filter(Boolean).length > 70) {
      return res.status(400).json({ error: 'Summary exceeds 70 words limit' });
    }
    if (data.projects && data.projects.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 projects allowed' });
    }

    // Determine if updating or creating
    let resumeId = data.id;
    if (resumeId) {
      const [existing]: any = await pool.query('SELECT id FROM resumes WHERE id = ? AND user_id = ?', [resumeId, userId]);
      if (existing.length === 0) {
        return res.status(403).json({ error: 'Not authorized to update this resume or resume not found' });
      }
      
      await pool.query(
        'UPDATE resumes SET resume_name = ?, resume_data = ?, updated_at = NOW() WHERE id = ?',
        [data.resumeName || 'Untitled Resume', JSON.stringify(data), resumeId]
      );
    } else {
      // Check limit for new resume
      const [userResumes]: any = await pool.query('SELECT COUNT(*) as count FROM resumes WHERE user_id = ?', [userId]);
      if (userResumes[0].count >= 5) {
        return res.status(400).json({ error: 'Maximum 5 resumes allowed.' });
      }

      resumeId = randomUUID();
      await pool.query(
        'INSERT INTO resumes (id, user_id, resume_name, resume_data) VALUES (?, ?, ?, ?)',
        [resumeId, userId, data.resumeName || 'Untitled Resume', JSON.stringify(data)]
      );
    }

    res.status(200).json({ id: resumeId, message: 'Resume saved successfully' });
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

    // Read full JSON or fallback map DB columns
    const resumeData = dbData.resume_data ? dbData.resume_data : {
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

export const getUserResumes = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const [rows]: any = await pool.query('SELECT id, resume_name, resume_data, updated_at FROM resumes WHERE user_id = ? ORDER BY updated_at DESC', [userId]);
    
    // Parse the display info to make the list lightweight
    const resumes = rows.map((r: any) => {
      let title = r.resume_name && r.resume_name !== 'Untitled Resume' ? r.resume_name : "Untitled Resume";
      if (title === "Untitled Resume" && r.resume_data && r.resume_data.personalDetails && r.resume_data.personalDetails.fullName) {
        title = r.resume_data.personalDetails.fullName + " Resume";
      }
      return {
        id: r.id,
        title,
        updatedAt: r.updated_at
      };
    });

    res.json({ resumes, count: resumes.length });
  } catch (error) {
    console.error('Get user resumes error:', error);
    res.status(500).json({ error: 'Internal server error fetching resumes' });
  }
};

export const deleteResume = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const [result]: any = await pool.query('DELETE FROM resumes WHERE id = ? AND user_id = ?', [id, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Resume not found or unauthorized' });
    }

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ error: 'Internal server error deleting resume' });
  }
};
