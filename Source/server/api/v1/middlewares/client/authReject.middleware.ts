import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const rejectIfAuthenticated = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    // Nếu không có token → cho đi tiếp (chưa đăng nhập)
    if (!authHeader) return next();

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    // Nếu verify được → đã login → chặn
    jwt.verify(token, process.env.JWT_SECRET as string);

    return res.status(400).json({
      code: 400,
      message: "Bạn đã đăng nhập rồi",
    });
  } catch (error) {
    // Token sai / hết hạn → cho login/register tiếp
    next();
  }
};
