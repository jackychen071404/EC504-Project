import { Heap } from './myHeap.js'; // Assuming your heap is exported like this
import { nodeMapping, reverseMapping } from './nodes.js';

// Define constants
const LARGE1 = 9999999;
const maxnodes = 200000;

// Node structure
class NodeItem {
    constructor(id) {
        this.id = id;
        this.distance = LARGE1;
        this.P = null;          // Predecessor node in shortest path
        this.position = -1;     // Position in heap; -1 means not in heap
        this.first = null;      // First outgoing arc (linked list)
    }
}

// Arc structure
class Arc {
    constructor(end, length) {
        this.end = end;
        this.length = length;
        this.next = null;
    }
}

// Dijkstra's algorithm using Heap
function DijkstraHeap(N, Or, Nm) {
    const thisHeap = new Heap();

    N[Or].distance = 0;
    //console.log(Or);
    thisHeap.insert(N[Or]);

    while (!thisHeap.IsEmpty()) {
        const u = thisHeap.remove_min();  // remove the node with min distance
        let edge = u.first;

        while (edge !== null) {
            const v = edge.end;
            const dv = u.distance + edge.length;

            if (N[v].distance > dv) {
                N[v].distance = dv;
                N[v].P = u.id;

                if (N[v].position >= 0) {
                    thisHeap.decreaseKey(N[v].position, dv);
                } else {
                    thisHeap.insert(N[v]);
                }
            }
            edge = edge.next;
        }
    }
}

function getKeyByValue(map, value) {
    for (const [key, val] of map.entries()) {
        if (val === value) return key;
    }
    return null; // or 'Unknown'
}

function printOutput(N, Origin, Nm) {
    let Nd = 100; // number of destinations to select
    let SelectDestinations = new Array(Nd);
    let take, col;

    if (Nd < Nm) {
        for (let i = 0; i < Nd; i++) {
            take = ((i + 1) * Math.floor(Nm / Nd)) % Nm + 1;
            if (take === 1) take = 2;
            SelectDestinations[i] = take;
        }
    } else {
        Nd = Nm;
        SelectDestinations = new Array(Nd);
        for (let i = 0; i < Nd; i++) {
            SelectDestinations[i] = i + 1;
        }
    }

    for (let i = 0; i < Nd; i++) {
        col = SelectDestinations[i];
        if (!N[col] || N[col].distance === LARGE1) {
            console.error(`Node ${col} is undefined or unreachable!`);
            continue;
        }

        //console.log(`Shortest distance from ${Origin} to ${col}: ${N[col].distance}`);

        let pathStr = `${getKeyByValue(nodeMapping, col)}`;
        let prev = N[col].P;

        while (prev > 0) {

            let edge = N[prev].first;

            
            pathStr += ` --> ${getKeyByValue(nodeMapping, prev)}`;
            prev = N[prev].P;
        }

        // reverse path for clarity
        pathStr = pathStr.split(" --> ").reverse().join(" --> ");
        //console.log(pathStr);

        const table = document.getElementById("nodesTable");
        const rows = table.getElementsByTagName("tr");
        //console.log(rows);

        const row = rows[i+1];
        row.cells[3].textContent = pathStr;
        row.cells[2].textContent = N[col].distance;
        if (N[col].distance === Infinity) {
            row.cells[1].textContent = "F";
        } else {
            row.cells[1].textContent = "T";
        }
    }
}

export { NodeItem, Arc, DijkstraHeap, printOutput };
