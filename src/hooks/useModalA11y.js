import { useEffect, useRef } from "react";

/**
 * Standard modal keyboard accessibility, in one place instead of
 * re-implemented (or, more commonly, not implemented at all) in every
 * modal across the app. Handles the three things WCAG expects from any
 * dialog:
 *
 *   1. Escape closes it.
 *   2. Focus moves INTO the modal the moment it opens, and is trapped
 *      there — Tab/Shift+Tab cycle through the modal's own focusable
 *      elements only, never silently escaping to the page content
 *      sitting behind the overlay (which a sighted mouse user can't
 *      see is even happening, but a keyboard-only user absolutely can).
 *   3. Focus returns to whatever element had it before the modal
 *      opened (almost always the button that triggered it), once the
 *      modal closes — so keyboard users don't get dropped back at the
 *      top of the page and have to re-navigate to where they were.
 *
 * Usage — call at the top of a modal component, passing a ref to the
 * modal's outer content box (not the full-screen overlay) and the
 * close handler:
 *
 *   const boxRef = useRef(null);
 *   useModalA11y(boxRef, onClose);
 *   return (
 *     <div style={overlayStyles} onClick={onClose}>
 *       <div ref={boxRef} onClick={e => e.stopPropagation()} ...>
 *         ...
 *       </div>
 *     </div>
 *   );
 *
 * `active` defaults to true — pass false for modals that are
 * conditionally rendered further up the tree anyway (most of them),
 * or true/false explicitly for ones kept mounted and toggled by a
 * boolean, so the trap only engages while actually visible.
 */
export function useModalA11y(boxRef, onClose, active = true) {
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!active) return;

    previouslyFocused.current = document.activeElement;

    // Focus the first focusable element inside the modal, or the box
    // itself as a fallback (it has tabIndex=-1 set below via the DOM
    // so it's programmatically focusable even with no inputs inside).
    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), ' +
      'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const box = boxRef.current;
    if (box) {
      box.setAttribute("tabindex", "-1");
      const first = box.querySelector(focusableSelector);
      (first || box).focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }
      if (e.key !== "Tab" || !box) return;

      const focusables = Array.from(box.querySelectorAll(focusableSelector))
        .filter(el => el.offsetParent !== null); // skip hidden elements
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Return focus to whatever triggered the modal — but only if
      // that element still exists in the DOM (it may have been
      // removed, e.g. a row deleted as part of what the modal did).
      if (previouslyFocused.current && document.contains(previouslyFocused.current)) {
        previouslyFocused.current.focus();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
