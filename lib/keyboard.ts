/*
 * KEYBOARD HELPERS — shared by the blog's keyboard islands.
 *
 * One definition of "the reader is typing": focus sits inside an
 * input, textarea, select, or contentEditable element. Single-key
 * shortcuts (J/K navigation, "/" search, "?" shortcuts) must never
 * fire while the reader is composing text.
 */
export function isTypingTarget(
  target: EventTarget | null
): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tag = target.tagName;

  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT"
  );
}
