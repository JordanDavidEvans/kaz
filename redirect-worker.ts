export interface Env {}

const redirects: Record<string, string> = {
  "/": "/",
  "/zumba-dance-classes/": "/zumba-classes/",
  "/zumba-for-seniors/": "/zumba-for-seniors/",
  "/top-10-fun-activities-for-fitness-in-murwillumbah/": "/blog/fitness-activities-murwillumbah/",
  "/about-kazumbah/": "/about/",
  "/zumba-classes-in-murwillumbah-kazumbah/": "/zumba-classes-murwillumbah/",
  "/zumba-for-weight-loss/": "/zumba-for-weight-loss/",
  "/?page_id=11": "/contact/",
  "/how-zumba-helps-with-weight-loss-the-fun-way-to-get-fit/": "/zumba-for-weight-loss/",
  "/contact-us-get-in-touch-with-kazumbah/": "/contact/",
  "/kazumbah-zumba-classes-schedule/": "/timetable/",
  "/zumba-classes-for-beginners/": "/zumba-for-beginners/",
  "/the-best-zumba-classes-for-beginners-in-murwillumbah/": "/blog/best-zumba-classes-murwillumbah/",
  "/5-benefits-of-joining-zumba-classes-in-murwillumbah/": "/zumba-classes-murwillumbah/"
};

const trackingParams = [/^utm_/, /^fbclid$/i];
const canonicalHost = "kazumbah.com.au";

function stripTracking(searchParams: URLSearchParams) {
  for (const key of [...searchParams.keys()]) {
    if (trackingParams.some((re) => re.test(key))) {
      searchParams.delete(key);
    }
  }
}

function normalizePath(path: string): string {
  let out = path.replace(/\/+/g, "/");
  if (!out.endsWith("/")) out += "/";
  out = out.toLowerCase();
  return out;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/__redirects-check") {
      return new Response(JSON.stringify(redirects, null, 2), {
        headers: { "content-type": "application/json" }
      });
    }

    stripTracking(url.searchParams);

    let changed = false;
    if (url.protocol !== "https:") {
      url.protocol = "https:";
      changed = true;
    }
    if (url.hostname !== canonicalHost) {
      url.hostname = canonicalHost;
      changed = true;
    }

    const originalPath = url.pathname;
    let path = normalizePath(originalPath);
    if (path !== originalPath) {
      changed = true;
    }

    const search = url.search;
    const lookupKey = path + search;
    let target = redirects[lookupKey] || redirects[path];
    if (!target) {
      const altPath = path.endsWith("/") ? path.slice(0, -1) : path + "/";
      target = redirects[altPath + search] || redirects[altPath];
    }

    if (target) {
      url.pathname = target;
      const res = Response.redirect(url.toString(), 301);
      res.headers.set("Vary", "Host");
      res.headers.set("Cache-Control", "public, max-age=86400");
      return res;
    }

    if (changed) {
      url.pathname = path;
      const res = Response.redirect(url.toString(), 301);
      res.headers.set("Vary", "Host");
      res.headers.set("Cache-Control", "public, max-age=86400");
      return res;
    }

    return new Response("Gone", { status: 410 });
  }
};
