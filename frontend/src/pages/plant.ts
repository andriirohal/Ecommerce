import { renderCard } from "../components";
import { setButtonLoading, stockLabel } from "../utils";

import { getAccessToken, addToCart, getCart, type Plant } from "../api";
import { t } from "../i18n";

const SELECTORS = {
  quantity: ".qty-value",
  minus: ".qty-minus",
  plus: ".qty-plus",
  add: "#add-to-cart-btn",
  quantityControl: ".qty-control"
} as const;

function hasSession(): boolean {
  return Boolean(getAccessToken());
};

async function getCartQuantity(plantId: string): Promise<number> {
  if (!hasSession()) {
    return 0;
  };

  try {
    const cart = await getCart();

    const items = Array.isArray(cart.data?.items) ? cart.data.items : [];

    const item = items.find(
      (cartItem: { plantId: string; quantity: number; }) =>
        cartItem.plantId === plantId
    );

    return Number(item?.quantity ?? 0);
  } catch (error) {
    console.error("Failed to get cart quantity:", error);

    return 0;
  };
};

async function syncCartQuantity(
  quantityControl: HTMLElement
): Promise<number> {
  const plantId = quantityControl.dataset.id;

  if (!plantId) {
    return 0;
  };

  const cartQuantity = await getCartQuantity(plantId);

  quantityControl.dataset.cartQuantity = String(cartQuantity);

  return cartQuantity;
};

function getCurrentQuantity(quantityControl: HTMLElement): number {
  const quantityElement = quantityControl.querySelector<HTMLElement>(
    SELECTORS.quantity
  );

  const quantity = Number(quantityElement?.textContent);

  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
};

function getAvailableQuantity(quantityControl: HTMLElement): number {
  const stock = Number(quantityControl.dataset.stock) || 0;
  const cartQuantity =
    Number(quantityControl.dataset.cartQuantity) || 0;

  return Math.max(stock - cartQuantity, 0);
};

function updateQuantityButtons(quantityControl: HTMLElement): void {
  const quantityElement = quantityControl.querySelector<HTMLElement>(
    SELECTORS.quantity
  );

  const minusButton = quantityControl.querySelector<HTMLButtonElement>(
    SELECTORS.minus
  );

  const plusButton = quantityControl.querySelector<HTMLButtonElement>(
    SELECTORS.plus
  );

  const addButton = quantityControl
    .closest<HTMLElement>(".purchase-row")
    ?.querySelector<HTMLButtonElement>(SELECTORS.add);

  const availableQuantity = getAvailableQuantity(quantityControl);

  let quantity = getCurrentQuantity(quantityControl);

  if (availableQuantity > 0) {
    quantity = Math.min(
      Math.max(quantity, 1),
      availableQuantity
    );
  } else {
    quantity = 1;
  };

  if (quantityElement) {
    quantityElement.textContent = String(quantity);
  };

  if (minusButton) {
    minusButton.disabled = quantity <= 1;
  };

  if (plusButton) {
    plusButton.disabled =
      availableQuantity <= 1 ||
      quantity >= availableQuantity;
  };

  if (addButton) {
    addButton.disabled = availableQuantity <= 0;
  };
};

function openAccountPopover(): void {
  document
    .querySelector<HTMLButtonElement>("[data-account-open]")
    ?.click();
};

function showCartToast(quantity: number): void {
  document.querySelector(".cart-toast")?.remove();

  const toast = document.createElement("div");

  toast.className = "cart-toast";

  const description =
    quantity === 1
      ? t("plant.addedToBagDescription")
      : t("plant.addedMultipleToBagDescription").replace(
          "{{quantity}}",
          String(quantity)
        );

  toast.innerHTML = `
    <div class="cart-toast-icon">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </div>

    <div class="cart-toast-content">
      <strong>
        ${t("plant.addedToBag")}
      </strong>

      <span>
        ${description}
      </span>
    </div>
  `;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  window.setTimeout(() => {
    toast.classList.remove("show");

    window.setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
};

function changeQuantity(
  direction: 1 | -1,
  quantityControl: HTMLElement
): void {
  const availableQuantity = getAvailableQuantity(quantityControl);

  if (availableQuantity <= 0) {
    return;
  };

  const currentQuantity = getCurrentQuantity(quantityControl);

  const newQuantity = Math.min(
    Math.max(currentQuantity + direction, 1),
    availableQuantity
  );

  const quantityElement = quantityControl.querySelector<HTMLElement>(
    SELECTORS.quantity
  );

  if (quantityElement) {
    quantityElement.textContent = String(newQuantity);
  };

  updateQuantityButtons(quantityControl);
};

async function handleAddToCart(
  button: HTMLButtonElement,
  plantId: string,
  quantityControl: HTMLElement
): Promise<void> {
  if (!hasSession()) {
    openAccountPopover();
    return;
  };

  if (button.dataset.loading === "true") {
    return;
  };

  const stock = Number(quantityControl.dataset.stock) || 0;

  if (stock <= 0) {
    return;
  };

  setButtonLoading(button, true);

  try {
    await syncCartQuantity(quantityControl);

    const quantity = getCurrentQuantity(quantityControl);

    const availableQuantity =
      getAvailableQuantity(quantityControl);

    if (quantity <= 0 || quantity > availableQuantity) {
      updateQuantityButtons(quantityControl);
      return;
    };

    await addToCart(plantId, quantity);

    const currentCartQuantity =
      Number(quantityControl.dataset.cartQuantity) || 0;

    quantityControl.dataset.cartQuantity = String(
      currentCartQuantity + quantity
    );

    const quantityElement = quantityControl.querySelector<HTMLElement>(
      SELECTORS.quantity
    );

    if (quantityElement) {
      quantityElement.textContent = "1";
    };

    updateQuantityButtons(quantityControl);

    window.dispatchEvent(
      new CustomEvent("cart-updated", {
        detail: {
          plantId,
          quantity
        }
      })
    );

    showCartToast(quantity);
  } catch (error) {
    console.error(error);
  } finally {
    setButtonLoading(button, false);

    updateQuantityButtons(quantityControl);
  };
};

export async function renderPlant(
  id: string,
  plants: Plant[]
): Promise<string> {
  const plant = plants.find((item) => item.id === id);

  if (!plant) {
    return `
      <section class="section container">

        <div class="empty-state">

          <h2>
            ${t("plant.notFound")}
          </h2>

          <p>
            ${t("plant.notFoundDescription")}
          </p>

          <a
            class="btn"
            href="/shop"
          >
            ${t("plant.backToShop")}
          </a>

        </div>

      </section>
    `;
  };

  const stock = Number(plant.stock);

  const currentPlantStock = Number.isFinite(stock)
    ? Math.max(stock, 0)
    : 0;

  const currentCartQuantity = await getCartQuantity(plant.id);

  const availableQuantity = Math.max(
    currentPlantStock - currentCartQuantity,
    0
  );

  const stockInfo = stockLabel(currentPlantStock);

  const related = plants
    .filter(
      (item) =>
        item.id !== plant.id &&
        item.family === plant.family
    )
    .slice(0, 3);

  return `
    <div class="container">

      <section class="plant-detail">

        <div class="plant-media">

          <div class="plant-image">

            <img
              src="${plant.imageUrl}"
              alt="${plant.name}"
              width="800"
              height="800"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              class="plant-main-image${plant.name === "Alocasia Frydek" ? " plant-main-image--alocasia" : ""}"
            />

          </div>

        </div>

        <div class="plant-info">

          <div class="eyebrow">
            ${plant.family}
          </div>

          <h1>
            ${plant.name}
          </h1>

          <div class="price-row">

            <span class="price">
              €${Number(plant.price).toFixed(2)}
            </span>

            <span
              class="badge ${stockInfo.className}"
            >
              ${t(stockInfo.text)}
            </span>

          </div>

          <p class="description">
            ${t(plant.description)}
          </p>

          <div class="purchase-row">

            <div
              class="qty-control"
              data-id="${plant.id}"
              data-stock="${currentPlantStock}"
              data-cart-quantity="${currentCartQuantity}"
            >

              <button
                type="button"
                class="qty-btn qty-minus"
                data-qty-minus="${plant.id}"
                aria-label="${t("cart.decreaseQuantity")}"
                disabled
              >
                <span aria-hidden="true">
                  −
                </span>
              </button>

              <span
                class="qty-value"
                data-qty-value="${plant.id}"
                aria-live="polite"
                aria-atomic="true"
              >
                1
              </span>

              <button
                type="button"
                class="qty-btn qty-plus"
                data-qty-plus="${plant.id}"
                aria-label="${t("cart.increaseQuantity")}"
                ${availableQuantity <= 1 ? "disabled" : ""}
              >
                <span aria-hidden="true">
                  +
                </span>
              </button>

            </div>

            <button
              type="button"
              class="btn"
              id="add-to-cart-btn"
              data-id="${plant.id}"
              ${
                currentPlantStock <= 0 ||
                availableQuantity <= 0
                  ? "disabled"
                  : ""
              }
            >
              ${t("plant.addToBag")}
            </button>

          </div>

          <dl class="spec-table">

            <div>

              <dt>
                ${t("plant.family")}
              </dt>

              <dd>
                ${plant.family}
              </dd>

            </div>

            <div>

              <dt>
                ${t("plant.stock")}
              </dt>

              <dd>
                ${currentPlantStock}
              </dd>

            </div>

          </dl>

        </div>

      </section>

      ${
        related.length
          ? `
            <section class="section">

              <div class="section-head">

                <h2>
                  ${t("plant.pairsWellWith")}
                </h2>

                <a href="/shop">
                  ${t("head.view")} →
                </a>

              </div>

              <div class="grid">

                ${related.map(renderCard).join("")}

              </div>

            </section>
          `
          : ""
      }

    </div>
  `;
};

document.addEventListener(
  "click",
  (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    };

    const button = target.closest<HTMLButtonElement>(
      `${SELECTORS.minus}, ${SELECTORS.plus}, ${SELECTORS.add}`
    );

    if (!button) {
      return;
    };

    if (
      button.classList.contains("qty-minus") ||
      button.classList.contains("qty-plus")
    ) {
      const quantityControl = button.closest<HTMLElement>(
        SELECTORS.quantityControl
      );

      if (!quantityControl) {
        return;
      };

      event.preventDefault();
      event.stopPropagation();

      if (button.disabled) {
        return;
      };

      if (button.classList.contains("qty-minus")) {
        changeQuantity(-1, quantityControl);

        return;
      };

      changeQuantity(1, quantityControl);

      return;
    };

    if (button.id === "add-to-cart-btn") {
      const purchaseRow =
        button.closest<HTMLElement>(".purchase-row");

      const quantityControl =
        purchaseRow?.querySelector<HTMLElement>(
          SELECTORS.quantityControl
        );

      if (!quantityControl) {
        return;
      };

      const plantId = quantityControl.dataset.id;

      if (!plantId) {
        return;
      };

      event.preventDefault();
      event.stopPropagation();

      void handleAddToCart(
        button,
        plantId,
        quantityControl
      );
    };
  },
  true
);