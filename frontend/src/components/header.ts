import { getLanguage, type Language, setLanguage, t } from "../utils/i18n";
import { getCart } from "../api/cart";

const LEAF_SVG = `
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 21V10M12 10C12 6 9 3 5 3C5 7 8 10 12 10ZM12 10C12 6 15 3 19 3C19 7 16 10 12 10Z"
      stroke="currentColor"
      stroke-width="1.4"
    />
  </svg>
`;

const CART_COUNT_STORAGE_KEY = "header-cart-count";

let globalCartListenerInitialized = false;
let globalAuthListenerInitialized = false;
let pageChangeListenerInitialized = false;
let headerClickListenerInitialized = false;
let initialCartCountLoaded = false;
let cartCountRequestId = 0;

function getStoredCartCount(): number {
  const storedCount =
    sessionStorage.getItem(
      CART_COUNT_STORAGE_KEY
    );

  if (storedCount === null) {
    return 0;
  };

  const count = Number(storedCount);

  return Number.isFinite(count)
    ? Math.max(0, count)
    : 0;
};

function storeCartCount(count: number): void {
  sessionStorage.setItem(
    CART_COUNT_STORAGE_KEY,
    String(Math.max(0, count))
  );
};

function preloadShopImages(): void {
  const image = new Image();

  image.src = "/images/monstera.webp";
};

export function renderHeader(activePath: string): string {
  const currentLanguage = getLanguage();
  const storedCartCount = getStoredCartCount();

  const navItem = (
    href: string,
    label: string
  ): string => {
    const active =
      activePath === href ||
      activePath.startsWith(`${href}/`);

    return `
      <a
        href="${href}"
        class="${active ? "active" : ""}"
        data-nav-path="${href}"
      >
        ${label}
      </a>
    `;
  };

  return `
    <header class="site-header">

      <a
        href="/"
        class="logo"
      >
        ${LEAF_SVG}

        <span class="logo-text">
          Understory
        </span>
      </a>

      <nav class="site-nav">
        ${navItem(
          "/shop",
          t("header.collection")
        )}

        ${navItem(
          "/rare",
          t("header.rarePlants")
        )}

        ${navItem(
          "/care",
          t("header.journal")
        )}

        ${navItem(
          "/about",
          t("header.about")
        )}
      </nav>

      <div class="header-right">

        <button
          type="button"
          class="icon-btn"
          data-account-open
        >
          ${t("header.account")}
        </button>

        <a
          href="/cart"
          class="icon-btn header-bag"
          id="header-cart-link"
          aria-label="${t("header.bag")}"
        >
          <span class="header-bag-label">
            ${t("header.bag")}
          </span>

          <span
            class="cart-count"
            aria-hidden="true"
          >
            ( ${storedCartCount} )
          </span>
        </a>

        <details class="lang-switcher">

          <summary
            class="lang-trigger"
            aria-label="Change language"
          >
            <svg
              class="lang-globe"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                stroke-width="1.4"
              />

              <path
                d="M3 12H21M12 3C14.5 6 14.5 18 12 21M12 3C9.5 6 9.5 18 12 21"
                stroke="currentColor"
                stroke-width="1.2"
              />
            </svg>

            <span class="lang-code">
              ${currentLanguage.toUpperCase()}
            </span>

            <span class="lang-divider"></span>

            <svg
              class="lang-chevron"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </summary>

          <div class="lang-menu">

            <div class="lang-menu-label">
              ${t("header.shopIn")}
            </div>

            ${renderLanguageOption(
              "en",
              "English",
              "EN",
              "#c0842b",
              currentLanguage
            )}

            ${renderLanguageOption(
              "ua",
              "Українська",
              "UA",
              "#33452f",
              currentLanguage
            )}

            ${renderLanguageOption(
              "pl",
              "Polski",
              "PL",
              "#b0673f",
              currentLanguage
            )}

            ${renderLanguageOption(
              "de",
              "Deutsch",
              "DE",
              "#7c8f62",
              currentLanguage
            )}

          </div>
        </details>

      </div>
    </header>
  `;
};

function renderLanguageOption(
  language: Language,
  name: string,
  code: string,
  color: string,
  currentLanguage: Language
): string {
  return `
    <button
      type="button"
      class="lang-option ${
        currentLanguage === language
          ? "active"
          : ""
      }"
      data-lang="${language}"
    >
      <span
        class="lang-dot"
        style="background:${color}"
      ></span>

      <span class="lang-option-name">
        ${name}
      </span>

      <span class="lang-option-code">
        ${code}
      </span>
    </button>
  `;
};

function setHeaderCartCount(count: number): void {
  const cartCount =
    document.querySelector<HTMLElement>(
      ".cart-count"
    );

  const normalizedCount =
    Math.max(0, count);

  storeCartCount(normalizedCount);

  if (!cartCount) {
    return;
  };

  cartCount.textContent =
    `( ${normalizedCount} )`;
};

async function updateHeaderCartCount(): Promise<void> {
  const requestId = ++cartCountRequestId;

  const cartCount =
    document.querySelector<HTMLElement>(
      ".cart-count"
    );

  if (!cartCount) {
    return;
  };

  try {
    const cart = await getCart();

    if (requestId !== cartCountRequestId) {
      return;
    };

    const items = Array.isArray(
      cart.data?.items
    )
      ? cart.data.items
      : [];

    const count = items.reduce(
      (
        total: number,
        item: { quantity: number; }
      ) =>
        total + Number(item.quantity),
      0
    );

    setHeaderCartCount(count);
  } catch {
    if (requestId !== cartCountRequestId) {
      return;
    };

    setHeaderCartCount(0);
  };
};

function initGlobalCartListener(): void {
  if (globalCartListenerInitialized) {
    return;
  };

  globalCartListenerInitialized = true;

  window.addEventListener(
    "cartchange",
    (event: Event) => {
      cartCountRequestId++;

      const customEvent =
        event as CustomEvent<{
          count?: number;
        }>;

      const count =
        customEvent.detail?.count;

      if (typeof count === "number") {
        setHeaderCartCount(count);
        return;
      };

      void updateHeaderCartCount();
    }
  );
};

function initGlobalAuthListener(): void {
  if (globalAuthListenerInitialized) {
    return;
  };

  globalAuthListenerInitialized = true;

  window.addEventListener(
    "auth-changed",
    () => {
      cartCountRequestId++;

      void updateHeaderCartCount();
    }
  );
};

function updateActiveNavigation(): void {
  const currentPath =
    window.location.pathname;

  const navLinks =
    document.querySelectorAll<HTMLAnchorElement>(
      ".site-nav a[data-nav-path]"
    );

  navLinks.forEach((link) => {
    const path = link.dataset.navPath;

    if (!path) {
      return;
    };

    const active =
      currentPath === path ||
      currentPath.startsWith(`${path}/`);

    link.classList.toggle(
      "active",
      active
    );
  });
};

function initPageChangeListener(): void {
  if (pageChangeListenerInitialized) {
    return;
  };

  pageChangeListenerInitialized = true;

  window.addEventListener(
    "page-changed",
    updateActiveNavigation
  );

  window.addEventListener(
    "popstate",
    updateActiveNavigation
  );
};

function initOutsideClickListener(): void {
  if (headerClickListenerInitialized) {
    return;
  };

  headerClickListenerInitialized = true;

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      };

      const switcher =
        document.querySelector<HTMLDetailsElement>(
          ".lang-switcher"
        );

      if (
        switcher &&
        !switcher.contains(target)
      ) {
        switcher.open = false;
      };
    }
  );
};

function initLanguageOptions(
  root: ParentNode
): void {
  const langSwitcher =
    root.querySelector<HTMLDetailsElement>(
      ".lang-switcher"
    );

  if (!langSwitcher) {
    return;
  };

  const languageOptions =
    langSwitcher.querySelectorAll<HTMLButtonElement>(
      ".lang-option"
    );

  languageOptions.forEach((option) => {
    option.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        const language =
          option.dataset.lang as
            | Language
            | undefined;

        if (!language) {
          return;
        };

        langSwitcher.open = false;

        if (language === getLanguage()) {
          return;
        };

        setLanguage(language);
      }
    );
  });
};

export function initHeader(
  root: ParentNode
): void {
  initGlobalCartListener();
  initGlobalAuthListener();
  initPageChangeListener();
  initOutsideClickListener();

  const accountButton =
    root.querySelector<HTMLButtonElement>(
      "[data-account-open]"
    );

  if (
    accountButton &&
    accountButton.dataset.initialized !== "true"
  ) {
    accountButton.dataset.initialized = "true";

    accountButton.addEventListener(
      "click",
      (event) => {
        event.preventDefault();

        window.dispatchEvent(
          new Event("auth-open")
        );
      }
    );
  };

  const shopLink =
    root.querySelector<HTMLAnchorElement>(
      '.site-nav a[data-nav-path="/shop"]'
    );

  if (shopLink) {
    shopLink.addEventListener(
      "mouseenter",
      preloadShopImages,
      { once: true }
    );
  };

  initLanguageOptions(root);

  if (!initialCartCountLoaded) {
    initialCartCountLoaded = true;

    void updateHeaderCartCount();
  };

  updateActiveNavigation();
};