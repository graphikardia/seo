interface ScoreDialProps {
  score: number;
  max?: number;
  label: string;
  size?: "sm" | "md" | "lg";
  grade?: "A" | "B" | "C" | "D" | "F";
}

const sizeMap = {
  sm: { dial: 80, text: "text-xl", label: "text-xs" },
  md: { dial: 120, text: "text-3xl", label: "text-sm" },
  lg: { dial: 160, text: "text-4xl", label: "text-base" },
};

const getGradeColor = (grade?: string): string => {
  switch (grade) {
    case "A":
      return "text-green-400";
    case "B":
      return "text-cyan-400";
    case "C":
      return "text-yellow-400";
    case "D":
      return "text-orange-400";
    case "F":
      return "text-red-400";
    default:
      return "text-cyan-400";
  }
};

export default function ScoreDial({
  score,
  max = 100,
  label,
  size = "md",
  grade,
}: ScoreDialProps) {
  const sizes = sizeMap[size];
  const percentage = (score / max) * 100;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex items-center justify-center"
        style={{ width: `${sizes.dial}px`, height: `${sizes.dial}px` }}
      >
        {/* Background Circle */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 120 120"
          style={{
            filter:
              "drop-shadow(0 0 20px rgba(34, 211, 238, 0.3)) drop-shadow(0 0 40px rgba(168, 85, 247, 0.1))",
          }}
        >
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="rgba(34, 211, 238, 0.1)"
            strokeWidth="3"
          />
          {/* Progress Circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1s ease-out",
              transform: "rotate(-90deg)",
              transformOrigin: "60px 60px",
            }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="relative flex flex-col items-center justify-center">
          {grade ? (
            <>
              <div className={`font-bold ${getGradeColor(grade)} ${sizes.text}`}>
                {grade}
              </div>
              <div className="text-xs text-gray-400">{score}%</div>
            </>
          ) : (
            <div className={`font-bold text-cyan-400 ${sizes.text}`}>
              {score}
            </div>
          )}
        </div>
      </div>

      {/* Label */}
      <p className={`text-center text-gray-300 ${sizes.label} font-medium`}>
        {label}
      </p>
    </div>
  );
}
