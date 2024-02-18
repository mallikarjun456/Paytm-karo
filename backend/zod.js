const zod=require("zod")

const signupschema=zod.object({
    username:zod.string().email(),
    firstname:zod.string().min(3).max(20),
    lastname:zod.string().min(3).max(20),
    password:zod.string().min(3).max(16),
})


const signinschema=zod.object({
    username:zod.string().email(),
    password:zod.string().min(3).max(16)
})

const updateschema=zod.object({
    password:zod.string().optional(),
    firstname:zod.string().optional(),
    lastname:zod.string().optional()
})


module.exports={
    signupschema,
    signinschema,
    updateschema
}