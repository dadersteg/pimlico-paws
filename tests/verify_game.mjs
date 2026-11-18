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
    TILE_ROAD,
    TILE_BUILDING,
    TILE_CAFE,
    TILE_DELI,
    TILE_HOME,
    TILE_ZEBRA,
    TILE_WATER,
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

test('1. Bundle builds cleanly (<165 KB), parses cleanly, and has zero meta text or em-dashes', () => {
    const res = buildBundle();
    assert.ok(fs.existsSync(res.outPath), 'index.html should exist');
    assert.ok(res.bytes < 165 * 1024, `Expected bundle < 165 KB, got ${res.sizeKb} KB`);

    const html = fs.readFileSync(res.outPath, 'utf8');
    assert.ok(!html.includes('cdn.tailwindcss.com'), 'Must not include runtime Tailwind CDN');
    assert.ok(!html.includes('MATCHA CAFE'), 'Generic MATCHA CAFE signage must be replaced by real cafes');
    assert.ok(!html.includes('exclusively at real cafes'), 'Must not leak prompt meta text');

    const tpl = fs.readFileSync(path.join(ROOT, 'src/template.html'), 'utf8');
    const bodyWithoutComments = tpl.replace(/<!--[\s\S]*?-->/g, '');
    assert.ok(!bodyWithoutComments.includes('—'), 'template.html player copy must contain zero em-dashes');

    const match = html.match(/<script>([\s\S]*?)<\/script>/);
    assert.ok(match && match[1], 'Bundled <script> block missing');
    assert.doesNotThrow(() => new vm.Script(match[1], { filename: 'index.html' }));
});

test('2. 40x34 Pimlico real-world geography and named venues', () => {
    assert.equal(PIMLICO_MAP.length, ROWS, 'Map must have 34 rows');
    assert.equal(ROWS, 34);
    assert.equal(COLS, 40);
    for (let r = 0; r < ROWS; r++) {
        assert.equal(PIMLICO_MAP[r].length, COLS, `Row ${r} must have exactly 40 cols`);
    }

    // 170A sits West of Cambridge St (c=8..9), South of Sussex St (r=14), North of Lupus St (r=20..21)
    assert.equal(getTileAtGrid(HOME_DOOR.tileC, HOME_DOOR.tileR), TILE_HOME);
    assert.equal(HOME_DOOR.tileC, 6);
    assert.equal(HOME_DOOR.tileR, 17);
    assert.ok(HOME_DOOR.tileC < 8 && HOME_DOOR.tileR > 14 && HOME_DOOR.tileR < 20);

    // Cambridge St (c=8..9) runs South past Sussex St and terminates at Lupus St (r=20..21)
    assert.equal(getTileAtGrid(8, 17), TILE_ROAD);
    assert.equal(getTileAtGrid(8, 20), TILE_ROAD);
    assert.notEqual(getTileAtGrid(8, 22), TILE_ROAD, 'Cambridge St must terminate at Lupus St');

    // North-to-South order: Eccleston Sq (r<5) < Warwick Way (r=5..6) < Warwick Sq (r=8..13)
    // < Lupus St (r=20..21) < St George's Sq (r=23..28) < Grosvenor Rd (r=30) < River Thames (r=32..33)
    assert.ok(isLegalToiletTile(getTileAtGrid(20, 2)), 'Eccleston Square North of Warwick Way');
    assert.equal(getTileAtGrid(10, 5), TILE_ROAD, 'Warwick Way');
    assert.ok(isLegalToiletTile(getTileAtGrid(19, 10)), 'Warwick Square South of Warwick Way');
    assert.equal(getTileAtGrid(10, 20), TILE_ROAD, 'Lupus Street');
    assert.ok(isLegalToiletTile(getTileAtGrid(19, 25)), "St George's Square South of Lupus Street");
    assert.equal(getTileAtGrid(10, 30), TILE_ROAD, 'Grosvenor Road');
    assert.equal(getTileAtGrid(20, 32), TILE_WATER, 'River Thames South of Grosvenor Road');

    // Delizie d'Italia (70 Lupus St) & Third Coffee (52 Lupus St), GAIL's (26 Churton St), Caffe Nero (31 Warwick Way)
    assert.equal(getTileAtGrid(DELI_COUNTER.tileC, DELI_COUNTER.tileR), TILE_DELI);
    assert.equal(getTileAtGrid(DELI_COUNTER.tileC + 1, DELI_COUNTER.tileR), TILE_DELI);
    assert.equal(DELI_COUNTER.tileR, 18, 'Delizie sits on North side of Lupus Street');

    assert.equal(CAFE_COUNTERS.length, 3, 'Should have 3 real Pimlico Matcha Cafes');
    const byId = Object.fromEntries(CAFE_COUNTERS.map((c) => [c.id, c]));
    assert.equal(byId['third-coffee'].tileR, 18, 'Third Coffee sits on North side of Lupus Street');
    assert.ok(byId['third-coffee'].tileC < DELI_COUNTER.tileC, 'Third Coffee (52 Lupus St) sits West of Delizie d\'Italia (70 Lupus St)');
    assert.equal(byId['gails-churton'].tileC, 28);
    assert.equal(byId['gails-churton'].tileR, 9);
    assert.equal(byId['caffe-nero'].tileC, 12);
    assert.equal(byId['caffe-nero'].tileR, 3);

    // Every TILE_CAFE on map maps 1:1 to CAFE_COUNTERS
    let cafeTileCount = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (getTileAtGrid(c, r) === TILE_CAFE) cafeTileCount++;
        }
    }
    assert.equal(cafeTileCount, CAFE_COUNTERS.length, 'Every TILE_CAFE must map 1:1 to real named cafes');

    // Zebra Crossings exist
    let zebraCount = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (getTileAtGrid(c, r) === TILE_ZEBRA) zebraCount++;
        }
    }
    assert.ok(zebraCount >= 18, 'Zebra crossings should span major Pimlico streets');
});

test('3. All spawned entities, counters & Prime Sniff Spots sit on walkable tiles', () => {
    for (let wIdx = 0; wIdx < WALKS.length; wIdx++) {
        const st = createInitialState(wIdx, 'turtleneck');
        assert.ok(canMoveTo(st.carry.x, st.carry.y, 11), `Walk ${wIdx + 1} Carry spawn must be walkable`);
        assert.ok(canMoveTo(st.biscotti.x, st.biscotti.y, 8), `Walk ${wIdx + 1} Biscotti spawn must be walkable`);

        const spawnDist = Math.hypot(st.carry.x - st.biscotti.x, st.carry.y - st.biscotti.y);
        assert.ok(spawnDist < 26, `Biscotti spawn distance (${spawnDist.toFixed(1)}px) must be < 26px`);

        assert.ok(canMoveTo(st.deli.x, st.deli.y, 11), 'Deli counter apron must be walkable');
        for (const cf of st.cafes) {
            assert.ok(canMoveTo(cf.x, cf.y, 11), `Cafe ${cf.name} apron must be walkable`);
        }
        for (const dog of st.otherDogs) {
            assert.ok(canMoveTo(dog.x, dog.y, 10), `Dog ${dog.breed} must spawn walkable`);
        }
        for (const nb of st.neighbors) {
            assert.ok(canMoveTo(nb.x, nb.y, 10), `Neighbour ${nb.name} must spawn walkable`);
        }
        for (const tr of st.treats) {
            assert.ok(canMoveTo(tr.x, tr.y, 8), `Treat ${tr.id} must spawn walkable`);
        }
        for (const ms of st.marketSnacks) {
            assert.ok(canMoveTo(ms.x, ms.y, 8), `Snack ${ms.name} must spawn walkable`);
        }
    }

    assert.ok(PRIME_SNIFF_SPOTS.length >= 9, 'Must have 9 Prime Sniff Spots across Pimlico squares');
    for (const spot of PRIME_SNIFF_SPOTS) {
        const tile = getTileAtPixel(spot.x, spot.y);
        assert.ok(isLegalToiletTile(tile), `Sniff spot ${spot.id} must sit on legal garden grass/tree`);
        assert.ok(canMoveTo(spot.x, spot.y, 8), `Sniff spot ${spot.id} must be walkable`);
    }
});

test('4. Dragon Witch patrol waypoints stay well clear of 170A spawn', () => {
    for (let wIdx = 0; wIdx < WALKS.length; wIdx++) {
        const st = createInitialState(wIdx, 'turtleneck');
        for (const wp of st.dragonWitch.waypoints) {
            const tileDist = Math.hypot(wp.c - HOME_DOOR.c, wp.r - HOME_DOOR.r);
            assert.ok(
                tileDist > 4.5,
                `Walk ${wIdx + 1} Witch waypoint (${wp.c}, ${wp.r}) too close to 170A (${tileDist.toFixed(2)} tiles)`
            );
        }
    }
});

test('5. Line of sight blocks across Regency buildings and stays open along avenues & Thames', () => {
    // Across Regency block between Cambridge St & St George's Dr (c=11..13, r=15)
    assert.equal(getTileAtGrid(12, 15), TILE_BUILDING);
    assert.equal(
        hasLineOfSight(12.5 * TILE_SIZE, 14.5 * TILE_SIZE, 12.5 * TILE_SIZE, 16.5 * TILE_SIZE),
        false,
        'Sightline through solid townhouse must be blocked'
    );

    // Along open Lupus Street (r=20.5, c=6 -> c=26)
    assert.equal(
        hasLineOfSight(6.5 * TILE_SIZE, 20.5 * TILE_SIZE, 26.5 * TILE_SIZE, 20.5 * TILE_SIZE),
        true,
        'Sightline along clear avenue must be open'
    );
});

test('6. findSafeDropSpot keeps Biscotti out of walls and Thames water', () => {
    // River Thames edge along Pimlico Gardens (r=31.7, c=20.5)
    const dropThames = findSafeDropSpot(20.5 * TILE_SIZE, 31.75 * TILE_SIZE, 8);
    assert.ok(canMoveTo(dropThames.x, dropThames.y, 8), 'Riverbank drop must stay on promenade');
    assert.notEqual(getTileAtPixel(dropThames.x, dropThames.y), TILE_WATER);

    // Next to 170A west wall (c=7.25, r=17.5)
    const dropHome = findSafeDropSpot(7.25 * TILE_SIZE, 17.5 * TILE_SIZE, 8);
    assert.ok(canMoveTo(dropHome.x, dropHome.y, 8), '170A drop must stay walkable');
});

test('7. Italian Deli & Cafe Matcha mechanics work as specified', () => {
    const st = createInitialState(1, 'raincoat');
    st.carry.strength = 22;
    st.biscotti.mood = 'SULKING';
    st.biscotti.sulkReason = 'Rainy Paws';

    applyDeliVisit(st);
    assert.equal(st.carry.strength, 100);
    assert.ok(st.carry.focacciaTimer > 0);
    assert.equal(st.biscotti.mood, 'HAPPY');
    assert.ok(st.biscotti.puppuccinoTimer > 0);
    assert.ok(st.biscotti.zoomiesTimer > 0);
    assert.equal(st.progress.deliVisited, true);

    st.carry.strength = 30;
    applyCafeMatcha(st, st.cafes[0]);
    assert.equal(st.carry.strength, 90);
    assert.equal(st.cafes[0].cooldown, st.cafes[0].cooldownDuration);
});
