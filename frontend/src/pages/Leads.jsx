import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react'; // ✅ Added useEffect
import api from '../api';

function Leads() {

  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  
  const [sliderValue, setSliderValue] = useState(0);
  
  const [minScore, setMinScore] = useState(0);
  
  const [debounceTimer, setDebounceTimer] = useState(null);


  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      setMinScore(sliderValue); 
    }, 400);

    setDebounceTimer(timer);

    return () => clearTimeout(timer);
  }, [sliderValue]); // Runs whenever sliderValue changes


  const fetchLeads = async () => {
    const params = new URLSearchParams();
    if (selectedIndustry) params.append('industry', selectedIndustry);
    if (minScore > 0) params.append('min_score', minScore / 100);
    const response = await api.get(`/leads/?${params.toString()}`);
    return response.data;
  };

  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['leads', selectedIndustry, minScore], 
    queryFn: fetchLeads,
  });


  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (info) => <span className="font-medium text-gray-900">{info.getValue()}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: (info) => <span className="text-gray-600">{info.getValue()}</span>,
    },
    {
      accessorKey: 'industry',
      header: 'Industry',
      cell: (info) => (
        <span className="px-2 py-1 text-xs bg-gray-100 rounded-full text-gray-700">
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'website_visits',
      header: 'Visits',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'prediction_score',
      header: 'Score',
      cell: (info) => {
        const score = info.getValue() || 0;
        return <span className="font-mono font-medium">{(score * 100).toFixed(0)}%</span>;
      },
    },
    {
      id: 'status', 
      accessorKey: 'prediction_score',
      header: 'Status',
      cell: (info) => {
        const score = info.getValue() || 0;
        const isHot = score > 0.6;
        return (
          <span
            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              isHot ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {isHot ? 'Hot' : 'Cold'}
          </span>
        );
      },
    },
  ];


  const table = useReactTable({
    data: leads || [],
    columns,
    state: { globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
  });

  
  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Leads</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Leads</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading leads.</p>
          <p className="text-sm">Make sure your backend is running.</p>
        </div>
      </div>
    );
  }


  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Leads</h1>

      <div className="mb-6 flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">All Industries</option>
            <option value="Tech">Tech</option>
            <option value="Finance">Finance</option>
            <option value="Retail">Retail</option>
            <option value="Healthcare">Healthcare</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Score: {sliderValue}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue} // ✅ Binds to local UI state
            onChange={(e) => setSliderValue(Number(e.target.value))} // ✅ Updates instantly (no reload)
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <button
          onClick={() => {
            setSelectedIndustry('');
            setSliderValue(0);
          
            setMinScore(0);   
          }}
          className="mt-5 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Clear Filters
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-xs">
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="🔍 Search leads..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="text-sm text-gray-600">
          Showing {table.getRowModel().rows.length} of {leads?.length || 0} leads
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' ? ' 🔼' : ''}
                      {header.column.getIsSorted() === 'desc' ? ' 🔽' : ''}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    No leads found. Upload a CSV via Swagger or the Dashboard.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-700">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leads;