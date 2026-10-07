import { ActivityType } from '../data'
import { IconBolt, IconTrendUp, IconPlus, IconRefresh, IconArrowRight } from './Icons'

export function ActivityIcon({ type, size = 12 }: { type: ActivityType; size?: number }) {
  switch (type) {
    case 'Payroll': return <IconBolt width={size} height={size} />
    case 'Yield': return <IconTrendUp width={size} height={size} />
    case 'Deposit': return <IconPlus width={size} height={size} />
    case 'Swap': return <IconRefresh width={size} height={size} />
    case 'Withdrawal': return <IconArrowRight width={size} height={size} />
  }
}
