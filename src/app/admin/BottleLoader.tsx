/** Loading placeholder: a mezcal bottle that fills up. Pure SVG and CSS, no files to download. */
export default function BottleLoader() {
  return (
    <div className="adm-loader" role="status" aria-live="polite">
      <svg viewBox="0 0 120 200" width="120" height="200" aria-hidden="true">
        <defs>
          <clipPath id="adm-bottle-inside">
            <path d="M48 8h24v34c0 10 22 20 22 52v86c0 8-6 14-14 14H40c-8 0-14-6-14-14V94c0-32 22-42 22-52z" />
          </clipPath>
        </defs>
        <g clipPath="url(#adm-bottle-inside)">
          <g className="adm-bottle-fill">
            <path className="adm-bottle-wave" d="M-60 0q15 -8 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0v10h-240z" />
            <rect x="0" y="0" width="120" height="200" />
          </g>
        </g>
        <path
          d="M48 8h24v34c0 10 22 20 22 52v86c0 8-6 14-14 14H40c-8 0-14-6-14-14V94c0-32 22-42 22-52z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <rect x="46" y="2" width="28" height="9" fill="currentColor" />
      </svg>
      <p>Hankering for some statistics? They are flowing in now!</p>
    </div>
  );
}
