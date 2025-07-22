// @ts-nocheck
import fs from "fs";
import path from "path";
import { createServer } from "http";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import React from "react";

const WIDTH = 1200;
const HEIGHT = 630;

// Load fonts and SVGs
const fontData = fs.readFileSync(
  path.join(process.cwd(), "DMSans_18pt-Bold.ttf")
);
const verifiedIcon = fs.readFileSync(
  path.join(process.cwd(), "verified.svg"),
  "base64"
);
const waygroundIcon = fs.readFileSync(
  path.join(process.cwd(), "wayground.svg"),
  "base64"
);

function Thumbnail({ title }) {
  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        background: "linear-gradient(to bottom, #E6F4FF, #CDE8FE)",
        border: "4px solid rgba(0,121,206,0.4)",
        borderRadius: 40,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        padding: "45px 65px",
        boxSizing: "border-box",
        fontFamily: "DM Sans",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 200,
          height: 200,
          background:
            "linear-gradient(to left, rgb(221, 221, 221) 0%, rgba(221, 221, 221, 0) 100%)",
          transform: "translateY(-100px) rotate(45deg)",
          transformOrigin: "bottom right",
          borderBottomLeftRadius: 40,
          boxShadow: "-3px 3px 5px -2px rgba(0,0,0,0.15)",
        }}
      />
      <div
        style={{
          zIndex: 1,
          maxWidth: "80%",
          display: "flex",
          flexDirection: "column",
          gap: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 36,
            marginTop: 0,
          }}
        >
          <img
            src={`data:image/svg+xml;base64,${verifiedIcon}`}
            width={96}
            height={96}
          />
          <div
            style={{ width: 4, height: 96, background: "rgba(0,121,206,0.4)" }}
          />
          <img
            src={`data:image/svg+xml;base64,${waygroundIcon}`}
            width={96}
            height={96}
          />
        </div>
        <p
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.4,
            color: "#184F81",
            letterSpacing: -0.5,
          }}
        >
          {title}
        </p>
      </div>
    </div>
  );
}

async function renderPNG(title) {
  const svg = await satori(<Thumbnail title={title} />, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [{ name: "DM Sans", data: fontData, weight: 800, style: "bold" }],
  });

  return new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  })
    .render()
    .asPng();
}

createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const title =
    "Topic 2 Review: Analyze and Use Proportional Relationships-7th";

  if (url.pathname === "/image.png") {
    try {
      const png = await renderPNG(title);
      res.writeHead(200, { "Content-Type": "image/png" });
      return res.end(png);
    } catch (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      return res.end(String(err));
    }
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(
    `<!DOCTYPE html><html><head><title>Thumbnail Preview</title></head><body><img src="/image.png?title=${encodeURIComponent(
      title
    )}"></body></html>`
  );
}).listen(3000, () => {
  console.log("Thumbnail preview running at http://localhost:3000");
});
