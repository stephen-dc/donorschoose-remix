export interface Project {
  id: string
  title: string
  shortDescription: string
  imageURL: string
  retinaImageURL: string
  thumbImageURL: string
  teacherName: string
  schoolName: string
  city: string
  state: string
  subject: string
  gradeLevel: { label: string }
  costToComplete: number
  percentFunded: number
  totalPrice: number
  /** Match multiplier when a campaign is active (1.5, 2, 3, 5, 10 — purple UI + scaled display dollars) */
  matchMultiplier?: number
  numStudents: number
  proposalURL: string
  fundingStatus: string
  essay?: string
}
