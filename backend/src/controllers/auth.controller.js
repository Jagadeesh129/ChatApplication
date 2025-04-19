import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

export const signup = async (req, res) => {
    const { fullname, email, password } = req.body;
    try {

        if (!fullname || !email || !password) {
            console.log(fullname);
            console.log(email);
            console.log(password);

            return res.status(400).json({ "message": "All Fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ "message": "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email });

        if (user) return res.status(400).json({ message: "Email already exists" });

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            email,
            password: hashedPassword
        })

        if (newUser) {
            // generate jwt token
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                profilePic: newUser.profilePic
            })
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        console.log("Error in signup controller: ", error.message);
        res.status(500).json({ message: "Internal Serval error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            email: user.email,
            fullname: user.fullname,
            profilePic: user.profilePic
        });
    }
    catch (error) {
        console.log("Error in login controller ", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        return res.status(200).json({ message: "Logged out Successfully" });
    } catch (error) {
        console.log("Error in login controller ", error.message);
        return res.status(500).json({ message: "Internal server Error" });
    }
}

export const updateProfile = async (req, res) => {
    try {

        console.log("Payload size:", req.body.profilePic.length);

        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic){
            return res.status(400).json({message:"Profile Pic is required"});
        }

        const uploadResponse  = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new: true})
        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in update profile controller ", error);
        res.status(500).json({message: "Internal server error"});
    }
}

export const checkAuth = (req,res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in check auth controller ", error);
        res.status(500).json({message: "Internal server error"});
    }
}