import { EDUCATION_LEVELS, COURSE_CATEGORIES, COURSE_LEVELS, ENROLLMENT_STATUS } from "@/constants";

export type EducationLevel = typeof EDUCATION_LEVELS[keyof typeof EDUCATION_LEVELS];
export type CourseCategory = typeof COURSE_CATEGORIES[keyof typeof COURSE_CATEGORIES];
export type CourseLevel = typeof COURSE_LEVELS[keyof typeof COURSE_LEVELS];
export type EnrollmentStatus = typeof ENROLLMENT_STATUS[keyof typeof ENROLLMENT_STATUS];

export interface IAcademicProfile {
  id: string;
  userId: string;
  currentLevel: EducationLevel;
  currentGrade?: string;
  institution?: string;
  major?: string;
  minor?: string;
  gpa?: number;
  achievements: string[];
  certifications: string[];
  academicInterests: string[];
  subjectStrengths: string[];
  subjectsNeedImprovement: string[];
  intendedMajor?: string;
  targetUniversity?: string;
  extracurricularActivities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ICreateAcademicProfileRequest {
  currentLevel: EducationLevel;
  currentGrade?: string;
  institution?: string;
  major?: string;
  minor?: string;
  gpa?: number;
  achievements: string[];
  certifications: string[];
  academicInterests: string[];
  subjectStrengths: string[];
  subjectsNeedImprovement: string[];
  intendedMajor?: string;
  targetUniversity?: string;
  extracurricularActivities: string[];
}

export type UpdateAcademicProfileRequest = Partial<ICreateAcademicProfileRequest>;

export interface ICourse {
  id: string;
  name: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  credits?: number;
  skills: string[];
  prerequisites?: string[];
  durationHours?: number;
  provider?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateCourseRequest {
  name: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  credits?: number;
  skills: string[];
  prerequisites?: string[];
  durationHours?: number;
  provider?: string;
}

export interface IUpdateCourseRequest extends Partial<ICreateCourseRequest> {
  isActive?: boolean;
}

export interface ICourseFilters {
  category?: CourseCategory;
  level?: CourseLevel;
  search?: string;
}

export interface ICourseStats {
  category: CourseCategory;
  count: number;
}

export interface IEnrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  updatedAt: string;
  course?: ICourse;
}

export interface IEnrollCourseRequest {
  courseId: string;
}

export interface IUpdateProgressRequest {
  progress: number;
}

export interface IEnrollmentStats {
  total: number;
  enrolled: number;
  inProgress: number;
  completed: number;
  dropped: number;
}