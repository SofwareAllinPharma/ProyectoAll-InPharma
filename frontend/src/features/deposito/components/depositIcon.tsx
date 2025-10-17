export default function DepositIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
      <path
        d="M3 10.5L12 5l9 5.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8.5z"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 12h8M8 15h8M8 18h8" strokeWidth={1.7} strokeLinecap="round" />
    </svg>
  );
}
