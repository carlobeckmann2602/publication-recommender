import * as React from "react";
const SvgSparkleHistoryFill = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path
      d="M11.81 17.9c0-3.36 2.74-6.1 6.1-6.1.81 0 1.59.16 2.3.45l.8-.26-5.8-1.9c-.61-.2-1.09-.68-1.29-1.29l-1.91-5.81-1.9 5.8c-.2.61-.68 1.09-1.29 1.29l-5.81 1.91 5.8 1.9c.61.2 1.09.68 1.29 1.29l1.91 5.81.26-.8c-.29-.71-.45-1.49-.45-2.3Z"
      style={{
        fill: props.fill || "currentColor",
      }}
    />
    <circle cx={17.9} cy={17.9} r={3.1} style={{ fill: "none" }} />
    <path d="M17.9 17.41v.49l.38.42" />
  </svg>
);
export default SvgSparkleHistoryFill;
