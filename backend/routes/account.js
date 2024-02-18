const express = require("express");
const { authMiddleware } = require("../middleware");
const { account, user } = require("../db");
const { mongo, default: mongoose } = require("mongoose");
const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
  const userid = req.userid;
  try {
    const accountfind = await account.findOne({
      userId: userid,
    });
    res.status(200).json({
      balance: accountfind.balance,
    });
  } catch (e) {
    res.status(411).json({
      message: "Something went wrong. Please try again later." + e,
    });
  }
});

router.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const userpayload = req.body;
    const userid = req.userid;
    const sender = await account
      .findOne({
        userId: userid,
      })
      .session(session);

    if (sender.balance < userpayload.amount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficient Balance.",
      });
    }

    const receiver = await account
      .findOne({
        userId: userpayload.to,
      })
      .session(session);

    if (!receiver) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid account",
      });
    }
    await account
      .updateOne(
        { userId: userpayload.to },
        { $inc: { balance: userpayload.amount } }
      )
      .session(session);

    await account
      .updateOne({ userId: userid }, { $inc: { balance: -userpayload.amount } })
      .session(session);

    await session.commitTransaction();
    return res.status(200).json({
      message: "Amount transferred successfully.",
    });
  } catch (e) {
    res.status(411).json({
      message: e,
    });
  }
});

module.exports = router;
