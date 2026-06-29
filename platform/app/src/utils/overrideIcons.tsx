import React from 'react';
import { Icons } from '@ohif/ui-next';

// Shared styling helper for the outer circle button boundary
const SVG_CIRCLE_R = 9.5;

// 1. Length (Ruler) with clean circular boundary
function CustomLengthIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r={SVG_CIRCLE_R} />
      {/* Ruler horizontal line */}
      <path d="M7.5 12h9" />
      {/* Ticks centered across the line */}
      <path d="M7.5 10.5v3M10.5 11v2M13.5 11v2M16.5 10.5v3" />
    </svg>
  );
}

// 2. Zoom (Lens) with clean circular boundary
function CustomZoomIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r={SVG_CIRCLE_R} />
      <circle cx="10.5" cy="10.5" r="3.5" />
      <path d="M13 13l3.5 3.5" />
    </svg>
  );
}

// 3. Pan (Move Crosshair) with clean circular boundary
function CustomMoveIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r={SVG_CIRCLE_R} />
      {/* 4-way arrow perfectly centered */}
      <path d="M12 7.5v9M7.5 12h9" />
      <path d="M10.5 9L12 7.5 13.5 9" />
      <path d="M10.5 15L12 16.5 13.5 15" />
      <path d="M9 10.5L7.5 12 9 13.5" />
      <path d="M15 10.5L16.5 12 15 13.5" />
    </svg>
  );
}

// 4. Contrast (Half-Filled Circle) with clean circular boundary
function CustomWindowLevelIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r={SVG_CIRCLE_R} />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 7a5 5 0 0 0 0 10Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

// 5. Capture (Camera Viewport Frame) with clean circular boundary
function CustomCaptureIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r={SVG_CIRCLE_R} />
      <rect x="7.5" y="9.25" width="9" height="7" rx="1" />
      <path d="M10 9.25V7.75h4v1.5" />
      <circle cx="12" cy="12.75" r="2" />
    </svg>
  );
}

// 6. Layout (Viewport Grid) with clean circular boundary
function CustomLayoutIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r={SVG_CIRCLE_R} />
      <rect x="7.5" y="7.5" width="9" height="9" rx="1" />
      <path d="M7.5 12h9M12 7.5v9" />
    </svg>
  );
}

// 7. Reset (Circular Sweep) with clean circular boundary
function CustomResetIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r={SVG_CIRCLE_R} />
      {/* 270-degree arc from top to left */}
      <path d="M12 8 A 4 4 0 1 1 8 12" />
      {/* Arrowhead pointing down-left at the end of the arc */}
      <path d="M8 9 v 3 h 3" />
    </svg>
  );
}

// 8. 3D Rotate (Cube with rotating arrow)
function Custom3DRotateIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r={SVG_CIRCLE_R} />
      {/* 3D Cube */}
      <path d="M12 8l3.5 2v4l-3.5 2-3.5-2v-4z" />
      <path d="M12 12l3.5-2M12 12l-3.5-2M12 12v4" />
      {/* Rotation Arrow */}
      <path d="M6 12a6 3 0 0 1 12 0" strokeDasharray="2 2" />
      <path d="M18 12v2h-2" />
    </svg>
  );
}

export function registerCustomIcons() {
  if (Icons && typeof Icons.addIcon === 'function') {
    Icons.addIcon('tool-length', CustomLengthIcon);
    Icons.addIcon('tool-zoom', CustomZoomIcon);
    Icons.addIcon('tool-move', CustomMoveIcon);
    Icons.addIcon('tool-window-level', CustomWindowLevelIcon);
    Icons.addIcon('tool-capture', CustomCaptureIcon);
    Icons.addIcon('tool-layout', CustomLayoutIcon);
    Icons.addIcon('tool-reset', CustomResetIcon);
    Icons.addIcon('tool-3d-rotate', Custom3DRotateIcon);
  }
}
