export default function DotLoadingSpinner() {
    return(
        <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 100 100" fill="none">
              {[...Array(8)].map((_, i) => {
                const angle = (i * 360) / 8;
                const rad = (angle * Math.PI) / 180;
                const x = 50 + Math.cos(rad) * 30;
                const y = 50 + Math.sin(rad) * 30;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="5"
                    fill="currentColor"
                    opacity={i / 8}
                  />
                );
              })}
        </svg>
    );
}