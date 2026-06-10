export const initializeSidebar = () => {
  const menuButton = document.querySelector("#menuButton");
  const sidebar = document.querySelector("#sidebar");
  const overlay = document.querySelector("#sidebarOverlay");
  const open = () => {
    sidebar?.classList.add("app__sidebar--open");
    overlay?.classList.add("app__overlay--active");
  };
  const close = () => {
    sidebar?.classList.remove("app__sidebar--open");
    overlay?.classList.remove("app__overlay--active");
  };
  menuButton?.addEventListener("click", open);
  overlay?.addEventListener("click", close);
};
