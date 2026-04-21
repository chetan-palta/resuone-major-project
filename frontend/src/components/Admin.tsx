import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye } from 'lucide-react';
import { API_URL } from '../config';

export const Admin = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterName, setFilterName] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  useEffect(() => {
    // In a real scenario, checks if admin
    fetchAdminResumes();
  }, []);

  const fetchAdminResumes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/resumes`);
      setResumes(res.data.resumes || []);
      setFiltered(res.data.resumes || []);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = resumes;
    if (filterName) {
      result = result.filter(r => r.student_name?.toLowerCase().includes(filterName.toLowerCase()));
    }
    if (filterBranch) {
      result = result.filter(r => r.branch?.toLowerCase().includes(filterBranch.toLowerCase()));
    }
    if (filterDate) {
      result = result.filter(r => new Date(r.updated_at).toLocaleDateString().includes(filterDate));
    }
    setFiltered(result);
  }, [filterName, filterBranch, filterDate, resumes]);

  if (loading) return <div className="p-8 text-center">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <ShieldCheck size={32} className="text-red-600" />
            <h1 className="text-3xl font-bold">Admin Data Access Panel</h1>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/')}>Back to Home</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Student Name</label>
              <input className="input-field" value={filterName} onChange={e => setFilterName(e.target.value)} placeholder="Filter by Name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Branch / Degree</label>
              <input className="input-field" value={filterBranch} onChange={e => setFilterBranch(e.target.value)} placeholder="Filter by Branch" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date Updated</label>
              <input className="input-field" value={filterDate} onChange={e => setFilterDate(e.target.value)} placeholder="e.g. 4/4/2026" />
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch/Degree</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Final PDF</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((r, i) => (
                <tr key={r.id || i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.student_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.user_name} ({r.user_email})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.branch}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(r.updated_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => setSelectedResumeId(r.id)}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1 w-full"
                    >
                      <Eye size={16} /> View PDF
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No resumes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedResumeId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-bold">Resume PDF</h2>
              <div className="flex gap-4 items-center">
                <a 
                  href={`${API_URL}/api/resumes/${selectedResumeId}/pdf`} 
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                >
                  Download PDF
                </a>
                <button onClick={() => setSelectedResumeId(null)} className="text-gray-500 hover:text-gray-900 p-2 font-bold select-none text-xl">
                  ×
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100">
              <iframe 
                src={`${API_URL}/api/resumes/${selectedResumeId}/pdf`} 
                className="w-full h-full border-none"
                title="Resume PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
