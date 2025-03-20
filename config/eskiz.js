const axios = require("axios")
const api = axios.create({
    baseURL: "https://notify.eskiz.uz/api/",
    headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDQ5MDYyNjUsImlhdCI6MTc0MjMxNDI2NSwicm9sZSI6InRlc3QiLCJzaWduIjoiNDQ3NDU5MTc4ZWI3OTI0MzRkZDQ0OGJmZmViMGFmNGVkZGUyMWM1OWY1ZDcwYWJhZTRjNTI1OThjNGYyZTVhNSIsInN1YiI6IjEwMTc2In0.93NL-zfm8mkY5qDecf3W-a2CozRgI0UJ2xuhb-W5DmE`
    }
})

async function sendSMS(tel, otp) {
    try {
        api.post("message/sms/send", {
            mobile_phone: tel,
            message: "Bu Eskiz dan test"
        })
        console.log("sended", otp, tel);
    } catch (error) {
        res.send(error)
    }
}

module.exports = sendSMS
