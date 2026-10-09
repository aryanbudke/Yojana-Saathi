export function Brand() {
  return (
    <>
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path
            d="M9 22V11m0 5c0-5 5-8 13-8 0 8-3 13-9 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="m10 22 9-9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span>
        yojana saathi<span className="brand-dot">.</span>
      </span>
    </>
  );
}
