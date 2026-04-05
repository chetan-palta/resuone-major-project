const fetch = require('node-fetch'); // actually Node 18+ has native fetch

async function run() {
  const start = performance.now();
  try {
    const res = await fetch("http://localhost:5000/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projects: [{ title: "Test", description: "I worked on a secret api and made it fast." }],
        experience: [{ bulletPoints: ["I helped build the backend using node"] }],
        summary: "Worked hard",
        targetRole: "Backend Developer"
      })
    });
    const data = await res.json();
    const end = performance.now();
    console.log(JSON.stringify(data, null, 2));
    console.log(`Time taken: ${(end - start).toFixed(2)} ms`);
  } catch(e) {
    console.error(e);
  }
}
run();
