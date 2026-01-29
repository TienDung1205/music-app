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

            const newUser = new User({
                email: req.body.email,
                password: hashedPassword,
                fullName: req.body.fullName
            });
            await newUser.save();

            // Tạo JWT ngay sau khi đăng ký
            const accessToken = jwt.sign(
                { userId: newUser._id },
                process.env.JWT_SECRET as string,
                { expiresIn: "7d" }
            );

            res.json({
                code: 200,
                message: "Đăng ký tài khoản thành công",
                accessToken: accessToken
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

        // Tạo JWT
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        res.json({
            code: 200,
            message: "Đăng nhập thành công",
            accessToken: accessToken
        });

    }catch(error){
        res.json({
            code: 400,
            message: "Lỗi server"
        })
    }
};

// [GET] api/v1/users/infoUser
export const infoUser = async (req: Request, res: Response) => {
    try{
        res.json({
            code: 200,
            message: "Lấy thông tin user thành công",
            user: (req as any).user
        });
    }catch(error){
        res.json({
            code: 400,
            message: "Lỗi server"
        })
    }
};