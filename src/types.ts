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
  numStudents: number
  proposalURL: string
  fundingStatus: string
  essay?: string
}
