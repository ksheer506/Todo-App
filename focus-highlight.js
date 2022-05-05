const focus = document.createElement("focus-highlight");
const initialStyles = {
  position: "absolute",
  border: "0px",
  width: "0px",
  height: "0px",
  top: "0",
  left: "0",
  boxSizing: "border-box",
  transition: "0.6s all",
}

document.body.appendChild(focus);

for (const prop in initialStyles) {
  focus.style[prop] = initialStyles[prop];
}

function showFocus(e) {
  const focusedEl = e.target;
  const elementBound = focusedEl.getBoundingClientRect();
  const styles = {
    left: `${elementBound.left}px`,
    top: `${elementBound.top}px`,
    width: `${focusedEl.offsetWidth}px`,
    height: `${focusedEl.offsetHeight}px`,
    borderRadius: getComputedStyle(focusedEl).borderRadius
  }

  focus.style.border = "2px solid rgb(228, 84, 108)";
  for (const prop in styles) {
    focus.style[prop] = styles[prop];
  }
}

function hideFocus(e) {
  const styles = {
    left: "0px",
    top: "0px",
    width: "0px",
    height: "0px",
    border: "0px"
  }
  for (const prop in styles) {
    focus.style[prop] = styles[prop];
  }
}

document.addEventListener("focusin", (e1) => {
  document.addEventListener("keyup", (e2) => {
    if (e2.key === "Tab") {
      showFocus(e1)
    };
  })
})

window.addEventListener("blur", (e) => {
  hideFocus(e);
})


