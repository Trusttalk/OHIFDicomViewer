import { ShepherdBase } from 'shepherd.js';
import { offset, flip, shift } from '@floating-ui/dom';

/**
 * Retrieves the list of tours that have been shown from localStorage.
 * @returns {string[]} An array of tour IDs that have been shown.
 */

const getShownTours = () => JSON.parse(localStorage.getItem('shownTours')) || [];

/**
 * Checks if a specific tour has been shown.
 * @param {string} tourId - The ID of the tour to check.
 * @returns {boolean} True if the tour has been shown, false otherwise.
 */
const hasTourBeenShown = (tourId: string) => getShownTours().includes(tourId);

/**
 * Marks a specific tour as shown by adding it to localStorage.
 * @param {string} tourId - The ID of the tour to mark as shown.
 * @returns {void}
 */
const markTourAsShown = (tourId: string) => {
  const shownTours = getShownTours();
  if (!shownTours.includes(tourId)) {
    shownTours.push(tourId);
    localStorage.setItem('shownTours', JSON.stringify(shownTours));
  }
};

/**
 * Default handler for the 'show' event in Shepherd steps.
 * Adds a progress indicator to the footer of the current step.
 *
 * @param {ShepherdBase} Shepherd - The Shepherd.js instance.
 * @returns {void}
 */
const defaultShowHandler = (Shepherd: ShepherdBase) => {
  const currentStep = Shepherd.activeTour?.getCurrentStep();
  if (currentStep) {
    const progress = document.createElement('span');
    progress.className = 'shepherd-progress text-lg text-muted-foreground';
    progress.innerText = `${Shepherd.activeTour?.steps.indexOf(currentStep) + 1}/${Shepherd.activeTour?.steps.length}`;
    progress.style.position = 'absolute';
    progress.style.left = '13px';
    progress.style.bottom = '20px';
    progress.style.zIndex = '1';

    const footer = currentStep?.getElement()?.querySelector('.shepherd-footer');
    footer?.appendChild(progress);
  }
};

/**
 * Default Floating UI middleware for positioning steps in Shepherd.js.
 * Includes offset, shift (with body-boundary padding), and flip.
 *
 * Note: A previous `customMiddleware` that called `detectOverflow` from `@floating-ui/dom`
 * was removed because Shepherd.js provides its own platform object that does not implement
 * the `platform.detectOverflow` interface expected by `@floating-ui/dom`. This caused a
 * TypeError in production builds. The same boundary-nudging behaviour is covered natively
 * by `shift({ padding: 24 })`.
 *
 * @type {Array<object>}
 */

const middleware = [offset(15), shift({ padding: 24 }), flip()];

export { hasTourBeenShown, markTourAsShown, middleware, defaultShowHandler };
