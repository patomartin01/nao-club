import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#FAF6ED',
          border: '1.5px solid #1A1918',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 7,
          fontWeight: 900,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '-0.05em',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 58 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 0 H21 L37 38 V4 C37 1.8 38.8 0 41 0 H47 C49.2 0 51 1.8 51 4 V48 C51 50.2 49.2 52 47 52 H37 L21 14 V48 C21 50.2 19.2 52 17 52 H11 C8.8 52 7 50.2 7 48 V4 C7 1.8 8.8 0 11 0 Z"
            fill="#EB4438"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
