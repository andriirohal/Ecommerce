import { getCart, addOrder } from "../api";

import { renderPageLoader } from "../components";
import { t } from "../i18n";
import { clearPlantsCache } from "../main";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST, TAX_RATE } from "../utils";

let orderRequestPending = false;

type CheckoutLine = {
  plantId: string;
  quantity: number;
  name: string;
  price: number;
};

type CheckoutTotals = {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

function calculateCheckoutTotals(
  lines: CheckoutLine[],
): CheckoutTotals {
  const subtotal = lines.reduce(
    (sum, line) => sum + Number(line.price) * Number(line.quantity),
    0,
  );

  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + shipping + tax;

  return {
    subtotal,
    shipping,
    tax,
    total,
  };
}

function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`;
}

function renderCheckoutItem(line: CheckoutLine): string {
  const price = Number(line.price) * Number(line.quantity);

  return `
    <div
      class="checkout_item"
      data-plant-id="${line.plantId}"
    >
      <div class="checkout_item_info">
        <h3>
          ${line.name}
        </h3>

        <span>
          ${t("checkout.quantity")}: ${line.quantity}
        </span>
      </div>

      <strong>
        ${formatPrice(price)}
      </strong>
    </div>
  `;
}

function renderCheckoutContent(lines: CheckoutLine[]): string {
  const { subtotal, shipping, tax, total } =
    calculateCheckoutTotals(lines);

  return `
    <div
      class="checkout_summary"
      id="checkout_content"
    >
      <div class="checkout_summary_header">
        <span class="eyebrow">
          ${t("checkout.orderSummary")}
        </span>
      </div>

      <div class="checkout_items">
        ${lines.map(renderCheckoutItem).join("")}
      </div>

      <div class="checkout_totals">
        <div class="summary_block_line">

          <div class="summary_line">
            <span>
              ${t("cart.subtotal")}
            </span>

            <span data-cart-subtotal>
              €${subtotal.toFixed(2)}
            </span>
          </div>

          <div class="summary_line">
            <span>
              ${t("cart.shipping")}
            </span>

            <span data-cart-shipping>
              ${
                shipping === 0
                  ? t("cart.free")
                  : `€${shipping.toFixed(2)}`
              }
            </span>
          </div>

          <div class="summary_line">
            <span>
              ${t("cart.estimatedTax")}
            </span>

            <span data-cart-tax>
              €${tax.toFixed(2)}
            </span>
          </div>

        </div>
      </div>

      <div class="summary_total">
        <span>
          ${t("cart.total")}
        </span>

        <strong>
          ${formatPrice(total)}
        </strong>
      </div>

      <div
        id="checkout_error"
        class="checkout_error"
        hidden
      ></div>

      <button
        type="button"
        class="btn block"
        id="place_order"
      >
        <span class="place_order_text">
          ${t("checkout.placeOrder")}
        </span>

        <span
          class="place_order_spinner"
          aria-hidden="true"
        ></span>
      </button>
    </div>
  `;
}

function renderCheckoutPage(content: string): string {
  return `
    <section class="page_hero container">
      <div class="eyebrow">
        ${t("checkout.title")}
      </div>

      <h1>
        ${t("checkout.completeOrder")}
      </h1>
    </section>

    <section
      class="section container"
      id="checkout_section"
    >
      ${content}
    </section>
  `;
}

function renderEmptyCheckout(): string {
  return `
    <div class="empty_state">
      <svg
        class="empty_icon"
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
        ${t("cart.emptyTitle")}
      </h2>

      <p>
        ${t("cart.emptyDescription")}
      </p>

      <a
        class="btn"
        href="/shop"
      >
        ${t("cart.shopCollection")}
      </a>
    </div>
  `;
}

function renderSuccessContent(): string {
  return `
    <div class="empty_state checkout_success">

      <div class="checkout_success_icon">
        ✓
      </div>

      <div class="eyebrow">
        ${t("checkout.orderSuccess")}
      </div>

      <h2>
        ${t("checkout.orderSuccess")}
      </h2>

      <p>
        ${t("checkout.orderSuccessDescription")}
      </p>

      <a
        class="btn"
        href="/shop"
      >
        ${t("cart.shopCollection")}
      </a>

    </div>
  `;
}

function renderCheckoutError(): string {
  return `
    <div class="empty_state">
      <h2>
        ${t("cart.loadError")}
      </h2>

      <p>
        ${t("cart.tryAgain")}
      </p>
    </div>
  `;
}

function getCheckoutItems(cart: any): CheckoutLine[] {
  if (!Array.isArray(cart.data?.items)) {
    return [];
  }

  return cart.data.items.map((item: any) => ({
    plantId: item.plantId,
    quantity: Number(item.quantity),
    name: item.name,
    price: Number(item.price),
  }));
}

async function handlePlaceOrder(
  root: HTMLElement,
  button: HTMLButtonElement,
): Promise<void> {
  if (orderRequestPending) {
    return;
  }

  const error =
    root.querySelector<HTMLElement>("#checkout_error");

  if (error) {
    error.hidden = true;
    error.textContent = "";
  }

  orderRequestPending = true;

  button.disabled = true;
  button.setAttribute("aria-disabled", "true");
  button.classList.add("loading");

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

  try {
    await addOrder();

    clearPlantsCache();

    window.dispatchEvent(new Event("orderchanged"));

    const cartCount =
      document.querySelector<HTMLElement>(".cart_count");

    if (cartCount) {
      cartCount.classList.remove("is_loading");
      cartCount.textContent = "( 0 )";
    }

    const checkoutSection =
      root.querySelector<HTMLElement>("#checkout_section");

    if (checkoutSection) {
      checkoutSection.innerHTML =
        renderSuccessContent();
    }
  } catch (requestError) {
    console.error(
      "Failed to create order:",
      requestError,
    );

    if (error) {
      error.textContent = t("checkout.orderError");
      error.hidden = false;
    }

    button.disabled = false;
    button.removeAttribute("aria-disabled");
    button.classList.remove("loading");
  } finally {
    orderRequestPending = false;
  }
}

export async function mountCheckout(
  root: HTMLElement,
): Promise<void> {
  orderRequestPending = false;

  window.scrollTo(0, 0);

  root.innerHTML = renderCheckoutPage(
    renderPageLoader(),
  );

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

  try {
    const cart = await getCart();
    const items = getCheckoutItems(cart);

    const checkoutSection =
      root.querySelector<HTMLElement>("#checkout_section");

    if (!checkoutSection) {
      return;
    }

    checkoutSection.innerHTML =
      items.length === 0
        ? renderEmptyCheckout()
        : renderCheckoutContent(items);

    if (items.length === 0) {
      return;
    }

    const button =
      checkoutSection.querySelector<HTMLButtonElement>(
        "#place_order",
      );

    if (!button) {
      return;
    }

    button.disabled = false;

    button.addEventListener("click", () => {
      void handlePlaceOrder(root, button);
    });
  } catch (error) {
    console.error(
      "Failed to load checkout:",
      error,
    );

    const checkoutSection =
      root.querySelector<HTMLElement>("#checkout_section");

    if (checkoutSection) {
      checkoutSection.innerHTML =
        renderCheckoutError();
    };
  };
}
