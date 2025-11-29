import Transaction from "../models/Transaction.js";

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { user: req.user._id };

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) {
        filter.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.date.$lte = new Date(req.query.endDate);
      }
    }

    // Type filter (income or expense)
    if (req.query.type === "income") {
      filter.amount = { $gt: 0 };
    } else if (req.query.type === "expense") {
      filter.amount = { $lt: 0 };
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: transactions,
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

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
export const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res, next) => {
  try {
    const { date, amount, category, description, isExpense } = req.body;

    if (!amount || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide amount and category",
      });
    }

    // If isExpense is true, make amount negative
    const finalAmount = isExpense && amount > 0 ? -Math.abs(amount) : amount;

    const transaction = await Transaction.create({
      user: req.user._id,
      date: date || new Date(),
      amount: finalAmount,
      category,
      description,
      isExpense: isExpense ?? amount < 0,
    });

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const { date, amount, category, description, isExpense } = req.body;

    // If updating amount with isExpense flag
    let finalAmount = amount;
    if (amount !== undefined && isExpense !== undefined) {
      finalAmount = isExpense ? -Math.abs(amount) : Math.abs(amount);
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        ...(date && { date }),
        ...(finalAmount !== undefined && { amount: finalAmount }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(isExpense !== undefined && { isExpense }),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk import transactions
// @route   POST /api/transactions/bulk
// @access  Private
export const bulkImportTransactions = async (req, res, next) => {
  try {
    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of transactions",
      });
    }

    // Add user ID to each transaction
    const transactionsWithUser = transactions.map((t) => ({
      ...t,
      user: req.user._id,
      amount: t.isExpense ? -Math.abs(t.amount) : Math.abs(t.amount),
    }));

    const created = await Transaction.insertMany(transactionsWithUser, {
      ordered: false,
    });

    res.status(201).json({
      success: true,
      message: `${created.length} transactions imported successfully`,
      data: {
        imported: created.length,
        transactions: created,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction summary
// @route   GET /api/transactions/summary
// @access  Private
export const getTransactionSummary = async (req, res, next) => {
  try {
    const summary = await Transaction.getSummaryByUser(req.user._id);
    const categoryBreakdown = await Transaction.getCategoryBreakdown(
      req.user._id
    );
    const monthlyTrend = await Transaction.getWeeklySpending(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        summary,
        categoryBreakdown,
        monthlyTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};
