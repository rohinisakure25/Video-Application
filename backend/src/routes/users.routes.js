import { Router } from "express";
import { login, register } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js"; // Import the Guard

const router = Router();

router.post("/login", login);
router.post("/register", register);

// ✅ Only logged-in users can reach these
router.get("/get_all_activity", verifyToken, (req, res) => {
    // Because of verifyToken, we now have access to req.user.id!
    // This is where you would fetch activity from the database for that specific ID.
});

export default router;