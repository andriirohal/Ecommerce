import { t } from "../utils/i18n";

const LEAF_SVG = `
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 21V10M12 10C12 6 9 3 5 3C5 7 8 10 12 10ZM12 10C12 6 15 3 19 3C19 7 16 10 12 10Z"
      stroke="#33452F"
      stroke-width="1.4"
    />
  </svg>
`;

export function renderFooter(): string {
  return `
    <footer class="site-footer">
      <div class="foot-brand">
        <div class="logo">
          ${LEAF_SVG}
          Understory
        </div>

        <p>
          ${t("footer.description")}
        </p>
      </div>

      <div>
        <h4>${t("footer.shop.title")}</h4>

        <ul>
          <li>
            <a href="/shop">
              ${t("footer.shop.options.0")}
            </a>
          </li>

          <li>
            <a href="/rare">
              ${t("footer.shop.options.1")}
            </a>
          </li>

          <li>
            <a href="/shop">
              ${t("footer.shop.options.2")}
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h4>${t("footer.care.title")}</h4>

        <ul>
          <li>
            <a href="/care">
              ${t("footer.care.options.0")}
            </a>
          </li>

          <li>
            <a href="/guarantee">
              ${t("footer.care.options.1")}
            </a>
          </li>

          <li>
            <a href="/shipping">
              ${t("footer.care.options.2")}
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h4>${t("footer.studio.title")}</h4>

        <ul>
          <li>
            <a href="/about">
              ${t("footer.studio.options.0")}
            </a>
          </li>

          <li>
            <a href="/about">
              ${t("footer.studio.options.1")}
            </a>
          </li>

          <li>
            <a href="/faq">
              ${t("footer.studio.options.2")}
            </a>
          </li>
        </ul>
      </div>
    </footer>

    <div class="foot-bottom">
      <span>${t("footer.year")}</span>
      <span>${t("footer.location")}</span>
    </div>
  `;
};

function refreshFooter(): void {
  const app = document.getElementById("app");

  if (!app) {
    return;
  };

  const footer = app.querySelector<HTMLElement>(
    ".site-footer"
  );

  const bottom = app.querySelector<HTMLElement>(
    ".foot-bottom"
  );

  if (!footer || !bottom) {
    return;
  };

  const temp = document.createElement("div");

  temp.innerHTML = renderFooter();

  const newFooter = temp.querySelector<HTMLElement>(
    ".site-footer"
  );

  const newBottom = temp.querySelector<HTMLElement>(
    ".foot-bottom"
  );

  if (!newFooter || !newBottom) {
    return;
  };

  footer.replaceWith(newFooter);
  bottom.replaceWith(newBottom);
};

window.addEventListener(
  "languagechange",
  refreshFooter
);