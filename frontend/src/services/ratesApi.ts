export async function fetchRates() {
  try {
    const response = await fetch("https://retoolapi.dev/JO1M55/data");
    if (!response.ok) throw new Error("Failed to fetch rates");
    return await response.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}
