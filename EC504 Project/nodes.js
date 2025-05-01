let nodeCount = 0; //number of nodes: accurate
let edgeCount = 0; //number of edges: accurate
import { NodeItem, Arc, DijkstraHeap, printOutput } from './shortPaths.js';
import {runDijkstraStep, initializeDijkstraStepByStep, dijkstraState} from './animation.js';


const addNodeButton = document.getElementById("addNodeButton"); //addNode button
const nodeInput = document.getElementById("nodeValueInput"); //
const dijkstraButton = document.getElementById("dijkstraButton"); // Dijkstra button
const originInput = document.getElementById("Or");               // Origin node input

const topMargin = 60;      
const leftMargin = 250;     
const nodeSize = 40;    //dimensions

const nodeNames = [];
const nodeMapping = new Map();
const reverseMapping = new Map();
let graphInitialized = false;

function resetGraph() { //when new node is added, new edge is added, or new origin node is selected, reset graph
    graphInitialized = false;
    const nodes = document.querySelectorAll('.node');
    nodes.forEach(node => {
        node.classList.remove('highlighted');
    });
    console.log("Graph reset and dehighlighted");
}

addNodeButton.addEventListener("click", () => {
    const value = nodeInput.value.trim();
    if (value === "") return;

    /*//Make sure the value is a number
    if (!/^\d+$/.test(value)) {
        alert("Enter numbers only.");
        nodeInput.value = "";
        return;
    }*/
    if (nodeNames.includes(value)) {
        alert(`Node "${value}" already exists.`);
        nodeInput.value = "";
        return;
    }

    const node = document.createElement("div");
    node.className = "node";
    node.innerText = value;
    node.id = `node-${value}`;

    //Randomize position (can't be within margin)
    const x = Math.floor(Math.random() * (window.innerWidth - leftMargin - nodeSize)) + leftMargin;
    const y = Math.floor(Math.random() * (window.innerHeight - topMargin - nodeSize)) + topMargin;

    node.style.left = `${x}px`;
    node.style.top = `${y}px`;

    makeDraggable(node);
    document.body.appendChild(node);

    addNodeToTable(value, node);
    nodeCount++;

    //console.log('Current node count:', nodeCount);
    nodeInput.value = "";
});

nodeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addNodeButton.click();
    }
}); //enter also works instead of clicking


let previouslySelectedRow = null;
const tableRowToNodeMap = new Map(); //map edges to nodes

document.addEventListener('click', function(event) { //deselect nodes, click elsewhere
    const table = document.getElementById('nodesTable');
    if (!table.contains(event.target)) {
        for (let i = 1; i < table.rows.length; i++) {
            table.rows[i].classList.remove('selected');
        }
        if (previouslySelectedRow) {
            previouslySelectedRow.classList.remove('selected');
            previouslySelectedRow = null;
        }
    }
});

document.getElementById('Or').addEventListener('input', resetGraph); //reset Graph if origin node is changed at all

function addNodeToTable(nodeInput, nodeDiv) {
    resetGraph();
    const nodeName = nodeInput.trim();
    const nodeIndex = nodeNames.length + 1;

    const row = nodesTable.insertRow();
    const nodeCell = row.insertCell(0);
    const knownCell = row.insertCell(1);
    const costCell = row.insertCell(2);
    const pathCell = row.insertCell(3);

    nodeCell.innerText = nodeName;
    knownCell.innerText = "-"; 
    costCell.innerText = "-"; 
    pathCell.innerText = "-"; 

    nodeNames.push(nodeName); 
    nodeMapping.set(nodeName, nodeIndex);
    reverseMapping.set(nodeIndex, nodeName);

    tableRowToNodeMap.set(row, nodeDiv);

    row.addEventListener('click', (e) => {
        e.stopPropagation();

        if (previouslySelectedRow && previouslySelectedRow !== row) {
            const node1 = tableRowToNodeMap.get(previouslySelectedRow);
            const node2 = tableRowToNodeMap.get(row);
            resetGraph();
            drawLineBetweenVisualNodes(node1, node2);

            previouslySelectedRow.classList.remove('selected');
            row.classList.remove('selected');
            previouslySelectedRow = null;
            return;
        }

        const isAlreadySelected = row.classList.contains('selected');
        for (const r of nodesTable.rows) {
            r.classList.remove('selected');
        }

        if (!isAlreadySelected) {
            row.classList.add('selected');
            previouslySelectedRow = row;
        } else {
            previouslySelectedRow = null;
        }
    });
}

const connections = []; // Each item: { line, div1, div2, text}

function drawLineBetweenVisualNodes(div1, div2) {
    const svg = document.getElementById('graphLines');

    let existingConnection = null; //check if this edge already exists
    for (const conn of connections) {
        if ((conn.div1 === div1 && conn.div2 === div2) || (conn.div1 === div2 && conn.div2 === div1)) {
            existingConnection = conn;
            break;
        }
    }

    if (existingConnection) {
        return;
    }

    edgeCount++;
    const rect1 = div1.getBoundingClientRect();
    const rect2 = div2.getBoundingClientRect();

    const x1 = rect1.left + rect1.width / 2;
    const y1 = rect1.top + rect1.height / 2 + window.scrollY;
    const x2 = rect2.left + rect2.width / 2;
    const y2 = rect2.top + rect2.height / 2 + window.scrollY;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#0074D9");
    line.setAttribute("stroke-width", "2");

    svg.appendChild(line);

    const newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    newText.setAttribute("fill", "black");
    newText.setAttribute("text-anchor", "middle");
    newText.setAttribute("font-size", "12");

    const midX = (x1 + x2) / 2 - 5;
    const midY = (y1 + y2) / 2 - 5;

    /*newText.setAttribute("x", midX);
    newText.setAttribute("y", midY);
    newText.textContent = "0"; 

    svg.appendChild(newText);*/
    const text = createTextForLine(line, midX, midY);

    connections.push({ line, div1, div2, text});
}

function updateConnectedLines(node) {
    connections.forEach(({ line, div1, div2, text }) => {
        if (div1 === node || div2 === node) {
            const rect1 = div1.getBoundingClientRect();
            const rect2 = div2.getBoundingClientRect();

            const x1 = rect1.left + rect1.width / 2;
            const y1 = rect1.top + rect1.height / 2;
            const x2 = rect2.left + rect2.width / 2;
            const y2 = rect2.top + rect2.height / 2;

            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
            
            const midX = (x1 + x2) / 2 - 5;
            const midY = (y1 + y2) / 2 - 5; 

            if (text) {
                text.setAttribute("x", midX);
                text.setAttribute("y", midY);
            }
        }
    });
} //for dragged nodes, update line positions

function createTextForLine(line, midX, midY) {
    const svg = document.getElementById('graphLines');
    const newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    newText.setAttribute("fill", "black"); //change number text font
    newText.setAttribute("text-anchor", "middle");
    newText.setAttribute("font-size", "30");
    newText.setAttribute("cursor", "pointer");
    newText.setAttribute("x", midX);
    newText.setAttribute("y", midY);
    newText.textContent = "0"; 

    newText.style.pointerEvents = "all";

    newText.addEventListener("mouseenter", () => {
        newText.style.fill = "#0074D9";  // change color on hover
    });
    newText.addEventListener("mouseleave", () => {
        newText.style.fill = "black";  // revert color when hover ends
    });

    newText.addEventListener("click", () => {
        const newValue = prompt('Enter new edge value:', newText.textContent);
        //only positive numbers or zero
        if (newValue !== null && newValue.trim() !== "" && /^[+]?\d+(\.\d+)?$/.test(newValue.trim())) {
            newText.textContent = newValue.trim();  
        } else {
            alert("Please enter a valid non-negative number.");
        }
    });

    svg.appendChild(newText);
    return newText;
}

function makeDraggable(el) {
    let offsetX = 0, offsetY = 0, isDragging = false;

    el.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
    })

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        x = Math.max(leftMargin, Math.min(x, window.innerWidth - nodeSize));
        y = Math.max(topMargin, Math.min(y, window.innerHeight - nodeSize));

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
    });

    document.addEventListener("mouseup", () => {
        updateConnectedLines(el); 
        isDragging = false;
    });
}

function createEdgeListFromConnections() {
    const edgeList = [];
    let nodeId = 1;

    //map node names to numbers
    for (const conn of connections) {
        const node1 = conn.div1.textContent;
        const node2 = conn.div2.textContent;

        if (!nodeMapping.has(node1)) {
            nodeMapping.set(node1, nodeId++);
        }
        if (!nodeMapping.has(node2)) {
            nodeMapping.set(node2, nodeId++);
        }
    }

    //edge list with node ids and edge weights
    for (const conn of connections) {
        const node1 = conn.div1.textContent;
        const node2 = conn.div2.textContent;
        const weight = conn.text.textContent;

        const node1Id = nodeMapping.get(node1);
        const node2Id = nodeMapping.get(node2);

        edgeList.push([node1Id, node2Id, parseInt(weight)]);
    }

    return edgeList;
}

document.getElementById('dijkstraButton').addEventListener('click', function() {
    //console.log(edgeCount);
    
    const edgeList = createEdgeListFromConnections();
    let formattedEdgeList = '';
    formattedEdgeList += `${nodeCount} ${edgeCount}\n`;
    for (const edge of edgeList) {
        formattedEdgeList += `${edge[0]} ${edge[1]} ${edge[2]}\n`;
    }

    const originNodeId = originInput.value.trim();
    if (originNodeId === "") {
        alert("Please enter a valid origin node ID!");
        return;
    }
    if (!nodeMapping.has(originNodeId)) {
        alert("Origin node does not exist!");
        return;
    }

    //console.log("Origin node entered:", originNodeId);
    //console.log("node entered:", nodeMapping);

    const blob = new Blob([formattedEdgeList], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'edge_list.txt';
    link.click();

    const maxnodes = 100; // Define maxnodes as needed
    const LARGE = Infinity; // Define a large value for initialization

    let Na, Nm, Or; // Num edges, num vertices, origin node for shortest path tree
    let Nodes = new Array(maxnodes).fill(null).map(() => ({ first: null, id: 0, distance: LARGE, P: -1, position: -1 }));
    let edge;
    for (let i=0;i<=nodeCount;i++){  // Initialize nodes
        Nodes[i].first = null;
        Nodes[i].id = i;
        Nodes[i].distance = LARGE;
        Nodes[i].P = -1;
        Nodes[i].position = -1;
    }

    const lines = formattedEdgeList.split('\n');
    [Nm, Na] = lines[0].split(' ').map(Number);

    for (let i = 1; i <= Nm+1; i++) {  // Initialize nodes
        Nodes[i].id = i;
    }

    // Read arcs: we create these dynamically, store them in linked lists
    for (let i = 1; i <= Na; i++) {
        const [Or, end, length] = lines[i].split(' ').map(Number);
        edge = { end, length, next: Nodes[Or].first };
        Nodes[Or].first = edge;

        //reverse edge too for undirected
        edge = { end: Or, length, next: Nodes[end].first };
        Nodes[end].first = edge;
    }

    const Origin = nodeMapping.get(originNodeId);  // Use the input node
    //console.log("CALLING Dijkstra Heap\n");
    DijkstraHeap(Nodes, Origin, nodeCount);

    //console.log("PRINTING RESULTS:");
    printOutput(Nodes, Origin, nodeCount);
});

function initializeGraph() {
    const edgeList = createEdgeListFromConnections();
    let formattedEdgeList = `${nodeCount} ${edgeCount}\n`;
    for (const edge of edgeList) {
        formattedEdgeList += `${edge[0]} ${edge[1]} ${edge[2]}\n`;
    }

    const originNodeId = originInput.value.trim();
    if (originNodeId === "") {
        alert("Please enter a valid origin node ID!");
        return null;
    }
    if (!nodeMapping.has(originNodeId)) {
        alert("Origin node does not exist!");
        return null;
    }

    const Or = nodeMapping.get(originNodeId);
    const maxnodes = 100;
    const LARGE = Infinity;

    const Nodes = new Array(maxnodes).fill(null).map((_, i) => ({
        first: null, id: i, distance: LARGE, P: -1, position: -1
    }));

    const lines = formattedEdgeList.trim().split('\n');
    const [Nm, Na] = lines[0].split(' ').map(Number);

    for (let i = 1; i <= Na; i++) {
        const [start, end, length] = lines[i].split(' ').map(Number);
        let edge = { end, length, next: Nodes[start].first };
        Nodes[start].first = edge;

        edge = { end: start, length, next: Nodes[end].first };
        Nodes[end].first = edge;
    }

    return { Nodes, Or, Nm };
}

document.getElementById('dijkstraButtonSteps').addEventListener('click', () => {
    if (!graphInitialized) {
        const result = initializeGraph();
        if (!result) return;

        const { Nodes, Or, Nm } = result;
        initializeDijkstraStepByStep(Nodes, Or, Nm);
        graphInitialized = true;
    } else if (dijkstraState.finished) {
        alert("Dijkstra is already finished. To run the same simulation, delete the origin node and type in the same origin node to reset. Also, if you add a new node, edge or pick a different origin node, you can run a simulation on the new graph.");
    } else {
        runDijkstraStep();
    }
});


export {nodeMapping, reverseMapping};
