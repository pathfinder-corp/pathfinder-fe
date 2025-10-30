export const EDUCATION_LEVELS = {
  HIGH_SCHOOL: 'high_school',
  UNDERGRADUATE: 'undergraduate',
  GRADUATE: 'graduate',
  POSTGRADUATE: 'postgraduate',
} as const;

export const COURSE_CATEGORIES = {
  MATH: 'math',
  SCIENCE: 'science',
  TECHNOLOGY: 'technology',
  ENGINEERING: 'engineering',
  BUSINESS: 'business',
  ARTS: 'arts',
  HUMANITIES: 'humanities',
  LANGUAGE: 'language',
  SOCIAL_SCIENCE: 'social_science',
  OTHER: 'other',
} as const;

export const COURSE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const;

export const ENROLLMENT_STATUS = {
  ENROLLED: 'enrolled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
} as const;

export const EDUCATION_LEVEL_LABELS = {
  high_school: 'Trung học phổ thông',
  undergraduate: 'Đại học',
  graduate: 'Thạc sĩ',
  postgraduate: 'Tiến sĩ',
} as const;

export const COURSE_CATEGORY_LABELS = {
  math: 'Toán học',
  science: 'Khoa học',
  technology: 'Công nghệ',
  engineering: 'Kỹ thuật',
  business: 'Kinh doanh',
  arts: 'Nghệ thuật',
  humanities: 'Nhân văn',
  language: 'Ngôn ngữ',
  social_science: 'Khoa học xã hội',
  other: 'Khác',
} as const;

export const COURSE_LEVEL_LABELS = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
  expert: 'Chuyên gia',
} as const;

export const ENROLLMENT_STATUS_LABELS = {
  enrolled: 'Đã đăng ký',
  in_progress: 'Đang học',
  completed: 'Hoàn thành',
  dropped: 'Đã bỏ học',
} as const;

export const ENROLLMENT_STATUS_COLORS = {
  enrolled: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  dropped: 'bg-red-500/10 text-red-500 border-red-500/20',
} as const;