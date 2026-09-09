interface TreeMeta {
  title: string;
  bio: string;
  avatar: string;
  linksCount: number;
}

const RESERVED_PATHS = new Set([
  "admin",
  "login",
  "profile",
  "api",
  "assets",
  "favicon",
  "manifest",
  "robots",
  "sitemap",
]);

async function fetchTreeMetaFromNostr(slug: string): Promise<TreeMeta | null> {
  const dTag = `nostree/${slug}`;
  const relays = ["wss://relay.damus.io", "wss://relay.primal.net"];

  return new Promise((resolve) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, 750);

    for (const relayUrl of relays) {
      try {
        const ws = new WebSocket(relayUrl);
        const subId = `og_${Math.random().toString(36).slice(2, 8)}`;

        ws.onopen = () => {
          ws.send(JSON.stringify(["REQ", subId, { kinds: [30078], "#d": [dTag], limit: 1 }]));
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg[0] === "EVENT" && msg[1] === subId && msg[2]?.content) {
              const data = JSON.parse(msg[2].content);
              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                ws.close();
                resolve({
                  title: data?.treeMeta?.title || data?.profile?.name || slug,
                  bio: data?.treeMeta?.description || data?.profile?.bio || data?.profile?.about || "",
                  avatar: data?.profile?.picture || "",
                  linksCount: Array.isArray(data?.links) ? data.links.length : 0,
                });
              }
            } else if (msg[0] === "EOSE") {
              ws.close();
            }
          } catch {}
        };

        ws.onerror = () => {
          try {
            ws.close();
          } catch {}
        };
      } catch {}
    }
  });
}

export async function onRequest(context: any): Promise<Response> {
  const request = context.request;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/+|\/+$/g, "");

  if (path.includes(".") || path.startsWith("api/") || RESERVED_PATHS.has(path.toLowerCase())) {
    return context.next();
  }

  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  if (!path) {
    return response;
  }

  const slug = path.startsWith("u/") ? path.split("/")[2] || path : path;
  const meta = await fetchTreeMetaFromNostr(slug);

  const title = meta?.title ? `${meta.title} | Nostree` : `${slug} | Nostree`;
  const rawTitle = meta?.title || slug;
  const bio = meta?.bio || "The fast, elegant link organizer and digital hub on Nostr.";
  const avatar = meta?.avatar || "";
  const linksCount = meta?.linksCount || 0;

  const ogParams = new URLSearchParams({
    slug,
    title: rawTitle,
    bio,
    links: String(linksCount),
  });
  if (avatar) {
    ogParams.set("avatar", avatar);
  }

  const ogImageUrl = `${url.origin}/api/og?${ogParams.toString()}`;
  const canonicalUrl = `${url.origin}/${slug}`;

  const rewriter = new HTMLRewriter()
    .on("title", {
      element(el: any) {
        el.setInnerContent(title);
      },
    })
    .on('meta[property="og:title"]', {
      element(el: any) {
        el.setAttribute("content", title);
      },
    })
    .on('meta[property="og:description"]', {
      element(el: any) {
        el.setAttribute("content", bio);
      },
    })
    .on('meta[property="og:url"]', {
      element(el: any) {
        el.setAttribute("content", canonicalUrl);
      },
    })
    .on('meta[property="og:image"]', {
      element(el: any) {
        el.setAttribute("content", ogImageUrl);
      },
    })
    .on('meta[property="og:image:secure_url"]', {
      element(el: any) {
        el.setAttribute("content", ogImageUrl);
      },
    })
    .on('meta[name="twitter:title"]', {
      element(el: any) {
        el.setAttribute("content", title);
      },
    })
    .on('meta[name="twitter:description"]', {
      element(el: any) {
        el.setAttribute("content", bio);
      },
    })
    .on('meta[name="twitter:image"]', {
      element(el: any) {
        el.setAttribute("content", ogImageUrl);
      },
    });

  const transformed = rewriter.transform(response);
  const newHeaders = new Headers(transformed.headers);
  newHeaders.set("Cache-Control", "public, max-age=1800, s-maxage=86400, stale-while-revalidate=86400");

  return new Response(transformed.body, {
    status: transformed.status,
    statusText: transformed.statusText,
    headers: newHeaders,
  });
}
