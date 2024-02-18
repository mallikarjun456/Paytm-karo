const express=require("express")
const router=express.Router();
const accountrouter=require("./account")
const userRouter=require("./user")

router.use("/user",userRouter)

router.use("/account",accountrouter)

module.exports = router