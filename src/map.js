/**
 * Expanded 36x28 Pimlico (SW1V) World Map, Districts, Counters, Sniff Spots & Spatial Helpers.
 */
export const TILE_SIZE = 48;
export const COLS = 36;
export const ROWS = 28;
export const BASE_WIDTH = COLS * TILE_SIZE;   // 1728
export const BASE_HEIGHT = ROWS * TILE_SIZE; // 1344

export const TILE_ROAD = 0;
export const TILE_BUILDING = 1;
export const TILE_PAVEMENT = 2;
export const TILE_GRASS = 3;
export const TILE_HOME = 4;     // 170 / 170A Cambridge Street
export const TILE_CAFE = 5;     // Actual Matcha Cafes only
export const TILE_TREE = 6;     // Ornamental blossom tree on grass
export const TILE_DELI = 7;     // DELIZIE D'ITALIA (Italian Deli)
export const TILE_ZEBRA = 8;    // Belisha Zebra Crossing
export const TILE_RAILING = 9;  // Wrought-iron garden square railing
export const TILE_STALL = 10;   // Tachbrook Street Market stall

export const HOME_DOOR = { c: 4.5, r: 1.35, tileC: 4, tileR: 0 };

export const DELI_COUNTER = {
    id: 'delizie',
    name: "Delizie d'Italia",
    subtitle: 'Focaccia & Puppuccino',
    tileC: 3,
    tileR: 20,
    x: 4.0 * TILE_SIZE,
    y: 19.45 * TILE_SIZE,
    cooldownDuration: 22
};

export const CAFE_COUNTERS = [
    {
        id: 'warwick-matcha',
        name: 'Warwick Matcha Bar',
        tileC: 20,
        tileR: 0,
        x: 20.5 * TILE_SIZE,
        y: 1.4 * TILE_SIZE,
        cooldownDuration: 12
    },
    {
        id: 'churton-cafe',
        name: 'Churton Corner Cafe',
        tileC: 18,
        tileR: 20,
        x: 18.5 * TILE_SIZE,
        y: 19.45 * TILE_SIZE,
        cooldownDuration: 12
    }
];

export const PRIME_SNIFF_SPOTS = [
    { id: 'sg-nw', x: 13.5 * TILE_SIZE, y: 8.5 * TILE_SIZE, label: "St George's Tree" },
    { id: 'sg-ne', x: 20.5 * TILE_SIZE, y: 8.5 * TILE_SIZE, label: 'Blossom Hydrant' },
    { id: 'sg-sw', x: 13.5 * TILE_SIZE, y: 13.5 * TILE_SIZE, label: 'South Lawn Shrub' },
    { id: 'sg-se', x: 20.5 * TILE_SIZE, y: 13.5 * TILE_SIZE, label: 'Garden Bench Post' },
    { id: 'ecc-n', x: 29.5 * TILE_SIZE, y: 9.5 * TILE_SIZE, label: 'Eccleston Oak', bonus: true },
    { id: 'ecc-s', x: 31.5 * TILE_SIZE, y: 12.5 * TILE_SIZE, label: 'Private Square Lamp', bonus: true },
    { id: 'cam-w', x: 4.5 * TILE_SIZE, y: 9.5 * TILE_SIZE, label: 'Cambridge Pocket Patch' },
    { id: 'chu-s', x: 13.5 * TILE_SIZE, y: 23.5 * TILE_SIZE, label: 'Churton Mews Elm' }
];

export const DISTRICT_LABELS = [
    { name: 'CAMBRIDGE ST', x: 4.5 * TILE_SIZE, y: 2.35 * TILE_SIZE },
    { name: "ST GEORGE'S SQUARE", x: 17.0 * TILE_SIZE, y: 11.0 * TILE_SIZE },
    { name: 'ECCLESTON SQ', x: 30.5 * TILE_SIZE, y: 8.2 * TILE_SIZE },
    { name: 'LUPUS ST', x: 4.0 * TILE_SIZE, y: 19.16 * TILE_SIZE },
    { name: 'TACHBROOK MARKET', x: 30.5 * TILE_SIZE, y: 22.8 * TILE_SIZE }
];

// prettier-ignore
export const PIMLICO_MAP = [
    // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35
    [  1, 1, 1, 1, 4, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // r0: 170A + Warwick Matcha
    [  1, 2, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r1: North Terrace Pavement
    [  1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r2: North Kerb
    [  0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0 ], // r3: Warwick Way WB
    [  0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0 ], // r4: Warwick Way EB
    [  1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r5: Mid North Kerb
    [  1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 9, 9, 9, 9, 9, 2, 2, 9, 9, 9, 9, 9, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r6: St George N Railings + Gate
    [  1, 1, 1, 2, 1, 1, 2, 2, 0, 0, 2, 9, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 9, 2, 0, 0, 2, 9, 9, 9, 9, 9, 9, 9, 2, 1 ], // r7: Eccleston N Railings
    [  1, 1, 1, 2, 1, 1, 2, 2, 0, 0, 2, 9, 3, 6, 3, 3, 2, 2, 3, 3, 6, 3, 9, 2, 0, 0, 2, 9, 3, 3, 3, 3, 3, 9, 2, 1 ], // r8: St George Upper Lawns
    [  1, 2, 3, 3, 6, 2, 2, 2, 0, 0, 2, 9, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 9, 2, 0, 0, 2, 9, 3, 6, 3, 3, 3, 9, 2, 1 ], // r9: Pocket Lawn + Squares
    [  1, 2, 3, 6, 3, 2, 2, 2, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 3, 3, 3, 3, 3, 9, 2, 1 ], // r10: Cross Walk + Square Gates
    [  1, 2, 3, 3, 3, 2, 2, 2, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 3, 3, 3, 3, 3, 9, 2, 1 ], // r11: Cross Walk + Square Gates
    [  1, 1, 1, 2, 1, 1, 2, 2, 0, 0, 2, 9, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 9, 2, 0, 0, 2, 9, 3, 3, 3, 6, 3, 9, 2, 1 ], // r12: Lower Lawns
    [  1, 1, 1, 2, 1, 1, 2, 2, 0, 0, 2, 9, 3, 6, 3, 3, 2, 2, 3, 3, 6, 3, 9, 2, 0, 0, 2, 9, 3, 3, 3, 3, 3, 9, 2, 1 ], // r13: Lower Lawns + Trees
    [  1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 9, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 9, 2, 0, 0, 2, 9, 9, 9, 2, 9, 9, 9, 2, 1 ], // r14: Eccleston S Railings + Gate
    [  1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 9, 9, 9, 9, 9, 2, 2, 9, 9, 9, 9, 9, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r15: St George S Railings + Gate
    [  1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r16: Lupus N Pavement
    [  0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0 ], // r17: Lupus St WB
    [  0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0 ], // r18: Lupus St EB
    [  1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r19: Lupus S Promenade (Deli + Churton)
    [  1, 1, 2, 7, 7, 2, 2, 2, 0, 0, 2, 1, 1, 2, 1, 1, 2, 2, 5, 1, 1, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r20: DELIZIE D'ITALIA (3..4) + Churton Cafe (18)
    [  1, 1, 2, 1, 1, 2, 2, 2, 0, 0, 2, 1, 1, 2, 1, 1, 2, 2, 1, 1, 1, 2, 2, 2, 0, 0, 2, 2, 10, 2, 10, 2, 10, 2, 2, 1 ], // r21: Tachbrook North Stalls
    [  1, 2, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r22: South Cross Zebras + Market Plaza
    [  1, 2, 2, 3, 6, 2, 2, 2, 0, 0, 2, 2, 3, 6, 3, 2, 2, 2, 1, 1, 2, 1, 1, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r23: Deli Garden + Churton Parklet
    [  1, 2, 2, 3, 3, 2, 2, 2, 0, 0, 2, 2, 3, 3, 3, 2, 2, 2, 1, 1, 2, 1, 1, 2, 0, 0, 2, 2, 10, 2, 10, 2, 10, 2, 2, 1 ], // r24: Tachbrook South Stalls
    [  1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 6, 1 ], // r25: South Promenade
    [  1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r26: South Walkway
    [  1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]  // r27: Southern Border
];

export function getTileAtGrid(c, r) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return TILE_BUILDING;
    return PIMLICO_MAP[r][c];
}

export function getTileAtPixel(px, py) {
    return getTileAtGrid(Math.floor(px / TILE_SIZE), Math.floor(py / TILE_SIZE));
}

export function isSolidTileType(t) {
    return (
        t === TILE_BUILDING ||
        t === TILE_HOME ||
        t === TILE_CAFE ||
        t === TILE_DELI ||
        t === TILE_RAILING ||
        t === TILE_STALL
    );
}

export function isOpaqueTileType(t) {
    return (
        t === TILE_BUILDING ||
        t === TILE_HOME ||
        t === TILE_CAFE ||
        t === TILE_DELI ||
        t === TILE_STALL
    );
}

export function isSolidTile(px, py) {
    return isSolidTileType(getTileAtPixel(px, py));
}

export function isLegalToiletTile(t) {
    return t === TILE_GRASS || t === TILE_TREE;
}

export function canMoveTo(nx, ny, radius = 11) {
    return (
        !isSolidTile(nx - radius, ny - radius) &&
        !isSolidTile(nx + radius, ny - radius) &&
        !isSolidTile(nx - radius, ny + radius) &&
        !isSolidTile(nx + radius, ny + radius)
    );
}

/**
 * Finds the nearest walkable spot around Carry when setting Biscotti down so he never clips into walls.
 */
export function findSafeDropSpot(cx, cy, radius = 8) {
    const offsets = [
        [-18, 6],
        [18, 6],
        [0, 18],
        [0, -18],
        [-16, -10],
        [16, -10],
        [-12, 14],
        [12, 14],
        [0, 0]
    ];
    for (const [ox, oy] of offsets) {
        const tx = cx + ox;
        const ty = cy + oy;
        if (canMoveTo(tx, ty, radius)) {
            return { x: tx, y: ty };
        }
    }
    return { x: cx, y: cy };
}

/**
 * Ray-steps every 6px to check unobstructed line of sight across solid structures.
 */
export function hasLineOfSight(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const total = Math.hypot(dx, dy);
    if (total < 4) return true;
    const steps = Math.ceil(total / 6);
    for (let i = 1; i < steps; i++) {
        const u = i / steps;
        const px = x1 + dx * u;
        const py = y1 + dy * u;
        if (isSolidTile(px, py)) return false;
    }
    return true;
}

/**
 * Casts a single ray until maxRange or solid tile hit, used to draw realistic wall-clipped vision cones.
 */
export function castVisionRay(ox, oy, angle, maxRange) {
    const step = 6;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (let d = 8; d <= maxRange; d += step) {
        const px = ox + cos * d;
        const py = oy + sin * d;
        if (isSolidTile(px, py)) {
            return { x: px - cos * 3, y: py - sin * 3, dist: d - 3 };
        }
    }
    return { x: ox + cos * maxRange, y: oy + sin * maxRange, dist: maxRange };
}

/**
 * 4-neighbour grass auto-tiling bitmask (1=N, 2=E, 4=S, 8=W) for seamless lawns.
 */
export function getGrassJoinMask(c, r) {
    let mask = 0;
    if (isLegalToiletTile(getTileAtGrid(c, r - 1))) mask |= 1;
    if (isLegalToiletTile(getTileAtGrid(c + 1, r))) mask |= 2;
    if (isLegalToiletTile(getTileAtGrid(c, r + 1))) mask |= 4;
    if (isLegalToiletTile(getTileAtGrid(c - 1, r))) mask |= 8;
    return mask;
}
