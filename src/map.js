/**
 * Street-accurate 40x34 Pimlico (SW1V) Map, Real Cafes, Delizie d'Italia & River Thames.
 * North at top (r=0), River Thames at bottom (r=32..33), West-to-East (c=0..39).
 */
export const TILE_SIZE = 48;
export const COLS = 40;
export const ROWS = 34;
export const BASE_WIDTH = COLS * TILE_SIZE;   // 1920
export const BASE_HEIGHT = ROWS * TILE_SIZE; // 1632

export const TILE_ROAD = 0;
export const TILE_BUILDING = 1;
export const TILE_PAVEMENT = 2;
export const TILE_GRASS = 3;
export const TILE_HOME = 4;     // 170 / 170A Cambridge Street
export const TILE_CAFE = 5;     // Actual real Pimlico Matcha Cafes only
export const TILE_TREE = 6;     // Ornamental blossom tree on grass
export const TILE_DELI = 7;     // Delizie d'Italia (70 Lupus Street)
export const TILE_ZEBRA = 8;    // Belisha Zebra Crossing
export const TILE_RAILING = 9;  // Wrought-iron garden square railing
export const TILE_STALL = 10;   // Tachbrook Street Market stall
export const TILE_WATER = 11;   // River Thames

// 170A Cambridge Street (West side, between Sussex St r=14 and Lupus St r=20..21)
export const HOME_DOOR = { c: 7.4, r: 17.5, tileC: 6, tileR: 17 };

// Delizie d'Italia (70 Lupus Street, North side between St George's Dr & Belgrave Rd)
export const DELI_COUNTER = {
    id: 'delizie',
    name: "Delizie d'Italia",
    subtitle: '70 Lupus St · Focaccia & Puppuccino',
    tileC: 21,
    tileR: 18,
    x: 22.0 * TILE_SIZE,
    y: 19.45 * TILE_SIZE,
    cooldownDuration: 22
};

// Actual Pimlico Matcha Cafes (1:1 with TILE_CAFE tiles)
export const CAFE_COUNTERS = [
    {
        id: 'third-coffee',
        name: 'Third Coffee',
        shortName: 'Third',
        line1: 'THIRD',
        line2: 'COFFEE',
        theme: 'third',
        tileC: 17,
        tileR: 18,
        x: 17.5 * TILE_SIZE,
        y: 19.45 * TILE_SIZE,
        cooldownDuration: 12
    },
    {
        id: 'gails-churton',
        name: "GAIL's",
        shortName: "GAIL's",
        line1: "GAIL'S",
        line2: 'BAKERY',
        theme: 'gails',
        tileC: 28,
        tileR: 9,
        x: 29.45 * TILE_SIZE,
        y: 9.5 * TILE_SIZE,
        cooldownDuration: 12
    },
    {
        id: 'caffe-nero',
        name: 'Caffè Nero',
        shortName: 'Nero',
        line1: 'CAFFÈ',
        line2: 'NERO',
        theme: 'nero',
        tileC: 12,
        tileR: 3,
        x: 12.5 * TILE_SIZE,
        y: 4.45 * TILE_SIZE,
        cooldownDuration: 12
    }
];

export const PRIME_SNIFF_SPOTS = [
    { id: 'sg-n', x: 19.5 * TILE_SIZE, y: 25.5 * TILE_SIZE, label: "St George's Elm" },
    { id: 'sg-s', x: 21.5 * TILE_SIZE, y: 27.5 * TILE_SIZE, label: "St George's Oak" },
    { id: 'pg-thames', x: 20.5 * TILE_SIZE, y: 31.5 * TILE_SIZE, label: 'Pimlico Gardens', bonus: true },
    { id: 'cg-w', x: 5.5 * TILE_SIZE, y: 25.5 * TILE_SIZE, label: 'Churchill Lawn' },
    { id: 'cg-e', x: 9.5 * TILE_SIZE, y: 27.5 * TILE_SIZE, label: 'Churchill Blossom' },
    { id: 'ws-w', x: 19.5 * TILE_SIZE, y: 10.5 * TILE_SIZE, label: 'Warwick Sq West' },
    { id: 'ws-e', x: 21.5 * TILE_SIZE, y: 11.5 * TILE_SIZE, label: 'Warwick Sq East' },
    { id: 'ecc-c', x: 20.5 * TILE_SIZE, y: 2.5 * TILE_SIZE, label: 'Eccleston Oak', bonus: true },
    { id: 'riv-e', x: 32.5 * TILE_SIZE, y: 26.5 * TILE_SIZE, label: 'Claverton Patch' }
];

export const STREET_LABELS = [
    { name: 'ECCLESTON SQUARE', x: 20.5 * TILE_SIZE, y: 0.72 * TILE_SIZE },
    { name: 'WARWICK WAY', x: 12.0 * TILE_SIZE, y: 6.0 * TILE_SIZE },
    { name: 'WARWICK SQUARE', x: 20.5 * TILE_SIZE, y: 7.68 * TILE_SIZE },
    { name: 'TACHBROOK MARKET', x: 36.0 * TILE_SIZE, y: 7.68 * TILE_SIZE },
    { name: 'SUSSEX STREET', x: 12.0 * TILE_SIZE, y: 14.5 * TILE_SIZE },
    { name: 'LUPUS STREET', x: 12.0 * TILE_SIZE, y: 21.0 * TILE_SIZE },
    { name: 'LUPUS STREET', x: 31.5 * TILE_SIZE, y: 21.0 * TILE_SIZE },
    { name: 'CHURCHILL GARDENS', x: 8.0 * TILE_SIZE, y: 23.65 * TILE_SIZE },
    { name: "ST GEORGE'S SQUARE", x: 20.5 * TILE_SIZE, y: 22.68 * TILE_SIZE },
    { name: 'GROSVENOR ROAD', x: 12.0 * TILE_SIZE, y: 30.55 * TILE_SIZE },
    { name: 'RIVER THAMES', x: 20.5 * TILE_SIZE, y: 33.15 * TILE_SIZE },
    { name: 'ALDERNEY ST', x: 3.5 * TILE_SIZE, y: 11.0 * TILE_SIZE, rotate: -Math.PI / 2 },
    { name: 'CAMBRIDGE ST', x: 9.0 * TILE_SIZE, y: 11.0 * TILE_SIZE, rotate: -Math.PI / 2 },
    { name: "ST GEORGE'S DR", x: 16.0 * TILE_SIZE, y: 11.0 * TILE_SIZE, rotate: -Math.PI / 2 },
    { name: 'BELGRAVE RD', x: 25.0 * TILE_SIZE, y: 11.0 * TILE_SIZE, rotate: -Math.PI / 2 },
    { name: 'CHURTON ST', x: 30.0 * TILE_SIZE, y: 11.0 * TILE_SIZE, rotate: -Math.PI / 2 },
    { name: 'MORETON ST', x: 30.0 * TILE_SIZE, y: 17.5 * TILE_SIZE, rotate: -Math.PI / 2 },
    { name: 'TACHBROOK ST', x: 36.0 * TILE_SIZE, y: 17.5 * TILE_SIZE, rotate: -Math.PI / 2 }
];

// prettier-ignore
export const PIMLICO_MAP = [
    // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39
    [  1, 1, 1, 2, 1, 1, 1, 2, 0, 0, 2, 1, 1, 1, 2, 0, 0, 9, 9, 9, 2, 9, 9, 9, 0, 0, 2, 1, 1, 2, 2, 1, 1, 1, 2, 2, 2, 1, 1, 1 ], // r0: Eccleston N
    [  1, 1, 1, 2, 1, 1, 1, 2, 0, 0, 2, 1, 1, 1, 2, 0, 0, 9, 3, 3, 3, 3, 3, 9, 0, 0, 2, 1, 1, 2, 2, 1, 1, 1, 2, 2, 2, 1, 1, 1 ], // r1: Eccleston Sq
    [  1, 2, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 2, 2, 2, 8, 8, 2, 3, 3, 6, 3, 3, 2, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r2: Eccleston Sq + Cross
    [  1, 1, 1, 2, 1, 1, 1, 2, 0, 0, 2, 1, 5, 1, 2, 0, 0, 9, 9, 9, 2, 9, 9, 9, 0, 0, 2, 1, 1, 2, 2, 1, 1, 1, 2, 2, 2, 1, 1, 1 ], // r3: Caffe Nero (12,3) + Eccleston S
    [  1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r4: Warwick Way N Pavement
    [  0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 0, 0, 0, 0, 8, 0, 0, 0, 0 ], // r5: Warwick Way WB
    [  0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 0, 0, 0, 0, 8, 0, 0, 0, 0 ], // r6: Warwick Way EB
    [  1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r7: Warwick Way S Pavement
    [  1, 1, 2, 2, 1, 1, 1, 2, 0, 0, 2, 1, 2, 1, 2, 0, 0, 9, 9, 9, 2, 9, 9, 9, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 10, 2, 2, 10, 2, 1 ], // r8: Warwick Sq N + Tachbrook Stalls
    [  1, 1, 2, 2, 1, 1, 1, 2, 0, 0, 2, 1, 2, 1, 2, 0, 0, 9, 3, 3, 3, 3, 3, 9, 0, 0, 2, 1, 5, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1 ], // r9: GAIL's (28,9) + Warwick Sq
    [  1, 1, 2, 2, 1, 2, 1, 2, 0, 0, 2, 2, 2, 2, 2, 0, 0, 2, 3, 6, 3, 3, 3, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 10, 2, 2, 10, 2, 1 ], // r10: Warwick Sq Gates
    [  1, 1, 2, 2, 1, 2, 1, 2, 0, 0, 2, 2, 2, 2, 2, 0, 0, 2, 3, 3, 3, 6, 3, 2, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1 ], // r11: Warwick Sq Gates
    [  1, 1, 2, 2, 1, 1, 1, 2, 0, 0, 2, 1, 2, 1, 2, 0, 0, 9, 3, 3, 3, 3, 3, 9, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 10, 2, 2, 10, 2, 1 ], // r12: Warwick Sq + Tachbrook Stalls
    [  1, 1, 2, 2, 1, 1, 1, 2, 0, 0, 2, 1, 2, 1, 2, 0, 0, 9, 9, 9, 2, 9, 9, 9, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1 ], // r13: Warwick Sq S Railings
    [  1, 2, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 2, 2, 2, 8, 8, 2, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r14: Sussex St Crosswalk
    [  1, 1, 2, 2, 1, 1, 1, 2, 0, 0, 2, 1, 1, 1, 2, 0, 0, 1, 1, 2, 2, 1, 1, 2, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 1 ], // r15: Sussex -> Lupus Terrace
    [  1, 1, 2, 2, 1, 1, 1, 2, 0, 0, 2, 1, 2, 1, 2, 0, 0, 1, 1, 2, 2, 1, 1, 2, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 1 ], // r16: Cambridge St Block
    [  1, 1, 2, 2, 1, 1, 4, 2, 0, 0, 2, 1, 2, 1, 2, 0, 0, 1, 1, 2, 2, 1, 1, 2, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 1 ], // r17: 170A Cambridge St (6,17)
    [  1, 1, 2, 2, 1, 1, 1, 2, 0, 0, 2, 1, 1, 1, 2, 0, 0, 5, 1, 1, 1, 7, 7, 2, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 1 ], // r18: Third Coffee (17,18) + Delizie d'Italia (21..22,18)
    [  1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r19: Lupus St N Promenade
    [  0, 0, 0, 8, 0, 0, 0, 8, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 0, 0, 0, 0, 8, 0, 0, 0, 0 ], // r20: Lupus St WB (Cambridge St terminates here)
    [  0, 0, 0, 8, 0, 0, 0, 8, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 0, 0, 0, 0, 8, 0, 0, 0, 0 ], // r21: Lupus St EB
    [  1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r22: Lupus St S Pavement
    [  1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 9, 9, 9, 2, 9, 9, 9, 0, 0, 2, 1, 1, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 1 ], // r23: St George's Sq N Gate
    [  1, 1, 2, 2, 3, 3, 3, 2, 3, 3, 3, 2, 2, 2, 1, 2, 2, 9, 3, 3, 3, 3, 3, 9, 0, 0, 2, 1, 1, 2, 2, 3, 3, 2, 1, 1, 2, 2, 2, 1 ], // r24: Churchill Gardens + St George's Sq
    [  1, 1, 2, 2, 3, 6, 3, 2, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 3, 6, 3, 3, 3, 2, 8, 8, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2, 1 ], // r25: St George's Sq W/E Gates
    [  1, 1, 2, 2, 3, 3, 3, 2, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 2, 0, 0, 2, 1, 1, 2, 2, 3, 6, 2, 1, 1, 2, 2, 2, 1 ], // r26: St George's Sq
    [  1, 1, 2, 2, 3, 3, 3, 2, 3, 6, 3, 2, 2, 2, 1, 2, 2, 9, 3, 3, 3, 6, 3, 9, 0, 0, 2, 1, 1, 2, 2, 3, 3, 2, 1, 1, 2, 2, 2, 1 ], // r27: Churchill Blossom + St George's Sq
    [  1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 9, 9, 9, 2, 9, 9, 9, 0, 0, 2, 1, 1, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 1 ], // r28: St George's Sq S Gate
    [  1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r29: Grosvenor Rd N Pavement
    [  0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // r30: Grosvenor Road (A3212)
    [  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 6, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2 ], // r31: Pimlico Gardens & Thames Promenade
    [ 11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11 ], // r32: River Thames
    [ 11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11 ]  // r33: River Thames
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
        t === TILE_STALL ||
        t === TILE_WATER
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
 * Finds nearest walkable spot around Carry when setting Biscotti down so he never clips into walls or Thames.
 */
export function findSafeDropSpot(cx, cy, radius = 8) {
    const offsets = [
        [0, -18],
        [18, 0],
        [-18, 0],
        [0, 18],
        [16, -12],
        [-16, -12],
        [16, 12],
        [-16, 12],
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
 * Ray-steps every 6px to check unobstructed line of sight across solid structures (water stays transparent).
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
        if (isOpaqueTileType(getTileAtPixel(px, py))) return false;
    }
    return true;
}

/**
 * Casts a single ray until maxRange or opaque tile hit for wall-clipped Witch vision cones.
 */
export function castVisionRay(ox, oy, angle, maxRange) {
    const step = 6;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (let d = 8; d <= maxRange; d += step) {
        const px = ox + cos * d;
        const py = oy + sin * d;
        if (isOpaqueTileType(getTileAtPixel(px, py))) {
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
