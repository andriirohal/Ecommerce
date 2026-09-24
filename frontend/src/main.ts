import "./scss/main.scss";

import { getAllPlants, getRarePlants } from "./api/plant";
import { fetchCurrentUser } from "./api/auth";

import { initAccountActions, initAccountPopover, initAccountUI, initAuthForms, refreshAccountSummary, renderAccount, updateAccountUI } from "./pages/auth";
import { renderHeader as renderHeaderComponent, initHeader } from "./components/header";
import { renderPageLoader, renderSplashLoader } from "./components/loader";
import { renderFooter } from "./components/footer";

import { loadCartPage, mountCart } from "./pages/cart";
import { router } from "./router";
import { initLanguage } from "./utils/i18n";

import { renderHome } from "./pages/home";
import { renderNotFound } from "./pages/notFound";
import { mountCheckout } from "./pages/order";
import { renderPlant } from "./pages/plant";
import { renderRare } from "./pages/rare";
import { mountShop, renderShop } from "./pages/shop";
import { hasStaticContent, renderStatic } from "./pages/static";

let appInitialized = false;

type Plants = Awaited<ReturnType<typeof getAllPlants>>;
type RarePlants = Awaited<ReturnType<typeof getRarePlants>>;

let plantsCache: Plants | null = null;
let plantsRequest: Promise<Plants> | null = null;

let rarePlantsCache: RarePlants | null = null;
let rarePlantsRequest: Promise<RarePlants> | null = null;

async function getPlants(): Promise<Plants> {
  if (plantsCache) {
    return plantsCache;
  };

  if (plantsRequest) {
    return plantsRequest;
  };

  plantsRequest = getAllPlants(100, 0)
    .then((plants) => {
      plantsCache = plants;

      return plants;
    })
    .finally(() => {
      plantsRequest = null;
    });

  return plantsRequest;
};

async function getRare(): Promise<RarePlants> {
  if (rarePlantsCache) {
    return rarePlantsCache;
  };

  if (rarePlantsRequest) {
    return rarePlantsRequest;
  };

  rarePlantsRequest = getRarePlants(100, 0)
    .then((plants) => {
      rarePlantsCache = plants;

      return plants;
    })
    .finally(() => {
      rarePlantsRequest = null;
    });

  return rarePlantsRequest;
};

function getCachedPlants(): Plants | null {
  return plantsCache;
};

function getCachedRarePlants(): RarePlants | null {
  return rarePlantsCache;
};

export function clearPlantsCache(): void {
  plantsCache = null;
};

function getApp(): HTMLElement {
  const app = document.getElementById("app");

  if (!app) {
    throw new Error("App root element not found");
  };

  return app;
};

function getPageRoot(): HTMLElement {
  const pageRoot = document.getElementById("page-root");

  if (!pageRoot) {
    throw new Error("Page root element not found");
  };

  return pageRoot;
};

function initializeShell(
  app: HTMLElement,
  path: string,
  content: string
): void {
  app.innerHTML = `
    ${renderHeaderComponent(path)}

    <div id="page-root">
      ${content}
    </div>

    ${renderFooter()}

    ${renderAccount()}
  `;

  initHeader(app);
  initAccountPopover();
  initAccountActions();
  initAuthForms();
  initAccountUI();
  updateAccountUI();

  appInitialized = true;
};

function paint(path: string, content: string): void {
  const app = getApp();

  const pageRoot = app.querySelector<HTMLElement>("#page-root");

  if (!pageRoot) {
    initializeShell(app, path, content);

    return;
  };

  pageRoot.innerHTML = content;

  updateAccountUI();
};

function refreshHeader(): void {
  const app = getApp();

  const oldHeader = app.querySelector<HTMLElement>(".site-header");

  if (!oldHeader) {
    return;
  };

  const oldCartCount = oldHeader.querySelector<HTMLElement>(".cart-count");

  const resolvedCartCount =
    oldCartCount && !oldCartCount.classList.contains("is-loading")
      ? oldCartCount.textContent
      : null;

  const wrapper = document.createElement("div");

  wrapper.innerHTML = renderHeaderComponent(window.location.pathname);

  const header = wrapper.firstElementChild;

  if (!(header instanceof HTMLElement)) {
    return;
  };

  if (resolvedCartCount) {
    const newCartCount = header.querySelector<HTMLElement>(".cart-count");

    if (newCartCount) {
      newCartCount.classList.remove("is-loading");
      newCartCount.textContent = resolvedCartCount;
    };
  };

  oldHeader.replaceWith(header);

  initHeader(app);
};

function refreshAccount(): void {
  const app = getApp();

  const oldOverlay = app.querySelector<HTMLElement>("[data-account-overlay]");

  if (!oldOverlay) {
    return;
  };

  const wasOpen = oldOverlay.classList.contains("active");

  const wrapper = document.createElement("div");

  wrapper.innerHTML = renderAccount();

  const newOverlay = wrapper.firstElementChild;

  if (!(newOverlay instanceof HTMLElement)) {
    return;
  };

  if (wasOpen) {
    newOverlay.classList.add("active");
    newOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("account-open");
  };

  oldOverlay.replaceWith(newOverlay);

  initAccountPopover();
  updateAccountUI();
};

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
};

async function repaintAfterLanguageChange(): Promise<void> {
  if (!appInitialized) {
    return;
  };

  const path = window.location.pathname;

  try {
    const pageRoot = getPageRoot();

    refreshHeader();
    refreshAccount();

    if (path === "/") {
      let plants = getCachedPlants();

      if (!plants) {
        pageRoot.innerHTML = renderPageLoader();
        plants = await getPlants();
      };

      pageRoot.innerHTML = renderHome(plants);

      updateAccountUI();

      return;
    };

    if (path === "/shop") {
      let plants = getCachedPlants();

      if (!plants) {
        pageRoot.innerHTML = renderPageLoader();
        plants = await getPlants();
      };

      pageRoot.innerHTML = renderShop(plants);

      mountShop(pageRoot, plants);

      updateAccountUI();

      return;
    };

    if (path === "/rare") {
      let plants = getCachedRarePlants();

      if (!plants) {
        pageRoot.innerHTML = renderPageLoader();
        plants = await getRare();
      };

      pageRoot.innerHTML = renderRare(plants);

      updateAccountUI();

      return;
    };

    if (path.startsWith("/plant/")) {
      const id = path.split("/")[2];

      if (!id) {
        pageRoot.innerHTML = renderNotFound();

        updateAccountUI();

        return;
      };

      let plants = getCachedPlants();

      if (!plants) {
        pageRoot.innerHTML = renderPageLoader();
        plants = await getPlants();
      };

      pageRoot.innerHTML = await renderPlant(id, plants);

      updateAccountUI();

      return;
    };

    if (path === "/cart") {
      pageRoot.innerHTML = renderPageLoader();
      pageRoot.innerHTML = await loadCartPage();

      mountCart(pageRoot);

      updateAccountUI();

      return;
    };

    if (path === "/checkout") {
      await mountCheckout(pageRoot);

      updateAccountUI();

      return;
    };

    const page = path.slice(1);

    if (hasStaticContent(page)) {
      pageRoot.innerHTML = renderPageLoader();

      await waitForPaint();

      pageRoot.innerHTML = renderStatic(page);
    } else {
      pageRoot.innerHTML = renderNotFound();
    };

    updateAccountUI();
  } catch (error) {
    console.error("Language change failed:", error);
  };
};

router
  .add("/", async () => {
    try {
      const cached = getCachedPlants();

      if (cached) {
        paint("/", renderHome(cached));

        return;
      };

      paint("/", renderPageLoader());

      const plants = await getPlants();

      paint("/", renderHome(plants));
    } catch (error) {
      console.error(error);

      paint("/", renderHome([]));
    };
  })

  .add("/shop", async () => {
    try {
      const cached = getCachedPlants();

      if (cached) {
        paint("/shop", renderShop(cached));
        mountShop(getPageRoot(), cached);

        return;
      };

      paint("/shop", renderPageLoader());

      const plants = await getPlants();

      paint("/shop", renderShop(plants));
      mountShop(getPageRoot(), plants);
    } catch (error) {
      console.error(error);

      paint("/shop", renderShop([]));
    };
  })

  .add("/rare", async () => {
    try {
      const cached = getCachedRarePlants();

      if (cached) {
        paint("/rare", renderRare(cached));

        return;
      };

      paint("/rare", renderPageLoader());

      const plants = await getRare();

      paint("/rare", renderRare(plants));
    } catch (error) {
      console.error(error);

      paint("/rare", renderRare([]));
    };
  })

  .add(
    "/plant/:id",
    async ({
      params
    }: {
      params: {
        id?: string;
      };
    }) => {
      const id = params.id;

      if (!id) {
        paint("/404", renderNotFound());

        return;
      };

      try {
        const cached = getCachedPlants();

        if (!cached) {
          paint(`/plant/${id}`, renderPageLoader());
        };

        const plants = cached ?? (await getPlants());

        const content = await renderPlant(id, plants);

        paint(`/plant/${id}`, content);
      } catch (error) {
        console.error(error);

        paint(`/plant/${id}`, renderNotFound());
      };
    }
  )

  .add("/cart", async () => {
    try {
      paint("/cart", renderPageLoader());

      const content = await loadCartPage();

      paint("/cart", content);

      mountCart(getPageRoot());
    } catch (error) {
      console.error(error);

      paint("/cart", renderNotFound());
    };
  })

  .add("/checkout", async () => {
    try {
      if (!appInitialized) {
        initializeShell(getApp(), "/checkout", "");
      };

      await mountCheckout(getPageRoot());

      updateAccountUI();
    } catch (error) {
      console.error(error);

      if (appInitialized) {
        getPageRoot().innerHTML = renderNotFound();
      } else {
        paint("/checkout", renderNotFound());
      };
    };
  })

  .add("/:page", async ({ params }) => {
    const page = params.page;

    if (!page || !hasStaticContent(page)) {
      paint("/404", renderNotFound());

      return;
    };

    paint(`/${page}`, renderPageLoader());

    await waitForPaint();

    paint(`/${page}`, renderStatic(page));
  })

  .notFound(async () => {
    paint("/404", renderNotFound());
  });

async function initializeApp(): Promise<void> {
  initLanguage();

  window.addEventListener("languagechange", () => {
    void repaintAfterLanguageChange();
  });

  void getPlants().catch(() => {});

  try {
    await fetchCurrentUser();
    await refreshAccountSummary();
  } catch (error) {
    console.error(error);
  };

  router.start();
};

getApp().innerHTML = renderSplashLoader();

void initializeApp();