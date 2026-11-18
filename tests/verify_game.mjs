import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import { buildBundle } from '../scripts/build.mjs';
import {
    TILE_SIZE,
    COLS,
    ROWS,
    PIMLICO_MAP,
    TILE_BUILDING,
    TILE_CAFE,
    TILE_DELI,
    TILE_HOME,
    TILE_ZEBRA,
    HOME_DOOR,
    DELI_COUNTER,
    CAFE_COUNTERS,
    PRIME_SNIFF_SPOTS,
    getTileAtGrid,
    getTileAtPixel,
    isLegalToiletTile,
    canMoveTo,
    findSafeDropSpot,
    hasLineOfSight
} from '../src/map.js';
import {
    WALKS,
    createInitialState,
    applyDeliVisit,
    applyCafeMatcha
} from '../src/entities.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('1. Bundle builds cleanly, parses without syntax error, and stays compact', () => {
    const res = buildBundle();
    assert.ok(fs.existsSync(res.outPath), 'index.html should exist');
    assert.ok(res.bytes < 160 * 1024, `Expected bundle < 160 KB, got ${res.sizeKb} KB`);

    const html = fs.readFileSync(res.outPath, 'utf8');
    assert.ok(!html.includes('cdn.tailwindcss.com'), 'Must not include runtime Tailwind CDN');
    assert.ok(!html.includes('__INLINED_STYLES__'), 'Styles placeholder must be replaced');
    assert.ok(!html.includes('__INLINED_SCRIPT__'), 'Script placeholder must be replaced');

    const match = html.match(/<script>([\s\S]*?)<\/script>/);
    assert.ok(match && match[1], 'Bundled <script> block missing');
    assert.doesNotThrow(() => new vm.Script(match[1], { filename: 'index.html' }));
});

test('2. 36x28 Pimlico map dimensions and architectural invariants', () => {
    assert.equal(PIMLICO_MAP.length, ROWS, 'Map must have 28 rows');
    assert.equal(ROWS, 28);
    assert.equal(COLS, 36);
    for (let r = 0; r < ROWS; r++) {
        assert.equal(PIMLICO_MAP[r].length, COLS, `Row ${r} must have exactly 36 cols`);
    }

    // 170A Home tile and spawn clearance
    assert.equal(getTileAtGrid(HOME_DOOR.tileC, HOME_DOOR.tileR), TILE_HOME);
    const s0 = createInitialState(0, 'turtleneck');
    assert.ok(canMoveTo(s0.carry.x, s0.carry.y, 11), 'Carry spawn outside 170A must be walkable');
    assert.ok(canMoveTo(s0.biscotti.x, s0.biscotti.y, 8), 'Biscotti spawn must be walkable');
    const spawnDist = Math.hypot(s0.carry.x - s0.biscotti.x, s0.carry.y - s0.biscotti.y);
    assert.ok(spawnDist < 26, `Biscotti spawn distance (${spawnDist.toFixed(1)}px) must be < 26px to avoid frame-1 phantom step`);

    // Italian Deli exists and has walkable counter apron
    assert.equal(getTileAtGrid(DELI_COUNTER.tileC, DELI_COUNTER.tileR), TILE_DELI);
    assert.equal(getTileAtGrid(DELI_COUNTER.tileC + 1, DELI_COUNTER.tileR), TILE_DELI);
    assert.ok(canMoveTo(DELI_COUNTER.x, DELI_COUNTER.y, 11), 'Deli counter apron must be walkable');

    // Matcha Cafes exist and are strictly confined to actual CAFE tiles
    assert.equal(CAFE_COUNTERS.length, 2, 'Should have 2 actual Matcha Cafes');
    let cafeTileCount = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (getTileAtGrid(c, r) === TILE_CAFE) cafeTileCount++;
        }
    }
    assert.equal(cafeTileCount, CAFE_COUNTERS.length, 'Every TILE_CAFE on map must map 1:1 to a real cafe counter');
    for (const cf of CAFE_COUNTERS) {
        assert.equal(getTileAtGrid(cf.tileC, cf.tileR), TILE_CAFE);
        assert.ok(canMoveTo(cf.x, cf.y, 11), `Cafe ${cf.id} apron must be walkable`);
        assert.ok(
            Math.hypot(cf.x - (cf.tileC + 0.5) * TILE_SIZE, cf.y - (cf.tileR + 0.5) * TILE_SIZE) < TILE_SIZE * 1.6,
            `Cafe ${cf.id} apron must sit right outside its cafe facade`
        );
    }

    // Zebra Crossings exist
    let zebraCount = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (getTileAtGrid(c, r) === TILE_ZEBRA) zebraCount++;
        }
    }
    assert.ok(zebraCount >= 12, 'Zebra crossings should span the main avenues');

    // Prime Sniff Spots sit on legal garden grass
    assert.ok(PRIME_SNIFF_SPOTS.length >= 8, 'Must have at least 8 Prime Sniff Spots');
    for (const spot of PRIME_SNIFF_SPOTS) {
        const tile = getTileAtPixel(spot.x, spot.y);
        assert.ok(isLegalToiletTile(tile), `Sniff spot ${spot.id} must sit on legal garden grass/tree`);
        assert.ok(canMoveTo(spot.x, spot.y, 8), `Sniff spot ${spot.id} must be walkable`);
    }
});

test('3. Dragon Witch patrol waypoints stay clear of 170A spawn', () => {
    for (let wIdx = 0; wIdx < WALKS.length; wIdx++) {
        const st = createInitialState(wIdx, 'turtleneck');
        const spawnTileX = HOME_DOOR.c;
        const spawnTileY = 1.55;
        for (const wp of st.dragonWitch.waypoints) {
            const tileDist = Math.hypot(wp.c - spawnTileX, wp.r - spawnTileY);
            assert.ok(
                tileDist > 3.5,
                `Walk ${wIdx + 1} Witch waypoint (${wp.c}, ${wp.r}) is too close to spawn (${tileDist.toFixed(2)} tiles)`
            );
        }
    }
});

test('4. Line of sight blocks across Regency buildings and opens along avenues', () => {
    // Across solid building block (c=1..2, r=7..8) between pavement above (r=6.5) and below (r=9.5)
    assert.equal(getTileAtGrid(1, 7), TILE_BUILDING);
    assert.equal(
        hasLineOfSight(1.5 * TILE_SIZE, 6.2 * TILE_SIZE, 1.5 * TILE_SIZE, 9.5 * TILE_SIZE),
        false,
        'Sightline through solid townhouse must be blocked'
    );

    // Along open Warwick Way road (r=3.5, c=5 -> c=14)
    assert.equal(
        hasLineOfSight(5.5 * TILE_SIZE, 3.5 * TILE_SIZE, 14.5 * TILE_SIZE, 3.5 * TILE_SIZE),
        true,
        'Sightline along clear avenue must be open'
    );
});

test('5. findSafeDropSpot keeps Biscotti out of walls from any wall side', () => {
    // North wall flush: carry right under row 0 building at (2.5, 1.26)
    const dropN = findSafeDropSpot(2.5 * TILE_SIZE, 1.25 * TILE_SIZE, 8);
    assert.ok(canMoveTo(dropN.x, dropN.y, 8), 'North-wall drop must be walkable');

    // West wall flush: carry beside col 0 wall at (1.25, 1.5)
    const dropW = findSafeDropSpot(1.25 * TILE_SIZE, 1.5 * TILE_SIZE, 8);
    assert.ok(canMoveTo(dropW.x, dropW.y, 8), 'West-wall drop must be walkable');

    // East wall flush: carry beside col 35 wall at (34.75, 1.5)
    const dropE = findSafeDropSpot(34.75 * TILE_SIZE, 1.5 * TILE_SIZE, 8);
    assert.ok(canMoveTo(dropE.x, dropE.y, 8), 'East-wall drop must be walkable');

    // South wall flush: carry just above row 27 wall at (12.5, 26.75)
    const dropS = findSafeDropSpot(12.5 * TILE_SIZE, 26.75 * TILE_SIZE, 8);
    assert.ok(canMoveTo(dropS.x, dropS.y, 8), 'South-wall drop must be walkable');
});

test('6. Italian Deli visit & Cafe Matcha mechanics work as specified', () => {
    const st = createInitialState(1, 'raincoat'); // Walk 2 (Deli Run)
    st.carry.strength = 22;
    st.biscotti.mood = 'SULKING';
    st.biscotti.sulkReason = 'Rainy Paws';

    applyDeliVisit(st);
    assert.equal(st.carry.strength, 100, 'Deli Focaccia must restore strength to 100');
    assert.ok(st.carry.focacciaTimer > 0, 'Deli Focaccia must grant stamina timer');
    assert.equal(st.biscotti.mood, 'HAPPY', 'Deli Puppuccino must cheer Biscotti up');
    assert.ok(st.biscotti.puppuccinoTimer > 0, 'Deli must set whipped-cream nose timer');
    assert.ok(st.biscotti.zoomiesTimer > 0, 'Deli Puppuccino must trigger Zoomies');
    assert.equal(st.progress.deliVisited, true, 'Deli goal flag must be recorded');

    st.carry.strength = 30;
    const cafe = st.cafes[0];
    applyCafeMatcha(st, cafe);
    assert.equal(st.carry.strength, 90, 'Cafe Matcha must add +60% strength');
    assert.equal(cafe.cooldown, cafe.cooldownDuration, 'Cafe must enter brew cooldown');
});
