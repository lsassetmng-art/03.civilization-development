"use strict";

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function createTile(entry) {
  const tile = document.createElement("article");
  tile.className = "tile";
  tile.setAttribute("aria-disabled", "true");

  const heading = document.createElement("h3");
  heading.textContent = entry.label;

  const description = document.createElement("p");
  description.textContent = "準備中";

  tile.append(heading, description);
  return tile;
}

async function initializeMenu() {
  const grid = document.getElementById("menu-grid");

  try {
    const response = await fetch("./menu-contract.json", {
      cache: "no-store",
      credentials: "same-origin"
    });

    if (!response.ok) {
      throw new Error("CONTRACT_HTTP_" + response.status);
    }

    const data = await response.json();

    if (
      data.schemaVersion !== 1 ||
      typeof data.owner !== "string" ||
      typeof data.displayName !== "string" ||
      !Array.isArray(data.menuEntries) ||
      data.menuEntries.some(entry =>
        typeof entry.label !== "string" ||
        entry.enabled !== false ||
        entry.destination !== null
      )
    ) {
      throw new Error("INVALID_MENU_CONTRACT");
    }

    document.title = data.displayName + " | Civilization";
    setText("os-title", data.displayName);
    setText("os-description", "OSが所有するメニュー画面");
    setText("ownership", "Owner: " + data.owner);

    if (data.menuEntries.length === 0) {
      const message = document.createElement("p");
      message.textContent = "既存のOSランチャーとの接続を確認中です。";
      grid.append(message);
    } else {
      for (const entry of data.menuEntries) {
        grid.append(createTile(entry));
      }
    }
  } catch (error) {
    setText("os-title", "メニューを表示できません");
    setText("os-description", "メニュー定義の読み込みに失敗しました。");
    grid.classList.add("error");
    grid.textContent = "画面の読み込みに失敗しました。";
    console.error("OS_MENU_LOAD_FAILED", error.message);
  }
}

document.addEventListener("DOMContentLoaded", initializeMenu);
