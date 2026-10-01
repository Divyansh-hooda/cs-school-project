import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tasklaneState } from '@/lib/db/schema'

const stateId = 1

export async function GET() {
  const [stored] = await db.select().from(tasklaneState).where(eq(tasklaneState.id, stateId)).limit(1)
  return NextResponse.json(stored?.data ?? null)
}

export async function PUT(request: Request) {
  const data = await request.json()
  await db.insert(tasklaneState).values({ id: stateId, data }).onConflictDoUpdate({
    target: tasklaneState.id,
    set: { data, updatedAt: new Date() },
  })
  return NextResponse.json(data)
}
