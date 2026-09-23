import type { Plant, PlantFamily, PlantSort } from "../api/plant";

import { onClickOutside } from "../utils/clickOutside";
import { renderCard } from "../components/card";

import { t } from "../utils/i18n";

type ShopState = {
  sort?: PlantSort;
  family?: PlantFamily;
};

const FAMILIES: {
  key: "all" | PlantFamily;
  label: string;
}[] = [
  {
    key: "all",
    label: "shop.filters.all"
  },
  {
    key: "Araceae",
    label: "Araceae"
  },
  {
    key: "Moraceae",
    label: "Moraceae"
  }
];

const SORT_LABELS: Record<PlantSort, string> = {
  alphabetical: "shop.sort.name",
  cheapest: "shop.sort.priceAsc",
  expensive: "shop.sort.priceDesc"
};

let shopState: ShopState = {};
let currentPlants: Plant[] = [];
let basePlants: Plant[] = [];

export function renderPlants(plants: Plant[]): string {
  if (plants.length === 0) {
    return `
      <div class="empty-state">
        <h2>
          ${t("shop.emptyTitle")}
        </h2>

        <p>
          ${t("shop.emptyDescription")}
        </p>
      </div>
    `;
  };

  return plants.map((plant) => renderCard(plant)).join("");
};

function updateGrid(root: HTMLElement, plants: Plant[]): void {
  const grid = root.querySelector<HTMLElement>("#shop-grid");
  const section = root.querySelector<HTMLElement>("#shop-section");

  if (!grid || !section) {
    return;
  };

  section.classList.toggle("empty", plants.length === 0);

  grid.innerHTML = renderPlants(plants);
};

function applyFamily(
  plants: Plant[],
  family?: PlantFamily
): Plant[] {
  if (!family) {
    return plants;
  };

  return plants.filter((plant) => plant.family === family);
};

function applySort(
  plants: Plant[],
  sort?: PlantSort
): Plant[] {
  if (!sort) {
    return plants;
  };

  const sorted = [...plants];

  if (sort === "alphabetical") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "cheapest") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sort === "expensive") {
    sorted.sort((a, b) => b.price - a.price);
  };

  return sorted;
};

function applyShopState(state: ShopState): Plant[] {
  return applySort(
    applyFamily(basePlants, state.family),
    state.sort
  );
};

function updateFilterButtons(root: HTMLElement): void {
  const buttons = root.querySelectorAll<HTMLButtonElement>(
    "[data-family]"
  );

  buttons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.family === (shopState.family ?? "all")
    );
  });
};

function updateSortMenu(root: HTMLElement): void {
  const trigger = root.querySelector<HTMLButtonElement>(
    ".sort-trigger"
  );

  const menu = root.querySelector<HTMLElement>(".sort-menu");

  if (!trigger || !menu) {
    return;
  };

  const selectedSort = shopState.sort;

  const label = trigger.querySelector("span");

  if (label) {
    label.textContent = selectedSort
      ? t(SORT_LABELS[selectedSort])
      : t("shop.sort.featured");
  };

  const buttons = menu.querySelectorAll<HTMLButtonElement>(
    "[data-sort]"
  );

  buttons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.sort === (selectedSort ?? "")
    );
  });
};

function closeSortMenu(root: HTMLElement): void {
  const trigger = root.querySelector<HTMLButtonElement>(
    ".sort-trigger"
  );

  const sort = root.querySelector<HTMLElement>(".sort");

  if (!trigger || !sort) {
    return;
  };

  trigger.setAttribute("aria-expanded", "false");
  sort.classList.remove("active");
};

function initSort(root: HTMLElement): void {
  const trigger = root.querySelector<HTMLButtonElement>(
    ".sort-trigger"
  );

  const menu = root.querySelector<HTMLElement>(".sort-menu");

  const sort = root.querySelector<HTMLElement>(".sort");

  if (!trigger || !menu || !sort) {
    return;
  };

  trigger.addEventListener("click", () => {
    const isOpen = sort.classList.contains("active");

    sort.classList.toggle("active", !isOpen);

    trigger.setAttribute(
      "aria-expanded",
      String(!isOpen)
    );
  });

  menu.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    };

    const button = target.closest<HTMLButtonElement>(
      "[data-sort]"
    );

    if (!button) {
      return;
    };

    const value = button.dataset.sort;

    shopState.sort =
      value === "alphabetical" ||
      value === "cheapest" ||
      value === "expensive"
        ? value
        : undefined;

    currentPlants = applyShopState(shopState);

    updateGrid(root, currentPlants);
    updateSortMenu(root);
    closeSortMenu(root);
  });

  onClickOutside(sort, () => {
    closeSortMenu(root);
  });
};

function initFamily(root: HTMLElement): void {
  const filterChips = root.querySelector<HTMLElement>(
    "#filter-chips"
  );

  if (!filterChips) {
    return;
  };

  filterChips.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    };

    const button = target.closest<HTMLButtonElement>(
      "[data-family]"
    );

    if (!button) {
      return;
    };

    const family = button.dataset.family;

    shopState.family =
      family === "Araceae" || family === "Moraceae"
        ? family
        : undefined;

    currentPlants = applyShopState(shopState);

    updateGrid(root, currentPlants);
    updateFilterButtons(root);
  });
};

export function renderShop(
  plants: Plant[],
  currentSort?: PlantSort,
  currentFamily?: PlantFamily
): string {
  shopState = {
    sort: currentSort,
    family: currentFamily
  };

  return `
    <section class="page-hero container">
      <div class="page-hero-content">
        <span class="eyebrow">
          ${t("shop.eyebrow")}
        </span>

        <h1>
          ${t("shop.title")}
        </h1>

        <p>
          ${t("shop.description")}
        </p>
      </div>
    </section>

    <section
      class="section container${plants.length === 0 ? " empty" : ""}"
      id="shop-section"
    >
      <div class="shop-toolbar">

        <div
          class="filter-chips"
          id="filter-chips"
          role="group"
          aria-label="${t("shop.filters.label")}"
        >
          ${FAMILIES.map(
            (family) => `
              <button
                type="button"
                data-family="${family.key}"
                class="${
                  family.key === (currentFamily ?? "all")
                    ? "active"
                    : ""
                }"
              >
                ${
                  family.key === "Araceae" ||
                  family.key === "Moraceae"
                    ? family.label
                    : t(family.label)
                }
              </button>
            `
          ).join("")}
        </div>

        <div class="shop-controls">
          <div class="sort">

            <button
              class="sort-trigger"
              type="button"
              aria-expanded="false"
              aria-haspopup="true"
            >
              <span>
                ${
                  currentSort
                    ? t(SORT_LABELS[currentSort])
                    : t("shop.sort.featured")
                }
              </span>
            </button>

            <div
              class="sort-menu"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                data-sort=""
                class="${!currentSort ? "active" : ""}"
              >
                ${t("shop.sort.featured")}
              </button>

              ${Object.entries(SORT_LABELS)
                .map(
                  ([key, label]) => `
                    <button
                      type="button"
                      role="menuitem"
                      data-sort="${key}"
                      class="${
                        key === currentSort ? "active" : ""
                      }"
                    >
                      ${t(label)}
                    </button>
                  `
                )
                .join("")}
            </div>

          </div>
        </div>

      </div>

      <div
        class="grid"
        id="shop-grid"
      >
        ${renderPlants(plants)}
      </div>
    </section>
  `;
};

export function mountShop(
  root: HTMLElement,
  plants: Plant[]
): void {
  if (root.dataset.shopInitialized === "true") {
    return;
  };

  root.dataset.shopInitialized = "true";

  basePlants = plants;

  initSort(root);
  initFamily(root);

  currentPlants = applyShopState(shopState);

  updateGrid(root, currentPlants);
  updateFilterButtons(root);
  updateSortMenu(root);
};