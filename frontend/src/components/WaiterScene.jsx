import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';

// ─── Waiter Character Builder ────────────────────────────────────────────────
function buildWaiter(scene) {
  const root = new THREE.Group();
  root.name = 'waiter';

  const mat = {
    skin:      new THREE.MeshStandardMaterial({ color: 0xc8936a, roughness: 0.78, metalness: 0 }),
    shirt:     new THREE.MeshStandardMaterial({ color: 0xf5f0ea, roughness: 0.96, metalness: 0 }),
    suit:      new THREE.MeshStandardMaterial({ color: 0x18182a, roughness: 0.62, metalness: 0.18 }),
    suitLight: new THREE.MeshStandardMaterial({ color: 0x242436, roughness: 0.7,  metalness: 0.1  }),
    hair:      new THREE.MeshStandardMaterial({ color: 0x180c00, roughness: 0.88, metalness: 0 }),
    bowtie:    new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.55, metalness: 0.12 }),
    shoe:      new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.52, metalness: 0.28 }),
    eyeWhite:  new THREE.MeshStandardMaterial({ color: 0xfaf8f5, roughness: 0.35, metalness: 0 }),
    eyePupil:  new THREE.MeshStandardMaterial({ color: 0x080814, roughness: 0.2,  metalness: 0.1  }),
    teeth:     new THREE.MeshStandardMaterial({ color: 0xf0ece0, roughness: 0.65, metalness: 0 }),
    notepad:   new THREE.MeshStandardMaterial({ color: 0xfcf8e8, roughness: 0.97, metalness: 0 }),
    button:    new THREE.MeshStandardMaterial({ color: 0xc8c0a0, roughness: 0.4,  metalness: 0.55 }),
  };

  // ── HEAD ──────────────────────────────────────────────────────────────────
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 1.83, 0);
  root.add(headPivot);

  const headGroup = new THREE.Group();
  headGroup.position.y = 0.33;
  headPivot.add(headGroup);

  // Head sphere (slightly elongated vertically)
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.31, 36, 28), mat.skin);
  headMesh.scale.y = 1.06;
  headGroup.add(headMesh);

  // Hair cap (upper hemisphere)
  const hairMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.318, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.46),
    mat.hair
  );
  hairMesh.rotation.x = Math.PI;
  hairMesh.position.y = 0.025;
  headGroup.add(hairMesh);

  // Side hair strips
  [-0.28, 0.28].forEach(x => {
    const sh = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.19, 0.09), mat.hair);
    sh.position.set(x, -0.04, 0.09);
    headGroup.add(sh);
  });

  // Eyes
  const eyeData = { left: null, right: null };
  [['left', -0.115], ['right', 0.115]].forEach(([side, x]) => {
    const eg = new THREE.Group();
    eg.position.set(x, 0.07, 0.268);

    const white = new THREE.Mesh(new THREE.SphereGeometry(0.058, 14, 14), mat.eyeWhite);
    white.scale.z = 0.62;
    eg.add(white);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.034, 12, 12), mat.eyePupil);
    pupil.position.z = 0.032;
    eg.add(pupil);

    // Iris highlight
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x6688cc, roughness: 0.1, metalness: 0.3 }));
    hl.position.set(0.01, 0.01, 0.045);
    eg.add(hl);

    // Eyelid (for blinking — scale y → 0)
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.062, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), mat.skin);
    lid.rotation.x = Math.PI;
    lid.position.z = 0.01;
    lid.scale.z = 0.5;
    eg.add(lid);

    headGroup.add(eg);
    eyeData[side] = eg;
  });

  // Eyebrows
  [-0.115, 0.115].forEach(x => {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.017, 0.04), mat.hair);
    brow.position.set(x, 0.163, 0.267);
    brow.rotation.z = x < 0 ? 0.18 : -0.18;
    headGroup.add(brow);
  });

  // Nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), mat.skin);
  nose.scale.set(0.8, 0.72, 0.65);
  nose.position.set(0, -0.025, 0.304);
  headGroup.add(nose);

  // ── MOUTH GROUP (animated) ──
  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, -0.11, 0.278);
  headGroup.add(mouthGroup);

  const upperLip = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.024, 0.045), mat.skin);
  upperLip.position.y = 0.016;
  mouthGroup.add(upperLip);

  const lowerLip = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.027, 0.048), mat.skin);
  lowerLip.position.y = -0.019;
  mouthGroup.add(lowerLip);

  const teethTop = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.022, 0.025), mat.teeth);
  teethTop.position.set(0, 0.003, 0.005);
  teethTop.visible = false;
  mouthGroup.add(teethTop);

  // Ears
  [-0.305, 0.305].forEach(x => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.064, 10, 10), mat.skin);
    ear.scale.set(0.44, 0.82, 0.36);
    ear.position.set(x, 0.02, 0.01);
    headGroup.add(ear);
  });

  // ── NECK ──────────────────────────────────────────────────────────────────
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.17, 14), mat.skin);
  neck.position.set(0, 1.83, 0);
  root.add(neck);

  // ── TORSO ────────────────────────────────────────────────────────────────
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 1.35;
  root.add(torsoGroup);

  // Main suit body
  const suitBody = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.83, 0.34), mat.suit);
  torsoGroup.add(suitBody);

  // Shirt front visible center strip
  const shirtFront = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 0.055), mat.shirt);
  shirtFront.position.set(0, 0.02, 0.198);
  torsoGroup.add(shirtFront);

  // Lapels
  [-1, 1].forEach(side => {
    const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.31, 0.058), mat.suit);
    lapel.position.set(side * 0.075, 0.2, 0.198);
    lapel.rotation.z = side * 0.38;
    torsoGroup.add(lapel);
  });

  // Pocket square (left breast)
  const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.025), mat.shirt);
  pocket.position.set(-0.2, 0.31, 0.178);
  torsoGroup.add(pocket);

  // Bow tie
  const bowGroup = new THREE.Group();
  bowGroup.position.set(0, 0.415, 0.185);
  [-0.042, 0.042].forEach(x => {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.038, 0.038), mat.bowtie);
    wing.position.x = x;
    bowGroup.add(wing);
  });
  const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), mat.bowtie);
  bowGroup.add(bowCenter);
  torsoGroup.add(bowGroup);

  // Shirt buttons
  for (let i = 0; i < 3; i++) {
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.018, 8), mat.button);
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0, 0.25 - i * 0.15, 0.205);
    torsoGroup.add(btn);
  }

  // ── ARMS ──────────────────────────────────────────────────────────────────
  // Left arm (relaxed, slight bend)
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.385, 1.73, 0);
  leftArmPivot.rotation.z = 0.13;
  root.add(leftArmPivot);

  const lUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.08, 0.42, 14), mat.suit);
  lUpper.position.y = -0.21;
  leftArmPivot.add(lUpper);

  const lElbowPivot = new THREE.Group();
  lElbowPivot.position.y = -0.42;
  leftArmPivot.add(lElbowPivot);

  const lFore = new THREE.Mesh(new THREE.CylinderGeometry(0.073, 0.065, 0.39, 14), mat.suit);
  lFore.position.y = -0.195;
  lElbowPivot.add(lFore);

  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.073, 14, 14), mat.skin);
  lHand.scale.set(0.87, 0.77, 0.68);
  lHand.position.y = -0.4;
  lElbowPivot.add(lHand);

  // Right arm (bent, holds notepad)
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.385, 1.73, 0);
  rightArmPivot.rotation.z = -0.18;
  rightArmPivot.rotation.x = -0.28;
  root.add(rightArmPivot);

  const rUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.08, 0.42, 14), mat.suit);
  rUpper.position.y = -0.21;
  rightArmPivot.add(rUpper);

  const rElbowPivot = new THREE.Group();
  rElbowPivot.position.y = -0.42;
  rightArmPivot.add(rElbowPivot);

  rElbowPivot.rotation.x = -0.55; // forearm lifted

  const rFore = new THREE.Mesh(new THREE.CylinderGeometry(0.073, 0.065, 0.39, 14), mat.suit);
  rFore.position.y = -0.195;
  rElbowPivot.add(rFore);

  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.073, 14, 14), mat.skin);
  rHand.scale.set(0.87, 0.77, 0.68);
  rHand.position.y = -0.4;
  rElbowPivot.add(rHand);

  // Notepad
  const notepadGroup = new THREE.Group();
  notepadGroup.position.y = -0.46;
  notepadGroup.rotation.x = 0.5;
  rElbowPivot.add(notepadGroup);

  const notepadBody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.19, 0.016), mat.notepad);
  notepadGroup.add(notepadBody);

  for (let i = 0; i < 5; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.007, 0.017),
      new THREE.MeshStandardMaterial({ color: 0x7799bb, roughness: 1 }));
    line.position.y = 0.065 - i * 0.026;
    notepadGroup.add(line);
  }

  // ── WAIST BELT ────────────────────────────────────────────────────────────
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.63, 0.055, 0.36),
    new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.8 }));
  belt.position.y = 0.94;
  root.add(belt);

  // ── LEGS ─────────────────────────────────────────────────────────────────
  const legData = {};
  [['left', -0.18], ['right', 0.18]].forEach(([side, x]) => {
    const lp = new THREE.Group();
    lp.position.set(x, 0.91, 0);
    root.add(lp);

    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.105, 0.49, 14), mat.suit);
    upper.position.y = -0.245;
    lp.add(upper);

    const kp = new THREE.Group();
    kp.position.y = -0.49;
    lp.add(kp);

    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.09, 0.44, 14), mat.suit);
    lower.position.y = -0.22;
    kp.add(lower);

    // Shoe (slightly forward-pointing)
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.31), mat.shoe);
    shoe.position.set(0, -0.49, 0.058);
    kp.add(shoe);

    // Shoe toe cap (rounded front)
    const toecap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), mat.shoe);
    toecap.scale.set(1, 0.54, 0.88);
    toecap.position.set(0, -0.49, 0.19);
    kp.add(toecap);

    legData[side] = { pivot: lp, knee: kp };
  });

  root.position.set(0, 0, 0.5);
  scene.add(root);

  return {
    root,
    headPivot,
    headGroup,
    mouthGroup,
    lowerLip,
    teethTop,
    eyes: eyeData,
    leftArmPivot,
    rightArmPivot,
    lElbowPivot,
    rElbowPivot,
    legs: legData,
    torsoGroup,
  };
}

// ─── Restaurant Background Builder ──────────────────────────────────────────
function buildRestaurant(scene) {
  // Floor (warm dark wood tone)
  const floorGeo = new THREE.PlaneGeometry(24, 24, 20, 20);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.88, metalness: 0.05 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Floor planks (overlay lines for wood texture feel)
  for (let i = -10; i <= 10; i += 1.2) {
    const plank = new THREE.Mesh(
      new THREE.PlaneGeometry(0.03, 24),
      new THREE.MeshStandardMaterial({ color: 0x3d2410, roughness: 1 })
    );
    plank.rotation.x = -Math.PI / 2;
    plank.position.set(i, 0.001, 0);
    scene.add(plank);
  }

  // Back wall
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.95 });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 9), wallMat);
  backWall.position.set(0, 4.5, -9);
  scene.add(backWall);

  // Wainscoting (dark lower wall panel)
  const wainscot = new THREE.Mesh(new THREE.BoxGeometry(24, 1.4, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x2c1a0a, roughness: 0.75, metalness: 0.1 }));
  wainscot.position.set(0, 0.7, -8.95);
  scene.add(wainscot);

  // Side walls
  [-10, 10].forEach((x, i) => {
    const sideWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 9), wallMat);
    sideWall.position.set(x, 4.5, 0);
    sideWall.rotation.y = i === 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(sideWall);
  });

  // Ceiling
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.MeshStandardMaterial({ color: 0xf0ebe0, roughness: 1 })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 5.5;
  scene.add(ceiling);

  // Crown molding at ceiling edge
  const molding = new THREE.Mesh(new THREE.BoxGeometry(24, 0.22, 0.22),
    new THREE.MeshStandardMaterial({ color: 0xe8dfc8, roughness: 0.7 }));
  molding.position.set(0, 5.41, -8.9);
  scene.add(molding);

  // Pendant lights on ceiling
  const pendantPositions = [[-3, 5.3, -4], [3, 5.3, -4], [0, 5.3, -7]];
  pendantPositions.forEach(([x, y, z]) => {
    // Cord
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x222222 }));
    cord.position.set(x, y + 0.25, z);
    scene.add(cord);

    // Shade
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.28, 12, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xc8a050, roughness: 0.6, metalness: 0.4, side: THREE.DoubleSide })
    );
    shade.position.set(x, y, z);
    shade.rotation.x = Math.PI;
    scene.add(shade);

    // Pendant point light
    const pl = new THREE.PointLight(0xfff0aa, 1.2, 6);
    pl.position.set(x, y - 0.1, z);
    scene.add(pl);
  });

  // Tables with diners
  const tableConfigs = [
    { x: -3.5, z: -3.5 }, { x: 3.5, z: -3.5 },
    { x: -4.5, z: -6.5 }, { x: 0, z: -7 }, { x: 4.5, z: -6.5 },
  ];
  tableConfigs.forEach(({ x, z }) => addDiningTable(scene, x, z));

  // Window on back wall (left side)
  addWindow(scene, -4, 3, -8.88);
  addWindow(scene, 4, 3, -8.88);

  // Bar counter (right side background)
  addBar(scene, 7.5, -6);
}

function addDiningTable(scene, x, z) {
  const tableMat = new THREE.MeshStandardMaterial({ color: 0x3a2210, roughness: 0.72, metalness: 0.05 });

  // Table top
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.06, 20), tableMat);
  top.position.set(x, 0.78, z);
  top.castShadow = true;
  top.receiveShadow = true;
  scene.add(top);

  // White tablecloth
  const cloth = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.01, 20),
    new THREE.MeshStandardMaterial({ color: 0xf8f4ee, roughness: 0.98 }));
  cloth.position.set(x, 0.82, z);
  scene.add(cloth);

  // Table leg
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.74, 10), tableMat);
  leg.position.set(x, 0.39, z);
  scene.add(leg);

  // Candle
  const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.14, 8),
    new THREE.MeshStandardMaterial({ color: 0xfcf8ec, emissive: 0xffcc44, emissiveIntensity: 0.4 }));
  candle.position.set(x, 0.9, z);
  scene.add(candle);

  // Candle flame
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xff9900, emissive: 0xff6600, emissiveIntensity: 1.5, transparent: true, opacity: 0.9 }));
  flame.position.set(x, 0.98, z);
  scene.add(flame);

  // Candle warm light
  const cl = new THREE.PointLight(0xffaa22, 0.7, 3.5);
  cl.position.set(x, 1.05, z);
  scene.add(cl);

  // Plates & glasses on table
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.1 });
  [-0.25, 0.25].forEach(ox => {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 14), plateMat);
    plate.position.set(x + ox, 0.84, z);
    scene.add(plate);

    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.22, 10),
      new THREE.MeshStandardMaterial({ color: 0xaaccee, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.65 }));
    glass.position.set(x + ox + 0.22, 0.94, z);
    scene.add(glass);
  });

  // Seated diners
  const skinPalette = [0xf4d5b3, 0xc8965a, 0x7d4e2a, 0xe8c4a0, 0xd4a87a];
  const clothPalette = [0x2c3e50, 0x8e3a59, 0xc0392b, 0x1a5276, 0x0e6655, 0x7d3c98];

  const seatPositions = [
    { dx: -0.6, dz: 0.1, ry: 0.4 },
    { dx: 0.6, dz: -0.1, ry: -0.4 + Math.PI },
  ];

  seatPositions.forEach(({ dx, dz, ry }) => {
    const skinC = skinPalette[Math.floor(Math.random() * skinPalette.length)];
    const clothC = clothPalette[Math.floor(Math.random() * clothPalette.length)];
    addSeatedFigure(scene, x + dx, z + dz, ry, skinC, clothC);
  });
}

function addSeatedFigure(scene, x, z, ry, skinColor, clothColor) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;

  const skinM = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.8 });
  const clothM = new THREE.MeshStandardMaterial({ color: clothColor, roughness: 0.88 });
  const hairColors = [0x1a0a00, 0x4a2c00, 0xaa6622, 0xd4d4d4, 0x080808];
  const hairM = new THREE.MeshStandardMaterial({
    color: hairColors[Math.floor(Math.random() * hairColors.length)], roughness: 0.9
  });

  // Chair
  const chairM = new THREE.MeshStandardMaterial({ color: 0x2c1810, roughness: 0.82 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.4), chairM);
  seat.position.y = 0.5;
  g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.48, 0.04), chairM);
  back.position.set(0, 0.76, -0.18);
  g.add(back);
  [-0.17, 0.17].forEach(xl => {
    [-0.17, 0.17].forEach(zl => {
      const cl = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 6), chairM);
      cl.position.set(xl, 0.25, zl);
      g.add(cl);
    });
  });

  // Body (sitting)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.44, 0.22), clothM);
  body.position.y = 0.96;
  g.add(body);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 14, 14), skinM);
  head.scale.y = 1.05;
  head.position.y = 1.36;
  g.add(head);

  // Hair
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.48),
    hairM
  );
  hair.rotation.x = Math.PI;
  hair.position.y = 1.382;
  g.add(hair);

  // Arms on table
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.35, 8), clothM);
  arm.rotation.z = Math.PI / 2;
  arm.position.set(0.22, 0.83, 0.25);
  g.add(arm);

  scene.add(g);
}

function addWindow(scene, x, y, z) {
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xd4b896, roughness: 0.6, metalness: 0.1 });
  // Frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.1), frameMat);
  frame.position.set(x, y, z);
  scene.add(frame);

  // Glass pane
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.95),
    new THREE.MeshStandardMaterial({
      color: 0x88aabb, roughness: 0.05, metalness: 0.1,
      transparent: true, opacity: 0.4
    }));
  glass.position.set(x, y, z + 0.06);
  scene.add(glass);

  // Window light from outside
  const wl = new THREE.PointLight(0x99ccff, 0.6, 8);
  wl.position.set(x, y, z + 0.5);
  scene.add(wl);
}

function addBar(scene, x, z) {
  const barMat = new THREE.MeshStandardMaterial({ color: 0x2a1505, roughness: 0.65, metalness: 0.12 });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(4, 1.1, 0.8), barMat);
  bar.position.set(x, 0.55, z);
  scene.add(bar);

  // Bar top
  const barTop = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.1, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x1a0a02, roughness: 0.4, metalness: 0.3 }));
  barTop.position.set(x, 1.1, z);
  scene.add(barTop);

  // Bottles on shelf behind bar
  const shelfY = 2.8;
  const bottleColors = [0x2d6a2d, 0xcc4400, 0xaa8800, 0x1a3344];
  for (let i = 0; i < 5; i++) {
    const bc = bottleColors[Math.floor(Math.random() * bottleColors.length)];
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.55, 8),
      new THREE.MeshStandardMaterial({ color: bc, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.8 }));
    bottle.position.set(x - 1.6 + i * 0.8, shelfY, z - 0.2);
    scene.add(bottle);
  }
}

// ─── Lighting Setup ──────────────────────────────────────────────────────────
function setupLighting(scene) {
  // Warm ambient
  scene.add(new THREE.AmbientLight(0xffe8cc, 0.38));

  // Main key light (from upper front-right, like window)
  const key = new THREE.DirectionalLight(0xfff5e0, 1.15);
  key.position.set(4, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.width = 2048;
  key.shadow.mapSize.height = 2048;
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  key.shadow.bias = -0.001;
  scene.add(key);

  // Fill light (left side — warm bounced ceiling light)
  const fill = new THREE.DirectionalLight(0xfff0cc, 0.52);
  fill.position.set(-4, 4, 2);
  scene.add(fill);

  // Rim/backlight (from behind waiter — kitchen warmth)
  const rim = new THREE.DirectionalLight(0xffcc88, 0.38);
  rim.position.set(0, 3, -6);
  scene.add(rim);

  // Overhead spotlight on waiter
  const spotlight = new THREE.SpotLight(0xfff8f0, 2.5, 12, Math.PI * 0.22, 0.35, 1.5);
  spotlight.position.set(0.3, 5, 1.8);
  spotlight.target.position.set(0, 1, 0.5);
  spotlight.castShadow = true;
  scene.add(spotlight);
  scene.add(spotlight.target);
}

// ─── Animation Controller ───────────────────────────────────────────────────
function createAnimationController(character) {
  let state = 'idle';
  let time = 0;
  let blinkTimer = 0;
  let nextBlink = 3.2;
  let blinking = false;
  let blinkProgress = 0;
  let greetTimer = 0;
  let talkPhase = 0;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

  function update(delta) {
    time += delta;
    talkPhase += delta;
    blinkTimer += delta;

    // ── Blinking ────────────────────────────────────────────────
    if (!blinking && blinkTimer >= nextBlink) {
      blinking = true;
      blinkProgress = 0;
      blinkTimer = 0;
      nextBlink = 2.8 + Math.random() * 3.5;
    }
    if (blinking) {
      blinkProgress += delta * 12;
      const blinkCurve = blinkProgress < 0.5
        ? blinkProgress * 2
        : (1 - blinkProgress) * 2;
      const lid = clamp(1 - blinkCurve, 0, 1);
      character.eyes.left.scale.y = Math.max(lid, 0.05);
      character.eyes.right.scale.y = Math.max(lid, 0.05);
      if (blinkProgress >= 1) {
        blinking = false;
        character.eyes.left.scale.y = 1;
        character.eyes.right.scale.y = 1;
      }
    }

    // ── State-based animations ──────────────────────────────────
    if (state === 'idle') {
      // Breathing
      const breath = Math.sin(time * 1.15) * 0.006;
      character.torsoGroup.scale.y = 1 + breath;

      // Gentle head sway
      character.headPivot.rotation.z = Math.sin(time * 0.55) * 0.018;
      character.headPivot.rotation.x = Math.sin(time * 0.38) * 0.01;

      // Subtle weight shift
      character.root.position.x = Math.sin(time * 0.32) * 0.012;

      // Mouth closed
      character.mouthGroup.scale.y = 0.18;
      character.teethTop.visible = false;

      // Arms relaxed
      character.leftArmPivot.rotation.x = Math.sin(time * 0.5) * 0.04;
      character.rightArmPivot.rotation.x = -0.28 + Math.sin(time * 0.5 + 1) * 0.03;
    }

    if (state === 'talking') {
      // Animated mouth
      const mouthAmt = (Math.abs(Math.sin(talkPhase * 5.5)) * 0.7 + 0.3);
      character.mouthGroup.scale.y = mouthAmt;
      character.mouthGroup.position.y = -0.11 - mouthAmt * 0.018;
      character.teethTop.visible = mouthAmt > 0.55;

      // Head nod with speech rhythm
      character.headPivot.rotation.x = Math.sin(talkPhase * 2.2) * 0.055;
      character.headPivot.rotation.z = Math.sin(talkPhase * 0.8) * 0.025;

      // Gesture with right arm
      character.rightArmPivot.rotation.x = -0.28 + Math.sin(talkPhase * 1.6) * 0.2;
      character.rightArmPivot.rotation.z = -0.18 + Math.sin(talkPhase * 1.1) * 0.06;

      // Breathing in torso
      character.torsoGroup.scale.y = 1 + Math.sin(talkPhase * 1.8) * 0.005;
    }

    if (state === 'listening') {
      // Forward lean (attentive)
      character.root.rotation.x = lerp(character.root.rotation.x, 0.06, 0.04);

      // Head slightly tilted
      character.headPivot.rotation.z = lerp(character.headPivot.rotation.z, 0.06, 0.04);
      character.headPivot.rotation.y = Math.sin(time * 0.3) * 0.04;

      // Mouth nearly closed
      character.mouthGroup.scale.y = 0.22;
      character.teethTop.visible = false;

      // Arms slightly forward
      character.leftArmPivot.rotation.x = lerp(character.leftArmPivot.rotation.x, -0.1, 0.03);
    }

    if (state === 'thinking') {
      // Hand to chin gesture
      character.headPivot.rotation.x = 0.04;
      character.headPivot.rotation.z = -0.05;
      character.leftArmPivot.rotation.x = lerp(character.leftArmPivot.rotation.x, -0.5, 0.05);
      character.lElbowPivot.rotation.x = lerp(character.lElbowPivot.rotation.x, -0.8, 0.05);
      character.mouthGroup.scale.y = 0.15;
      character.teethTop.visible = false;
    }

    if (state === 'greeting') {
      greetTimer += delta;
      // Bow animation
      const bowAngle = Math.max(0, Math.sin(greetTimer * 1.8) * 0.3);
      character.root.rotation.x = bowAngle;
      character.headPivot.rotation.x = -bowAngle * 0.5;

      if (greetTimer > 3.5) {
        greetTimer = 0;
      }
    }

    // ── Reset x rotation when leaving listening ─────────────────
    if (state !== 'listening') {
      character.root.rotation.x = lerp(character.root.rotation.x, 0, 0.04);
    }
    if (state !== 'thinking') {
      character.lElbowPivot.rotation.x = lerp(character.lElbowPivot.rotation.x, 0, 0.03);
    }
  }

  return {
    setState: (newState) => {
      state = newState;
      greetTimer = 0;
      talkPhase = 0;
    },
    update,
    getState: () => state,
  };
}

// ─── Main Component ──────────────────────────────────────────────────────────
const WaiterScene = forwardRef(function WaiterScene({ waiterState }, ref) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const animControllerRef = useRef(null);
  const frameRef = useRef(null);

  useImperativeHandle(ref, () => ({
    setState: (s) => animControllerRef.current?.setState(s),
  }));

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Scene setup ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1210);
    scene.fog = new THREE.FogExp2(0x1a1210, 0.045);

    const camera = new THREE.PerspectiveCamera(52, mount.clientWidth / mount.clientHeight, 0.1, 60);
    camera.position.set(0, 1.55, 3.8);
    camera.lookAt(0, 1.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Build scene ──
    setupLighting(scene);
    buildRestaurant(scene);
    const character = buildWaiter(scene);
    const animController = createAnimationController(character);
    animControllerRef.current = animController;

    // ── Animation loop ──
    const clock = new THREE.Clock();
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      animController.update(delta);
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize handler ──
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  // Sync state prop to animation controller
  useEffect(() => {
    animControllerRef.current?.setState(waiterState);
  }, [waiterState]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
});

export default WaiterScene;
