import {
    TILE_SIZE,
    HOME_DOOR,
    DELI_COUNTER,
    CAFE_COUNTERS,
    PRIME_SNIFF_SPOTS
} from './map.js';

export const WALKS = [
    {
        id: 'morning',
        number: 1,
        title: '08:00 Morning Stroll',
        shortLabel: 'Walk 1 · Morning',
        subtitle: 'Crisp Pimlico morning around Cambridge St & St George’s Square.',
        targetSteps: 350,
        targetPees: 2,
        targetPoops: 1,
        targetDogs: 3,
        requireDeli: false,
        dusk: false,
        rainCycleDry: [16, 22],
        rainCycleWet: [7, 10],
        witchSpeed: 84,
        witchRange: 138,
        trafficCount: 4,
        parTime: 135
    },
    {
        id: 'deli',
        number: 2,
        title: '13:00 Lunchtime Deli Run',
        shortLabel: 'Walk 2 · Deli Run',
        subtitle: "Stroll along Lupus St to Delizie d'Italia for Focaccia & a Puppuccino!",
        targetSteps: 450,
        targetPees: 2,
        targetPoops: 1,
        targetDogs: 3,
        requireDeli: true,
        dusk: false,
        rainCycleDry: [14, 19],
        rainCycleWet: [9, 12],
        witchSpeed: 92,
        witchRange: 146,
        trafficCount: 6,
        parTime: 165
    },
    {
        id: 'dusk',
        number: 3,
        title: '19:30 Rainy Dusk Stealth',
        shortLabel: 'Walk 3 · Dusk Stealth',
        subtitle: 'Warm streetlamps by the Thames, drizzle & Dragon Witch patrol.',
        targetSteps: 500,
        targetPees: 2,
        targetPoops: 2,
        targetDogs: 4,
        requireDeli: false,
        dusk: true,
        rainCycleDry: [9, 13],
        rainCycleWet: [10, 14],
        witchSpeed: 104,
        witchRange: 154,
        trafficCount: 7,
        parTime: 190
    }
];

export const COATS = [
    {
        id: 'turtleneck',
        name: 'Sage Jumper',
        emoji: '🧶',
        perk: 'Speedy trot & extra pal charm',
        speedMult: 1.12,
        rainShieldSec: 0,
        dinoShields: 0,
        primaryColor: '#34d399',
        strokeColor: '#065f46'
    },
    {
        id: 'raincoat',
        name: 'Velcro Raincoat',
        emoji: '🧥',
        perk: '12s dry paws in drizzle',
        speedMult: 0.96,
        rainShieldSec: 12,
        dinoShields: 0,
        primaryColor: '#f59e0b',
        strokeColor: '#78350f'
    },
    {
        id: 'dino',
        name: 'Dino Fleece',
        emoji: '🦖',
        perk: 'Locals swoon & forgive 1 slip',
        speedMult: 1.0,
        rainShieldSec: 3,
        dinoShields: 1,
        primaryColor: '#2dd4bf',
        strokeColor: '#115e59'
    }
];

export function getCoatById(id) {
    return COATS.find((c) => c.id === id) || COATS[0];
}

export function getWalkByIndex(idx) {
    return WALKS[Math.max(0, Math.min(WALKS.length - 1, idx))];
}

/**
 * Applies an Italian Deli visit at Delizie d'Italia (70 Lupus Street).
 */
export function applyDeliVisit(state) {
    state.carry.strength = 100;
    state.carry.focacciaTimer = 15;
    state.biscotti.mood = 'HAPPY';
    state.biscotti.sulkReason = '';
    state.biscotti.puppuccinoTimer = 10;
    state.biscotti.zoomiesTimer = Math.max(state.biscotti.zoomiesTimer, 8);
    state.deli.cooldown = state.deli.cooldownDuration;
    state.deli.dwell = 0;
    state.progress.deliVisited = true;
    state.score += 150;
}

/**
 * Applies an Iced Matcha order at Third Coffee, GAIL's, or Caffe Nero.
 */
export function applyCafeMatcha(state, cafe) {
    state.carry.strength = Math.min(100, state.carry.strength + 60);
    cafe.cooldown = cafe.cooldownDuration;
    cafe.dwell = 0;
    state.score += 45;
}

export function isWalkGoalsMet(state) {
    const w = state.walk;
    const p = state.progress;
    return (
        Math.floor(p.steps) >= w.targetSteps &&
        p.pees >= w.targetPees &&
        p.poops >= w.targetPoops &&
        p.friendlyDogs >= w.targetDogs &&
        (!w.requireDeli || p.deliVisited)
    );
}

function buildWitchWaypoints(walk) {
    const base = [
        { c: 15.5, r: 5.5 },
        { c: 24.5, r: 5.5 },
        { c: 24.5, r: 10.5 },
        { c: 24.5, r: 20.5 },
        { c: 15.5, r: 20.5 },
        { c: 15.5, r: 14.5 }
    ];
    if (walk.id === 'dusk') {
        base.splice(4, 0, { c: 24.5, r: 29.5 }, { c: 24.5, r: 20.5 });
    }
    return base;
}

function createVehicles(count) {
    const blueprints = [
        { kind: 'cab', axis: 'x', dir: -1, lane: 5.5, c: 30, speed: 124 },
        { kind: 'bus', axis: 'x', dir: 1, lane: 6.5, c: 12, speed: 104 },
        { kind: 'cab', axis: 'x', dir: -1, lane: 20.5, c: 28, speed: 122 },
        { kind: 'bus', axis: 'x', dir: 1, lane: 21.5, c: 6, speed: 102 },
        { kind: 'bike', axis: 'y', dir: 1, lane: 24.5, c: 8, speed: 140, route: 'belgrave-grosvenor' },
        { kind: 'cab', axis: 'x', dir: 1, lane: 30.5, c: 14, speed: 126 },
        { kind: 'bike', axis: 'x', dir: -1, lane: 5.5, c: 18, speed: 146 }
    ];
    return blueprints.slice(0, count).map((v) => ({
        kind: v.kind,
        axis: v.axis,
        dir: v.dir,
        route: v.route || null,
        x: v.axis === 'x' ? v.c * TILE_SIZE : v.lane * TILE_SIZE,
        y: v.axis === 'y' ? v.c * TILE_SIZE : v.lane * TILE_SIZE,
        baseSpeed: v.speed,
        currentSpeed: v.speed,
        stopped: false
    }));
}

export function createInitialState(walkIndex = 0, coatId = 'turtleneck') {
    const walk = getWalkByIndex(walkIndex);
    const coat = getCoatById(coatId);

    const rainDrops = [];
    for (let i = 0; i < 95; i++) {
        rainDrops.push({
            x: Math.random() * 1920,
            y: Math.random() * 1632,
            len: 10 + Math.random() * 9,
            speed: 310 + Math.random() * 130
        });
    }

    const startRaining = walk.id === 'dusk';

    return {
        walkIndex,
        walk,
        coatId: coat.id,
        coat,
        elapsed: 0,
        score: 0,
        hearts: 3,
        maxHearts: 3,
        dinoShieldsLeft: coat.dinoShields,
        screenShake: 0,
        hitInvuln: 0,
        progress: {
            steps: 0,
            pees: 0,
            poops: 0,
            friendlyDogs: 0,
            deliVisited: false,
            treatsCollected: 0
        },
        weather: {
            isRaining: startRaining,
            timer: startRaining ? 11 : walk.rainCycleDry[0]
        },
        rainDrops,
        carry: {
            x: HOME_DOOR.c * TILE_SIZE,
            y: HOME_DOOR.r * TILE_SIZE,
            speed: 148,
            strength: 100,
            isCarrying: false,
            facing: 'down',
            animTimer: 0,
            focacciaTimer: 0
        },
        biscotti: {
            x: HOME_DOOR.c * TILE_SIZE,
            y: (HOME_DOOR.r - 0.35) * TILE_SIZE,
            mood: 'HAPPY',
            sulkReason: '',
            facing: 'right',
            peeCooldown: 0,
            poopCooldown: 0,
            shiverOffset: 0,
            rainShieldLeft: coat.rainShieldSec,
            zoomiesTimer: 0,
            puppuccinoTimer: 0,
            sniffSpotId: null,
            sniffProgress: 0,
            nextAutoToilet: 'pee'
        },
        dragonWitch: {
            x: 24.5 * TILE_SIZE,
            y: 10.5 * TILE_SIZE,
            speed: walk.witchSpeed,
            angle: Math.PI,
            visionRange: walk.witchRange,
            visionSpread: Math.PI / 3.3,
            waypoints: buildWitchWaypoints(walk),
            wpIndex: 3,
            suspicion: 0,
            alertBeepCooldown: 0,
            lastKnownTarget: null
        },
        deli: {
            ...DELI_COUNTER,
            cooldown: 0,
            dwell: 0
        },
        cafes: CAFE_COUNTERS.map((c) => ({
            ...c,
            cooldown: 0,
            dwell: 0
        })),
        sniffSpots: PRIME_SNIFF_SPOTS.map((s) => ({
            ...s,
            cooldown: 0
        })),
        grassTileCooldowns: {},
        otherDogs: [
            { x: 19.5 * TILE_SIZE, y: 11.5 * TILE_SIZE, vx: 30, vy: 18, friendly: true, breed: 'Corgi', color: '#f59e0b', met: false, scareCooldown: 0, changeDirTimer: 2.2 },
            { x: 20.5 * TILE_SIZE, y: 25.5 * TILE_SIZE, vx: -26, vy: 24, friendly: true, breed: 'Poodle', color: '#f472b6', met: false, scareCooldown: 0, changeDirTimer: 2.6 },
            { x: 6.5 * TILE_SIZE, y: 26.5 * TILE_SIZE, vx: 34, vy: -22, friendly: true, breed: 'Whippet', color: '#38bdf8', met: false, scareCooldown: 0, changeDirTimer: 1.9 },
            { x: 20.5 * TILE_SIZE, y: 2.5 * TILE_SIZE, vx: -24, vy: 0, friendly: true, breed: 'Dachshund', color: '#a855f7', met: false, scareCooldown: 0, changeDirTimer: 2.4 },
            { x: 16.5 * TILE_SIZE, y: 7.5 * TILE_SIZE, vx: 32, vy: 0, friendly: false, breed: 'Bulldog', color: '#ef4444', met: false, scareCooldown: 0, changeDirTimer: 2.0 },
            { x: 35.5 * TILE_SIZE, y: 11.5 * TILE_SIZE, vx: 0, vy: 34, friendly: false, breed: 'Terrier', color: '#dc2626', met: false, scareCooldown: 0, changeDirTimer: 2.1 },
            { x: 3.5 * TILE_SIZE, y: 14.5 * TILE_SIZE, vx: 0, vy: -30, friendly: false, breed: 'Terrier', color: '#b91c1c', met: false, scareCooldown: 0, changeDirTimer: 2.3 }
        ],
        neighbors: [
            { x: 19.5 * TILE_SIZE, y: 4.5 * TILE_SIZE, vx: 36, vy: 0, angle: 0, name: 'Lord Higgins', color: '#60a5fa', angryTimer: 0, swoonTimer: 0, dirTimer: 3.1 },
            { x: 19.5 * TILE_SIZE, y: 19.5 * TILE_SIZE, vx: -36, vy: 0, angle: Math.PI, name: 'Mrs. Danvers', color: '#c084fc', angryTimer: 0, swoonTimer: 0, dirTimer: 2.8 },
            { x: 20.5 * TILE_SIZE, y: 27.5 * TILE_SIZE, vx: 30, vy: 0, angle: 0, name: 'Major Sterling', color: '#fbbf24', angryTimer: 0, swoonTimer: 0, dirTimer: 2.6 }
        ],
        vehicles: createVehicles(walk.trafficCount),
        treats: [
            { id: 't1', x: 19.5 * TILE_SIZE, y: 9.5 * TILE_SIZE, collected: false },
            { id: 't2', x: 19.5 * TILE_SIZE, y: 24.5 * TILE_SIZE, collected: false },
            { id: 't3', x: 18.5 * TILE_SIZE, y: 31.5 * TILE_SIZE, collected: false }
        ],
        marketSnacks: [
            { id: 's1', x: 35.5 * TILE_SIZE, y: 9.5 * TILE_SIZE, name: 'Tachbrook Sausage', emoji: '🌭', active: true, respawn: 0 },
            { id: 's2', x: 36.5 * TILE_SIZE, y: 11.5 * TILE_SIZE, name: 'Market Croissant', emoji: '🥐', active: true, respawn: 0 }
        ],
        puddlesAndPoops: [],
        pawprints: [],
        ripples: [],
        sparkles: [],
        floatingTexts: []
    };
}
