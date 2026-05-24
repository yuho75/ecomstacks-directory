/**
 * Automatically embeds Cloudinary optimization parameters (f_auto, q_auto, w_600, h_400, c_fill)
 * into Cloudinary image source URLs to maximize media loading speed and responsiveness.
 */
export function getOptimizedCloudinaryUrl(url: string | null | undefined): string {
  if (!url) return "";
  // Check if this is a standard Cloudinary delivery URL
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    return url.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_600,h_400,c_fill/");
  }
  return url;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch (e) {
    return "";
  }
}
