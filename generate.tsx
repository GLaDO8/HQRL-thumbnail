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

// Removed optional bottom-right illustration overlay

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
      {/* Illustration overlay removed */}
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
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js" integrity="sha512-q5Gk7yO5kJcQ9w8wH3v8+XzB7M9vHbqZqGv8iWmWc3m3z8f+2wVfQW4t6fM3JmQj1Q5g9jv8u4CqQW3m0o4w0A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
      <style>
        .hex-input { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; text-transform: uppercase; }
      </style>
    </head>
    <body>
      <div class="min-h-screen bg-slate-50">
        <div class="max-w-6xl mx-auto px-6 py-8">
          <div class="mb-6 flex items-center justify-between">
            <h1 class="text-2xl font-semibold tracking-tight">Thumbnail Generator</h1>
            <div class="text-sm text-slate-500">Size: 1200×630</div>
          </div>

          <div class="grid lg:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <label class="block text-sm font-medium text-slate-700 mb-2">Thumbnail Title</label>
                <input id="titleInput" type="text" value="${title.replace(/"/g, "&quot;")}" placeholder="Enter your thumbnail title..." class="w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
              </div>

              <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div class="mb-3 text-sm font-medium text-slate-700">Quick Presets</div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button class="h-10 rounded-md text-white font-medium" style="background:#F0AF0A" onclick="applyPreset('yellow')">Yellow</button>
                  <button class="h-10 rounded-md text-white font-medium" style="background:#D16D10" onclick="applyPreset('orange')">Orange</button>
                  <button class="h-10 rounded-md text-white font-medium" style="background:#005DB1" onclick="applyPreset('blue')">Blue</button>
                  <button class="h-10 rounded-md text-white font-medium" style="background:#E0067B" onclick="applyPreset('magenta')">Magenta</button>
                </div>
              </div>

              <details class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm" id="advancedPanel">
                <summary class="cursor-pointer select-none list-none">
                  <div class="flex items-center justify-between">
                    <div class="text-sm font-medium text-slate-700">Advanced settings</div>
                    <span class="text-xs text-slate-500">Customize colors</span>
                  </div>
                </summary>
                <div class="mt-4 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1" for="bgType">Background Type</label>
                    <select id="bgType" class="w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
                      <option value="gradient" ${options.bgType === "gradient" ? "selected" : ""}>Gradient</option>
                      <option value="solid" ${options.bgType === "solid" ? "selected" : ""}>Solid Color</option>
                    </select>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1" for="bgColor1">Primary Color</label>
                      <input id="bgColor1" type="text" value="${options.bgColor1}" placeholder="#FFFFFF" maxlength="7" class="hex-input w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                    </div>
                    <div id="bgColor2Group">
                      <label class="block text-sm font-medium text-slate-700 mb-1" for="bgColor2">Secondary Color</label>
                      <input id="bgColor2" type="text" value="${options.bgColor2}" placeholder="#E6F4FF" maxlength="7" class="hex-input w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div id="gradientDirectionGroup">
                      <label class="block text-sm font-medium text-slate-700 mb-1" for="gradientDirection">Gradient Direction</label>
                      <select id="gradientDirection" class="w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
                        <option value="to bottom" ${options.gradientDirection === "to bottom" ? "selected" : ""}>Top → Bottom</option>
                        <option value="to top" ${options.gradientDirection === "to top" ? "selected" : ""}>Bottom → Top</option>
                        <option value="to right" ${options.gradientDirection === "to right" ? "selected" : ""}>Left → Right</option>
                        <option value="to left" ${options.gradientDirection === "to left" ? "selected" : ""}>Right → Left</option>
                        <option value="45deg" ${options.gradientDirection === "45deg" ? "selected" : ""}>Diagonal ↗</option>
                        <option value="-45deg" ${options.gradientDirection === "-45deg" ? "selected" : ""}>Diagonal ↘</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1" for="textColor">Title Text Color</label>
                      <input id="textColor" type="text" value="${options.textColor}" placeholder="#184F81" maxlength="7" class="hex-input w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1" for="verifiedColor">Verified Icon</label>
                      <input id="verifiedColor" type="text" value="${options.verifiedColor}" placeholder="#0079CE" maxlength="7" class="hex-input w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1" for="waygroundColor">Wayground Icon</label>
                      <input id="waygroundColor" type="text" value="${options.waygroundColor}" placeholder="#0079CE" maxlength="7" class="hex-input w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1" for="borderColor">Border Color (40% opacity)</label>
                      <input id="borderColor" type="text" value="${options.borderColor}" placeholder="#0079CE" maxlength="7" class="hex-input w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                    </div>
                    <div class="text-xs text-slate-500">Border opacity is fixed</div>
                  </div>
                </div>
              </details>

              <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                <label class="block text-sm font-medium text-slate-700">Batch generate from CSV</label>
                <input type="file" id="csvInput" accept=".csv" class="block w-full text-sm text-slate-700 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-100 hover:file:bg-slate-200" />
                <div class="text-xs text-slate-500">CSV columns: <code>quiz_id,title,preset</code></div>
                <a href="/sample_quiz_data.csv" download class="text-sm text-sky-700 hover:underline">Download sample CSV</a>
                <div class="flex gap-2 pt-2">
                  <button class="h-10 px-4 rounded-md bg-slate-900 text-white text-sm font-medium" onclick="updateThumbnail()">Update Preview</button>
                  <button class="h-10 px-4 rounded-md bg-slate-700 text-white text-sm font-medium" onclick="downloadImage()">Download PNG</button>
                  <button id="batchButton" class="h-10 px-4 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium">Generate Zip</button>
                </div>
                <div id="batchStatus" class="text-xs text-slate-500"></div>
              </div>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div class="preview">
                <img id="thumbnailPreview" src="/image.png?title=${encodeURIComponent(title)}&bgType=${options.bgType}&bgColor1=${encodeURIComponent(options.bgColor1)}&bgColor2=${encodeURIComponent(options.bgColor2)}&gradientDirection=${encodeURIComponent(options.gradientDirection)}&textColor=${encodeURIComponent(options.textColor)}&verifiedColor=${encodeURIComponent(options.verifiedColor)}&waygroundColor=${encodeURIComponent(options.waygroundColor)}&borderColor=${encodeURIComponent(options.borderColor)}&t=${Date.now()}" alt="Thumbnail Preview" class="w-full h-auto rounded-md border" />
                <div class="image-info text-sm text-slate-500 mt-2">Preview updates as you change settings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script>
        const PRESETS = {
          yellow: {
            bgType: 'gradient',
            bgColor1: '#FFFFFF',
            bgColor2: '#FFF9E5',
            gradientDirection: 'to bottom',
            textColor: '#B07101',
            verifiedColor: '#F0AF0A',
            waygroundColor: '#F0AF0A',
            borderColor: '#FECA43',
          },
          orange: {
            bgType: 'gradient',
            bgColor1: '#FFFFFF',
            bgColor2: '#FEF4EC',
            gradientDirection: 'to bottom',
            textColor: '#A65421',
            verifiedColor: '#D16D10',
            waygroundColor: '#D16D10',
            borderColor: '#E57C1A',
          },
          blue: {
            bgType: 'gradient',
            bgColor1: '#FFFFFF',
            bgColor2: '#E6F4FF',
            gradientDirection: 'to bottom',
            textColor: '#184F81',
            verifiedColor: '#005DB1',
            waygroundColor: '#005DB1',
            borderColor: '#0079CE',
          },
          magenta: {
            bgType: 'gradient',
            bgColor1: '#FFFFFF',
            bgColor2: '#FFEBEB',
            gradientDirection: 'to bottom',
            textColor: '#B60261',
            verifiedColor: '#E0067B',
            waygroundColor: '#E0067B',
            borderColor: '#FF319F',
          },
        };

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

        function setFormData(data) {
          if (!data) return;
          const set = (id, value) => { if (value !== undefined) document.getElementById(id).value = value; };
          set('bgType', data.bgType);
          set('bgColor1', data.bgColor1);
          set('bgColor2', data.bgColor2);
          set('gradientDirection', data.gradientDirection);
          set('textColor', data.textColor);
          set('verifiedColor', data.verifiedColor);
          set('waygroundColor', data.waygroundColor);
          set('borderColor', data.borderColor);
        }

        function applyPreset(name) {
          const preset = PRESETS[name];
          if (!preset) return;
          setFormData(preset);
          toggleBackgroundControls();
          updateThumbnail();
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

            // Validate CSV structure (new simplified format)
            const requiredFields = ['quiz_id', 'title', 'preset'];
            const firstRow = rows[0];
            const missingFields = requiredFields.filter(field => !(field in firstRow));
            
            if (missingFields.length > 0) {
              alert(\`CSV is missing required columns: \${missingFields.join(', ')}\`);
              return;
            }

            const button = document.getElementById('batchButton');
            const status = document.getElementById('batchStatus');
            const originalText = button.textContent;
            button.disabled = true;
            status.textContent = 'Preparing zip...';

            const zip = new JSZip();

            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              button.textContent = \`Processing \${i + 1}/\${rows.length}...\`;
              status.textContent = button.textContent;

              const presetKey = String(row.preset || '').trim().toLowerCase();
              const preset = PRESETS[presetKey];
              if (!preset) {
                console.warn('Unknown preset for row', row);
                continue;
              }

              const data = { title: row.title, ...preset };
              const url = buildImageUrl(data);
              const resp = await fetch(url);
              const blob = await resp.blob();
              const filename = \`${'${'}row.quiz_id${'}'}.png\`;
              zip.file(filename, blob);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const zipUrl = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = zipUrl;
            a.download = 'thumbnails.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(zipUrl);

            button.textContent = originalText;
            button.disabled = false;
            status.textContent = \`Generated \${rows.length} images and downloaded as ZIP.\`;
          
          } catch (error) {
            console.error('Error processing CSV:', error);
            alert('Error processing CSV file: ' + error.message);
            
            // Re-enable button if there was an error
            const button = document.getElementById('batchButton');
            if (button) {
              button.disabled = false;
              button.textContent = 'Generate Zip';
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
