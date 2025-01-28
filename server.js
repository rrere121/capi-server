import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Helper untuk ambil IP Client
async function fetchClientIp(req) {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        return data.ip || req.ip || "0.0.0.0";
    } catch (error) {
        console.error("Error fetching IP:", error);
        return "0.0.0.0";
    }
}

// Endpoint CAPI Pageview
app.post("/capi/pageview", async (req, res) => {
    const userIp = await fetchClientIp(req);
    const { user_agent } = req.body;

    const payload = {
        data: [
            {
                event_name: "PageView",
                event_time: Math.floor(Date.now() / 1000),
                action_source: "website",
                user_data: {
                    client_ip_address: userIp,
                    client_user_agent: user_agent,
                },
            },
        ],
        access_token: process.env.ACCESS_TOKEN,
    };

    const fbResponse = await fetch(`https://graph.facebook.com/v14.0/${process.env.PIXEL_ID}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const fbData = await fbResponse.json();
    res.json(fbData);
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
