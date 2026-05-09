const WebSocket = require("ws");

function getDerivBalance(token) {
    return new Promise((resolve, reject) => {

        const ws = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=1089");

        const timeout = setTimeout(() => {
            ws.close();
            reject(new Error("Timeout"));
        }, 10000);

        ws.on("open", () => {
            ws.send(JSON.stringify({
                authorize: token
            }));
        });

        ws.on("message", (data) => {
            try {
                const res = JSON.parse(data.toString());

                if (res.msg_type === "authorize") {
                    clearTimeout(timeout);

                    resolve({
                        balance: res.authorize.balance,
                        currency: res.authorize.currency
                    });

                    ws.close();
                }

            } catch (e) {
                reject(new Error("Invalid response"));
            }
        });

        ws.on("error", reject);
    });
}

module.exports = getDerivBalance;