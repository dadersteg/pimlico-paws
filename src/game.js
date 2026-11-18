import { SoundFX } from './audio.js';
import {
    TILE_SIZE,
    BASE_WIDTH,
    BASE_HEIGHT,
    TILE_ROAD,
    TILE_ZEBRA,
    HOME_DOOR,
    getTileAtPixel,
    isLegalToiletTile,
    canMoveTo,
    findSafeDropSpot,
    hasLineOfSight
} from './map.js';
import {
    WALKS,
    COATS,
    getCoatById,
    createInitialState,
    applyDeliVisit,
    applyCafeMatcha,
    isWalkGoalsMet
} from './entities.js';
import { computeCamera, renderFrame } from './renderer.js';

const STORAGE_KEY = 'pimlico_paws_v2';

function loadSaveData() {
    const fallback = { unlockedWalk: 0, stars: [0, 0, 0], highScore: 0, muted: false };
    try {
        if (typeof localStorage === 'undefined') return fallback;
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return {
            unlockedWalk: Number.isInteger(parsed.unlockedWalk) ? Math.max(0, Math.min(2, parsed.unlockedWalk)) : 0,
            stars: Array.isArray(parsed.stars) ? parsed.stars.slice(0, 3) : [0, 0, 0],
            highScore: Number(parsed.highScore) || 0,
            muted: Boolean(parsed.muted)
        };
    } catch (_) {
        return fallback;
    }
}

function writeSaveData(save) {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
        }
    } catch (_) {}
}

export function initApp() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const sfx = new SoundFX();

    let save = loadSaveData();
    sfx.setMuted(save.muted);

    let selectedWalkIndex = 0;
    let selectedCoatId = 'turtleneck';
    let gameState = 'START'; // START | PLAYING | PAUSED | VICTORY | GAMEOVER
    let state = createInitialState(selectedWalkIndex, selectedCoatId);
    let cam = { x: 0, y: 0, viewW: 768, viewH: 528, zoom: 1 };
    let viewW = 768;
    let viewH = 528;

    const keys = {};
    const uiState = {
        tapTarget: null,
        stick: {
            active: false,
            pointerId: null,
            originX: 0,
            originY: 0,
            knobX: 0,
            knobY: 0,
            dx: 0,
            dy: 0,
            downTime: 0,
            moved: false
        }
    };

    let pawTimer = 0;
    let rippleTimer = 0;
    let sparkleTimer = 0;

    function addFloatingText(x, y, text, color = '#ffffff', duration = 1.7) {
        state.floatingTexts.push({ x, y, text, color, life: duration, maxLife: duration });
    }

    function dist(x1, y1, x2, y2) {
        return Math.hypot(x2 - x1, y2 - y1);
    }

    function makeBiscottiSulk(reason) {
        if (state.carry.isCarrying) return;
        if (state.biscotti.zoomiesTimer > 0) return;
        if (state.biscotti.mood !== 'SULKING') {
            state.biscotti.mood = 'SULKING';
            state.biscotti.sulkReason = reason;
            state.biscotti.sniffProgress = 0;
            addFloatingText(state.biscotti.x, state.biscotti.y - 18, `🥶 ${reason}! Pick up!`, '#fda4af', 2.2);
            updateHUD();
        }
    }

    function findNearestSafeKerb(px, py) {
        const offsets = [
            [0, -48], [0, 48], [-48, 0], [48, 0],
            [0, -96], [0, 96], [-96, 0], [96, 0],
            [-48, -48], [48, -48], [-48, 48], [48, 48]
        ];
        for (const [ox, oy] of offsets) {
            const tx = px + ox;
            const ty = py + oy;
            const t = getTileAtPixel(tx, ty);
            if (t !== TILE_ROAD && canMoveTo(tx, ty, 11)) {
                return { x: tx, y: ty };
            }
        }
        return findSafeDropSpot(px, py, 11);
    }

    function applyEtiquettePenalty(reason, nearbyNeighbor) {
        if (state.dinoShieldsLeft > 0) {
            state.dinoShieldsLeft--;
            if (nearbyNeighbor) nearbyNeighbor.swoonTimer = 4.0;
            addFloatingText(state.carry.x, state.carry.y - 24, '🦖 Dino Fleece charm saved you!', '#6ee7b7', 2.2);
            return;
        }
        state.hearts = Math.max(0, state.hearts - 1);
        state.screenShake = 0.14;
        if (nearbyNeighbor) nearbyNeighbor.angryTimer = 4.5;
        sfx.yell();
        addFloatingText(state.carry.x, state.carry.y - 24, `💔 ${reason}`, '#fda4af', 2.2);
        updateHUD();
        if (state.hearts <= 0) {
            triggerGameOver(false, 'SW1V Etiquette Failed!', 'Too many Pimlico infractions! Carry & Biscotti hurried back home in embarrassment.');
        }
    }

    function performToiletAction(type, fromSniffSpot = null) {
        const b = state.biscotti;
        const tile = getTileAtPixel(b.x, b.y);
        const isLegal = isLegalToiletTile(tile);
        const tileKey = `${Math.floor(b.x / TILE_SIZE)},${Math.floor(b.y / TILE_SIZE)}`;

        if (isLegal && !fromSniffSpot && (state.grassTileCooldowns[tileKey] || 0) > 0) {
            addFloatingText(b.x, b.y - 16, 'Find a fresh patch of grass!', '#fde68a', 1.5);
            return false;
        }

        if (type === 'pee') {
            if (b.peeCooldown > 0 && !fromSniffSpot) {
                addFloatingText(b.x, b.y - 15, 'Bladder empty right now!', '#cbd5e1', 1.2);
                return false;
            }
            sfx.pee();
            b.peeCooldown = 3.0;
            state.puddlesAndPoops.push({ x: b.x, y: b.y + 4, type: 'pee', illegal: !isLegal, timer: 0 });
            if (isLegal) {
                state.progress.pees++;
                const bonus = fromSniffSpot && fromSniffSpot.bonus ? 100 : 50;
                state.score += bonus;
                state.grassTileCooldowns[tileKey] = 24;
                if (fromSniffSpot) fromSniffSpot.cooldown = 20;
                addFloatingText(b.x, b.y - 18, `💦 Garden Wee! +${bonus}`, '#7dd3fc', 1.8);
            } else {
                addFloatingText(b.x, b.y - 20, '💢 Pavement Wee!', '#fda4af', 1.8);
                makeBiscottiSulk('Scolded');
                const witness = findWitnessNeighbor(b.x, b.y);
                if (witness) applyEtiquettePenalty('Witnessed pavement wee!', witness);
            }
            updateHUD();
            return true;
        }

        // Poop
        if (b.poopCooldown > 0 && !fromSniffSpot) {
            addFloatingText(b.x, b.y - 15, 'Not ready to poop yet!', '#cbd5e1', 1.2);
            return false;
        }
        sfx.poop();
        b.poopCooldown = 4.5;
        state.puddlesAndPoops.push({
            x: b.x,
            y: b.y + 4,
            type: 'poop',
            illegal: !isLegal,
            timer: 10.0,
            age: 0,
            scolded: false
        });
        if (isLegal) {
            state.grassTileCooldowns[tileKey] = 24;
            if (fromSniffSpot) fromSniffSpot.cooldown = 20;
            addFloatingText(b.x, b.y - 18, '💩 Bag within 10s!', '#fde68a', 2.0);
        } else {
            addFloatingText(b.x, b.y - 20, '💢 Pavement Poop! Bag fast!', '#fda4af', 2.0);
            makeBiscottiSulk('Embarrassed');
        }
        updateHUD();
        return true;
    }

    function doPeeAction() {
        if (gameState !== 'PLAYING') return;
        if (state.carry.isCarrying) {
            addFloatingText(state.carry.x, state.carry.y - 18, 'Put Biscotti down first!', '#fde68a', 1.4);
            return;
        }
        performToiletAction('pee');
    }

    function doPoopAction() {
        if (gameState !== 'PLAYING') return;
        if (state.carry.isCarrying) {
            addFloatingText(state.carry.x, state.carry.y - 18, 'Put Biscotti down first!', '#fde68a', 1.4);
            return;
        }
        performToiletAction('poop');
    }

    function toggleCarryDog() {
        if (gameState !== 'PLAYING') return;
        if (state.carry.isCarrying) {
            state.carry.isCarrying = false;
            const drop = findSafeDropSpot(state.carry.x, state.carry.y, 8);
            state.biscotti.x = drop.x;
            state.biscotti.y = drop.y;
            if (!state.weather.isRaining || state.biscotti.rainShieldLeft > 0) {
                state.biscotti.mood = 'HAPPY';
                state.biscotti.sulkReason = '';
            }
            addFloatingText(state.carry.x, state.carry.y - 18, '⬇️ Down you go!', '#a7f3d0', 1.3);
        } else {
            const reach = state.biscotti.mood === 'SULKING' ? 115 : 88;
            if (dist(state.carry.x, state.carry.y, state.biscotti.x, state.biscotti.y) > reach) {
                addFloatingText(state.carry.x, state.carry.y - 18, 'Move closer to Biscotti!', '#fde68a', 1.3);
                return;
            }
            if (state.carry.strength < 8) {
                addFloatingText(state.carry.x, state.carry.y - 18, 'Arms tired! Visit a Cafe or Deli!', '#fda4af', 1.7);
                return;
            }
            state.carry.isCarrying = true;
            state.biscotti.mood = 'HAPPY';
            state.biscotti.sulkReason = '';
            state.biscotti.sniffProgress = 0;
            sfx.pickup();
            addFloatingText(state.carry.x, state.carry.y - 20, '🤱 Snuggled safe!', '#f9a8d4', 1.4);
        }
        updateHUD();
    }

    function bagPoopAtIndex(idx) {
        const p = state.puddlesAndPoops[idx];
        state.puddlesAndPoops.splice(idx, 1);
        sfx.pickup();
        if (!p.illegal) {
            state.progress.poops++;
            state.score += 75;
            addFloatingText(state.carry.x, state.carry.y - 20, '🛍️ Bagged & Binned! +75', '#6ee7b7', 1.8);
            const admirer = state.neighbors.find((n) => dist(n.x, n.y, state.carry.x, state.carry.y) < 130);
            if (admirer) {
                admirer.swoonTimer = 2.5;
                state.score += 100;
                addFloatingText(admirer.x, admirer.y - 22, '🎩 Splendid manners! +100', '#a7f3d0', 2.0);
            }
        } else {
            state.score += 30;
            addFloatingText(state.carry.x, state.carry.y - 20, '🛍️ Cleaned pavement mess!', '#fde68a', 1.6);
        }
        updateHUD();
    }

    function getSmartActionContext() {
        const c = state.carry;
        const b = state.biscotti;

        // 1. Unbagged poop nearby
        for (let i = state.puddlesAndPoops.length - 1; i >= 0; i--) {
            const p = state.puddlesAndPoops[i];
            if (p.type === 'poop' && dist(c.x, c.y, p.x, p.y) <= 68) {
                return { kind: 'bag', index: i, label: `🛍️ Bag (${Math.ceil(p.timer)}s)`, cls: 'ctx-poop' };
            }
        }

        // 2. Home door when goals complete
        if (
            isWalkGoalsMet(state) &&
            dist(c.x, c.y, HOME_DOOR.c * TILE_SIZE, HOME_DOOR.r * TILE_SIZE) <= 64
        ) {
            return { kind: 'home', label: '🏡 Enter 170A!', cls: 'ctx-home' };
        }

        // 3. Dropped Market Snack tempting Biscotti
        for (const ms of state.marketSnacks) {
            if (ms.active && dist(b.x, b.y, ms.x, ms.y) <= 72 && !c.isCarrying) {
                return { kind: 'leave', snack: ms, label: '✋ Leave It!', cls: 'ctx-deli' };
            }
        }

        // 4. Delizie d'Italia Italian Deli
        if (dist(c.x, c.y, state.deli.x, state.deli.y) <= 58) {
            if (state.deli.cooldown <= 0) {
                return { kind: 'deli', label: '🥪 Deli & Pupp!', cls: 'ctx-deli' };
            }
            return { kind: 'deli-wait', label: `🥪 Prep ${Math.ceil(state.deli.cooldown)}s`, cls: '' };
        }

        // 5. Matcha Cafes
        for (const cf of state.cafes) {
            if (dist(c.x, c.y, cf.x, cf.y) <= 56) {
                if (cf.cooldown <= 0) {
                    return { kind: 'cafe', cafe: cf, label: '🍵 Order Matcha', cls: '' };
                }
                return { kind: 'cafe-wait', label: `🍵 Brew ${Math.ceil(cf.cooldown)}s`, cls: '' };
            }
        }

        // 6. On grass: toggle between wee & poop
        const bTile = getTileAtPixel(b.x, b.y);
        if (!c.isCarrying && isLegalToiletTile(bTile)) {
            if (state.progress.pees < state.walk.targetPees) {
                return { kind: 'pee', label: '💦 Garden Wee', cls: '' };
            }
            if (state.progress.poops < state.walk.targetPoops) {
                return { kind: 'poop', label: '💩 Garden Poop', cls: '' };
            }
            return { kind: 'pee', label: '🌿 Sniff / Wee', cls: '' };
        }

        return { kind: 'pee', label: '🌿 Sniff / Wee', cls: '' };
    }

    function executeSmartAction() {
        if (gameState !== 'PLAYING') return;
        const ctxAction = getSmartActionContext();
        if (ctxAction.kind === 'bag') {
            bagPoopAtIndex(ctxAction.index);
        } else if (ctxAction.kind === 'home') {
            completeVictory();
        } else if (ctxAction.kind === 'leave') {
            ctxAction.snack.active = false;
            ctxAction.snack.respawn = 18;
            state.score += 75;
            sfx.treat();
            addFloatingText(state.biscotti.x, state.biscotti.y - 20, '✋ Good Leave It! +75', '#6ee7b7', 1.8);
            updateHUD();
        } else if (ctxAction.kind === 'deli') {
            serveDeli();
        } else if (ctxAction.kind === 'deli-wait') {
            addFloatingText(state.deli.x, state.deli.y - 20, 'Making fresh focaccia...', '#fed7aa', 1.2);
        } else if (ctxAction.kind === 'cafe') {
            serveCafe(ctxAction.cafe);
        } else if (ctxAction.kind === 'cafe-wait') {
            addFloatingText(state.carry.x, state.carry.y - 20, 'Whisking fresh matcha...', '#a7f3d0', 1.2);
        } else if (ctxAction.kind === 'poop') {
            doPoopAction();
        } else {
            doPeeAction();
        }
    }

    function serveDeli() {
        applyDeliVisit(state);
        sfx.deli();
        sfx.zoomies();
        addFloatingText(state.carry.x, state.carry.y - 24, '🥪 Focaccia & 🥛 Puppuccino! ZOOMIES!', '#fed7aa', 2.4);
        updateHUD();
    }

    function serveCafe(cafe) {
        applyCafeMatcha(state, cafe);
        sfx.matcha();
        addFloatingText(state.carry.x, state.carry.y - 22, '🍵 Iced Matcha! +60% Strength!', '#6ee7b7', 2.0);
        updateHUD();
    }

    function findWitnessNeighbor(px, py) {
        for (const n of state.neighbors) {
            const d = dist(n.x, n.y, px, py);
            if (d < 95) return n;
            if (d < 135) {
                const ang = Math.atan2(py - n.y, px - n.x);
                let diff = ang - n.angle;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                if (Math.abs(diff) < 0.6) return n;
            }
        }
        return null;
    }

    function completeVictory() {
        sfx.win();
        const timeBonus = Math.max(0, Math.round((state.walk.parTime - state.elapsed) * 3));
        const heartBonus = state.hearts * 100;
        state.score += 300 + timeBonus + heartBonus;
        let stars = 1;
        if (state.hearts === 3 && state.elapsed <= state.walk.parTime) stars = 3;
        else if (state.hearts >= 2) stars = 2;

        save.stars[selectedWalkIndex] = Math.max(save.stars[selectedWalkIndex] || 0, stars);
        if (selectedWalkIndex + 1 < WALKS.length && save.unlockedWalk < selectedWalkIndex + 1) {
            save.unlockedWalk = selectedWalkIndex + 1;
        }
        save.highScore = Math.max(save.highScore || 0, state.score);
        writeSaveData(save);

        triggerGameOver(
            true,
            `${state.walk.shortLabel} Complete!`,
            `Carry and Biscotti strolled through Pimlico, avoided the Dragon Witch, and sneaked safely back into 170A!`,
            stars
        );
    }

    function update(dt) {
        if (gameState !== 'PLAYING') return;

        state.elapsed += dt;
        if (state.screenShake > 0) state.screenShake = Math.max(0, state.screenShake - dt);
        if (state.hitInvuln > 0) state.hitInvuln = Math.max(0, state.hitInvuln - dt);

        // Cooldowns
        if (state.biscotti.peeCooldown > 0) state.biscotti.peeCooldown = Math.max(0, state.biscotti.peeCooldown - dt);
        if (state.biscotti.poopCooldown > 0) state.biscotti.poopCooldown = Math.max(0, state.biscotti.poopCooldown - dt);
        if (state.biscotti.zoomiesTimer > 0) state.biscotti.zoomiesTimer = Math.max(0, state.biscotti.zoomiesTimer - dt);
        if (state.biscotti.puppuccinoTimer > 0) state.biscotti.puppuccinoTimer = Math.max(0, state.biscotti.puppuccinoTimer - dt);
        if (state.carry.focacciaTimer > 0) state.carry.focacciaTimer = Math.max(0, state.carry.focacciaTimer - dt);
        if (state.deli.cooldown > 0) state.deli.cooldown = Math.max(0, state.deli.cooldown - dt);

        for (const cf of state.cafes) {
            if (cf.cooldown > 0) cf.cooldown = Math.max(0, cf.cooldown - dt);
        }
        for (const s of state.sniffSpots) {
            if (s.cooldown > 0) s.cooldown = Math.max(0, s.cooldown - dt);
        }
        for (const k of Object.keys(state.grassTileCooldowns)) {
            state.grassTileCooldowns[k] -= dt;
            if (state.grassTileCooldowns[k] <= 0) delete state.grassTileCooldowns[k];
        }

        // Weather
        state.weather.timer -= dt;
        if (state.weather.timer <= 0) {
            state.weather.isRaining = !state.weather.isRaining;
            const [minW, maxW] = state.weather.isRaining ? state.walk.rainCycleWet : state.walk.rainCycleDry;
            state.weather.timer = minW + Math.random() * (maxW - minW);
            if (state.weather.isRaining) {
                addFloatingText(state.carry.x, state.carry.y - 26, '🌧️ Pimlico Drizzle!', '#7dd3fc', 2.2);
            } else {
                addFloatingText(state.carry.x, state.carry.y - 26, '☀️ Sun peeking through!', '#fde68a', 2.0);
                if (state.biscotti.mood === 'SULKING' && state.biscotti.sulkReason === 'Rainy Paws') {
                    state.biscotti.mood = 'HAPPY';
                    state.biscotti.sulkReason = '';
                }
            }
            updateHUD();
        }

        if (state.weather.isRaining) {
            for (const r of state.rainDrops) {
                r.y += r.speed * dt;
                r.x -= 42 * dt;
                if (r.y > BASE_HEIGHT) {
                    r.y = -10;
                    r.x = Math.random() * BASE_WIDTH;
                }
                if (r.x < 0) r.x = BASE_WIDTH;
            }
            rippleTimer -= dt;
            if (rippleTimer <= 0) {
                rippleTimer = 0.14;
                state.ripples.push({
                    x: cam.x + Math.random() * cam.viewW,
                    y: cam.y + Math.random() * cam.viewH,
                    r: 2,
                    alpha: 1
                });
            }
            if (!state.carry.isCarrying && state.biscotti.zoomiesTimer <= 0) {
                if (state.biscotti.rainShieldLeft > 0) {
                    state.biscotti.rainShieldLeft = Math.max(0, state.biscotti.rainShieldLeft - dt);
                } else if (state.biscotti.mood !== 'SULKING') {
                    makeBiscottiSulk('Rainy Paws');
                }
            }
        }

        for (let i = state.ripples.length - 1; i >= 0; i--) {
            state.ripples[i].r += 22 * dt;
            state.ripples[i].alpha -= 1.6 * dt;
            if (state.ripples[i].alpha <= 0) state.ripples.splice(i, 1);
        }

        state.biscotti.shiverOffset = Math.sin(performance.now() * 0.05) * 1.8;

        // Movement Input: Keyboard > Floating Thumbstick > Tap-to-Walk
        let dx = 0;
        let dy = 0;
        if (keys.ArrowUp || keys.KeyW) dy -= 1;
        if (keys.ArrowDown || keys.KeyS) dy += 1;
        if (keys.ArrowLeft || keys.KeyA) dx -= 1;
        if (keys.ArrowRight || keys.KeyD) dx += 1;

        if (dx !== 0 || dy !== 0) {
            const len = Math.hypot(dx, dy);
            dx /= len;
            dy /= len;
            uiState.tapTarget = null;
        } else if (uiState.stick.active && (Math.abs(uiState.stick.dx) > 0.08 || Math.abs(uiState.stick.dy) > 0.08)) {
            dx = uiState.stick.dx;
            dy = uiState.stick.dy;
            const len = Math.hypot(dx, dy);
            if (len > 1) {
                dx /= len;
                dy /= len;
            }
            uiState.tapTarget = null;
        } else if (uiState.tapTarget) {
            const tdx = uiState.tapTarget.x - state.carry.x;
            const tdy = uiState.tapTarget.y - state.carry.y;
            const tDist = Math.hypot(tdx, tdy);
            if (tDist > 10) {
                dx = tdx / tDist;
                dy = tdy / tDist;
            } else {
                uiState.tapTarget = null;
            }
        }

        if (Math.abs(dx) > Math.abs(dy)) state.carry.facing = dx < 0 ? 'left' : 'right';
        else if (Math.abs(dy) > 0.05) state.carry.facing = dy < 0 ? 'up' : 'down';

        // Strength & Focaccia stamina
        if (state.carry.isCarrying) {
            const drainRate = state.carry.focacciaTimer > 0 ? 4.2 : 10.2;
            state.carry.strength -= drainRate * dt;
            if (state.carry.strength <= 0) {
                state.carry.strength = 0;
                state.carry.isCarrying = false;
                const drop = findSafeDropSpot(state.carry.x, state.carry.y, 8);
                state.biscotti.x = drop.x;
                state.biscotti.y = drop.y;
                addFloatingText(state.carry.x, state.carry.y - 22, '💪 Arms exhausted! Need Matcha!', '#fda4af', 2.0);
                if (state.weather.isRaining && state.biscotti.rainShieldLeft <= 0) {
                    makeBiscottiSulk('Rainy Paws');
                }
            }
        } else {
            state.carry.strength = Math.min(100, state.carry.strength + 2.4 * dt);
        }

        let speedMult = state.carry.isCarrying ? 0.9 : state.coat.speedMult;
        if (state.carry.focacciaTimer > 0) speedMult *= 1.12;
        if (state.biscotti.zoomiesTimer > 0) speedMult *= 1.65;
        let effectiveSpeed = state.carry.speed * speedMult;

        // Leash tug on sulk or dropped market sausage
        if (!state.carry.isCarrying && state.biscotti.mood === 'SULKING') {
            if (dist(state.carry.x + dx * 8, state.carry.y + dy * 8, state.biscotti.x, state.biscotti.y) > 46) {
                effectiveSpeed = 20;
            }
        }
        let snackPulling = null;
        if (!state.carry.isCarrying && state.biscotti.zoomiesTimer <= 0) {
            for (const ms of state.marketSnacks) {
                if (ms.active && dist(state.biscotti.x, state.biscotti.y, ms.x, ms.y) < 58) {
                    snackPulling = ms;
                    if (dist(state.carry.x + dx * 8, state.carry.y + dy * 8, ms.x, ms.y) > 54) {
                        effectiveSpeed *= 0.45;
                    }
                    break;
                }
            }
        }

        const nextX = state.carry.x + dx * effectiveSpeed * dt;
        const nextY = state.carry.y + dy * effectiveSpeed * dt;
        let movedDist = 0;
        if (canMoveTo(nextX, state.carry.y, 11)) {
            movedDist += Math.abs(nextX - state.carry.x);
            state.carry.x = nextX;
        }
        if (canMoveTo(state.carry.x, nextY, 11)) {
            movedDist += Math.abs(nextY - state.carry.y);
            state.carry.y = nextY;
        }
        if (movedDist > 0.05) state.carry.animTimer += dt * 10;

        // Biscotti follow + steps + pawprints + sparkles
        if (state.carry.isCarrying) {
            state.biscotti.x = state.carry.x;
            state.biscotti.y = state.carry.y;
        } else if (snackPulling) {
            const ang = Math.atan2(snackPulling.y - state.biscotti.y, snackPulling.x - state.biscotti.x);
            const bx = state.biscotti.x + Math.cos(ang) * 44 * dt;
            const by = state.biscotti.y + Math.sin(ang) * 44 * dt;
            if (canMoveTo(bx, state.biscotti.y, 8)) state.biscotti.x = bx;
            if (canMoveTo(state.biscotti.x, by, 8)) state.biscotti.y = by;
            if (dist(state.biscotti.x, state.biscotti.y, snackPulling.x, snackPulling.y) < 16) {
                snackPulling.active = false;
                snackPulling.respawn = 20;
                sfx.yell();
                makeBiscottiSulk('Tummy Ache');
                addFloatingText(state.biscotti.x, state.biscotti.y - 20, `🤢 Ate ${snackPulling.name}!`, '#fda4af', 2.1);
            }
        } else if (state.biscotti.mood === 'HAPPY') {
            const d = dist(state.carry.x, state.carry.y, state.biscotti.x, state.biscotti.y);
            if (d > 26) {
                const angle = Math.atan2(state.carry.y - state.biscotti.y, state.carry.x - state.biscotti.x);
                const followSpeed = effectiveSpeed * 0.98;
                const stepX = Math.cos(angle) * followSpeed * dt;
                const stepY = Math.sin(angle) * followSpeed * dt;
                if (canMoveTo(state.biscotti.x + stepX, state.biscotti.y, 8)) state.biscotti.x += stepX;
                if (canMoveTo(state.biscotti.x, state.biscotti.y + stepY, 8)) state.biscotti.y += stepY;
                if (stepX > 0.08) state.biscotti.facing = 'right';
                else if (stepX < -0.08) state.biscotti.facing = 'left';

                const stepMult = state.biscotti.zoomiesTimer > 0 ? 0.72 : 0.36;
                state.progress.steps += Math.hypot(stepX, stepY) * stepMult;

                pawTimer -= dt;
                if (pawTimer <= 0) {
                    pawTimer = 0.14;
                    state.pawprints.push({ x: state.biscotti.x, y: state.biscotti.y + 8, alpha: 1 });
                }
            }
        }

        if (state.biscotti.zoomiesTimer > 0) {
            sparkleTimer -= dt;
            if (sparkleTimer <= 0) {
                sparkleTimer = 0.05;
                const cols = ['#f472b6', '#fbbf24', '#34d399', '#38bdf8'];
                state.sparkles.push({
                    x: state.biscotti.x + (Math.random() - 0.5) * 14,
                    y: state.biscotti.y + (Math.random() - 0.5) * 14,
                    size: 2.2 + Math.random() * 2,
                    color: cols[Math.floor(Math.random() * cols.length)],
                    alpha: 1
                });
            }
        }

        for (let i = state.pawprints.length - 1; i >= 0; i--) {
            state.pawprints[i].alpha -= 0.35 * dt;
            if (state.pawprints[i].alpha <= 0) state.pawprints.splice(i, 1);
        }
        for (let i = state.sparkles.length - 1; i >= 0; i--) {
            state.sparkles[i].y -= 14 * dt;
            state.sparkles[i].alpha -= 1.8 * dt;
            if (state.sparkles[i].alpha <= 0) state.sparkles.splice(i, 1);
        }

        // Auto-Sniff Spots (No button fumbling!)
        let activeSniff = null;
        if (!state.carry.isCarrying && state.biscotti.mood === 'HAPPY') {
            for (const s of state.sniffSpots) {
                if (s.cooldown <= 0 && dist(state.biscotti.x, state.biscotti.y, s.x, s.y) <= 34) {
                    activeSniff = s;
                    break;
                }
            }
        }
        if (activeSniff) {
            if (state.biscotti.sniffSpotId !== activeSniff.id) {
                state.biscotti.sniffSpotId = activeSniff.id;
                state.biscotti.sniffProgress = 0;
                sfx.sniff();
            }
            state.biscotti.sniffProgress += dt / 1.05;
            if (state.biscotti.sniffProgress >= 1) {
                state.biscotti.sniffProgress = 0;
                state.biscotti.sniffSpotId = null;
                let action = 'pee';
                if (state.progress.pees >= state.walk.targetPees && state.progress.poops < state.walk.targetPoops) {
                    action = 'poop';
                } else if (state.progress.poops < state.walk.targetPoops && state.biscotti.nextAutoToilet === 'poop') {
                    action = 'poop';
                }
                state.biscotti.nextAutoToilet = action === 'pee' ? 'poop' : 'pee';
                performToiletAction(action, activeSniff);
            }
        } else {
            state.biscotti.sniffSpotId = null;
            state.biscotti.sniffProgress = 0;
        }

        // Italian Deli & Cafe Counter Dwell Auto-Serve
        if (dist(state.carry.x, state.carry.y, state.deli.x, state.deli.y) <= 44 && state.deli.cooldown <= 0) {
            state.deli.dwell += dt;
            if (state.deli.dwell >= 0.42) serveDeli();
        } else {
            state.deli.dwell = 0;
        }

        for (const cf of state.cafes) {
            if (dist(state.carry.x, state.carry.y, cf.x, cf.y) <= 42 && cf.cooldown <= 0 && state.carry.strength < 92) {
                cf.dwell += dt;
                if (cf.dwell >= 0.42) serveCafe(cf);
            } else {
                cf.dwell = 0;
            }
        }

        // Crunchy Dog Treats (3 => Zoomies!)
        for (const tr of state.treats) {
            if (!tr.collected && dist(state.carry.x, state.carry.y, tr.x, tr.y) < 30) {
                tr.collected = true;
                state.progress.treatsCollected++;
                state.score += 50;
                sfx.treat();
                if (state.progress.treatsCollected >= 3) {
                    state.biscotti.zoomiesTimer = 8;
                    sfx.zoomies();
                    addFloatingText(state.biscotti.x, state.biscotti.y - 22, '⚡ 3 Treats! SIGHTHOUND ZOOMIES!', '#fbbf24', 2.2);
                } else {
                    addFloatingText(tr.x, tr.y - 18, `🦴 Treat ${state.progress.treatsCollected}/3!`, '#fde68a', 1.6);
                }
            }
        }

        for (const ms of state.marketSnacks) {
            if (!ms.active) {
                ms.respawn -= dt;
                if (ms.respawn <= 0) ms.active = true;
            }
        }

        // Other Dogs AI
        for (const d of state.otherDogs) {
            if (d.scareCooldown > 0) d.scareCooldown -= dt;
            d.changeDirTimer -= dt;
            if (d.changeDirTimer <= 0) {
                const ang = Math.random() * Math.PI * 2;
                d.vx = Math.cos(ang) * 32;
                d.vy = Math.sin(ang) * 32;
                d.changeDirTimer = 2 + Math.random() * 2.5;
            }
            const nx = d.x + d.vx * dt;
            const ny = d.y + d.vy * dt;
            if (canMoveTo(nx, d.y, 10)) d.x = nx;
            else d.vx *= -1;
            if (canMoveTo(d.x, ny, 10)) d.y = ny;
            else d.vy *= -1;

            const tx = state.carry.isCarrying ? state.carry.x : state.biscotti.x;
            const ty = state.carry.isCarrying ? state.carry.y : state.biscotti.y;
            if (dist(d.x, d.y, tx, ty) < 32) {
                if (d.friendly && !d.met) {
                    d.met = true;
                    state.progress.friendlyDogs++;
                    const bonus = state.coatId === 'turtleneck' ? 125 : 75;
                    state.score += bonus;
                    sfx.barkGood();
                    if (d.breed === 'Whippet') {
                        state.biscotti.zoomiesTimer = Math.max(state.biscotti.zoomiesTimer, 8);
                        sfx.zoomies();
                        addFloatingText(d.x, d.y - 20, `⚡ Whippet pals! ZOOMIES! +${bonus}`, '#7dd3fc', 2.2);
                    } else {
                        addFloatingText(d.x, d.y - 20, `🐶 Met ${d.breed}! +${bonus}`, '#6ee7b7', 1.9);
                    }
                    if (state.biscotti.mood === 'SULKING' && !state.weather.isRaining) {
                        state.biscotti.mood = 'HAPPY';
                        state.biscotti.sulkReason = '';
                    }
                } else if (!d.friendly && d.scareCooldown <= 0 && state.biscotti.zoomiesTimer <= 0) {
                    d.scareCooldown = 4.5;
                    state.screenShake = 0.12;
                    sfx.barkBad();
                    addFloatingText(d.x, d.y - 20, `⚡ ${d.breed} barked!`, '#fda4af', 2.0);
                    makeBiscottiSulk(`Spooked by ${d.breed}`);
                }
            }
        }

        // Unbagged Poop Timers + Auto-Bag Grace
        for (let i = state.puddlesAndPoops.length - 1; i >= 0; i--) {
            const p = state.puddlesAndPoops[i];
            if (p.type !== 'poop') continue;
            p.age += dt;
            if (p.age > 0.8 && dist(state.carry.x, state.carry.y, p.x, p.y) <= 22) {
                bagPoopAtIndex(i);
                continue;
            }
            if (p.timer > 0) {
                p.timer -= dt;
                if (p.timer <= 0 && !p.scolded) {
                    p.scolded = true;
                    makeBiscottiSulk('Unbagged Mess');
                    const witness = findWitnessNeighbor(p.x, p.y);
                    if (witness) applyEtiquettePenalty('Left poop unbagged!', witness);
                }
            }
        }

        // Neighbours AI
        for (const n of state.neighbors) {
            if (n.angryTimer > 0) n.angryTimer -= dt;
            if (n.swoonTimer > 0) n.swoonTimer -= dt;
            n.dirTimer -= dt;
            if (n.dirTimer <= 0) {
                const dirs = [
                    { vx: 34, vy: 0 },
                    { vx: -34, vy: 0 },
                    { vx: 0, vy: 34 },
                    { vx: 0, vy: -34 }
                ];
                const pick = dirs[Math.floor(Math.random() * dirs.length)];
                n.vx = pick.vx;
                n.vy = pick.vy;
                n.dirTimer = 2.5 + Math.random() * 2;
            }
            const nx = n.x + n.vx * dt;
            const ny = n.y + n.vy * dt;
            if (canMoveTo(nx, n.y, 10)) n.x = nx;
            else n.vx *= -1;
            if (canMoveTo(n.x, ny, 10)) n.y = ny;
            else n.vy *= -1;
            if (Math.hypot(n.vx, n.vy) > 1) n.angle = Math.atan2(n.vy, n.vx);
        }

        // Vehicles & Zebra Yielding
        for (const v of state.vehicles) {
            const lookAhead = 46;
            const lx = v.axis === 'x' ? v.x + v.dir * lookAhead : v.x;
            const ly = v.axis === 'y' ? v.y + v.dir * lookAhead : v.y;
            const aheadTile = getTileAtPixel(lx, ly);
            let shouldYield = false;
            if (aheadTile === TILE_ZEBRA) {
                if (dist(lx, ly, state.carry.x, state.carry.y) < 52 || dist(lx, ly, state.biscotti.x, state.biscotti.y) < 52) {
                    shouldYield = true;
                }
            }
            v.stopped = shouldYield;
            v.currentSpeed = shouldYield ? 0 : v.baseSpeed;

            if (v.axis === 'x') {
                v.x += v.dir * v.currentSpeed * dt;
                if (v.x > BASE_WIDTH + 32) v.x = -32;
                if (v.x < -32) v.x = BASE_WIDTH + 32;
            } else {
                v.y += v.dir * v.currentSpeed * dt;
                if (v.y > BASE_HEIGHT + 32) v.y = -32;
                if (v.y < -32) v.y = BASE_HEIGHT + 32;
            }

            if (!v.stopped && state.hitInvuln <= 0 && dist(v.x, v.y, state.carry.x, state.carry.y) < 22) {
                state.hitInvuln = 2.5;
                sfx.horn();
                makeBiscottiSulk('Traffic Honk');
                const nudge = findNearestSafeKerb(state.carry.x, state.carry.y);
                state.carry.x = nudge.x;
                state.carry.y = nudge.y;
                applyEtiquettePenalty('Jaywalked in traffic!', null);
            }
        }

        // Dragon Witch Patrol + Wall-Occluded Sight + 1.25s Suspicion Gauge
        {
            const w = state.dragonWitch;
            const wp = w.waypoints[w.wpIndex];
            const twx = wp.c * TILE_SIZE;
            const twy = wp.r * TILE_SIZE;
            if (dist(w.x, w.y, twx, twy) < 6) {
                w.wpIndex = (w.wpIndex + 1) % w.waypoints.length;
            } else {
                const tang = Math.atan2(twy - w.y, twx - w.x);
                w.angle = tang;
                w.x += Math.cos(tang) * w.speed * dt;
                w.y += Math.sin(tang) * w.speed * dt;
            }

            const targets = [{ x: state.carry.x, y: state.carry.y }];
            if (!state.carry.isCarrying) targets.push({ x: state.biscotti.x, y: state.biscotti.y });

            let spottedThisFrame = false;
            for (const t of targets) {
                const dw = dist(w.x, w.y, t.x, t.y);
                if (dw < 18 && hasLineOfSight(w.x, w.y, t.x, t.y)) {
                    sfx.witchCaught();
                    triggerGameOver(false, 'Caught by the Dragon Witch!', 'Carry & Biscotti bumped straight into the Dragon Witch from 170!');
                    return;
                }
                if (dw < w.visionRange) {
                    const angTo = Math.atan2(t.y - w.y, t.x - w.x);
                    let diff = angTo - w.angle;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    if (Math.abs(diff) < w.visionSpread / 2 && hasLineOfSight(w.x, w.y, t.x, t.y)) {
                        spottedThisFrame = true;
                        break;
                    }
                }
            }

            if (spottedThisFrame) {
                w.suspicion += dt / 1.25;
                w.alertBeepCooldown -= dt;
                if (w.alertBeepCooldown <= 0) {
                    w.alertBeepCooldown = 0.28;
                    sfx.suspicionTick();
                }
                if (w.suspicion >= 1) {
                    sfx.witchCaught();
                    triggerGameOver(
                        false,
                        'Spotted by the Dragon Witch!',
                        'She held you in her glowing red gaze! Duck behind Regency townhouses, garden railings, or cafes to break her sightline.'
                    );
                    return;
                }
            } else {
                w.suspicion = Math.max(0, w.suspicion - dt * 0.75);
            }
        }

        // Victory Check at 170A
        if (isWalkGoalsMet(state)) {
            const dxDoor = HOME_DOOR.c * TILE_SIZE;
            const dyDoor = HOME_DOOR.r * TILE_SIZE;
            if (
                dist(state.carry.x, state.carry.y, dxDoor, dyDoor) < 42 &&
                (state.carry.isCarrying || dist(state.biscotti.x, state.biscotti.y, dxDoor, dyDoor) < 68)
            ) {
                completeVictory();
                return;
            }
        }

        // Floating texts
        for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
            state.floatingTexts[i].y -= 17 * dt;
            state.floatingTexts[i].life -= dt;
            if (state.floatingTexts[i].life <= 0) state.floatingTexts.splice(i, 1);
        }

        updateHUD();
    }

    function updateHUD() {
        const w = state.walk;
        const p = state.progress;
        const stepsInt = Math.floor(p.steps);

        document.getElementById('steps-val').textContent = `${stepsInt}/${w.targetSteps}`;
        document.getElementById('pee-val').textContent = `${p.pees}/${w.targetPees}`;
        document.getElementById('poop-val').textContent = `${p.poops}/${w.targetPoops}`;
        document.getElementById('dogs-val').textContent = `${p.friendlyDogs}/${w.targetDogs}`;

        const deliPill = document.getElementById('goal-deli');
        if (w.requireDeli) {
            deliPill.classList.remove('hidden');
            deliPill.classList.toggle('done', p.deliVisited);
            document.getElementById('deli-val').textContent = p.deliVisited ? '1/1' : '0/1';
        } else {
            deliPill.classList.add('hidden');
        }

        document.getElementById('goal-steps').classList.toggle('done', stepsInt >= w.targetSteps);
        document.getElementById('goal-pee').classList.toggle('done', p.pees >= w.targetPees);
        document.getElementById('goal-poop').classList.toggle('done', p.poops >= w.targetPoops);
        document.getElementById('goal-dogs').classList.toggle('done', p.friendlyDogs >= w.targetDogs);

        document.getElementById('walk-badge').textContent = w.shortLabel;
        document.getElementById('score-chip').textContent = `★ ${state.score}`;

        // Hearts
        const heartsStr = '❤️'.repeat(state.hearts) + '🤍'.repeat(Math.max(0, state.maxHearts - state.hearts));
        document.getElementById('hearts-val').textContent = heartsStr;

        // Strength Bar
        const strPct = Math.round(state.carry.strength);
        const isFoc = state.carry.focacciaTimer > 0;
        const strText = document.getElementById('strength-text');
        if (strText) strText.textContent = `${strPct}%`;

        for (const barId of ['strength-bar', 'strength-bar-mob']) {
            const bar = document.getElementById(barId);
            if (!bar) continue;
            bar.style.width = `${strPct}%`;
            bar.classList.toggle('low', strPct < 25 && !isFoc);
            bar.classList.toggle('focaccia', isFoc);
        }
        for (const pillId of ['strength-pill', 'strength-pill-mob']) {
            const pill = document.getElementById(pillId);
            if (pill) pill.classList.toggle('focaccia', isFoc);
        }

        // Biscotti Mood
        const statusEl = document.getElementById('biscotti-status');
        statusEl.className = 'mood-pill';
        if (state.carry.isCarrying) {
            statusEl.textContent = '🤱 Snuggled';
            statusEl.classList.add('carried');
        } else if (state.biscotti.zoomiesTimer > 0) {
            statusEl.textContent = `⚡ Zoomies ${Math.ceil(state.biscotti.zoomiesTimer)}s`;
            statusEl.classList.add('zoomies');
        } else if (state.biscotti.mood === 'SULKING') {
            statusEl.textContent = `🥶 ${state.biscotti.sulkReason}`;
            statusEl.classList.add('sulking');
        } else {
            statusEl.textContent = '✨ Happy';
        }

        // Weather
        const wb = document.getElementById('weather-badge');
        wb.textContent = state.weather.isRaining ? '🌧️ Drizzle' : state.walk.dusk ? '🌙 Dusk' : '☀️ Sunny';
        wb.classList.toggle('raining', state.weather.isRaining);

        // Action Buttons
        const carryBtn = document.getElementById('btn-carry');
        const carryLabel = document.getElementById('carry-btn-label');
        carryLabel.textContent = state.carry.isCarrying ? '⬇️ Put Down' : '🤱 Pick Up';
        carryBtn.classList.toggle('urgent', !state.carry.isCarrying && state.biscotti.mood === 'SULKING');

        const smartBtn = document.getElementById('btn-smart');
        const smartLabel = document.getElementById('smart-btn-label');
        const smartCtx = getSmartActionContext();
        smartLabel.textContent = smartCtx.label;
        smartBtn.className = `action-btn mobile-primary btn-smart ${smartCtx.cls}`;

        const banner = document.getElementById('return-home-banner');
        banner.classList.toggle('hidden', !(isWalkGoalsMet(state) && gameState === 'PLAYING'));
    }

    function renderStartPickers() {
        const walkGrid = document.getElementById('walk-picker-grid');
        walkGrid.innerHTML = '';
        WALKS.forEach((w, idx) => {
            const unlocked = idx <= save.unlockedWalk;
            const st = save.stars[idx] || 0;
            const starTxt = st > 0 ? '★'.repeat(st) + '☆'.repeat(3 - st) : unlocked ? 'Ready' : 'Locked';
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `picker-card ${idx === selectedWalkIndex ? 'selected' : ''} ${!unlocked ? 'locked' : ''}`;
            btn.innerHTML = `
                <div class="picker-emoji">${w.dusk ? '🌙' : w.requireDeli ? '🥪' : '☀️'}</div>
                <div class="picker-name">Walk ${w.number}</div>
                <div class="picker-meta">${starTxt}</div>
            `;
            btn.addEventListener('click', () => {
                if (!unlocked) return;
                selectedWalkIndex = idx;
                renderStartPickers();
                updateStartPreview();
            });
            walkGrid.appendChild(btn);
        });

        const coatGrid = document.getElementById('coat-picker-grid');
        coatGrid.innerHTML = '';
        COATS.forEach((c) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `picker-card ${c.id === selectedCoatId ? 'selected' : ''}`;
            btn.innerHTML = `
                <div class="picker-emoji">${c.emoji}</div>
                <div class="picker-name">${c.name}</div>
                <div class="picker-meta">${c.perk}</div>
            `;
            btn.addEventListener('click', () => {
                selectedCoatId = c.id;
                renderStartPickers();
            });
            coatGrid.appendChild(btn);
        });
    }

    function updateStartPreview() {
        const w = WALKS[selectedWalkIndex];
        document.getElementById('start-walk-desc').textContent = w.subtitle;
        document.getElementById('start-goal-steps').textContent = `${w.targetSteps} Steps`;
        document.getElementById('start-goal-pees').textContent = `${w.targetPees} Garden Wees`;
        document.getElementById('start-goal-poops').textContent = `${w.targetPoops} Bagged Poop${w.targetPoops > 1 ? 's' : ''}`;
        document.getElementById('start-goal-dogs').textContent = `${w.targetDogs} Friendly Pals`;
        const deliGoalRow = document.getElementById('start-goal-deli');
        deliGoalRow.classList.toggle('hidden', !w.requireDeli);
    }

    function showModalView(viewName) {
        const overlay = document.getElementById('modal-overlay');
        const vStart = document.getElementById('view-start');
        const vPause = document.getElementById('view-pause');
        const vResult = document.getElementById('view-result');

        vStart.classList.add('hidden');
        vPause.classList.add('hidden');
        vResult.classList.add('hidden');

        if (!viewName) {
            overlay.classList.add('hidden');
            return;
        }
        overlay.classList.remove('hidden');
        if (viewName === 'start') vStart.classList.remove('hidden');
        if (viewName === 'pause') vPause.classList.remove('hidden');
        if (viewName === 'result') vResult.classList.remove('hidden');
    }

    function startNewWalk(walkIdx = selectedWalkIndex) {
        selectedWalkIndex = walkIdx;
        sfx.init();
        state = createInitialState(selectedWalkIndex, selectedCoatId);
        uiState.tapTarget = null;
        uiState.stick.active = false;
        cam = computeCamera(state, viewW, viewH, viewW < 640 ? 1.12 : 1.0, null);
        gameState = 'PLAYING';
        showModalView(null);
        updateHUD();
        addFloatingText(state.carry.x, state.carry.y - 22, "Let's walk, Biscotti!", '#6ee7b7', 2.0);
    }

    function triggerGameOver(isVictory, heading, description, stars = 0) {
        gameState = isVictory ? 'VICTORY' : 'GAMEOVER';
        const resBanner = document.getElementById('result-banner');
        resBanner.className = `result-banner ${isVictory ? 'victory' : 'gameover'}`;
        document.getElementById('result-emoji').textContent = isVictory ? '🏆🐕‍🦺🥪' : '🧙‍♀️💥😭';
        document.getElementById('result-heading').textContent = heading;
        document.getElementById('result-desc').textContent = description;
        document.getElementById('result-stars').textContent = isVictory ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '—';
        document.getElementById('result-stars').classList.toggle('hidden', !isVictory);

        document.getElementById('stat-score').textContent = `${state.score}`;
        document.getElementById('stat-time').textContent = `${Math.round(state.elapsed)}s`;
        document.getElementById('stat-pals').textContent = `${state.progress.friendlyDogs}/${state.walk.targetDogs}`;
        document.getElementById('stat-hearts').textContent = `${state.hearts}/${state.maxHearts}`;

        const nextBtn = document.getElementById('result-next-btn');
        const hasNext = isVictory && selectedWalkIndex + 1 < WALKS.length;
        nextBtn.classList.toggle('hidden', !hasNext);
        document.getElementById('result-retry-btn').textContent = isVictory ? '🔄 Replay Walk' : '🔄 Try Again';
        showModalView('result');
    }

    function togglePause() {
        if (gameState === 'PLAYING') {
            gameState = 'PAUSED';
            showModalView('pause');
        } else if (gameState === 'PAUSED') {
            gameState = 'PLAYING';
            showModalView(null);
        }
    }

    function syncMuteButtons() {
        const icon = save.muted ? '🔇' : '🔊';
        for (const id of ['mute-btn', 'mute-btn-mob']) {
            const el = document.getElementById(id);
            if (el) el.textContent = icon;
        }
    }

    function toggleMute() {
        save.muted = !save.muted;
        sfx.setMuted(save.muted);
        writeSaveData(save);
        syncMuteButtons();
    }

    function resizeCanvas() {
        const stage = canvas.parentElement;
        const rect = stage.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        viewW = Math.max(260, Math.floor(rect.width));
        viewH = Math.max(220, Math.floor(rect.height));
        canvas.width = Math.floor(viewW * dpr);
        canvas.height = Math.floor(viewH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Unified Pointer Events for Floating Thumbstick + Tap-to-Walk + Tap-on-Biscotti
    canvas.addEventListener('pointerdown', (e) => {
        if (gameState !== 'PLAYING') return;
        e.preventDefault();
        sfx.init();
        const rect = canvas.getBoundingClientRect();
        const lx = e.clientX - rect.left;
        const ly = e.clientY - rect.top;

        uiState.stick.active = false;
        uiState.stick.pointerId = e.pointerId;
        uiState.stick.originX = lx;
        uiState.stick.originY = ly;
        uiState.stick.knobX = lx;
        uiState.stick.knobY = ly;
        uiState.stick.dx = 0;
        uiState.stick.dy = 0;
        uiState.stick.downTime = performance.now();
        uiState.stick.moved = false;
        try {
            canvas.setPointerCapture(e.pointerId);
        } catch (_) {}
    });

    canvas.addEventListener('pointermove', (e) => {
        if (uiState.stick.pointerId !== e.pointerId || gameState !== 'PLAYING') return;
        const rect = canvas.getBoundingClientRect();
        const lx = e.clientX - rect.left;
        const ly = e.clientY - rect.top;
        const dx = lx - uiState.stick.originX;
        const dy = ly - uiState.stick.originY;
        const len = Math.hypot(dx, dy);

        if (len > 10) {
            uiState.stick.moved = true;
            uiState.stick.active = true;
            const clamped = Math.min(42, len);
            const nx = (dx / len) * clamped;
            const ny = (dy / len) * clamped;
            uiState.stick.knobX = uiState.stick.originX + nx;
            uiState.stick.knobY = uiState.stick.originY + ny;
            uiState.stick.dx = nx / 42;
            uiState.stick.dy = ny / 42;
        }
    });

    function releasePointer(e, isCancel = false) {
        if (uiState.stick.pointerId !== e.pointerId) return;
        const wasMoved = uiState.stick.moved;
        const elapsed = performance.now() - uiState.stick.downTime;
        const rect = canvas.getBoundingClientRect();
        const lx = e.clientX - rect.left;
        const ly = e.clientY - rect.top;

        uiState.stick.pointerId = null;
        uiState.stick.active = false;
        uiState.stick.dx = 0;
        uiState.stick.dy = 0;

        if (!isCancel && !wasMoved && elapsed < 250 && gameState === 'PLAYING') {
            const wx = cam.x + lx / cam.zoom;
            const wy = cam.y + ly / cam.zoom;

            // Tap directly on Biscotti / Carry to toggle Pick Up!
            const targetDog = state.carry.isCarrying ? state.carry : state.biscotti;
            if (dist(wx, wy, targetDog.x, targetDog.y) <= 28) {
                toggleCarryDog();
                return;
            }
            uiState.tapTarget = { x: wx, y: wy };
        }
    }

    canvas.addEventListener('pointerup', (e) => releasePointer(e, false));
    canvas.addEventListener('pointercancel', (e) => releasePointer(e, true));

    // Keyboard Support (Arrow keys + WASD + Actions + Modal Enter/Space)
    window.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }
        keys[e.code] = true;

        if (e.code === 'Escape' || e.code === 'KeyP') {
            if (gameState === 'PLAYING' || gameState === 'PAUSED') togglePause();
            return;
        }

        if (gameState !== 'PLAYING') {
            if (e.code === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                if (gameState === 'START') startNewWalk(selectedWalkIndex);
                else if (gameState === 'PAUSED') togglePause();
                else if (gameState === 'VICTORY' && selectedWalkIndex + 1 < WALKS.length) startNewWalk(selectedWalkIndex + 1);
                else if (gameState === 'VICTORY' || gameState === 'GAMEOVER') startNewWalk(selectedWalkIndex);
            }
            return;
        }

        if (e.code === 'KeyZ') doPeeAction();
        else if (e.code === 'KeyX') doPoopAction();
        else if (e.code === 'KeyC') toggleCarryDog();
        else if (e.code === 'Space' || e.code === 'KeyE') executeSmartAction();
    });

    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    function bindButton(id, fn) {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('click', (e) => {
            e.preventDefault();
            sfx.init();
            fn();
        });
    }

    bindButton('btn-carry', toggleCarryDog);
    bindButton('btn-smart', executeSmartAction);
    bindButton('btn-pee', doPeeAction);
    bindButton('btn-poop', doPoopAction);

    bindButton('start-game-btn', () => startNewWalk(selectedWalkIndex));
    bindButton('help-btn', togglePause);
    bindButton('help-btn-mob', togglePause);
    bindButton('pause-resume-btn', togglePause);
    bindButton('pause-restart-btn', () => startNewWalk(selectedWalkIndex));
    bindButton('pause-menu-btn', () => {
        gameState = 'START';
        renderStartPickers();
        updateStartPreview();
        showModalView('start');
    });

    bindButton('result-retry-btn', () => startNewWalk(selectedWalkIndex));
    bindButton('result-next-btn', () => startNewWalk(Math.min(WALKS.length - 1, selectedWalkIndex + 1)));
    bindButton('result-menu-btn', () => {
        gameState = 'START';
        renderStartPickers();
        updateStartPreview();
        showModalView('start');
    });

    bindButton('mute-btn', toggleMute);
    bindButton('mute-btn-mob', toggleMute);

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 100));

    resizeCanvas();
    renderStartPickers();
    updateStartPreview();
    syncMuteButtons();
    updateHUD();
    showModalView('start');
    cam = computeCamera(state, viewW, viewH, viewW < 640 ? 1.12 : 1.0, null);

    let lastTime = performance.now();
    function loop(now) {
        const dt = Math.min(0.08, (now - lastTime) / 1000);
        lastTime = now;

        update(dt);
        const zoom = viewW < 640 ? 1.12 : 1.0;
        cam = computeCamera(state, viewW, viewH, zoom, cam);
        renderFrame(ctx, state, cam, viewW, viewH, uiState);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initApp);
}
