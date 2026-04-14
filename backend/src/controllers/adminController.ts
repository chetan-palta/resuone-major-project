import { Request, Response } from 'express';
import pool from '../config/db';

export const getAllResumes = async (req: Request, res: Response) => {
  try {
    // Note: In a real system, you'd have an isAdmin check. We assume protected or basic level for this requirement.

    const [rows]: any = await pool.query(`
      SELECT 
        r.id as resume_id,
        r.resume_name,
        r.resume_data,
        r.updated_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email
      FROM resumes r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.updated_at DESC
    `);
    
    // Parse JSON data for structured output
    const resumes = rows.map((r: any) => {
      let data = r.resume_data || {};
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) { }
      }

      // Safe extraction for branch / name from the structured resume
      const studentName = data?.personalDetails?.fullName || r.user_name || 'Unknown';
      let branch = 'Unknown';
      if (data?.education && Array.isArray(data.education)) {
        let validEdu = null;
        if (data.education.length >= 3) {
            const edu3 = data.education[2];
            const deg = (edu3.degree || '').toLowerCase();
            const inst = (edu3.institution || '').toLowerCase();
            if (!deg.includes('10th') && !deg.includes('12th') && !inst.includes('school')) {
                validEdu = edu3;
            }
        }
        
        if (!validEdu) {
            validEdu = data.education.find((edu: any) => {
               const deg = (edu.degree || '').toLowerCase();
               const inst = (edu.institution || '').toLowerCase();
               if (deg.includes('10th') || deg.includes('12th') || inst.includes('school')) return false;
               return inst.includes('guru nanak dev') || inst.includes('college') || inst.includes('university') || inst.includes('institute') || deg.includes('bca') || deg.includes('btech') || deg.includes('bba');
            });
        }
        
        if (validEdu) {
            branch = validEdu.degree || 'Unknown';
        } else if (data.education.length > 0) {
            branch = data.education[0].degree || 'Unknown';
        }
      }

      return {
        id: r.resume_id,
        resume_name: r.resume_name,
        user_name: r.user_name,
        user_email: r.user_email,
        student_name: studentName,
        branch: branch,
        updated_at: r.updated_at,
        structured_data: data
      };
    });

    res.json({ resumes });
  } catch (error) {
    console.error('Admin get resumes error:', error);
    res.status(500).json({ error: 'Internal server error fetching admin resumes' });
  }
};
