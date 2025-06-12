import { AlertCircle, CheckCircle } from 'lucide-react'

export const TABS = [
  { value: 'all', label: 'All Links' },
  { value: 'external', label: 'External' },
  { value: 'internal', label: 'Internal' },
  { value: 'nofollow', label: 'NoFollow' }
]

export const RESULT_FILTERS = [
  { value: 'all', label: 'All Results', icon: null },
  {
    value: 'working',
    label: 'Working',
    icon: <CheckCircle className="mr-1 h-3.5 w-3.5 text-green-500" />
  },
  {
    value: 'broken',
    label: 'Broken',
    icon: <AlertCircle className="mr-1 h-3.5 w-3.5 text-red-500" />
  }
]
