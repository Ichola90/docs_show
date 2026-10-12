export function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className={direction === "left" ? "arrow-icon arrow-left" : "arrow-icon"}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
