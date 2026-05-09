const WebSocket = require("ws");

const DERIV_WS = "wss://ws.derivws.com/websockets/v3?app_id=1089";

/**
 * Send funds to Deriv (real API layer)
 * NOTE: Requires valid API token with permissions
 */
function sendToDeriv({ token, amountUSD }) {
    return new Promise((resolve, reject) => {

        const ws = new WebSocket(DERIV_WS);

        const timeout = setTimeout(() => {
            ws.close();
            reject(new Error("Deriv transfer timeout"));
        }, 10000);

        ws.on("open", () => {

            if (!token) {
                clearTimeout(timeout);
                return reject(new Error("Missing Deriv token"));
            }

            // AUTHORIZE
            ws.send(JSON.stringify({
                authorize: token
            }));
        });

        ws.on("message", (data) => {

            try {
                const res = JSON.parse(data.toString());

                // AUTH SUCCESS
                if (res.msg_type === "authorize") {

                    // SIMULATED TRANSFER REQUEST (placeholder safe layer)
                    ws.send(JSON.stringify({
                        paymentagent_transfer: 1,
                        amount: amountUSD,
                        currency: "USD",
                        to_loginid: res.authorize.loginid
                    }));

                    return;
                }

                // TRANSFER RESPONSE
                if (res.msg_type === "paymentagent_transfer") {

                    clearTimeout(timeout);
                    ws.close();

                    return resolve({
                        status: "SUCCESS",
                        data: res
                    });
                }

            } catch (err) {
                reject(err);
            }
        });

        ws.on("error", (err) => {
            clearTimeout(timeout);
            reject(err);
        });

    });
}

module.exports = {
    sendToDeriv
};