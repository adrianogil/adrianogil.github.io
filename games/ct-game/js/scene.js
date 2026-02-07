import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("#scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#6c625c");
scene.fog = new THREE.Fog("#6c625c", 10, 45);

const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
camera.position.set(12, 12, 12);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(3.5, 2, 3.5);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 18, 8);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ color: "#5c5652", roughness: 0.95 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;
scene.add(ground);

const gridHelper = new THREE.GridHelper(50, 50, 0x3a6ea5, 0x223055);
gridHelper.position.y = -0.49;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.35;
scene.add(gridHelper);

const generatedMapTiles = [];
const lightTileList = [];
const lightTilesByPosition = new Map();
let player = null;
let currentMap = null;
let playerState = null;
const tileHeight = 1;
let maxMapHeight = 0;
let completionTimer = null;
let onCompletion = null;
let cameraIntroToken = 0;

const tileGeometry = new THREE.BoxGeometry(1, 1, 1);
const tileEdgeGeometry = new THREE.EdgesGeometry(tileGeometry);
const tileEdgeMaterial = new THREE.LineBasicMaterial({ color: 0x0b1b33, transparent: true, opacity: 0.7 });

export function setCompletionCallback(callback) {
  onCompletion = callback;
}

export function cancelCompletionTimer() {
  if (completionTimer) {
    window.clearTimeout(completionTimer);
    completionTimer = null;
  }
}

export function getPlayerState() {
  return playerState;
}

export function getLightTileList() {
  return lightTileList;
}

export function getTileMaterial(heightLevel) {
  const hue = 0.58 - heightLevel * 0.04;
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(hue, 0.4, 0.7),
    roughness: 0.4,
    metalness: 0.1,
  });
}

function clearMap() {
  generatedMapTiles.forEach((tile) => {
    scene.remove(tile);
    if (tile.geometry) {
      tile.geometry.dispose();
    }
    if (Array.isArray(tile.material)) {
      tile.material.forEach((mat) => mat.dispose());
    } else if (tile.material) {
      tile.material.dispose();
    }
  });

  generatedMapTiles.length = 0;
  lightTileList.length = 0;
  lightTilesByPosition.clear();
  cancelCompletionTimer();
  maxMapHeight = 0;

  if (player) {
    scene.remove(player);
    player.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    player = null;
  }
  playerState = null;
}

function addFace(positions, v0, v1, v2) {
  positions.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
}

function createGhostGeometry({ sides, heightSegments, radius, height, waveAmplitude, waveCount }) {
  const positions = [];
  const rings = [];

  for (let y = 0; y <= heightSegments; y += 1) {
    const v = y / heightSegments;
    const phi = Math.PI * 0.5 * v;
    const cy = Math.sin(phi) * radius;
    const ringRadius = Math.cos(phi) * radius;
    const ring = [];

    for (let i = 0; i < sides; i += 1) {
      const angle = (i / sides) * Math.PI * 2;
      const x = Math.cos(angle) * ringRadius;
      const z = Math.sin(angle) * ringRadius;
      ring.push(new THREE.Vector3(x, cy + height - radius, z));
    }

    rings.push(ring);
  }

  for (let y = 0; y < heightSegments; y += 1) {
    for (let i = 0; i < sides; i += 1) {
      const curr = rings[y][i];
      const next = rings[y][(i + 1) % sides];
      const currUp = rings[y + 1][i];
      const nextUp = rings[y + 1][(i + 1) % sides];

      addFace(positions, currUp, next, curr);
      addFace(positions, currUp, nextUp, next);
    }
  }

  const topY = height - radius;
  for (let i = 0; i < sides; i += 1) {
    const a0 = (i / sides) * Math.PI * 2;
    const a1 = ((i + 1) / sides) * Math.PI * 2;

    const y0 = Math.sin(a0 * waveCount) * waveAmplitude;
    const y1 = Math.sin(a1 * waveCount) * waveAmplitude;

    const p0 = new THREE.Vector3(Math.cos(a0) * radius, y0, Math.sin(a0) * radius);
    const p1 = new THREE.Vector3(Math.cos(a1) * radius, y1, Math.sin(a1) * radius);
    const top0 = new THREE.Vector3(p0.x, topY, p0.z);
    const top1 = new THREE.Vector3(p1.x, topY, p1.z);

    addFace(positions, top0, top1, p0);
    addFace(positions, top1, p1, p0);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function createEyeMesh({ name, radius, segments, color }) {
  const geometry = new THREE.CircleGeometry(radius, segments);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  return mesh;
}

function buildPacmanGhost(params) {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: params.bodyColor,
    emissive: params.bodyColor,
    emissiveIntensity: 0.2,
    roughness: 0.4,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const geometry = createGhostGeometry(params);
  const bodyMesh = new THREE.Mesh(geometry, bodyMaterial);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  const eyeRadius = params.radius * 0.2;
  const pupilRadius = eyeRadius * 0.4;
  const segments = 24;
  const eyeOffsetY = params.height - params.radius * 0.6;
  const eyeOffsetZ = params.radius * 0.95;
  const eyeOffsetX = params.radius * 0.3;

  const leftEye = createEyeMesh({ name: "leftEye", radius: eyeRadius, segments, color: "white" });
  leftEye.position.set(-eyeOffsetX, eyeOffsetY, eyeOffsetZ);
  const rightEye = createEyeMesh({ name: "rightEye", radius: eyeRadius, segments, color: "white" });
  rightEye.position.set(eyeOffsetX, eyeOffsetY, eyeOffsetZ);

  const leftPupil = createEyeMesh({ name: "leftPupil", radius: pupilRadius, segments, color: "black" });
  leftPupil.position.set(-eyeOffsetX, eyeOffsetY, eyeOffsetZ + 0.02);
  const rightPupil = createEyeMesh({ name: "rightPupil", radius: pupilRadius, segments, color: "black" });
  rightPupil.position.set(eyeOffsetX, eyeOffsetY, eyeOffsetZ + 0.02);

  group.add(leftEye, rightEye, leftPupil, rightPupil);

  group.userData.idle = {
    bobAmplitude: 0.06,
    bobSpeed: 2.1,
    pupilRangeX: eyeRadius * 0.18,
    pupilRangeY: eyeRadius * 0.12,
    pupilSpeed: 1.6,
    blinkDuration: 180,
    nextBlinkAt: performance.now() + 1200,
    blinkStart: null,
    isBlinking: false,
    eyeTargets: {
      leftEye,
      rightEye,
      leftPupil,
      rightPupil,
    },
    eyeBasePositions: {
      leftEye: leftEye.position.clone(),
      rightEye: rightEye.position.clone(),
      leftPupil: leftPupil.position.clone(),
      rightPupil: rightPupil.position.clone(),
    },
  };

  return group;
}

function rotationForDirection(direction) {
  switch (direction) {
    case "U":
      return -Math.PI / 2;
    case "D":
      return Math.PI / 2;
    case "L":
      return Math.PI;
    case "R":
    default:
      return 0;
  }
}

function extractStartDirection(tileInfo) {
  const match = tileInfo.match(/S([DURL])/);
  return match ? match[1] : null;
}

function getTileHeightAt(x, z) {
  if (!currentMap || !currentMap[x] || !currentMap[x][z]) {
    return null;
  }
  const height = Number.parseInt(currentMap[x][z][0], 10);
  return Number.isNaN(height) ? null : height;
}

function getCameraOffsetFromPlayer(direction, angleDegrees = 30) {
  const { dx, dz } = getDirectionDelta(direction);
  const forward = new THREE.Vector2(dx, dz);
  if (forward.lengthSq() === 0) {
    forward.set(0, 1);
  }
  forward.normalize();
  const angle = THREE.MathUtils.degToRad(angleDegrees);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const rotated = new THREE.Vector2(
    forward.x * cos - forward.y * sin,
    forward.x * sin + forward.y * cos,
  );
  return rotated;
}

function getCameraDistance() {
  if (!currentMap) {
    return 8;
  }
  const width = currentMap.length;
  const depth = currentMap[0]?.length ?? 0;
  return Math.max(width, depth) * 0.8 + 4;
}

function getCurrentTileHeight() {
  if (!playerState) {
    return null;
  }
  return getTileHeightAt(playerState.x, playerState.z);
}

function isWithinBounds(x, z) {
  if (!currentMap) {
    return false;
  }
  return x >= 0 && z >= 0 && x < currentMap.length && z < currentMap[0].length;
}

function setPlayerPosition(x, z, height) {
  const baseY = height * tileHeight - 0.4 + playerState.yOffset;
  player.position.set(x, baseY, z);
  playerState.baseY = baseY;
  playerState.x = x;
  playerState.z = z;
}

function animatePlayerMove(x, z, height, { token } = {}) {
  return new Promise((resolve) => {
    const start = player.position.clone();
    const endY = height * tileHeight - 0.4 + playerState.yOffset;
    const end = new THREE.Vector3(x, endY, z);
    let startTime = null;
    if (playerState) {
      playerState.isMoving = true;
      resetGhostIdle();
    }
    function step(timestamp) {
      if (token !== undefined && runToken !== token) {
        if (playerState) {
          playerState.isMoving = false;
        }
        resolve(false);
        return;
      }
      if (startTime === null) {
        startTime = timestamp;
      }
      const progress = Math.min((timestamp - startTime) / movementDuration, 1);
      player.position.lerpVectors(start, end, progress);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setPlayerPosition(x, z, height);
        if (playerState) {
          playerState.isMoving = false;
        }
        resolve(true);
      }
    }
    requestAnimationFrame(step);
  });
}

export function updatePlayerPosition(x, z, { animate = false, token } = {}) {
  const height = getTileHeightAt(x, z);
  if (!player || height === null) {
    return false;
  }
  if (!animate) {
    setPlayerPosition(x, z, height);
    return true;
  }
  return animatePlayerMove(x, z, height, { token });
}

function generateHeightMap(heightMapMatrix) {
  clearMap();

  if (!heightMapMatrix) {
    return;
  }

  currentMap = heightMapMatrix;
  maxMapHeight = 0;

  for (let i = 0; i < heightMapMatrix.length; i += 1) {
    for (let j = 0; j < heightMapMatrix[i].length; j += 1) {
      const tileInfo = heightMapMatrix[i][j];
      if (!tileInfo || tileInfo.length === 0) {
        continue;
      }

      const height = Number.parseInt(tileInfo[0], 10);
      if (Number.isNaN(height)) {
        continue;
      }
      maxMapHeight = Math.max(maxMapHeight, height);

      for (let h = 0; h < height; h += 1) {
        const tileMaterial = getTileMaterial(height);
        const tile = new THREE.Mesh(tileGeometry, tileMaterial);
        tile.position.set(i, h * tileHeight, j);
        tile.castShadow = true;
        tile.receiveShadow = true;
        scene.add(tile);
        generatedMapTiles.push(tile);

        const tileEdges = new THREE.LineSegments(tileEdgeGeometry, tileEdgeMaterial);
        tileEdges.position.copy(tile.position);
        scene.add(tileEdges);
        generatedMapTiles.push(tileEdges);
      }

      if (tileInfo.includes("S")) {
        const ghostParams = {
          sides: 18,
          heightSegments: 5,
          radius: 0.45,
          height: 1.15,
          waveAmplitude: 0.08,
          waveCount: 4,
          bodyColor: "#ff5b7f",
        };
        player = buildPacmanGhost(ghostParams);
        player.scale.setScalar(0.65);
        const yOffset = ghostParams.waveAmplitude;
        player.position.set(i, height * tileHeight - 0.4 + yOffset, j);
        const startDirection = extractStartDirection(tileInfo) || "R";
        player.rotation.y = rotationForDirection(startDirection);
        playerState = {
          x: i,
          z: j,
          direction: startDirection,
          startX: i,
          startZ: j,
          startDirection,
          yOffset,
          baseY: player.position.y,
          isMoving: false,
        };
        player.castShadow = true;
        scene.add(player);
      }

      if (tileInfo.includes("L")) {
        const dimEmissive = 0.08;
        const dimLight = 0.12;
        const brightEmissive = 1.8;
        const brightLight = 2.2;
        const lightMaterial = new THREE.MeshStandardMaterial({
          color: "#ffcf66",
          emissive: "#ffcf66",
          emissiveIntensity: dimEmissive,
        });
        const lightCube = new THREE.Mesh(tileGeometry, lightMaterial);
        const lightHeight = 0.02;
        const topSurfaceY = (height - 1) * tileHeight + tileHeight / 2;
        const overlayOffset = 0.001;
        lightCube.scale.set(1, lightHeight, 1);
        lightCube.position.set(i, topSurfaceY + lightHeight / 2 + overlayOffset, j);
        lightCube.castShadow = true;
        scene.add(lightCube);
        generatedMapTiles.push(lightCube);

        const glow = new THREE.PointLight(0xffd37a, dimLight, 6, 2);
        glow.position.set(i, topSurfaceY + lightHeight + overlayOffset, j);
        scene.add(glow);
        generatedMapTiles.push(glow);

        const key = `${i},${j}`;
        const lightTile = {
          key,
          x: i,
          z: j,
          mesh: lightCube,
          glow,
          dimEmissive,
          brightEmissive,
          dimLight,
          brightLight,
          isLit: false,
          animStart: null,
          animDuration: 1200,
        };
        lightTileList.push(lightTile);
        lightTilesByPosition.set(key, lightTile);
      }
    }
  }
}

export async function loadMap(mapPath) {
  const response = await fetch(mapPath);
  const mapData = await response.json();
  generateHeightMap(mapData.map);
}

export function startCameraIntro() {
  if (!playerState || !player || !currentMap) {
    return;
  }

  cameraIntroToken += 1;
  const introToken = cameraIntroToken;
  const target = player.position.clone();
  const offsetDirection = getCameraOffsetFromPlayer(playerState.direction, 30);
  const distance = getCameraDistance() + 3;
  const offsetX = offsetDirection.x * distance;
  const offsetZ = offsetDirection.y * distance;
  const startY = 0;
  const endY = (maxMapHeight + 4) * tileHeight;
  const startPosition = new THREE.Vector3(target.x + offsetX, startY, target.z + offsetZ);
  const endPosition = new THREE.Vector3(target.x + offsetX, endY, target.z + offsetZ);
  const duration = 900;
  controls.enabled = false;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  let startTime = null;

  function step(timestamp) {
    if (introToken !== cameraIntroToken) {
      return;
    }
    if (startTime === null) {
      startTime = timestamp;
    }
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = easeOutCubic(progress);
    camera.position.lerpVectors(startPosition, endPosition, eased);
    controls.target.copy(target);
    camera.lookAt(target);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      controls.enabled = true;
    }
  }

  camera.position.copy(startPosition);
  controls.target.copy(target);
  camera.lookAt(target);
  requestAnimationFrame(step);
}

export function resizeRenderer() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

export function animate() {
  updateGhostIdle(performance.now());
  controls.update();
  updateLightAnimations();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

const executionDelay = 400;
const movementDuration = 900;
let runToken = 0;

export function getRunToken() {
  return runToken;
}

export function nextRunToken() {
  runToken += 1;
  return runToken;
}

function getDirectionDelta(direction) {
  switch (direction) {
    case "U":
      return { dx: -1, dz: 0 };
    case "D":
      return { dx: 1, dz: 0 };
    case "L":
      return { dx: 0, dz: -1 };
    case "R":
    default:
      return { dx: 0, dz: 1 };
  }
}

async function moveByDelta(dx, dz, token) {
  if (!playerState) {
    return false;
  }
  const nextX = playerState.x + dx;
  const nextZ = playerState.z + dz;
  if (!isWithinBounds(nextX, nextZ)) {
    return false;
  }
  return updatePlayerPosition(nextX, nextZ, { animate: true, token });
}

function canMoveToSameHeight(nextX, nextZ) {
  const currentHeight = getCurrentTileHeight();
  const nextHeight = getTileHeightAt(nextX, nextZ);
  if (currentHeight === null || nextHeight === null) {
    return false;
  }
  return currentHeight === nextHeight;
}

function getNextPosition(isBackward = false) {
  if (!playerState) {
    return null;
  }
  const { dx, dz } = getDirectionDelta(playerState.direction);
  const multiplier = isBackward ? -1 : 1;
  const nextX = playerState.x + dx * multiplier;
  const nextZ = playerState.z + dz * multiplier;
  return { nextX, nextZ };
}

export async function moveForward(token) {
  if (!playerState) {
    return { ok: false, reason: "UNKNOWN", moved: false };
  }
  const nextPosition = getNextPosition();
  if (!nextPosition) {
    return { ok: false, reason: "UNKNOWN", moved: false };
  }
  const { nextX, nextZ } = nextPosition;
  if (!isWithinBounds(nextX, nextZ)) {
    return { ok: false, reason: "OUT_OF_BOUNDS", moved: false };
  }
  const nextHeight = getTileHeightAt(nextX, nextZ);
  if (nextHeight === null) {
    return { ok: false, reason: "NO_TILE", moved: false };
  }
  if (!canMoveToSameHeight(nextX, nextZ)) {
    return { ok: false, reason: "HEIGHT_MISMATCH", moved: false };
  }
  const moved = await moveByDelta(nextX - playerState.x, nextZ - playerState.z, token);
  return { ok: moved, reason: moved ? null : "UNKNOWN", moved };
}

export async function moveBackward(token) {
  if (!playerState) {
    return { ok: false, reason: "UNKNOWN", moved: false };
  }
  const nextPosition = getNextPosition(true);
  if (!nextPosition) {
    return { ok: false, reason: "UNKNOWN", moved: false };
  }
  const { nextX, nextZ } = nextPosition;
  if (!isWithinBounds(nextX, nextZ)) {
    return { ok: false, reason: "OUT_OF_BOUNDS", moved: false };
  }
  const nextHeight = getTileHeightAt(nextX, nextZ);
  if (nextHeight === null) {
    return { ok: false, reason: "NO_TILE", moved: false };
  }
  if (!canMoveToSameHeight(nextX, nextZ)) {
    return { ok: false, reason: "HEIGHT_MISMATCH", moved: false };
  }
  const moved = await moveByDelta(nextX - playerState.x, nextZ - playerState.z, token);
  return { ok: moved, reason: moved ? null : "UNKNOWN", moved };
}

function animateJump(duration = 500, peakHeight = 0.8, { token } = {}) {
  if (!player) {
    return Promise.resolve(false);
  }
  const startY = player.position.y;
  return new Promise((resolve) => {
    let startTime = null;
    if (playerState) {
      playerState.isMoving = true;
      resetGhostIdle();
    }
    function step(timestamp) {
      if (token !== undefined && runToken !== token) {
        player.position.y = startY;
        if (playerState) {
          playerState.isMoving = false;
          playerState.baseY = startY;
        }
        resolve(false);
        return;
      }
      if (startTime === null) {
        startTime = timestamp;
      }
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const arc = Math.sin(progress * Math.PI);
      player.position.y = startY + arc * peakHeight;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        player.position.y = startY;
        if (playerState) {
          playerState.isMoving = false;
          playerState.baseY = startY;
        }
        resolve(true);
      }
    }
    requestAnimationFrame(step);
  });
}

function updateGhostIdle(now) {
  if (!player || !playerState || playerState.isMoving) {
    return;
  }
  const idleData = player.userData?.idle;
  if (!idleData || playerState.baseY === undefined) {
    return;
  }
  const t = now * 0.001;
  const bob = Math.sin(t * idleData.bobSpeed) * idleData.bobAmplitude;
  player.position.y = playerState.baseY + bob;

  const {
    eyeTargets: { leftEye, rightEye, leftPupil, rightPupil },
    eyeBasePositions,
  } = idleData;
  const pupilOffsetX = Math.sin(t * idleData.pupilSpeed) * idleData.pupilRangeX;
  const pupilOffsetY = Math.cos(t * idleData.pupilSpeed * 0.8) * idleData.pupilRangeY;

  leftPupil.position.set(
    eyeBasePositions.leftPupil.x + pupilOffsetX,
    eyeBasePositions.leftPupil.y + pupilOffsetY,
    eyeBasePositions.leftPupil.z,
  );
  rightPupil.position.set(
    eyeBasePositions.rightPupil.x + pupilOffsetX,
    eyeBasePositions.rightPupil.y + pupilOffsetY,
    eyeBasePositions.rightPupil.z,
  );

  if (!idleData.isBlinking && now > idleData.nextBlinkAt) {
    idleData.isBlinking = true;
    idleData.blinkStart = now;
  }

  let blinkScaleY = 1;
  if (idleData.isBlinking && idleData.blinkStart !== null) {
    const blinkProgress = (now - idleData.blinkStart) / idleData.blinkDuration;
    if (blinkProgress >= 1) {
      idleData.isBlinking = false;
      idleData.blinkStart = null;
      idleData.nextBlinkAt = now + 1400 + Math.random() * 1600;
    } else {
      const blinkEase = Math.sin(blinkProgress * Math.PI);
      blinkScaleY = 1 - blinkEase * 0.85;
    }
  }

  leftEye.scale.y = blinkScaleY;
  rightEye.scale.y = blinkScaleY;
  leftPupil.scale.y = blinkScaleY;
  rightPupil.scale.y = blinkScaleY;
}

function resetGhostIdle() {
  if (!playerState || !player) {
    return;
  }
  const idleData = player.userData?.idle;
  if (!idleData) {
    return;
  }
  const {
    eyeTargets: { leftEye, rightEye, leftPupil, rightPupil },
    eyeBasePositions,
  } = idleData;

  leftEye.scale.y = 1;
  rightEye.scale.y = 1;
  leftPupil.scale.y = 1;
  rightPupil.scale.y = 1;

  leftPupil.position.copy(eyeBasePositions.leftPupil);
  rightPupil.position.copy(eyeBasePositions.rightPupil);

  idleData.isBlinking = false;
  idleData.blinkStart = null;
  idleData.nextBlinkAt = performance.now() + 1400 + Math.random() * 1600;
}

export async function jumpForward(token) {
  if (!playerState) {
    return { ok: false, reason: "UNKNOWN", moved: false };
  }
  const nextPosition = getNextPosition();
  if (!nextPosition) {
    return { ok: false, reason: "UNKNOWN", moved: false };
  }
  const { nextX, nextZ } = nextPosition;
  if (!isWithinBounds(nextX, nextZ)) {
    return { ok: false, reason: "OUT_OF_BOUNDS", moved: false };
  }
  const currentHeight = getCurrentTileHeight();
  const nextHeight = getTileHeightAt(nextX, nextZ);
  if (currentHeight === null || nextHeight === null) {
    return { ok: false, reason: "NO_TILE", moved: false };
  }
  const heightDiff = Math.abs(currentHeight - nextHeight);
  if (heightDiff >= 2) {
    await animateJump(500, 0.8, { token });
    return { ok: true, reason: null, moved: false };
  }
  const moved = await moveByDelta(nextX - playerState.x, nextZ - playerState.z, token);
  return { ok: moved, reason: moved ? null : "UNKNOWN", moved };
}

function applyTurn(direction) {
  if (!playerState || !player) {
    return { ok: false, reason: "UNKNOWN" };
  }
  const directions = ["R", "D", "L", "U"];
  const currentIndex = directions.indexOf(playerState.direction);
  if (currentIndex === -1) {
    return { ok: false, reason: "UNKNOWN" };
  }
  const nextIndex = (currentIndex + direction + directions.length) % directions.length;
  playerState.direction = directions[nextIndex];
  player.rotation.y = rotationForDirection(playerState.direction);
  return { ok: true };
}

export function turnLeft() {
  return applyTurn(-1);
}

export function turnRight() {
  return applyTurn(1);
}

export function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function lightCurrentTile() {
  if (!playerState) {
    return { ok: false, reason: "UNKNOWN" };
  }
  const key = `${playerState.x},${playerState.z}`;
  const tile = lightTilesByPosition.get(key);
  if (!tile) {
    return { ok: false, reason: "NOT_ON_LIGHT_TILE" };
  }
  if (tile.isLit) {
    return { ok: true };
  }
  tile.isLit = true;
  tile.animStart = performance.now();
  if (lightTileList.length && lightTileList.every((item) => item.isLit)) {
    cancelCompletionTimer();
    completionTimer = window.setTimeout(() => {
      if (onCompletion) {
        onCompletion();
      }
      completionTimer = null;
    }, 2000);
  }
  return { ok: true };
}

export function updateLightAnimations() {
  if (!lightTileList.length) {
    return;
  }
  const now = performance.now();
  lightTileList.forEach((tile) => {
    if (!tile.isLit) {
      return;
    }
    if (tile.animStart === null) {
      tile.mesh.material.emissiveIntensity = tile.brightEmissive;
      tile.glow.intensity = tile.brightLight;
      return;
    }
    const elapsed = now - tile.animStart;
    const progress = Math.min(elapsed / tile.animDuration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const flicker = Math.sin(progress * Math.PI * 6) * (1 - progress) * 0.32;
    const pulse = Math.sin(progress * Math.PI) * 0.15;
    tile.mesh.material.emissiveIntensity =
      tile.dimEmissive + (tile.brightEmissive - tile.dimEmissive) * ease + flicker + pulse;
    tile.glow.intensity =
      tile.dimLight + (tile.brightLight - tile.dimLight) * ease + flicker * 0.65 + pulse;
    if (progress >= 1) {
      tile.animStart = null;
    }
  });
}

export function resetPlayerPosition() {
  if (!playerState || !player) {
    return;
  }
  updatePlayerPosition(playerState.startX, playerState.startZ);
  playerState.direction = playerState.startDirection;
  player.rotation.y = rotationForDirection(playerState.direction);
}

export function resetLightTiles() {
  lightTileList.forEach((tile) => {
    tile.isLit = false;
    tile.animStart = null;
    tile.mesh.material.emissiveIntensity = tile.dimEmissive;
    tile.glow.intensity = tile.dimLight;
  });
}

export function getExecutionDelay() {
  return executionDelay;
}
