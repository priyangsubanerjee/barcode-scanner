"use client";
import React, { useEffect, useRef, useState } from "react";
import Quagga from "quagga";

const BarcodeScanner = () => {
  const [barcode, setBarcode] = useState("");
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false); // To prevent duplicate scans during the delay

  useEffect(() => {
    if (scannerRef.current) {
      Quagga.init(
        {
          locate: true,
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current, // The DOM element where the camera feed will be rendered
            constraints: {
              height: 400,
              facingMode: "environment", // Use the back camera
            },
          },
          decoder: {
            readers: [
              "code_128_reader",
              "ean_reader",
              "ean_8_reader",
              "code_39_reader",
            ], // Different barcode formats
          },
          locator: {
            halfSample: true,
            patchSize: "medium", // x-small, small, medium, large, x-large
            debug: {
              showCanvas: false,
              showPatches: false,
              showFoundPatches: false,
              showSkeleton: false,
              showLabels: false,
              showPatchLabels: false,
              showRemainingPatchLabels: false,
              boxFromPatches: {
                showTransformed: false,
                showTransformedBox: false,
                showBB: false,
              },
            },
          },
        },
        function (err) {
          if (err) {
            console.error(err);
            return;
          }
          console.log("Initialization finished. Ready to start");
          Quagga.start();
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
          setBarcode(result.codeResult.code);
          console.log(result.codeResult.code);
          setTimeout(() => {
            isScanningRef.current = false; // Reset the flag to allow new scans
          }, 1000);
        }
      });
    }

    return () => {
      Quagga.stop(); // Cleanup the camera stream when the component is unmounted
    };
  }, []);

  return (
    <div>
      <h1>Barcode Scanner</h1>
      <div
        ref={scannerRef}
        className="bg-red-50 h-[200px] overflow-hidden max-w-sm mx-auto"
      ></div>
      {barcode && <p>Scanned Barcode: {barcode}</p>}
    </div>
  );
};

export default BarcodeScanner;
