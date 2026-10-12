export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none">
        {/* Book pages 3D underlay */}
        <path
          d="M8 34.5C13 33.5 19 35.5 24 37.5C29 35.5 35 33.5 40 34.5V36.5C35 35.5 29 37.5 24 39.5C19 37.5 13 35.5 8 36.5V34.5Z"
          fill="#1e3a8a"
          opacity="0.6"
        />
        {/* Left page */}
        <path
          d="M24 16C19 14.5 13 13 8 14V33C13 32 19 33.5 24 35.5V16Z"
          fill="white"
        />
        {/* Left chevron < */}
        <path
          d="M18.5 20.5L13.5 24L18.5 27.5"
          stroke="#2563eb"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left page subtle code line */}
        <path
          d="M12.5 30H19.5"
          stroke="#93c5fd"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Right page */}
        <path
          d="M24 16C29 14.5 35 13 40 14V33C35 32 29 33.5 24 35.5V16Z"
          fill="#f0f9ff"
        />
        {/* Right chevron > */}
        <path
          d="M29.5 20.5L34.5 24L29.5 27.5"
          stroke="#0284c7"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right page subtle code line */}
        <path
          d="M28.5 30H35.5"
          stroke="#7dd3fc"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Central golden bookmark ribbon */}
        <path
          d="M22.5 9.5H25.5V23.5L24 22L22.5 23.5V9.5Z"
          fill="#f59e0b"
        />
        {/* Golden bookmark bead */}
        <circle cx="24" cy="8.5" r="1.8" fill="#fbbf24" />
        <circle cx="24" cy="8.5" r="0.8" fill="white" />
      </svg>
    </span>
  );
}

