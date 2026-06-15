type LogoSize = "sm" | "md" | "lg" | "xl";

const sizeClass: Record<LogoSize, string> = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
  xl: "h-14",
};

interface LogoProps {
  size?: LogoSize;
  className?: string;
}

export default function Logo({ size = "md", className }: LogoProps) {
  const width = 200;
  const height = 52;

  const wordSize =
    size === "xl" ? 22 : size === "lg" ? 18 : size === "md" ? 15 : 13;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Elettronica51"
      className={["w-auto shrink-0", sizeClass[size], className]
        .filter(Boolean)
        .join(" ")}
    >
      <g transform="translate(0, 8)">
        <rect
          x="0.75"
          y="0.75"
          width="34.5"
          height="34.5"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          opacity="0.88"
        />
        <rect x="6" y="30" width="24" height="2" rx="1" fill="#f97316" />
        <text
          x="18"
          y="22"
          textAnchor="middle"
          fill="currentColor"
          fontFamily="var(--font-poppins), system-ui, sans-serif"
          fontWeight="600"
          fontSize="13"
          letterSpacing="0.06em"
        >
          51
        </text>
      </g>

      <g transform="translate(48, 28)">
        <text
          y="0"
          fill="currentColor"
          fontFamily="var(--font-poppins), system-ui, sans-serif"
          fontWeight="500"
          fontSize={wordSize}
          letterSpacing="-0.025em"
        >
          Elettronica
          <tspan fill="#f97316" fontWeight="700" letterSpacing="-0.04em">
            51
          </tspan>
        </text>
        <rect x="0" y="8" width="28" height="1.5" rx="0.75" fill="#f97316" />
      </g>
    </svg>
  );
}