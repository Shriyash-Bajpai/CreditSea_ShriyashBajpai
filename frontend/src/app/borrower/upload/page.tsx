'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { BorrowerProfile } from '@/types';

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);

  useEffect(() => {
    api.get('/borrower/profile').then((res) => setProfile(res.data.data.profile)).catch(() => {});
  }, []);

  const handleFile = (f: File) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(f.type)) { toast.error('Only PDF, JPG, PNG are allowed'); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error('File must be under 5 MB'); return; }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('salarySlip', file);
      await api.post('/borrower/upload-salary-slip', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Salary slip uploaded successfully!');
      router.push('/borrower/loan-config');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (profile && !profile.breCleared) {
    return (
      <div className="max-w-xl">
        <div className="card p-8 text-center">
          <AlertCircle size={40} className="text-amber-400 mx-auto mb-3" />
          <h3 className="font-medium text-slate-900 mb-1">Complete personal details first</h3>
          <p className="text-slate-500 text-sm mb-4">You need to pass the eligibility check before uploading your salary slip.</p>
          <a href="/borrower/personal-details" className="btn-primary inline-block">Go to Personal Details</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-slide-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-slate-900 mb-1">Upload Salary Slip</h1>
        <p className="text-slate-500">Latest 3-month salary slip. PDF, JPG or PNG, max 5 MB.</p>
      </div>

      {profile?.salarySlipPath && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <p className="text-sm text-emerald-300">A salary slip is already uploaded. You can re-upload to replace it.</p>
        </div>
      )}

      <div className="card p-6">
        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            dragging ? 'border-primary-500 bg-primary-50' : 'border-slate-300 hover:border-slate-400 bg-white'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <FileText size={36} className="text-primary-400" />
              <p className="font-medium text-slate-200">{file.name}</p>
              <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload size={36} className="text-slate-500" />
              <p className="text-slate-600 font-medium">Drop file here or click to browse</p>
              <p className="text-sm text-slate-400">PDF, JPG, PNG · max 5 MB</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

        <div className="mt-5 flex gap-3">
          <button onClick={handleUpload} disabled={!file || loading} className="btn-primary">
            {loading ? 'Uploading…' : 'Upload & Continue'}
          </button>
          {file && (
            <button onClick={() => setFile(null)} className="btn-secondary">Remove</button>
          )}
        </div>
      </div>
    </div>
  );
}
