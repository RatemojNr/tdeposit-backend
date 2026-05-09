const WebSocket = require("ws");

let latestBalance = 0;

function connectBalanceSync() {
    const ws = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=1089");

    ws.on("open", () => {
        console.log("Balance sync started ✅");

        ws.send(JSON.stringify({
            authorize: process.env.DERIV_API_TOKEN
        }));
    });

    ws.on("message", (data) => {
        try {
            const res = JSON.parse(data.toString());

            if (res.msg_type === "authorize") {
                ws.send(JSON.stringify({
                    balance: 1
                }));
            }

            if (res.msg_type === "balance") {
                latestBalance = res.balance.balance;
                console.log("Balance:", latestBalance);
            }

        } catch (e) {
            console.log("Balance parse error");
        }
    });

    ws.on("close", () => {
        console.log("Balance sync closed ❌ reconnecting...");
        setTimeout(connectBalanceSync, 3000);
    });
}

function getLatestBalance() {
    return latestBalance;
}

module.exports = { connectBalanceSync, getLatestBalance };