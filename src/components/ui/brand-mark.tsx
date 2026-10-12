export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none">
        <path
          d="M19 12h18l11 11v28a4 4 0 0 1-4 4H19a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4Z"
          fill="white"
        />
        <path
          d="M37 12v9a3 3 0 0 0 3 3h8"
          fill="#bfdbfe"
          stroke="white"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M23 33h18M23 40h18M23 47h11"
          stroke="#2563eb"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
    </span>
  );
}
