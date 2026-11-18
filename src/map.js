/**
 * Street-accurate 40x34 Pimlico (SW1V) Map matching Thomas Cubitt's Pimlico Grid,
 * East-to-West Lupus Street numbering, real cafes, Delizie d'Italia & River Thames.
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

export const CARRY_RADIUS = 9.5;
export const DOG_RADIUS = 7.5;

// 170A Cambridge Street (West side, between Sussex St r=14 and Lupus St r=20..21)
export const HOME_DOOR = { c: 9.4, r: 17.5, tileC: 8, tileR: 17 };

// Delizie d'Italia (70 Lupus Street, North side West of Cambridge St & 170A)
export const DELI_COUNTER = {
    id: 'delizie',
    name: "Delizie d'Italia",
    subtitle: '70 Lupus St · Focaccia & Puppuccino',
    tileC: 5,
    tileR: 18,
    x: 6.0 * TILE_SIZE,
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
        tileC: 21,
        tileR: 18,
        x: 21.5 * TILE_SIZE,
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
        tileC: 31,
        tileR: 10,
        x: 32.45 * TILE_SIZE,
        y: 10.5 * TILE_SIZE,
        cooldownDuration: 12
    },
    {
        id: 'caffe-nero',
        name: 'Caffè Nero',
        shortName: 'Nero',
        line1: 'CAFFÈ',
        line2: 'NERO',
        theme: 'nero',
        tileC: 30,
        tileR: 3,
        x: 30.5 * TILE_SIZE,
        y: 4.45 * TILE_SIZE,
        cooldownDuration: 12
    }
];

export const PRIME_SNIFF_SPOTS = [
    { id: 'sg-n', x: 22.5 * TILE_SIZE, y: 25.5 * TILE_SIZE, label: "St George's Elm" },
    { id: 'sg-s', x: 24.5 * TILE_SIZE, y: 27.5 * TILE_SIZE, label: "St George's Oak" },
    { id: 'pg-thames', x: 23.5 * TILE_SIZE, y: 31.5 * TILE_SIZE, label: 'Pimlico Gardens', bonus: true },
    { id: 'cg-w', x: 7.5 * TILE_SIZE, y: 25.5 * TILE_SIZE, label: 'Churchill Lawn' },
    { id: 'cg-e', x: 13.5 * TILE_SIZE, y: 27.5 * TILE_SIZE, label: 'Churchill Blossom' },
    { id: 'ws-w', x: 22.5 * TILE_SIZE, y: 10.5 * TILE_SIZE, label: 'Warwick Sq West' },
    { id: 'ws-e', x: 25.5 * TILE_SIZE, y: 11.5 * TILE_SIZE, label: 'Warwick Sq East' },
    { id: 'ecc-c', x: 23.5 * TILE_SIZE, y: 2.5 * TILE_SIZE, label: 'Eccleston Oak', bonus: true },
    { id: 'riv-e', x: 32.5 * TILE_SIZE, y: 26.5 * TILE_SIZE, label: 'Moreton Pocket Patch' }
];

export const STREET_LABELS = [
    { name: 'ECCLESTON SQUARE', x: 23.5 * TILE_SIZE, y: 0.72 * TILE_SIZE },
    { name: 'WARWICK WAY', x: 14.5 * TILE_SIZE, y: 6.0 * TILE_SIZE },
    { name: 'WARWICK WAY', x: 32.5 * TILE_SIZE, y: 6.0 * TILE_SIZE },
    { name: 'WARWICK SQUARE', x: 23.5 * TILE_SIZE, y: 7.68 * TILE_SIZE },
    { name: 'TACHBROOK MARKET', x: 37.0 * TILE_SIZE, y: 7.68 * TILE_SIZE },
    { name: 'SUSSEX STREET', x: 14.5 * TILE_SIZE, y: 14.5 * TILE_SIZE },
    { name: 'LUPUS STREET', x: 6.5 * TILE_SIZE, y: 21.0 * TILE_SIZE },
    { name: 'LUPUS STREET', x: 23.5 * TILE_SIZE, y: 21.0 * TILE_SIZE },
    { name: 'CHURCHILL GARDENS', x: 10.5 * TILE_SIZE, y: 23.65 * TILE_SIZE },
    { name: "ST GEORGE'S SQUARE", x: 23.5 * TILE_SIZE, y: 22.68 * TILE_SIZE },
    { name: 'GROSVENOR ROAD', x: 14.5 * TILE_SIZE, y: 30.55 * TILE_SIZE },
    { name: 'RIVER THAMES', x: 23.5 * TILE_SIZE, y: 33.15 * TILE_SIZE },
    { name: 'ALDERNEY ST', x: 3.5 * TILE_SIZE, y: 11.0 * TILE_SIZE, rotate: -Math.PI / 2 },
    { name: 'CAMBRIDGE ST', x: 11.0 * TILE_SIZE, y: 11.0 * TILE_SIZE, rotate: -Math.PI / 2 },
    { name: 'CLARENDON ST', x: 14.5 * TILE_SIZE, y: 11.0 * TILE_SIZE, rotate: -Math.PI / 2 },
    { name: "ST GEORGE'S DR", x: 19.0 * TILE_SIZE, y: 11.0 * TILE_SIZE, rotate: -Math.PI / 2 },
    { name: 'CLAVERTON ST', x: 19.0 * TILE_SIZE, y: 26.5 * TILE_SIZE, rotate: -Math.PI / 2 },
    { name: 'BELGRAVE RD', x: 28.0 * TILE_SIZE, y: 11.0 * TILE_SIZE, rotate: -Math.PI / 2 },
    { name: 'WILTON RD', x: 33.0 * TILE_SIZE, y: 2.5 * TILE_SIZE, rotate: -Math.PI / 2 },
    { name: 'CHURTON ST', x: 33.0 * TILE_SIZE, y: 11.0 * TILE_SIZE, rotate: -Math.PI / 2 },
    { name: 'MORETON ST', x: 33.0 * TILE_SIZE, y: 17.5 * TILE_SIZE, rotate: -Math.PI / 2 },
    { name: 'TACHBROOK ST', x: 37.0 * TILE_SIZE, y: 17.5 * TILE_SIZE, rotate: -Math.PI / 2 }
];

// prettier-ignore
export const PIMLICO_MAP = [
    // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39
    [  1, 1, 2, 2, 1, 1, 1, 1, 1, 2, 0, 0, 2, 1, 2, 1, 1, 2, 0, 0, 2, 9, 9, 2, 2, 9, 9, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1 ], // r0: Eccleston Sq N Railings
    [  1, 1, 2, 2, 1, 1, 1, 1, 1, 2, 0, 0, 2, 1, 2, 1, 1, 2, 0, 0, 2, 9, 3, 3, 3, 3, 9, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1 ], // r1: Eccleston Sq
    [  1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 3, 6, 3, 3, 2, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r2: Eccleston Sq + Crossings
    [  1, 1, 2, 2, 1, 1, 1, 1, 1, 2, 0, 0, 2, 1, 2, 1, 1, 2, 0, 0, 2, 9, 9, 2, 2, 9, 9, 0, 0, 2, 5, 1, 2, 2, 1, 1, 2, 2, 1, 1 ], // r3: Caffe Nero (30,3) + Eccleston S
    [  1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r4: Warwick Way N Pavement
    [  0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 8, 0, 0, 8, 8, 0, 0, 0, 0, 8, 8, 0, 8, 8, 0, 0, 8, 0, 0, 0 ], // r5: Warwick Way WB
    [  0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 8, 0, 0, 8, 8, 0, 0, 0, 0, 8, 8, 0, 8, 8, 0, 0, 8, 0, 0, 0 ], // r6: Warwick Way EB
    [  1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r7: Warwick Way S Pavement
    [  1, 1, 2, 2, 1, 1, 1, 2, 1, 2, 0, 0, 2, 1, 2, 1, 1, 2, 0, 0, 2, 9, 9, 2, 2, 9, 9, 0, 0, 2, 1, 1, 2, 2, 1, 10, 2, 2, 10, 1 ], // r8: Warwick Sq N + Tachbrook Stalls
    [  1, 1, 2, 2, 1, 1, 1, 2, 1, 2, 0, 0, 2, 1, 2, 1, 1, 2, 0, 0, 2, 9, 3, 3, 3, 3, 9, 0, 0, 2, 1, 1, 2, 2, 1, 2, 2, 2, 2, 1 ], // r9: Warwick Sq + Tachbrook
    [  1, 1, 2, 2, 1, 2, 2, 2, 1, 2, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 6, 3, 3, 3, 2, 0, 0, 2, 1, 5, 2, 2, 2, 10, 2, 2, 10, 1 ], // r10: GAIL's (31,10) + Warwick Sq Gates
    [  1, 1, 2, 2, 1, 2, 2, 2, 1, 2, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 3, 3, 3, 6, 2, 0, 0, 2, 1, 1, 2, 2, 1, 2, 2, 2, 2, 1 ], // r11: Warwick Sq Gates
    [  1, 1, 2, 2, 1, 1, 1, 2, 1, 2, 0, 0, 2, 1, 2, 1, 1, 2, 0, 0, 2, 9, 3, 3, 3, 3, 9, 0, 0, 2, 1, 1, 2, 2, 1, 10, 2, 2, 10, 1 ], // r12: Warwick Sq + Tachbrook Stalls
    [  1, 1, 2, 2, 1, 1, 1, 2, 1, 2, 0, 0, 2, 1, 2, 1, 1, 2, 0, 0, 2, 9, 9, 2, 2, 9, 9, 0, 0, 2, 1, 1, 2, 2, 1, 2, 2, 2, 2, 1 ], // r13: Warwick Sq S Railings
    [  1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r14: Sussex St Crosswalk
    [  1, 1, 2, 2, 1, 1, 1, 2, 1, 2, 0, 0, 2, 1, 2, 1, 1, 2, 0, 0, 2, 1, 1, 2, 2, 1, 1, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1 ], // r15: Sussex -> Lupus Block
    [  1, 1, 2, 2, 1, 2, 2, 2, 1, 2, 0, 0, 2, 1, 2, 1, 1, 2, 0, 0, 2, 1, 1, 2, 2, 1, 1, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1 ], // r16: Cambridge St Block
    [  1, 1, 2, 2, 1, 2, 2, 2, 4, 2, 0, 0, 2, 1, 2, 1, 1, 2, 0, 0, 2, 1, 1, 2, 2, 1, 1, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1 ], // r17: 170A Cambridge St (8,17)
    [  1, 1, 2, 2, 2, 7, 7, 2, 1, 2, 0, 0, 2, 1, 2, 1, 1, 2, 0, 0, 2, 5, 1, 1, 1, 1, 2, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1 ], // r18: Delizie d'Italia (5..6,18) + Third Coffee (21,18)
    [  1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r19: Lupus St N Promenade
    [  0, 0, 0, 8, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 8, 8, 0, 0, 8, 0, 0, 0 ], // r20: Lupus St WB (Cambridge St terminates)
    [  0, 0, 0, 8, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 8, 8, 0, 0, 8, 0, 0, 0 ], // r21: Lupus St EB
    [  1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r22: Lupus St S Pavement
    [  1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 0, 0, 2, 9, 9, 2, 2, 9, 9, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1 ], // r23: Claverton St + St George's Sq N Gate
    [  1, 1, 2, 2, 3, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 2, 1, 2, 0, 0, 2, 9, 3, 3, 3, 3, 9, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1 ], // r24: Churchill Gardens (W) + St George's Sq (E)
    [  1, 1, 2, 2, 3, 3, 3, 6, 3, 2, 2, 3, 3, 3, 3, 2, 2, 2, 8, 8, 2, 2, 6, 3, 3, 3, 2, 8, 8, 2, 2, 3, 3, 2, 1, 1, 2, 2, 1, 1 ], // r25: Claverton Zebra + St George's Sq W/E Gates
    [  1, 1, 2, 2, 3, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 2, 2, 2, 0, 0, 2, 2, 3, 3, 3, 3, 2, 0, 0, 2, 2, 3, 6, 2, 1, 1, 2, 2, 1, 1 ], // r26: Churchill Gardens + St George's Sq
    [  1, 1, 2, 2, 3, 3, 3, 3, 3, 2, 2, 3, 3, 6, 3, 2, 1, 2, 0, 0, 2, 9, 3, 3, 6, 3, 9, 0, 0, 2, 2, 3, 3, 2, 1, 1, 2, 2, 1, 1 ], // r27: Churchill Blossom + St George's Sq
    [  1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 0, 0, 2, 9, 9, 2, 2, 9, 9, 0, 0, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1 ], // r28: St George's Sq S Gate
    [  1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 2, 2, 2, 2, 2, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ], // r29: Grosvenor Rd N Pavement
    [  0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 0, 0, 0, 0, 0, 0, 0, 8, 8, 0, 0, 0, 0, 0, 0 ], // r30: Grosvenor Road (A3212)
    [  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 6, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2 ], // r31: Pimlico Gardens & Thames Promenade
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

function tryStepAxis(x, y, primaryVel, secondaryVel, dt, radius, isX) {
    const step = primaryVel * dt;
    if (Math.abs(step) <= 1e-6) return { x, y };

    const nx = isX ? x + step : x;
    const ny = isX ? y : y + step;
    if (canMoveTo(nx, ny, radius)) {
        return { x: nx, y: ny };
    }

    const speed = Math.hypot(primaryVel, secondaryVel);
    if (Math.abs(primaryVel) <= Math.abs(secondaryVel) * 0.6 || speed <= 1e-3) {
        return { x, y };
    }

    const dir = Math.sign(primaryVel);
    const slideStep = speed * 0.78 * dt;
    for (const offset of [6, 12, 18, 22]) {
        for (const sign of [1, -1]) {
            if (secondaryVel !== 0 && Math.sign(secondaryVel) === -sign) continue;
            const probeX = isX ? x + dir * 4 : x + sign * offset;
            const probeY = isX ? y + sign * offset : y + dir * 4;
            if (!canMoveTo(probeX, probeY, radius)) continue;

            const slideDelta = sign * Math.min(slideStep, offset);
            const sx = isX ? x : x + slideDelta;
            const sy = isX ? y + slideDelta : y;
            if (!canMoveTo(sx, sy, radius)) continue;

            const forwardNudge = Math.min(Math.abs(step) * 0.5, 2) * dir;
            const fx = isX ? sx + forwardNudge : sx;
            const fy = isX ? sy : sy + forwardNudge;
            if (canMoveTo(fx, fy, radius)) {
                return { x: fx, y: fy };
            }
            return { x: sx, y: sy };
        }
    }
    return { x, y };
}

/**
 * Advances an entity along velocity (vx, vy) with gentle perpendicular corner-sliding around edges.
 */
export function moveEntityWithSlide(x, y, vx, vy, dt, radius = CARRY_RADIUS) {
    const startX = x;
    const startY = y;
    ({ x, y } = tryStepAxis(x, y, vx, vy, dt, radius, true));
    ({ x, y } = tryStepAxis(x, y, vy, vx, dt, radius, false));
    return { x, y, movedDist: Math.hypot(x - startX, y - startY) };
}

function findNearestWalkableCell(gc, gr, refX = null, refY = null) {
    const startTile = getTileAtGrid(gc, gr);
    if (gc >= 0 && gc < COLS && gr >= 0 && gr < ROWS && !isSolidTileType(startTile)) {
        return { c: gc, r: gr };
    }
    let best = null;
    let bestScore = Infinity;
    for (let rad = 1; rad <= 8; rad++) {
        for (let dr = -rad; dr <= rad; dr++) {
            for (let dc = -rad; dc <= rad; dc++) {
                if (Math.max(Math.abs(dc), Math.abs(dr)) !== rad) continue;
                const nc = gc + dc;
                const nr = gr + dr;
                if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
                const t = getTileAtGrid(nc, nr);
                if (isSolidTileType(t)) continue;
                const cx = (nc + 0.5) * TILE_SIZE;
                const cy = (nr + 0.5) * TILE_SIZE;
                if (!canMoveTo(cx, cy, CARRY_RADIUS)) continue;
                const distSq = refX != null ? (cx - refX) ** 2 + (cy - refY) ** 2 : (dc ** 2 + dr ** 2) * TILE_SIZE ** 2;
                const roadPenalty = t === TILE_ROAD ? TILE_SIZE * TILE_SIZE * 0.45 : 0;
                const score = distSq + roadPenalty;
                if (score < bestScore) {
                    bestScore = score;
                    best = { c: nc, r: nr };
                }
            }
        }
        if (best) return best;
    }
    return { c: HOME_DOOR.tileC + 1, r: HOME_DOOR.tileR };
}

/**
 * Resolves any world coordinate (including buildings, cafes, deli, or 170A) to a valid walkable target.
 */
export function resolveWalkableTarget(wx, wy) {
    const clampedX = Math.max(TILE_SIZE * 0.5, Math.min(BASE_WIDTH - TILE_SIZE * 0.5, wx));
    const clampedY = Math.max(TILE_SIZE * 0.5, Math.min(BASE_HEIGHT - TILE_SIZE * 0.5, wy));
    const gc = Math.max(0, Math.min(COLS - 1, Math.floor(clampedX / TILE_SIZE)));
    const gr = Math.max(0, Math.min(ROWS - 1, Math.floor(clampedY / TILE_SIZE)));
    const t = getTileAtGrid(gc, gr);

    if (t === TILE_DELI) {
        return { x: DELI_COUNTER.x, y: DELI_COUNTER.y, label: DELI_COUNTER.name };
    }
    if (t === TILE_CAFE) {
        const cafe =
            CAFE_COUNTERS.find((cf) => cf.tileC === gc && cf.tileR === gr) ||
            CAFE_COUNTERS.reduce((best, cf) =>
                Math.hypot(cf.x - clampedX, cf.y - clampedY) < Math.hypot(best.x - clampedX, best.y - clampedY) ? cf : best
            );
        return { x: cafe.x, y: cafe.y, label: cafe.name };
    }
    if (t === TILE_HOME) {
        return { x: HOME_DOOR.c * TILE_SIZE, y: HOME_DOOR.r * TILE_SIZE, label: '170A Cambridge St' };
    }
    if (canMoveTo(clampedX, clampedY, CARRY_RADIUS)) {
        return { x: clampedX, y: clampedY, label: null };
    }
    const cell = findNearestWalkableCell(gc, gr, clampedX, clampedY);
    return { x: (cell.c + 0.5) * TILE_SIZE, y: (cell.r + 0.5) * TILE_SIZE, label: null };
}

const ASTAR_DIRS = [
    [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
    [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]
];

/**
 * Computes a pedestrian-aware 8-way A* path around Regency blocks, railings, and across Zebra Crossings.
 */
export function findWalkPath(startX, startY, goalX, goalY) {
    const resolved = resolveWalkableTarget(goalX, goalY);
    const rawSc = Math.max(0, Math.min(COLS - 1, Math.floor(startX / TILE_SIZE)));
    const rawSr = Math.max(0, Math.min(ROWS - 1, Math.floor(startY / TILE_SIZE)));
    const startCell = findNearestWalkableCell(rawSc, rawSr, startX, startY);
    const gc = Math.max(0, Math.min(COLS - 1, Math.floor(resolved.x / TILE_SIZE)));
    const gr = Math.max(0, Math.min(ROWS - 1, Math.floor(resolved.y / TILE_SIZE)));

    if (startCell.c === gc && startCell.r === gr) {
        return [{ x: resolved.x, y: resolved.y }];
    }

    const total = COLS * ROWS;
    const gScore = new Float64Array(total).fill(Infinity);
    const fScore = new Float64Array(total).fill(Infinity);
    const parent = new Int32Array(total).fill(-1);
    const closed = new Uint8Array(total);
    const inOpen = new Uint8Array(total);

    const startIdx = startCell.r * COLS + startCell.c;
    const goalIdx = gr * COLS + gc;
    gScore[startIdx] = 0;
    fScore[startIdx] = Math.hypot(gc - startCell.c, gr - startCell.r);
    const open = [startIdx];
    inOpen[startIdx] = 1;

    let found = false;
    while (open.length > 0) {
        let bestPos = 0;
        let current = open[0];
        let bestF = fScore[current];
        for (let i = 1; i < open.length; i++) {
            const candidate = open[i];
            if (fScore[candidate] < bestF) {
                bestF = fScore[candidate];
                current = candidate;
                bestPos = i;
            }
        }
        open[bestPos] = open[open.length - 1];
        open.pop();
        inOpen[current] = 0;

        if (current === goalIdx) {
            found = true;
            break;
        }
        closed[current] = 1;

        const c = current % COLS;
        const r = Math.floor(current / COLS);
        for (const [dc, dr, baseCost] of ASTAR_DIRS) {
            const nc = c + dc;
            const nr = r + dr;
            if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
            const nIdx = nr * COLS + nc;
            if (closed[nIdx]) continue;
            const nt = getTileAtGrid(nc, nr);
            if (isSolidTileType(nt)) continue;
            if (dc !== 0 && dr !== 0) {
                if (isSolidTileType(getTileAtGrid(c + dc, r)) || isSolidTileType(getTileAtGrid(c, r + dr))) {
                    continue;
                }
            }

            const terrainMult = nt === TILE_ROAD ? 2.5 : 1.0;
            const tentativeG = gScore[current] + baseCost * terrainMult;
            if (tentativeG < gScore[nIdx]) {
                parent[nIdx] = current;
                gScore[nIdx] = tentativeG;
                fScore[nIdx] = tentativeG + Math.hypot(gc - nc, gr - nr);
                if (!inOpen[nIdx]) {
                    open.push(nIdx);
                    inOpen[nIdx] = 1;
                }
            }
        }
    }

    if (!found) {
        return [{ x: resolved.x, y: resolved.y }];
    }

    const cells = [];
    let cur = goalIdx;
    while (cur !== -1 && cur !== startIdx) {
        cells.push({ c: cur % COLS, r: Math.floor(cur / COLS) });
        cur = parent[cur];
    }
    cells.reverse();

    if (cells.length === 0) {
        return [{ x: resolved.x, y: resolved.y }];
    }

    const waypoints = cells.map((cell, idx) =>
        idx === cells.length - 1
            ? { x: resolved.x, y: resolved.y }
            : { x: (cell.c + 0.5) * TILE_SIZE, y: (cell.r + 0.5) * TILE_SIZE }
    );
    return waypoints;
}
