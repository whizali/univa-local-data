'use client';

import { useState } from 'react';
import Link from 'next/link';
import { University, Program, MeritFormula } from '@/lib/db';

interface Props {
  university: University;
  programs: Program[];
  formulas: MeritFormula[];
  closingMerits: any[];
  user: number;
}

export default function UniversityDashboard({ university, programs, formulas, closingMerits, user }: Props) {
  const [activeTab, setActiveTab] = useState<'programs' | 'formulas' | 'merits'>('programs');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showAddMerit, setShowAddMerit] = useState(false);

  const [meritForm, setMeritForm] = useState({
    year: new Date().getFullYear(),
    finalClosingMerit: '',
    openingMerit: '',
    totalSeats: '',
    genderCategory: 'Open',
    seatCategory: 'Open Merit',
    sourceUrl: '',
    notes: '',
    verified: false
  });

  const handleAddMerit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProgram) return;

    try {
      const response = await fetch('/api/closing-merits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universityId: university.id,
          programId: selectedProgram.id,
          ...meritForm,
          finalClosingMerit: parseFloat(meritForm.finalClosingMerit),
          openingMerit: meritForm.openingMerit ? parseFloat(meritForm.openingMerit) : null,
          totalSeats: meritForm.totalSeats ? parseInt(meritForm.totalSeats) : null,
        })
      });

      if (response.ok) {
        alert('Merit entry added successfully!');
        window.location.reload();
      } else {
        alert('Failed to add merit entry');
      }
    } catch (error) {
      alert('Error adding merit entry');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800 mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{university.name}</h1>
              <p className="text-sm text-gray-600">
                {university.abbreviation} • {university.city}, {university.province}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <div className="text-gray-600">Programs: <span className="font-bold">{programs.length}</span></div>
                <div className="text-gray-600">Merit Entries: <span className="font-bold">{closingMerits.length}</span></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('programs')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'programs'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Programs ({programs.length})
              </button>
              <button
                onClick={() => setActiveTab('formulas')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'formulas'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Merit Formulas ({formulas.length})
              </button>
              <button
                onClick={() => setActiveTab('merits')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'merits'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Closing Merits ({closingMerits.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Programs Tab */}
            {activeTab === 'programs' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Programs List</h3>
                  <button
                    onClick={() => setShowAddMerit(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    + Add Merit Entry
                  </button>
                </div>
                <div className="space-y-2">
                  {programs.map((program) => (
                    <div
                      key={program.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedProgram(program);
                        setShowAddMerit(true);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{program.fullProgramName}</h4>
                          <p className="text-sm text-gray-600">
                            {program.faculty && `${program.faculty} • `}
                            {program.degree}
                            {program.campusName && ` • ${program.campusName}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            (program.closingMeritsCount || 0) > 0 ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {program.closingMeritsCount || 0} merit entries
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formulas Tab */}
            {activeTab === 'formulas' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Merit Calculation Formulas</h3>
                <div className="space-y-4">
                  {formulas.map((formula) => (
                    <div key={formula.id} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {formula.formulaName || 'Default Formula'}
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Matric:</span>
                          <span className="ml-2 font-semibold">{formula.matricWeight}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Intermediate:</span>
                          <span className="ml-2 font-semibold">{formula.intermediateWeight}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Entry Test:</span>
                          <span className="ml-2 font-semibold">{formula.entryTestWeight}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Closing Merits Tab */}
            {activeTab === 'merits' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Closing Merit Data</h3>
                  <button
                    onClick={() => setShowAddMerit(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    + Add Merit Entry
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Closing Merit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opening Merit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added By</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {closingMerits.map((merit: any) => (
                        <tr key={merit.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{merit.full_program_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{merit.year}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">{merit.final_closing_merit}%</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{merit.opening_merit ? `${merit.opening_merit}%` : '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{merit.gender_category || 'Open'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{merit.created_by_name || 'Unknown'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Merit Modal */}
      {showAddMerit && selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Add Closing Merit Entry</h3>
                <button
                  onClick={() => {
                    setShowAddMerit(false);
                    setSelectedProgram(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 p-4 bg-blue-50 rounded">
                <div className="font-medium">{selectedProgram.fullProgramName}</div>
                <div className="text-sm text-gray-600">{selectedProgram.faculty}</div>
              </div>

              <form onSubmit={handleAddMerit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year *
                    </label>
                    <input
                      type="number"
                      required
                      min="2020"
                      max="2030"
                      value={meritForm.year}
                      onChange={(e) => setMeritForm({ ...meritForm, year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Final Closing Merit % *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      max="100"
                      value={meritForm.finalClosingMerit}
                      onChange={(e) => setMeritForm({ ...meritForm, finalClosingMerit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Merit %
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={meritForm.openingMerit}
                      onChange={(e) => setMeritForm({ ...meritForm, openingMerit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Seats
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={meritForm.totalSeats}
                      onChange={(e) => setMeritForm({ ...meritForm, totalSeats: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender Category
                    </label>
                    <select
                      value={meritForm.genderCategory}
                      onChange={(e) => setMeritForm({ ...meritForm, genderCategory: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Open">Open</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seat Category
                    </label>
                    <select
                      value={meritForm.seatCategory}
                      onChange={(e) => setMeritForm({ ...meritForm, seatCategory: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Open Merit">Open Merit</option>
                      <option value="Self-Finance">Self-Finance</option>
                      <option value="Reserved">Reserved</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source URL
                  </label>
                  <input
                    type="url"
                    value={meritForm.sourceUrl}
                    onChange={(e) => setMeritForm({ ...meritForm, sourceUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={meritForm.notes}
                    onChange={(e) => setMeritForm({ ...meritForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={meritForm.verified}
                    onChange={(e) => setMeritForm({ ...meritForm, verified: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="verified" className="ml-2 block text-sm text-gray-700">
                    Mark as verified (from official source)
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Add Merit Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMerit(false);
                      setSelectedProgram(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
