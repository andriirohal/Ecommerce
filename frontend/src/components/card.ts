import type { Plant } from "../api/plant";

import { stockLabel } from "../utils/format";
import { t } from "../utils/i18n";

export function renderCard(plant: Plant): string {
  const stock = stockLabel(plant.stock);

  return `
    <article
      class="card"
      data-plant-id="${plant.id}"
    >
      <a
        href="/plant/${plant.id}"
        aria-label="${plant.name}"
        data-plant-link
      >
        <div class="card-art">
          <img
            class="card-art-image${plant.name === "Alocasia Frydek" ? " card-art-image--alocasia" : ""}"
            src="${plant.imageUrl}"
            alt="${plant.name}"
            width="300"
            height="400"
            loading="lazy"
            decoding="async"
          >
        </div>
      </a>

      <a
        href="/plant/${plant.id}"
        data-plant-link
      >
        <h3>${plant.name}</h3>
      </a>

      <div class="meta">
        <span class="price">
          €${Number(plant.price).toFixed(2)}
        </span>

        <span class="stock ${stock.className}">
          ${t(stock.text)}
        </span>
      </div>
    </article>
  `;
};