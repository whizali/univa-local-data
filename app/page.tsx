import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUniversities, getStats } from "@/lib/db";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  const sorted = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const result: (number | 'ellipsis')[] = [];
  for (const page of sorted) {
    if (result.length && typeof result[result.length - 1] === 'number') {
      const previous = result[result.length - 1] as number;
      if (page - previous > 1) result.push('ellipsis');
    }
    result.push(page);
  }
  return result;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const params = await searchParams;
  const search = params.search?.trim() || '';
  const requestedPage = Math.max(1, parseInt(params.page || '1', 10) || 1);

  const stats = await getStats();
  const { universities, total } = await getUniversities(search || undefined, requestedPage, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, total);

  const buildPageHref = (page: number) => {
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (page > 1) query.set('page', String(page));
    const queryString = query.toString();
    return queryString ? `/?${queryString}` : '/';
  };

  if (requestedPage > totalPages) {
    redirect(buildPageHref(totalPages));
  }

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
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Universities</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Click on a university to manage programs and merit data
                  {` — showing ${rangeStart}-${rangeEnd} of ${total}`}
                  {search ? ` for "${search}"` : ''}
                </p>
              </div>
              <form className="flex gap-2" action="/">
                <input
                  type="search"
                  name="search"
                  defaultValue={search || ''}
                  placeholder="Search university or abbreviation"
                  className="w-64 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Search
                </button>
                {search && (
                  <Link
                    href="/"
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Clear
                  </Link>
                )}
              </form>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {universities.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-gray-500">
                {search ? 'No universities matched your search.' : 'No universities found.'}
              </div>
            )}
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

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-gray-600">
                Showing {rangeStart}-{rangeEnd} of {total} universities
              </span>
              <nav className="flex items-center gap-1" aria-label="Pagination">
                {currentPage > 1 ? (
                  <Link
                    href={buildPageHref(currentPage - 1)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="px-3 py-2 text-sm border border-gray-200 rounded-md text-gray-400">
                    Previous
                  </span>
                )}

                {getPageNumbers(currentPage, totalPages).map((entry, index) =>
                  entry === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-sm text-gray-500">
                      …
                    </span>
                  ) : (
                    <Link
                      key={entry}
                      href={buildPageHref(entry)}
                      aria-current={entry === currentPage ? 'page' : undefined}
                      className={`px-3 py-2 text-sm border rounded-md ${
                        entry === currentPage
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {entry}
                    </Link>
                  )
                )}

                {currentPage < totalPages ? (
                  <Link
                    href={buildPageHref(currentPage + 1)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="px-3 py-2 text-sm border border-gray-200 rounded-md text-gray-400">
                    Next
                  </span>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
