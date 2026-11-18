import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getUniversityById,
  getProgramsByUniversity,
  getMeritFormulasByUniversity,
  getClosingMeritsByUniversity
} from "@/lib/db";
import UniversityDashboard from "./UniversityDashboard";

export const dynamic = 'force-dynamic';

export default async function UniversityPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const universityId = parseInt(id);
  if (!Number.isFinite(universityId)) {
    redirect('/');
  }

  const university = await getUniversityById(universityId);
  if (!university) {
    redirect('/');
  }

  const programs = await getProgramsByUniversity(universityId);
  const formulas = await getMeritFormulasByUniversity(universityId);
  const closingMerits = await getClosingMeritsByUniversity(universityId);

  return (
    <UniversityDashboard
      university={university}
      programs={programs}
      formulas={formulas}
      closingMerits={closingMerits}
    />
  );
}
