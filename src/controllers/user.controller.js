import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
//generate access and refres tokens
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh tokens and access tokens")
    }
}
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
    // console.log(fullName, email, username, password)
    // console.log(req.files)
    // const avatarLocalPath = req.files?.avatar[0]?.path; // Check if req.files.avatar array exists before accessing its elements
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    //cover image is there or not
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    let avatarLocalPath;
    if (req.files && req.files.avatar && req.files.avatar[0]) {
        avatarLocalPath = req.files.avatar[0].path;
    } else {
        console.log('No avatar file was uploaded.');
    }
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
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(400, "Something went wrong")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Rigister successfully")
    )
})
const loginUser = asyncHandler(async (req, res) => {
    //req body =>data
    //username,email check
    //find the user
    //password check
    //accsess tokens and refresh tokens
    //send cookies12345
    const { username, password, email } = req.body
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(400, "user does not exist")
    }
    const isPassword = await user.isPasswordCorrect(password)
    if (!isPassword) {
        throw new ApiError(401, "password incorrect")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    //storing the cookies
    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            },
                "User logged successfully"
            )
        )
})
const logoutUser = asyncHandler(async (req, res) => {
    //find user
    await User.findByIdAndUpdate(
        req.user._id, {
        //update giving in mongoose $set method
        $set: {
            refreshToken: undefined
        },
        new: true
    }
    )
    const options = {
        httpOnly: true,
        secure: true

    }
    return res.status(200).clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user Loged out successfully"))
})
const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefresToken=await  req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefresToken){
    throw new ApiError(401,"unauthorized request")
  }
try {
     const decodedToken= await jwt.verify(
        incomingRefresToken,
        process.env.REFRESH_TOKEN_SECRETE
      )
     const user=await User.findById(decodedToken?._id)
     if(!user){
        throw new ApiError(401,"Invalid refresh token")
     }
     if(incomingRefresToken !== user?.refreshToken){
        throw new ApiError(401,"Refresh token is expired or user")
     }
     const options={
        httpOnly:true,
        secure:true
     }
     const {accessToken,newrefreshToken}=await generateAccessAndRefreshToken(user._id)
     return res
     .status(200)
     .cookie("accessToken",accessToken)
     .cookie("refreshToken",newrefreshToken)
     .json(
        new ApiError(200,
            {accessToken,refreshToken:newrefreshToken},
            "Access token refreshed"
            )
     )
} catch (error) {
    throw new ApiError(401,error.message || "Invalid refresh token")
}
})
export { registerUser, loginUser, logoutUser,refreshAccessToken }