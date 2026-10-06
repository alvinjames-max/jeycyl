import React from "react";

interface FrostingScallopProps {
  color?: string; // fill color
  direction?: "down" | "up";
  className?: string;
}

export function FrostingScallop({
  color = "#FBEEF2",
  direction = "down",
  className = "",
}: FrostingScallopProps) {
  // Repeating piped frosting scallops (shell border)
  return (
    <div
      className={`w-full overflow-hidden leading-none select-none ${className}`}
      style={{
        transform: direction === "up" ? "rotate(180deg)" : undefined,
      }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-4 sm:h-5 block text-current"
        viewBox="0 0 1200 20"
        preserveAspectRatio="none"
        style={{ color }}
      >
        <path
          d="
            M 0,0 
            C 15,18 35,18 50,0
            C 65,18 85,18 100,0
            C 115,18 135,18 150,0
            C 165,18 185,18 200,0
            C 215,18 235,18 250,0
            C 265,18 285,18 300,0
            C 315,18 335,18 350,0
            C 365,18 385,18 400,0
            C 415,18 435,18 450,0
            C 465,18 485,18 500,0
            C 515,18 535,18 550,0
            C 565,18 585,18 600,0
            C 615,18 635,18 650,0
            C 665,18 685,18 700,0
            C 715,18 735,18 750,0
            C 765,18 785,18 800,0
            C 815,18 835,18 850,0
            C 865,18 885,18 900,0
            C 915,18 935,18 950,0
            C 965,18 985,18 1000,0
            C 1015,18 1035,18 1050,0
            C 1065,18 1085,18 1100,0
            C 1115,18 1135,18 1150,0
            C 1165,18 1185,18 1200,0
            L 1200,0 L 0,0 Z
          "
          fill="currentColor"
        />
        {/* Soft bottom frosting wave */}
        <path
          d="
            M 0,0 
            Q 25,16 50,0
            Q 75,16 100,0
            Q 125,16 150,0
            Q 175,16 200,0
            Q 225,16 250,0
            Q 275,16 300,0
            Q 325,16 350,0
            Q 375,16 400,0
            Q 425,16 450,0
            Q 475,16 500,0
            Q 525,16 550,0
            Q 575,16 600,0
            Q 625,16 650,0
            Q 675,16 700,0
            Q 725,16 750,0
            Q 775,16 800,0
            Q 825,16 850,0
            Q 875,16 900,0
            Q 925,16 950,0
            Q 975,16 1000,0
            Q 1025,16 1050,0
            Q 1075,16 1100,0
            Q 1125,16 1150,0
            Q 1175,16 1200,0
          "
          fill="none"
          stroke="rgba(201, 162, 39, 0.4)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

export function ScallopedCardTrim({ className = "" }: { className?: string }) {
  // Piped frosting scalloped border for cards
  return (
    <div
      className={`w-full h-3 overflow-hidden select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full block"
        viewBox="0 0 600 12"
        preserveAspectRatio="none"
      >
        <path
          d="
            M 0,0 
            C 7,12 18,12 25,0
            C 32,12 43,12 50,0
            C 57,12 68,12 75,0
            C 82,12 93,12 100,0
            C 107,12 118,12 125,0
            C 132,12 143,12 150,0
            C 157,12 168,12 175,0
            C 182,12 193,12 200,0
            C 207,12 218,12 225,0
            C 232,12 243,12 250,0
            C 257,12 268,12 275,0
            C 282,12 293,12 300,0
            C 307,12 318,12 325,0
            C 332,12 343,12 350,0
            C 357,12 368,12 375,0
            C 382,12 393,12 400,0
            C 407,12 418,12 425,0
            C 432,12 443,12 450,0
            C 457,12 468,12 475,0
            C 482,12 493,12 500,0
            C 507,12 518,12 525,0
            C 532,12 543,12 550,0
            C 557,12 568,12 575,0
            C 582,12 593,12 600,0
            L 600,0 L 0,0 Z
          "
          fill="#3D1436"
          opacity="0.12"
        />
      </svg>
    </div>
  );
}
