export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  return match ? match[1] : null;
}

export function formatWhatsAppUrl(phone: string, text?: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  const baseUrl = `https://wa.me/${cleaned}`;
  if (!text || !text.trim()) {
    return baseUrl;
  }
  return `${baseUrl}?text=${encodeURIComponent(text.trim())}`;
}

export function parseWhatsAppUrl(url?: string): { phone: string; text?: string } | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.includes("://") ? url : `https://${url}`);
    if (parsed.hostname.includes("wa.me") || parsed.hostname.includes("whatsapp.com")) {
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      let phone = "";
      if (pathParts[0] === "send") {
        phone = parsed.searchParams.get("phone") || "";
      } else if (pathParts[0]) {
        phone = pathParts[0];
      }
      const text = parsed.searchParams.get("text") || undefined;
      if (phone) {
        return { phone, text };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function isWhatsAppUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes("wa.me") || url.includes("api.whatsapp.com") || url.includes("whatsapp.com");
}
