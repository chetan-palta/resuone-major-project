import pool from './src/config/db';
import { randomUUID } from 'crypto';

const testInsert = async () => {
    try {
        const id = randomUUID();
        const data = {
            personalDetails: { fullName: 'Test User' },
            summary: 'Test summary',
            education: [],
            skills: [],
            projects: [],
            experience: [],
            extraCurricular: []
        };

        const [result] = await pool.query(
            `INSERT INTO resumes (id, personal_details, summary, education, skills, projects, experience, extra_curricular) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, 
                JSON.stringify(data.personalDetails), 
                data.summary, 
                JSON.stringify(data.education), 
                JSON.stringify(data.skills), 
                JSON.stringify(data.projects), 
                JSON.stringify(data.experience), 
                JSON.stringify(data.extraCurricular)
            ]
        );
        console.log('Insert successful, ID:', id);
        process.exit(0);
    } catch (error) {
        console.error('Insert failed:', error);
        process.exit(1);
    }
};

testInsert();
