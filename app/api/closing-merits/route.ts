import { auth } from "@/lib/auth";
import { addClosingMerit } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const userId = (session.user as any).id;
    
    const result = await addClosingMerit(data, userId);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error adding closing merit:', error);
    return NextResponse.json(
      { error: 'Failed to add closing merit' },
      { status: 500 }
    );
  }
}
