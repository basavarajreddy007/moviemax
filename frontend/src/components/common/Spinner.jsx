import "../../css/Spinner.css";

export default function Spinner({ fullScreen }) {
  const loaderElement = (
    <div className="loader">
      <div className="truckWrapper">
        <svg className="lampPost" viewBox="0 0 20 90" fill="none">
          <path d="M10 90V15C10 8 16 2 20 2" stroke="#E50914" strokeWidth="3" strokeLinecap="round" />
          <circle cx="16" cy="6" r="4" fill="#00D4FF" />
        </svg>

        <div className="truckBody">
          <svg viewBox="0 0 130 50" fill="none">
            <rect x="0" y="10" width="85" height="35" rx="6" fill="#E50914" />
            <path d="M85 20L105 20L115 32L115 45L85 45Z" fill="#101217" stroke="#E50914" strokeWidth="2" />
            <polygon points="90,24 102,24 108,32 90,32" fill="#00D4FF" opacity="0.8" />
            <circle cx="118" cy="36" r="3" fill="#FFC107" />
          </svg>
        </div>

        <div className="truckTires">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#101217" stroke="#ffffff" strokeWidth="3" />
            <circle cx="12" cy="12" r="4" fill="#E50914" />
          </svg>
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#101217" stroke="#ffffff" strokeWidth="3" />
            <circle cx="12" cy="12" r="4" fill="#E50914" />
          </svg>
        </div>

        <div className="road" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="spinner-fullscreen">
        {loaderElement}
      </div>
    );
  }

  return loaderElement;
}
