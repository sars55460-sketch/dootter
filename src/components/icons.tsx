type IconProps = { className?: string };

export function SunIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M20 14.2A8.4 8.4 0 1 1 9.8 4a6.6 6.6 0 0 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SystemIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 20h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function UploadIcon({ className = "size-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 15.5V4.5m0 0L8.2 8.3M12 4.5l3.8 3.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 15v2.8A2.2 2.2 0 0 0 6.7 20h10.6a2.2 2.2 0 0 0 2.2-2.2V15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FileIcon({ className = "size-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L13.5 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M13.5 3v5.5H19" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function DownloadIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 4.5v11m0 0 3.8-3.8M12 15.5 8.2 11.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 15v2.8A2.2 2.2 0 0 0 6.7 20h10.6a2.2 2.2 0 0 0 2.2-2.2V15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PrintIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 9V4.6h10V9M7 17.5H5.6A1.6 1.6 0 0 1 4 15.9v-4.3A1.6 1.6 0 0 1 5.6 10h12.8A1.6 1.6 0 0 1 20 11.6v4.3a1.6 1.6 0 0 1-1.6 1.6H17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 14.5h10v5.9H7z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloseIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m6.5 6.5 11 11m0-11-11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldIcon({ className = "size-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3.2 5 6v5.6c0 4.2 2.9 7.7 7 9.2 4.1-1.5 7-5 7-9.2V6l-7-2.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="m9 12 2.2 2.2L15.5 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BoltIcon({ className = "size-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M13.2 3 5.5 13.2h5L10.3 21l8-10.4h-5.2L13.2 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InfinityIcon({ className = "size-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M8.4 12a3.4 3.4 0 1 1 0-6.8c2.6 0 3.6 3.4 7.2 6.8a3.4 3.4 0 1 0 0-6.8c-3.6 0-4.6 6.8-7.2 6.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SparkIcon({ className = "size-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3.5c.6 3.3 1.7 4.4 5 5-3.3.6-4.4 1.7-5 5-.6-3.3-1.7-4.4-5-5 3.3-.6 4.4-1.7 5-5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M17.8 14.4c.3 1.8.9 2.4 2.7 2.7-1.8.3-2.4.9-2.7 2.7-.3-1.8-.9-2.4-2.7-2.7 1.8-.3 2.4-.9 2.7-2.7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m5 12.8 4.4 4.4L19 7.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m6 9.5 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon({ className = "size-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export function AlertIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 4.8 3.6 19.2h16.8L12 4.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12 10v3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function SwapIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 8h12m0 0-3-3m3 3-3 3M17 16H5m0 0 3 3m-3-3 3-3"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 12h13m0 0-5-5m5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PeopleIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="9.5" cy="8.4" r="3.1" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3.8 19.4c.5-3 2.8-4.8 5.7-4.8s5.2 1.8 5.7 4.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M16.1 6.1a2.6 2.6 0 0 1 0 5M17.6 14.9c1.6.6 2.6 1.9 2.9 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
