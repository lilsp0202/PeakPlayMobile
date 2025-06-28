import { z } from 'zod';

// Auth validations
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  role: z.enum(['ATHLETE', 'COACH']),
});

// Student validations
export const createStudentSchema = z.object({
  studentName: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  age: z.number().int().min(5).max(100),
  height: z.number().positive(),
  weight: z.number().positive(),
  academy: z.string().min(2),
  sport: z.string().default('CRICKET'),
  role: z.string(),
  coachId: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

// Coach validations
export const createCoachSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  academy: z.string().min(2),
});

// Match validations
export const createMatchSchema = z.object({
  matchName: z.string().min(2),
  opponent: z.string().min(2),
  venue: z.string().optional(),
  matchDate: z.string().datetime(),
  sport: z.string(),
  matchType: z.enum(['PRACTICE', 'TOURNAMENT', 'LEAGUE']).default('PRACTICE'),
  result: z.string().optional(),
});

export const updateMatchSchema = createMatchSchema.partial();

// Skills validations
export const updateSkillsSchema = z.object({
  // Physical skills
  pushupScore: z.number().int().min(0).max(100).optional(),
  pullupScore: z.number().int().min(0).max(100).optional(),
  sprintTime: z.number().positive().optional(),
  run5kTime: z.number().positive().optional(),
  
  // Nutrition
  carbohydrates: z.number().min(0).optional(),
  fats: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  totalCalories: z.number().int().min(0).optional(),
  
  // Mental
  moodScore: z.number().int().min(1).max(10).optional(),
  sleepScore: z.number().int().min(1).max(10).optional(),
  
  // Technical skills
  aim: z.number().int().min(0).max(10).optional(),
  backFootDrag: z.number().int().min(0).max(10).optional(),
  backFootLanding: z.number().int().min(0).max(10).optional(),
  backLift: z.number().int().min(0).max(10).optional(),
  battingBalance: z.number().int().min(0).max(10).optional(),
  battingGrip: z.number().int().min(0).max(10).optional(),
  battingStance: z.number().int().min(0).max(10).optional(),
  bowlingGrip: z.number().int().min(0).max(10).optional(),
  calling: z.number().int().min(0).max(10).optional(),
  cockingOfWrist: z.number().int().min(0).max(10).optional(),
  flatCatch: z.number().int().min(0).max(10).optional(),
  followThrough: z.number().int().min(0).max(10).optional(),
  frontFootLanding: z.number().int().min(0).max(10).optional(),
  highCatch: z.number().int().min(0).max(10).optional(),
  highElbow: z.number().int().min(0).max(10).optional(),
  hipDrive: z.number().int().min(0).max(10).optional(),
  nonBowlingArm: z.number().int().min(0).max(10).optional(),
  pickUp: z.number().int().min(0).max(10).optional(),
  positioningOfBall: z.number().int().min(0).max(10).optional(),
  receiving: z.number().int().min(0).max(10).optional(),
  release: z.number().int().min(0).max(10).optional(),
  runUp: z.number().int().min(0).max(10).optional(),
  runningBetweenWickets: z.number().int().min(0).max(10).optional(),
  softHands: z.number().int().min(0).max(10).optional(),
  throw: z.number().int().min(0).max(10).optional(),
  topHandDominance: z.number().int().min(0).max(10).optional(),
});

// Feedback validations
export const createFeedbackSchema = z.object({
  studentId: z.string(),
  title: z.string().min(2),
  content: z.string().min(10),
  category: z.enum(['GENERAL', 'TECHNICAL', 'PHYSICAL', 'MENTAL', 'TACTICAL']).default('GENERAL'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

// Marketplace validations
export const createBookingSchema = z.object({
  coachId: z.string(),
  sessionType: z.enum(['VIDEO_CALL', 'IN_PERSON', 'ASYNC_FEEDBACK']),
  title: z.string().min(2),
  description: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().int().min(15).max(240).optional(),
  location: z.string().optional(),
  performanceClips: z.array(z.string().url()).optional(),
});

export const createReviewSchema = z.object({
  coachId: z.string(),
  bookingId: z.string().optional(),
  rating: z.number().min(1).max(5),
  title: z.string().min(2),
  comment: z.string().min(10),
  isAnonymous: z.boolean().default(false),
});

// Badge validations
export const createBadgeSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  motivationalText: z.string().min(10),
  level: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).default('BRONZE'),
  categoryId: z.string(),
  icon: z.string(),
  sport: z.string().default('CRICKET'),
  isActive: z.boolean().default(true),
  rules: z.array(z.object({
    ruleType: z.enum(['PERFORMANCE', 'WELLNESS', 'CONSISTENCY', 'COACH_RATING', 'STREAK', 'IMPROVEMENT']),
    fieldName: z.string(),
    operator: z.enum(['GT', 'GTE', 'LT', 'LTE', 'EQ', 'NEQ', 'BETWEEN', 'STREAK_DAYS']),
    value: z.string(),
    weight: z.number().default(1.0),
    isRequired: z.boolean().default(true),
    description: z.string().optional(),
  })),
});

// Session Todo validations
export const createSessionTodoSchema = z.object({
  title: z.string().min(2),
  sessionDate: z.string().datetime(),
  items: z.array(z.string().min(1)),
  studentIds: z.array(z.string()),
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// Search validation
export const searchSchema = z.object({
  query: z.string().min(1),
  category: z.string().optional(),
  sort: z.enum(['asc', 'desc']).default('desc'),
});

// Validation helper function
export function validateRequest<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: message };
    }
    return { success: false, error: 'Invalid request data' };
  }
} 