import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="m16 16 5 5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function SlidersIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="7" r="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="17" r="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="m12 2.7 2.76 5.6 6.18.9-4.47 4.35 1.05 6.15L12 16.8l-5.52 2.9 1.05-6.15L3.06 9.2l6.18-.9L12 2.7Z" />
    </svg>
  );
}
