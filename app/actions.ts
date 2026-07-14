'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

async function requireAuth() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

// Tasks
export async function getTasks() {
  const userId = await requireAuth();
  return await prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

export async function createTask(data: { title: string; category: string; deadline?: Date | null; priority: string; note?: string | null }) {
  const userId = await requireAuth();
  await prisma.task.create({
    data: {
      userId,
      title: data.title,
      category: data.category,
      deadline: data.deadline,
      priority: data.priority,
      note: data.note,
    }
  });
  revalidatePath('/');
}

export async function updateTask(id: string, data: Partial<{ title: string; category: string; deadline: Date | null; priority: string; note: string | null; done: boolean }>) {
  const userId = await requireAuth();
  await prisma.task.update({
    where: { id, userId }, // ensure user owns the task
    data
  });
  revalidatePath('/');
}

export async function deleteTask(id: string) {
  const userId = await requireAuth();
  await prisma.task.delete({ where: { id, userId } });
  revalidatePath('/');
}

// Notes
export async function getNotes() {
  const userId = await requireAuth();
  return await prisma.note.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
}

export async function createNote(data: { title: string; body: string }) {
  const userId = await requireAuth();
  await prisma.note.create({ data: { ...data, userId } });
  revalidatePath('/');
}

export async function updateNote(id: string, data: { title: string; body: string }) {
  const userId = await requireAuth();
  await prisma.note.update({ where: { id, userId }, data });
  revalidatePath('/');
}

export async function deleteNote(id: string) {
  const userId = await requireAuth();
  await prisma.note.delete({ where: { id, userId } });
  revalidatePath('/');
}

// SalahLog
export async function getSalahLogs() {
  const userId = await requireAuth();
  return await prisma.salahLog.findMany({ where: { userId } });
}

export async function toggleSalah(date: string, prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') {
  const userId = await requireAuth();
  const log = await prisma.salahLog.findUnique({ where: { date_userId: { date, userId } } });
  
  if (log) {
    await prisma.salahLog.update({
      where: { id: log.id },
      data: { [prayer]: !log[prayer] }
    });
  } else {
    await prisma.salahLog.create({
      data: {
        userId,
        date,
        [prayer]: true
      }
    });
  }
  revalidatePath('/');
  revalidatePath('/salah');
}

// Calendar Notes
export async function getCalendarNotes() {
  const userId = await requireAuth();
  return await prisma.calendarNote.findMany({ where: { userId }, orderBy: { date: 'asc' } });
}

export async function upsertCalendarNote(date: string, body: string) {
  const userId = await requireAuth();
  await prisma.calendarNote.upsert({
    where: { date_userId: { date, userId } },
    update: { body },
    create: { userId, date, body }
  });
  revalidatePath('/calendar');
}
