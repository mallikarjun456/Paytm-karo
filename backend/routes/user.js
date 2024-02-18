const express = require("express");
const { signupschema, signinschema, updateschema } = require("../zod");
const jwt = require("jsonwebtoken");
const { user, account } = require("../db");
const { JWT_secret } = require("../config");
const { authMiddleware } = require("../middleware");
const router = express.Router();

router.post("/signup", async (req, res) => {
  const userpayload = req.body;
  const uservalidation = signupschema.safeParse(userpayload);
  if (uservalidation.success) {
   
    const userfinding = await user.findOne({
      username: userpayload.username,
    });
    if (userfinding) {
      res.status(411).json({
        message: "user already exist",
      });
    } else {
      const newuser = await user.create({
        username: userpayload.username,
        firstname: userpayload.firstname,
        lastname: userpayload.lastname,
        password: userpayload.password,
      });

      const userid = newuser._id;
      const useraccount = await account.create({
        userId: userid,
        balance: Math.ceil(Math.random() * 1000000),
      });
      const token = jwt.sign({ userid: newuser._id }, JWT_secret);

      res.status(200).json({
        message: "User created successfully",
        token: token,
        balance: useraccount.balance,
        id: useraccount.userId,
      });
    }
  } else {
    res.status(411).json({
      message: "Incorrect Inputs. Please try again.",
    });
  }
});

router.post("/signin", async (req, res) => {
  const userpayload = req.body;
  const uservalidation = signinschema.safeParse(userpayload);
  if (uservalidation.success) {
    const userfind = await user.findOne({
      username: userpayload.username,
      password: userpayload.password,
    });
    if (userfind) {
      const token = jwt.sign({ userid: userfind._id }, JWT_secret);
      req.userid = userfind._id;
      res.status(200).json({
        message: "Signed in successfully.",
        token: token,
        id: userfind._id,
        firstname: userfind.firstname,
      });
      return;
    } else {
      res.status(411).json({
        message: "User does not exist.",
      });
      return;
    }
  } else {
    res.status(411).json({
      message: "Incorrect inputs. Please try again.",
    });
    return;
  }
});

router.put("/", authMiddleware, async (req, res) => {
  const userpayload = req.body;
  const uservalidation = updateschema.safeParse(userpayload);
  try {
    if (uservalidation.success) {
      await user.updateOne(
        {
          _id: req.userid,
        },
        {
          password: userpayload.password,
          firstname: userpayload.firstname,
          lastname: userpayload.lastname,
        }
      );
      res.json({
        message: "Credential updated successfully",
      });
    } else {
      res.status(403).json({
        message: "Invlaid Inputs. Please try again with different Inputs.",
      });
    }
  } catch (e) {
    res.status(411).json({
      message: e,
    });
  }
});

router.get("/userprofile", authMiddleware, async (req, res) => {
  const id = req.userid;
  try {
    const finduser = await user.findOne({
      _id: id,
    });

    res.json({
      user: finduser,
    });
  } catch (e) {
    res.status(400).json({
      message: "Something went wrong please try again later." + e,
    });
  }
});

router.get("/bulk", async (req, res) => {
  const name = req.query.name || "";
  const userfinding = await user.find({
    $or: [
      {
        firstname: {
          $regex: name,
        },
      },
      {
        lastname: {
          $regex: name,
        },
      },
    ],
  });
  res.json({
    user: userfinding.map((user) => ({
      id: user._id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
    })),
  });
});

module.exports = router;
