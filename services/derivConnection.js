const WebSocket = require("ws");

function connectDeriv() {
    const ws = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=1089");

    ws.on("open", () => {
        console.log("Deriv connected ✅");

        const token = process.env.DERIV_API_TOKEN;

        if (!token) {
            console.log("Missing DERIV_API_TOKEN ❌");
            return;
        }

        ws.send(JSON.stringify({
            authorize: token
        }));
    });

    ws.on("message", (data) => {
        try {
            const res = JSON.parse(data.toString());
            console.log("Deriv:", res.msg_type || res);
        } catch (e) {
            console.log("Parse error");
        }
    });

    ws.on("close", () => {
        console.log("Deriv disconnected ❌ reconnecting...");
        setTimeout(connectDeriv, 3000);
    });

    ws.on("error", (err) => {
        console.log("Deriv error:", err.message);
    });
}

module.exports = connectDeriv;