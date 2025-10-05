import React, { useEffect, useState } from 'react';
import { ingestionAPI, practiceAPI } from '../../services/api';

const ManualIngestionPage: React.FC = () => {
  const [practices, setPractices] = useState<any[]>([]);
  const [practiceId, setPracticeId] = useState<string>('');
  const [sourceSystem, setSourceSystem] = useState<string>('dentrix');
  const [dataset, setDataset] = useState<string>('unknown');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isRecordsModalOpen, setIsRecordsModalOpen] = useState(false);
  const [selectedJobForRecords, setSelectedJobForRecords] = useState<any>(null);
  const [jobRecords, setJobRecords] = useState<any[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await practiceAPI.getPractices();
        setPractices(data?.practices || data || []);
      } catch (e) {
        // ignore
      }
      await loadJobs();
    })();
  }, []);

  const loadJobs = async () => {
    const data = await ingestionAPI.listJobs(practiceId || undefined);
    setJobs(data?.jobs || []);
  };

  const handleUpload = async () => {
    if (!practiceId || !sourceSystem || !file) return;
    setUploading(true);
    try {
      const res = await ingestionAPI.upload({ practiceId, sourceSystem, dataset, file });
      await loadJobs(); // Refresh jobs list to show the new job
      if (res.job?.id) {
        await startProcessing(res.job.id);
      }
    } finally {
      setUploading(false);
    }
  };

  const startProcessing = async (jobId: string) => {
    await ingestionAPI.processJob(jobId);
    await loadJobs();
  };

  const handleViewRecords = async (job: any) => {
    setSelectedJobForRecords(job);
    setIsRecordsModalOpen(true);
    setRecordsLoading(true);
    try {
      const data = await ingestionAPI.getRecords(job.id, 100); // Get first 100 records
      setJobRecords(data?.records || []);
    } finally {
      setRecordsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Manual Data Ingestion</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upload File</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Practice</label>
              <select value={practiceId} onChange={e => setPracticeId(e.target.value)} className="w-full border rounded-md px-3 py-2">
                <option value="">Select practice</option>
                {practices.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name || p.id}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Source System</label>
              <select value={sourceSystem} onChange={e => setSourceSystem(e.target.value)} className="w-full border rounded-md px-3 py-2">
                <option value="dentrix">Dentrix</option>
                <option value="eaglesoft">Eaglesoft</option>
                <option value="dentalintel">DentalIntel</option>
                <option value="adp">ADP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Dataset</label>
              <select value={dataset} onChange={e => setDataset(e.target.value)} className="w-full border rounded-md px-3 py-2">
                <option value="unknown">Unknown</option>
                <option value="patients">Patients</option>
                <option value="appointments">Appointments</option>
                <option value="payroll">Payroll</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">File</label>
              <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <div className="mt-4">
            <button onClick={handleUpload} disabled={uploading || !file || !practiceId}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
              {uploading ? 'Uploading…' : 'Upload and Process'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Jobs</h2>
          <div className="space-y-3">
            {jobs.map((job: any) => (
              <div key={job.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{job.originalFilename}</div>
                    <div className="text-xs text-gray-500">{job.dataset} • {job.fileType} • {job.status}</div>
                  </div>
                  <div className="text-right">
                    {job.status === 'completed' && (
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200" onClick={() => handleViewRecords(job)}>
                          View Records
                        </button>
                        <a className="px-3 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200" href={ingestionAPI.download(job.id)}>Download</a>
                        <button className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200" onClick={async()=>{await ingestionAPI.deleteJob(job.id); await loadJobs();}}>Delete</button>
                      </div>
                    )}
                     {(job.status === 'uploaded' || job.status === 'processing') && (
                        <div className="text-sm text-gray-500">Processing...</div>
                    )}
                  </div>
                </div>
                {(job.status === 'completed') && (
                  <div className="text-xs text-gray-600 mt-1">Records: {job.processedRecords}/{job.totalRecords}</div>
                )}
                {job.error && (
                  <div className="text-xs text-red-600 mt-1">Error: {job.error}</div>
                )}
              </div>
            ))}
            {jobs.length === 0 && (
              <div className="text-sm text-gray-500">No jobs yet.</div>
            )}
          </div>
        </div>
      </div>

      {isRecordsModalOpen && selectedJobForRecords && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Records for {selectedJobForRecords.originalFilename}</h2>
            <div className="flex-grow overflow-y-auto">
              {recordsLoading ? (
                <div>Loading...</div>
              ) : (
                <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">{JSON.stringify(jobRecords, null, 2)}</pre>
              )}
            </div>
            <div className="mt-4 text-right">
              <button onClick={() => setIsRecordsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualIngestionPage;
