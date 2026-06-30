import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';

// ─── Teacher Character Builder ───────────────────────────────────────────────
function buildTeacher(scene) {
  const root = new THREE.Group();
  root.name = 'teacher';

  const M = {
    skin:      new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.75, metalness: 0 }),
    hair:      new THREE.MeshStandardMaterial({ color: 0x1a0e05, roughness: 0.9,  metalness: 0 }),
    blazer:    new THREE.MeshStandardMaterial({ color: 0x1a2d6e, roughness: 0.62, metalness: 0.12 }),
    blazerIn:  new THREE.MeshStandardMaterial({ color: 0x223387, roughness: 0.7,  metalness: 0.08 }),
    shirt:     new THREE.MeshStandardMaterial({ color: 0xeef2ff, roughness: 0.95, metalness: 0 }),
    pants:     new THREE.MeshStandardMaterial({ color: 0x22232e, roughness: 0.72, metalness: 0.06 }),
    glasses:   new THREE.MeshStandardMaterial({ color: 0x0d0d14, roughness: 0.25, metalness: 0.8 }),
    lens:      new THREE.MeshStandardMaterial({ color: 0x88aaff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.18 }),
    shoe:      new THREE.MeshStandardMaterial({ color: 0x0c0c12, roughness: 0.52, metalness: 0.28 }),
    bookRed:   new THREE.MeshStandardMaterial({ color: 0x8b1a22, roughness: 0.65, metalness: 0.05 }),
    bookPage:  new THREE.MeshStandardMaterial({ color: 0xf2ede0, roughness: 0.95, metalness: 0 }),
    tie:       new THREE.MeshStandardMaterial({ color: 0x3b82d4, roughness: 0.55, metalness: 0.1 }),
    eyeWhite:  new THREE.MeshStandardMaterial({ color: 0xfafcff, roughness: 0.35, metalness: 0 }),
    eyePupil:  new THREE.MeshStandardMaterial({ color: 0x08080f, roughness: 0.2,  metalness: 0.1 }),
    eyeIris:   new THREE.MeshStandardMaterial({ color: 0x2a5a8e, roughness: 0.2,  metalness: 0.1 }),
  };

  // ── HEAD ─────────────────────────────────────────────────────────────────
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 1.85, 0);
  root.add(headPivot);

  const headGroup = new THREE.Group();
  headGroup.position.y = 0.31;
  headPivot.add(headGroup);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.30, 36, 28), M.skin);
  headMesh.scale.y = 1.07;
  headGroup.add(headMesh);

  // Hair top cap
  const hairTop = new THREE.Mesh(
    new THREE.SphereGeometry(0.308, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.46),
    M.hair
  );
  hairTop.rotation.x = Math.PI;
  hairTop.position.y = 0.03;
  headGroup.add(hairTop);

  // Side hair
  [-0.27, 0.27].forEach(x => {
    const sh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.18, 0.09), M.hair);
    sh.position.set(x, -0.03, 0.08);
    headGroup.add(sh);
  });

  // Eyes
  const eyes = {};
  [['left', -0.11], ['right', 0.11]].forEach(([side, x]) => {
    const eg = new THREE.Group();
    eg.position.set(x, 0.065, 0.263);
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.054, 14, 14), M.eyeWhite);
    white.scale.z = 0.60; eg.add(white);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.034, 12, 12), M.eyeIris);
    iris.position.z = 0.025; eg.add(iris);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), M.eyePupil);
    pupil.position.z = 0.035; eg.add(pupil);
    const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.3 }));
    highlight.position.set(0.01, 0.01, 0.044); eg.add(highlight);
    headGroup.add(eg);
    eyes[side] = eg;
  });

  // Eyebrows
  [-0.11, 0.11].forEach(x => {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.016, 0.038), M.hair);
    brow.position.set(x, 0.148, 0.262);
    brow.rotation.z = x < 0 ? 0.1 : -0.1;
    headGroup.add(brow);
  });

  // Nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.034, 10, 10), M.skin);
  nose.scale.set(0.78, 0.72, 0.62);
  nose.position.set(0, -0.02, 0.294);
  headGroup.add(nose);

  // ── GLASSES ────────────────────────────────────────────────────────────
  [-0.11, 0.11].forEach(x => {
    // Frame border
    const frameGeo = new THREE.BoxGeometry(0.118, 0.068, 0.012);
    const frame = new THREE.Mesh(frameGeo, M.glasses);
    frame.position.set(x, 0.065, 0.29);
    headGroup.add(frame);
    // Lens (inset)
    const lensGeo = new THREE.BoxGeometry(0.10, 0.052, 0.006);
    const lens = new THREE.Mesh(lensGeo, M.lens);
    lens.position.set(x, 0.065, 0.293);
    headGroup.add(lens);
  });
  // Nose bridge
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.008, 0.008), M.glasses);
  bridge.position.set(0, 0.065, 0.29);
  headGroup.add(bridge);
  // Temple arms
  [-0.168, 0.168].forEach(x => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.006, 0.28), M.glasses);
    arm.position.set(x, 0.065, 0.15);
    headGroup.add(arm);
  });

  // ── MOUTH ─────────────────────────────────────────────────────────────
  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, -0.06, 0.29);
  headGroup.add(mouthGroup);

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.038, 0.008, 8, 16, Math.PI),
    M.hair
  );
  smile.rotation.x = Math.PI;
  smile.position.y = 0.022;
  mouthGroup.add(smile);

  // ── NECK ────────────────────────────────────────────────────────────
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.115, 0.2, 16), M.skin);
  neck.position.set(0, 1.75, 0);
  root.add(neck);

  // ── TORSO ───────────────────────────────────────────────────────────
  const torso = new THREE.Group();
  torso.position.set(0, 1.22, 0);
  root.add(torso);

  // Shirt body
  const shirtBody = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.70, 0.30), M.shirt);
  torso.add(shirtBody);

  // Blazer sides (cover left + right, leave shirt visible in center)
  const bL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.70, 0.32), M.blazer);
  bL.position.set(-0.155, 0, 0);
  torso.add(bL);

  const bR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.70, 0.32), M.blazer);
  bR.position.set(0.155, 0, 0);
  torso.add(bR);

  // Lapel (V-notch) — shirt stripe
  const lapelL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.28, 0.325), M.shirt);
  lapelL.position.set(-0.055, 0.2, 0);
  torso.add(lapelL);
  const lapelR = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.28, 0.325), M.shirt);
  lapelR.position.set(0.055, 0.2, 0);
  torso.add(lapelR);

  // Tie
  const tieBody = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.36, 0.022), M.tie);
  tieBody.position.set(0, 0.08, 0.163);
  torso.add(tieBody);
  const tieKnot = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.065, 0.03), M.tie);
  tieKnot.position.set(0, 0.265, 0.163);
  torso.add(tieKnot);

  // Blazer back shoulder
  const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.14, 0.33), M.blazer);
  shoulder.position.set(0, 0.36, 0);
  torso.add(shoulder);

  // ── LEFT ARM (raised — holding book) ────────────────────────────────
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.36, 1.22, 0);
  root.add(leftArm);

  const lUpArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.082, 0.42, 14), M.blazer);
  lUpArm.position.y = -0.21;
  leftArm.add(lUpArm);

  const lElbow = new THREE.Group();
  lElbow.position.set(0, -0.44, 0);
  leftArm.add(lElbow);

  // Forearm angled up
  const lForeArm = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.072, 0.38, 14), M.blazer);
  lForeArm.rotation.x = -1.0;
  lForeArm.position.set(0, -0.1, 0.2);
  lElbow.add(lForeArm);

  // Hand
  const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.088, 0.065), M.skin);
  lHand.rotation.x = -1.0;
  lHand.position.set(0, -0.3, 0.44);
  lElbow.add(lHand);

  // ── BOOK ──────────────────────────────────────────────────────────
  const bookGroup = new THREE.Group();
  bookGroup.rotation.x = -1.0;
  bookGroup.position.set(0, -0.36, 0.5);
  lElbow.add(bookGroup);

  const bookBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.23, 0.044), M.bookRed);
  bookGroup.add(bookBody);
  const pages = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.22, 0.036), M.bookPage);
  pages.position.z = 0.006;
  bookGroup.add(pages);
  // Book lines
  for (let i = 0; i < 4; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.009, 0.002),
      new THREE.MeshStandardMaterial({ color: 0xeac87a, roughness: 0.6 }));
    line.position.set(0, 0.05 - i * 0.03, 0.024);
    bookGroup.add(line);
  }

  // ── RIGHT ARM (relaxed, slight gesture) ─────────────────────────────
  const rightArm = new THREE.Group();
  rightArm.position.set(0.36, 1.22, 0);
  root.add(rightArm);

  const rUpArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.082, 0.42, 14), M.blazer);
  rUpArm.position.y = -0.21;
  rightArm.add(rUpArm);

  const rElbow = new THREE.Group();
  rElbow.position.set(0, -0.44, 0);
  rightArm.add(rElbow);

  const rForeArm = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.072, 0.38, 14), M.blazer);
  rForeArm.rotation.x = -0.3;
  rForeArm.position.set(0, -0.14, 0.06);
  rElbow.add(rForeArm);

  const rHand = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.088, 0.065), M.skin);
  rHand.rotation.x = -0.3;
  rHand.position.set(0, -0.37, 0.14);
  rElbow.add(rHand);

  // ── LEGS ──────────────────────────────────────────────────────────
  [-0.14, 0.14].forEach(x => {
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.095, 0.65, 14), M.pants);
    upper.position.set(x, 0.66, 0);
    root.add(upper);
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.078, 0.58, 14), M.pants);
    lower.position.set(x, 0.22, 0);
    root.add(lower);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.26), M.shoe);
    shoe.position.set(x, -0.08, 0.04);
    root.add(shoe);
  });

  scene.add(root);
  return { root, headPivot, headGroup, eyes, mouthGroup, leftArm, rightArm };
}

// ─── Classroom Background Builder ────────────────────────────────────────────
function buildClassroom(scene) {
  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshStandardMaterial({ color: 0x1a2035, roughness: 0.88, metalness: 0.04 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.08;
  scene.add(floor);

  // Floor grid lines
  const gridHelper = new THREE.GridHelper(10, 20, 0x2a3a5a, 0x2a3a5a);
  gridHelper.position.y = -0.07;
  scene.add(gridHelper);

  // Back wall
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 6),
    new THREE.MeshStandardMaterial({ color: 0x0c1628, roughness: 0.95, metalness: 0 })
  );
  wall.position.set(0, 2.5, -3.2);
  scene.add(wall);

  // Chalkboard
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 2.0, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x0e2218, roughness: 0.92, metalness: 0.04 })
  );
  board.position.set(0, 2.8, -3.0);
  scene.add(board);

  // Chalkboard frame
  const frameGeo = new THREE.BoxGeometry(4.7, 2.22, 0.06);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x8a6020, roughness: 0.6, metalness: 0.3 });
  const boardFrame = new THREE.Mesh(frameGeo, frameMat);
  boardFrame.position.set(0, 2.8, -3.08);
  scene.add(boardFrame);

  // Chalk "writing" (white horizontal planes)
  for (let i = 0; i < 3; i++) {
    const chalk = new THREE.Mesh(
      new THREE.BoxGeometry(2.5 - i * 0.4, 0.015, 0.002),
      new THREE.MeshStandardMaterial({ color: 0xddeeff, roughness: 0.98, transparent: true, opacity: 0.55 })
    );
    chalk.position.set(-0.2 + i * 0.15, 2.72 + i * 0.3, -2.95);
    scene.add(chalk);
  }

  // Teacher desk
  const deskTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.06, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x4a3010, roughness: 0.72, metalness: 0.05 })
  );
  deskTop.position.set(0, 0.78, 1.2);
  scene.add(deskTop);

  // Desk legs
  [[-0.82, 0.9], [0.82, 0.9], [-0.82, 1.5], [0.82, 1.5]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.78, 8),
      new THREE.MeshStandardMaterial({ color: 0x382408, roughness: 0.7, metalness: 0.1 })
    );
    leg.position.set(x, 0.39, z);
    scene.add(leg);
  });

  // Paper on desk
  const paper = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.005, 0.45),
    new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.96 })
  );
  paper.position.set(-0.3, 0.815, 1.15);
  scene.add(paper);

  // Small lamp on desk
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.06, 10),
    new THREE.MeshStandardMaterial({ color: 0x8a7020, roughness: 0.5, metalness: 0.6 }));
  lampBase.position.set(0.6, 0.81, 1.15);
  scene.add(lampBase);

  const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x8a7020, roughness: 0.4, metalness: 0.7 }));
  lampPost.position.set(0.6, 1.01, 1.15);
  scene.add(lampPost);

  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.12, 12, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xf4e080, roughness: 0.6, metalness: 0.1, transparent: true, opacity: 0.88, side: THREE.DoubleSide }));
  lampShade.position.set(0.6, 1.24, 1.15);
  scene.add(lampShade);

  // Soft glow from lamp
  const lampLight = new THREE.PointLight(0xf8e890, 0.8, 2.5);
  lampLight.position.set(0.6, 1.28, 1.1);
  scene.add(lampLight);
}

// ─── Main TutorScene Component ───────────────────────────────────────────────
const TutorScene = forwardRef(function TutorScene({ tutorState = 'idle' }, ref) {
  const mountRef  = useRef(null);
  const stateRef  = useRef({ tutorState });
  const animRef   = useRef({});
  const rafRef    = useRef(null);

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    stateRef.current.tutorState = tutorState;
  }, [tutorState]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer ──────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    el.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070e1c);
    scene.fog = new THREE.FogExp2(0x070e1c, 0.065);

    // ── Camera ────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(42, el.clientWidth / el.clientHeight, 0.1, 60);
    camera.position.set(0, 1.65, 3.8);
    camera.lookAt(0, 1.45, 0);

    // ── Lighting ──────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x7090cc, 0.55));

    const keyLight = new THREE.DirectionalLight(0xb8d4f8, 1.55);
    keyLight.position.set(-2, 4, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x4a6aaa, 0.55);
    fillLight.position.set(3, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x2244cc, 0.45);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    const boardLight = new THREE.PointLight(0x8ab4f8, 0.6, 5);
    boardLight.position.set(0, 3.2, -2.5);
    scene.add(boardLight);

    // ── Build World ───────────────────────────────────────────────────
    buildClassroom(scene);
    const { root, headPivot, headGroup, eyes, mouthGroup, leftArm, rightArm } = buildTeacher(scene);

    // Center character above desk area
    root.position.set(0, 0, 0.6);

    animRef.current = { root, headPivot, headGroup, eyes, mouthGroup, leftArm, rightArm };

    // ── Animation Loop ─────────────────────────────────────────────────
    let t = 0;
    let blinkTimer = 0;
    let blinkState = 0;  // 0=open, 1=closing, 2=opening

    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      t += 0.012;

      const state = stateRef.current.tutorState;
      const { root, headPivot, headGroup, mouthGroup, leftArm, rightArm } = animRef.current;

      // ── Idle: gentle breathing bob ──
      if (state === 'idle') {
        root.position.y    = Math.sin(t * 0.9) * 0.012;
        headPivot.rotation.y = Math.sin(t * 0.45) * 0.05;
        headPivot.rotation.x = 0;
        headPivot.rotation.z = Math.sin(t * 0.38) * 0.018;
        mouthGroup.scale.y   = 1;
      }

      // ── Thinking: head tilts, looks up ──
      if (state === 'thinking') {
        root.position.y      = Math.sin(t * 0.5) * 0.006;
        headPivot.rotation.y = Math.sin(t * 0.3) * 0.09;
        headPivot.rotation.x = -0.08 + Math.sin(t * 0.4) * 0.02;
        headPivot.rotation.z = 0.06;
        mouthGroup.scale.y   = 1;
      }

      // ── Talking: head bob + mouth open ──
      if (state === 'talking') {
        root.position.y    = Math.sin(t * 1.4) * 0.014;
        headPivot.rotation.x = Math.sin(t * 2.2) * 0.04;
        headPivot.rotation.y = Math.sin(t * 0.8) * 0.07;
        headPivot.rotation.z = Math.sin(t * 1.1) * 0.022;
        const mouthOpen = Math.max(0, Math.sin(t * 2.8)) * 0.7 + 0.3;
        mouthGroup.scale.y = mouthOpen;
        // Slight right arm gesture
        if (rightArm) rightArm.rotation.z = -Math.sin(t * 1.4) * 0.08 - 0.05;
      } else {
        if (rightArm) rightArm.rotation.z = 0;
      }

      // ── Listening: lean slightly forward ──
      if (state === 'listening') {
        root.position.y      = Math.sin(t * 0.7) * 0.01;
        root.rotation.x      = 0.04;
        headPivot.rotation.x = 0.06;
        headPivot.rotation.y = Math.sin(t * 0.4) * 0.04;
        headPivot.rotation.z = 0.025;
        mouthGroup.scale.y   = 1;
      } else {
        root.rotation.x = 0;
      }

      // ── Blink ──
      blinkTimer += 0.012;
      if (blinkTimer > 4.5 + Math.random() * 2) {
        blinkState = 1;
        blinkTimer = 0;
      }
      if (blinkState === 1) {
        const lidGeo = new THREE.SphereGeometry(0.058, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
        // Eyes are not separate lid meshes in this build — simulate via scale
        [eyes.left, eyes.right].forEach(eg => {
          if (eg) eg.scale.y = Math.max(0.1, eg.scale.y - 0.22);
          if (eg && eg.scale.y <= 0.1) blinkState = 2;
        });
      }
      if (blinkState === 2) {
        [eyes.left, eyes.right].forEach(eg => {
          if (eg) eg.scale.y = Math.min(1, eg.scale.y + 0.22);
          if (eg && eg.scale.y >= 1) blinkState = 0;
        });
      }

      // Camera subtle sway
      camera.position.x = Math.sin(t * 0.18) * 0.04;
      camera.position.y = 1.65 + Math.sin(t * 0.22) * 0.015;
      camera.lookAt(0, 1.45, 0);

      renderer.render(scene, camera);
    }
    animate();

    // ── Resize Handler ────────────────────────────────────────────────
    function onResize() {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    }
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    />
  );
});

export default TutorScene;
