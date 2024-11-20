import * as React from "react";
const SvgSparkleHistory = ({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size.toString()}
    height={size.toString()}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ minWidth: "fit-content" }}
    {...props}
  >
    <path d="m21 12-5.8-1.9c-.61-.2-1.09-.68-1.29-1.29L12 3l-1.9 5.8c-.2.61-.68 1.09-1.29 1.29L3 12l5.8 1.9c.61.2 1.09.68 1.29 1.29L12 21" />
    <circle cx={17.9} cy={17.9} r={3.1} />
    <path d="M17.9 17.41v.49l.38.42" />
  </svg>
);
export default SvgSparkleHistory;
