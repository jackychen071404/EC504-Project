let nodeCount = 0;

const addNodeButton = document.getElementById("addNodeButton"); //addNode button
const nodeInput = document.getElementById("nodeValueInput"); //

const topMargin = 60;      
const leftMargin = 250;     
const nodeSize = 40;    //dimensions

const nodes = [];
const edges = [];

addNodeButton.addEventListener("click", () => {
    const value = nodeInput.value.trim();
    if (value === "") return;

    /*//Make sure the value is a number
    if (!/^\d+$/.test(value)) {
        alert("Enter numbers only.");
        nodeInput.value = "";
        return;
    }*/

    const node = document.createElement("div");
    node.className = "node";
    node.innerText = value;

    //Randomize position (can't be within margin)
    const x = Math.floor(Math.random() * (window.innerWidth - leftMargin - nodeSize)) + leftMargin;
    const y = Math.floor(Math.random() * (window.innerHeight - topMargin - nodeSize)) + topMargin;

    node.style.left = `${x}px`;
    node.style.top = `${y}px`;

    makeDraggable(node);
    document.body.appendChild(node);

    addNodeToTable(value, node);
    nodeCount++;
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
            previouslySelectedRow.classList.remove('selected');
            previouslySelectedRow = null;
        }
    }
});

function addNodeToTable(nodeInput, nodeDiv) {
    const row = nodesTable.insertRow();
    const nodeCell = row.insertCell(0);
    const knownCell = row.insertCell(1);
    const costCell = row.insertCell(2);
    const pathCell = row.insertCell(3);

    nodeCell.innerText = nodeInput;
    knownCell.innerText = "-"; 
    costCell.innerText = "-"; 
    pathCell.innerText = "-"; 

    tableRowToNodeMap.set(row, nodeDiv);

    row.addEventListener('click', (e) => {
        e.stopPropagation();

        if (previouslySelectedRow && previouslySelectedRow !== row) {
            const node1 = tableRowToNodeMap.get(previouslySelectedRow);
            const node2 = tableRowToNodeMap.get(row);
            //alert("You clicked a different node.\nNode1: " + node1?.innerText + "\nNode2: " + node2?.innerText);
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

    const midX = (x1 + x2) / 2;
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
            
            const midX = (x1 + x2) / 2;
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
    newText.setAttribute("fill", "black");
    newText.setAttribute("text-anchor", "middle");
    newText.setAttribute("font-size", "12");
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
        if (newValue !== null && newValue.trim() !== "") {
            newText.textContent = newValue.trim();  //edit values
            //updateConnectedLines();  // Update the lines if necessary
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