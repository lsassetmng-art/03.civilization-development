(function (global) {
  "use strict";

  function createShell(options) {
    var opts = options || {};
    var rt = global.CommonOSRuntime;
    var sidebar = rt.el("aside", { className: "cos-shell__sidebar" }, [
      rt.el("div", { className: "cos-shell__brand" }, [
        rt.el("div", { className: "cos-shell__title", textContent: opts.title || "CommonOS Shell" }),
        rt.el("div", { className: "cos-shell__subtitle", textContent: opts.subtitle || "Shared shell foundation" })
      ]),
      rt.el("nav", { className: "cos-shell__nav", "aria-label": "Primary" }, (opts.navItems || []).map(function (item) {
        return rt.el("a", {
          href: item.href || "#",
          "aria-current": item.current ? "page" : null,
          textContent: item.label || "Navigation"
        });
      }))
    ]);

    var hero = rt.el("section", { className: "cos-shell__hero" }, [
      rt.el("h1", { className: "cos-shell__hero-title", textContent: opts.heroTitle || "CommonOS provider playground" }),
      rt.el("p", { className: "cos-shell__hero-copy", textContent: opts.heroCopy || "Reusable shell, components, and sync presentation." })
    ]);

    var sections = (opts.sections || []).map(function (section) {
      return rt.el("section", { className: "cos-shell__section" }, [
        rt.el("div", { className: "cos-shell__section-title", textContent: section.title || "Section" }),
        section.body
      ]);
    });

    return rt.el("div", { className: "cos-shell" }, [
      sidebar,
      rt.el("main", { className: "cos-shell__main" }, [hero].concat(sections))
    ]);
  }

  global.CommonOSShell = {
    createShell: createShell
  };
})(window);
