// Astro runs bundled scripts once; resolve the current article on each copy.
document.addEventListener("copy", event => {
  const article = document.getElementById("article");
  const attribution = article?.dataset.copyAttribution;
  const selection = window.getSelection();
  if (
    event.defaultPrevented ||
    !event.clipboardData ||
    !attribution ||
    !selection ||
    selection.rangeCount !== 1 ||
    selection.isCollapsed ||
    !selection.toString().trim() ||
    (event.target instanceof Element &&
      event.target.closest("input, textarea, [contenteditable]"))
  )
    return;

  const range = selection.getRangeAt(0);
  if (!article.contains(range.commonAncestorContainer)) return;

  const content = document.createElement("div");
  content.append(range.cloneContents());
  const credit = document.createElement("p");
  credit.style.whiteSpace = "pre-line";
  credit.textContent = attribution;
  content.append(credit);

  event.clipboardData.setData(
    "text/plain",
    `${selection.toString()}\n\n${attribution}`
  );
  event.clipboardData.setData("text/html", content.innerHTML);
  event.preventDefault();
});
