import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUniversities, getStats } from "@/lib/db";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const stats = await getStats();
  const universities = await getUniversities();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Merit Data Collection System
              </h1>
              <p className="text-sm text-gray-600">
                Pakistan University Admission Predictor
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{session.user?.name}</span>
              </span>
              <form action={async () => {
                'use server';
                const { signOut } = await import("@/lib/auth");
                await signOut({ redirectTo: '/login' });
              }}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Universities</div>
            <div className="text-3xl font-bold text-indigo-600">{stats.universities_count}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Programs</div>
            <div className="text-3xl font-bold text-indigo-600">{stats.programs_count}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Merit Entries</div>
            <div className="text-3xl font-bold text-green-600">{stats.merit_entries_count}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Verified</div>
            <div className="text-3xl font-bold text-green-600">{stats.verified_entries_count}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Years Covered</div>
            <div className="text-3xl font-bold text-blue-600">{stats.years_covered}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Unis with Data</div>
            <div className="text-3xl font-bold text-blue-600">{stats.universities_with_data}</div>
          </div>
        </div>

        {/* Universities List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Universities</h2>
            <p className="text-sm text-gray-600 mt-1">Click on a university to manage programs and merit data</p>
          </div>
          <div className="divide-y divide-gray-200">
            {universities.map((uni) => (
              <Link
                key={uni.id}
                href={`/university/${uni.id}`}
                className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between group"
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                    {uni.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {uni.abbreviation} • {uni.city}, {uni.province}
                  </p>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{uni.programCount || 0}</div>
                    <div className="text-gray-600">Programs</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold ${(uni.meritEntriesCount || 0) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {uni.meritEntriesCount || 0}
                    </div>
                    <div className="text-gray-600">Merit Entries</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
