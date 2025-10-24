// Extend CSSStyleDeclaration to include vendor-specific properties
declare global {
  interface CSSStyleDeclaration {
    webkitTouchCallout?: string;
    webkitTapHighlightColor?: string;
  }
}

export {}
