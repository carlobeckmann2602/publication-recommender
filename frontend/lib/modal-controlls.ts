export const preventBackgroundScrolling = () => {
  if (typeof window != "undefined" && window.document) {
    document.body.style.overflow = "hidden";
  }
};

export const allowBackgroundScrolling = () => {
  if (typeof window != "undefined" && window.document) {
    document.body.style.overflow = "unset";
  }
};
