import { t } from "../i18n";

type CartLine = {
  plantId: string;
  quantity: number;
  plant: {
    name: string;
    price: number;
    imageUrl: string;
  };
};

type Cart = {
  items: CartLine[];
  totalPrice: number;
};

function renderMiniCart(items: CartLine[]): string {
  return items
    .map(
      (item) => `
        <div class="mini-cart-row">
          <div class="row-art">
            <img
              src="${item.plant.imageUrl}"
              alt="${item.plant.name}"
            />

            <span class="qty-pill">
              ${item.quantity}
            </span>
          </div>

          <span class="row-name">
            ${item.plant.name}
          </span>

          <span class="row-price">
            €${(item.plant.price * item.quantity).toFixed(2)}
          </span>
        </div>
      `
    )
    .join("");
};

export function renderCheckout(cart: Cart): string {
  const { items, totalPrice } = cart;

  if (items.length === 0) {
    return `
      <section class="section container">
        <div class="empty-state">

          <svg
            class="empty-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 4h2l1.6 10.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle
              cx="9"
              cy="20"
              r="1.4"
              stroke="currentColor"
              stroke-width="1.4"
            />
            <circle
              cx="17"
              cy="20"
              r="1.4"
              stroke="currentColor"
              stroke-width="1.4"
            />
          </svg>

          <h2>
            ${t("checkout.emptyTitle")}
          </h2>

          <p>
            ${t("checkout.emptyDescription")}
          </p>

          <a
            class="btn"
            href="/shop"
          >
            ${t("cart.shopCollection")}
          </a>

        </div>
      </section>
    `;
  };

  return `
    <section class="page-hero container">
      <div class="eyebrow">
        ${t("checkout.title")}
      </div>

      <h1>
        ${t("checkout.completeOrder")}
      </h1>
    </section>

    <section class="section container">

      <div class="stepper">
        <span class="step done">
          ${t("checkout.steps.bag")}
        </span>

        <span class="sep">
          —
        </span>

        <span class="step active">
          ${t("checkout.steps.shippingPayment")}
        </span>

        <span class="sep">
          —
        </span>

        <span class="step">
          ${t("checkout.steps.confirmation")}
        </span>
      </div>

      <div class="checkout-layout">

        <form
          class="checkout-form"
          id="checkout-form"
          novalidate
        >

          <div id="checkout-error-slot"></div>

          <fieldset>
            <legend>
              ${t("checkout.contact")}
            </legend>

            <div class="field">
              <label for="email">
                ${t("checkout.email")}
              </label>

              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
              />

              <span
                class="error-text"
                data-error-for="email"
                hidden
              ></span>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              ${t("checkout.shippingAddress")}
            </legend>

            <div class="field-row">

              <div class="field">
                <label for="firstName">
                  ${t("checkout.firstName")}
                </label>

                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                />

                <span
                  class="error-text"
                  data-error-for="firstName"
                  hidden
                ></span>
              </div>

              <div class="field">
                <label for="lastName">
                  ${t("checkout.lastName")}
                </label>

                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                />

                <span
                  class="error-text"
                  data-error-for="lastName"
                  hidden
                ></span>
              </div>

            </div>

            <div class="field">
              <label for="address">
                ${t("checkout.streetAddress")}
              </label>

              <input
                type="text"
                id="address"
                name="address"
                placeholder="123 Fern Street"
                required
              />

              <span
                class="error-text"
                data-error-for="address"
                hidden
              ></span>
            </div>

            <div class="field-row">

              <div class="field">
                <label for="city">
                  ${t("checkout.city")}
                </label>

                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                />

                <span
                  class="error-text"
                  data-error-for="city"
                  hidden
                ></span>
              </div>

              <div class="field">
                <label for="zip">
                  ${t("checkout.postalCode")}
                </label>

                <input
                  type="text"
                  id="zip"
                  name="zip"
                  required
                />

                <span
                  class="error-text"
                  data-error-for="zip"
                  hidden
                ></span>
              </div>

            </div>
          </fieldset>

          <fieldset>
            <legend>
              ${t("checkout.payment")}
            </legend>

            <p class="payment-note">
              ${t("checkout.paymentNote")}
            </p>

            <div class="field">
              <label for="cardNumber">
                ${t("checkout.cardNumber")}
              </label>

              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                inputmode="numeric"
                placeholder="4242 4242 4242 4242"
                required
              />

              <span
                class="error-text"
                data-error-for="cardNumber"
                hidden
              ></span>
            </div>

            <div class="field-row">

              <div class="field">
                <label for="expiry">
                  ${t("checkout.expiry")}
                </label>

                <input
                  type="text"
                  id="expiry"
                  name="expiry"
                  placeholder="MM/YY"
                  required
                />

                <span
                  class="error-text"
                  data-error-for="expiry"
                  hidden
                ></span>
              </div>

              <div class="field">
                <label for="cvc">
                  ${t("checkout.cvc")}
                </label>

                <input
                  type="text"
                  id="cvc"
                  name="cvc"
                  inputmode="numeric"
                  placeholder="123"
                  required
                />

                <span
                  class="error-text"
                  data-error-for="cvc"
                  hidden
                ></span>
              </div>

            </div>
          </fieldset>

          <button
            type="submit"
            class="btn block"
            id="place-order-btn"
          >
            ${t("checkout.placeOrder")}
            — €${Number(totalPrice).toFixed(2)}
          </button>

        </form>

        <aside class="summary-panel">

          <h2>
            ${t("cart.orderSummary")}
          </h2>

          <div class="mini-cart-list">
            ${renderMiniCart(items)}
          </div>

          <div class="summary-total">
            <span>
              ${t("cart.total")}
            </span>

            <span>
              €${Number(totalPrice).toFixed(2)}
            </span>
          </div>

        </aside>

      </div>
    </section>
  `;
};