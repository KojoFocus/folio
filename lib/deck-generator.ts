import pptxgen from "pptxgenjs";
import { v2 as cloudinary } from "cloudinary";

// ── Chart types ─────────────────────────────────────────────────────────────

export interface ChartSeries {
  name:   string;
  values: number[];
}

export interface ChartData {
  type:     "bar" | "line" | "pie" | "area";
  title?:   string;
  labels:   string[];
  series:   ChartSeries[];
}

// ── Slide / Deck types ──────────────────────────────────────────────────────

export interface ClaudeSlide {
  title:    string;
  bullets:  string[];
  notes?:   string;
  chart?:   ChartData;
}

export interface DeckData {
  title:  string;
  slides: ClaudeSlide[];
}

// ── Theme ───────────────────────────────────────────────────────────────────

const T = {
  bg:          "0e0e0c",
  heading:     "e6e3d0",
  body:        "b4b096",
  muted:       "484840",
  accent:      "96a470",
  chartBg:     "161614",
  chartGrid:   "2a2a28",
  // Multi-series palette (sage → field tones)
  chartColors: ["96a470", "b0bc8a", "7a8858", "606e44", "8c8a74", "606050"],
} as const;

// ── Chart renderer ──────────────────────────────────────────────────────────

function addChartToSlide(
  pptx: pptxgen,
  s:    pptxgen.Slide,
  chart: ChartData,
  pos:  { x: number; y: number; w: number; h: number },
): void {
  const seriesData = chart.series.map((sr) => ({
    name:   sr.name,
    labels: chart.labels,
    values: sr.values,
  }));

  // Cast to any to avoid PptxGenJS type-def churn across versions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseOpts: any = {
    x: pos.x, y: pos.y, w: pos.w, h: pos.h,
    chartColors:         [...T.chartColors],
    plotArea:            { fill: { color: T.chartBg } },
    catAxisLabelColor:   T.body,
    catAxisLabelFontSize: 10,
    catAxisLineShow:     false,
    valAxisLabelColor:   T.body,
    valAxisLabelFontSize: 10,
    valAxisLineShow:     false,
    valGridLine:         { color: T.chartGrid, style: "solid" },
    showLegend:          chart.series.length > 1,
    legendColor:         T.body,
    legendFontSize:      10,
    legendPos:           "b",
    dataLabelColor:      T.heading,
    dataLabelFontSize:   9,
    dataLabelFontBold:   false,
  };

  try {
    switch (chart.type) {
      case "bar":
        s.addChart(pptx.ChartType.bar, seriesData, {
          ...baseOpts,
          barDir:     "col",
          barGapWidthPct: 60,
          showValue:  true,
        });
        break;

      case "line":
        s.addChart(pptx.ChartType.line, seriesData, {
          ...baseOpts,
          showValue:       false,
          lineDataSymbol:  "none",
          lineSmooth:      true,
          lineSize:        2,
        });
        break;

      case "area":
        s.addChart(pptx.ChartType.area, seriesData, {
          ...baseOpts,
          showValue:           false,
          chartColorsOpacity:  60,
          lineSize:            1,
        });
        break;

      case "pie":
        s.addChart(pptx.ChartType.pie, seriesData, {
          ...baseOpts,
          showValue:   false,
          showPercent: true,
          showLegend:  true,
          legendPos:   "r",
          legendFontSize: 11,
        });
        break;
    }
  } catch {
    // If the chart fails (bad data, unsupported options), skip it silently —
    // the slide still has its title and bullets.
  }
}

// ── PPTX builder ─────────────────────────────────────────────────────────────

export async function buildPptx(deck: DeckData): Promise<Buffer> {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 × 7.5 in

  for (const [i, slide] of deck.slides.entries()) {
    const s = pptx.addSlide();
    s.background = { color: T.bg };

    // Accent line at top
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: "100%", h: 0.04,
      fill: { color: T.accent },
      line: { color: T.accent },
    });

    // Slide number
    s.addText(String(i + 1), {
      x: 12.0, y: 0.15, w: 1.0, h: 0.3,
      fontSize: 9, color: T.muted, align: "right",
    });

    // Title
    s.addText(slide.title, {
      x: 0.6, y: 0.35, w: 11.5, h: 0.9,
      fontSize: 26, bold: true, color: T.heading,
      fontFace: "Georgia",
    });

    // Divider
    s.addShape(pptx.ShapeType.line, {
      x: 0.6, y: 1.4, w: 12.0, h: 0,
      line: { color: T.muted, width: 0.75 },
    });

    const hasChart   = Boolean(slide.chart);
    const hasBullets = slide.bullets.length > 0;

    if (hasChart && hasBullets) {
      // ── Two-column layout: bullets left, chart right ───────────────────
      const bulletRows = slide.bullets.map((b) => ({
        text:    b,
        options: { bullet: { code: "2022" }, indentLevel: 0 },
      }));
      s.addText(bulletRows, {
        x: 0.6, y: 1.6, w: 4.8, h: 5.6,
        fontSize: 15, color: T.body,
        lineSpacingMultiple: 1.5, valign: "top",
        fontFace: "Calibri",
      });

      addChartToSlide(pptx, s, slide.chart!, {
        x: 5.8, y: 1.55, w: 7.1, h: 5.6,
      });

    } else if (hasChart) {
      // ── Full-width chart ───────────────────────────────────────────────
      addChartToSlide(pptx, s, slide.chart!, {
        x: 0.6, y: 1.55, w: 12.1, h: 5.65,
      });

    } else if (hasBullets) {
      // ── Bullets only (original layout) ────────────────────────────────
      const bulletRows = slide.bullets.map((b) => ({
        text:    b,
        options: { bullet: { code: "2022" }, indentLevel: 0 },
      }));
      s.addText(bulletRows, {
        x: 0.6, y: 1.65, w: 12.0, h: 5.5,
        fontSize: 17, color: T.body,
        lineSpacingMultiple: 1.5, valign: "top",
        fontFace: "Calibri",
      });
    }

    if (slide.notes) s.addNotes(slide.notes);
  }

  const result = await pptx.write({ outputType: "nodebuffer" });
  return result as unknown as Buffer;
}

// ── Cloudinary upload ────────────────────────────────────────────────────────

export async function uploadToCloudinary(
  buffer:   Buffer,
  filename: string,
): Promise<string> {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id:     `folio-decks/${filename.replace(/\.pptx$/, "")}`,
        format:        "pptx",
        overwrite:     true,
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("Cloudinary upload failed"));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}
