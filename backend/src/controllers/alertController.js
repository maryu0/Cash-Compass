import Alert from "../models/Alert.js";

// @desc    Get all alerts for user
// @route   GET /api/alerts
// @access  Private
export const getAlerts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { user: req.user._id };

    // Severity filter
    if (req.query.severity) {
      filter.severity = req.query.severity;
    }

    // Read status filter
    if (req.query.isRead !== undefined) {
      filter.isRead = req.query.isRead === "true";
    }

    // Resolved status filter
    if (req.query.isResolved !== undefined) {
      filter.isResolved = req.query.isResolved === "true";
    } else {
      // By default, don't show resolved alerts
      filter.isResolved = false;
    }

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Alert.countDocuments(filter);
    const unreadCount = await Alert.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      data: alerts,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Private
export const getAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create alert
// @route   POST /api/alerts
// @access  Private
export const createAlert = async (req, res, next) => {
  try {
    const { title, message, severity, category, metadata } = req.body;

    if (!title || !message || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, message, and category",
      });
    }

    const alert = await Alert.create({
      user: req.user._id,
      title,
      message,
      severity: severity || "info",
      category,
      metadata,
    });

    res.status(201).json({
      success: true,
      message: "Alert created successfully",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark alert as read
// @route   PUT /api/alerts/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Alert marked as read",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all alerts as read
// @route   PUT /api/alerts/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    await Alert.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All alerts marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve alert
// @route   PUT /api/alerts/:id/resolve
// @access  Private
export const resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isResolved: true, isRead: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Alert resolved",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private
export const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    await alert.deleteOne();

    res.status(200).json({
      success: true,
      message: "Alert deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all resolved alerts
// @route   DELETE /api/alerts/clear
// @access  Private
export const clearAlerts = async (req, res, next) => {
  try {
    const result = await Alert.deleteMany({
      user: req.user._id,
      isResolved: true,
    });

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} resolved alerts`,
    });
  } catch (error) {
    next(error);
  }
};
