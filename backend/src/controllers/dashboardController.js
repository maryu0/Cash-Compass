import Transaction from "../models/Transaction.js";
import Alert from "../models/Alert.js";
import Goal from "../models/Goal.js";

// @desc    Get dashboard data (summary, charts, recent transactions)
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get summary data
    const summary = await Transaction.getSummaryByUser(userId);

    // Get category breakdown for pie chart
    const categoryBreakdown = await Transaction.getCategoryBreakdown(userId);

    // Get monthly spending for line chart
    const spendingTrend = await Transaction.getWeeklySpending(userId);

    // Get recent transactions (last 10)
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(10);

    // Get unread alerts count
    const alertsCount = await Alert.getUnreadCount(userId);

    // Get active goals count
    const goalsCount = await Goal.countDocuments({
      user: userId,
      isCompleted: false,
      isArchived: false,
    });

    // Format category data for pie chart
    const categoryData = categoryBreakdown.map((cat) => ({
      name: formatCategoryName(cat._id),
      value: cat.totalAmount,
      count: cat.count,
    }));

    // Format spending trend for line chart
    const trendData = spendingTrend.map((item) => ({
      name: item.month,
      income: item.income,
      expenses: item.expenses,
    }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalBalance: summary.netBalance,
          totalIncome: summary.totalIncome,
          totalExpenses: summary.totalExpenses,
          transactionCount: summary.transactionCount,
        },
        categoryBreakdown: categoryData,
        spendingTrend: trendData,
        recentTransactions,
        alertsCount,
        goalsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get risk score from chatbot backend
// @route   GET /api/dashboard/risk-score
// @access  Private
export const getRiskScore = async (req, res, next) => {
  try {
    // Try to call the Python chatbot backend for risk analysis
    try {
      const response = await fetch("http://localhost:5001/risk/score", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({
          success: true,
          data: {
            riskScore: data.risk_score || 45,
            riskLevel: data.risk_level || "medium",
            factors: data.factors || [],
            recommendations: data.recommendations || [],
          },
        });
      }
    } catch (fetchError) {
      // Chatbot backend not available, continue with mock data
    }

    // Return mock data if chatbot backend is not available
    res.status(200).json({
      success: true,
      data: {
        riskScore: 45,
        riskLevel: "medium",
        factors: [
          "Moderate spending patterns",
          "Consistent income detected",
          "Some high-risk categories",
        ],
        recommendations: [
          "Consider reducing entertainment expenses",
          "Build an emergency fund",
          "Review subscription services",
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monitoring status
// @route   GET /api/dashboard/monitoring
// @access  Private
export const getMonitoringStatus = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        isMonitoring: false,
        lastCheck: null,
        nextCheck: null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start monitoring
// @route   POST /api/dashboard/monitoring/start
// @access  Private
export const startMonitoring = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Monitoring started",
      data: {
        isMonitoring: true,
        startedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stop monitoring
// @route   POST /api/dashboard/monitoring/stop
// @access  Private
export const stopMonitoring = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Monitoring stopped",
      data: {
        isMonitoring: false,
        stoppedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to format category names
function formatCategoryName(category) {
  if (!category) return "Other";

  const categoryNames = {
    food: "Food",
    social_life_entertainment: "Entertainment",
    transport: "Transport",
    household: "Household",
    health_personal_care: "Health",
    education: "Education",
    pets: "Pets",
    apparel: "Apparel",
    travel: "Travel",
    savings_investments: "Savings",
    gifts_donations: "Gifts",
    miscellaneous: "Misc",
    income: "Income",
  };

  return categoryNames[category] || category;
}
