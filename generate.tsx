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

const tempPngPath = path.join(process.cwd(), "temp.png");
const tempPngData = fs.existsSync(tempPngPath)
  ? fs.readFileSync(tempPngPath)
  : null;

function Thumbnail({ title, options = {} }) {
  const {
    bgType = "gradient",
    bgColor1 = "#E6F4FF",
    bgColor2 = "#CDE8FE",
    gradientDirection = "to bottom",
    textColor = "#184F81",
    verifiedColor = "#0079CE",
    waygroundColor = "#0079CE",
    borderColor = "#0079CE",
  } = options;

  const background =
    bgType === "solid"
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
  const coloredVerifiedSvg = fs
    .readFileSync(path.join(process.cwd(), "verified.svg"), "utf8")
    .replace(/fill="[^"]*"/g, `fill="${verifiedColor}"`);

  const coloredWaygroundSvg = fs
    .readFileSync(path.join(process.cwd(), "wayground.svg"), "utf8")
    .replace(/fill="[^"]*"/g, `fill="${waygroundColor}"`);

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
            src={`data:image/svg+xml;base64,${Buffer.from(
              coloredVerifiedSvg
            ).toString("base64")}`}
            width={96}
            height={96}
          />
          <div
            style={{ width: 4, height: 96, background: hexToRgba(borderColor) }}
          />
          <p
            style={{
              fontSize: 48,
              fontWeight: 800,
              lineHeight: 1.4,
              color: verifiedColor,
              paddingLeft: 10,
              letterSpacing: -0.5,
            }}
          >
            Assessment
          </p>
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
      {tempPngData && (
        <img
          src={`data:image/png;base64,${tempPngData.toString("base64")}`}
          width={400}
          height={400}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
          }}
        />
      )}
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
  const defaultTitle =
    "Adding and Subtracting Decimals: Perfect Quiz for 7th Grade";
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
    borderColor: url.searchParams.get("borderColor") || "#0079CE",
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

  if (url.pathname === "/sample_quiz_data.csv") {
    try {
      const csvContent = fs.readFileSync(
        path.join(process.cwd(), "sample_quiz_data.csv"),
        "utf8"
      );
      res.writeHead(200, {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=sample_quiz_data.csv",
      });
      return res.end(csvContent);
    } catch (err) {
      console.error(err);
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Sample CSV file not found");
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
        input[type="text"], select, input[type="file"] {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
          background: white;
        }
        input[type="text"]:focus, select:focus, input[type="file"]:focus {
          outline: none;
          border-color: #007bff;
        }
        input[type="file"] {
          padding: 8px 12px;
          cursor: pointer;
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
              value="${title.replace(/"/g, "&quot;")}" 
              placeholder="Enter your thumbnail title..."
            />
          </div>

          <div class="input-group">
            <label for="bgType">Background Type:</label>
            <select id="bgType">
              <option value="gradient" ${
                options.bgType === "gradient" ? "selected" : ""
              }>Gradient</option>
              <option value="solid" ${
                options.bgType === "solid" ? "selected" : ""
              }>Solid Color</option>
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
                <option value="to bottom" ${
                  options.gradientDirection === "to bottom" ? "selected" : ""
                }>Top → Bottom</option>
                <option value="to top" ${
                  options.gradientDirection === "to top" ? "selected" : ""
                }>Bottom → Top</option>
                <option value="to right" ${
                  options.gradientDirection === "to right" ? "selected" : ""
                }>Left → Right</option>
                <option value="to left" ${
                  options.gradientDirection === "to left" ? "selected" : ""
                }>Right → Left</option>
                <option value="45deg" ${
                  options.gradientDirection === "45deg" ? "selected" : ""
                }>Diagonal ↗</option>
                <option value="-45deg" ${
                  options.gradientDirection === "-45deg" ? "selected" : ""
                }>Diagonal ↘</option>
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

          <div class="input-group">
            <label for="csvInput">📊 Batch Generate from CSV:</label>
            <input 
              type="file" 
              id="csvInput" 
              accept=".csv"
              style="margin-bottom: 10px;"
            />
            <small style="color: #666; display: block; margin-bottom: 10px;">
              CSV format: quiz_id, title, primary_color, secondary_color, text_color, icon_color, border_color
            </small>
            <a href="/sample_quiz_data.csv" download style="color: #007bff; text-decoration: none; font-size: 14px;">
              📥 Download Sample CSV Template
            </a>
          </div>

          <div class="button-group">
            <button class="btn-primary" onclick="updateThumbnail()">
              🔄 Update Preview
            </button>
            <button class="btn-secondary" onclick="downloadImage()">
              📥 Download PNG
            </button>
            <button class="btn-secondary" id="batchButton" style="background: #17a2b8;">
              📊 Generate Batch
            </button>
          </div>
        </div>

        <div class="preview">
          <img 
            id="thumbnailPreview" 
            src="/image.png?title=${encodeURIComponent(title)}&bgType=${
    options.bgType
  }&bgColor1=${encodeURIComponent(
    options.bgColor1
  )}&bgColor2=${encodeURIComponent(
    options.bgColor2
  )}&gradientDirection=${encodeURIComponent(
    options.gradientDirection
  )}&textColor=${encodeURIComponent(
    options.textColor
  )}&verifiedColor=${encodeURIComponent(
    options.verifiedColor
  )}&waygroundColor=${encodeURIComponent(
    options.waygroundColor
  )}&borderColor=${encodeURIComponent(options.borderColor)}&t=${Date.now()}" 
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

        function downloadImageWithData(data, filename) {
          const link = document.createElement('a');
          link.href = buildImageUrl(data);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        function parseCsv(text) {
          const lines = text.trim().split('\\n').filter(line => line.trim());
          if (lines.length === 0) return [];
          
          const headers = lines[0].split(',').map(h => h.trim());
          const rows = [];
          
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Simple CSV parsing - split by comma but handle quoted values
            const values = [];
            let current = '';
            let inQuotes = false;
            
            for (let j = 0; j < line.length; j++) {
              const char = line[j];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim()); // Add the last value
            
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            rows.push(row);
          }
          return rows;
        }

        async function processCsvBatch() {
          const fileInput = document.getElementById('csvInput');
          const file = fileInput.files[0];
          
          if (!file) {
            alert('Please select a CSV file first');
            return;
          }

          try {
            const text = await file.text();
            console.log('CSV text:', text); // Debug log
            const rows = parseCsv(text);
            console.log('Parsed rows:', rows); // Debug log
            
            if (rows.length === 0) {
              alert('CSV file appears to be empty or invalid');
              return;
            }

            // Validate CSV structure
            const requiredFields = ['quiz_id', 'title', 'primary_color', 'secondary_color', 'text_color', 'icon_color', 'border_color'];
            const firstRow = rows[0];
            const missingFields = requiredFields.filter(field => !(field in firstRow));
            
            if (missingFields.length > 0) {
              alert(\`CSV is missing required columns: \${missingFields.join(', ')}\`);
              return;
            }

            // Update button to show progress
            const button = document.getElementById('batchButton');
            const originalText = button.textContent;
            button.disabled = true;
          
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            button.textContent = \`Processing \${i + 1}/\${rows.length}...\`;
            
            const data = {
              title: row.title,
              bgType: 'gradient', // Default to gradient, could be made configurable
              bgColor1: row.primary_color,
              bgColor2: row.secondary_color,
              gradientDirection: 'to bottom', // Default direction
              textColor: row.text_color,
              verifiedColor: row.icon_color,
              waygroundColor: row.icon_color, // Same color for both icons
              borderColor: row.border_color
            };
            
            const filename = \`\${row.quiz_id}.png\`;
            downloadImageWithData(data, filename);
            
            // Small delay between downloads to prevent overwhelming the browser
            if (i < rows.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          
          button.textContent = originalText;
          button.disabled = false;
          alert(\`Successfully generated \${rows.length} thumbnails!\`);
          
          } catch (error) {
            console.error('Error processing CSV:', error);
            alert('Error processing CSV file: ' + error.message);
            
            // Re-enable button if there was an error
            const button = document.getElementById('batchButton');
            if (button) {
              button.disabled = false;
              button.textContent = '📊 Generate Batch';
            }
          }
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

          // CSV batch processing
          document.getElementById('batchButton').addEventListener('click', processCsvBatch);

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
