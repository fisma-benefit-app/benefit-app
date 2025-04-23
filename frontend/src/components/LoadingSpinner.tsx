export default function LoadingSpinner() {
    return (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
          <svg className="animate-spin h-12 w-12" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="blue"
              strokeWidth="4"
              strokeDasharray="31.4"
              strokeLinecap="round"
            ></circle>
          </svg>
        </div>
    );
}