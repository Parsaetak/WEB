/*
 * Native cursor implementation.
 *
 * Performance constitution:
 * - No pointer listeners.
 * - No requestAnimationFrame loop.
 * - No React state.
 * - No moving DOM element.
 * - No SVG filters.
 * - No box-shadow animation.
 * - No per-frame style writes.
 *
 * Cursor movement is handled directly by the browser/OS, so the cursor
 * remains synchronized with the user's actual system pointer speed and
 * does not consume the page's animation/rendering budget.
 */

const NATIVE_CURSOR_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='24' viewBox='0 0 20 24'%3E%3Cpath d='M1.5 1.5V19l5.1-4.95 4.65 7.2 3.35-2.15-4.6-7.12H18.5z' fill='%23d81212' stroke='%23ff5959' stroke-width='1.2' stroke-linejoin='round'/%3E%3Cpath d='M3.6 4.2v10.8l3.55-3.45' fill='none' stroke='%23ff8a8a' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='6.6' cy='9' r='1.3' fill='%23ffffff'/%3E%3C/svg%3E";

export default function RedCursor() {
  return (
    <style
      id="red-cursor-native"
      dangerouslySetInnerHTML={{
        __html: `
          html,
          body,
          a,
          button,
          [role="button"],
          input,
          textarea,
          select,
          summary {
            cursor: url("${NATIVE_CURSOR_DATA_URL}") 2 2, auto;
          }
        `,
      }}
    />
  );
}
