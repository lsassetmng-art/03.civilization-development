(function (globalObject) {
  "use strict";

  function readStorage(key) {
    try {
      if (!globalObject.localStorage) return "";
      return globalObject.localStorage.getItem(key) || "";
    } catch (_) {
      return "";
    }
  }

  function normalizeLocale(raw) {
    var value = String(raw || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, "-");

    if (value === "en" || value === "en-us" || value.indexOf("en-") === 0) {
      return "en-us";
    }

    if (value === "ja" || value === "ja-jp" || value.indexOf("ja-") === 0) {
      return "ja-jp";
    }

    return "";
  }

  function resolveLocale() {
    var params;

    try {
      params = new URLSearchParams(
        globalObject.location && globalObject.location.search
          ? globalObject.location.search
          : ""
      );
    } catch (_) {
      params = null;
    }

    var candidates = [
      params && params.get("locale_code"),
      params && params.get("localeCode"),
      params && params.get("language_code"),
      params && params.get("languageCode"),
      globalObject.localeCode,
      globalObject.languageCode,
      readStorage("portal.locale"),
      readStorage("portal.language"),
      readStorage("civilization.portal.locale"),
      globalObject.navigator && globalObject.navigator.language
    ];

    for (var i = 0; i < candidates.length; i += 1) {
      var normalized = normalizeLocale(candidates[i]);
      if (normalized) return normalized;
    }

    return "ja-jp";
  }

  var JA_JP = Object.freeze({
    documentTitle: "AI企業運営アプリ | BusinessOS",

    screenDashboard: "AI企業ダッシュボード",
    screenCompanyNew: "AI企業新規追加",
    screenDepartmentNew: "部門新規追加",
    screenSectionNew: "課新規追加",
    screenPlacementNew: "Worker配置",
    screenSettings: "AI企業設定",
    screenArtifactList: "成果物一覧",
    screenTaskLedger: "部門別タスク台帳",
    screenReviewList: "レビュー・承認待ち一覧",
    screenWorkbench: "AI実行Workbench",

    navDashboard: "AI企業ダッシュボード",
    navArtifacts: "成果物一覧",
    navTaskLedger: "部門別タスク台帳",
    navReviews: "レビュー・承認待ち一覧",
    navWorkbench: "AI実行Workbench",

    dashboardEyebrow: "AI企業",
    dashboardSelectTitle: "AI企業選択",
    dashboardAddCompany: "AI企業新規追加",
    dashboardReload: "AI企業を表示",
    dashboardOverviewEyebrow: "会社概要",
    dashboardOverviewTitle: "会社概要",
    dashboardOrgEyebrow: "部門 / 課",
    dashboardOrgTitle: "部門 / 課",

    commonLoading: "読込中...",
    labelAiCompany: "AI企業",
    labelDepartment: "部門"
  });

  var EN_US = Object.freeze({
    documentTitle: "AI Company Manager | BusinessOS",

    screenDashboard: "AI Company Dashboard",
    screenCompanyNew: "Add AI Company",
    screenDepartmentNew: "Add Department",
    screenSectionNew: "Add Section",
    screenPlacementNew: "Worker Placement",
    screenSettings: "AI Company Settings",
    screenArtifactList: "Deliverables",
    screenTaskLedger: "Department Task Ledger",
    screenReviewList: "Review & Approval Queue",
    screenWorkbench: "AI Execution Workbench",

    navDashboard: "AI Company Dashboard",
    navArtifacts: "Deliverables",
    navTaskLedger: "Department Task Ledger",
    navReviews: "Review & Approval Queue",
    navWorkbench: "AI Execution Workbench",

    dashboardEyebrow: "AI Company",
    dashboardSelectTitle: "Select AI Company",
    dashboardAddCompany: "Add AI Company",
    dashboardReload: "Show AI Companies",
    dashboardOverviewEyebrow: "Company Overview",
    dashboardOverviewTitle: "Company Overview",
    dashboardOrgEyebrow: "Departments / Sections",
    dashboardOrgTitle: "Departments / Sections",

    commonLoading: "Loading...",
    labelAiCompany: "AI Company",
    labelDepartment: "Department"
  });

  var MESSAGES = Object.freeze({
    "ja-jp": JA_JP,
    "en-us": EN_US
  });

  var localeCode = resolveLocale();
  var languageCode = localeCode === "en-us" ? "en" : "ja";

  function t(key, fallback) {
    var table = MESSAGES[localeCode] || MESSAGES["ja-jp"];
    var value = table[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }

    return fallback === undefined || fallback === null
      ? String(key || "")
      : String(fallback);
  }

  if (globalObject.document && globalObject.document.documentElement) {
    globalObject.document.documentElement.lang = languageCode;
    globalObject.document.documentElement.setAttribute(
      "data-businessos-locale",
      localeCode
    );
  }

  if (globalObject.document) {
    globalObject.document.title = t(
      "documentTitle",
      "AI企業運営アプリ | BusinessOS"
    );
  }


  var AICM_PRESENTATION_LITERAL_EN_US = Object.freeze({
    "ホーム": "Home",
    "まとめ": "Summary",
    "依頼": "Request",
    "個別": "Individual",
    "納品": "Delivery",
    "レビュー": "Review",
    "成果物": "Deliverables",
    "読込中...": "Loading...",
    "処理中...": "Processing...",
    "処理中": "Processing",
    "戻る": "Back",
    "キャンセル": "Cancel",
    "変更": "Edit",
    "削除": "Delete",
    "解除": "Clear",
    "全件選択": "Select all",
    "再読み込み": "Reload",
    "一覧へ戻る": "Back to list",
    "ホームへ戻る": "Back to home",
    "ダッシュボードへ戻る": "Back to dashboard",
    "詳細を閉じる": "Close details",
    "詳細表示を閉じる": "Close details",
    "プレビューを閉じる": "Close preview",
    "AI企業ダッシュボード": "AI Company Dashboard",
    "成果物一覧": "Deliverables",
    "部門別タスク台帳": "Department Task Ledger",
    "レビュー・承認待ち一覧": "Review & Approval Queue",
    "AI実行Workbench": "AI Execution Workbench",
    "AI企業新規追加": "Add AI Company",
    "部門新規追加": "Add Department",
    "課新規追加": "Add Section",
    "Worker配置": "Worker Placement",
    "AI企業設定": "AI Company Settings",
    "AI企業業務開始": "Start AI Company Operations",
    "部門別タスク台帳 まとめ依頼": "Department Task Ledger — Summary Request",
    "AI実行Workbench 個別依頼": "AI Execution Workbench — Individual Request",
    "レビュー・承認待ち一覧 納品レビュー": "Review & Approval Queue — Delivery Review",
    "AI企業": "AI Company",
    "会社": "Company",
    "企業名": "Company name",
    "事業領域": "Business domain",
    "部門": "Department",
    "課": "Section",
    "目的": "Purpose",
    "状態": "Status",
    "操作": "Action",
    "社内通称": "Internal nickname",
    "配置先": "Placement target",
    "担当役割": "Assigned role",
    "優先度": "Priority",
    "期限": "Due date",
    "大項目": "Major item",
    "補足メモ": "Additional notes",
    "成果物名": "Deliverable name",
    "作業名": "Task name",
    "作業種別": "Work type",
    "実行AI/Worker": "Execution AI/Worker",
    "作業タイトル": "Task title",
    "作業指示": "Task instructions",
    "ローカルファイル選択": "Select local files",
    "パス直接入力": "Enter paths directly",
    "納品形式": "Delivery format",
    "担当AI": "Responsible AI",
    "依頼日時": "Requested at",
    "種別": "Type",
    "成果物種別": "Deliverable type",
    "操作予定": "Planned action",
    "社長": "President",
    "部長": "Manager",
    "課長": "Leader",
    "従業員": "Worker",
    "従業員ロボット": "Worker robot",
    "従業員社内通称": "Worker internal nickname",
    "従業員設定": "Worker settings",
    "有効": "Active",
    "無効": "Inactive",
    "未設定": "Not set",
    "未登録": "Not registered",
    "候補がありません": "No candidates available",
    "未選択": "Not selected",
    "部門直下": "Directly under department",
    "設計": "Design",
    "実装": "Implementation",
    "テスト": "Test",
    "引き継ぎ": "Handoff",
    "通常": "Normal",
    "高": "High",
    "低": "Low",
    "未着手": "Not started",
    "作業中": "In progress",
    "レビュー待ち": "Waiting for review",
    "完了": "Completed",
    "承認待ち": "Pending approval",
    "承認済み": "Approved",
    "差し戻し": "Returned",
    "アーカイブ": "Archived",
    "削除済": "Deleted",
    "未引渡": "Not handed off",
    "引渡完了": "Handoff completed",
    "処理完了": "Processing completed",
    "実行待ち": "Waiting to run",
    "進行中": "In progress",
    "自動実行依頼済み": "Auto execution requested",
    "適用済み": "Applied",
    "自動割当": "Auto-assigned",
    "会社概要": "Company Overview",
    "部門 / 課": "Departments / Sections",
    "企業変更": "Edit Company",
    "部門変更": "Edit Department",
    "課変更": "Edit Section",
    "変更内容の確認": "Review Changes",
    "確認画面": "Confirmation",
    "保存内容": "Save Details",
    "確認対象": "Items to Confirm",
    "役職設定": "Role Settings",
    "実行前チェック": "Pre-execution Check",
    "確認": "Confirmation",
    "削除確認": "Delete Confirmation",
    "課長へ送る確認": "Leader Handoff Confirmation",
    "レビュー項目": "Review Item",
    "納品サマリー": "Delivery Summary",
    "主な変更点": "Main Changes",
    "AIレビュー結果": "AI Review Result",
    "未解決事項": "Unresolved Issues",
    "承認確認プレビュー": "Approval Confirmation Preview",
    "差し戻し確認プレビュー": "Return Confirmation Preview",
    "詳細": "Details",
    "要約未設定": "No summary",
    "AI企業を表示": "Show AI Companies",
    "AI企業を作成": "Create AI Company",
    "部門を作成": "Create Department",
    "課を作成": "Create Section",
    "変更を保存": "Save Changes",
    "確定して保存": "Confirm and Save",
    "この部門に課を追加": "Add Section to this Department",
    "従業員行を追加": "Add Worker Row",
    "Worker配置を作成": "Create Worker Placement",
    "登録済みファイルを削除": "Delete Registered File",
    "台帳行を追加": "Add Ledger Row",
    "ChatGPT用プロンプト": "Prompt for ChatGPT",
    "CSVファイル読込": "Load CSV File",
    "CSVファイル取込": "Import CSV File",
    "課長へ送る": "Send to Leader",
    "課を適用": "Apply Section",
    "Leaderを適用": "Apply Leader",
    "引き渡し先を解除": "Clear Handoff Target",
    "削除を確定": "Confirm Delete",
    "課長へ送るを確定": "Confirm Send to Leader",
    "確認して課長へ送る": "Confirm and Send to Leader",
    "中項目へ分解": "Break Down into Middle Items",
    "前ページ": "Previous",
    "次ページ": "Next",
    "承認": "Approve",
    "差し戻し確認へ進む": "Continue to Return Confirmation",
    "承認確認へ進む": "Continue to Approval Confirmation",
    "成果物を確認": "Review Deliverable",
    "確認へ進む": "Continue to Confirmation",
    "業務開始": "Start Operations",
    "開始する": "Start",
    "例: ウルフ": "Example: Wolf",
    "例: 開発 / 運営 / 管理": "Example: Development / Operations / Management",
    "例: 開発部": "Example: Development Department",
    "部門の目的": "Department purpose",
    "例: UI課": "Example: UI Section",
    "課の目的": "Section purpose",
    "例: 作業担当A": "Example: Worker A",
    "課を選択してください": "Select a section",
    "Leaderを選択してください": "Select a Leader",
    "配置済みAI/Workerがありません": "No assigned AI/Worker",
    "AI/Workerを選択": "Select AI/Worker",
    "例: UI修正案の作成": "Example: Prepare UI revision proposal",
    "何を、どの条件で、どこまで作業するかを書いてください。": "Describe the task, conditions, and expected scope.",
    "今回だけの補足があれば短く入力": "Enter any notes specific to this run",
    "短い補足だけ": "Short notes only",
    "AI企業が選択されていません": "No AI Company Selected",
    "AI企業を選択してください": "Select an AI Company",
    "変更できる部門がありません": "No Departments Available to Edit",
    "変更する部門を選択": "Select Department to Edit",
    "変更できる課がありません": "No Sections Available to Edit",
    "変更する課を選択": "Select Section to Edit",
    "該当する大項目はありません": "No matching major items",
    "入力内容を確認してください。": "Check the entered information.",
    "エラー": "Error",
    "入力エラー": "Input Error",
    "不明なエラーです。": "An unknown error occurred.",
    "確認画面を表示できません。": "Could not display the confirmation screen.",
    "保存に失敗しました。": "Failed to save.",
    "台帳行追加に失敗しました。": "Failed to add the ledger row.",
    "CSV取り込みに失敗しました。": "CSV import failed.",
    "CSV確認に失敗しました。": "CSV validation failed.",
    "CSVファイルの読み込みに失敗しました。": "Failed to read the CSV file.",
    "大項目の削除に失敗しました。": "Failed to delete the major item.",
    "削除に失敗しました。": "Delete failed.",
    "AI実行Workbenchに失敗しました。": "AI Execution Workbench failed.",
    "実行状況の取得に失敗しました。": "Failed to retrieve execution status.",
    "作業タイトルを入力してください。": "Enter a task title.",
    "元データファイルの一時アップロードに失敗しました。": "Failed to temporarily upload source files.",
    "承認に失敗しました。": "Approval failed.",
    "差し戻しに失敗しました。": "Return failed.",
    "差し戻し理由を入力してください。": "Enter the reason for returning this item."
  });

  var AICM_PRESENTATION_MESSAGE_EN_US = Object.freeze({
    "部門別タスク台帳の最新情報取得に失敗しました。": "Failed to retrieve the latest Department Task Ledger.",
    "台帳行追加に失敗しました。": "Failed to add the ledger row.",
    "確認画面を表示できません。": "Could not display the confirmation screen.",
    "保存に失敗しました。": "Failed to save.",
    "削除に失敗しました。": "Delete failed.",
    "大項目の削除に失敗しました。": "Failed to delete the major item.",
    "CSVファイルの読み込みに失敗しました。": "Failed to read the CSV file.",
    "CSV取り込みに失敗しました。": "CSV import failed.",
    "CSV確認に失敗しました。": "CSV validation failed.",
    "AI実行Workbenchに失敗しました。": "AI Execution Workbench failed.",
    "実行状況の取得に失敗しました。": "Failed to retrieve execution status.",
    "作業タイトルを入力してください。": "Enter a task title.",
    "元データファイルの一時アップロードに失敗しました。": "Failed to temporarily upload the source file.",
    "承認に失敗しました。": "Approval failed.",
    "差し戻しに失敗しました。": "Return failed.",
    "差し戻し理由を入力してください。": "Enter the reason for returning this item.",
    "Manager大項目IDを特定できません。": "Could not identify the Manager major item ID.",
    "すでに引渡し済み、完了、削除、または対象外です。": "This item has already been handed off, completed, deleted, or is not eligible.",
    "Leader自動分解に失敗しました。": "Automatic Leader decomposition failed.",
    "対象を選択してください。": "Select an item.",
    "対象がありません。": "No items available.",
    "対象データがありません。": "No data available.",
    "読み込みに失敗しました。": "Failed to load.",
    "最新情報の取得に失敗しました。": "Failed to retrieve the latest information.",
    "入力内容を確認してください。": "Check the entered information.",
    "不明なエラーです。": "An unknown error occurred."
  });

  var AICM_PRESENTATION_PHRASE_EN_US = Object.freeze({
    "AI企業": "AI Company",
    "企業": "Company",
    "会社": "Company",
    "企業名": "Company name",
    "会社名": "Company name",
    "事業領域": "Business domain",
    "部門": "Department",
    "部門名": "Department name",
    "課": "Section",
    "課名": "Section name",
    "目的": "Purpose",
    "説明": "Description",
    "状態": "Status",
    "種別": "Type",
    "優先度": "Priority",
    "期限": "Due date",
    "担当": "Assignee",
    "担当者": "Assignee",
    "担当AI": "Responsible AI",
    "担当役割": "Assigned role",
    "社長": "President",
    "部長": "Manager",
    "課長": "Leader",
    "従業員": "Worker",
    "Worker": "Worker",
    "President方針": "President Policy",
    "会社共通ルール": "Company Rules",
    "規約・禁止事項": "Terms / Prohibited Actions",
    "制約条件": "Constraints",
    "品質基準": "Quality Standards",
    "納品基準": "Delivery Standards",
    "表現/安全ルール": "Expression / Safety Rules",
    "関連ファイル": "Related File",
    "作業": "Task",
    "作業名": "Task name",
    "作業種別": "Task type",
    "作業タイトル": "Task title",
    "作業指示": "Task instructions",
    "補足": "Notes",
    "補足メモ": "Additional notes",
    "成果物": "Deliverable",
    "成果物名": "Deliverable name",
    "成果物種別": "Deliverable type",
    "納品": "Delivery",
    "納品サマリー": "Delivery Summary",
    "レビュー": "Review",
    "承認": "Approve",
    "差し戻し": "Return",
    "承認待ち": "Pending approval",
    "承認済み": "Approved",
    "大項目": "Major Item",
    "中項目": "Middle Item",
    "小項目": "Minor Item",
    "タスク": "Task",
    "台帳": "Ledger",
    "新規追加": "Add",
    "追加": "Add",
    "作成": "Create",
    "登録": "Register",
    "変更": "Edit",
    "編集": "Edit",
    "保存": "Save",
    "削除": "Delete",
    "解除": "Clear",
    "選択": "Select",
    "適用": "Apply",
    "確認": "Confirm",
    "実行": "Run",
    "開始": "Start",
    "戻る": "Back",
    "閉じる": "Close",
    "再読み込み": "Reload",
    "未設定": "Not set",
    "未登録": "Not registered",
    "未選択": "Not selected",
    "未着手": "Not started",
    "作業中": "In progress",
    "完了": "Completed",
    "削除済": "Deleted",
    "有効": "Active",
    "無効": "Inactive",
    "通常": "Normal",
    "高": "High",
    "低": "Low",
    "設計": "Design",
    "実装": "Implementation",
    "テスト": "Test",
    "引き継ぎ": "Handoff",
    "ホーム": "Home",
    "まとめ": "Summary",
    "依頼": "Request",
    "個別": "Individual",
    "詳細": "Details",
    "実行AI/Worker": "Execution AI/Worker",
    "AI/Worker": "AI/Worker",
    "ローカルファイル選択": "Select local files",
    "パス直接入力": "Enter paths directly",
    "主な変更点": "Main Changes",
    "AIレビュー結果": "AI Review Result",
    "未解決事項": "Unresolved Issues",
    "例:": "Example:",
    "入力してください": "Enter a value",
    "選択してください": "Select an option"
  });

  function translateLiteral(value) {
    var source = String(value === undefined || value === null ? "" : value);

    if (localeCode !== "en-us") {
      return source;
    }

    if (Object.prototype.hasOwnProperty.call(
      AICM_PRESENTATION_LITERAL_EN_US,
      source
    )) {
      return AICM_PRESENTATION_LITERAL_EN_US[source];
    }

    if (Object.prototype.hasOwnProperty.call(
      AICM_PRESENTATION_MESSAGE_EN_US,
      source
    )) {
      return AICM_PRESENTATION_MESSAGE_EN_US[source];
    }

    return source;
  }

  function translatePresentationPhrase(value) {
    var source = String(value === undefined || value === null ? "" : value);

    if (localeCode !== "en-us" || !source) {
      return source;
    }

    var translated = translateLiteral(source);

    if (translated !== source) {
      return translated;
    }

    Object.keys(AICM_PRESENTATION_PHRASE_EN_US)
      .sort(function (a, b) {
        return b.length - a.length;
      })
      .forEach(function (ja) {
        if (translated.indexOf(ja) < 0) return;

        translated = translated.split(ja).join(
          AICM_PRESENTATION_PHRASE_EN_US[ja]
        );
      });

    return translated;
  }

  function isPhraseSafePresentationElement(element) {
    if (!element || element.nodeType !== 1) return false;

    var tag = String(element.tagName || "").toLowerCase();

    if (
      tag === "button" ||
      tag === "label" ||
      tag === "h1" ||
      tag === "h2" ||
      tag === "h3" ||
      tag === "dt" ||
      tag === "option"
    ) {
      return true;
    }

    if (!element.classList) return false;

    return (
      element.classList.contains("aicm-bottom-nav-line") ||
      element.classList.contains("aicm-eyebrow")
    );
  }

  function translateTextNode(node) {
    if (!node || node.nodeType !== 3) return;

    var raw = String(node.nodeValue || "");
    var trimmed = raw.trim();

    if (!trimmed) return;

    var translated = translateLiteral(trimmed);

    if (
      translated === trimmed &&
      node.parentElement &&
      isPhraseSafePresentationElement(node.parentElement)
    ) {
      translated = translatePresentationPhrase(trimmed);
    }

    if (translated !== trimmed) {
      node.nodeValue = raw.replace(trimmed, translated);
    }
  }

  function translateElement(element) {
    if (!element || element.nodeType !== 1) return;

    Array.prototype.forEach.call(
      element.childNodes || [],
      translateTextNode
    );

    ["placeholder", "aria-label", "title"].forEach(function (attribute) {
      if (!element.hasAttribute ||
          !element.hasAttribute(attribute)) {
        return;
      }

      var before = element.getAttribute(attribute);
      var after = translateLiteral(before);

      if (
        after === before &&
        (
          attribute === "placeholder" ||
          attribute === "aria-label" ||
          attribute === "title"
        )
      ) {
        after = translatePresentationPhrase(before);
      }

      if (after !== before) {
        element.setAttribute(attribute, after);
      }
    });
  }

  function applyPresentation(root) {
    if (localeCode !== "en-us" ||
        !root) {
      return;
    }

    var selector = [
      "button",
      "label",
      "h1",
      "h2",
      "h3",
      "dt",
      "option",
      ".aicm-bottom-nav-line",
      ".aicm-eyebrow",
      ".aicm-core-empty",
      ".aicm-core-message",
      "[role='alert']",
      "[aria-live]",
      "[placeholder]",
      "[aria-label]",
      "[title]"
    ].join(",");

    if (root.nodeType === 3) {
      translateTextNode(root);
      if (root.parentElement) {
        translateElement(root.parentElement);
      }
      return;
    }

    if (root.matches && root.matches(selector)) {
      translateElement(root);
    }

    if (!root.querySelectorAll) return;

    Array.prototype.forEach.call(
      root.querySelectorAll(selector),
      translateElement
    );
  }

  function installPresentationObserver() {
    if (localeCode !== "en-us" ||
        !globalObject.document) {
      return;
    }

    var runInitial = function () {
      applyPresentation(globalObject.document);
    };

    if (globalObject.document.readyState === "loading") {
      globalObject.document.addEventListener(
        "DOMContentLoaded",
        runInitial,
        { once: true }
      );
    } else {
      runInitial();
    }

    if (typeof globalObject.MutationObserver !== "function" ||
        !globalObject.document.documentElement) {
      return;
    }

    var observer = new globalObject.MutationObserver(function (records) {
      records.forEach(function (record) {
        Array.prototype.forEach.call(
          record.addedNodes || [],
          applyPresentation
        );
      });
    });

    observer.observe(
      globalObject.document.documentElement,
      {
        childList: true,
        subtree: true
      }
    );
  }

  globalObject.AICMI18n = Object.freeze({
    localeCode: localeCode,
    languageCode: languageCode,
    messages: MESSAGES,
    normalizeLocale: normalizeLocale,
    resolveLocale: resolveLocale,
    t: t,
    translateLiteral: translateLiteral,
    translatePresentationPhrase: translatePresentationPhrase,
    applyPresentation: applyPresentation,
    installPresentationObserver: installPresentationObserver,
    presentationLiteralCount: Object.keys(
      AICM_PRESENTATION_LITERAL_EN_US
    ).length,
    presentationMessageCount: Object.keys(
      AICM_PRESENTATION_MESSAGE_EN_US
    ).length,
    presentationPhraseCount: Object.keys(
      AICM_PRESENTATION_PHRASE_EN_US
    ).length
  });

  installPresentationObserver();
})(typeof window !== "undefined" ? window : globalThis);
