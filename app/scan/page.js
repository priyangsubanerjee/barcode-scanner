"use client";
import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

const ZXingScanner = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [devices, setDevices] = useState([]);
  const [result, setResult] = useState("");
  const videoRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    // Fetch available video input devices when the component mounts
    codeReader.current
      .listVideoInputDevices()
      .then((videoInputDevices) => {
        setDevices(videoInputDevices);
        if (videoInputDevices.length > 0) {
          setSelectedDeviceId(videoInputDevices[0].deviceId);
        }
      })
      .catch((err) => console.error(err));

    return () => {
      // Clean up the camera on component unmount
      codeReader.current.reset();
    };
  }, []);

  const startScanner = () => {
    if (selectedDeviceId && videoRef.current) {
      codeReader.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            let audioElem = document.getElementById("audio");
            audioElem.volume = 0.5;
            audioElem.play();
            setResult(result.text);
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error(err);
            setResult(err.message);
          }
        }
      );
    }
  };

  const resetScanner = () => {
    codeReader.current.reset();
    setResult("");
  };

  return (
    <main className="wrapper" style={{ paddingTop: "2em" }}>
      <section className="container" id="demo-content">
        <h1 className="title">Scan 1D/2D Code from Video Camera</h1>
        <p>
          <a className="button-small button-outline" href="/">
            HOME 🏡
          </a>
        </p>
        <p>
          This example shows how to scan any supported 1D/2D code with ZXing
          JavaScript library from the device video camera.
        </p>

        <div>
          <button className="button" onClick={startScanner}>
            Start
          </button>
          <button className="button" onClick={resetScanner}>
            Reset
          </button>
        </div>

        <div>
          <video
            ref={videoRef}
            width="300"
            height="200"
            style={{ border: "1px solid gray" }}
          ></video>
        </div>

        {devices.length > 1 && (
          <div id="sourceSelectPanel">
            <label htmlFor="sourceSelect">Change video source:</label>
            <select
              id="sourceSelect"
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              style={{ maxWidth: "400px" }}
            >
              {devices.map((device, index) => (
                <option key={index} value={device.deviceId}>
                  {device.label || `Device ${index + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <label>Result:</label>
        <pre>
          <code>{result}</code>
        </pre>

        <p>
          See the{" "}
          <a
            href="https://github.com/zxing-js/library/tree/master/docs/examples/multi-camera/"
            target="_blank"
            rel="noopener noreferrer"
          >
            source code
          </a>{" "}
          for this example.
        </p>
      </section>

      <footer className="footer">
        <section className="container">
          <p>
            ZXing TypeScript Demo. Licensed under the{" "}
            <a
              target="_blank"
              href="https://github.com/zxing-js/library#license"
              title="MIT"
            >
              MIT
            </a>
            .
          </p>
        </section>
      </footer>
      <audio id="audio" src="/scanned.mov"></audio>
    </main>
  );
};

export default ZXingScanner;
