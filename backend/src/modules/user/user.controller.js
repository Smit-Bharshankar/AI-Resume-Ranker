import userService from "./user.service.js";
import { errorResponse, successResponse } from "../../utils/api-response.js";
import { handleControllerError } from "../../utils/error-handler.js";

const getUsage = async (req, res) => {
  try {
    const usage = await userService.getCurrentUsage(req.user.id);

    if (!usage) {
      return res.status(404).json(errorResponse("User not found"));
    }

    return res.status(200).json(successResponse(usage));
  } catch (error) {
    return handleControllerError(res, error, "Failed to fetch usage");
  }
};

const userController = {
  getUsage,
};

export default userController;
