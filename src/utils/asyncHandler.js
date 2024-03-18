 const asyncHandler = (requestHandeler) => {
    return (req, res, next) => {
      Promise.resolve(requestHandeler(req, res, next))
            .catch((error) => next(error))

    }
}


export {asyncHandler}

//usng async/await

// const asyncHandler=()=>{}
// const asyncHandler=()=>()=>{}
// const asyncHandler=(func)=>async(req,res,next)=>{
// try {
//     await func(req,res,next)
// } catch (error) {
//     res.status(error.code || 500).json({
//         success:false,
//         message:error.message
//     })
// }
// }