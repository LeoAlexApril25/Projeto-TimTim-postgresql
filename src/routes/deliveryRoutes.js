const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/deliveryController");

router.post("/", deliveryController.createDevilery);
router.get("/", deliveryController.getDeliveries);
router.put("/:id/status", deliveryController.updateDeliveryStatus);

module.exports = router;
