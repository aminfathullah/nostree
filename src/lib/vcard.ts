export interface VCardData {
  name: string;
  title?: string;
  bio?: string;
  phone?: string;
  email?: string;
  url: string;
}

export function generateVCard(data: VCardData): string {
  const cleanName = data.name.replace(/[;\n\r]/g, " ").trim();
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${cleanName}`,
    `N:${cleanName};;;;`,
  ];

  if (data.title?.trim()) {
    lines.push(`TITLE:${data.title.replace(/[;\n\r]/g, " ").trim()}`);
  }

  if (data.bio?.trim()) {
    lines.push(`NOTE:${data.bio.replace(/[\n\r]/g, " ").trim()}`);
  }

  if (data.phone?.trim()) {
    const cleanPhone = data.phone.replace(/[^0-9+]/g, "");
    lines.push(`TEL;TYPE=CELL,VOICE:${cleanPhone}`);
  }

  if (data.email?.trim()) {
    lines.push(`EMAIL;TYPE=INTERNET:${data.email.trim()}`);
  }

  if (data.url?.trim()) {
    lines.push(`URL:${data.url.trim()}`);
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function downloadVCard(filename: string, vcardContent: string): void {
  const blob = new Blob([vcardContent], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename.toLowerCase().replace(/[^a-z0-9-_]/g, "-")}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
