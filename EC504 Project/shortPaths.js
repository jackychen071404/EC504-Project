import { Heap } from './myHeap.js'; // Assuming your heap is exported like this

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
function printOutput(N, Origin, Nm) {
    let Nd = 10; // number of destinations to select
    let SelectDestinations = new Array(Nd + 1);
    let take, col;

    if (Nd < Nm) {
        for (let i = 0; i < Nd; i++) {
            take = ((i + 1) * Math.floor(Nm / Nd)) % Nm + 1;
            if (take === 1) take = 2;
            SelectDestinations[i] = take;
        }
    } else {
        Nd = Nm;
        for (let i = 1; i <= Nm; i++) {
            SelectDestinations[i] = i;
        }
    }

    for (let i = 0; i < Nd; i++) {
        col = SelectDestinations[i];
        // Add a check to ensure the node is valid before accessing properties
        if (!N[col]) {
            console.error(`Node ${col} is undefined!`);
            continue; // Skip this iteration if the node is invalid
        }

        console.log(`Shortest distance from ${Origin} to ${col}: ${N[col].distance}`);
        
        let path = `${col}`;
        col = N[col].P;
        while (col > 0) {
            path += ` --> ${col}`;
            col = N[col].P;
        }
        console.log(path);
    }
}
export { NodeItem, Arc, DijkstraHeap, printOutput };
