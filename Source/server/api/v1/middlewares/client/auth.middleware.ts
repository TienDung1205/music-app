import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../../models/user.model";

interface JwtPayload {
  userId: string;
}

export const requireAuth = async (req: Request,res: Response,next: NextFunction) => {
  try {
    // 1. Lấy token từ header
    const authHeader = req.headers.authorization;

    // console.log("authHeader:", authHeader);

    if (!authHeader) {
      res.json({
        code: 401,
        message: "Chưa gửi token"
      })
      return;
    }

    // 2. Tách Bearer token
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.json({
        code: 401,
        message: "Chưa gửi token"
      })
      return;
    }

    // console.log("token:", token);

    // 3. Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // 4. Tìm user
    const user = await User.findOne({
      _id: decoded.userId,
      status: "active",
      deleted: false,
    }).select("fullName email phone address avatar");

    if (!user) {
      res.json({
        code: 400,
        message: "User không tồn tại"
      })
      return;
    }

    // console.log("Authenticated user:", user);

    // 5. Gắn user vào request
    (req as any).user = user;
    next();

  } catch (error) {
    res.json({
      code: 401,
      message: "Token không hợp lệ"
    });
  }
};
