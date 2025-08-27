import { useState } from "react";

export default function PayMayaButton({ campaignId, amount }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/paymaya/create-payment"`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId,
          amount,
        }),
      });

      const data = await response.json();

      if (response.ok && data.redirectUrl) {
        console.log("✅ Redirecting to:", data.redirectUrl);
        window.location.href = data.redirectUrl;
      } else {
        console.error("Payment creation failed:", data);
        setError("Payment creation failed. Please try again.");
      }
    } catch (err) {
      console.error("Error creating payment:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          backgroundColor: "#0070f3",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        {loading ? "Processing..." : "Donate with PayMaya"}
      </button>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}
