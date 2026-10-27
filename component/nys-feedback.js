import {LitElement, css, html, nothing} from 'lit';

/**
 * Asks people to rate an experience they just finished, such as renewing a
 * license, with one positive and one negative answer.
 *
 * Wide containers show the prompt and buttons in one row. Narrow containers
 * stack them in one centered column. The layout follows the component's own
 * width through a container query, not the viewport.
 *
 * After someone answers, the buttons give way to a thank-you message and the
 * component fires `nys-feedback`. Set `submitted` to show the thank-you
 * message without an answer, for example when you already have one for this
 * session.
 *
 * Requires the NYSDS styles and components (`nys-button`, `nys-icon`).
 *
 * @fires nys-feedback - Fired once when someone answers. `detail` holds
 *   `value` (`good` or `needs-improvement`) and `label` (the button text).
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
  };

  static styles = css`
    :host {
      display: block;
      container-type: inline-size;
      color: var(--nys-color-text);
      font-family: var(--nys-font-family-ui);
    }

    :host([hidden]) {
      display: none;
    }

    .frame {
      padding: var(--nys-space-100);
      background-color: var(--nys-color-surface);
      /* No applied NYSDS token is this light, so use the neutral primitive. */
      border: var(--nys-border-width-sm) solid var(--nys-color-neutral-100);
      border-radius: var(--nys-radius-xl);
      box-shadow: var(--nys-shadow-raised);
    }

    .panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--nys-space-250);
      padding: var(--nys-space-300);
      background-color: var(--nys-color-theme-faint);
      border-radius: var(--nys-radius-lg);
      text-align: center;
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

    @container (min-width: 40rem) {
      .panel {
        flex-direction: row;
        justify-content: space-between;
        padding: var(--nys-space-300) var(--nys-space-400);
        text-align: start;
      }

      .panel--submitted {
        justify-content: flex-start;
      }

      .actions {
        flex-shrink: 0;
        justify-content: flex-end;
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
    this._idPrefix = `nys-feedback-${++NysFeedback.#count}`;
  }

  /** Clears the answer and shows the buttons again. */
  reset() {
    this.submitted = false;
    this.value = '';
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
    // The button that had focus is gone, so move focus to the message.
    await this.updateComplete;
    this.renderRoot.querySelector('.confirmation')?.focus();
  }

  render() {
    const headingId = `${this._idPrefix}-heading`;
    const textId = `${this._idPrefix}-text`;

    if (this.submitted) {
      return html`
        <div class="frame">
          <div class="panel panel--submitted">
            <p class="confirmation" tabindex="-1">
              <nys-icon name="check_circle" size="24"></nys-icon>
              ${this.confirmationText}
            </p>
          </div>
        </div>
      `;
    }

    return html`
      <div class="frame">
        <div
          class="panel"
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
    `;
  }
}

if (!customElements.get('nys-feedback')) {
  customElements.define('nys-feedback', NysFeedback);
}
