let videoElement;
let canvasElement;
let canvasContext;

function startScanner() {
  document.getElementById("scanner-container").classList.remove("hidden");
  videoElement = document.getElementById("videoElement");
  canvasElement = document.createElement("canvas");
  canvasContext = canvasElement.getContext("2d");

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
      videoElement.srcObject = stream;
      videoElement.setAttribute("playsinline", true);
      videoElement.play();
      videoElement.onloadedmetadata = () => scanQRCode();
    })
    .catch((err) => alert("Error accessing camera."));
}

function scanQRCode() {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
  canvasContext.drawImage(
    videoElement,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  const imageData = canvasContext.getImageData(
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  const code = jsQR(imageData.data, imageData.width, imageData.height);

  if (code) {
    document.getElementById("qrInput").value = code.data;
    stopScanner();
  } else {
    requestAnimationFrame(scanQRCode);
  }
}

function stopScanner() {
  const stream = videoElement.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach((track) => track.stop());
  videoElement.srcObject = null;
}
