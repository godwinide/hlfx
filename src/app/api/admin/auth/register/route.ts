import { connectDb } from "@/config";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server"

export const POST = async (req:NextRequest) => {
       try{
        await connectDb();
        const {email, password} = await req.json();
        if(!email || !password) {
            return NextResponse.json({
                message: 'All fields are required',
            }, { status: 400 });
        }   
        const user = await User.create({
            email: email.trim(),
            password: password.trim()
        });
        return NextResponse.json({
            message: 'User created successfully',
            user
        }, { status: 201 });
       }catch(error){
            console.log(error);
            return NextResponse.json({
                message: 'Internal Server Error',
            }, { status: 500 })
       }
}