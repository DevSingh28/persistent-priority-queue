import PriorityQueue from "./Module.js";

async function main() {
  const pq = PriorityQueue();

  await pq.init();

  // Display available API methods
  pq._help();

  // Insert items
  const id1 = await pq.insert("Fix production bug", 1);
  const id2 = await pq.insert("Deploy application", 5);
  const id3 = await pq.insert("Update README", 10);
  const id4 = await pq.insert("Left Over To check in queue", 9);


  console.log("Size:", pq.size());

  // Peek without removing
  console.log("Min:", pq.peek("min"));
  console.log("Max:", pq.peek("max"));

  // Update priority
  console.log("Updated:", await pq.update(id3, 20));

  // Delete an item
  console.log("Deleted:", await pq.delete(id2));

  // Extract items
  console.log("Extract min:", await pq.extract_min());
  console.log("Extract max:", await pq.extract_max());

  // Queue status
  console.log("Size:", pq.size());
  console.log("Empty:", pq.is_empty());
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});