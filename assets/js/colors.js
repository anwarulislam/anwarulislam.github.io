let isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
let currentHue = 0;

function updateColors(hue) {
  hue = Number(hue);
  const ahue = (hue + 60) % 360;
  const a2hue = (hue + 300) % 360;

  const [primaryLight, secondaryLight, tertiaryLight] = isDarkMode
    ? ["10%", "95%", "80%"]
    : ["95%", "10%", "20%"];

  document.documentElement.style.cssText = `
        --color-primary: hsl(${hue}, 50%, ${primaryLight});
        --color-secondary: hsl(${hue}, 50%, ${secondaryLight});
        --color-tertiary: hsl(${ahue}, 80%, ${tertiaryLight});
        --color-accent: hsl(${a2hue}, 80%, ${tertiaryLight});
    `;
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("dark");
  updateColors(currentHue);
  localStorage.setItem("darkMode", isDarkMode);
}

function animateColors() {
  currentHue = (currentHue + 1) % 360;
  updateColors(currentHue);
}

// Initialize dark mode from localStorage or system preference
const storedDarkMode = localStorage.getItem("darkMode");
if (storedDarkMode !== null) {
  isDarkMode = storedDarkMode === "true";
  if (isDarkMode) {
    document.body.classList.add("dark");
  }
}

// Initial color set
updateColors(currentHue);

// Update colors every 300ms
setInterval(animateColors, 150);

// Listen for system dark mode changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (localStorage.getItem("darkMode") === null) {
      isDarkMode = e.matches;
      document.body.classList.toggle("dark", isDarkMode);
      updateColors(currentHue);
    }
  });
