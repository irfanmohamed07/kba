
async function testEndpoints() {
    console.log("Testing Node Route (8000)...");
    try {
        const res = await fetch('http://localhost:8000/api/mess-prediction');
        const contentType = res.headers.get('content-type');
        console.log("Content-Type:", contentType);

        const text = await res.text();
        if (contentType && contentType.includes('application/json')) {
            console.log("Node Route Response:", JSON.parse(text));
        } else {
            console.log("Node Route Error Status:", res.status);
            console.log("Node Route Response Body Preview:");
            console.log(text.substring(0, 1000));
        }
    } catch (e) {
        console.log("Node Route Connection Failed:", e.message);
    }
}

testEndpoints();
