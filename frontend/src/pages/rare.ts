import type { Plant } from "../api/plant";

import { renderCard } from "../components/card";
import { t } from "../i18n";

function renderPlants(plants: Plant[]): string {
  if (plants.length === 0) {
    return `
      <div class="empty-state">
        <h2>
          ${t("rare.emptyTitle")}
        </h2>

        <p>
          ${t("rare.emptyDescription")}
        </p>
      </div>
    `;
  };

  return plants.map(renderCard).join("");
};

export function renderRare(plants: Plant[]): string {
  const isEmpty = plants.length === 0;

  return `
    <section class="page-hero container">

      <div class="eyebrow">
        ${t("rare.eyebrow")}
      </div>

      <h1>
        ${t("rare.title")}
      </h1>

      <p>
        ${plants.length}
        ${
          plants.length === 1
            ? t("shop.specimen")
            : t("shop.specimens")
        }
        ${t("rare.description")}
      </p>

    </section>

    <section class="section container${isEmpty ? " empty" : ""}">

      <div class="shop-toolbar">

        <div>
          <span class="result-count">
            ${plants.length}
            ${
              plants.length === 0
                ? t("shop.noResults")
                : plants.length === 1
                  ? t("shop.result")
                  : t("shop.results")
            }
          </span>
        </div>

      </div>

      <div
        class="grid"
        id="rare-grid"
      >
        ${renderPlants(plants)}
      </div>

    </section>
  `;
};