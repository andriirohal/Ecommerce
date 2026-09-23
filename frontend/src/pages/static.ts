import { renderLogin, renderSignup } from "./auth";
import { getLanguage, getTranslationArray, t } from "../i18n";

interface StaticContent {
  eyebrow: string;
  title: string;
  intro: string;
  body: string;
};

const Content: Record<string, StaticContent> = {
  care: {
    eyebrow: "static.care.eyebrow",
    title: "static.care.title",
    intro: "static.care.intro",
    body: "static.care.body"
  },

  about: {
    eyebrow: "static.about.eyebrow",
    title: "static.about.title",
    intro: "static.about.intro",
    body: "static.about.body"
  },

  guarantee: {
    eyebrow: "static.guarantee.eyebrow",
    title: "static.guarantee.title",
    intro: "static.guarantee.intro",
    body: "static.guarantee.body"
  },

  shipping: {
    eyebrow: "static.shipping.eyebrow",
    title: "static.shipping.title",
    intro: "static.shipping.intro",
    body: "static.shipping.body"
  },

  faq: {
    eyebrow: "static.faq.eyebrow",
    title: "static.faq.title",
    intro: "static.faq.intro",
    body: "static.faq.body"
  }
};

export function renderStatic(key: string): string {
  if (key === "login") {
    return renderLogin();
  };

  if (key === "signup") {
    return renderSignup();
  };

  const content = Content[key];

  if (!content) {
    return "";
  };

  const body = getTranslationArray(
    getLanguage(),
    content.body
  );

  return `
    <main class="static-page">

      <section class="static-hero container">

        <div class="static-hero-content">

          <div class="eyebrow">
            ${t(content.eyebrow)}
          </div>

          <h1>
            ${t(content.title)}
          </h1>

          <p class="static-hero-intro">
            ${t(content.intro)}
          </p>

        </div>

      </section>

      <section class="static-content container">

        <div class="static-content-inner">

          ${body
            .map(
              (paragraph, index) => `
                <div class="static-paragraph">

                  <span class="static-paragraph-number">
                    ${String(index + 1).padStart(2, "0")}
                  </span>

                  <p>
                    ${paragraph}
                  </p>

                </div>
              `
            )
            .join("")}

        </div>

      </section>

    </main>
  `;
};

export function hasStaticContent(key: string): boolean {
  return key in Content || key === "login" || key === "signup";
};