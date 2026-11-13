import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getUniversityById,
  getProgramsByUniversity,
  getMeritFormulasByUniversity,
  getClosingMeritsByUniversity
} from "@/lib/db";
import UniversityDashboard from "./UniversityDashboard";

export default async function UniversityPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const universityId = parseInt(params.id);
  const university = await getUniversityById(universityId);
  const programs = await getProgramsByUniversity(universityId);
  const formulas = await getMeritFormulasByUniversity(universityId);
  const closingMerits = await getClosingMeritsByUniversity(universityId);

  if (!university) {
    redirect('/');
  }

  return (
    <UniversityDashboard
      university={university}
      programs={programs}
      formulas={formulas}
      closingMerits={closingMerits}
      user={(session.user as any).id}
    />
  );
}
