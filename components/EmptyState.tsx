import { ReactNode } from 'react'

interface Props {
  title: string
  description: string
  action?: ReactNode
  'data-testid'?: string
}

export function EmptyState({ title, description, action, 'data-testid': dataTestId }: Props) {
  return (
    <div 
      data-testid={dataTestId}
      className="text-center py-12"
    >
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <div className="w-8 h-8 bg-muted-foreground/20 rounded-full" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
