export function setText(id, value) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = String(value);
  }
}

export function setPre(id, value) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = String(value);
  }
}

export function renderList(id, items, mapper) {
  const node = document.getElementById(id);
  if (!node) {
    return;
  }
  node.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = mapper(item);
    node.appendChild(li);
  });
}
