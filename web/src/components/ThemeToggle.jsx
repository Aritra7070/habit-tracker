import { useTheme } from "../context/ThemeContext";

const toggleStyles = `
  .theme-toggle-track {
    position: relative;
    width: 62px;
    height: 32px;
    border-radius: 100px;
    cursor: pointer;
    border: none;
    outline: none;
    padding: 0;
    transition: background 0.45s ease, box-shadow 0.45s ease;
    flex-shrink: 0;
  }

  .theme-toggle-track.light {
    background: #d8d8d8;
    box-shadow: inset 0 2px 6px rgba(0,0,0,0.13);
  }
  .theme-toggle-track.dark {
    background: #3a3f48;
    box-shadow: inset 0 2px 6px rgba(0,0,0,0.45);
  }

  .theme-toggle-track:focus-visible {
    outline: 2px solid #888;
    outline-offset: 2px;
  }

  .theme-toggle-thumb {
    position: absolute;
    top: 3px;
    left: 0;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      transform 0.42s cubic-bezier(0.34, 1.48, 0.64, 1),
      background 0.4s ease,
      box-shadow 0.4s ease;
  }

  .theme-toggle-thumb.light {
    transform: translateX(4px);
    background: #efefef;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.1);
  }

  .theme-toggle-thumb.dark {
    transform: translateX(32px);
    background: #5a6472;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3);
  }

  .theme-toggle-icon {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.25s ease, transform 0.3s ease;
  }

  .theme-toggle-icon-sun {
    opacity: 0;
    transform: scale(0.5) rotate(20deg);
  }
  .theme-toggle-thumb.light .theme-toggle-icon-sun {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  .theme-toggle-icon-moon {
    opacity: 0;
    transform: scale(0.5) rotate(-20deg);
  }
  .theme-toggle-thumb.dark .theme-toggle-icon-moon {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

`;

function Sun() {
  const count = 8;
  const cx = 8, cy = 8;
  const r1 = 4.5, r2 = 6.5;

  return (
    <svg className="theme-toggle-icon theme-toggle-icon-sun" width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="2.5" fill="#2d3748" />
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx + r1 * Math.cos(angle)}
            y1={cy + r1 * Math.sin(angle)}
            x2={cx + r2 * Math.cos(angle)}
            y2={cy + r2 * Math.sin(angle)}
            stroke="#2d3748"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function Moon() {
  return (
    <svg className="theme-toggle-icon theme-toggle-icon-moon" width="14" height="14" viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#c5ccd8" />
    </svg>
  );
}



export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const mode = isDark ? "dark" : "light";

  return (
    <>
      <style>{toggleStyles}</style>
      <button
        className={`theme-toggle-track ${mode}`}
        onClick={toggleTheme}
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle light/dark mode"
      >
        <div className={`theme-toggle-thumb ${mode}`}>
          <Sun />
          <Moon />
        </div>
      </button>
    </>
  );
}
