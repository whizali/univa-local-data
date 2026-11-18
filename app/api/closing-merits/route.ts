import { auth } from "@/lib/auth";
import { addClosingMerit } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const closingMeritSchema = z.object({
  universityId: z.coerce.number().int().positive(),
  programId: z.coerce.number().int().positive(),
  year: z.coerce.number().int().min(2020).max(2030),
  finalClosingMerit: z.coerce.number().min(0).max(100),
  openingMerit: z.coerce.number().min(0).max(100).nullable().optional(),
  totalSeats: z.coerce.number().int().nonnegative().nullable().optional(),
  totalApplicants: z.coerce.number().int().nonnegative().nullable().optional(),
  genderCategory: z.string().min(1).optional(),
  seatCategory: z.string().min(1).optional(),
  sourceUrl: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  verified: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  const userId = Number(session?.user?.id);
  
  if (!session || !Number.isFinite(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const parsed = closingMeritSchema.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid merit entry', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await addClosingMerit(
      {
        ...parsed.data,
        openingMerit: parsed.data.openingMerit ?? null,
        totalSeats: parsed.data.totalSeats ?? null,
        totalApplicants: parsed.data.totalApplicants ?? null,
        genderCategory: parsed.data.genderCategory ?? 'Open',
        seatCategory: parsed.data.seatCategory ?? 'Open Merit',
        sourceUrl: parsed.data.sourceUrl ?? null,
        notes: parsed.data.notes ?? null,
        verified: parsed.data.verified ?? false,
      },
      userId
    );
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error adding closing merit:', error);
    return NextResponse.json(
      { error: 'Failed to add closing merit' },
      { status: 500 }
    );
  }
}
