(function (global) {
  "use strict";

  function isNode(value) {
    return value instanceof Node;
  }

  function toNode(value) {
    if (value === null || value === undefined || value === false) {
      return document.createTextNode("");
    }
    if (isNode(value)) {
      return value;
    }
    return document.createTextNode(String(value));
  }

  function appendChildren(target, children) {
    [].concat(children || []).forEach(function (child) {
      target.appendChild(toNode(child));
    });
  }

  function setAttrs(node, attrs) {
    Object.keys(attrs || {}).forEach(function (key) {
      var value = attrs[key];
      if (value === null || value === undefined || value === false) {
        return;
      }
      if (key === "className") {
        node.className = value;
        return;
      }
      if (key === "dataset") {
        Object.keys(value).forEach(function (datasetKey) {
          node.dataset[datasetKey] = value[datasetKey];
        });
        return;
      }
      if (key === "onClick") {
        node.addEventListener("click", value);
        return;
      }
      if (key === "onChange") {
        node.addEventListener("change", value);
        return;
      }
      if (key === "checked") {
        node.checked = Boolean(value);
        return;
      }
      if (key === "value") {
        node.value = value;
        return;
      }
      if (key === "htmlFor") {
        node.htmlFor = value;
        return;
      }
      if (key === "textContent") {
        node.textContent = value;
        return;
      }
      node.setAttribute(key, value);
    });
  }

  function el(tagName, attrs, children) {
    var node = document.createElement(tagName);
    setAttrs(node, attrs || {});
    appendChildren(node, children || []);
    return node;
  }

  function stack(children, extraClassName) {
    return el("div", { className: ["cos-stack", extraClassName || ""].join(" ").trim() }, children);
  }

  function inline(children, extraClassName) {
    return el("div", { className: ["cos-inline", extraClassName || ""].join(" ").trim() }, children);
  }

  function fieldWrapper(labelText, inputNode, helpText, id) {
    var children = [];
    if (labelText) {
      children.push(el("label", { className: "cos-field__label", htmlFor: id, textContent: labelText }));
    }
    children.push(inputNode);
    if (helpText) {
      children.push(el("div", { className: "cos-field__help", textContent: helpText }));
    }
    return el("div", { className: "cos-field" }, children);
  }

  function button(options) {
    var opts = options || {};
    return el(
      "button",
      {
        type: opts.type || "button",
        className: "cos-button cos-button--" + (opts.kind || "primary"),
        "aria-label": opts.ariaLabel || opts.label || "button",
        disabled: opts.disabled || false,
        onClick: opts.onClick || null
      },
      [opts.icon ? el("span", { "aria-hidden": "true", textContent: opts.icon }) : "", opts.label || "Button"]
    );
  }

  function iconButton(options) {
    var opts = options || {};
    return el(
      "button",
      {
        type: opts.type || "button",
        className: "cos-button cos-button--" + (opts.kind || "ghost") + " cos-icon-button",
        "aria-label": opts.ariaLabel || opts.label || "icon button",
        onClick: opts.onClick || null
      },
      [opts.icon || "★", opts.showLabel ? el("span", { textContent: opts.label || "Action" }) : ""]
    );
  }

  function textField(options) {
    var opts = options || {};
    var id = opts.id || ("field-" + Math.random().toString(36).slice(2));
    var inputNode = el("input", {
      id: id,
      className: "cos-input",
      type: opts.type || "text",
      placeholder: opts.placeholder || "",
      value: opts.value || "",
      "aria-describedby": opts.helpText ? id + "-help" : null
    });
    if (opts.helpText) {
      inputNode.setAttribute("aria-describedby", id + "-help");
    }
    var wrapped = fieldWrapper(opts.label || "TextField", inputNode, opts.helpText || "", id);
    if (opts.helpText) {
      wrapped.querySelector(".cos-field__help").id = id + "-help";
    }
    return wrapped;
  }

  function textArea(options) {
    var opts = options || {};
    var id = opts.id || ("textarea-" + Math.random().toString(36).slice(2));
    var textareaNode = el("textarea", {
      id: id,
      className: "cos-textarea",
      placeholder: opts.placeholder || "",
      "aria-describedby": opts.helpText ? id + "-help" : null
    }, [opts.value || ""]);
    var wrapped = fieldWrapper(opts.label || "TextArea", textareaNode, opts.helpText || "", id);
    if (opts.helpText) {
      wrapped.querySelector(".cos-field__help").id = id + "-help";
    }
    return wrapped;
  }

  function selectField(options) {
    var opts = options || {};
    var id = opts.id || ("select-" + Math.random().toString(36).slice(2));
    var selectNode = el("select", { id: id, className: "cos-select" }, []);
    (opts.options || []).forEach(function (item) {
      var optionNode = el("option", { value: item.value }, [item.label]);
      if (item.selected) {
        optionNode.selected = true;
      }
      selectNode.appendChild(optionNode);
    });
    return fieldWrapper(opts.label || "Select", selectNode, opts.helpText || "", id);
  }

  function checkboxField(options) {
    var opts = options || {};
    var id = opts.id || ("checkbox-" + Math.random().toString(36).slice(2));
    var inputNode = el("input", { id: id, type: "checkbox", checked: opts.checked || false });
    return el("label", { className: "cos-checkbox", htmlFor: id }, [inputNode, opts.label || "Checkbox"]);
  }

  function radioGroup(options) {
    var opts = options || {};
    var group = el("div", { className: "cos-field" }, [
      el("div", { className: "cos-field__label", textContent: opts.label || "Radio" })
    ]);
    (opts.options || []).forEach(function (item, index) {
      var id = (opts.name || "radio-group") + "-" + index;
      var inputNode = el("input", {
        id: id,
        type: "radio",
        name: opts.name || "radio-group",
        checked: item.checked || false
      });
      group.appendChild(el("label", { className: "cos-radio", htmlFor: id }, [inputNode, item.label]));
    });
    return group;
  }

  function switchField(options) {
    var opts = options || {};
    var id = opts.id || ("switch-" + Math.random().toString(36).slice(2));
    var inputNode = el("input", { id: id, type: "checkbox", role: "switch", checked: opts.checked || false });
    return el("label", { className: "cos-switch", htmlFor: id }, [inputNode, opts.label || "Switch"]);
  }

  function statusChip(options) {
    var opts = options || {};
    return el(
      "span",
      {
        className: "cos-status-chip",
        dataset: { kind: opts.kind || "info" }
      },
      [opts.dot || "●", " ", opts.label || "Status"]
    );
  }

  function card(options) {
    var opts = options || {};
    return el("section", { className: "cos-card" }, [
      el("div", { className: "cos-card__header" }, [
        el("div", { className: "cos-card__title", textContent: opts.title || "Card" }),
        opts.subtitle ? el("div", { className: "cos-card__subtitle", textContent: opts.subtitle }) : ""
      ]),
      opts.body || stack([el("div", { textContent: "Card body" })])
    ]);
  }

  function list(options) {
    var opts = options || {};
    var listNode = el("ul", { className: "cos-list" }, []);
    (opts.items || []).forEach(function (item) {
      listNode.appendChild(el("li", { className: "cos-list__item" }, [item]));
    });
    return listNode;
  }

  function table(options) {
    var opts = options || {};
    var headerRow = el("tr", {}, []);
    (opts.columns || []).forEach(function (column) {
      headerRow.appendChild(el("th", { scope: "col", textContent: column }));
    });

    var tbodyNode = el("tbody", {}, []);
    (opts.rows || []).forEach(function (row) {
      var rowNode = el("tr", {}, []);
      row.forEach(function (cell) {
        rowNode.appendChild(el("td", {}, [cell]));
      });
      tbodyNode.appendChild(rowNode);
    });

    return el("div", { className: "cos-table-wrap" }, [
      el("table", { className: "cos-table" }, [
        el("thead", {}, [headerRow]),
        tbodyNode
      ])
    ]);
  }

  function dialog(options) {
    var opts = options || {};
    var titleId = "dialog-title-" + Math.random().toString(36).slice(2);
    var backdrop = el("div", {
      className: "cos-dialog-backdrop",
      dataset: { open: "false" }
    }, []);
    var closeButton = button({
      label: "Close",
      kind: "secondary"
    });
    var dialogNode = el("div", {
      className: "cos-dialog",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": titleId
    }, [
      el("div", { className: "cos-dialog__header" }, [
        el("h2", { className: "cos-dialog__title", id: titleId, textContent: opts.title || "Dialog" }),
        iconButton({ icon: "✕", label: "Close dialog", showLabel: false, ariaLabel: "Close dialog" })
      ]),
      opts.body || stack([el("div", { textContent: "Dialog body" })]),
      inline((opts.actions || []).concat([closeButton]))
    ]);

    backdrop.appendChild(dialogNode);

    function setOpen(isOpen) {
      backdrop.dataset.open = isOpen ? "true" : "false";
    }

    function open() {
      setOpen(true);
    }

    function close() {
      setOpen(false);
    }

    closeButton.addEventListener("click", close);
    dialogNode.querySelector(".cos-icon-button").addEventListener("click", close);
    backdrop.addEventListener("click", function (event) {
      if (event.target === backdrop) {
        close();
      }
    });

    return {
      root: backdrop,
      open: open,
      close: close
    };
  }

  function toastHost() {
    var host = el("div", {
      className: "cos-toast-host",
      role: "status",
      "aria-live": "polite",
      "aria-atomic": "false"
    }, []);

    function push(options) {
      var opts = options || {};
      var toastNode = el("div", { className: "cos-toast" }, [
        el("div", { className: "cos-toast__title", textContent: opts.title || "Toast" }),
        el("div", { textContent: opts.message || "" })
      ]);
      host.appendChild(toastNode);
      setTimeout(function () {
        if (toastNode.parentNode) {
          toastNode.parentNode.removeChild(toastNode);
        }
      }, opts.durationMs || 2800);
    }

    return {
      root: host,
      push: push
    };
  }

  function panelNote(text) {
    return el("div", { className: "cos-panel-note", textContent: text });
  }

  function mount(target, node) {
    target.innerHTML = "";
    target.appendChild(node);
  }

  global.CommonOSRuntime = {
    el: el,
    stack: stack,
    inline: inline,
    button: button,
    iconButton: iconButton,
    textField: textField,
    textArea: textArea,
    selectField: selectField,
    checkboxField: checkboxField,
    radioGroup: radioGroup,
    switchField: switchField,
    statusChip: statusChip,
    card: card,
    list: list,
    table: table,
    dialog: dialog,
    toastHost: toastHost,
    panelNote: panelNote,
    mount: mount
  };
})(window);
