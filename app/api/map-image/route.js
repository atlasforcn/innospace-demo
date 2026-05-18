export const runtime = "nodejs";

const mapViews = {
  wildfire: {
    center: [39.18, -106.82],
    zoom: 7,
    maptype: "terrain",
    marker: "color:orange|label:F|39.18,-106.82",
    path: "color:0xffa64dcc|fillcolor:0xffa64d44|weight:2|39.75,-107.5|39.95,-106.6|39.1,-105.7|38.55,-106.35|38.85,-107.35|39.75,-107.5"
  },
  construction: {
    center: [38.8977, -77.0365],
    zoom: 16,
    maptype: "satellite",
    marker: "color:blue|label:C|38.8977,-77.0365"
  },
  washington: {
    center: [38.9072, -77.0369],
    zoom: 12,
    maptype: "hybrid",
    marker: "color:blue|label:D|38.9072,-77.0369"
  }
};

function googleMapsKey() {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_KEY || process.env.GOOGLE_API_KEY;
}

function normalizeScenario(value) {
  if (value === "construction") return "construction";
  if (value === "custom" || value === "washington") return "washington";
  return "wildfire";
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const scenario = normalizeScenario(searchParams.get("scenario"));
  const key = googleMapsKey();

  if (!key) {
    return Response.json({ error: "GOOGLE_MAPS_API_KEY is not configured." }, { status: 503 });
  }

  const view = mapViews[scenario];
  const [lat, lng] = view.center;
  const url = new URL("https://maps.googleapis.com/maps/api/staticmap");
  url.searchParams.set("center", `${lat},${lng}`);
  url.searchParams.set("zoom", String(view.zoom));
  url.searchParams.set("size", "640x420");
  url.searchParams.set("scale", "2");
  url.searchParams.set("maptype", view.maptype);
  url.searchParams.set("format", "png");
  url.searchParams.append("markers", view.marker);
  if (view.path) url.searchParams.append("path", view.path);
  url.searchParams.set("key", key);

  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok || !contentType.startsWith("image/")) {
      return Response.json(
        {
          error: "Google Static Maps image unavailable.",
          google_status: response.status,
          google_content_type: contentType
        },
        { status: 502 }
      );
    }

    return new Response(await response.arrayBuffer(), {
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=300"
      }
    });
  } catch (error) {
    return Response.json({ error: "Google Static Maps request failed." }, { status: 502 });
  }
}
