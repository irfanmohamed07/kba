
async function testEndpoints() {
    console.log("Testing Python Agent (5003)...");
    try {
        const res = await fetch('http://localhost:5003/predict-demand');
        if (res.ok) {
            console.log("Python Agent Response:", await res.json());
        } else {
            console.log("Python Agent Error Status:", res.status);
            console.log("Python Agent Error Text:", await res.text());
        }
    } catch (e) {
        console.log("Python Agent Connection Failed:", e.message);
        console.log("Details:", e);
    }

    console.log("\nTesting Node Route (8000)...");
    try {
        const res = await fetch('http://localhost:8000/api/mess-prediction');
        if (res.ok) {
            console.log("Node Route Response:", await res.json());
        } else {
            console.log("Node Route Error Status:", res.status);
            const text = await res.text();
            console.log("Node Route Error Text:", text.substring(0, 500)); // Print first 500 chars
        }
    } catch (e) {
        console.log("Node Route Connection Failed:", e.message);
    }
}

testEndpoints();
