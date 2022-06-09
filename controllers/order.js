
const router = require("express").Router();
const Order = require('../models/Order')
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");



// //CREATE ORDER
// router.post('/add',verifyToken,async(req,res)=>{
//   try{
//         const userId = req.user.id
//         const { 
//           products,
//           amount,
//           address
//         } = req.body
//         const order = {
//           userId,
//           products,
//           amount,
//           address
//         }
//         const newOrder = new Order(order)
//         const savedOrder = await newOrder.save()
//         res.status(200).json("Successfully added order")
//   }
//   catch(err){
//     res.status(500).json(err)
//   }
// })


router.post("/add", verifyToken, async (req, res, next) => {

  try {
    let userId = req.user.id

    const newOrder = new Order({ ...req.body, userId });
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    next(err)
  }

});



//UPDATE
router.put("/update/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    updatedOrder != null && res.status(200).json(updatedOrder);
    res.status(424).json("updated failed")
  } catch (err) {
    res.status(500).json(err);
  }
});



//DELETE
router.delete("/delete/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const deletedResult = await Order.findByIdAndDelete(req.params.id);
    if (deletedResult) {
      res.status(200).json("Order has been deleted...");
    } else {
      res.status(404).json("Didn't found this order")
    }

  } catch (err) {
    res.status(500).json(err);
  }
});


//GET USER ORDERS
router.get("/find/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.id })
    const len = orders.length
    res.status(200).json({
      message: "Showing results",
      length: len,
      result: orders,
      error: false
    });
  } catch (err) {
    res.status(500).json(err);
  }
});



 //GET ALL
router.get("/allorders", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    const len = orders.length
    res.status(200).json({
      message: "Showing results",
      length: len,
      results: orders,
      error: false
    });
  } catch (err) {
    res.status(500).json(err);
  }
});


// GET MONTHLY INCOME
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: previousMonth } } },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
