import React, { useEffect, useMemo, useState } from 'react';
import { ingestionAPI, practiceAPI } from '../../services/api';
import { TARGET_FIELDS, suggestFieldMap, isFieldMapComplete } from '../../features/ingestion/mapping';

const ManualIngestionPage: React.FC = () => {
  const [practices, setPractices] = useState<any[]>([]);
  const [practiceId, setPracticeId] = useState<string>('');
  const [sourceSystem, setSourceSystem] = useState<string>('dentrix');
  const [dataset, setDataset] = useState<string>('unknown');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [target, setTarget] = useState<string>('patients');
  const [fieldMap, setFieldMap] = useState<Record<string,string>>(() => {
    const defaults: Record<string, string> = {};
    TARGET_FIELDS.patients.forEach(k => defaults[k] = '');
    return defaults;
  });

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
      setPreview(res.preview || null);
      await loadJobs();
    } finally {
      setUploading(false);
    }
  };

  const startProcessing = async (jobId: string) => {
    await ingestionAPI.processJob(jobId);
    await loadJobs();
  };

  const loadHeaders = async (jobId: string) => {
    const data = await ingestionAPI.getHeaders(jobId);
    setHeaders(data?.headers || []);
  };

  const handleSelectJob = async (jobId: string) => {
    setSelectedJobId(jobId);
    await loadHeaders(jobId);
  };

  // Auto-suggest mapping whenever headers/source/dataset change
  useEffect(() => {
    if (!headers.length) return;
    const suggested = suggestFieldMap(headers, sourceSystem as any, dataset as any, 'patients');
    setFieldMap(prev => ({ ...prev, ...suggested }));
  }, [headers, sourceSystem, dataset]);

  const handleSaveMapping = async () => {
    if (!selectedJobId) return;
    const job = jobs.find(j => j.id === selectedJobId);
    if (!job) return;
    await ingestionAPI.saveMapping(selectedJobId, {
      practiceId,
      sourceSystem: job.sourceSystem || sourceSystem,
      dataset: job.dataset || dataset || 'unknown',
      target,
      fieldMap,
    });
    alert('Mapping saved');
  };

  const handlePromote = async () => {
    if (!selectedJobId) return;
    if (!isFieldMapComplete(fieldMap, 'patients')) {
      alert('Please map required fields: firstName and lastName');
      return;
    }
    const res = await ingestionAPI.promote(selectedJobId, { target, fieldMap });
    await loadJobs();
    alert(`Promote: ${JSON.stringify(res?.result || res)}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Manual Data Ingestion</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow border p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upload File</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="dentalintel">DentalIntel</option>
                <option value="adp">ADP</option>
                <option value="eaglesoft">Eaglesoft</option>
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
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>

          {preview && (
            <div className="mt-6">
              <div className="text-sm text-gray-700 font-medium mb-2">Preview</div>
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-64">{JSON.stringify(preview, null, 2)}</pre>
            </div>
          )}

          {/* Mapping UI */}
          <div className="mt-8">
            <h3 className="text-md font-medium text-gray-900 mb-1">Map Fields</h3>
            <div className="text-xs text-gray-600 mb-3">Auto-mapped using common {sourceSystem} {dataset} headers. Required: firstName, lastName.</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Select Job</label>
                <select value={selectedJobId} onChange={e => handleSelectJob(e.target.value)} className="w-full border rounded-md px-3 py-2">
                  <option value="">Choose processed job</option>
                  {jobs.filter((j:any)=> j.status==='completed').map((j:any) => (
                    <option key={j.id} value={j.id}>{j.originalFilename}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Target</label>
                <select value={target} onChange={e => setTarget(e.target.value)} className="w-full border rounded-md px-3 py-2">
                  <option value="patients">Patients</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!headers.length) return;
                    const suggested = suggestFieldMap(headers, sourceSystem as any, dataset as any, 'patients');
                    setFieldMap(prev => ({ ...prev, ...suggested }));
                  }}
                  className="px-3 py-2 h-10 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  disabled={!headers.length}
                >
                  Auto-map
                </button>
              </div>
            </div>

            {selectedJobId && headers.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(fieldMap).map((t) => (
                  <div key={t}>
                    <label className="block text-sm text-gray-700 mb-1">{t}</label>
                    <select value={fieldMap[t]} onChange={e => setFieldMap(prev => ({...prev, [t]: e.target.value}))} className="w-full border rounded-md px-3 py-2">
                      <option value="">—</option>
                      {headers.map(h => (<option key={h} value={h}>{h}</option>))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center space-x-2">
              <button onClick={handleSaveMapping} disabled={!selectedJobId}
                className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 disabled:opacity-50">
                Save Mapping
              </button>
              <button onClick={handlePromote} disabled={!selectedJobId || !isFieldMapComplete(fieldMap, 'patients')}
                className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
                Promote to {target}
              </button>
              {!isFieldMapComplete(fieldMap, 'patients') && (
                <span className="text-xs text-red-600">Required fields missing</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
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
                    {(job.status === 'uploaded' || job.status === 'failed') && (
                      <button className="px-3 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200" onClick={() => startProcessing(job.id)}>
                        Process
                      </button>
                    )}
                    {job.status === 'completed' && (
                      <div className="flex space-x-2">
                        <a className="px-3 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200" href={ingestionAPI.download(job.id)}>Download</a>
                        <button className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200" onClick={async()=>{await ingestionAPI.deleteJob(job.id); await loadJobs();}}>Delete</button>
                      </div>
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
    </div>
  );
};

export default ManualIngestionPage;
