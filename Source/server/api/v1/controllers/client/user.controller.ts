import { Request, Response } from "express";
import User from "../../models/user.model";
import bcrypt from "bcrypt";
import * as generateHelper from "../../../../helpers/generate"

// [POST] api/v1/users/register/
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