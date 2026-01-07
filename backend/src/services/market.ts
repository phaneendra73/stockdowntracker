export async function getStockPrice(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();

    // Try multiple regex patterns for Google Finance price
    // Pattern 1: Meta tag (most reliable)
    const metaPrice = html.match(/<meta itemprop="price" content="([\d,.]+)">/);
    if (metaPrice && metaPrice[1]) {
      return parseFloat(metaPrice[1].replace(/,/g, ""));
    }

    // Pattern 2: Common class for price in Google Finance
    const classPrice = html.match(/class="YMlS1d"[^>]*>([\d,.]+)</);
    if (classPrice && classPrice[1]) {
      return parseFloat(classPrice[1].replace(/,/g, ""));
    }

    // Pattern 3: Data attribute
    const dataPrice = html.match(/data-last-price="([\d,.]+)"/);
    if (dataPrice && dataPrice[1]) {
      return parseFloat(dataPrice[1].replace(/,/g, ""));
    }

    console.error(`Could not find price in HTML for ${url}`);
    return null;
  } catch (error) {
    console.error(`Scraping error for ${url}:`, error);
    return null;
  }
}

// These are no longer needed as we use URLs for everything
export async function getMarketStatus() {
  return { status: "Monitoring via URLs" };
}

export async function getAllSymbols() {
  return [];
}
