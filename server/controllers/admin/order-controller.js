const Order = require("../../models/Order");
const User = require("../../models/User");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({});

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    // Fetch user details for each order manually since userId is a string
    const userIds = [...new Set(orders.map((order) => order.userId))];
    const users = await User.find({ _id: { $in: userIds } }).select("userName email");

    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = { userName: user.userName, email: user.email };
      return acc;
    }, {});

    const ordersWithUserDetails = orders.map((order) => ({
      ...order._doc,
      userName: userMap[order.userId]?.userName || "Unknown User",
      email: userMap[order.userId]?.email || "N/A",
    }));

    res.status(200).json({
      success: true,
      data: ordersWithUserDetails,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    await Order.findByIdAndUpdate(id, { orderStatus });

    res.status(200).json({
      success: true,
      message: "Order status is updated successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
