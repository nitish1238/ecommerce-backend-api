import multer from "multer";

// Store uploaded image temporarily in memory
const storage = multer.memoryStorage();

// Configure multer
const upload = multer({
    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    },

    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, PNG and WEBP images are allowed"));
        }
    }
});

export default upload;