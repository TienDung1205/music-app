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

    console.log("authHeader:", authHeader);

    if (!authHeader) {
      return res.status(401).json({
        code: 401,
        message: "Missing Authorization header",
      });
    }

    // 2. Tách Bearer token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: "Invalid Authorization format",
      });
    }

    console.log("token:", token);

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
    }).select("email fullName");

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: "Invalid token",
      });
    }

    console.log("Authenticated user:", user);

    // 5. Gắn user vào request
    res.locals.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: "Unauthorized",
    });
  }
};
