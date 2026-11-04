/**
 * Define a custom element once Home Assistant's frontend has booted.
 *
 * The integration serves this bundle as an extra module that loads in parallel
 * with HA's app bundle, which swaps `window.customElements` for a scoped
 * registry polyfill. Elements defined before that swap are invisible to
 * Lovelace, so wait until HA's own root element is defined.
 */
export function defineElement(name: string, ctor: CustomElementConstructor): void {
  const define = () => {
    if (!customElements.get(name)) customElements.define(name, ctor);
  };
  if (customElements.get("home-assistant") || !document.querySelector("home-assistant")) {
    define();
  } else {
    customElements.whenDefined("home-assistant").then(define);
  }
}
