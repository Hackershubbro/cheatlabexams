require('dotenv').config();
const Data = require("../models/DataBase");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const fs = require("fs");
const axios = require("axios");
const ImageController = require("../controllers/ImageController")

class DataController {
    static async createOrUpdate(req, res) {
        const { key, password, content, newpassword, expiration } = req.body;
        const files = req.files || [];

        try {
            let existingData = await Data.findOne({ key }).select("+password");
            const isNew = !existingData;

            if (isNew) {
                existingData = new Data({ key });
            } else if (existingData.password) {
                if (!password) {
                    return res.status(401).json({
                        success: false,
                        message: "Password required"
                    });
                }
                if (existingData.password) {
                    const isMatch = await bcrypt.compare(password, existingData.password);
                    if (!isMatch) {
                        return res.status(401).json({
                            success: false,
                            message: "Wrong password"
                        });
                    }
                }
            }

            if (content !== undefined) {
                existingData.content = content;
            }

            if (newpassword) {
                if (existingData.password) {
                    const isSamePassword = await bcrypt.compare(newpassword, existingData.password);
                    if (isSamePassword) {
                        return res.status(400).json({
                            success: false,
                            message: "New password cannot be the same as current password"
                        });
                    }
                }
                existingData.password = await bcrypt.hash(newpassword, saltRounds);
            }

            if (files.length > 0) {
                const uploadResults = await Promise.all(
                    files.map(file =>
                        ImageController.uploadSingleImage(file, expiration)
                    ))
                const successfulImages = uploadResults
                    .filter(result => result.success)
                    .map(result => result.image);

                existingData.images.push(...successfulImages);
            }

            const savedData = await existingData.save();

            if (files.length > 0) {
                files.forEach(file => {
                    try {
                        if (fs.existsSync(file.path)) {
                            fs.unlinkSync(file.path);
                        }
                    } catch (err) {
                        console.error("Error deleting file:", err);
                    }
                });
            }

            res.json({
                success: true,
                data: savedData,
                message: isNew ? "Data created successfully" : "Data updated successfully"
            });

        } catch (error) {
            console.error("Operation error:", error);
            if (req.files) {
                req.files.forEach(file => {
                    try {
                        if (fs.existsSync(file.path)) {
                            fs.unlinkSync(file.path);
                        }
                    } catch (err) {
                        console.error("Error deleting file:", err);
                    }
                });
            }
            res.status(500).json({
                success: false,
                message: "Operation failed",
                error: error.message
            });
        }
    }

    static async delete(req, res) {
        const { key, password, imgbbId } = req.body;

        try {
            const existingData = await Data.findOne({ key }).select("+password");
            if (!existingData) {
                return res.status(404).json({ success: false, message: "Data not found" });
            }

            if (existingData.password) {
                if (!password) {
                    return res.status(401).json({
                        success: false,
                        message: "Password required"
                    });
                }
                const isMatch = await bcrypt.compare(password, existingData.password);
                if (!isMatch) {
                    return res.status(401).json({
                        success: false,
                        message: "Wrong password"
                    });
                }
            }

            if (imgbbId) {
                const image = existingData.images.find(img => img.imgbbId === imgbbId);
                if (!image) {
                    return res.status(404).json({
                        success: false,
                        message: "Image not found"
                    });
                }

                try {
                    await axios.get(image.deleteUrl);
                } catch (deleteError) {
                    console.error("Failed to delete image from imgbb:", deleteError);
                }

                existingData.images = existingData.images.filter(img => img.imgbbId !== imgbbId);
                await existingData.save();

                return res.json({ success: true, message: "Image deleted successfully" });
            }

            await Data.deleteOne({ key });
            res.json({ success: true, message: "Data deleted successfully" });

        } catch (error) {
            console.error("Delete error:", error);
            res.status(500).json({
                success: false,
                message: "Deletion failed",
                error: error.message
            });
        }
    }

    static async fetch(req, res) {
        const { key, password } = req.body;

        try {
            const existingData = await Data.findOne({ key }).select("+password");
            if (!existingData) {
                return res.status(404).json({ success: false, message: "Data not found" });
            }

            if (existingData.password) {
                if (!password) {
                    return res.status(401).json({
                        success: false,
                        message: "Password required"
                    });
                }
                const isMatch = await bcrypt.compare(password, existingData.password);
                if (!isMatch) {
                    return res.status(401).json({
                        success: false,
                        message: "Wrong password"
                    });
                }
            }

            const dataToReturn = existingData.toObject();
            delete dataToReturn.password;

            res.json({ success: true, data: dataToReturn });

        } catch (error) {
            console.error("Fetch error:", error);
            res.status(500).json({
                success: false,
                message: "Fetch failed",
                error: error.message
            });
        }
    }
}

module.exports = DataController;
