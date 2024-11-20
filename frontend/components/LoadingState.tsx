import React from "react";

type Props = {
  children: React.ReactNode;
  loadingStates?: boolean[];
  fallback: React.ReactNode;
};

export default function LoadingState({
  children,
  loadingStates,
  fallback,
}: Props) {
  const loading = loadingStates
    ? !loadingStates.every((element) => element === false)
    : false;
  return loading ? fallback : children;
}
