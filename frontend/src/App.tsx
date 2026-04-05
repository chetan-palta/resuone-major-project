import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { FileText, Download } from 'lucide-react';
import { useResume } from './context/ResumeContext';
import { LivePreview } from './components/LivePreview';
import { ResumeForm } from './components/ResumeForm';
import { Home } from './components/Home';
import { ResumeImport } from './components/ResumeImport';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import axios from 'axios';

axios.defaults.withCredentials = true;

const MainApp = () => {
  const { data, clearSavedData } = useResume();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (data.id) {
        // Automatically save on export if logged in and managing a resume
        await axios.post('http://localhost:5000/api/resumes', data);
      }
      
      const response = await fetch('http://localhost:5000/api/resumes/export-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.personalDetails.fullName.replace(/\s+/g, '_') || 'resume'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      // Clear saved data after successful export
      clearSavedData();
    } catch (error) {
      console.error(error);
      alert('Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Left Input Panel */}
      <div className="left-panel">
        <header className="app-header">
          <div className="app-title">
            <FileText size={24} className="text-blue-600" style={{ color: 'var(--primary)' }} />
            ResuOne
          </div>
          <div className="flex items-center gap-3">
            <ResumeImport />
            <button
              className="btn btn-primary"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download size={18} />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </header>
        <div className="form-area">
          <ResumeForm />
        </div>
      </div>

      {/* Right Preview Panel */}
      <div className="right-panel">
        <LivePreview data={data} />
      </div>
    </div>
  );
};

// We create a hidden route that Puppeteer will visit
const RenderRoute = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/resumes/${id}`);
        if (!res.ok) throw new Error('Failed to fetch resume');
        const dbData = await res.json();

        // Map DB snake_case columns back to frontend camelCase
        const mappedData = {
          personalDetails: dbData.personal_details || {},
          summary: dbData.summary || '',
          education: dbData.education || [],
          skills: dbData.skills || [],
          projects: dbData.projects || [],
          experience: dbData.experience || [],
          extraCurricular: dbData.extra_curricular || []
        };

        setData(mappedData);
      } catch (err) {
        console.error(err);
        setError('Could not load resume');
      }
    };

    if (id) fetchResume();
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ background: 'white', display: 'flex', justifyContent: 'center' }}>
      <LivePreview data={data} />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resume" element={<MainApp />} />
        <Route path="/render/:id" element={<RenderRoute />} />
      </Routes>
    </Router>
  );
}

export default App;
