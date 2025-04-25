export const generateUniqueFileName = (
  prompt: string,
  timestamp: string,
): string => {
  // Take first 30 chars of prompt, remove special chars, replace spaces with dashes
  const sanitizedPrompt = prompt
    .slice(0, 30)
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

  // Add timestamp to ensure uniqueness
  const date = new Date(timestamp);
  const timeStr = date.toISOString().replace(/[:.]/g, "-");

  return `${timeStr}-${sanitizedPrompt}.png`;
};
