const MAX_SIZE = 100000; // the maximum amount of elements our heap should have.

export class Heap {
    constructor() {
        this.elements = 0;
        this.array = new Array(MAX_SIZE);
    }

    insert(item) { // Add the object pointer item to the heap
        if (this.elements >= MAX_SIZE) {
            console.log("Heap is full; can't insert");
            return;
        }
        this.array[this.elements] = item;
        item.position = this.elements;
        this.upHeap(item.position);
        this.elements++;
    }

    remove_min() {
        if (this.elements === 0) {
            console.log("empty heap error, can't delete");
            return null;
        }
        const temp = this.array[0];
        temp.position = -1;
        this.elements--;
        if (this.elements > 0) {
            const element_to_downheap = this.array[this.elements];
            this.array[0] = element_to_downheap;
            element_to_downheap.position = 0;
            this.downHeap(element_to_downheap.position);
        }
        return temp;
    } // Remove the smallest element in the heap & restructure heap

    decreaseKey(pos, val) { // Decreases Key in pos to val
        if (pos < 0 || pos >= this.elements) { return; }
        this.array[pos].distance = val;
        this.upHeap(pos);
    }

    IsEmpty() { return (this.elements <= 0); }
    IsFull() { return (this.elements >= MAX_SIZE); }
    count() { return this.elements; }
    value(pos) { // return a pointer to an object in heap position
        if (pos >= this.elements) {
            console.log("Out of range of heap " + pos + " elements " + this.elements);
            return null;
        }
        return this.array[pos];
    }

    downHeap(pos) { // starting with element in position pos, sift it down the heap 
        const item = this.array[pos];
        const num_elements = this.count(); // Make sure to remove an element first in removeMin
        let j = 2 * pos + 1;
        while (j < num_elements) {
            if (j < num_elements - 1 && this.array[j].distance > this.array[j + 1].distance) {
                j++;
            }
            if (item.distance > this.array[j].distance) {
                this.array[j].position = pos;
                this.array[pos] = this.array[j];

                item.position = j;
                pos = j;
                j = 2 * j + 1;
            } else {
                break;
            }
        }
        this.array[pos] = item;
    }

    upHeap(new_pos) { // starting with element in position int, sift it up the heap
        const item = this.array[new_pos];

        while (item.position !== 0 && (item.distance < this.array[Math.floor((item.position - 1) / 2)].distance)) {
            this.array[Math.floor((item.position - 1) / 2)].position = item.position;
            this.array[item.position] = this.array[Math.floor((item.position - 1) / 2)];

            item.position = Math.floor((item.position - 1) / 2);
            new_pos = item.position;
        }
        this.array[item.position] = item;
    }
}
