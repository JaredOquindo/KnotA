import express from "express";
import Campaign from "../models/Campaign.js";

const router = express.Router();

// ✅ Create Payment
router.post("/create-payment", async (req, res) => {
  try {
    const { amount, campaignId } = req.body;

    // Ensure numeric amount and convert to centavos
    const numericAmount = Number(amount);
    const finalAmount = Number.isFinite(numericAmount) && numericAmount > 0 ? numericAmount * 100 : 100;

    // ✅ Combine pk + sk into Base64
    const PAYMAYA_PUBLIC = process.env.PAYMAYA_PUBLIC;
    const PAYMAYA_SECRET = process.env.PAYMAYA_SECRET;
    const PAYMAYA_AUTH = Buffer.from(`${PAYMAYA_PUBLIC}:${PAYMAYA_SECRET}`).toString("base64");

    const response = await fetch("https://pg-sandbox.paymaya.com/payby/v2/paymaya/payments", {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Basic ${PAYMAYA_AUTH}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        totalAmount: {
          currency: "PHP",
          value: finalAmount,
        },
        redirectUrl: {
          success: `http://localhost:5000/paymaya/payment-success?campaignId=${campaignId}&amount=${amount}`,
          failure: `http://localhost:5000/paymaya/payment-failure?campaignId=${campaignId}`,
          cancel: `http://localhost:5000/paymaya/payment-cancel?campaignId=${campaignId}`,
        },
        requestReferenceNumber: Date.now().toString(),

        // ✅ Required by PayMaya
        metadata: {
          campaignId: campaignId || "N/A",
          donationAmount: amount,
          source: "DonationPlatform",
          // ✅ Add the required `pf` object
          pf: {
            smi: "SMI_ID_HERE", // Replace with your actual Sub-Merchant ID
          },
        },
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    console.log("🔎 PayMaya API status:", response.status);
    console.log("🔎 PayMaya API response:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        error: true,
        message: data,
      });
    }

    return res.json(data); // Should contain redirectUrl
  } catch (error) {
    console.error("❌ Error creating PayMaya payment:", error);
    return res.status(500).json({ error: true, message: "Something went wrong" });
  }
});

// ✅ Payment Success
router.get("/payment-success", async (req, res) => {
  const { campaignId, amount } = req.query;
  try {
    if (campaignId && amount) {
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: { collectedAmount: Number(amount) || 0 },
        lastPaymentStatus: "success",
      });
    }
    res.redirect("http://localhost:3000/payment-success");
  } catch (err) {
    console.error(err);
    res.redirect("http://localhost:3000/payment-failure");
  }
});

// ✅ Payment Failure
router.get("/payment-failure", async (req, res) => {
  const { campaignId } = req.query;
  try {
    if (campaignId) {
      await Campaign.findByIdAndUpdate(campaignId, { lastPaymentStatus: "failure" });
    }
    res.redirect("http://localhost:3000/payment-failure");
  } catch (err) {
    console.error(err);
    res.redirect("http://localhost:3000/payment-failure");
  }
});

// ✅ Payment Cancel
router.get("/payment-cancel", async (req, res) => {
  const { campaignId } = req.query;
  try {
    if (campaignId) {
      await Campaign.findByIdAndUpdate(campaignId, { lastPaymentStatus: "cancelled" });
    }
    res.redirect("http://localhost:3000/payment-cancel");
  } catch (err) {
    console.error(err);
    res.redirect("http://localhost:3000/payment-cancel");
  }
});

export default router;