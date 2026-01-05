import axios from "axios";

const targetUrl = "https://aiskillshouse.com/student/qr-mediator.html?uid=5096&promptId=6";

// Example free proxies (http://ip:port). You can find fresh ones on free-proxy lists.
const proxies = [
  "http://103.152.5.70:8080",
  "http://103.148.45.167:8080",
  "http://103.173.228.148:8080",
  "http://103.189.234.161:8080"
];

// Function to pick random proxy
function getRandomProxy() {
  return proxies[Math.floor(Math.random() * proxies.length)];
}

// Simulate scans
async function simulateScans(count) {
  for (let i = 0; i < count; i++) {
    const proxy = getRandomProxy();
    try {
      const response = await axios.get(targetUrl, {
        proxy: {
          host: proxy.split(":")[1].replace("//", ""),
          port: parseInt(proxy.split(":")[2])
        },
        timeout: 5000
      });
      console.log(`✅ Scan ${i + 1} via ${proxy} → Status: ${response.status}`);
    } catch (err) {
      console.log(`❌ Scan ${i + 1} via ${proxy} failed`);
    }
  }
}

// Run 10 fake scans
simulateScans(10);
