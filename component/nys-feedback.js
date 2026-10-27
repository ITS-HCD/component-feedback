import {LitElement, css, html, nothing} from 'lit';

/**
 * Asks people to rate an experience they just finished, such as renewing a
 * license, with one positive and one negative answer.
 *
 * Wide containers show the prompt and buttons in one row. Narrow containers
 * stack them in one centered column. The layout follows the component's own
 * width through a container query, not the viewport.
 *
 * The component takes no space for two seconds after it first renders, so
 * the page reads as if it weren't there. Then it opens downward, pushing the
 * content below it down, and its contents fade in as it grows. Set
 * `--nys-feedback-entrance-delay` to change the wait. A component that's
 * already `submitted` when it first renders skips the entrance, because a
 * finished form shouldn't draw attention. Call `animateIn()` to play the
 * entrance again.
 *
 * After someone answers, the buttons fade out, the panel shrinks to fit, and
 * a thank-you message rises into place. Then the component fires
 * `nys-feedback`. Set `submitted` to show the thank-you message without an
 * answer, for example when you already have one for this session. Every
 * animation is CSS, and each one tones down for `prefers-reduced-motion`.
 *
 * Requires the NYSDS styles and components (`nys-button`, `nys-icon`).
 *
 * @fires nys-feedback - Fired once when someone answers. `detail` holds
 *   `value` (`good` or `needs-improvement`) and `label` (the button text).
 * @cssprop [--nys-feedback-entrance-delay=2s] - How long to wait before the
 *   component animates in.
 */
export class NysFeedback extends LitElement {
  static properties = {
    /** The question. Keep it short. */
    heading: {type: String},
    /** Names the experience the question is about. */
    text: {type: String},
    /** Label for the positive answer. */
    positiveLabel: {type: String},
    /** Label for the negative answer. */
    negativeLabel: {type: String},
    /** The message that replaces the buttons after someone answers. */
    confirmationText: {type: String},
    /** Whether someone has answered. Hides the buttons. */
    submitted: {type: Boolean, reflect: true},
    /** The answer: `good`, `needs-improvement`, or empty. */
    value: {type: String, reflect: true},
    /** Whether the frame carries the entrance animation. */
    _entering: {state: true},
  };

  static styles = css`
    :host {
      /* NYSDS has no motion tokens yet, so the timing lives here. */
      --_ease-out: cubic-bezier(0.2, 0, 0, 1);
      --_ease-overshoot: cubic-bezier(0.34, 1.56, 0.64, 1);

      display: block;
      container-type: inline-size;
      color: var(--nys-color-text);
      font-family: var(--nys-font-family-ui);
    }

    :host([hidden]) {
      display: none;
    }

    /* Frame and panel ---------------------------------------------------- */

    /*
     * The frame is a one-row grid, like the steps below, so the entrance can
     * open it from no height at all. The frame's own border and shadow grow
     * with it, and the clip inside hides the content that hasn't fit yet.
     */
    .frame {
      display: grid;
      grid-template-rows: 1fr;
      background-color: var(--nys-color-surface);
      /* No applied NYSDS token is this light, so use the neutral primitive. */
      border: var(--nys-border-width-sm) solid var(--nys-color-neutral-100);
      border-radius: var(--nys-radius-xl);
      box-shadow: var(--nys-shadow-raised);
    }

    .frame__clip {
      min-height: 0;
      overflow: hidden;
    }

    .frame--enter {
      animation: nys-feedback-open 500ms var(--_ease-out) var(--nys-feedback-entrance-delay, 2s)
        both;
    }

    .frame--enter .frame__clip {
      animation: nys-feedback-reveal 400ms ease-out
        calc(var(--nys-feedback-entrance-delay, 2s) + 150ms) both;
    }

    .panel {
      overflow: hidden;
      /* A margin, not padding on the frame, so the frame can close to 0. */
      margin: var(--nys-space-100);
      padding: var(--nys-space-300);
      background-color: var(--nys-color-theme-faint);
      border-radius: var(--nys-radius-lg);
    }

    /*
     * Each step sits in a one-row grid. Moving that row between 1fr and 0fr
     * animates its height, so the panel shrinks or grows to fit whichever
     * step shows. The panel clips the step on its way out.
     */
    .collapse {
      display: grid;
      grid-template-rows: 1fr;
      transition: grid-template-rows 450ms var(--_ease-out);
    }

    .collapse--confirmation {
      grid-template-rows: 0fr;
    }

    .step {
      min-height: 0;
    }

    /* Prompt ------------------------------------------------------------- */

    .step--prompt {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--nys-space-250);
      text-align: center;
      transition:
        opacity 250ms ease 250ms,
        visibility 0s;
    }

    .prompt {
      display: flex;
      flex-direction: column;
      gap: var(--nys-space-50);
    }

    .heading {
      margin: 0;
      font-size: var(--nys-font-size-ui-lg);
      font-weight: var(--nys-font-weight-bold);
      line-height: var(--nys-font-lineheight-ui-lg);
    }

    .text {
      margin: 0;
      color: var(--nys-color-text-weak);
      font-family: var(--nys-font-family-body);
      font-size: var(--nys-font-size-body-md);
      line-height: var(--nys-font-lineheight-body-md);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--nys-space-200);
    }

    /* Thank-you message -------------------------------------------------- */

    .step--confirmation {
      display: flex;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transform: translateY(var(--nys-space-200));
      transition:
        opacity 150ms ease,
        transform 150ms ease,
        visibility 0s linear 150ms;
    }

    .confirmation {
      display: flex;
      align-items: center;
      gap: var(--nys-space-100);
      margin: 0;
      color: var(--nys-color-success-strong);
      font-size: var(--nys-font-size-ui-lg);
      font-weight: var(--nys-font-weight-semibold);
      line-height: var(--nys-font-lineheight-ui-lg);
    }

    .confirmation:focus {
      outline: none;
    }

    .confirmation:focus-visible {
      outline: var(--nys-border-width-md) solid var(--nys-color-focus);
      outline-offset: var(--nys-space-50);
      border-radius: var(--nys-radius-sm);
    }

    .confirmation nys-icon {
      transform: scale(0.4);
      transition: transform 150ms ease;
    }

    /* Answered ----------------------------------------------------------- */

    :host([submitted]) .collapse {
      transition-delay: 150ms;
    }

    :host([submitted]) .collapse--prompt {
      grid-template-rows: 0fr;
    }

    :host([submitted]) .collapse--confirmation {
      grid-template-rows: 1fr;
    }

    :host([submitted]) .step--prompt {
      opacity: 0;
      visibility: hidden;
      transition:
        opacity 200ms ease,
        visibility 0s linear 200ms;
    }

    :host([submitted]) .step--confirmation {
      opacity: 1;
      visibility: visible;
      transform: none;
      transition:
        opacity 300ms ease 300ms,
        transform 450ms var(--_ease-out) 300ms,
        visibility 0s;
    }

    :host([submitted]) .confirmation nys-icon {
      transform: none;
      transition: transform 500ms var(--_ease-overshoot) 400ms;
    }

    /* Wide layout -------------------------------------------------------- */

    @container (min-width: 40rem) {
      .panel {
        padding: var(--nys-space-300) var(--nys-space-400);
      }

      .step--prompt {
        flex-direction: row;
        justify-content: space-between;
        text-align: start;
      }

      .step--confirmation {
        justify-content: flex-start;
      }

      .actions {
        flex-shrink: 0;
        justify-content: flex-end;
      }
    }

    /* Keyframes ---------------------------------------------------------- */

    /* Closed and hidden while it waits, so it takes no space and nobody can
       tab into buttons they can't see yet. */
    @keyframes nys-feedback-open {
      0% {
        visibility: hidden;
        opacity: 0;
        grid-template-rows: 0fr;
        border-block-width: 0;
      }
      30% {
        opacity: 1;
      }
    }

    /* The content drifts down as it fades in, the same way the page moves. */
    @keyframes nys-feedback-reveal {
      from {
        opacity: 0;
        transform: translateY(calc(-1 * var(--nys-space-150)));
      }
    }

    /* Opens at once and fades in, without growing or drifting. */
    @keyframes nys-feedback-fade-open {
      0% {
        visibility: hidden;
        opacity: 0;
        grid-template-rows: 0fr;
        border-block-width: 0;
      }
      1% {
        grid-template-rows: 1fr;
        border-block-width: var(--nys-border-width-sm);
      }
    }

    /* Fades stay, movement goes. */
    @media (prefers-reduced-motion: reduce) {
      .frame--enter {
        animation: nys-feedback-fade-open 400ms ease var(--nys-feedback-entrance-delay, 2s) both;
      }

      .frame--enter .frame__clip {
        animation: none;
      }

      .collapse,
      :host([submitted]) .collapse {
        transition: none;
      }

      .step--confirmation,
      .confirmation nys-icon {
        transform: none;
      }

      /* The panel snaps to its new height, so the outgoing step leaves at
         once instead of fading over the incoming one. */
      .step--prompt {
        transition:
          opacity 300ms ease,
          visibility 0s;
      }

      :host([submitted]) .step--prompt,
      .step--confirmation {
        transition: none;
      }

      :host([submitted]) .step--confirmation {
        transition:
          opacity 300ms ease,
          visibility 0s;
      }
    }
  `;

  static #count = 0;

  constructor() {
    super();
    this.heading = 'How did we do?';
    this.text = '';
    this.positiveLabel = 'Good';
    this.negativeLabel = 'Needs improvement';
    this.confirmationText = 'Thanks for your feedback.';
    this.submitted = false;
    this.value = '';
    this._entering = false;
    this._idPrefix = `nys-feedback-${++NysFeedback.#count}`;
  }

  willUpdate() {
    // Decide once, on the first render. Answering or resetting later leaves
    // the class alone, so neither one replays the entrance.
    if (!this.hasUpdated) {
      this._entering = !this.submitted;
    }
  }

  /** Clears the answer and shows the buttons again, without an entrance. */
  reset() {
    this.submitted = false;
    this.value = '';
  }

  /** Plays the entrance animation again, delay included. */
  async animateIn() {
    this._entering = false;
    await this.updateComplete;
    // Reading a style makes the browser drop the old animations, so adding
    // the class back starts both of them fresh.
    const frame = this.renderRoot.querySelector('.frame');
    if (frame) {
      getComputedStyle(frame).animationName;
    }
    this._entering = true;
    await this.updateComplete;
  }

  async _answer(value, label) {
    if (this.submitted) {
      return;
    }
    this.value = value;
    this.submitted = true;
    this.dispatchEvent(
      new CustomEvent('nys-feedback', {
        detail: {value, label},
        bubbles: true,
        composed: true,
      }),
    );
    // The button that had focus is fading out, so move focus to the message.
    await this.updateComplete;
    this.renderRoot.querySelector('.confirmation')?.focus();
  }

  render() {
    const headingId = `${this._idPrefix}-heading`;
    const textId = `${this._idPrefix}-text`;

    // Both steps stay in the DOM so CSS can animate between them. The hidden
    // one has `visibility: hidden`, which also keeps it out of the tab order
    // and the accessibility tree.
    return html`
      <div class="frame ${this._entering ? 'frame--enter' : ''}">
        <div class="frame__clip">
          <div class="panel">
            <div class="collapse collapse--prompt">
              <div
                class="step step--prompt"
                role="group"
                aria-labelledby=${headingId}
                aria-describedby=${this.text ? textId : nothing}
              >
                <div class="prompt">
                  <p class="heading" id=${headingId}>${this.heading}</p>
                  ${this.text ? html`<p class="text" id=${textId}>${this.text}</p>` : ''}
                </div>
                <div class="actions">
                  <nys-button
                    variant="filled"
                    prefixIcon="thumb_up"
                    label=${this.positiveLabel}
                    @nys-click=${() => this._answer('good', this.positiveLabel)}
                  ></nys-button>
                  <nys-button
                    variant="filled"
                    prefixIcon="thumb_down"
                    label=${this.negativeLabel}
                    @nys-click=${() => this._answer('needs-improvement', this.negativeLabel)}
                  ></nys-button>
                </div>
              </div>
            </div>
            <div class="collapse collapse--confirmation">
              <div class="step step--confirmation">
                <p class="confirmation" tabindex="-1">
                  <nys-icon name="check_circle" size="24"></nys-icon>
                  ${this.confirmationText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('nys-feedback')) {
  customElements.define('nys-feedback', NysFeedback);
}
