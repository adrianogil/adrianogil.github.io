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
import { initAnalyticsUI, openPlayerOverlay, renderAnalyticsScreen, updatePlayerStatus } from "./js/analytics-ui.js";
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

const blockDefinitions = [
  {
    id: "forward",
    label: "Forward",
    icon: "assets/arrow_directions_vertical.png",
  },
  {
    id: "backward",
    label: "Backward",
    icon: "assets/arrow_directions_vertical.png",
    rotate: 180,
  },
  {
    id: "turn-left",
    label: "Turn Left",
    icon: "assets/arrow_directions_turn.png",
    rotate: -90,
  },
  {
    id: "turn-right",
    label: "Turn Right",
    icon: "assets/arrow_directions_turn.png",
    rotate: 90,
  },
  {
    id: "jump",
    label: "Jump",
    icon: "assets/arrow_directions_jump.png",
  },
  {
    id: "light",
    label: "Light",
    icon: "assets/arrow_directions_light.png",
  },
];

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
  image.alt = definition.label;

  const label = document.createElement("span");
  label.textContent = definition.label === "Jump" || definition.label === "Light" ? definition.label : "";

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
  image.alt = definition.label;

  if (definition.rotate) {
    image.style.transform = `rotate(${definition.rotate}deg)`;
  }

  const label = document.createElement("span");
  label.textContent = definition.label;

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
  programToggle.textContent = isCollapsed ? "Show" : "Hide";
}

let isRunning = false;
let currentLevelMeta = null;

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
    openPlayerOverlay("Select a player before running a program.");
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

async function startLevel(level) {
  const mapPath = levelMapPaths[level];
  if (!mapPath) {
    return;
  }
  if (!analyticsState.currentPlayerId) {
    openPlayerOverlay("Select or create a player before starting a level.");
    return;
  }
  resetProgram();
  stopProgram({ resetPosition: true });
  hideCompletionOverlay();
  await loadMap(mapPath);
  startCameraIntro();
  currentLevelMeta = { levelId: `level_${level}`, label: `Level ${level}`, mapPath };
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
  });
}

if (continueLevelButton) {
  continueLevelButton.addEventListener("click", () => {
    hideCompletionOverlay();
  });
}

if (chooseLevelButton) {
  chooseLevelButton.addEventListener("click", () => {
    hideCompletionOverlay();
    stopProgram({ resetPosition: true });
    resetProgram();
    endAnalyticsSession("menu");
    document.body.classList.remove("game-started");
  });
}

setCompletionCallback(() => {
  showCompletionOverlay();
});

initAnalyticsUI();
updatePlayerStatus();
renderAnalyticsScreen();
resizeRenderer();
loadMap(levelMapPaths[1]);
animate();
