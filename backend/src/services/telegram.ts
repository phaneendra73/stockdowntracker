export async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string
) {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
      }
    );
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Telegram API error:", errorText);
      throw new Error(`Telegram error: ${errorText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    throw error;
  }
}
