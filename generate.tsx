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

function Thumbnail({ title, options = {} }) {
  const {
    bgType = 'gradient',
    bgColor1 = '#E6F4FF',
    bgColor2 = '#CDE8FE',
    gradientDirection = 'to bottom',
    textColor = '#184F81',
    verifiedColor = '#0079CE',
    waygroundColor = '#0079CE',
    borderColor = '#0079CE'
  } = options;

  const background = bgType === 'solid' 
    ? bgColor1 
    : `linear-gradient(${gradientDirection}, ${bgColor1}, ${bgColor2})`;

  // Convert hex border color to rgba with 40% opacity
  const hexToRgba = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.4)`;
  };

  // Create colored SVGs by replacing fill colors
  const coloredVerifiedSvg = fs.readFileSync(
    path.join(process.cwd(), "verified.svg"),
    "utf8"
  ).replace(/fill="[^"]*"/g, `fill="${verifiedColor}"`);

  const coloredWaygroundSvg = fs.readFileSync(
    path.join(process.cwd(), "wayground.svg"),
    "utf8"
  ).replace(/fill="[^"]*"/g, `fill="${waygroundColor}"`);

  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        background,
        border: `4px solid ${hexToRgba(borderColor)}`,
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
            src={`data:image/svg+xml;base64,${Buffer.from(coloredVerifiedSvg).toString('base64')}`}
            width={96}
            height={96}
          />
          <div
            style={{ width: 4, height: 96, background: hexToRgba(borderColor) }}
          />
          <img
            src={`data:image/svg+xml;base64,${Buffer.from(coloredWaygroundSvg).toString('base64')}`}
            width={96}
            height={96}
          />
        </div>
        <p
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.4,
            color: textColor,
            letterSpacing: -0.5,
          }}
        >
          {title}
        </p>
      </div>
    </div>
  );
}

async function renderPNG(title, options = {}) {
  const svg = await satori(<Thumbnail title={title} options={options} />, {
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
  const defaultTitle = "Adding and Subtracting Decimals: Perfect Quiz for 7th Grade";
  const title = url.searchParams.get("title") || defaultTitle;
  
  // Parse customization options from URL parameters
  const options = {
    bgType: url.searchParams.get("bgType") || "gradient",
    bgColor1: url.searchParams.get("bgColor1") || "#E6F4FF",
    bgColor2: url.searchParams.get("bgColor2") || "#CDE8FE",
    gradientDirection: url.searchParams.get("gradientDirection") || "to bottom",
    textColor: url.searchParams.get("textColor") || "#184F81",
    verifiedColor: url.searchParams.get("verifiedColor") || "#0079CE",
    waygroundColor: url.searchParams.get("waygroundColor") || "#0079CE",
    borderColor: url.searchParams.get("borderColor") || "#0079CE"
  };

  if (url.pathname === "/image.png") {
    try {
      const png = await renderPNG(title, options);
      res.writeHead(200, { "Content-Type": "image/png" });
      return res.end(png);
    } catch (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      return res.end(String(err));
    }
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Thumbnail Generator</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
          color: #333;
          margin-bottom: 30px;
          text-align: center;
        }
        .controls {
          margin-bottom: 30px;
          background: #f8f9fa;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }
        .input-group {
          margin-bottom: 20px;
        }
        .color-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .gradient-controls {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 20px;
          align-items: end;
        }
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #555;
        }
        input[type="text"], select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
          background: white;
        }
        input[type="text"]:focus, select:focus {
          outline: none;
          border-color: #007bff;
        }
        .hex-input {
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
          text-transform: uppercase;
        }
        .button-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .color-row, .gradient-controls {
            grid-template-columns: 1fr;
          }
          .button-group {
            flex-direction: column;
          }
        }
        button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary {
          background: #007bff;
          color: white;
        }
        .btn-primary:hover {
          background: #0056b3;
        }
        .btn-secondary {
          background: #28a745;
          color: white;
        }
        .btn-secondary:hover {
          background: #1e7e34;
        }
        .preview {
          text-align: center;
          border: 2px dashed #ddd;
          border-radius: 12px;
          padding: 20px;
          background: #fafafa;
        }
        .thumbnail-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .image-info {
          margin-top: 15px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎨 Thumbnail Generator</h1>
        
        <div class="controls">
          <div class="input-group">
            <label for="titleInput">Thumbnail Title:</label>
            <input 
              type="text" 
              id="titleInput" 
              value="${title.replace(/"/g, '&quot;')}" 
              placeholder="Enter your thumbnail title..."
            />
          </div>

          <div class="input-group">
            <label for="bgType">Background Type:</label>
            <select id="bgType">
              <option value="gradient" ${options.bgType === 'gradient' ? 'selected' : ''}>Gradient</option>
              <option value="solid" ${options.bgType === 'solid' ? 'selected' : ''}>Solid Color</option>
            </select>
          </div>

          <div class="color-row">
            <div class="input-group">
              <label for="bgColor1">Primary Color:</label>
              <input 
                type="text" 
                id="bgColor1" 
                value="${options.bgColor1}" 
                placeholder="#E6F4FF"
                class="hex-input"
                maxlength="7"
              />
            </div>
            <div class="input-group" id="bgColor2Group">
              <label for="bgColor2">Secondary Color:</label>
              <input 
                type="text" 
                id="bgColor2" 
                value="${options.bgColor2}" 
                placeholder="#CDE8FE"
                class="hex-input"
                maxlength="7"
              />
            </div>
          </div>

          <div class="gradient-controls">
            <div class="input-group" id="gradientDirectionGroup">
              <label for="gradientDirection">Direction:</label>
              <select id="gradientDirection">
                <option value="to bottom" ${options.gradientDirection === 'to bottom' ? 'selected' : ''}>Top → Bottom</option>
                <option value="to top" ${options.gradientDirection === 'to top' ? 'selected' : ''}>Bottom → Top</option>
                <option value="to right" ${options.gradientDirection === 'to right' ? 'selected' : ''}>Left → Right</option>
                <option value="to left" ${options.gradientDirection === 'to left' ? 'selected' : ''}>Right → Left</option>
                <option value="45deg" ${options.gradientDirection === '45deg' ? 'selected' : ''}>Diagonal ↗</option>
                <option value="-45deg" ${options.gradientDirection === '-45deg' ? 'selected' : ''}>Diagonal ↘</option>
              </select>
            </div>
            <div class="input-group">
              <label for="textColor">Text Color:</label>
              <input 
                type="text" 
                id="textColor" 
                value="${options.textColor}" 
                placeholder="#184F81"
                class="hex-input"
                maxlength="7"
              />
            </div>
          </div>

          <div class="color-row">
            <div class="input-group">
              <label for="verifiedColor">Verified Icon:</label>
              <input 
                type="text" 
                id="verifiedColor" 
                value="${options.verifiedColor}" 
                placeholder="#0079CE"
                class="hex-input"
                maxlength="7"
              />
            </div>
            <div class="input-group">
              <label for="waygroundColor">Wayground Icon:</label>
              <input 
                type="text" 
                id="waygroundColor" 
                value="${options.waygroundColor}" 
                placeholder="#0079CE"
                class="hex-input"
                maxlength="7"
              />
            </div>
          </div>

          <div class="color-row">
            <div class="input-group">
              <label for="borderColor">Border Color:</label>
              <input 
                type="text" 
                id="borderColor" 
                value="${options.borderColor}" 
                placeholder="#0079CE"
                class="hex-input"
                maxlength="7"
              />
            </div>
            <div class="input-group">
              <label style="color: #666; font-size: 14px;">Border opacity is fixed at 40%</label>
            </div>
          </div>

          <div class="button-group">
            <button class="btn-primary" onclick="updateThumbnail()">
              🔄 Update Preview
            </button>
            <button class="btn-secondary" onclick="downloadImage()">
              📥 Download PNG
            </button>
          </div>
        </div>

        <div class="preview">
          <img 
            id="thumbnailPreview" 
            src="/image.png?title=${encodeURIComponent(title)}&bgType=${options.bgType}&bgColor1=${encodeURIComponent(options.bgColor1)}&bgColor2=${encodeURIComponent(options.bgColor2)}&gradientDirection=${encodeURIComponent(options.gradientDirection)}&textColor=${encodeURIComponent(options.textColor)}&verifiedColor=${encodeURIComponent(options.verifiedColor)}&waygroundColor=${encodeURIComponent(options.waygroundColor)}&borderColor=${encodeURIComponent(options.borderColor)}&t=${Date.now()}" 
            alt="Thumbnail Preview" 
            class="thumbnail-image"
          />
          <div class="image-info">
            Size: 1200×630px | Format: PNG | Ready for social media
          </div>
        </div>
      </div>

      <script>
        function getFormData() {
          return {
            title: document.getElementById('titleInput').value,
            bgType: document.getElementById('bgType').value,
            bgColor1: document.getElementById('bgColor1').value,
            bgColor2: document.getElementById('bgColor2').value,
            gradientDirection: document.getElementById('gradientDirection').value,
            textColor: document.getElementById('textColor').value,
            verifiedColor: document.getElementById('verifiedColor').value,
            waygroundColor: document.getElementById('waygroundColor').value,
            borderColor: document.getElementById('borderColor').value
          };
        }

        function buildImageUrl(data) {
          const params = new URLSearchParams();
          Object.entries(data).forEach(([key, value]) => {
            params.append(key, value);
          });
          params.append('t', Date.now());
          return \`/image.png?\${params.toString()}\`;
        }

        function updateThumbnail() {
          const data = getFormData();
          const img = document.getElementById('thumbnailPreview');
          img.src = buildImageUrl(data);
        }

        function downloadImage() {
          const data = getFormData();
          const link = document.createElement('a');
          link.href = buildImageUrl(data);
          link.download = \`thumbnail-\${data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png\`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        function toggleBackgroundControls() {
          const bgType = document.getElementById('bgType').value;
          const bgColor2Group = document.getElementById('bgColor2Group');
          const gradientDirectionGroup = document.getElementById('gradientDirectionGroup');
          
          if (bgType === 'solid') {
            bgColor2Group.style.display = 'none';
            gradientDirectionGroup.parentElement.style.display = 'none';
          } else {
            bgColor2Group.style.display = 'block';
            gradientDirectionGroup.parentElement.style.display = 'grid';
          }
        }

        function validateHexColor(input) {
          let value = input.value.trim();
          if (!value.startsWith('#')) {
            value = '#' + value;
          }
          value = value.slice(0, 7);
          input.value = value.toUpperCase();
        }

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
          toggleBackgroundControls();
          
          // Add event listeners
          document.getElementById('bgType').addEventListener('change', function() {
            toggleBackgroundControls();
            updateThumbnail();
          });

          // Hex color validation and auto-update
          const hexInputs = document.querySelectorAll('.hex-input');
          hexInputs.forEach(input => {
            input.addEventListener('blur', function() {
              validateHexColor(this);
              updateThumbnail();
            });
            input.addEventListener('keypress', function(e) {
              if (e.key === 'Enter') {
                validateHexColor(this);
                updateThumbnail();
              }
            });
          });

          // Other controls
          document.getElementById('gradientDirection').addEventListener('change', updateThumbnail);

          // Title input with debounce
          let debounceTimer;
          document.getElementById('titleInput').addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(updateThumbnail, 1000);
          });

          document.getElementById('titleInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
              updateThumbnail();
            }
          });
        });
      </script>
    </body>
    </html>
  `);
}).listen(3000, () => {
  console.log("Thumbnail preview running at http://localhost:3000");
});
