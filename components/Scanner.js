"use client";
"use client";
import React, { useEffect, useRef, useState } from "react";
import Quagga from "quagga";

const BarcodeScanner = () => {
  const [barcodes, setBarcodes] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false); // To prevent duplicate scans during the delay
  const [inputDevices, setInputDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [quaggaStarted, setQuaggaStarted] = useState(false); // Flag to track if Quagga is started

  const startQuagga = (deviceId) => {
    if (scannerRef.current) {
      Quagga.init(
        {
          locate: true,
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current, // The DOM element where the camera feed will be rendered
            constraints: {
              deviceId: deviceId ? { exact: deviceId } : undefined, // Use the selected camera
              width: 1920, // Increase resolution width
              height: 1080,
              facingMode: "environment", // Use the back camera by default
            },
          },
          decoder: {
            readers: ["upc_reader", "ean_reader"], // Different barcode formats
          },
        },
        function (err) {
          if (err) {
            console.error(err);
            return;
          }
          console.log("Initialization finished. Ready to start");
          Quagga.start();
          setQuaggaStarted(true); // Set flag to true after starting
        }
      );

      Quagga.onDetected((result) => {
        if (
          result &&
          result.codeResult &&
          result.codeResult.code &&
          !isScanningRef.current
        ) {
          isScanningRef.current = true; // Set the flag to prevent immediate re-scan
          setBarcodes((prev) => [...prev, result.codeResult.code]);
          console.log(result.codeResult.code);
          setTimeout(() => {
            isScanningRef.current = false; // Reset the flag to allow new scans
          }, 1500);
        }
      });
    }
  };

  const stopQuagga = () => {
    Quagga.stop();
    setQuaggaStarted(false); // Reset the flag after stopping
  };

  useEffect(() => {
    // Get the list of input devices (cameras)
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setInputDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId); // Set the default device
      }
    });
  }, []);

  useEffect(() => {
    if (isScanning) {
      startQuagga(selectedDevice);
    }

    return () => {
      // Only stop Quagga if it was started
      if (quaggaStarted) {
        Quagga.stop();
        setQuaggaStarted(false); // Reset the flag after stopping
      }
    };
  }, [isScanning, selectedDevice]);

  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
    if (isScanning) {
      Quagga.stop(); // Stop current instance
      setQuaggaStarted(false);
      startQuagga(event.target.value); // Start Quagga with new device
    }
  };

  return (
    <div className="pt-0 md:pt-4">
      <div className="max-w-sm mx-auto border">
        <div className="w-full h-12 bg-neutral-100 border-b flex items-center px-4 gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={28}
            height={28}
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M2 6h1v12H2zm2 0h2v12H4zm4 0h1v12H8zm2 0h3v12h-3zm4 0h1v12h-1zm3 0h1v12h-1zm2 0h1v12h-1zm2 0h1v12h-1z"
            ></path>
          </svg>
          <h2 className="font-semibold">Barcode Scanner</h2>
          <a
            href="https://github.com/priyangsubanerjee/barcode-scanner"
            className="ml-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
              ></path>
            </svg>
          </a>
        </div>

        {/* Camera selection */}

        <div className="w-full max-w-sm">
          <div
            ref={scannerRef}
            className="w-full h-[200px] max-w-sm mx-auto overflow-hidden"
          ></div>
        </div>
        <div className="grid grid-cols-2 p-2 gap-2 border-y">
          <button
            onClick={() => setIsScanning(true)}
            className="bg-neutral-200 rounded py-2"
          >
            Scan
          </button>
          <button
            onClick={() => {
              stopQuagga();
              setIsScanning(false);
            }}
            className="bg-neutral-200 rounded py-2"
          >
            Stop
          </button>
        </div>

        <div className="w-full px-2 py-3 border-b flex justify-between gap-3 items-center whitespace-nowrap">
          <label htmlFor="camera" className="text-sm font-semibold">
            Camera:
          </label>
          <select
            id="camera"
            value={selectedDevice}
            onChange={handleDeviceChange}
            className="w-full rounded text-sm"
          >
            {inputDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </option>
            ))}
          </select>
        </div>

        <div className="p-2 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Scanned contents</h2>
            <button
              onClick={() => setBarcodes([])}
              className="text-sm text-neutral-800"
            >
              Clear all
            </button>
          </div>
          {barcodes.length === 0 ? (
            <p className="text-sm text-neutral-500 mt-2">
              No barcodes scanned yet
            </p>
          ) : (
            <ul className="space-y-2 mt-3">
              {barcodes.map((barcode, index) => (
                <li key={index} className="text-sm text-neutral-700">
                  {barcode}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="max-w-sm mx-auto flex items-center justify-center mt-16 text-neutral-700">
        <p className="text-xs">
          Developed by{" "}
          <a className="hover:underline" href="https://priyangsu.dev">
            @priyangsubanerjee
          </a>
        </p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
