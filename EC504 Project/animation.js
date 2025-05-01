import { Heap } from './myHeap.js';
import {reverseMapping} from './nodes.js'

let dijkstraState = {
    heap: null,
    N: null,             // Node array
    Nm: 0,
    finished: false,
    current: null        // currently processing node
};

function initializeDijkstraStepByStep(N, Or, Nm) {
    const thisHeap = new Heap();
    N[Or].distance = 0;
    thisHeap.insert(N[Or]);

    dijkstraState = {
        heap: thisHeap,
        N,
        Nm,
        finished: false,
        current: null
    };
}

function logToScreen(message, isBold = false) {
    const logDiv = document.getElementById('log');
    const msgElem = document.createElement('div');
    msgElem.innerHTML = isBold ? `<strong>${message}</strong>` : message;
    logDiv.appendChild(msgElem);
    logDiv.scrollTop = logDiv.scrollHeight;
}

function clearLog() {
    const logDiv = document.getElementById('log');
    logDiv.innerHTML = '';
}

function runDijkstraStep() {
    clearLog();
    const { heap, N } = dijkstraState;

    if (heap.IsEmpty()) {
        dijkstraState.finished = true;
        logToScreen("Dijkstra finished");
        console.log("Dijkstra finished");
        return;
    }

    const u = heap.remove_min();
    dijkstraState.current = u.id;

    logToScreen(`Visiting node ${reverseMapping.get(u.id)} with distance ${u.distance}`, true);
    console.log(`Visiting node ${reverseMapping.get(u.id)} with distance ${u.distance}`);
    highlightNode(u.id);

    let pathStr = `${reverseMapping.get(u.id)}`;
    let prev = N[u.id].P;

    while (prev !== undefined && prev >= 0) {
        pathStr += ` ← ${reverseMapping.get(prev)}`;
        prev = N[prev].P;
    }
    pathStr = pathStr.split(" ← ").reverse().join(" → ");
    logToScreen(`Path to ${reverseMapping.get(u.id)}: ${pathStr}`, true); //bold the final nodes
    console.log(`Path to ${reverseMapping.get(u.id)}: ${pathStr}`);

    let edge = u.first;
    while (edge !== null) {
        const v = edge.end;
        const dv = u.distance + edge.length;

        console.log(`Considering edge ${reverseMapping.get(u.id)} -> ${reverseMapping.get(v)} with length ${edge.length}`);
        logToScreen(`Relaxing edge ${reverseMapping.get(u.id)} → ${reverseMapping.get(v)} (length ${edge.length})`);

        if (N[v].distance > dv) {
            const wasUnvisited = N[v].distance === Infinity;
            N[v].distance = dv;
            N[v].P = u.id;

            if (N[v].position >= 0) {
                heap.decreaseKey(N[v].position, dv);
                console.log(`Updated distance of ${reverseMapping.get(v)} to ${dv}, via decreaseKey`);
                logToScreen(`Updated ${reverseMapping.get(v)}: new dist ${dv} (via decreaseKey)`);
            } else {
                heap.insert(N[v]);
                console.log(`Discovered ${reverseMapping.get(v)} with dist ${dv}, inserting into heap`);
                logToScreen(`Discovered ${reverseMapping.get(v)}: new dist ${dv} (inserted into heap)`);
            }
        } else {
            console.log(`No update for ${reverseMapping.get(v)}; current dist is ${N[v].distance}, potential is ${dv}`);
            logToScreen(`No update for ${reverseMapping.get(v)} (current dist: ${N[v].distance}, potential: ${dv})`);
        }

        edge = edge.next;
    }
}

export function highlightNode(nodeId) {
    const el = document.getElementById(`node-${reverseMapping.get(nodeId)}`);
    console.log(el);
    if (el) {
        el.classList.add('highlighted');
        console.log("highlighting!");
    } else {
        console.warn(`Node with ID node-${reverseMapping.get(nodeId)} not found`);
    }
}

function unhighlightNode(nodeId) {
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (nodeElement) {
        nodeElement.classList.remove('highlighted');
    }
}

export {runDijkstraStep, initializeDijkstraStepByStep, dijkstraState};
