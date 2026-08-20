# Persistent Priority Queue

A file-based priority queue implementation in Node.js — queue state is saved to `queue.txt` automatically, so it survives process restarts.

---

## Requirements

- Node.js v18 or higher
- No npm packages required — only built-in Node modules are used

---

## Getting Started

Clone the repo and run the demo directly — no install step needed:

```bash
git clone https://github.com/DevSingh28/persistent-priority-queue.git
cd persistent-priority-queue
node UsageExample.js
```

`queue.txt` will be created automatically on the first insert.

---

## Usage

```js
import PriorityQueue from "./module.js";

const pq = PriorityQueue();

// Must be called once before anything else — loads state from queue.txt if it exists
await pq.init();

// Display available methods and usage
await pq._help();

// insert(value, priority) — returns a unique id for the item
const id1 = await pq.insert("Fix production bug", 10);
const id2 = await pq.insert("Update README", 1);
const id3 = await pq.insert("Code review", 7);

// peek — read min or max without removing
pq.peek("min"); // { id, value: "Update README", priority: 1 }
pq.peek("max"); // { id, value: "Fix production bug", priority: 10 }

// extract — removes and returns the item
await pq.extract_min(); // { id, value: "Update README", priority: 1 }
await pq.extract_max(); // { id, value: "Fix production bug", priority: 10 }

// update priority of an existing item by id
await pq.update(id3, 2);

// delete an item by id
await pq.delete(id3);

// utility
pq.size();     // number of items in the queue
pq.is_empty(); // true if queue has no items

// print full API reference to console
pq._help();
```

---

## API Reference

| Method                             | Description                                              | Returns          |
| ---------------------------------- | -------------------------------------------------------- | ---------------- |
| `await pq.init()`                  | Load state from disk. Call once before any other method. | `void`           |
| `await pq.insert(value, priority)` | Add item with given priority                             | `string` (id)    |
| `await pq.extract_min()`           | Remove and return lowest priority item                   | `item` or `null` |
| `await pq.extract_max()`           | Remove and return highest priority item                  | `item` or `null` |
| `pq.peek("min" \| "max")`          | Read min or max item without removing                    | `item` or `null` |
| `await pq.update(id, newPriority)` | Change priority of item by id                            | `item` or `null` |
| `await pq.delete(id)`              | Remove item by id                                        | `item` or `null` |
| `pq.is_empty()`                    | Check if queue has no items                              | `boolean`        |
| `pq.size()`                        | Number of items in queue                                 | `number`         |
| `pq._help()`                       | Display the available API methods and usage examples     | `void`           |

---

## How It Works

- The queue is a **sorted array** — lowest priority number at index 0, highest at the last index
- Every insert and update uses **binary search** to find the correct position — the array is never re-sorted from scratch
- Every mutating operation writes the full queue state to `queue.txt` as JSON — so the queue picks up exactly where it left off after a restart

Each stored item has the shape:

```js
{ id: string, value: any, priority: number }
```

IDs are generated using Node's built-in `crypto.randomUUID()`.

---

## Project Structure

```
persistent-priority-queue/
├── README.md     # This file
├── module.js     # PriorityQueue implementation
├── UsageExample.js       # Demonstrates all operations
└── queue.txt     # Auto-created on first insert; stores persisted state
```
