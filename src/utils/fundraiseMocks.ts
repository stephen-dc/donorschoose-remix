export interface MockDonation {
  id: string
  name: string
  amount: number
  message: string
  timeAgo: string
  sortTime: number
}

export interface MockUpdate {
  id: string
  text: string
  date: string
  sortTime: number
}

const FIRST_NAMES = [
  'Sarah', 'Michael', 'Emily', 'James', 'Maria', 'David', 'Jessica', 'Robert',
  'Ashley', 'Christopher', 'Amanda', 'Daniel', 'Stephanie', 'Matthew', 'Jennifer',
  'Andrew', 'Nicole', 'Joshua', 'Elizabeth', 'Ryan', 'Lauren', 'Brandon', 'Megan',
  'Kevin', 'Rachel', 'Tyler', 'Samantha', 'Nathan', 'Katherine', 'Justin',
]

const LAST_INITIALS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const MESSAGES = [
  'Go Eagles!',
  'Happy to support these kids!',
  'From a proud alumnus',
  'Every child deserves great resources',
  'Keep up the amazing work!',
  'For the future!',
  'Proud to help our local school',
  'Teachers are heroes!',
  'Education matters!',
  'My kids went here — love this school!',
  '',
  '',
  '',
]

const TIME_AGOS = [
  '2 minutes ago', '15 minutes ago', '32 minutes ago',
  '1 hour ago', '2 hours ago', '3 hours ago', '5 hours ago',
  'yesterday', '2 days ago', '3 days ago', '5 days ago',
  '1 week ago', '2 weeks ago',
]

const TIME_AGO_MS: Record<string, number> = {
  '2 minutes ago': 2 * 60_000,
  '15 minutes ago': 15 * 60_000,
  '32 minutes ago': 32 * 60_000,
  '1 hour ago': 3600_000,
  '2 hours ago': 2 * 3600_000,
  '3 hours ago': 3 * 3600_000,
  '5 hours ago': 5 * 3600_000,
  'yesterday': 24 * 3600_000,
  '2 days ago': 2 * 86400_000,
  '3 days ago': 3 * 86400_000,
  '5 days ago': 5 * 86400_000,
  '1 week ago': 7 * 86400_000,
  '2 weeks ago': 14 * 86400_000,
  '1 day ago': 86400_000,
  'just now': 0,
}

export function timeAgoToSortTime(timeAgo: string): number {
  const ms = TIME_AGO_MS[timeAgo]
  return ms !== undefined ? Date.now() - ms : Date.now() - 86400_000
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function generateMockDonations(count: number, seed = 42): MockDonation[] {
  const rand = seededRandom(seed)
  const donations: MockDonation[] = []

  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]
    const lastInit = LAST_INITIALS[Math.floor(rand() * LAST_INITIALS.length)]

    // Long-tail distribution: mostly $10-$50, occasional $100-$250
    const r = rand()
    let amount: number
    if (r < 0.3) amount = 10
    else if (r < 0.55) amount = 25
    else if (r < 0.75) amount = 50
    else if (r < 0.88) amount = 100
    else if (r < 0.95) amount = 150
    else amount = 250

    const timeAgo = TIME_AGOS[Math.min(i, TIME_AGOS.length - 1)]
    donations.push({
      id: `donation-${i}`,
      name: `${firstName} ${lastInit}.`,
      amount,
      message: MESSAGES[Math.floor(rand() * MESSAGES.length)],
      timeAgo,
      sortTime: timeAgoToSortTime(timeAgo),
    })
  }

  return donations
}

export function generateMockUpdates(schoolName: string): MockUpdate[] {
  return [
    {
      id: 'update-1',
      text: `Just launched this fundraiser for ${schoolName}! Every dollar helps provide resources for students who need them most.`,
      date: '3 days ago',
      sortTime: timeAgoToSortTime('3 days ago'),
    },
    {
      id: 'update-2',
      text: `We're making great progress! Thank you to everyone who has donated so far. The teachers and students are so grateful for your support.`,
      date: '1 day ago',
      sortTime: timeAgoToSortTime('1 day ago'),
    },
    {
      id: 'update-3',
      text: `Wow — the response has been incredible! Let's keep the momentum going and hit our goal. Share this page with friends and family!`,
      date: '2 hours ago',
      sortTime: timeAgoToSortTime('2 hours ago'),
    },
  ]
}

// Colors for avatar circles (DC secondary palette)
export const AVATAR_COLORS = [
  '#3804c1', '#d621be', '#ff7a07', '#6ea217', '#3da9f3', '#ffc80b',
]

export function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
