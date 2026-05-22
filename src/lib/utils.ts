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

/**
 * Formats PostgreSQL timestamptz date strings to a readable format
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return "";
  }
}
