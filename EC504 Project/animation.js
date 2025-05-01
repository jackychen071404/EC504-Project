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

function logToScreen(message) {
    const logDiv = document.getElementById('log');
    if (logDiv.lastChild) {
        logDiv.lastChild.textContent = message;
    } else {
        const msgElem = document.createElement('div');
        msgElem.textContent = message;
        logDiv.appendChild(msgElem);
    }
}

function runDijkstraStep() {
    const { heap, N } = dijkstraState;

    if (heap.IsEmpty()) {
        dijkstraState.finished = true;
        logToScreen("Dijkstra finished");
        console.log("Dijkstra finished");
        return;
    }

    const u = heap.remove_min();
    dijkstraState.current = u.id;

    logToScreen(`Visiting node ${reverseMapping.get(u.id)} with distance ${u.distance}`);
    console.log(`Visiting node ${reverseMapping.get(u.id)} with distance ${u.distance}`);
    highlightNode(u.id);  // Optional animation hook

    let edge = u.first;
    while (edge !== null) {
        const v = edge.end;
        const dv = u.distance + edge.length;

        if (N[v].distance > dv) {
            N[v].distance = dv;
            N[v].P = u.id;

            if (N[v].position >= 0) {
                heap.decreaseKey(N[v].position, dv);
            } else {
                heap.insert(N[v]);
            }
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
