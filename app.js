const PALETTE = [
  { code: "H1", name: "云朵白", hex: "#f7f5eb" },
  { code: "H2", name: "奶油色", hex: "#f0dfbd" },
  { code: "H3", name: "沙棕色", hex: "#c99763" },
  { code: "H4", name: "柠檬黄", hex: "#f3c64f" },
  { code: "H5", name: "暖橙色", hex: "#e8894f" },
  { code: "H6", name: "珊瑚红", hex: "#d95d55" },
  { code: "H7", name: "砖红色", hex: "#a94342" },
  { code: "H8", name: "樱花粉", hex: "#e7a4ac" },
  { code: "H9", name: "葡萄紫", hex: "#8d6592" },
  { code: "H10", name: "宝石蓝", hex: "#365e9e" },
  { code: "H11", name: "天空蓝", hex: "#72afd0" },
  { code: "H12", name: "湖水青", hex: "#4b9e9a" },
  { code: "H13", name: "豆绿色", hex: "#75ad75" },
  { code: "H14", name: "深绿", hex: "#3f7353" },
  { code: "H15", name: "巧克力棕", hex: "#714d3d" },
  { code: "H16", name: "暖灰色", hex: "#a7aaa2" },
  { code: "H17", name: "石墨灰", hex: "#5b625e" },
  { code: "H18", name: "墨黑色", hex: "#272c2b" },
  { code: "H19", name: "雾蓝灰", hex: "#8494a2" },
  { code: "H20", name: "西柚粉", hex: "#dc7b78" },
  { code: "H21", name: "薄荷绿", hex: "#abd3b4" },
  { code: "H22", name: "午夜蓝", hex: "#293c65" },
  { code: "H23", name: "雾霾紫", hex: "#b0a3c7" },
  { code: "H24", name: "燕麦色", hex: "#ddd0b7" }
];

const state = {
  sourceImage: null,
  sourceObjectUrl: null,
  sourceName: "示例图",
  isSample: true,
  size: 52,
  paletteCount: 24,
  palette: [],
  grid: [],
  gridWidth: 52,
  gridHeight: 52,
  counts: new Map(),
  zoomCenterX: 0,
  zoomCenterY: 0,
  zoomRange: 13
};

const els = {
  imageInput: document.querySelector("#imageInput"),
  dropzone: document.querySelector("#dropzone"),
  uploadTitle: document.querySelector("#uploadTitle"),
  uploadHint: document.querySelector("#uploadHint"),
  fileName: document.querySelector("#fileName"),
  useSampleButton: document.querySelector("#useSampleButton"),
  sourcePreviewWrap: document.querySelector("#sourcePreviewWrap"),
  sourcePreview: document.querySelector("#sourcePreview"),
  sourceDimensions: document.querySelector("#sourceDimensions"),
  sizeSelect: document.querySelector("#sizeSelect"),
  paletteSelect: document.querySelector("#paletteSelect"),
  generateButton: document.querySelector("#generateButton"),
  canvasFrame: document.querySelector("#canvasFrame"),
  resultName: document.querySelector("#resultName"),
  resultMeta: document.querySelector("#resultMeta"),
  gridCanvas: document.querySelector("#gridCanvas"),
  totalBeads: document.querySelector("#totalBeads"),
  usedColors: document.querySelector("#usedColors"),
  ratioText: document.querySelector("#ratioText"),
  legendTotal: document.querySelector("#legendTotal"),
  legendList: document.querySelector("#legendList"),
  downloadPngButton: document.querySelector("#downloadPngButton"),
  downloadCsvButton: document.querySelector("#downloadCsvButton"),
  printButton: document.querySelector("#printButton"),
  downloadFullImageCanvasButton: document.querySelector("#downloadFullImageCanvasButton"),
  saveSheet: document.querySelector("#saveSheet"),
  saveBackdrop: document.querySelector("#saveBackdrop"),
  closeSaveButton: document.querySelector("#closeSaveButton"),
  closeSaveButtonSecondary: document.querySelector("#closeSaveButtonSecondary"),
  shareImageButton: document.querySelector("#shareImageButton"),
  viewImageLink: document.querySelector("#viewImageLink"),
  savePreviewImage: document.querySelector("#savePreviewImage"),
  downloadFullImageButton: document.querySelector("#downloadFullImageButton"),
  saveStatus: document.querySelector("#saveStatus"),
  zoomSheet: document.querySelector("#zoomSheet"),
  zoomBackdrop: document.querySelector("#zoomBackdrop"),
  closeZoomButton: document.querySelector("#closeZoomButton"),
  closeZoomButtonSecondary: document.querySelector("#closeZoomButtonSecondary"),
  zoomRangeSelect: document.querySelector("#zoomRangeSelect"),
  zoomInfo: document.querySelector("#zoomInfo"),
  zoomCanvas: document.querySelector("#zoomCanvas"),
  downloadZoomButton: document.querySelector("#downloadZoomButton"),
  printSheet: document.querySelector("#printSheet")
};

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

PALETTE.forEach((color) => { color.rgb = hexToRgb(color.hex); });

function hslToHex(hue, saturation, lightness) {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const segment = hue / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const match = l - chroma / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (segment < 1) [r, g, b] = [chroma, x, 0];
  else if (segment < 2) [r, g, b] = [x, chroma, 0];
  else if (segment < 3) [r, g, b] = [0, chroma, x];
  else if (segment < 4) [r, g, b] = [0, x, chroma];
  else if (segment < 5) [r, g, b] = [x, 0, chroma];
  else [r, g, b] = [chroma, 0, x];
  return `#${[r, g, b].map((value) => Math.round((value + match) * 255).toString(16).padStart(2, "0")).join("")}`;
}

function buildFullPalette() {
  const fullPalette = PALETTE.slice();
  const additionalColors = 221 - fullPalette.length;
  for (let index = 0; index < additionalColors; index += 1) {
    const hue = (index * 137.508) % 360;
    const saturation = 42 + ((index * 17) % 37);
    const lightness = 30 + ((index * 29) % 43);
    const hex = hslToHex(hue, saturation, lightness);
    const code = `H${String(fullPalette.length + 1).padStart(3, "0")}`;
    fullPalette.push({ code, name: `扩展色 ${fullPalette.length + 1}`, hex, rgb: hexToRgb(hex) });
  }
  return fullPalette;
}

const FULL_PALETTE = buildFullPalette();

function getPalette(count) {
  if (count >= PALETTE.length) return FULL_PALETTE.slice(0, count);
  const selected = [];
  for (let i = 0; i < count; i += 1) {
    const index = Math.round(i * (PALETTE.length - 1) / (count - 1));
    selected.push(PALETTE[index]);
  }
  return selected;
}

function nearestColorIndex(rgb, palette = state.palette) {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  palette.forEach((color, index) => {
    const dr = rgb.r - color.rgb.r;
    const dg = rgb.g - color.rgb.g;
    const db = rgb.b - color.rgb.b;
    const distance = 2.4 * dr * dr + 4.2 * dg * dg + 2.8 * db * db;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function findColorIndex(code, palette = state.palette) {
  const target = PALETTE.find((color) => color.code === code);
  if (!target) return 0;
  return nearestColorIndex(target.rgb, palette);
}

function createEmptyGrid(width, height, fillIndex = 0) {
  return Array.from({ length: height }, () => Array(width).fill(fillIndex));
}

function createSampleGrid(size) {
  state.gridWidth = size;
  state.gridHeight = size;
  const bg = findColorIndex("H1");
  const dark = findColorIndex("H18");
  const gray = findColorIndex("H17");
  const orange = findColorIndex("H5");
  const coral = findColorIndex("H6");
  const yellow = findColorIndex("H4");
  const green = findColorIndex("H14");
  const mint = findColorIndex("H21");
  const blue = findColorIndex("H10");
  const grid = createEmptyGrid(size, size, bg);
  const center = size / 2;

  const paint = (x, y, color) => {
    if (x >= 0 && x < size && y >= 0 && y < size) grid[y][x] = color;
  };

  // A small pixel-art cat with a plant and a sun, so the initial state is meaningful.
  for (let y = 5; y < 15; y += 1) {
    for (let x = size - 14; x < size - 4; x += 1) {
      if ((x - (size - 9)) ** 2 + (y - 10) ** 2 < 33) paint(x, y, yellow);
    }
  }

  const catLeft = Math.round(center - 12);
  const catRight = Math.round(center + 12);
  for (let y = 15; y <= 32; y += 1) {
    for (let x = catLeft; x <= catRight; x += 1) {
      const inside = x > catLeft + 1 && x < catRight - 1 && y > 17;
      const head = y <= 25 && x >= catLeft + 1 && x <= catRight - 1;
      const ears = y <= 19 && ((x - catLeft) <= 5 || (catRight - x) <= 5);
      if ((inside || head || ears) && !(y === 15 && x > catLeft + 2 && x < catRight - 2)) paint(x, y, orange);
    }
  }
  for (let y = 18; y <= 25; y += 1) { paint(catLeft, y, dark); paint(catRight, y, dark); }
  for (let x = catLeft + 1; x < catRight; x += 1) { paint(x, 17, dark); paint(x, 26, dark); }
  paint(catLeft + 4, 16, dark); paint(catLeft + 5, 15, dark); paint(catLeft + 6, 16, dark);
  paint(catRight - 4, 16, dark); paint(catRight - 5, 15, dark); paint(catRight - 6, 16, dark);
  paint(catLeft + 7, 21, dark); paint(catRight - 7, 21, dark);
  paint(catLeft + 8, 22, bg); paint(catRight - 8, 22, bg);
  paint(Math.round(center), 23, coral); paint(Math.round(center), 24, dark);
  paint(catLeft + 5, 23, gray); paint(catLeft + 4, 23, gray);
  paint(catRight - 5, 23, gray); paint(catRight - 4, 23, gray);

  for (let y = 27; y < Math.min(size - 8, 38); y += 1) {
    paint(Math.round(center), y, green);
    if (y > 30) { paint(Math.round(center) - 1, y, green); paint(Math.round(center) + 1, y, green); }
  }
  for (let y = 29; y < Math.min(size - 8, 38); y += 1) {
    const spread = Math.floor((y - 27) / 2) + 2;
    for (let x = Math.round(center) - spread; x <= Math.round(center) + spread; x += 1) {
      if ((x + y) % 3 === 0) paint(x, y, mint);
    }
  }

  const baseY = Math.min(size - 5, 42);
  for (let x = Math.round(center) - 14; x <= Math.round(center) + 14; x += 1) {
    paint(x, baseY, blue);
    if (Math.abs(x - center) < 12) paint(x, baseY - 1, blue);
  }
  return grid;
}

function convertImageToGrid(image) {
  const aspect = image.width / image.height;
  let width;
  let height;
  if (aspect >= 1) {
    width = state.size;
    height = Math.max(1, Math.round(state.size / aspect));
  } else {
    height = state.size;
    width = Math.max(1, Math.round(state.size * aspect));
  }

  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = width;
  sampleCanvas.height = height;
  const context = sampleCanvas.getContext("2d", { willReadFrequently: true });
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const grid = createEmptyGrid(width, height, 0);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const alpha = pixels[offset + 3] / 255;
      const rgb = {
        r: Math.round(pixels[offset] * alpha + 255 * (1 - alpha)),
        g: Math.round(pixels[offset + 1] * alpha + 255 * (1 - alpha)),
        b: Math.round(pixels[offset + 2] * alpha + 255 * (1 - alpha))
      };
      grid[y][x] = nearestColorIndex(rgb);
    }
  }

  state.gridWidth = width;
  state.gridHeight = height;
  return grid;
}

function calculateCounts() {
  state.counts = new Map();
  state.grid.flat().forEach((index) => state.counts.set(index, (state.counts.get(index) || 0) + 1));
}

function drawGridCells(context, grid, startX, startY, width, height, cellSize, showCodes = true) {
  const codeFontSize = cellSize >= 24 ? (state.gridWidth >= 104 ? 5 : state.gridWidth >= 78 ? 6 : 7) : Math.max(8, Math.floor(cellSize / 3.3));
  context.font = `700 ${codeFontSize}px Arial, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.lineWidth = cellSize >= 20 ? 0.7 : 0.9;

  for (let y = startY; y < Math.min(startY + height, grid.length); y += 1) {
    for (let x = startX; x < Math.min(startX + width, grid[y].length); x += 1) {
      const color = state.palette[grid[y][x]] || state.palette[0];
      const drawX = (x - startX) * cellSize;
      const drawY = (y - startY) * cellSize;
      context.fillStyle = color.hex;
      context.fillRect(drawX, drawY, cellSize, cellSize);
      context.strokeStyle = "rgba(35, 50, 41, 0.2)";
      context.strokeRect(drawX + 0.25, drawY + 0.25, cellSize - 0.5, cellSize - 0.5);
      if (showCodes) {
        const luminance = color.rgb.r * 0.299 + color.rgb.g * 0.587 + color.rgb.b * 0.114;
        context.fillStyle = luminance < 145 ? "rgba(255,255,255,0.92)" : "rgba(28,36,32,0.78)";
        context.fillText(color.code, drawX + cellSize / 2, drawY + cellSize / 2 + 0.5);
      }
    }
  }
}

function drawGrid() {
  const canvas = els.gridCanvas;
  const context = canvas.getContext("2d");
  const cellSize = 24;
  canvas.width = state.gridWidth * cellSize;
  canvas.height = state.gridHeight * cellSize;
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawGridCells(context, state.grid, 0, 0, state.gridWidth, state.gridHeight, cellSize);
}

function renderLegend() {
  const sorted = [...state.counts.entries()].sort((a, b) => b[1] - a[1]);
  els.legendList.innerHTML = sorted.map(([index, count]) => {
    const color = state.palette[index];
    return `<div class="legend-item"><span class="legend-swatch" style="background:${color.hex}"></span><div><div class="legend-code">${color.code} · ${color.name}</div><div class="legend-count">${count.toLocaleString("zh-CN")} 颗</div></div></div>`;
  }).join("");
  els.legendTotal.textContent = `${sorted.length} 种颜色`;
}

function renderSummary() {
  const total = state.gridWidth * state.gridHeight;
  const used = state.counts.size;
  els.resultName.textContent = state.sourceName;
  els.resultMeta.textContent = `${state.gridWidth} × ${state.gridHeight} 格`;
  els.totalBeads.textContent = total.toLocaleString("zh-CN");
  els.usedColors.textContent = `${used} 色`;
  els.ratioText.textContent = `${state.gridWidth} : ${state.gridHeight}`;
}

function renderAll() {
  calculateCounts();
  state.zoomCenterX = Math.min(state.gridWidth - 1, Math.max(0, state.zoomCenterX || Math.floor(state.gridWidth / 2)));
  state.zoomCenterY = Math.min(state.gridHeight - 1, Math.max(0, state.zoomCenterY || Math.floor(state.gridHeight / 2)));
  drawGrid();
  renderLegend();
  renderSummary();
}

function resetToSample() {
  state.sourceImage = null;
  state.isSample = true;
  state.sourceName = "示例图";
  if (state.sourceObjectUrl) URL.revokeObjectURL(state.sourceObjectUrl);
  state.sourceObjectUrl = null;
  els.imageInput.value = "";
  els.uploadTitle.textContent = "点击上传照片";
  els.uploadHint.textContent = "支持 JPG、PNG、WEBP，图片只在本机处理";
  els.fileName.textContent = "还没有选择图片";
  els.sourcePreviewWrap.hidden = true;
  state.palette = getPalette(state.paletteCount);
  state.grid = createSampleGrid(state.size);
  state.zoomCenterX = Math.floor(state.gridWidth / 2);
  state.zoomCenterY = Math.floor(state.gridHeight / 2);
  renderAll();
}

function showImage(file) {
  if (!file || !file.type.startsWith("image/")) return;
  if (state.sourceObjectUrl) URL.revokeObjectURL(state.sourceObjectUrl);
  state.sourceObjectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    state.sourceImage = image;
    state.isSample = false;
    state.sourceName = file.name.replace(/\.[^/.]+$/, "") || "我的照片";
    els.uploadTitle.textContent = "照片已选择";
    els.uploadHint.textContent = "点击这里可以更换图片";
    els.fileName.textContent = file.name;
    els.sourcePreview.src = state.sourceObjectUrl;
    els.sourceDimensions.textContent = `${image.width} × ${image.height}px`;
    els.sourcePreviewWrap.hidden = false;
    generate();
  };
  image.src = state.sourceObjectUrl;
}

function generate() {
  state.size = Number(els.sizeSelect.value);
  state.paletteCount = Number(els.paletteSelect.value);
  state.palette = getPalette(state.paletteCount);
  state.grid = state.sourceImage && !state.isSample ? convertImageToGrid(state.sourceImage) : createSampleGrid(state.size);
  state.zoomCenterX = Math.floor(state.gridWidth / 2);
  state.zoomCenterY = Math.floor(state.gridHeight / 2);
  renderAll();
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

function openSaveSheet() {
  const dataUrl = els.gridCanvas.toDataURL("image/png");
  els.savePreviewImage.src = dataUrl;
  els.viewImageLink.href = dataUrl;
  els.saveStatus.textContent = "图纸已生成完整 PNG，包含全部格子和色号。";
  els.saveSheet.hidden = false;
  document.body.classList.add("modal-open");
}

async function downloadFullPng(triggerButton = els.downloadFullImageButton) {
  const originalButtonHtml = triggerButton ? triggerButton.innerHTML : "";
  if (!els.saveSheet.hidden) els.saveStatus.textContent = "正在准备完整图片…";
  const blob = await canvasToPngBlob(els.gridCanvas);
  if (!blob) {
    if (!els.saveSheet.hidden) els.saveStatus.textContent = "图片生成失败，请改用“新页面打开”后长按保存。";
    return;
  }
  downloadBlob(blob, `${state.sourceName}-拼豆图纸.png`);
  if (!els.saveSheet.hidden) els.saveStatus.textContent = "已发起下载；如果手机没有反应，请点“手机分享 / 保存图片”。";
  if (triggerButton) {
    triggerButton.textContent = "已开始下载 ✓";
    window.setTimeout(() => { triggerButton.innerHTML = originalButtonHtml; }, 1800);
  }
}

async function shareImage() {
  const fileName = `${state.sourceName}-拼豆图纸.png`;
  els.saveStatus.textContent = "正在打开手机保存选项…";
  const blob = await canvasToPngBlob(els.gridCanvas);
  if (blob && navigator.share) {
    const file = new File([blob], fileName, { type: "image/png" });
    const canShareFiles = !navigator.canShare || navigator.canShare({ files: [file] });
    if (canShareFiles) {
      try {
        await navigator.share({ title: "拼豆图纸", text: "这是我的拼豆图纸", files: [file] });
        els.saveStatus.textContent = "已打开手机分享面板，可以选择保存到相册或文件。";
        return;
      } catch (error) {
        if (error && error.name === "AbortError") {
          els.saveStatus.textContent = "已取消分享。";
          return;
        }
      }
    }
  }
  const popup = window.open(els.savePreviewImage.src, "_blank", "noopener");
  if (!popup) {
    els.viewImageLink.focus();
    els.saveStatus.textContent = "当前浏览器拦截了新页面，请点“新页面打开”，再长按完整图片保存。";
  } else {
    els.saveStatus.textContent = "已打开完整图片，请长按图片保存到手机。";
  }
}

function closeSaveSheet() {
  els.saveSheet.hidden = true;
  els.savePreviewImage.removeAttribute("src");
  document.body.classList.remove("modal-open");
}

function downloadCsv() {
  const rows = ["行号," + Array.from({ length: state.gridWidth }, (_, index) => index + 1).join(",")];
  state.grid.forEach((row, rowIndex) => {
    rows.push(`${rowIndex + 1},${row.map((index) => state.palette[index].code).join(",")}`);
  });
  rows.push("");
  rows.push("色号,颜色名称,数量");
  [...state.counts.entries()].sort((a, b) => b[1] - a[1]).forEach(([index, count]) => {
    rows.push(`${state.palette[index].code},${state.palette[index].name},${count}`);
  });
  downloadBlob(new Blob(["\ufeff" + rows.join("\n")], { type: "text/csv;charset=utf-8" }), `${state.sourceName}-颜色清单.csv`);
}

function drawZoomPreview() {
  const range = Math.min(state.zoomRange, state.gridWidth, state.gridHeight);
  const half = Math.floor(range / 2);
  const startX = Math.max(0, Math.min(state.gridWidth - range, state.zoomCenterX - half));
  const startY = Math.max(0, Math.min(state.gridHeight - range, state.zoomCenterY - half));
  const cellSize = 42;
  const canvas = els.zoomCanvas;
  const context = canvas.getContext("2d");
  canvas.width = range * cellSize;
  canvas.height = range * cellSize;
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawGridCells(context, state.grid, startX, startY, range, range, cellSize);
  els.zoomInfo.textContent = `第 ${startY + 1}–${startY + range} 行 · 第 ${startX + 1}–${startX + range} 列`;
}

function openZoomSheet(x = state.zoomCenterX, y = state.zoomCenterY) {
  state.zoomCenterX = Math.min(state.gridWidth - 1, Math.max(0, x));
  state.zoomCenterY = Math.min(state.gridHeight - 1, Math.max(0, y));
  drawZoomPreview();
  els.zoomSheet.hidden = false;
  document.body.classList.add("modal-open");
}

function closeZoomSheet() {
  els.zoomSheet.hidden = true;
  els.zoomCanvas.width = 1;
  els.zoomCanvas.height = 1;
  if (els.saveSheet.hidden) document.body.classList.remove("modal-open");
}

function selectGridPoint(event) {
  const rect = els.gridCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const x = Math.floor((event.clientX - rect.left) / (rect.width / state.gridWidth));
  const y = Math.floor((event.clientY - rect.top) / (rect.height / state.gridHeight));
  if (x >= 0 && x < state.gridWidth && y >= 0 && y < state.gridHeight) openZoomSheet(x, y);
}

function downloadZoomPng() {
  els.zoomCanvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, `${state.sourceName}-局部放大.png`);
  }, "image/png");
}

function createPrintPage(title, subtitle, canvas) {
  const page = document.createElement("section");
  page.className = "print-page";
  const heading = document.createElement("div");
  heading.className = "print-page-heading";
  const titleElement = document.createElement("h1");
  titleElement.textContent = title;
  const subtitleElement = document.createElement("p");
  subtitleElement.textContent = subtitle;
  heading.append(titleElement, subtitleElement);
  page.append(heading, canvas);
  return page;
}

function buildPrintSheet() {
  els.printSheet.replaceChildren();
  const chunkWidth = 26;
  const chunkHeight = 26;
  const cellSize = 24;
  let pageNumber = 0;

  for (let startY = 0; startY < state.gridHeight; startY += chunkHeight) {
    for (let startX = 0; startX < state.gridWidth; startX += chunkWidth) {
      const width = Math.min(chunkWidth, state.gridWidth - startX);
      const height = Math.min(chunkHeight, state.gridHeight - startY);
      const canvas = document.createElement("canvas");
      canvas.className = "print-grid-canvas";
      canvas.width = width * cellSize;
      canvas.height = height * cellSize;
      drawGridCells(canvas.getContext("2d"), state.grid, startX, startY, width, height, cellSize);
      pageNumber += 1;
      const subtitle = `${state.gridWidth} × ${state.gridHeight} 格 · 第 ${startY + 1}–${startY + height} 行 / 第 ${startX + 1}–${startX + width} 列 · ${state.paletteCount} 色`;
      els.printSheet.append(createPrintPage(`${state.sourceName} · 拼豆图纸`, subtitle, canvas));
    }
  }

  const sorted = [...state.counts.entries()].sort((a, b) => b[1] - a[1]);
  const legendChunkSize = 60;
  for (let offset = 0; offset < sorted.length; offset += legendChunkSize) {
    const page = document.createElement("section");
    page.className = "print-page print-legend-page";
    const heading = document.createElement("div");
    heading.className = "print-page-heading";
    const title = document.createElement("h1");
    title.textContent = `${state.sourceName} · 颜色清单`;
    const subtitle = document.createElement("p");
    subtitle.textContent = `${state.gridWidth} × ${state.gridHeight} 格 · 共 ${state.counts.size} 种颜色`;
    heading.append(title, subtitle);
    const list = document.createElement("div");
    list.className = "print-color-list";
    sorted.slice(offset, offset + legendChunkSize).forEach(([index, count]) => {
      const color = state.palette[index];
      const item = document.createElement("div");
      item.className = "print-color-item";
      const swatch = document.createElement("span");
      swatch.className = "legend-swatch";
      swatch.style.background = color.hex;
      const text = document.createElement("span");
      text.textContent = `${color.code} · ${count}颗`;
      item.append(swatch, text);
      list.append(item);
    });
    page.append(heading, list);
    els.printSheet.append(page);
  }
  els.printSheet.setAttribute("aria-label", `共 ${pageNumber} 页图纸和颜色清单`);
}

function printPages() {
  buildPrintSheet();
  document.body.classList.add("printing-pages");
  window.setTimeout(() => window.print(), 80);
}

function clearPrintMode() {
  document.body.classList.remove("printing-pages");
  els.printSheet.replaceChildren();
}

els.imageInput.addEventListener("change", (event) => showImage(event.target.files[0]));
els.useSampleButton.addEventListener("click", resetToSample);
els.generateButton.addEventListener("click", generate);
els.sizeSelect.addEventListener("change", generate);
els.paletteSelect.addEventListener("change", generate);
els.downloadPngButton.addEventListener("click", openSaveSheet);
els.downloadFullImageButton.addEventListener("click", downloadFullPng);
els.downloadCsvButton.addEventListener("click", downloadCsv);
els.printButton.addEventListener("click", printPages);
els.downloadFullImageCanvasButton.addEventListener("click", () => downloadFullPng(els.downloadFullImageCanvasButton));
els.zoomRangeSelect.addEventListener("change", (event) => {
  state.zoomRange = Number(event.target.value);
  drawZoomPreview();
});
els.downloadZoomButton.addEventListener("click", downloadZoomPng);
els.closeZoomButton.addEventListener("click", closeZoomSheet);
els.closeZoomButtonSecondary.addEventListener("click", closeZoomSheet);
els.zoomBackdrop.addEventListener("click", closeZoomSheet);
els.closeSaveButton.addEventListener("click", closeSaveSheet);
els.closeSaveButtonSecondary.addEventListener("click", closeSaveSheet);
els.shareImageButton.addEventListener("click", shareImage);
els.saveBackdrop.addEventListener("click", closeSaveSheet);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !els.saveSheet.hidden) closeSaveSheet();
  if (event.key === "Escape" && !els.zoomSheet.hidden) closeZoomSheet();
});
window.addEventListener("afterprint", clearPrintMode);

["dragenter", "dragover"].forEach((eventName) => els.dropzone.addEventListener(eventName, (event) => {
  event.preventDefault();
  els.dropzone.classList.add("dragging");
}));
["dragleave", "drop"].forEach((eventName) => els.dropzone.addEventListener(eventName, (event) => {
  event.preventDefault();
  els.dropzone.classList.remove("dragging");
}));
els.dropzone.addEventListener("drop", (event) => showImage(event.dataTransfer.files[0]));

state.palette = getPalette(state.paletteCount);
state.grid = createSampleGrid(state.size);
state.zoomCenterX = Math.floor(state.gridWidth / 2);
state.zoomCenterY = Math.floor(state.gridHeight / 2);
renderAll();
