const ANALYTICS_STORAGE_KEY = "lightbot_analytics_v1";
const ANALYTICS_VERSION = 1;
const EVENT_LOG_LIMIT = 5000;
const EVENT_STORAGE_ENABLED = true;

let programSnapshotGetter = () => [];
let playerStateGetter = () => null;
let lightTileListGetter = () => [];

export function configureAnalytics({ getProgramSnapshot, getPlayerState, getLightTileList } = {}) {
  if (getProgramSnapshot) {
    programSnapshotGetter = getProgramSnapshot;
  }
  if (getPlayerState) {
    playerStateGetter = getPlayerState;
  }
  if (getLightTileList) {
    lightTileListGetter = getLightTileList;
  }
}

function createEmptyAnalyticsState() {
  return {
    version: ANALYTICS_VERSION,
    currentPlayerId: null,
    players: {},
    sessions: {},
  };
}

function migrateAnalyticsState(state) {
  if (!state || typeof state !== "object") {
    return createEmptyAnalyticsState();
  }
  if (state.version !== ANALYTICS_VERSION) {
    return createEmptyAnalyticsState();
  }
  return {
    version: ANALYTICS_VERSION,
    currentPlayerId: state.currentPlayerId || null,
    players: state.players || {},
    sessions: state.sessions || {},
  };
}

function loadAnalyticsState() {
  const raw = window.localStorage.getItem(ANALYTICS_STORAGE_KEY);
  if (!raw) {
    return createEmptyAnalyticsState();
  }
  try {
    const parsed = JSON.parse(raw);
    return migrateAnalyticsState(parsed);
  } catch (error) {
    return createEmptyAnalyticsState();
  }
}

export function saveAnalyticsState() {
  window.localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analyticsState));
}

export function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function ensurePlayerBuckets(playerId, levelId) {
  if (!analyticsState.sessions[playerId]) {
    analyticsState.sessions[playerId] = {};
  }
  if (levelId && !analyticsState.sessions[playerId][levelId]) {
    analyticsState.sessions[playerId][levelId] = [];
  }
}

export function getPlayerDisplayName(player) {
  if (!player) {
    return "Unknown";
  }
  return player.nickname ? `${player.name} (${player.nickname})` : player.name;
}

function createMetricsSnapshot() {
  return {
    totalTimeMs: 0,
    editingTimeMs: 0,
    executionTimeMs: 0,
    runAttempts: 0,
    successfulAttempt: null,
    finalProgramLength: 0,
    programEdits: {
      adds: 0,
      removes: 0,
      reorders: 0,
      total: 0,
      timeToFirstRunMs: null,
      editsBeforeFirstRun: 0,
    },
    mistakesByBlockType: {
      forward: 0,
      backward: 0,
      jump: 0,
      light: 0,
      "turn-left": 0,
      "turn-right": 0,
    },
    movementFailuresByReason: {
      OUT_OF_BOUNDS: 0,
      HEIGHT_MISMATCH: 0,
      NO_TILE: 0,
      UNKNOWN: 0,
      NOT_ON_LIGHT_TILE: 0,
    },
    coverage: {
      visitCounts: {},
      numUniqueTilesVisited: 0,
      numRevisits: 0,
    },
  };
}

function getProgramSnapshot() {
  return programSnapshotGetter();
}

export function areAllLightsLit() {
  const lightTiles = lightTileListGetter();
  return lightTiles.length > 0 && lightTiles.every((tile) => tile.isLit);
}

export let analyticsState = loadAnalyticsState();
let activeSession = null;

export function startAnalyticsSession(levelMeta) {
  if (!analyticsState.currentPlayerId) {
    return null;
  }
  if (activeSession && !activeSession.endedAt) {
    endAnalyticsSession("menu");
  }
  const sessionStartPerf = performance.now();
  activeSession = {
    id: createId("s"),
    playerId: analyticsState.currentPlayerId,
    levelId: levelMeta.levelId,
    levelLabel: levelMeta.label,
    mapPath: levelMeta.mapPath,
    startedAt: Date.now(),
    endedAt: null,
    endReason: null,
    metrics: createMetricsSnapshot(),
    events: [],
    eventLimitReached: false,
    sessionStartPerf,
    lastStateChange: sessionStartPerf,
    isExecuting: false,
    firstRunAt: null,
    lastExecutedBlockType: null,
    attemptHadFailure: false,
  };

  const playerState = playerStateGetter();
  if (playerState) {
    recordCoverage(playerState.x, playerState.z);
  }
  return activeSession;
}

function getSessionTime() {
  if (!activeSession) {
    return 0;
  }
  return Math.round(performance.now() - activeSession.sessionStartPerf);
}

function logAnalyticsEvent(type, payload) {
  if (!activeSession || !EVENT_STORAGE_ENABLED || activeSession.eventLimitReached) {
    return;
  }
  if (activeSession.events.length >= EVENT_LOG_LIMIT) {
    activeSession.eventLimitReached = true;
    return;
  }
  activeSession.events.push({ type, ...payload });
}

function accumulateSessionTime() {
  if (!activeSession) {
    return;
  }
  const now = performance.now();
  const elapsed = now - activeSession.lastStateChange;
  if (activeSession.isExecuting) {
    activeSession.metrics.executionTimeMs += elapsed;
  } else {
    activeSession.metrics.editingTimeMs += elapsed;
  }
  activeSession.lastStateChange = now;
}

function setExecutionState(isExecuting) {
  if (!activeSession || activeSession.isExecuting === isExecuting) {
    return;
  }
  accumulateSessionTime();
  activeSession.isExecuting = isExecuting;
}

export function recordCoverage(x, z) {
  if (!activeSession) {
    return;
  }
  const key = `${x},${z}`;
  const coverage = activeSession.metrics.coverage;
  if (coverage.visitCounts[key]) {
    coverage.visitCounts[key] += 1;
    coverage.numRevisits += 1;
  } else {
    coverage.visitCounts[key] = 1;
  }
}

function finalizeCoverageStats() {
  if (!activeSession) {
    return;
  }
  const coverage = activeSession.metrics.coverage;
  coverage.numUniqueTilesVisited = Object.keys(coverage.visitCounts).length;
}

export function trackProgramEdit(type, blockType, details = {}) {
  if (!activeSession) {
    return;
  }
  const edits = activeSession.metrics.programEdits;
  if (type === "add") {
    edits.adds += 1;
  }
  if (type === "remove") {
    edits.removes += 1;
  }
  if (type === "move") {
    edits.reorders += 1;
  }
  edits.total += 1;
  if (!activeSession.firstRunAt) {
    edits.editsBeforeFirstRun += 1;
  }
  logAnalyticsEvent(type === "add" ? "EDIT_ADD" : type === "remove" ? "EDIT_REMOVE" : "EDIT_MOVE", {
    t: getSessionTime(),
    blockType,
    ...details,
  });
}

export function trackRunStart() {
  if (!activeSession) {
    return;
  }
  activeSession.metrics.runAttempts += 1;
  activeSession.attemptHadFailure = false;
  if (!activeSession.firstRunAt) {
    activeSession.firstRunAt = getSessionTime();
    activeSession.metrics.programEdits.timeToFirstRunMs = activeSession.firstRunAt;
  }
  setExecutionState(true);
  logAnalyticsEvent("RUN_START", {
    t: getSessionTime(),
    attempt: activeSession.metrics.runAttempts,
    programSnapshot: getProgramSnapshot(),
  });
}

export function trackExecutionStep(blockType, result, stepIndex) {
  if (!activeSession) {
    return;
  }
  const reason = result?.reason || null;
  const ok = result?.ok !== false;
  const attempt = activeSession.metrics.runAttempts;
  activeSession.lastExecutedBlockType = blockType;
  if (!ok) {
    activeSession.metrics.mistakesByBlockType[blockType] += 1;
    activeSession.metrics.movementFailuresByReason[reason || "UNKNOWN"] += 1;
    activeSession.attemptHadFailure = true;
  }
  const playerState = playerStateGetter();
  logAnalyticsEvent("EXEC", {
    t: getSessionTime(),
    attempt,
    stepIndex,
    blockType,
    ok,
    reason: reason || undefined,
    x: playerState ? playerState.x : undefined,
    z: playerState ? playerState.z : undefined,
    dir: playerState ? playerState.direction : undefined,
  });
}

export function trackRunEnd(success) {
  if (!activeSession) {
    return;
  }
  setExecutionState(false);
  if (success && activeSession.metrics.successfulAttempt === null) {
    activeSession.metrics.successfulAttempt = activeSession.metrics.runAttempts;
  }
  if (!success && !activeSession.attemptHadFailure && activeSession.lastExecutedBlockType) {
    activeSession.metrics.mistakesByBlockType[activeSession.lastExecutedBlockType] += 1;
    activeSession.metrics.movementFailuresByReason.UNKNOWN += 1;
  }
  const lightTiles = lightTileListGetter();
  logAnalyticsEvent("RUN_END", {
    t: getSessionTime(),
    attempt: activeSession.metrics.runAttempts,
    success,
    litCount: lightTiles.filter((tile) => tile.isLit).length,
    totalLights: lightTiles.length,
  });
}

export function endAnalyticsSession(endReason) {
  if (!activeSession || activeSession.endedAt) {
    return;
  }
  accumulateSessionTime();
  activeSession.endedAt = Date.now();
  activeSession.endReason = endReason;
  activeSession.metrics.totalTimeMs = activeSession.endedAt - activeSession.startedAt;
  activeSession.metrics.finalProgramLength = getProgramSnapshot().length;
  finalizeCoverageStats();
  logAnalyticsEvent("SESSION_END", {
    t: getSessionTime(),
    endReason,
  });

  const sessionSummary = {
    id: activeSession.id,
    playerId: activeSession.playerId,
    levelId: activeSession.levelId,
    levelLabel: activeSession.levelLabel,
    mapPath: activeSession.mapPath,
    startedAt: activeSession.startedAt,
    endedAt: activeSession.endedAt,
    endReason: activeSession.endReason,
    metrics: activeSession.metrics,
    finalProgram: getProgramSnapshot(),
    events: EVENT_STORAGE_ENABLED ? activeSession.events : [],
  };

  ensurePlayerBuckets(activeSession.playerId, activeSession.levelId);
  analyticsState.sessions[activeSession.playerId][activeSession.levelId].push(sessionSummary);
  saveAnalyticsState();
  activeSession = null;
}

export function summarizePlayerSessions(playerId) {
  const sessionMap = analyticsState.sessions[playerId] || {};
  const levelIds = Object.keys(sessionMap).sort();
  const allSessions = levelIds.flatMap((levelId) => sessionMap[levelId].map((session) => ({ ...session })));

  const overall = {
    sessions: allSessions.length,
    completions: allSessions.filter((session) => session.endReason === "completed").length,
    avgTotalTimeMs: 0,
    avgExecutionTimeMs: 0,
    avgEditingTimeMs: 0,
    avgAttempts: 0,
    avgProgramLength: 0,
  };

  if (allSessions.length) {
    overall.avgTotalTimeMs =
      allSessions.reduce((sum, session) => sum + session.metrics.totalTimeMs, 0) / allSessions.length;
    overall.avgExecutionTimeMs =
      allSessions.reduce((sum, session) => sum + session.metrics.executionTimeMs, 0) / allSessions.length;
    overall.avgEditingTimeMs =
      allSessions.reduce((sum, session) => sum + session.metrics.editingTimeMs, 0) / allSessions.length;
    overall.avgAttempts =
      allSessions.reduce((sum, session) => sum + session.metrics.runAttempts, 0) / allSessions.length;
    overall.avgProgramLength =
      allSessions.reduce((sum, session) => sum + session.metrics.finalProgramLength, 0) / allSessions.length;
  }

  const levelStats = levelIds.map((levelId) => {
    const sessions = sessionMap[levelId] || [];
    const completions = sessions.filter((session) => session.endReason === "completed").length;
    const avg = (field) =>
      sessions.length ? sessions.reduce((sum, session) => sum + field(session), 0) / sessions.length : 0;
    const attemptHistogram = sessions.reduce((hist, session) => {
      const attempts = session.metrics.runAttempts || 0;
      if (attempts > 0) {
        hist[attempts] = (hist[attempts] || 0) + 1;
      }
      return hist;
    }, {});
    const mistakesByBlockType = sessions.reduce((acc, session) => {
      Object.entries(session.metrics.mistakesByBlockType).forEach(([block, count]) => {
        acc[block] = (acc[block] || 0) + count;
      });
      return acc;
    }, {});
    const failureReasons = sessions.reduce((acc, session) => {
      Object.entries(session.metrics.movementFailuresByReason).forEach(([reason, count]) => {
        acc[reason] = (acc[reason] || 0) + count;
      });
      return acc;
    }, {});
    return {
      levelId,
      label: sessions[0]?.levelLabel || levelId,
      sessions,
      totalSessions: sessions.length,
      completions,
      completionRate: sessions.length ? completions / sessions.length : 0,
      avgTotalTimeMs: avg((session) => session.metrics.totalTimeMs),
      avgExecutionTimeMs: avg((session) => session.metrics.executionTimeMs),
      avgEditingTimeMs: avg((session) => session.metrics.editingTimeMs),
      avgAttempts: avg((session) => session.metrics.runAttempts),
      avgProgramLength: avg((session) => session.metrics.finalProgramLength),
      attemptHistogram,
      mistakesByBlockType,
      failureReasons,
      planningRatio: avg((session) =>
        session.metrics.runAttempts ? session.metrics.programEdits.total / session.metrics.runAttempts : 0,
      ),
    };
  });

  return {
    overall,
    levelStats,
  };
}

export function formatDuration(ms) {
  if (!ms && ms !== 0) {
    return "-";
  }
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remaining}s` : `${remaining}s`;
}

export function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }
  return `${Math.round(value * 100)}%`;
}

export function formatDateTime(timestamp) {
  if (!timestamp) {
    return "-";
  }
  return new Date(timestamp).toLocaleString();
}
