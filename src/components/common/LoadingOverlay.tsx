interface LoadingOverlayProps {
  label?: string
}

export function LoadingOverlay({ label = 'Loading…' }: LoadingOverlayProps) {
  return (
    <div
      role="status"
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-light-grey dark:bg-charcoal"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-mid-grey border-t-sfu-red"
        aria-hidden="true"
      />
      <p className="text-sm text-charcoal/70 dark:text-light-grey/70">{label}</p>
    </div>
  )
}
