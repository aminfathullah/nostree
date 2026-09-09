import { getNDK, NDKEventClass } from "./ndk";
import { getToken } from "nostr-tools/nip98";

export function compressImageToDataUrl(file: File, maxDim = 480, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to process image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function uploadImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  const ndk = getNDK();

  if (ndk.signer) {
    try {
      const uploadUrl = "https://nostr.build/api/v2/upload/files";
      const signFn = async (rawEvent: any) => {
        const ndkEvent = new NDKEventClass(ndk, rawEvent);
        await ndkEvent.sign();
        return ndkEvent.rawEvent();
      };

      const token = await getToken(uploadUrl, "POST", signFn, true);
      const form = new FormData();
      form.append("file", file, file.name || "upload.jpg");

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: token,
        },
        body: form,
      });

      if (response.ok) {
        const json = await response.json();
        const cdnUrl = json?.data?.[0]?.url;
        if (cdnUrl && typeof cdnUrl === "string") {
          return cdnUrl;
        }
      }
    } catch {}
  }

  return await compressImageToDataUrl(file);
}
