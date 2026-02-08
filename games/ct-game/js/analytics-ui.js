import {
  analyticsState,
  createId,
  formatDateTime,
  formatDuration,
  formatPercent,
  getPlayerDisplayName,
  saveAnalyticsState,
  summarizePlayerSessions,
} from "./analytics.js";
import { t } from "./i18n.js";

const playerOverlay = document.querySelector("#player-overlay");
const playerList = document.querySelector("#player-list");
const playerForm = document.querySelector("#player-form");
const playerNameInput = document.querySelector("#player-name");
const identifyPlayerButton = document.querySelector("#identify-player");
const closePlayerOverlayButton = document.querySelector("#close-player-overlay");
const currentPlayerName = document.querySelector("#current-player-name");
const playerOverlayMessage = document.querySelector("#player-overlay-message");
const analyticsButton = document.querySelector("#analytics-button");
const analyticsScreen = document.querySelector("#analytics-screen");
const analyticsBackButton = document.querySelector("#analytics-back");
const analyticsPlayerSelect = document.querySelector("#analytics-player-select");
const analyticsExportButton = document.querySelector("#analytics-export");
const analyticsClearButton = document.querySelector("#analytics-clear");
const analyticsSummary = document.querySelector("#analytics-summary");
const analyticsCharts = document.querySelector("#analytics-charts");
const analyticsLevelList = document.querySelector("#analytics-level-list");
const analyticsDetail = document.querySelector("#analytics-detail");

export function renderPlayerList() {
  if (!playerList) {
    return;
  }
  playerList.replaceChildren();
  const entries = Object.values(analyticsState.players);
  if (!entries.length) {
    const empty = document.createElement("p");
    empty.textContent = t("playerOverlay.empty");
    playerList.appendChild(empty);
    return;
  }
  entries.forEach((playerEntry) => {
    const item = document.createElement("div");
    item.className = "player-item";

    const header = document.createElement("div");
    header.className = "player-item-header";
    const name = document.createElement("strong");
    name.textContent = getPlayerDisplayName(playerEntry);
    header.appendChild(name);

    const meta = document.createElement("span");
    meta.textContent = t("playerOverlay.createdAt", { date: formatDateTime(playerEntry.createdAt) });
    meta.style.fontSize = "0.75rem";
    meta.style.color = "rgba(255,255,255,0.7)";

    const actions = document.createElement("div");
    actions.className = "player-item-actions";
    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "control-button";
    selectButton.textContent =
      analyticsState.currentPlayerId === playerEntry.id ? t("playerOverlay.selected") : t("playerOverlay.select");
    selectButton.disabled = analyticsState.currentPlayerId === playerEntry.id;
    selectButton.addEventListener("click", () => {
      analyticsState.currentPlayerId = playerEntry.id;
      saveAnalyticsState();
      updatePlayerStatus();
      closePlayerOverlay();
      renderPlayerList();
      renderAnalyticsScreen();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "control-button secondary";
    deleteButton.textContent = t("playerOverlay.delete");
    deleteButton.addEventListener("click", () => {
      const confirmed = window.confirm(
        t("playerOverlay.deleteConfirm", { name: getPlayerDisplayName(playerEntry) }),
      );
      if (!confirmed) {
        return;
      }
      delete analyticsState.players[playerEntry.id];
      delete analyticsState.sessions[playerEntry.id];
      if (analyticsState.currentPlayerId === playerEntry.id) {
        analyticsState.currentPlayerId = null;
      }
      saveAnalyticsState();
      updatePlayerStatus();
      renderPlayerList();
      renderAnalyticsScreen();
    });

    actions.append(selectButton, deleteButton);
    item.append(header, meta, actions);
    playerList.appendChild(item);
  });
}

export function openPlayerOverlay(message) {
  if (playerOverlay) {
    playerOverlay.classList.add("is-visible");
  }
  if (playerOverlayMessage && message) {
    playerOverlayMessage.textContent = message;
  }
  renderPlayerList();
}

export function closePlayerOverlay() {
  if (playerOverlay) {
    playerOverlay.classList.remove("is-visible");
  }
}

export function updatePlayerStatus() {
  const player = analyticsState.currentPlayerId ? analyticsState.players[analyticsState.currentPlayerId] : null;
  if (currentPlayerName) {
    currentPlayerName.textContent = player ? getPlayerDisplayName(player) : t("start.player.none");
  }
  if (identifyPlayerButton) {
    identifyPlayerButton.textContent = player ? t("start.player.switch") : t("start.player.identify");
  }
  document.dispatchEvent(
    new CustomEvent("lightbot:player-change", {
      detail: { playerId: analyticsState.currentPlayerId },
    }),
  );
}

function openAnalyticsScreen() {
  if (analyticsScreen) {
    analyticsScreen.classList.add("is-visible");
  }
  renderAnalyticsScreen();
}

function closeAnalyticsScreen() {
  if (analyticsScreen) {
    analyticsScreen.classList.remove("is-visible");
  }
}

export function renderAnalyticsScreen() {
  if (!analyticsPlayerSelect || !analyticsSummary || !analyticsCharts || !analyticsLevelList || !analyticsDetail) {
    return;
  }
  analyticsPlayerSelect.replaceChildren();
  const players = Object.values(analyticsState.players);
  if (!players.length) {
    const option = document.createElement("option");
    option.textContent = t("analytics.noPlayersOption");
    option.value = "";
    analyticsPlayerSelect.appendChild(option);
    analyticsSummary.innerHTML = `<p>${t("analytics.noPlayersPrompt")}</p>`;
    analyticsCharts.innerHTML = `<p>${t("analytics.noSessionsCharts")}</p>`;
    analyticsLevelList.replaceChildren();
    analyticsDetail.replaceChildren();
    return;
  }
  players.forEach((playerEntry) => {
    const option = document.createElement("option");
    option.value = playerEntry.id;
    option.textContent = getPlayerDisplayName(playerEntry);
    analyticsPlayerSelect.appendChild(option);
  });
  const selectedPlayerId = analyticsPlayerSelect.value || analyticsState.currentPlayerId || players[0].id;
  analyticsPlayerSelect.value = selectedPlayerId;

  const summary = summarizePlayerSessions(selectedPlayerId);
  const completionRate = summary.overall.sessions
    ? summary.overall.completions / summary.overall.sessions
    : 0;

  analyticsSummary.innerHTML = `
    <div class="summary-card"><span>${t("analytics.summary.totalSessions")}</span><strong>${summary.overall.sessions}</strong></div>
    <div class="summary-card"><span>${t("analytics.summary.completionRate")}</span><strong>${formatPercent(completionRate)}</strong></div>
    <div class="summary-card"><span>${t("analytics.summary.avgTime")}</span><strong>${formatDuration(summary.overall.avgTotalTimeMs)}</strong></div>
    <div class="summary-card"><span>${t("analytics.summary.avgAttempts")}</span><strong>${summary.overall.avgAttempts.toFixed(1)}</strong></div>
  `;
  renderAnalyticsCharts(summary);

  analyticsLevelList.replaceChildren();
  const header = document.createElement("div");
  header.className = "analytics-level-row header";
  header.innerHTML = `<span>${t("analytics.levelHeader.level")}</span><span>${t("analytics.levelHeader.games")}</span><span>${t("analytics.levelHeader.percent")}</span><span>${t("analytics.levelHeader.avgTime")}</span><span>${t("analytics.levelHeader.avgAttempts")}</span>`;
  analyticsLevelList.appendChild(header);

  if (!summary.levelStats.length) {
    const empty = document.createElement("p");
    empty.className = "analytics-empty";
    empty.textContent = t("analytics.noSessions");
    analyticsLevelList.appendChild(empty);
    analyticsDetail.innerHTML = `<p class="analytics-empty">${t("analytics.selectLevelPrompt")}</p>`;
    return;
  }

  const activeLevelId = analyticsDetail.dataset.levelId || summary.levelStats[0].levelId;
  summary.levelStats.forEach((levelStat) => {
    const row = document.createElement("div");
    row.className = "analytics-level-row";
    if (levelStat.levelId === activeLevelId) {
      row.classList.add("active");
    }
    row.dataset.levelId = levelStat.levelId;
    row.innerHTML = `
      <span>${levelStat.label}</span>
      <span>${levelStat.totalSessions}</span>
      <span>${formatPercent(levelStat.completionRate)}</span>
      <span>${formatDuration(levelStat.avgTotalTimeMs)}</span>
      <span>${levelStat.avgAttempts.toFixed(1)}</span>
    `;
    row.addEventListener("click", () => {
      renderLevelDetail(levelStat);
      [...analyticsLevelList.querySelectorAll(".analytics-level-row")].forEach((item) => {
        item.classList.toggle("active", item.dataset.levelId === levelStat.levelId);
      });
    });
    analyticsLevelList.appendChild(row);
  });

  const defaultLevel = summary.levelStats.find((level) => level.levelId === activeLevelId) || summary.levelStats[0];
  renderLevelDetail(defaultLevel);
}

function renderAnalyticsCharts(summary) {
  if (!analyticsCharts) {
    return;
  }

  if (!summary.levelStats.length) {
    analyticsCharts.innerHTML = `<p>${t("analytics.noLevelData")}</p>`;
    return;
  }

  const maxSessions = Math.max(...summary.levelStats.map((level) => level.totalSessions), 1);
  analyticsCharts.innerHTML = `
    <div class="chart-card">
      <h4>${t("analytics.chart.sessionsByLevel")}</h4>
      <div class="chart-list">
        ${summary.levelStats
          .map(
            (level) => `
          <div class="chart-row">
            <span>${level.label}</span>
            <div class="chart-track">
              <div class="chart-fill" style="width: ${(level.totalSessions / maxSessions) * 100}%"></div>
            </div>
            <strong>${level.totalSessions}</strong>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
    <div class="chart-card">
      <h4>${t("analytics.chart.completionRate")}</h4>
      <div class="chart-list">
        ${summary.levelStats
          .map(
            (level) => `
          <div class="chart-row">
            <span>${level.label}</span>
            <div class="chart-track">
              <div class="chart-fill completion" style="width: ${level.completionRate * 100}%"></div>
            </div>
            <strong>${formatPercent(level.completionRate)}</strong>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderLevelDetail(levelStat) {
  if (!analyticsDetail || !levelStat) {
    return;
  }
  analyticsDetail.dataset.levelId = levelStat.levelId;

  const topMistakes = Object.entries(levelStat.mistakesByBlockType)
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count > 0);
  const failureReasons = Object.entries(levelStat.failureReasons).filter(([, count]) => count > 0);

  const maxMistake = Math.max(...topMistakes.map(([, count]) => count), 1);
  const maxReason = Math.max(...failureReasons.map(([, count]) => count), 1);

  const sessionsSorted = [...levelStat.sessions].sort((a, b) => b.startedAt - a.startedAt);
  const recentSessions = sessionsSorted.slice(0, 6);

  analyticsDetail.innerHTML = `
    <div class="analytics-detail-section">
      <h3>${t("analytics.detail.heading", { level: levelStat.label })}</h3>
      <p>${t("analytics.detail.planningRatio", { ratio: levelStat.planningRatio.toFixed(2) })}</p>
      <p>${t("analytics.detail.avgExecutionTime", { time: formatDuration(levelStat.avgExecutionTimeMs) })}</p>
      <p>${t("analytics.detail.avgEditingTime", { time: formatDuration(levelStat.avgEditingTimeMs) })}</p>
    </div>
    <div class="analytics-detail-section">
      <h4>${t("analytics.detail.topMistakes")}</h4>
      <div class="bar-list" id="mistake-bars"></div>
    </div>
    <div class="analytics-detail-section">
      <h4>${t("analytics.detail.failureReasons")}</h4>
      <div class="bar-list" id="reason-bars"></div>
    </div>
    <div class="analytics-detail-section">
      <h4>${t("analytics.detail.recentSessions")}</h4>
      <div class="session-list" id="session-list"></div>
      <div class="session-detail" id="session-detail">${t("analytics.detail.selectSession")}</div>
    </div>
  `;

  const mistakeBars = analyticsDetail.querySelector("#mistake-bars");
  if (mistakeBars) {
    mistakeBars.innerHTML = topMistakes.length
      ? topMistakes
          .map(
            ([block, count]) => `
      <div class="bar-row">
        <span>${block}</span>
        <div class="bar-track"><div class="bar-fill" style="width: ${(count / maxMistake) * 100}%"></div></div>
        <span>${count}</span>
      </div>
    `,
          )
          .join("")
      : `<p>${t("analytics.detail.noMistakes")}</p>`;
  }

  const reasonBars = analyticsDetail.querySelector("#reason-bars");
  if (reasonBars) {
    reasonBars.innerHTML = failureReasons.length
      ? failureReasons
          .map(
            ([reason, count]) => `
      <div class="bar-row">
        <span>${reason}</span>
        <div class="bar-track"><div class="bar-fill" style="width: ${(count / maxReason) * 100}%"></div></div>
        <span>${count}</span>
      </div>
    `,
          )
          .join("")
      : `<p>${t("analytics.detail.noFailures")}</p>`;
  }

  const sessionList = analyticsDetail.querySelector("#session-list");
  const sessionDetail = analyticsDetail.querySelector("#session-detail");
  if (!sessionList || !sessionDetail) {
    return;
  }

  sessionList.replaceChildren();
  if (!recentSessions.length) {
    sessionList.textContent = t("analytics.detail.noSessions");
    return;
  }

  recentSessions.forEach((session) => {
    const row = document.createElement("div");
    row.className = "session-row";
    row.dataset.sessionId = session.id;
    row.innerHTML = `
      <strong>${formatDateTime(session.startedAt)}</strong>
      <div class="session-meta">
        <span>${t("analytics.detail.sessionMeta.attempts", { count: session.metrics.runAttempts })}</span>
        <span>${t("analytics.detail.sessionMeta.totalTime", { time: formatDuration(session.metrics.totalTimeMs) })}</span>
        <span>${t("analytics.detail.sessionMeta.completed", {
          status: session.endReason === "completed" ? t("analytics.detail.sessionMeta.yes") : t("analytics.detail.sessionMeta.no"),
        })}</span>
      </div>
    `;
    row.addEventListener("click", () => {
      renderSessionDetail(session);
      [...sessionList.querySelectorAll(".session-row")].forEach((item) => {
        item.classList.toggle("active", item.dataset.sessionId === session.id);
      });
    });
    sessionList.appendChild(row);
  });

  renderSessionDetail(recentSessions[0]);
  sessionList.querySelector(".session-row")?.classList.add("active");
}

function renderSessionDetail(session) {
  const sessionDetail = analyticsDetail.querySelector("#session-detail");
  if (!sessionDetail) {
    return;
  }
  const programBlocks = session.finalProgram || [];
  const coverage = session.metrics.coverage || {};
  const events = session.events || [];

  sessionDetail.innerHTML = `
    <strong>${t("analytics.detail.sessionTitle", { id: session.id })}</strong>
    <div class="session-meta">
      <span>${t("analytics.detail.editingTime", { time: formatDuration(session.metrics.editingTimeMs) })}</span>
      <span>${t("analytics.detail.executionTime", { time: formatDuration(session.metrics.executionTimeMs) })}</span>
      <span>${t("analytics.detail.successfulAttempt", { attempt: session.metrics.successfulAttempt ?? "-" })}</span>
    </div>
    <div>
      <div class="program-chip-list">
        ${programBlocks.length ? programBlocks.map((block) => `<span class="program-chip">${block}</span>`).join("") :
          `<span>${t("analytics.detail.noBlocks")}</span>`}
      </div>
    </div>
    <div>
      <p>${t("analytics.detail.coverage", {
        unique: coverage.numUniqueTilesVisited || 0,
        revisits: coverage.numRevisits || 0,
      })}</p>
    </div>
    <details>
      <summary>${t("analytics.detail.eventLog", { count: events.length })}</summary>
      <pre>${JSON.stringify(events, null, 2)}</pre>
    </details>
  `;
}

function exportPlayerData() {
  const playerId = analyticsPlayerSelect?.value;
  if (!playerId) {
    return;
  }
  const payload = {
    player: analyticsState.players[playerId],
    sessions: analyticsState.sessions[playerId] || {},
    exportedAt: new Date().toISOString(),
    version: analyticsState.version,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `lightbot-analytics-${playerId}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function clearPlayerData() {
  const playerId = analyticsPlayerSelect?.value;
  if (!playerId) {
    return;
  }
  const player = analyticsState.players[playerId];
  const confirmed = window.confirm(
    t("analytics.clearConfirm", { name: getPlayerDisplayName(player) }),
  );
  if (!confirmed) {
    return;
  }
  analyticsState.sessions[playerId] = {};
  saveAnalyticsState();
  renderAnalyticsScreen();
}

export function initAnalyticsUI() {
  if (identifyPlayerButton) {
    identifyPlayerButton.addEventListener("click", () => {
      openPlayerOverlay();
    });
  }

  if (closePlayerOverlayButton) {
    closePlayerOverlayButton.addEventListener("click", () => {
      closePlayerOverlay();
    });
  }

  if (playerOverlay) {
    playerOverlay.addEventListener("click", (event) => {
      if (event.target === playerOverlay) {
        closePlayerOverlay();
      }
    });
  }

  if (playerForm) {
    playerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = playerNameInput?.value.trim();
      if (!name) {
        return;
      }
      const id = createId("p");
      analyticsState.players[id] = {
        id,
        name,
        createdAt: Date.now(),
      };
      analyticsState.currentPlayerId = id;
      saveAnalyticsState();
      playerForm.reset();
      updatePlayerStatus();
      renderPlayerList();
      renderAnalyticsScreen();
      closePlayerOverlay();
    });
  }

  if (analyticsButton) {
    analyticsButton.addEventListener("click", () => {
      openAnalyticsScreen();
    });
  }

  if (analyticsBackButton) {
    analyticsBackButton.addEventListener("click", () => {
      closeAnalyticsScreen();
    });
  }

  if (analyticsPlayerSelect) {
    analyticsPlayerSelect.addEventListener("change", () => {
      renderAnalyticsScreen();
    });
  }

  if (analyticsExportButton) {
    analyticsExportButton.addEventListener("click", () => {
      exportPlayerData();
    });
  }

  if (analyticsClearButton) {
    analyticsClearButton.addEventListener("click", () => {
      clearPlayerData();
    });
  }
}
