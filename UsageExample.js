import PriorityQueue from "./Module.js";

async function main() {

    const pq = PriorityQueue()
    await pq.init()
    pq._help()

    

}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});