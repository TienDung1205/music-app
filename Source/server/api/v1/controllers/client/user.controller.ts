import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../../models/user.model";
import * as generateHelper from "../../../../helpers/generate"

// [POST] api/v1/users/register
export const register = async (req: Request, res: Response) => {
    try{
        const existEmail = await User.findOne({
            email: req.body.email
        });

        if (existEmail) {
            res.json({
                code: 400,
                message: "Email đã tồn tại"
            });
        }else{
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const tokenUser = generateHelper.generateRandomString(50);

            const newUser = new User({
                email: req.body.email,
                password: hashedPassword,
                fullName: req.body.fullName,
                tokenUser: tokenUser
            });
            await newUser.save();

            res.cookie("tokenUser", tokenUser);

            res.json({
                code: 200,
                message: "Đăng ký tài khoản thành công",
                tokenUser: tokenUser
            });
        }
    }catch(error){
        console.error("ERROR:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// [POST] api/v1/users/login
export const login = async (req: Request, res: Response) => {
    try{
        const { email, password } = req.body;

        const user =  await User.findOne({
            email: email,
            deleted: false,
            status: "active"
        })

        if(!user){
            res.json({
                code: 400,
                message: "Email hoặc mật khẩu không đúng"
            })
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            res.json({
                code: 400,
                message: "Email hoặc mật khẩu không đúng"
            })
            return;
        }

        // Tạo JWT (mỗi lần login = token mới)
        const tokenUser = jwt.sign(
            {
                userId: user.id
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "7d"
            }
        );

        // 4. Set cookie (ghi đè cookie cũ)
        res.cookie("tokenUser", tokenUser, {
            httpOnly: true,
            secure: false, // true nếu HTTPS
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });

        res.json({
            code: 200,
            message: "Đăng nhập thành công",
            tokenUser: user.tokenUser
        });

    }catch(error){
        res.json({
            code: 400,
            message: "Lỗi server"
        })
    }
};