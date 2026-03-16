import type { Project } from './types'

const API_KEY = import.meta.env.VITE_DC_API_KEY || 'H9v7hCeN'

function decodeHtml(str: string): string {
  if (!str) return str
  const txt = document.createElement('textarea')
  txt.innerHTML = str
  return txt.value
}

export interface SearchParams {
  city?: string
  state: string
  budget?: number
}

export async function fetchProjects(params: SearchParams): Promise<Project[]> {
  const query = new URLSearchParams({
    APIKey: API_KEY,
    max: '50',
    showSynopsis: 'true',
    state: params.state,
  })

  if (params.city?.trim()) {
    query.set('community', params.city.trim())
  }

  const res = await fetch(`/api/common/json_feed.html?${query}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)

  const data = await res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.proposals || []).map((p: any): Project => ({
    id: p.id,
    title: decodeHtml(p.title || ''),
    shortDescription: decodeHtml(p.shortDescription || ''),
    imageURL: p.imageURL || '',
    retinaImageURL: p.retinaImageURL || p.imageURL || '',
    thumbImageURL: p.thumbImageURL || p.imageURL || '',
    teacherName: decodeHtml(p.teacherName || ''),
    schoolName: decodeHtml(p.schoolName || ''),
    city: decodeHtml(p.city || ''),
    state: p.state || '',
    subject: decodeHtml(p.subject?.name || (typeof p.subject === 'string' ? p.subject : '') || ''),
    gradeLevel: p.gradeLevel || { label: '' },
    costToComplete: parseFloat(p.costToComplete) || 0,
    percentFunded: parseFloat(p.percentFunded) || 0,
    totalPrice: parseFloat(p.totalPrice) || 0,
    numStudents: parseInt(p.numStudents) || 0,
    proposalURL: p.proposalURL || '',
    fundingStatus: p.fundingStatus || '',
    essay: decodeHtml(p.synopsis || ''),
  }))
}
