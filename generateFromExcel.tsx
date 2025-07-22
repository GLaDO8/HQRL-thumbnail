// @ts-nocheck
import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import React from "react";
import Thumbnail from "./template.jsx";

const FONT_PATH = path.join(process.cwd(), "DMSans_18pt-Bold.ttf");
const WIDTH = 1200;
const HEIGHT = 630;

async function loadFont() {
  if (!fs.existsSync(FONT_PATH)) {
    throw new Error(`Font file not found: ${FONT_PATH}`);
  }
  return fs.readFileSync(FONT_PATH);
}

async function renderThumbnail(
  props: { title: string; heroUrl?: string; primaryColor?: string },
  fontData: ArrayBuffer
) {
  const svg = await satori(<Thumbnail {...props} />, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: "DM Sans",
        data: fontData,
        weight: 400,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: WIDTH,
    },
  });
  const pngData = resvg.render().asPng();
  return pngData;
}

async function main() {
  const workbook = xlsx.readFile("./data.xlsx");
  const sheetName = workbook.SheetNames[0];
  const rows: any[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  if (!fs.existsSync("./output")) {
    fs.mkdirSync("./output");
  }

  const fontData = await loadFont();

  for (const [index, row] of rows.entries()) {
    const { Title, Hero, Color } = row; // Expected column headers
    if (!Title) continue;
    const buffer = await renderThumbnail(
      {
        title: Title,
        heroUrl: Hero,
        primaryColor: Color,
      },
      fontData
    );

    const fileName = `${index + 1}-${Title.replace(
      /[^a-z0-9]/gi,
      "_"
    ).toLowerCase()}.png`;
    fs.writeFileSync(path.join("./output", fileName), buffer);
    console.log(`Generated ${fileName}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
