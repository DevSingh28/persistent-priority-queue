"use strict";

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Path to the file used for persisting queue state
const STORAGE_FILE = path.join(process.cwd(), "queue.txt");

const PriorityQueue = () => {

  // Internal sorted array representing the queue
  let _heap = [];

  // Flag to ensure init() is called before any operation
  let _ready = false;

  // Throws if the queue hasn't been initialised yet
  const _assertReady = () => {
    if (!_ready) {
      throw new Error("PriorityQueue not initialised. Call await pq.init() first.");
    }
  };

  // Writes the current heap state to disk as JSON
  const _save = async () => {
    await fs.writeFile(STORAGE_FILE, JSON.stringify(_heap, null, 2), "utf8");
  };

  // Binary search to find the correct insertion index for a given priority (ascending, stable)
  const _findInsertIndex = (priority) => {
    let lo = 0;
    let hi = _heap.length;

    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (_heap[mid].priority <= priority) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    return lo;
  };

  // Linear search to find the array index of an item by its id
  const _findIndexById = (id) => _heap.findIndex((item) => item.id === id);

  // Loads persisted queue from disk, or starts with an empty queue if no file exists
  const init = async () => {
    try {
      const raw = await fs.readFile(STORAGE_FILE, "utf8");
      const parsed = JSON.parse(raw.trim());
      if (Array.isArray(parsed)) {
        _heap = parsed;
      }
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw new Error(`Failed to load queue from disk: ${err.message}`);
      }
      _heap = [];
    }
    _ready = true;
  };

  // Inserts a new item at the correct sorted position and returns its generated id
  const insert = async (value, priority) => {
    _assertReady();

    if (typeof priority !== "number" || isNaN(priority)) {
      throw new TypeError("priority must be a valid number");
    }

    const item = { id: randomUUID(), value, priority };
    const idx = _findInsertIndex(priority);
    _heap.splice(idx, 0, item);

    await _save();
    return item.id;
  };

  // Removes and returns the lowest-priority item (index 0), or null if empty
  const extract_min = async () => {
    _assertReady();
    if (_heap.length === 0) return null;
    const item = _heap.shift();
    await _save();
    return item;
  };

  // Removes and returns the highest-priority item (last index), or null if empty
  const extract_max = async () => {
    _assertReady();
    if (_heap.length === 0) return null;
    const item = _heap.pop();
    await _save();
    return item;
  };

  // Returns the min or max item without removing it, or null if empty
  const peek = (type = "min") => {
    _assertReady();
    if (_heap.length === 0) return null;
    return type === "max" ? _heap[_heap.length - 1] : _heap[0];
  };

  // Updates the priority of an existing item by id and re-inserts it at the correct position
  const update = async (id, newPriority) => {
    _assertReady();

    if (typeof newPriority !== "number" || isNaN(newPriority)) {
      throw new TypeError("newPriority must be a valid number");
    }

    const idx = _findIndexById(id);
    if (idx === -1) return null;

    const [item] = _heap.splice(idx, 1);
    item.priority = newPriority;

    const newIdx = _findInsertIndex(newPriority);
    _heap.splice(newIdx, 0, item);

    await _save();
    return item;
  };

  // Removes and returns an item by id, or null if not found
  const deleteItem = async (id) => {
    _assertReady();
    const idx = _findIndexById(id);
    if (idx === -1) return null;
    const [item] = _heap.splice(idx, 1);
    await _save();
    return item;
  };

  // Returns true if the queue contains no items
  const is_empty = () => {
    _assertReady();
    return _heap.length === 0;
  };

  // Returns the number of items currently in the queue
  const size = () => {
    _assertReady();
    return _heap.length;
  };

  // Prints the full API reference to the console
  const _help = () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                    PriorityQueue API                      ║
╚════════════════════════════════════════════════════════════╝

PriorityQueue stores items in ascending priority order.
Lower priority number = higher priority.

──────────────────────────────────────────────────────────────

1. init()

   Initialize the queue and load existing data from queue.txt.

   Usage:
     await pq.init();

──────────────────────────────────────────────────────────────

2. insert(value, priority)

   Add a new item to the queue.

   Parameters:
     value    → Any value you want to store
     priority → Number representing priority

   Returns:
     Promise<string> → Generated item ID

   Usage:
     const id = await pq.insert("Fix production bug", 1);

──────────────────────────────────────────────────────────────

3. extract_min()

   Remove and return the highest-priority item.
   (The item with the smallest priority number.)

   Returns:
     Promise<object | null>

   Usage:
     const item = await pq.extract_min();

──────────────────────────────────────────────────────────────

4. extract_max()

   Remove and return the lowest-priority item.
   (The item with the largest priority number.)

   Returns:
     Promise<object | null>

   Usage:
     const item = await pq.extract_max();

──────────────────────────────────────────────────────────────

5. peek(type)

   View an item without removing it.

   Parameters:
     "min" → Highest-priority item
     "max" → Lowest-priority item

   Usage:
     pq.peek("min");
     pq.peek("max");

──────────────────────────────────────────────────────────────

6. update(id, newPriority)

   Change the priority of an existing item.

   Parameters:
     id           → Item ID returned by insert()
     newPriority  → New priority number

   Returns:
     Promise<object | null>

   Usage:
     await pq.update(id, 1);

──────────────────────────────────────────────────────────────

7. delete(id)

   Remove an item using its ID.

   Parameters:
     id → Item ID returned by insert()

   Returns:
     Promise<object | null>

   Usage:
     await pq.delete(id);

──────────────────────────────────────────────────────────────

8. is_empty()

   Check whether the queue contains no items.

   Returns:
     boolean

   Usage:
     pq.is_empty();

──────────────────────────────────────────────────────────────

9. size()

   Get the number of items currently in the queue.

   Returns:
     number

   Usage:
     pq.size();

──────────────────────────────────────────────────────────────

10. _help()

   Display this help information.

   Usage:
     pq._help();

──────────────────────────────────────────────────────────────

Example:

  const pq = PriorityQueue();

  await pq.init();

  pq._help();

  const id = await pq.insert("Fix server", 1);

  console.log(pq.peek("min"));

  await pq.update(id, 2);

  await pq.delete(id);

  console.log(pq.size());

`);
  };

  // Expose public API ('delete' aliased since it's a reserved word)
  return {
    init,
    insert,
    extract_min,
    extract_max,
    peek,
    update,
    delete: deleteItem,
    is_empty,
    size,
    _help,
  };
};

export default PriorityQueue;