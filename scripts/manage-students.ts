import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Make students unassigned (coachId = null) for a specific academy
 * @param academy - The academy name
 * @param studentEmails - Array of student emails to make unassigned (optional)
 * @param studentIds - Array of student IDs to make unassigned (optional)
 */
export async function makeStudentsUnassigned(
  academy: string, 
  studentEmails?: string[], 
  studentIds?: string[]
) {
  const whereClause: any = { academy };
  
  if (studentEmails && studentEmails.length > 0) {
    whereClause.email = { in: studentEmails };
  }
  
  if (studentIds && studentIds.length > 0) {
    whereClause.id = { in: studentIds };
  }
  
  const result = await prisma.student.updateMany({
    where: whereClause,
    data: { coachId: null }
  });
  
  console.log(`✅ Made ${result.count} students unassigned in ${academy} academy`);
  return result;
}

/**
 * Assign students to a specific coach
 * @param coachId - The coach ID to assign students to
 * @param studentEmails - Array of student emails to assign (optional)
 * @param studentIds - Array of student IDs to assign (optional)
 */
export async function assignStudentsToCoach(
  coachId: string,
  studentEmails?: string[],
  studentIds?: string[]
) {
  const whereClause: any = {};
  
  if (studentEmails && studentEmails.length > 0) {
    whereClause.email = { in: studentEmails };
  }
  
  if (studentIds && studentIds.length > 0) {
    whereClause.id = { in: studentIds };
  }
  
  const result = await prisma.student.updateMany({
    where: whereClause,
    data: { coachId }
  });
  
  console.log(`✅ Assigned ${result.count} students to coach ${coachId}`);
  return result;
}

/**
 * Get all unassigned students for a specific academy
 * @param academy - The academy name
 */
export async function getUnassignedStudents(academy: string) {
  const students = await prisma.student.findMany({
    where: {
      academy,
      coachId: null
    },
    select: {
      id: true,
      studentName: true,
      email: true,
      academy: true,
      age: true,
      sport: true
    }
  });
  
  console.log(`📋 Found ${students.length} unassigned students in ${academy} academy`);
  return students;
}

/**
 * Get all students assigned to a specific coach
 * @param coachId - The coach ID
 */
export async function getStudentsByCoach(coachId: string) {
  const students = await prisma.student.findMany({
    where: { coachId },
    select: {
      id: true,
      studentName: true,
      email: true,
      academy: true,
      age: true,
      sport: true
    }
  });
  
  console.log(`📋 Found ${students.length} students assigned to coach ${coachId}`);
  return students;
}

// Example usage functions
export async function exampleUsage() {
  // Make specific students unassigned in Transform academy
  await makeStudentsUnassigned('Transform', [
    'student6@transform.com',
    'student7@transform.com',
    'student8@transform.com',
    'student9@transform.com',
    'student10@transform.com'
  ]);
  
  // Get all unassigned students in Transform academy
  const unassigned = await getUnassignedStudents('Transform');
  console.log('Unassigned students:', unassigned);
}

// If this script is run directly
if (require.main === module) {
  exampleUsage()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
} 