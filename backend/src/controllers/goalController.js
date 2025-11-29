import Goal from "../models/Goal.js";

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };

    // Show archived filter
    if (req.query.includeArchived !== "true") {
      filter.isArchived = false;
    }

    // Completed filter
    if (req.query.completed === "true") {
      filter.isCompleted = true;
    } else if (req.query.completed === "false") {
      filter.isCompleted = false;
    }

    const goals = await Goal.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: goals,
      count: goals.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
export const getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res, next) => {
  try {
    const {
      name,
      targetAmount,
      currentAmount,
      deadline,
      category,
      icon,
      color,
      notes,
    } = req.body;

    if (!name || !targetAmount || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, targetAmount, and deadline",
      });
    }

    const goal = await Goal.create({
      user: req.user._id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      category: category || "other",
      icon: icon || "🎯",
      color: color || "#3b82f6",
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Goal created successfully",
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    const {
      name,
      targetAmount,
      currentAmount,
      deadline,
      category,
      icon,
      color,
      notes,
      isArchived,
    } = req.body;

    goal = await Goal.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(targetAmount !== undefined && { targetAmount }),
        ...(currentAmount !== undefined && { currentAmount }),
        ...(deadline && { deadline }),
        ...(category && { category }),
        ...(icon && { icon }),
        ...(color && { color }),
        ...(notes !== undefined && { notes }),
        ...(isArchived !== undefined && { isArchived }),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Goal updated successfully",
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add to goal progress
// @route   PUT /api/goals/:id/add
// @access  Private
export const addToGoal = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid amount",
      });
    }

    let goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    goal.currentAmount += amount;
    await goal.save();

    res.status(200).json({
      success: true,
      message: `Added ₹${amount} to goal`,
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      message: "Goal deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive goal
// @route   PUT /api/goals/:id/archive
// @access  Private
export const archiveGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isArchived: true },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Goal archived",
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};
