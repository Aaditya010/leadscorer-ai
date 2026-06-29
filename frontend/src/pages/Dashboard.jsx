import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from 'recharts';
import api from '../api';


//API
const fetchLeads = async () => {
  const response = await api.get('/leads/');
  return response.data;
};

const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

const runPredictions = async () => {
  const response = await api.post('/train-and-predict');
  return response.data;
};
//dashboard
function Dashboard() {
  const queryClient = useQueryClient();

  const [hasUploaded, setHasUploaded] = useState(false);

  // Fetch leads
  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads,
  });

  // Upload CSV
  const uploadMutation = useMutation({
    mutationFn: uploadCSV,
    onSuccess: () => {
      setHasUploaded(true); 
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('CSV uploaded successfully!')
    },
    onError: (error) => {
    console.error(error);
    toast.error('Upload failed. Check console.');
    },
  });

  // Run predictions
  const predictMutation = useMutation({
  mutationFn: runPredictions,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    toast.success('Predictions completed!');
  },
  onError: (error) => {
    console.error(error);
    toast.error('Prediction failed.'); 
  },
});

  // Drag-and-drop
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadMutation.mutate(acceptedFiles[0]);
      }
    },
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  });

  // Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Error loading dashboard data.</p>
        <p className="text-sm">Make sure your backend is running.</p>
      </div>
    );
  }

  // Stats
  const totalLeads = leads?.length || 0;
  const hotLeads = leads?.filter((lead) => (lead.prediction_score || 0) > 0.6).length || 0;
  const coldLeads = totalLeads - hotLeads;
  const conversionRate = totalLeads > 0 ? Math.round((hotLeads / totalLeads) * 100) : 0;

  // Bar chart
  const industryMap = {};
  leads?.forEach((lead) => {
    const industry = lead.industry || 'Unknown';
    industryMap[industry] = (industryMap[industry] || 0) + 1;
  });
  const industryData = Object.keys(industryMap).map((key) => ({
    name: key,
    count: industryMap[key],
  }));

  // Pie chart
  const pieData = [
    { name: 'Hot Leads', value: hotLeads },
    { name: 'Cold Leads', value: coldLeads },
  ];
  const COLORS = ['#22c55e', '#ef4444'];

  //UI
    return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* UPLOAD ZONE */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload CSV</h2>

        {/* Drag and Drop Box */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          {uploadMutation.isPending ? (
            <p className="text-blue-600 font-medium">Uploading...</p>
          ) : isDragActive ? (
            <p className="text-blue-600 font-medium">Drop the CSV here...</p>
          ) : (
            <div>
              <p className="text-gray-600 font-medium">📁 Drag & drop a CSV file here</p>
              <p className="text-gray-400 text-sm mt-1">or click to browse</p>
              <p className="text-gray-400 text-xs mt-2">Accepts .csv files</p>
            </div>
          )}
        </div>

        {/* Upload Status */}
        {uploadMutation.isError && (
          <div className="mt-4 text-red-600 text-sm">Upload failed. Check console.</div>
        )}
        {uploadMutation.isSuccess && (
          <div className="mt-4 text-green-600 text-sm">CSV uploaded successfully!</div>
        )}

                <button
          onClick={() => predictMutation.mutate()}
          disabled={!hasUploaded || predictMutation.isPending}
          className={`mt-4 px-6 py-3 rounded-lg font-semibold text-white transition ${
            !hasUploaded || predictMutation.isPending
              ? 'bg-gray-400 cursor-not-allowed opacity-60'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {predictMutation.isPending ? '⏳ Running AI...' : 'Run Predictions'}
        </button>

        {predictMutation.isSuccess && (
          <div className="mt-2 text-green-600 text-sm">Predictions completed!</div>
        )}
        {predictMutation.isError && (
          <div className="mt-2 text-red-600 text-sm">Prediction failed. Check console.</div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Leads</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalLeads}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Hot Leads</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{hotLeads}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Cold Leads</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{coldLeads}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{conversionRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Leads by Industry</h2>
          {industryData.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No industry data to display</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={industryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Hot vs Cold Split</h2>
          {pieData.every((item) => item.value === 0) ? (
            <p className="text-gray-500 text-center py-10">No leads to display</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;