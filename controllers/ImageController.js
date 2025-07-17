require('dotenv').config();
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

class ImageController {
    static async uploadSingleImage(file, expiration) {
        try {
            const formData = new FormData();
            formData.append("image", fs.createReadStream(file.path));
            formData.append("key", IMGBB_API_KEY);
            if (expiration) formData.append("expiration", expiration);

            const imgbbRes = await axios.post(
                "https://api.imgbb.com/1/upload",
                formData,
                { headers: formData.getHeaders() }
            );

            const imgData = imgbbRes.data.data;
            return {
                success: true,
                image: {
                    imgbbId: imgData.id,
                    url: imgData.url,
                    displayUrl: imgData.display_url,
                    deleteUrl: imgData.delete_url,
                    width: parseInt(imgData.width),
                    height: parseInt(imgData.height),
                    size: parseInt(imgData.size),
                    expiration: imgData.expiration !== "0"
                        ? new Date(imgData.time * 1000 + imgData.expiration * 1000)
                        : null
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                filename: file.originalname
            };
        }
    }
}

module.exports = ImageController;