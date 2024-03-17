import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message:"ok"
    // })
    //user algoritham or detail
    //1.get user details from frontend
    //2.validation - not empty
    //3.check if user already exist:username,email
    //4.check for images,check for avatar
    //5.upload time to cloudinary
    //6.create user object -create entry in db
    //7.remove password and refresh token field form response
    //8.check for user creation
    //9.return res
    const { fullName, email, username, password } = req.body
    // console.log("email:", email)

    // if(fullName === ""){
    //     throw new ApiError(400,"fullname is Required")
    // }
    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    //check user already exist
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(400, "User with email or user name alredy exist")
    }
    // console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    //cover image is there or not
    // let coverImageLocalPath;
    // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    //     coverImageLocalPath = req.files.coverImage[0].path;
    // }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is reqire")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Avatar Require")
    }
    // create user object -create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshTokens"
    )
    if (!createdUser) {
        throw new ApiError(400, "Something went wrong")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Rigister successfully")
    )
})

export { registerUser }