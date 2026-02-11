import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";
dotenv.config();

// Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});
// End Cloudinary

const streamUpload = (buffer: Buffer): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
                if (result) {
                    resolve(result); // Bây giờ TS biết result là UploadApiResponse
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

export const uploadSingle = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Kiểm tra xem multer đã bắt được file chưa
  if (!req.file) {
    return next(); // Hoặc báo lỗi nếu bắt buộc phải có ảnh
  }

  try {
    // 2. Upload lên Cloudinary
    const result = await streamUpload(req.file.buffer);
    
    // 3. Gán URL vào body để controller phía sau sử dụng
    // Ví dụ: Nếu mobile gửi file với key là "avatar", req.body.avatar sẽ là link ảnh
    req.body[req.file.fieldname] = result.secure_url; 
    
    next();
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ message: "Upload ảnh thất bại" });
  }
};

