const axios = require("axios");

const BASE_URL = "https://lipana.dev/api";

async function stkPush(phone, amount) {

    try {

        const response = await axios.post(
            `${BASE_URL}/request/stk`,
            {
                phone,
                amount
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.LIPANA_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (err) {

        console.log(err.response?.data || err.message);
        throw err;

    }

}

module.exports = {
    stkPush
};