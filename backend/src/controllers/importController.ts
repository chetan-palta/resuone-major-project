import { Request, Response } from 'express';
import { processResumeImport } from '../services/resumeImportService';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const importResume = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded. Please select a PDF or DOCX file.' });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'File too large. Maximum file size is 5 MB.' });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Unsupported file type. Only PDF (.pdf) and Word (.docx) files are accepted.',
      });
    }

    const result = await processResumeImport(file.buffer, file.mimetype);

    res.json({
      success: true,
      data: result.resumeData,
      suggestions: result.suggestions,
      sectionsDetected: result.sectionsDetected,
      message: `Resume imported successfully! Detected sections: ${result.sectionsDetected.join(', ') || 'none'}.`,
    });
  } catch (error: any) {
    console.error('Resume import error:', error);

    if (error.message === 'EMPTY_FILE') {
      return res.status(400).json({ error: 'The uploaded file appears to be empty or contains no readable text.' });
    }

    res.status(500).json({
      error: 'Failed to process the uploaded resume. Please ensure the file is not corrupted and try again.',
    });
  }
};
