import {
  analyticsState,
  configureAnalytics,
  endAnalyticsSession,
  recordCoverage,
  startAnalyticsSession,
  trackExecutionStep,
  trackProgramEdit,
  trackRunEnd,
  trackRunStart,
} from "./js/analytics.js";
import {
  initAnalyticsUI,
  closePlayerOverlay,
  openPlayerOverlay,
  renderAnalyticsScreen,
  renderPlayerList,
  updatePlayerStatus,
} from "./js/analytics-ui.js";
import { applyTranslations, getCurrentLanguage, getSupportedLanguages, setLanguage, t } from "./js/i18n.js";
import {
  cancelCompletionTimer,
  delay,
  getExecutionDelay,
  getLightTileList,
  getPlayerState,
  getRunToken,
  jumpForward,
  lightCurrentTile,
  loadMap,
  moveBackward,
  moveForward,
  nextRunToken,
  resetLightTiles,
  resetPlayerPosition,
  resizeRenderer,
  setCompletionCallback,
  setGhostColor,
  startCameraIntro,
  turnLeft,
  turnRight,
  animate,
} from "./js/scene.js";

const toolboxStrip = document.querySelector("#toolbox-strip");
const toolboxPanel = document.querySelector("#toolbox");
const programArea = document.querySelector("#program-area");
const programPanel = document.querySelector(".program-panel");
const programToggle = document.querySelector("#program-toggle");
const playButton = document.querySelector(".play-button");
const startScreen = document.querySelector("#start-screen");
const levelButtons = document.querySelectorAll("[data-level]");
const resetButton = document.querySelector("#reset-button");
const backButton = document.querySelector("#back-button");
const completionOverlay = document.querySelector("#completion-overlay");
const continueLevelButton = document.querySelector("#continue-level");
const chooseLevelButton = document.querySelector("#choose-level");
const levelIndicator = document.querySelector("#level-indicator");
const nextLevelButton = document.querySelector("#next-level");
const playModeButton = document.querySelector("#play-mode");
const selectModeButton = document.querySelector("#select-mode");
const levelSelectionPanel = document.querySelector("#level-selection");
const modeHint = document.querySelector("#mode-hint");
const settingsOverlay = document.querySelector("#settings-overlay");
const settingsCloseButton = document.querySelector("#close-settings");
const ghostColorInput = document.querySelector("#ghost-color");
const languageSelect = document.querySelector("#language-select");
const compactCommandsToggle = document.querySelector("#compact-commands");
const settingsOpenButtons = document.querySelectorAll("[data-open-settings]");
const playerOverlay = document.querySelector("#player-overlay");
const aboutOverlay = document.querySelector("#about-overlay");
const aboutButton = document.querySelector("#about-button");
const aboutCloseButton = document.querySelector("#close-about");

const blockDefinitions = [
  {
    id: "forward",
    labelKey: "blocks.forward",
    icon: "assets/arrow_directions_vertical.png",
  },
  {
    id: "backward",
    labelKey: "blocks.backward",
    icon: "assets/arrow_directions_vertical.png",
    rotate: 180,
  },
  {
    id: "turn-left",
    labelKey: "blocks.turnLeft",
    icon: "assets/arrow_directions_turn.png",
    rotate: -90,
  },
  {
    id: "turn-right",
    labelKey: "blocks.turnRight",
    icon: "assets/arrow_directions_turn.png",
    rotate: 90,
  },
  {
    id: "jump",
    labelKey: "blocks.jump",
    icon: "assets/arrow_directions_jump.png",
  },
  {
    id: "light",
    labelKey: "blocks.light",
    icon: "assets/arrow_directions_light.png",
  },
];

const SETTINGS_STORAGE_KEY = "lightbot-threejs-settings";

function getBlockLabel(definition) {
  return t(definition.labelKey);
}

function loadSettings() {
  const defaults = {
    ghostColor: "#ff5b7f",
    language: typeof navigator !== "undefined" ? navigator.language : "en",
    compactCommands: false,
  };
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) {
      return defaults;
    }
    const parsed = JSON.parse(stored);
    return { ...defaults, ...(parsed ?? {}) };
  } catch (error) {
    console.warn("Unable to read settings data.", error);
    return defaults;
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Unable to save settings data.", error);
  }
}

const settingsState = loadSettings();

function updateLevelButtonText() {
  levelButtons.forEach((button) => {
    const level = button.dataset.level;
    button.textContent = t("start.levelButton", { level });
  });
}

function updateBlockLabels() {
  if (toolboxStrip) {
    toolboxStrip.querySelectorAll(".block").forEach((block) => {
      const blockId = block.dataset.blockType;
      const definition = blockDefinitions.find((item) => item.id === blockId);
      if (!definition) {
        return;
      }
      const label = getBlockLabel(definition);
      const image = block.querySelector("img");
      const text = block.querySelector("span");
      if (image) {
        image.alt = label;
      }
      if (text) {
        text.textContent = blockId === "jump" || blockId === "light" ? label : "";
      }
    });
  }

  if (!programArea) {
    return;
  }
  programArea.querySelectorAll(".program-block").forEach((block) => {
    const blockId = block.dataset.blockType;
    const definition = blockDefinitions.find((item) => item.id === blockId);
    if (!definition) {
      return;
    }
    const label = getBlockLabel(definition);
    const image = block.querySelector("img");
    const text = block.querySelector("span");
    if (image) {
      image.alt = label;
    }
    if (text) {
      text.textContent = label;
    }
  });
}

function applyLanguageUpdates() {
  applyTranslations();
  updateLevelButtonText();
  updateBlockLabels();
  updatePlayerStatus();
  renderAnalyticsScreen();
  renderPlayerList();
  if (currentSelectionMode) {
    updateModeHint(currentSelectionMode);
  } else {
    updateModeHint(null);
  }
  updateNextLevelButton();
  const isCollapsed = programPanel?.classList.contains("is-collapsed");
  setProgramCollapsed(Boolean(isCollapsed));
}

function populateLanguageSelect() {
  if (!languageSelect) {
    return;
  }
  languageSelect.replaceChildren();
  getSupportedLanguages().forEach((language) => {
    const option = document.createElement("option");
    option.value = language.code;
    option.textContent = language.label;
    languageSelect.appendChild(option);
  });
}

function openSettingsOverlay() {
  if (settingsOverlay) {
    settingsOverlay.classList.add("is-visible");
  }
}

function closeSettingsOverlay() {
  if (settingsOverlay) {
    settingsOverlay.classList.remove("is-visible");
  }
}

function openAboutOverlay() {
  if (aboutOverlay) {
    aboutOverlay.classList.add("is-visible");
  }
}

function closeAboutOverlay() {
  if (aboutOverlay) {
    aboutOverlay.classList.remove("is-visible");
  }
}

function setCompactProgram(isCompact) {
  if (programPanel) {
    programPanel.classList.toggle("is-compact", isCompact);
  }
}


function getProgramSnapshot() {
  if (!programArea) {
    return [];
  }
  return [...programArea.querySelectorAll(".program-block")].map((block) => block.dataset.blockType);
}

configureAnalytics({
  getProgramSnapshot,
  getPlayerState,
  getLightTileList,
});

function updateLevelIndicator(levelName) {
  if (levelIndicator) {
    levelIndicator.textContent = levelName;
  }
}

function createToolboxBlock(definition) {
  const block = document.createElement("div");
  block.className = "block";
  block.setAttribute("draggable", "true");
  block.dataset.blockType = definition.id;

  if (definition.rotate) {
    block.dataset.rotate = String(definition.rotate);
  }

  const image = document.createElement("img");
  image.src = definition.icon;
  image.alt = getBlockLabel(definition);

  const label = document.createElement("span");
  label.textContent = definition.id === "jump" || definition.id === "light" ? getBlockLabel(definition) : "";

  block.append(image, label);

  block.addEventListener("click", () => {
    addProgramBlock(definition.id);
  });

  block.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", definition.id);
    event.dataTransfer.effectAllowed = "copy";
    block.classList.add("dragging");
  });

  block.addEventListener("dragend", () => {
    block.classList.remove("dragging");
  });

  return block;
}

function createProgramBlock(definition) {
  const item = document.createElement("li");
  item.className = "program-block";
  item.setAttribute("draggable", "true");
  item.dataset.blockType = definition.id;

  const image = document.createElement("img");
  image.src = definition.icon;
  image.alt = getBlockLabel(definition);

  if (definition.rotate) {
    image.style.transform = `rotate(${definition.rotate}deg)`;
  }

  const label = document.createElement("span");
  label.textContent = getBlockLabel(definition);

  item.append(image, label);

  item.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", definition.id);
    event.dataTransfer.effectAllowed = "move";
    item.classList.add("dragging");
    item.dataset.dragStartIndex = String([...programArea.querySelectorAll(".program-block")].indexOf(item));
  });

  item.addEventListener("dragend", () => {
    item.classList.remove("dragging");
    const startIndex = Number.parseInt(item.dataset.dragStartIndex || "-1", 10);
    delete item.dataset.dragStartIndex;
    if (!programArea || startIndex < 0) {
      return;
    }
    const blocks = [...programArea.querySelectorAll(".program-block")];
    const newIndex = blocks.indexOf(item);
    if (newIndex !== -1 && newIndex !== startIndex) {
      trackProgramEdit("move", item.dataset.blockType, {
        fromIndex: startIndex,
        toIndex: newIndex,
      });
    }
  });

  item.addEventListener("dblclick", (event) => {
    event.preventDefault();
    if (!programArea) {
      return;
    }
    const index = [...programArea.querySelectorAll(".program-block")].indexOf(item);
    if (index === -1) {
      return;
    }
    trackProgramEdit("remove", item.dataset.blockType, { index });
    item.remove();
  });

  item.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (event.dataTransfer.effectAllowed === "move") {
      event.dataTransfer.dropEffect = "move";
    }
  });

  item.addEventListener("drop", (event) => {
    event.preventDefault();
    const draggedItem = document.querySelector(".program-block.dragging");
    if (draggedItem && draggedItem !== item) {
      programArea.insertBefore(draggedItem, item);
    }
  });

  return item;
}

function getDragAfterElement(container, cursorY) {
  const draggableElements = [...container.querySelectorAll(".program-block:not(.dragging)")];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = cursorY - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null },
  ).element;
}

function addProgramBlock(blockId) {
  const definition = blockDefinitions.find((block) => block.id === blockId);
  if (!definition) {
    return;
  }

  const newBlock = createProgramBlock(definition);
  programArea.appendChild(newBlock);
  trackProgramEdit("add", blockId, { index: programArea.children.length - 1 });
}

function resetProgram() {
  if (programArea) {
    programArea.replaceChildren();
  }
}

function setProgramCollapsed(isCollapsed) {
  if (!programPanel || !programToggle) {
    return;
  }
  programPanel.classList.toggle("is-collapsed", isCollapsed);
  programToggle.setAttribute("aria-expanded", String(!isCollapsed));
  programToggle.textContent = isCollapsed ? t("program.show") : t("program.hide");
}

let isRunning = false;
let currentLevelMeta = null;
let currentLevelNumber = null;
let currentSelectionMode = null;

document.addEventListener("lightbot:language-change", () => {
  applyLanguageUpdates();
});

populateLanguageSelect();
setGhostColor(settingsState.ghostColor);
setLanguage(settingsState.language);
settingsState.language = getCurrentLanguage();
setCompactProgram(settingsState.compactCommands);
if (ghostColorInput) {
  ghostColorInput.value = settingsState.ghostColor;
}
if (languageSelect) {
  languageSelect.value = settingsState.language;
}
if (compactCommandsToggle) {
  compactCommandsToggle.checked = settingsState.compactCommands;
}

function clearExecutingHighlights() {
  if (!programArea) {
    return;
  }
  programArea.querySelectorAll(".program-block.executing").forEach((block) => {
    block.classList.remove("executing");
  });
}

function hideCompletionOverlay() {
  if (completionOverlay) {
    completionOverlay.classList.remove("is-visible");
  }
  cancelCompletionTimer();
}

function showCompletionOverlay() {
  if (completionOverlay) {
    completionOverlay.classList.add("is-visible");
  }
  endAnalyticsSession("completed");
}

function stopProgram({ resetPosition = false } = {}) {
  if (!isRunning && !resetPosition) {
    return;
  }
  nextRunToken();
  isRunning = false;
  clearExecutingHighlights();
  if (playButton && resetPosition) {
    playButton.classList.remove("is-running");
  }
  if (resetPosition) {
    resetPlayerPosition();
    resetLightTiles();
  }
}

async function runProgram() {
  if (isRunning || !programArea) {
    return;
  }
  if (!currentLevelMeta) {
    return;
  }
  if (!analyticsState.currentPlayerId) {
    openPlayerOverlay(t("playerOverlay.selectBeforeRun"));
    return;
  }
  if (!programArea.querySelector(".program-block")) {
    return;
  }
  if (!getPlayerState()) {
    return;
  }

  const blocks = [...programArea.querySelectorAll(".program-block")];
  if (!blocks.length) {
    return;
  }

  const activeToken = nextRunToken();
  isRunning = true;
  hideCompletionOverlay();
  resetLightTiles();
  if (playButton) {
    playButton.classList.add("is-running");
  }
  clearExecutingHighlights();
  trackRunStart();

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (getRunToken() !== activeToken) {
      isRunning = false;
      clearExecutingHighlights();
      trackRunEnd(false);
      return;
    }
    block.classList.add("executing");
    let result = { ok: true };
    if (block.dataset.blockType === "forward") {
      result = await moveForward(activeToken);
    }
    if (block.dataset.blockType === "backward") {
      result = await moveBackward(activeToken);
    }
    if (block.dataset.blockType === "turn-left") {
      result = turnLeft();
    }
    if (block.dataset.blockType === "turn-right") {
      result = turnRight();
    }
    if (block.dataset.blockType === "jump") {
      result = await jumpForward(activeToken);
    }
    if (block.dataset.blockType === "light") {
      result = lightCurrentTile();
    }
    if (result?.moved && result.ok && getPlayerState()) {
      recordCoverage(getPlayerState().x, getPlayerState().z);
    }
    trackExecutionStep(block.dataset.blockType, result, index);
    await delay(getExecutionDelay());
    block.classList.remove("executing");
  }
  isRunning = false;
  clearExecutingHighlights();
  const success = getLightTileList().length > 0 && getLightTileList().every((tile) => tile.isLit);
  trackRunEnd(success);
}

blockDefinitions.forEach((definition) => {
  toolboxStrip.appendChild(createToolboxBlock(definition));
});

programArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  const draggedItem = document.querySelector(".program-block.dragging");
  if (draggedItem && programArea.contains(draggedItem)) {
    event.dataTransfer.dropEffect = "move";
    const afterElement = getDragAfterElement(programArea, event.clientY);
    if (!afterElement) {
      programArea.appendChild(draggedItem);
    } else if (afterElement !== draggedItem) {
      programArea.insertBefore(draggedItem, afterElement);
    }
  } else {
    event.dataTransfer.dropEffect = "copy";
  }
  programArea.classList.add("drag-over");
});

programArea.addEventListener("dragleave", () => {
  programArea.classList.remove("drag-over");
});

programArea.addEventListener("drop", (event) => {
  event.preventDefault();
  programArea.classList.remove("drag-over");
  const draggedItem = document.querySelector(".program-block.dragging");
  if (draggedItem && programArea.contains(draggedItem)) {
    return;
  }
  const blockId = event.dataTransfer.getData("text/plain");
  addProgramBlock(blockId);
});

toolboxPanel.addEventListener("dragover", (event) => {
  event.preventDefault();
  toolboxPanel.classList.add("drag-over");
  event.dataTransfer.dropEffect = "move";
});

toolboxPanel.addEventListener("dragleave", () => {
  toolboxPanel.classList.remove("drag-over");
});

toolboxPanel.addEventListener("drop", (event) => {
  event.preventDefault();
  toolboxPanel.classList.remove("drag-over");
  const draggedItem = document.querySelector(".program-block.dragging");
  if (draggedItem) {
    const index = [...programArea.querySelectorAll(".program-block")].indexOf(draggedItem);
    trackProgramEdit("remove", draggedItem.dataset.blockType, { index });
    draggedItem.remove();
  }
});

window.addEventListener("resize", resizeRenderer);
window.addEventListener("beforeunload", () => {
  endAnalyticsSession("reload");
});

const levelMapPaths = {
  1: "data/maps/level_map_01.json",
  2: "data/maps/level_map_02.json",
  3: "data/maps/level_map_03.json",
  4: "data/maps/level_map_04.json",
  5: "data/maps/level_map_05.json",
  6: "data/maps/level_map_06.json",
};

const PROGRESSION_STORAGE_KEY = "lightbot-threejs-progression";
const totalLevels = Object.keys(levelMapPaths).length;

function loadProgressionMap() {
  try {
    const stored = localStorage.getItem(PROGRESSION_STORAGE_KEY);
    if (!stored) {
      return {};
    }
    const parsed = JSON.parse(stored);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch (error) {
    console.warn("Unable to read progression data.", error);
    return {};
  }
}

function saveProgressionMap(progressMap) {
  try {
    localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(progressMap));
  } catch (error) {
    console.warn("Unable to save progression data.", error);
  }
}

function getUnlockedLevelForPlayer(playerId) {
  if (!playerId) {
    return 1;
  }
  const progressMap = loadProgressionMap();
  const unlocked = Number.parseInt(progressMap[playerId] ?? "1", 10);
  if (Number.isNaN(unlocked)) {
    return 1;
  }
  return Math.min(Math.max(unlocked, 1), totalLevels);
}

function setUnlockedLevelForPlayer(playerId, unlockedLevel) {
  if (!playerId) {
    return;
  }
  const progressMap = loadProgressionMap();
  progressMap[playerId] = Math.min(Math.max(unlockedLevel, 1), totalLevels);
  saveProgressionMap(progressMap);
}

function applyLevelButtonState(mode) {
  if (!levelButtons.length) {
    return;
  }
  const unlockedLevel =
    mode === "progression" ? getUnlockedLevelForPlayer(analyticsState.currentPlayerId) : totalLevels;
  levelButtons.forEach((button) => {
    const level = Number.parseInt(button.dataset.level, 10);
    const shouldDisable = mode === "progression" && level > unlockedLevel;
    button.disabled = shouldDisable;
  });
}

function updateModeHint(mode) {
  if (!modeHint) {
    return;
  }
  if (mode === "progression") {
    const unlockedLevel = getUnlockedLevelForPlayer(analyticsState.currentPlayerId);
    modeHint.textContent = t("start.modeHint.progression", { level: unlockedLevel });
  } else if (mode === "free") {
    modeHint.textContent = t("start.modeHint.free");
  } else {
    modeHint.textContent = t("start.modeHint.default");
  }
}

function setSelectionMode(mode) {
  currentSelectionMode = mode;
  if (levelSelectionPanel) {
    if (mode) {
      levelSelectionPanel.classList.remove("is-hidden");
    } else {
      levelSelectionPanel.classList.add("is-hidden");
    }
  }
  updateModeHint(mode);
  if (mode) {
    applyLevelButtonState(mode);
  }
}

function updateNextLevelButton() {
  if (!nextLevelButton) {
    return;
  }
  const nextLevel = currentLevelNumber ? currentLevelNumber + 1 : null;
  if (!nextLevel || !levelMapPaths[nextLevel]) {
    nextLevelButton.hidden = true;
    return;
  }
  nextLevelButton.hidden = false;
  nextLevelButton.textContent = t("completion.nextLevel", { level: nextLevel });
}

async function startLevel(level) {
  const mapPath = levelMapPaths[level];
  if (!mapPath) {
    return;
  }
  if (!analyticsState.currentPlayerId) {
    openPlayerOverlay(t("playerOverlay.selectBeforeStart"));
    return;
  }
  resetProgram();
  stopProgram({ resetPosition: true });
  hideCompletionOverlay();
  const mapData = await loadMap(mapPath);
  const levelName = mapData?.levelName ?? t("start.levelButton", { level });
  updateLevelIndicator(levelName);
  startCameraIntro();
  currentLevelMeta = { levelId: `level_${level}`, label: levelName, mapPath };
  currentLevelNumber = level;
  updateNextLevelButton();
  startAnalyticsSession(currentLevelMeta);
  document.body.classList.add("game-started");
}

if (startScreen && levelButtons.length) {
  levelButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const level = Number.parseInt(button.dataset.level, 10);
      await startLevel(level);
    });
  });
}

if (playModeButton) {
  playModeButton.addEventListener("click", async () => {
    const nextLevel = getUnlockedLevelForPlayer(analyticsState.currentPlayerId);
    await startLevel(nextLevel);
  });
}

if (selectModeButton) {
  selectModeButton.addEventListener("click", () => {
    const isSelectionOpen = levelSelectionPanel && !levelSelectionPanel.classList.contains("is-hidden");
    if (currentSelectionMode === "free" && isSelectionOpen) {
      setSelectionMode(null);
      return;
    }
    setSelectionMode("free");
  });
}

if (playButton) {
  playButton.addEventListener("click", () => {
    if (isRunning) {
      stopProgram({ resetPosition: true });
    } else if (playButton.classList.contains("is-running")) {
      stopProgram({ resetPosition: true });
    } else {
      runProgram();
    }
  });
}

if (programToggle) {
  programToggle.addEventListener("click", () => {
    const isCollapsed = programPanel?.classList.contains("is-collapsed");
    setProgramCollapsed(!isCollapsed);
  });
}

if (resetButton) {
  resetButton.addEventListener("click", () => {
    stopProgram({ resetPosition: true });
    resetProgram();
    hideCompletionOverlay();
  });
}

if (backButton) {
  backButton.addEventListener("click", () => {
    stopProgram({ resetPosition: true });
    resetProgram();
    hideCompletionOverlay();
    endAnalyticsSession("menu");
    document.body.classList.remove("game-started");
    if (currentSelectionMode) {
      updateModeHint(currentSelectionMode);
      applyLevelButtonState(currentSelectionMode);
    }
  });
}

if (continueLevelButton) {
  continueLevelButton.addEventListener("click", () => {
    hideCompletionOverlay();
  });
}

if (nextLevelButton) {
  nextLevelButton.addEventListener("click", async () => {
    if (!currentLevelNumber) {
      return;
    }
    const nextLevel = currentLevelNumber + 1;
    if (!levelMapPaths[nextLevel]) {
      hideCompletionOverlay();
      return;
    }
    await startLevel(nextLevel);
  });
}

if (chooseLevelButton) {
  chooseLevelButton.addEventListener("click", () => {
    hideCompletionOverlay();
    stopProgram({ resetPosition: true });
    resetProgram();
    endAnalyticsSession("menu");
    document.body.classList.remove("game-started");
    setSelectionMode("free");
  });
}

settingsOpenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openSettingsOverlay();
  });
});

if (aboutButton) {
  aboutButton.addEventListener("click", () => {
    openAboutOverlay();
  });
}

if (settingsCloseButton) {
  settingsCloseButton.addEventListener("click", () => {
    closeSettingsOverlay();
  });
}

if (aboutCloseButton) {
  aboutCloseButton.addEventListener("click", () => {
    closeAboutOverlay();
  });
}

if (settingsOverlay) {
  settingsOverlay.addEventListener("click", (event) => {
    if (event.target === settingsOverlay) {
      closeSettingsOverlay();
    }
  });
}

if (aboutOverlay) {
  aboutOverlay.addEventListener("click", (event) => {
    if (event.target === aboutOverlay) {
      closeAboutOverlay();
    }
  });
}

if (ghostColorInput) {
  ghostColorInput.addEventListener("input", () => {
    settingsState.ghostColor = ghostColorInput.value;
    setGhostColor(settingsState.ghostColor);
    saveSettings(settingsState);
  });
}

if (languageSelect) {
  languageSelect.addEventListener("change", () => {
    settingsState.language = languageSelect.value;
    setLanguage(settingsState.language);
    settingsState.language = getCurrentLanguage();
    languageSelect.value = settingsState.language;
    saveSettings(settingsState);
  });
}

if (compactCommandsToggle) {
  compactCommandsToggle.addEventListener("change", () => {
    settingsState.compactCommands = compactCommandsToggle.checked;
    setCompactProgram(settingsState.compactCommands);
    saveSettings(settingsState);
  });
}

setCompletionCallback(() => {
  showCompletionOverlay();
  if (currentLevelNumber) {
    const unlocked = getUnlockedLevelForPlayer(analyticsState.currentPlayerId);
    if (currentLevelNumber + 1 > unlocked) {
      setUnlockedLevelForPlayer(analyticsState.currentPlayerId, currentLevelNumber + 1);
    }
  }
  updateNextLevelButton();
});

initAnalyticsUI();
updatePlayerStatus();
document.addEventListener("lightbot:player-change", () => {
  if (currentSelectionMode) {
    updateModeHint(currentSelectionMode);
    applyLevelButtonState(currentSelectionMode);
  }
});
updateModeHint(null);
renderAnalyticsScreen();
resizeRenderer();
loadMap(levelMapPaths[1]).then((mapData) => {
  const levelName = mapData?.levelName ?? t("start.levelButton", { level: 1 });
  updateLevelIndicator(levelName);
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }
  if (document.body.classList.contains("game-started")) {
    return;
  }
  let handled = false;
  if (levelSelectionPanel && !levelSelectionPanel.classList.contains("is-hidden")) {
    setSelectionMode(null);
    handled = true;
  }
  if (playerOverlay && playerOverlay.classList.contains("is-visible")) {
    closePlayerOverlay();
    handled = true;
  }
  if (settingsOverlay && settingsOverlay.classList.contains("is-visible")) {
    closeSettingsOverlay();
    handled = true;
  }
  if (aboutOverlay && aboutOverlay.classList.contains("is-visible")) {
    closeAboutOverlay();
    handled = true;
  }
  if (handled) {
    event.preventDefault();
  }
});
animate();
