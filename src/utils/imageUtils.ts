
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement>,
  placeholder: string = "/placeholder-image.png"
): void => {
  const target = event.target as HTMLImageElement;
  target.src = placeholder;
};

export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;

  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  const hasImageExtension = imageExtensions.some((ext) =>
    url.toLowerCase().includes(ext)
  );

  try {
    new URL(url);
    return (
      hasImageExtension ||
      url.startsWith("data:image/") ||
      url.startsWith("http")
    );
  } catch (e) {
    return false;
  }
};
