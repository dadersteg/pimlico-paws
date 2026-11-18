import {
    TILE_SIZE,
    COLS,
    ROWS,
    BASE_WIDTH,
    BASE_HEIGHT,
    TILE_ROAD,
    TILE_BUILDING,
    TILE_PAVEMENT,
    TILE_GRASS,
    TILE_HOME,
    TILE_CAFE,
    TILE_TREE,
    TILE_DELI,
    TILE_ZEBRA,
    TILE_RAILING,
    TILE_STALL,
    TILE_WATER,
    HOME_DOOR,
    DELI_COUNTER,
    CAFE_COUNTERS,
    STREET_LABELS,
    getTileAtGrid,
    getGrassJoinMask,
    castVisionRay
} from './map.js';
import { isWalkGoalsMet } from './entities.js';

export function computeCamera(state, viewW, viewH, zoom, prevCamera) {
    const worldViewW = viewW / zoom;
    const worldViewH = viewH / zoom;
    let targetX = state.carry.x - worldViewW / 2;
    let targetY = state.carry.y - worldViewH / 2;

    if (worldViewW >= BASE_WIDTH) {
        targetX = (BASE_WIDTH - worldViewW) / 2;
    } else {
        targetX = Math.max(0, Math.min(BASE_WIDTH - worldViewW, targetX));
    }
    if (worldViewH >= BASE_HEIGHT) {
        targetY = (BASE_HEIGHT - worldViewH) / 2;
    } else {
        targetY = Math.max(0, Math.min(BASE_HEIGHT - worldViewH, targetY));
    }

    if (!prevCamera || prevCamera.x == null) {
        return { x: targetX, y: targetY, viewW: worldViewW, viewH: worldViewH, zoom };
    }
    const lerp = 0.18;
    return {
        x: prevCamera.x + (targetX - prevCamera.x) * lerp,
        y: prevCamera.y + (targetY - prevCamera.y) * lerp,
        viewW: worldViewW,
        viewH: worldViewH,
        zoom
    };
}

function draw25DShadows(ctx, startC, endC, startR, endR) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
    for (let r = startR; r <= endR; r++) {
        for (let c = startC; c <= endC; c++) {
            const t = getTileAtGrid(c, r);
            if (
                t === TILE_BUILDING ||
                t === TILE_HOME ||
                t === TILE_CAFE ||
                t === TILE_DELI ||
                t === TILE_STALL
            ) {
                const x = c * TILE_SIZE;
                const y = r * TILE_SIZE;
                ctx.fillRect(x + 7, y + 7, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

function drawTile(ctx, r, c, t, goalsMet, isDusk, nowMs) {
    const x = c * TILE_SIZE;
    const y = r * TILE_SIZE;

    if (t === TILE_ROAD || t === TILE_ZEBRA) {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Kerb border next to pavements
        const n = getTileAtGrid(c, r - 1);
        const s = getTileAtGrid(c, r + 1);
        const w = getTileAtGrid(c - 1, r);
        const e = getTileAtGrid(c + 1, r);
        ctx.fillStyle = '#94a3b8';
        if (n !== TILE_ROAD && n !== TILE_ZEBRA) ctx.fillRect(x, y, TILE_SIZE, 2.5);
        if (s !== TILE_ROAD && s !== TILE_ZEBRA) ctx.fillRect(x, y + TILE_SIZE - 2.5, TILE_SIZE, 2.5);
        if (w !== TILE_ROAD && w !== TILE_ZEBRA) ctx.fillRect(x, y, 2.5, TILE_SIZE);
        if (e !== TILE_ROAD && e !== TILE_ZEBRA) ctx.fillRect(x + TILE_SIZE - 2.5, y, 2.5, TILE_SIZE);

        if (t === TILE_ZEBRA) {
            // Zebra stripes matching road direction
            const isVerticalRoad =
                c === 10 || c === 11 || c === 18 || c === 19 || c === 27 || c === 28;
            ctx.fillStyle = '#f8fafc';
            if (isVerticalRoad) {
                for (let sx = 4; sx < TILE_SIZE - 4; sx += 10) {
                    ctx.beginPath();
                    ctx.roundRect(x + sx, y + 6, 5.5, TILE_SIZE - 12, 2);
                    ctx.fill();
                }
            } else {
                for (let sy = 4; sy < TILE_SIZE - 4; sy += 10) {
                    ctx.beginPath();
                    ctx.roundRect(x + 6, y + sy, TILE_SIZE - 12, 5.5, 2);
                    ctx.fill();
                }
            }
            // Flashing amber Belisha beacon post on crossing edge
            const pulse = 0.65 + 0.35 * Math.sin(nowMs * 0.007);
            ctx.fillStyle = `rgba(245, 158, 11, ${pulse})`;
            ctx.beginPath();
            ctx.arc(x + 6, y + 6, 4.2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Directional road lane divider dashes (vertical on N-S streets, horizontal on E-W)
            const isIntersection =
                ((c === 10 || c === 11 || c === 18 || c === 19 || c === 27 || c === 28) &&
                    (r === 5 || r === 6 || r === 20 || r === 21 || r === 30));
            const isVertLane =
                (c === 10 || c === 18 || c === 27) && !isIntersection;
            const isHorizLane =
                (r === 5 || r === 20) &&
                c !== 10 && c !== 11 && c !== 18 && c !== 19 && c !== 27 && c !== 28;
            ctx.fillStyle = '#f1f5f9';
            if (isVertLane && r % 2 === 0) {
                ctx.beginPath();
                ctx.roundRect(x + TILE_SIZE - 2, y + 14, 4, 18, 2);
                ctx.fill();
            } else if (isHorizLane && c % 2 === 0) {
                ctx.beginPath();
                ctx.roundRect(x + 14, y + TILE_SIZE - 2, 18, 4, 2);
                ctx.fill();
            } else if (r === 30 && !isIntersection && c % 2 === 0) {
                ctx.beginPath();
                ctx.roundRect(x + 15, y + 22, 16, 3.5, 1.5);
                ctx.fill();
            }
        }
        return;
    }

    if (t === TILE_WATER) {
        // River Thames sparkling blue water + embankment balustrade on north bank
        ctx.fillStyle = isDusk ? '#0369a1' : '#0ea5e9';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        const waveShift = Math.sin(nowMs * 0.002 + c * 0.9 + r * 1.4) * 5;
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + 8 + waveShift, y + 16);
        ctx.quadraticCurveTo(x + 20 + waveShift, y + 13, x + 32 + waveShift, y + 16);
        ctx.moveTo(x + 14 - waveShift * 0.6, y + 34);
        ctx.quadraticCurveTo(x + 25 - waveShift * 0.6, y + 31, x + 38 - waveShift * 0.6, y + 34);
        ctx.stroke();

        if (r === 32) {
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(x, y, TILE_SIZE, 6);
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y + 4);
            ctx.lineTo(x + TILE_SIZE, y + 4);
            for (let px = 6; px < TILE_SIZE; px += 10) {
                ctx.moveTo(x + px, y);
                ctx.lineTo(x + px, y + 6);
            }
            ctx.stroke();
        }
        return;
    }

    if (t === TILE_PAVEMENT || t === TILE_RAILING) {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.55)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

        if (t === TILE_RAILING) {
            // Black Pimlico wrought-iron garden railings connecting cleanly at L-corners
            const hasW = getTileAtGrid(c - 1, r) === TILE_RAILING;
            const hasE = getTileAtGrid(c + 1, r) === TILE_RAILING;
            const hasN = getTileAtGrid(c, r - 1) === TILE_RAILING;
            const hasS = getTileAtGrid(c, r + 1) === TILE_RAILING;

            ctx.fillStyle = '#cbd5e1';
            if (hasW) ctx.fillRect(x, y + 19, 24, 10);
            if (hasE) ctx.fillRect(x + 24, y + 19, 24, 10);
            if (hasN) ctx.fillRect(x + 19, y, 10, 24);
            if (hasS) ctx.fillRect(x + 19, y + 24, 10, 24);

            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2.1;
            ctx.beginPath();
            if (hasW) {
                ctx.moveTo(x, y + 24);
                ctx.lineTo(x + 24, y + 24);
                for (let px = 6; px < 24; px += 9) {
                    ctx.moveTo(x + px, y + 16);
                    ctx.lineTo(x + px, y + 32);
                }
            }
            if (hasE) {
                ctx.moveTo(x + 24, y + 24);
                ctx.lineTo(x + TILE_SIZE, y + 24);
                for (let px = 30; px < TILE_SIZE; px += 9) {
                    ctx.moveTo(x + px, y + 16);
                    ctx.lineTo(x + px, y + 32);
                }
            }
            if (hasN) {
                ctx.moveTo(x + 24, y);
                ctx.lineTo(x + 24, y + 24);
                for (let py = 6; py < 24; py += 9) {
                    ctx.moveTo(x + 16, y + py);
                    ctx.lineTo(x + 32, y + py);
                }
            }
            if (hasS) {
                ctx.moveTo(x + 24, y + 24);
                ctx.lineTo(x + 24, y + TILE_SIZE);
                for (let py = 30; py < TILE_SIZE; py += 9) {
                    ctx.moveTo(x + 16, y + py);
                    ctx.lineTo(x + 32, y + py);
                }
            }
            ctx.stroke();

            // Corner / picket post cap
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(x + 24, y + 24, 3.6, 0, Math.PI * 2);
            ctx.fill();
        }
        return;
    }

    if (t === TILE_GRASS || t === TILE_TREE) {
        // Auto-tiled seamless grass
        const mask = getGrassJoinMask(c, r);
        ctx.fillStyle = '#bbf7d0';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        const padN = mask & 1 ? 0 : 4;
        const padE = mask & 2 ? 0 : 4;
        const padS = mask & 4 ? 0 : 4;
        const padW = mask & 8 ? 0 : 4;

        ctx.fillStyle = '#86efac';
        ctx.beginPath();
        ctx.roundRect(
            x + padW,
            y + padN,
            TILE_SIZE - padW - padE,
            TILE_SIZE - padN - padS,
            [
                !(mask & 1) && !(mask & 8) ? 9 : 0,
                !(mask & 1) && !(mask & 2) ? 9 : 0,
                !(mask & 4) && !(mask & 2) ? 9 : 0,
                !(mask & 4) && !(mask & 8) ? 9 : 0
            ]
        );
        ctx.fill();

        // Subtle daisies
        if ((c * 7 + r * 13) % 3 === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x + 13, y + 15, 2, 0, Math.PI * 2);
            ctx.arc(x + 34, y + 33, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        if (t === TILE_TREE) {
            // Tree shadow + trunk + pink blossom canopy
            ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
            ctx.beginPath();
            ctx.ellipse(x + 28, y + 39, 13, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#92400e';
            ctx.beginPath();
            ctx.roundRect(x + 21, y + 23, 6, 15, 2);
            ctx.fill();

            ctx.fillStyle = '#34d399';
            ctx.strokeStyle = '#059669';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.arc(x + 24, y + 18, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#fbcfe8';
            ctx.beginPath();
            ctx.arc(x + 18, y + 14, 2.8, 0, Math.PI * 2);
            ctx.arc(x + 30, y + 19, 2.5, 0, Math.PI * 2);
            ctx.arc(x + 24, y + 24, 2.2, 0, Math.PI * 2);
            ctx.fill();
        }
        return;
    }

    if (t === TILE_BUILDING) {
        ctx.fillStyle = '#fffbeb';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(x, y, TILE_SIZE, 6);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x, y + TILE_SIZE - 5, TILE_SIZE, 5);

        // Arched Regency windows (warm glow at dusk)
        ctx.fillStyle = isDusk ? 'rgba(253, 224, 71, 0.72)' : 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.roundRect(x + 8, y + 10, 12, 20, [6, 6, 0, 0]);
        ctx.roundRect(x + 28, y + 10, 12, 20, [6, 6, 0, 0]);
        ctx.fill();

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(x + 8, y + 10, 12, 20, [6, 6, 0, 0]);
        ctx.roundRect(x + 28, y + 10, 12, 20, [6, 6, 0, 0]);
        ctx.stroke();

        // Pink geranium flowerboxes
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 7, y + 29, 14, 3);
        ctx.fillRect(x + 27, y + 29, 14, 3);
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(x + 11, y + 28, 2.3, 0, Math.PI * 2);
        ctx.arc(x + 16, y + 28, 2.3, 0, Math.PI * 2);
        ctx.arc(x + 31, y + 28, 2.3, 0, Math.PI * 2);
        ctx.arc(x + 36, y + 28, 2.3, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    if (t === TILE_HOME) {
        ctx.fillStyle = '#fffbeb';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Dark purple 170 upstairs door
        ctx.fillStyle = '#311042';
        ctx.strokeStyle = '#be123c';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(x + 4, y + 8, 15, 22, [6, 6, 0, 0]);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fda4af';
        ctx.font = '800 6.5px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('170', x + 11.5, y + 17);

        // Basement flat 170A well + steps + pastel blue door
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.roundRect(x + 21, y + 15, 24, 31, 4);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + 22, y + 18, 6, 3);
        ctx.fillRect(x + 22, y + 23, 6, 3);
        ctx.fillRect(x + 22, y + 28, 6, 3);

        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x + 29, y + 19, 14, 25, [5, 5, 0, 0]);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(x + 36, y + 30, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 2, y + 46);
        ctx.lineTo(x + 22, y + 46);
        for (let rx = 4; rx <= 20; rx += 4) {
            ctx.moveTo(x + rx, y + 38);
            ctx.lineTo(x + rx, y + 46);
        }
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = '800 8px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('170A', x + 34, y + 12);

        if (goalsMet) {
            const pulse = 0.55 + 0.45 * Math.sin(nowMs * 0.008);
            ctx.strokeStyle = `rgba(16, 185, 129, ${pulse})`;
            ctx.lineWidth = 3.5;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        }
        return;
    }

    if (t === TILE_CAFE) {
        const cafe = CAFE_COUNTERS.find((cf) => cf.tileC === c && cf.tileR === r);
        const theme = cafe ? cafe.theme : 'third';
        const palette =
            theme === 'gails'
                ? { bg: '#fffbeb', a1: '#b91c1c', a2: '#ffffff', txt: '#991b1b', sub: '#b91c1c' }
                : theme === 'nero'
                ? { bg: '#eff6ff', a1: '#1e3a8a', a2: '#fde047', txt: '#1e3a8a', sub: '#1d4ed8' }
                : { bg: '#1e293b', a1: '#334155', a2: '#fde68a', txt: '#fef3c7', sub: '#94a3b8' };

        ctx.fillStyle = palette.bg;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        for (let s = 0; s < 4; s++) {
            ctx.fillStyle = s % 2 === 0 ? palette.a1 : palette.a2;
            ctx.beginPath();
            ctx.roundRect(x + s * 12, y, 12, 16, [0, 0, 6, 6]);
            ctx.fill();
        }
        ctx.fillStyle = palette.txt;
        ctx.font = '800 8px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(cafe ? cafe.line1 : 'CAFE', x + 24, y + 31);
        ctx.fillStyle = palette.sub;
        ctx.font = '700 7px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(cafe ? cafe.line2 : '', x + 24, y + 40);
        return;
    }

    if (t === TILE_DELI) {
        // Warm unified Italian terracotta double-storefront (70 Lupus St)
        ctx.fillStyle = '#fff7ed';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        const colors = ['#16a34a', '#ffffff', '#dc2626', '#16a34a'];
        for (let s = 0; s < 4; s++) {
            ctx.fillStyle = colors[(c + s) % colors.length];
            ctx.beginPath();
            ctx.roundRect(x + s * 12, y, 12, 16, [0, 0, 6, 6]);
            ctx.fill();
        }
        const isLeftHalf = c === DELI_COUNTER.tileC;
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(x + (isLeftHalf ? 4 : 0), y + 21, TILE_SIZE - 4, 20);
        ctx.strokeStyle = '#c2410c';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x + (isLeftHalf ? 4 : 0), y + 21);
        ctx.lineTo(x + (isLeftHalf ? TILE_SIZE : TILE_SIZE - 4), y + 21);
        ctx.moveTo(x + (isLeftHalf ? 4 : 0), y + 41);
        ctx.lineTo(x + (isLeftHalf ? TILE_SIZE : TILE_SIZE - 4), y + 41);
        if (isLeftHalf) {
            ctx.moveTo(x + 4, y + 21);
            ctx.lineTo(x + 4, y + 41);
        } else {
            ctx.moveTo(x + TILE_SIZE - 4, y + 21);
            ctx.lineTo(x + TILE_SIZE - 4, y + 41);
        }
        ctx.stroke();

        if (!isLeftHalf) {
            ctx.fillStyle = '#9a3412';
            ctx.font = '800 8.5px "Plus Jakarta Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("DELIZIE D'ITALIA", x, y + 34);
        }
        return;
    }

    if (t === TILE_STALL) {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        // Striped market canopy
        const odd = (c + r) % 2 === 0;
        for (let s = 0; s < 4; s++) {
            ctx.fillStyle = s % 2 === 0 ? (odd ? '#f43f5e' : '#0ea5e9') : '#fef3c7';
            ctx.beginPath();
            ctx.roundRect(x + s * 12, y + 4, 12, 34, 4);
            ctx.fill();
        }
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(x + 1, y + 5, TILE_SIZE - 2, 33);
        ctx.fillStyle = '#1e293b';
        ctx.font = '800 7px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MARKET', x + 24, y + 45);
    }
}

function drawOtherDog(ctx, d) {
    ctx.save();
    ctx.translate(d.x, d.y);
    const dir = d.vx >= 0 ? 1 : -1;

    ctx.fillStyle = d.friendly
        ? d.met
            ? 'rgba(148, 163, 184, 0.14)'
            : 'rgba(16, 185, 129, 0.18)'
        : 'rgba(244, 63, 94, 0.18)';
    ctx.strokeStyle = d.friendly ? (d.met ? '#94a3b8' : '#10b981') : '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 1, 14.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.scale(dir, 1);
    ctx.fillStyle = d.color;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.3;

    if (d.breed === 'Dachshund') {
        // Extra long sausage body + long floppy ear
        ctx.beginPath();
        ctx.roundRect(-12, -3, 21, 7.5, 3.8);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(9, -4.5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#7e22ce';
        ctx.beginPath();
        ctx.ellipse(7, -2.5, 2.5, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();
    } else if (d.breed === 'Poodle') {
        // Fluffy pom-poms + topknot
        ctx.beginPath();
        ctx.roundRect(-8, -4, 14, 9, 4.5);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-10, -2, 3, 0, Math.PI * 2); // Pom tail
        ctx.arc(7, -5, 5, 0, Math.PI * 2);
        ctx.arc(7, -10, 3.2, 0, Math.PI * 2); // Curly topknot
        ctx.fill();
        ctx.stroke();
    } else if (d.breed === 'Corgi') {
        // Loaf body + white chest + big pointy ears
        ctx.beginPath();
        ctx.roundRect(-9, -4, 16, 9.5, 4.5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fffbeb';
        ctx.beginPath();
        ctx.arc(7, -1, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(7, -5.5, 5.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Pointed fox ears
        ctx.beginPath();
        ctx.moveTo(4, -9);
        ctx.lineTo(5, -14.5);
        ctx.lineTo(8, -10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else if (d.breed === 'Whippet') {
        // Sleek arched sighthound
        ctx.beginPath();
        ctx.moveTo(-9, 1);
        ctx.quadraticCurveTo(-2, -6, 6, -3);
        ctx.lineTo(8, 2);
        ctx.quadraticCurveTo(0, 0, -9, 1);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(4, -2);
        ctx.lineTo(7, -9);
        ctx.lineTo(13, -7.5);
        ctx.lineTo(8, -5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else if (d.breed === 'Bulldog') {
        // Broad stocky torso + boxy jaw
        ctx.beginPath();
        ctx.roundRect(-9, -6, 17, 12, 5);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(4, -8.5, 9, 9, 3.5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-1, -6, 3, 11); // Collar
    } else {
        // Scruffy Terrier with spiky ears & tail
        ctx.beginPath();
        ctx.roundRect(-8, -4, 15, 9, 3);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(7, -5, 5.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(5, -9);
        ctx.lineTo(7, -14);
        ctx.lineTo(9, -9);
        ctx.moveTo(-8, -3);
        ctx.lineTo(-12, -8);
        ctx.stroke();
    }

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(9.5, -6, 1.1, 0, Math.PI * 2);
    ctx.arc(12.2, -5, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = d.friendly ? '#065f46' : '#9f1239';
    ctx.fillText(d.friendly ? (d.met ? '✓ Pal' : `♥ ${d.breed}`) : `⚡ ${d.breed}`, 0, -17);
    ctx.restore();
}

function drawBiscotti(ctx, b, animTimer, inArms) {
    ctx.save();
    ctx.translate(b.x + (b.mood === 'SULKING' ? b.shiverOffset : 0), b.y);
    if (inArms) ctx.scale(0.82, 0.82);

    const dir = b.facing === 'right' ? 1 : -1;
    const trot = b.mood === 'HAPPY' && !inArms ? Math.sin(animTimer * 1.5) * 2.6 : 0;

    if (!inArms) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.17)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 9.5, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.scale(dir, 1);

    if (!inArms) {
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-6, 1);
        ctx.lineTo(-7 + trot, 9);
        ctx.moveTo(-3, 1);
        ctx.lineTo(-3 - trot, 9);
        ctx.moveTo(5, 1);
        ctx.lineTo(6 - trot, 9);
        ctx.moveTo(7, 1);
        ctx.lineTo(8 + trot, 9);
        ctx.stroke();
    }

    // Sighthound curved tail
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-8, -1);
    if (b.mood === 'SULKING') {
        ctx.quadraticCurveTo(-11, 5, -6, 7);
    } else {
        ctx.quadraticCurveTo(-14, -5, -12, -10);
    }
    ctx.stroke();

    // Cream & amber Italian Greyhound torso
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.quadraticCurveTo(-2, -6, 6, -3);
    ctx.quadraticCurveTo(9, 1, 5, 3);
    ctx.quadraticCurveTo(0, 0, -6, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Active coat variant
    ctx.fillStyle = b.coatPrimary || '#34d399';
    ctx.strokeStyle = b.coatStroke || '#065f46';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-5.5, -4.8, 10.5, 6.2, 3);
    ctx.fill();
    ctx.stroke();

    if (b.coatId === 'dino') {
        ctx.fillStyle = '#14b8a6';
        ctx.beginPath();
        ctx.moveTo(-3.5, -4.8);
        ctx.lineTo(-2, -8);
        ctx.lineTo(-0.5, -4.8);
        ctx.lineTo(1, -8);
        ctx.lineTo(2.5, -4.8);
        ctx.fill();
    }

    // Long swan neck + delicate snout
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(4, -2);
    ctx.lineTo(7, -10);
    ctx.lineTo(15, -8.5);
    ctx.quadraticCurveTo(15, -6, 9, -6);
    ctx.lineTo(7, 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Folded rose ear
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(5.5, -10, 3, 1.6, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye & nose
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(9.5, -8.5, 1.3, 0, Math.PI * 2);
    ctx.arc(15, -8, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Puppuccino whipped-cream snoot dab!
    if (b.puppuccinoTimer > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(14.5, -10.5, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    ctx.restore();

    if (!inArms && b.mood === 'SULKING') {
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💧🥶', b.x, b.y - 16);
    }

    // Auto-sniff radial ring
    if (!inArms && b.sniffProgress > 0) {
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 17, -Math.PI / 2, -Math.PI / 2 + b.sniffProgress * Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

function drawCarry(ctx, state) {
    const c = state.carry;
    ctx.save();
    ctx.translate(c.x, c.y);

    const bounce = Math.abs(Math.sin(c.animTimer)) * 2.5;
    const stepSwing = Math.sin(c.animTimer) * 4;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 15, 11, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(0, -bounce);

    // Legs & sneakers
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, 6);
    ctx.lineTo(-4, 13 + stepSwing * 0.5);
    ctx.moveTo(4, 6);
    ctx.lineTo(4, 13 - stepSwing * 0.5);
    ctx.stroke();

    // Rose Pimlico trench coat
    ctx.fillStyle = '#f472b6';
    ctx.strokeStyle = '#9d174d';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(8, -4);
    ctx.lineTo(11, 9);
    ctx.quadraticCurveTo(0, 11, -11, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cream scarf
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.roundRect(-7, -5, 14, 4, 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#ffedd5';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -11, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hair & bun shifted smoothly by facing
    const bunOffsetX = c.facing === 'left' ? 3 : c.facing === 'right' ? -3 : 0;
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(bunOffsetX, -19.5, 4.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -12, 8.8, Math.PI * 0.92, Math.PI * 2.08);
    ctx.fill();

    if (c.facing !== 'up') {
        const eyeOffset = c.facing === 'left' ? -2.2 : c.facing === 'right' ? 2.2 : 0;
        ctx.fillStyle = '#f43f5e';
        ctx.globalAlpha = 0.32;
        ctx.beginPath();
        ctx.arc(-4.5 + eyeOffset, -9.5, 2, 0, Math.PI * 2);
        ctx.arc(4.5 + eyeOffset, -9.5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(-3 + eyeOffset, -11, 1.3, 0, Math.PI * 2);
        ctx.arc(3 + eyeOffset, -11, 1.3, 0, Math.PI * 2);
        ctx.fill();
    }

    if (c.isCarrying) {
        drawBiscotti(
            ctx,
            {
                x: 2,
                y: 1,
                facing: c.facing === 'left' ? 'left' : 'right',
                mood: 'HAPPY',
                shiverOffset: 0,
                coatId: state.coatId,
                coatPrimary: state.coat.primaryColor,
                coatStroke: state.coat.strokeColor,
                puppuccinoTimer: state.biscotti.puppuccinoTimer,
                sniffProgress: 0
            },
            0,
            true
        );
    }

    // Pop-open pastel dome umbrella in drizzle!
    if (state.weather.isRaining) {
        ctx.fillStyle = 'rgba(251, 207, 232, 0.55)';
        ctx.strokeStyle = '#be185d';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, -21, 16, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -37);
        ctx.lineTo(0, -21);
        ctx.stroke();
    }

    ctx.restore();

    // Witch Suspicion Warning Gauge above Carry
    if (state.dragonWitch.suspicion > 0.04) {
        const s = Math.min(1, state.dragonWitch.suspicion);
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(c.x - 18, c.y - 42, 36, 12, 6);
        ctx.fill();
        ctx.fillStyle = s > 0.65 ? '#f43f5e' : '#fbbf24';
        ctx.beginPath();
        ctx.roundRect(c.x - 16, c.y - 40, 32 * s, 8, 4);
        ctx.fill();
        ctx.font = '800 9px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('👁️ !', c.x, c.y - 45);
        ctx.restore();
    }
}

function drawVehicles(ctx, vehicles) {
    for (const v of vehicles) {
        ctx.save();
        ctx.translate(v.x, v.y);
        const angle = v.axis === 'x' ? (v.dir > 0 ? 0 : Math.PI) : v.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        ctx.rotate(angle);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
        ctx.beginPath();
        ctx.roundRect(-18, -9, 38, 20, 5);
        ctx.fill();

        if (v.kind === 'bus') {
            // Iconic red #24 London double-decker
            ctx.fillStyle = '#dc2626';
            ctx.strokeStyle = '#7f1d1d';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.roundRect(-22, -11, 44, 22, 4);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(14, -8, 6, 16);
            ctx.fillStyle = '#ffffff';
            ctx.font = '800 8px "Plus Jakarta Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('24', -2, 3);
        } else if (v.kind === 'cab') {
            // London Black Cab
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.roundRect(-16, -9, 32, 18, 5);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fde047';
            ctx.fillRect(2, -4, 3, 8); // TAXI roof light
            ctx.fillStyle = '#93c5fd';
            ctx.fillRect(7, -6.5, 5, 13);
        } else {
            // Lime E-Bike
            ctx.fillStyle = '#4ade80';
            ctx.strokeStyle = '#15803d';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.roundRect(-11, -5, 22, 10, 4);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(-2, 0, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Brake lights glow red when yielding at a Zebra Crossing
        if (v.stopped) {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(-16, -6, 2.5, 0, Math.PI * 2);
            ctx.arc(-16, 6, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

function drawCompassPips(ctx, state, cam, viewW, viewH, uiState) {
    if (uiState) uiState.compassHitboxes = [];
    const goalsMet = isWalkGoalsMet(state);
    const targets = [];

    if (goalsMet) {
        targets.push({
            x: HOME_DOOR.c * TILE_SIZE,
            y: HOME_DOOR.r * TILE_SIZE,
            label: '🏡 170A',
            bg: '#059669'
        });
    } else {
        if (state.walk.requireDeli && !state.progress.deliVisited) {
            targets.push({ x: state.deli.x, y: state.deli.y, label: '🥪 Deli', bg: '#ea580c' });
        } else if (state.carry.strength < 55) {
            // Find nearest ready Cafe
            let best = null;
            let bestD = Infinity;
            for (const cf of state.cafes) {
                const d = Math.hypot(cf.x - state.carry.x, cf.y - state.carry.y);
                if (cf.cooldown <= 0 && d < bestD) {
                    best = cf;
                    bestD = d;
                }
            }
            if (best) targets.push({ x: best.x, y: best.y, label: `🍵 ${best.shortName}`, bg: '#059669' });
        }

        if (state.progress.pees < state.walk.targetPees || state.progress.poops < state.walk.targetPoops) {
            let bestSpot = null;
            let bestD = Infinity;
            for (const s of state.sniffSpots) {
                if (s.cooldown > 0) continue;
                const d = Math.hypot(s.x - state.carry.x, s.y - state.carry.y);
                if (d < bestD) {
                    bestSpot = s;
                    bestD = d;
                }
            }
            if (bestSpot) targets.push({ x: bestSpot.x, y: bestSpot.y, label: '🌿 Sniff', bg: '#16a34a' });
        }

        if (state.progress.friendlyDogs < state.walk.targetDogs) {
            let bestPal = null;
            let bestD = Infinity;
            for (const d of state.otherDogs) {
                if (!d.friendly || d.met) continue;
                const dd = Math.hypot(d.x - state.carry.x, d.y - state.carry.y);
                if (dd < bestD) {
                    bestPal = d;
                    bestD = dd;
                }
            }
            if (bestPal) targets.push({ x: bestPal.x, y: bestPal.y, label: '🐶 Pal', bg: '#0284c7' });
        }
    }

    const placedPips = [];
    for (const t of targets) {
        const sx = (t.x - cam.x) * cam.zoom;
        const sy = (t.y - cam.y) * cam.zoom;
        if (sx >= 24 && sx <= viewW - 24 && sy >= 24 && sy <= viewH - 24) continue;

        ctx.save();
        ctx.font = '700 10.5px "Plus Jakarta Sans", sans-serif';
        const w = ctx.measureText(t.label).width + 16;

        const cx = viewW / 2;
        const cy = viewH / 2;
        const ang = Math.atan2(sy - cy, sx - cx);
        let edgeX = Math.max(w / 2 + 8, Math.min(viewW - w / 2 - 8, cx + Math.cos(ang) * (viewW * 0.43)));
        let edgeY = Math.max(24, Math.min(viewH - 36, cy + Math.sin(ang) * (viewH * 0.42)));

        // Keep clear of top-right minimap and top-left score badge
        if (edgeX + w / 2 > viewW - 118 && edgeY - 12 < 122) {
            edgeY = 128;
        }
        if (edgeX - w / 2 < 96 && edgeY - 12 < 46) {
            edgeY = 52;
        }

        // Avoid overlapping nearby edge compass pips on narrow mobile viewports
        for (const prev of placedPips) {
            if (Math.abs(edgeX - prev.x) < 68 && Math.abs(edgeY - prev.y) < 28) {
                if (edgeY + 30 <= viewH - 36) edgeY = prev.y + 30;
                else edgeX = Math.max(w / 2 + 8, prev.x - w - 8);
            }
        }
        placedPips.push({ x: edgeX, y: edgeY });

        if (uiState && uiState.compassHitboxes) {
            uiState.compassHitboxes.push({
                x: edgeX - w / 2 - 4,
                y: edgeY - 14,
                w: w + 8,
                h: 28,
                targetX: t.x,
                targetY: t.y,
                label: t.label
            });
        }

        ctx.fillStyle = t.bg;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(edgeX - w / 2, edgeY - 11, w, 22, 11);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(t.label, edgeX, edgeY + 3.5);
        ctx.restore();
    }
}

function paintMapTiles(ctx, ox, oy, sx, sy, drawWalls) {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const t = getTileAtGrid(c, r);
            if (t === TILE_GRASS || t === TILE_TREE) ctx.fillStyle = '#4ade80';
            else if (t === TILE_WATER) ctx.fillStyle = '#0ea5e9';
            else if (t === TILE_DELI) ctx.fillStyle = '#ea580c';
            else if (t === TILE_CAFE) ctx.fillStyle = '#10b981';
            else if (t === TILE_HOME) ctx.fillStyle = '#38bdf8';
            else if (t === TILE_ZEBRA) ctx.fillStyle = '#f8fafc';
            else if (t === TILE_ROAD) ctx.fillStyle = '#cbd5e1';
            else if (t === TILE_BUILDING || t === TILE_STALL) ctx.fillStyle = drawWalls ? '#d6cfc2' : '#e2e8f0';
            else if (t === TILE_RAILING) ctx.fillStyle = '#475569';
            else if (drawWalls) ctx.fillStyle = '#f8fafc';
            else continue;

            ctx.fillRect(
                ox + c * TILE_SIZE * sx,
                oy + r * TILE_SIZE * sy,
                Math.ceil(TILE_SIZE * sx),
                Math.ceil(TILE_SIZE * sy)
            );
        }
    }
}

function strokeNavPolyline(ctx, ox, oy, sx, sy, carry, navPath) {
    if (!navPath || navPath.length === 0) return;
    ctx.save();
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(ox + carry.x * sx, oy + carry.y * sy);
    for (const wp of navPath) {
        ctx.lineTo(ox + wp.x * sx, oy + wp.y * sy);
    }
    ctx.stroke();
    ctx.restore();
}

function drawMinimap(ctx, state, viewW, uiState) {
    const mapW = 98;
    const mapH = Math.round((mapW * ROWS) / COLS);
    const pad = 10;
    const ox = viewW - mapW - pad;
    const oy = pad;

    if (uiState) {
        uiState.minimapRect = { x: ox - 4, y: oy - 4, w: mapW + 8, h: mapH + 20 };
    }

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.97)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.78)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(ox - 4, oy - 4, mapW + 8, mapH + 20, 9);
    ctx.fill();
    ctx.stroke();

    const sx = mapW / BASE_WIDTH;
    const sy = mapH / BASE_HEIGHT;

    paintMapTiles(ctx, ox, oy, sx, sy, false);
    if (uiState && uiState.navPath) {
        strokeNavPolyline(ctx, ox, oy, sx, sy, state.carry, uiState.navPath);
    }

    // Friendly dogs
    for (const d of state.otherDogs) {
        if (!d.friendly || d.met) continue;
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(ox + d.x * sx, oy + d.y * sy, 2.2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Witch dot
    ctx.fillStyle = '#be123c';
    ctx.beginPath();
    ctx.arc(ox + state.dragonWitch.x * sx, oy + state.dragonWitch.y * sy, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Carry dot
    ctx.fillStyle = '#ec4899';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(ox + state.carry.x * sx, oy + state.carry.y * sy, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tap prompt caption at bottom of minimap
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.roundRect(ox - 1, oy + mapH + 1, mapW + 2, 13, 5);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 7.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🗺️ TAP MAP', ox + mapW / 2, oy + mapH + 10.5);

    ctx.restore();
}

function drawMapPin(ctx, x, y, text, bg, textColor = '#ffffff') {
    ctx.save();
    ctx.font = '800 9px "Plus Jakarta Sans", sans-serif';
    const w = ctx.measureText(text).width + 10;
    const px = Math.max(w / 2 + 4, Math.min(ctx.canvas._cssW - w / 2 - 4, x));
    const py = Math.max(11, Math.min(ctx.canvas._cssH - 11, y));
    ctx.fillStyle = bg;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(px - w / 2, py - 9, w, 18, 9);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.fillText(text, px, py + 3);
    ctx.restore();
}

/**
 * Renders the full interactive 40x34 SW1V Pimlico overview map inside the Street Map modal.
 */
export function renderOverviewMap(mapCanvas, state, navPath = []) {
    if (!mapCanvas || !state) return;
    const ctx = mapCanvas.getContext('2d');
    const rect = mapCanvas.getBoundingClientRect();
    const cssW = Math.max(280, Math.round(rect.width) || 400);
    const cssH = Math.round((cssW * ROWS) / COLS);
    const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);

    if (mapCanvas.width !== Math.round(cssW * dpr) || mapCanvas.height !== Math.round(cssH * dpr)) {
        mapCanvas.width = Math.round(cssW * dpr);
        mapCanvas.height = Math.round(cssH * dpr);
    }
    ctx.canvas._cssW = cssW;
    ctx.canvas._cssH = cssH;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const sx = cssW / BASE_WIDTH;
    const sy = cssH / BASE_HEIGHT;

    paintMapTiles(ctx, 0, 0, sx, sy, true);

    // Key street names for instant spatial orientation
    const overviewLabels = [
        { name: 'WARWICK WAY', x: 15.0 * TILE_SIZE, y: 5.8 * TILE_SIZE },
        { name: 'LUPUS STREET', x: 15.0 * TILE_SIZE, y: 20.8 * TILE_SIZE },
        { name: 'GROSVENOR RD', x: 15.0 * TILE_SIZE, y: 30.6 * TILE_SIZE },
        { name: 'RIVER THAMES', x: 23.5 * TILE_SIZE, y: 33.1 * TILE_SIZE, light: true },
        { name: "ST GEORGE'S SQ", x: 23.5 * TILE_SIZE, y: 25.8 * TILE_SIZE },
        { name: 'WARWICK SQ', x: 23.5 * TILE_SIZE, y: 10.8 * TILE_SIZE },
        { name: "ST GEORGE'S DR", x: 18.9 * TILE_SIZE, y: 12.0 * TILE_SIZE, rot: -Math.PI / 2 }
    ];
    ctx.save();
    ctx.font = '800 8px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    for (const lbl of overviewLabels) {
        ctx.save();
        ctx.translate(lbl.x * sx, lbl.y * sy);
        if (lbl.rot) ctx.rotate(lbl.rot);
        ctx.fillStyle = lbl.light ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.45)';
        ctx.fillText(lbl.name, 0, 0);
        ctx.restore();
    }
    ctx.restore();

    strokeNavPolyline(ctx, 0, 0, sx, sy, state.carry, navPath);

    // Ready sniff spots
    for (const s of state.sniffSpots) {
        if (s.cooldown > 0) continue;
        ctx.fillStyle = '#16a34a';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(s.x * sx, s.y * sy, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // Friendly unmet dogs
    for (const d of state.otherDogs) {
        if (!d.friendly || d.met) continue;
        drawMapPin(ctx, d.x * sx, d.y * sy - 4, `🐶`, '#0284c7');
    }

    // Venues & Home
    drawMapPin(ctx, HOME_DOOR.c * TILE_SIZE * sx, HOME_DOOR.r * TILE_SIZE * sy - 10, '🏡 170A', '#0284c7');
    drawMapPin(ctx, state.deli.x * sx, state.deli.y * sy + 10, '🥪 Delizie', '#ea580c');
    for (const cf of state.cafes) {
        drawMapPin(ctx, cf.x * sx, cf.y * sy - 10, `🍵 ${cf.shortName}`, '#059669');
    }

    // Witch & Carry
    drawMapPin(ctx, state.dragonWitch.x * sx, state.dragonWitch.y * sy, '🧙‍♀️', '#be123c');
    drawMapPin(ctx, state.carry.x * sx, state.carry.y * sy + 8, '📍 YOU', '#db2777');
}

export function renderFrame(ctx, state, cam, viewW, viewH, uiState) {
    const nowMs = performance.now();
    ctx.clearRect(0, 0, viewW, viewH);

    ctx.save();
    // Apply micro screen shake on bark/honk
    if (state.screenShake > 0) {
        const mag = state.screenShake * 24;
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }

    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);

    const startC = Math.max(0, Math.floor(cam.x / TILE_SIZE) - 1);
    const endC = Math.min(COLS - 1, Math.ceil((cam.x + cam.viewW) / TILE_SIZE) + 1);
    const startR = Math.max(0, Math.floor(cam.y / TILE_SIZE) - 1);
    const endR = Math.min(ROWS - 1, Math.ceil((cam.y + cam.viewH) / TILE_SIZE) + 1);
    const goalsMet = isWalkGoalsMet(state);

    // 1. Walkable base tiles first, then 2.5D building shadows, then structures
    for (let r = startR; r <= endR; r++) {
        for (let c = startC; c <= endC; c++) {
            const t = getTileAtGrid(c, r);
            if (
                t !== TILE_BUILDING &&
                t !== TILE_HOME &&
                t !== TILE_CAFE &&
                t !== TILE_DELI &&
                t !== TILE_STALL
            ) {
                drawTile(ctx, r, c, t, goalsMet, state.walk.dusk, nowMs);
            } else {
                // Underlying pavement margin under shadow
                ctx.fillStyle = '#f1f5f9';
                ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    draw25DShadows(ctx, startC, endC, startR, endR);

    for (let r = startR; r <= endR; r++) {
        for (let c = startC; c <= endC; c++) {
            const t = getTileAtGrid(c, r);
            if (
                t === TILE_BUILDING ||
                t === TILE_HOME ||
                t === TILE_CAFE ||
                t === TILE_DELI ||
                t === TILE_STALL
            ) {
                drawTile(ctx, r, c, t, goalsMet, state.walk.dusk, nowMs);
            }
        }
    }

    // Subtle SW1V Pimlico street & landmark labels
    ctx.save();
    ctx.font = '800 8.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    for (const lbl of STREET_LABELS) {
        ctx.save();
        ctx.translate(lbl.x, lbl.y);
        if (lbl.rotate) ctx.rotate(lbl.rotate);
        ctx.fillStyle = lbl.name === 'RIVER THAMES' ? 'rgba(255, 255, 255, 0.72)' : 'rgba(30, 41, 59, 0.38)';
        ctx.fillText(lbl.name, 0, 0);
        ctx.restore();
    }
    ctx.restore();

    // 2. Rain puddle ripples & Biscotti pawprints
    for (const rp of state.ripples) {
        ctx.strokeStyle = `rgba(56, 189, 248, ${rp.alpha * 0.55})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
    }

    for (const fp of state.pawprints) {
        ctx.fillStyle = `rgba(120, 53, 15, ${fp.alpha * 0.22})`;
        ctx.beginPath();
        ctx.arc(fp.x, fp.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
    }

    // 3. Prime Sniff Spots
    for (const s of state.sniffSpots) {
        const ready = s.cooldown <= 0;
        const pulse = 0.7 + 0.3 * Math.sin(nowMs * 0.006);
        ctx.save();
        ctx.translate(s.x, s.y);
        if (ready) {
            ctx.fillStyle = `rgba(250, 204, 21, ${0.24 * pulse})`;
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(22, 163, 74, 0.7)';
            ctx.lineWidth = 1.4;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.arc(0, 0, 13, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🌿', 0, 4);
        } else {
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 11, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }

    // 4. Pees & Poops
    for (const p of state.puddlesAndPoops) {
        if (p.type === 'pee') {
            ctx.fillStyle = p.illegal ? 'rgba(251, 191, 36, 0.72)' : 'rgba(56, 189, 248, 0.58)';
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, 9, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('💩', p.x, p.y + 5);
            if (p.timer > 0) {
                ctx.strokeStyle = p.timer < 3.2 ? '#f43f5e' : '#f59e0b';
                ctx.lineWidth = 2.6;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 13.5, -Math.PI / 2, -Math.PI / 2 + (p.timer / 10.0) * Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    // 5. Actual Cafe Counters ONLY (No street Matchas!)
    for (const cf of state.cafes) {
        const bob = Math.sin(nowMs * 0.006) * 2.2;
        ctx.save();
        ctx.translate(cf.x, cf.y);
        if (cf.cooldown <= 0) {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.translate(0, bob);
            ctx.fillStyle = '#86efac';
            ctx.strokeStyle = '#059669';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.roundRect(-6, -5, 12, 13, 3);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -5, 6, Math.PI, 0);
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = '#f472b6';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(1, -6);
            ctx.lineTo(4, -12);
            ctx.stroke();
        } else {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(
                0,
                0,
                12,
                -Math.PI / 2,
                -Math.PI / 2 + (1 - cf.cooldown / cf.cooldownDuration) * Math.PI * 2
            );
            ctx.stroke();
        }
        ctx.restore();
    }

    // 6. Italian Deli Counter (Focaccia + Puppuccino)
    {
        const d = state.deli;
        const bob = Math.sin(nowMs * 0.0055) * 2.2;
        ctx.save();
        ctx.translate(d.x, d.y);
        if (d.cooldown <= 0) {
            ctx.fillStyle = 'rgba(234, 88, 12, 0.22)';
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = '15px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🥪', -9, 4 + bob);
            ctx.fillText('🥛', 9, 4 - bob);
        } else {
            ctx.strokeStyle = '#ea580c';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(
                0,
                0,
                14,
                -Math.PI / 2,
                -Math.PI / 2 + (1 - d.cooldown / d.cooldownDuration) * Math.PI * 2
            );
            ctx.stroke();
        }
        ctx.restore();
    }

    // 7. Crunchy Dog Treats & Market Dropped Snacks
    for (const tr of state.treats) {
        if (tr.collected) continue;
        const bob = Math.sin(nowMs * 0.007 + tr.x) * 2;
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🦴', tr.x, tr.y + 4 + bob);
    }

    for (const ms of state.marketSnacks) {
        if (!ms.active) continue;
        ctx.save();
        ctx.fillStyle = 'rgba(244, 63, 94, 0.18)';
        ctx.beginPath();
        ctx.arc(ms.x, ms.y, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ms.emoji, ms.x, ms.y + 5);
        ctx.restore();
    }

    // 8. Neighbours with short sight cones + Etiquette status
    for (const n of state.neighbors) {
        ctx.save();
        ctx.translate(n.x, n.y);

        // Short sightline wedge
        ctx.fillStyle = n.angryTimer > 0 ? 'rgba(244, 63, 94, 0.16)' : 'rgba(148, 163, 184, 0.13)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 92, n.angle - 0.45, n.angle + 0.45);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 9, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = n.angryTimer > 0 ? '#f43f5e' : n.color;
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-8, -3, 16, 13, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffedd5';
        ctx.beginPath();
        ctx.arc(0, -8, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-8, -13, 16, 2.5);
        ctx.beginPath();
        ctx.arc(0, -13, 5, Math.PI, 0);
        ctx.fill();

        if (n.angryTimer > 0) {
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('💢', 0, -20);
        } else if (n.swoonTimer > 0) {
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('😍', 0, -20);
        }
        ctx.restore();
    }

    // 9. Vehicles & Other Dogs
    drawVehicles(ctx, state.vehicles);
    for (const d of state.otherDogs) {
        drawOtherDog(ctx, d);
    }

    // 10. Sparkles (Zoomies trail)
    for (const sp of state.sparkles) {
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = Math.max(0, sp.alpha);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // 11. Leash, Biscotti & Carry
    if (!state.carry.isCarrying) {
        ctx.strokeStyle = state.biscotti.mood === 'SULKING' ? '#f43f5e' : '#f472b6';
        ctx.lineWidth = 1.9;
        ctx.setLineDash(state.biscotti.mood === 'SULKING' ? [3, 2] : []);
        ctx.beginPath();
        ctx.moveTo(state.carry.x, state.carry.y);
        ctx.quadraticCurveTo(
            (state.carry.x + state.biscotti.x) / 2,
            (state.carry.y + state.biscotti.y) / 2 + 9,
            state.biscotti.x,
            state.biscotti.y - 3
        );
        ctx.stroke();
        ctx.setLineDash([]);

        drawBiscotti(
            ctx,
            {
                ...state.biscotti,
                coatId: state.coatId,
                coatPrimary: state.coat.primaryColor,
                coatStroke: state.coat.strokeColor
            },
            state.carry.animTimer,
            false
        );
    }
    drawCarry(ctx, state);

    // A* route trail & pulsing target marker
    if (uiState.navPath && uiState.navPath.length > 0) {
        const goal = uiState.navPath[uiState.navPath.length - 1];
        const pulseR = 10 + Math.sin(nowMs * 0.008) * 2;
        ctx.save();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(state.carry.x, state.carry.y);
        for (const wp of uiState.navPath) ctx.lineTo(wp.x, wp.y);
        ctx.stroke();

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.8;
        ctx.setLineDash([7, 5]);
        ctx.lineDashOffset = -(nowMs * 0.025) % 12;
        ctx.beginPath();
        ctx.moveTo(state.carry.x, state.carry.y);
        for (const wp of uiState.navPath) ctx.lineTo(wp.x, wp.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = 'rgba(5, 150, 105, 0.85)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(goal.x, goal.y, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(goal.x, goal.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    } else if (uiState.tapTarget) {
        ctx.save();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.75)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(uiState.tapTarget.x, uiState.tapTarget.y, 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // 12. Wall-Occluded Dragon Witch & Vision Cone
    {
        const w = state.dragonWitch;
        const rays = 26;
        ctx.save();
        const grad = ctx.createRadialGradient(w.x, w.y, 8, w.x, w.y, w.visionRange);
        grad.addColorStop(0, 'rgba(225, 29, 72, 0.42)');
        grad.addColorStop(1, 'rgba(225, 29, 72, 0.06)');
        ctx.fillStyle = grad;
        ctx.strokeStyle = 'rgba(225, 29, 72, 0.5)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(w.x, w.y);
        for (let i = 0; i <= rays; i++) {
            const ang = w.angle - w.visionSpread / 2 + (i / rays) * w.visionSpread;
            const hit = castVisionRay(w.x, w.y, ang, w.visionRange);
            ctx.lineTo(hit.x, hit.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.translate(w.x, w.y);
        ctx.fillStyle = '#4c1d95';
        ctx.strokeStyle = '#2e1065';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 2, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#bef264';
        ctx.beginPath();
        ctx.arc(0, -6, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.ellipse(0, -11, 11, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-6, -11);
        ctx.lineTo(0, -23);
        ctx.lineTo(6, -11);
        ctx.closePath();
        ctx.fill();

        ctx.font = '800 8px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#be123c';
        ctx.fillText('DRAGON WITCH', 0, 21);
        ctx.restore();
    }

    // 13. Floating Pill Pop-Ups
    for (const ft of state.floatingTexts) {
        const alpha = Math.max(0, Math.min(1, ft.life / ft.maxLife));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        const textW = ctx.measureText(ft.text).width + 14;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(ft.x - textW / 2, ft.y - 11, textW, 18, 9);
        ctx.fill();
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y + 1.5);
        ctx.restore();
    }

    ctx.restore();

    // 14. Screen-space Dusk Glow, Rain Overlay, Compass Pips, Minimap & Floating Thumbstick
    if (state.walk.dusk) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
        ctx.fillRect(0, 0, viewW, viewH);
    }

    if (state.weather.isRaining) {
        ctx.fillStyle = 'rgba(30, 58, 138, 0.11)';
        ctx.fillRect(0, 0, viewW, viewH);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (const r of state.rainDrops) {
            const sx = (r.x - cam.x) * cam.zoom;
            const sy = (r.y - cam.y) * cam.zoom;
            if (sx < -20 || sx > viewW + 20 || sy < -20 || sy > viewH + 20) continue;
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx - 3, sy + r.len);
        }
        ctx.stroke();
    }

    drawCompassPips(ctx, state, cam, viewW, viewH, uiState);
    drawMinimap(ctx, state, viewW, uiState);

    if (uiState.stick.active) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(uiState.stick.originX, uiState.stick.originY, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(5, 150, 105, 0.72)';
        ctx.beginPath();
        ctx.arc(uiState.stick.knobX, uiState.stick.knobY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
