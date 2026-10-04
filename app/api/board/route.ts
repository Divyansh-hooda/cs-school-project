import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tasklaneState } from '@/lib/db/schema'

const stateId = 1

export async function GET() {
  try {
    const [stored] = await db.select().from(tasklaneState).where(eq(tasklaneState.id, stateId)).limit(1)
    return NextResponse.json(stored?.data ?? null)
  } catch (error) {
    console.error('[v0] Failed to load board:', error)
    return NextResponse.json({ error: 'Database connection failed. Check DATABASE_URL and the tasklane_state table.' }, { status: 503 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    await db.insert(tasklaneState).values({ id: stateId, data }).onConflictDoUpdate({
      target: tasklaneState.id,
      set: { data, updatedAt: new Date() },
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Failed to save board:', error)
    return NextResponse.json({ error: 'Database connection failed. Check DATABASE_URL and the tasklane_state table.' }, { status: 503 })
  }
}
