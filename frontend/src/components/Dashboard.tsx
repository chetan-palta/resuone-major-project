import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Download, FileText, LogOut, ArrowLeft } from 'lucide-react';
import { useResume } from '../context/ResumeContext';

interface ResumeMeta {
  id: string;
  title: string;
  updatedAt: string;
}

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { setResumeData } = useResume();
  const [resumes, setResumes] = useState<ResumeMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchResumes();
  }, [user, navigate]);

  const fetchResumes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/resumes');
      setResumes(res.data.resumes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (resumes.length >= 5) return;
    navigate('/resume');
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/resumes/${id}`);
      setResumeData(res.data);
      navigate('/resume?id=' + id);
    } catch (error) {
      console.error('Failed to load resume for editing', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/resumes/${id}`);
      setResumes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete resume');
    }
  };

  const handleDownload = async (id: string) => {
    try {
      window.location.href = `http://localhost:5000/api/resumes/${id}/pdf`;
    } catch (err) {
      alert('Failed to generate PDF');
    }
  };

  if (loading) return <div className="p-8 text-center dark:text-gray-300">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">ResuOne</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Hello, {user?.name}</span>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0 flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
              Your Resumes
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 flex-col items-end">
            <button
              type="button"
              onClick={handleCreate}
              disabled={resumes.length >= 5}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                resumes.length >= 5 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Resume
            </button>
            {resumes.length >= 5 && (
              <span className="text-xs text-red-500 mt-1">Maximum 5 resumes allowed.</span>
            )}
          </div>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No resumes</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new resume.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" />
                New Resume
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="p-6 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1 truncate">
                    {resume.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between rounded-b-lg">
                  <button
                    onClick={() => handleEdit(resume.id)}
                    className="flex-1 flex justify-center items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDownload(resume.id)}
                    className="flex-1 flex justify-center items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="flex-1 flex justify-center items-center text-red-600 hover:text-red-900 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
