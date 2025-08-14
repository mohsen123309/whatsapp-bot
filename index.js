// WhatsApp Bot for Pharmacy - Express Server
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;   // توکن دائمی واتساپ کلود
const VERIFY_TOKEN   = process.env.VERIFY_TOKEN;     // هر رشته دلخواه
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID; // آیدی شماره واتساپ بیزنس

app.get("/", (req, res) => {
  res.send("WhatsApp bot is running ✅");
});

// Webhook Verify (مرحله‌ی Verify در Meta)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// دریافت پیام‌ها
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;
    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      if (message) {
        const from = message.from;
        const text =
          message.text?.body ||
          message.button?.text ||
          message.interactive?.list_reply?.title ||
          "";

        // پاسخ‌های خیلی ساده
        let reply =
          "سلام 👋\nلطفاً یکی از گزینه‌ها را بفرستید:\n- لیست\n- راهنما\n- سفارش: [نام دارو]";

        if (/^لیست/i.test(text)) {
          reply =
            "لیست داروهای پرمصرف امروز:\n۱) استامینوفن\n۲) سرماخوردگی بزرگسالان\n۳) بروفن ۴۰۰\nبرای سفارش بنویس: سفارش: استامینوفن";
        } else if (/^راهنما/i.test(text)) {
          reply =
            'راهنما:\n- برای دیدن لیست بنویس "لیست"\n- برای سفارش بنویس "سفارش: نام دارو"';
        } else if (/^سفارش\s*:/i.test(text)) {
          const item = text.split(":")[1]?.trim() || "نامشخص";
          reply = `سفارش شما برای «${item}» ثبت مقدماتی شد ✅\nکارشناس تا کمی بعد با شما تماس می‌گیرد.`;
        }

        await sendMessage(from, reply);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err?.response?.data || err.message);
    res.sendStatus(200);
  }
});

async function sendMessage(to, message) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;
  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to,
      text: { body: message },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

app.listen(PORT, () => console.log("Server running on port " + PORT));
