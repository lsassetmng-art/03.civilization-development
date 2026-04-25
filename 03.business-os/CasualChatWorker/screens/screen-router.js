window.CCW_SCREEN_ROUTER = {
  show(screenName) {
    document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("is-active"));
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("is-active"));

    const screen = document.querySelector(`#screen-${screenName}`);
    if (screen) screen.classList.add("is-active");

    const tab = document.querySelector(`.tab[data-screen="${screenName}"]`);
    if (tab) tab.classList.add("is-active");
  }
};
