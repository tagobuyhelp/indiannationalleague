import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { Member } from '../models/member.model.js';
import { Transaction } from '../models/transaction.model.js';




const getDashboardStatistics = asyncHandler(async (req, res) => {
    // Total Members
    const totalMembers = await Member.countDocuments();
    
    // Active Members
    const activeMembers = await Member.countDocuments({ membershipStatus: 'active' });
    
    // General Members
    const generalMembers = await Member.countDocuments({ membershipType: 'general' });
    
    // State-wise Distribution
    const stateDistribution = await Member.aggregate([
        { $group: { _id: "$state", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);

    // Membership Overview
    const membershipOverview = {
        active: activeMembers,
        general: generalMembers,
        total: totalMembers,
        activeRate: (activeMembers / totalMembers * 100).toFixed(2)
    };

    // Total Revenue (only from completed transactions)
    const totalRevenue = await Transaction.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Total Transactions (completed only)
    const totalTransactions = await Transaction.countDocuments({ paymentStatus: 'completed' });

    // Total Donations (assuming all donations are completed)
    const totalDonations = await Transaction.aggregate([
        { $match: { transactionType: 'donation', paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Date-wise reports (last 30 days) for new members
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyNewMembers = await Member.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                newMembers: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Date-wise reports (last 30 days) for completed transactions
    const dailyRevenue = await Transaction.aggregate([
        { 
            $match: { 
                createdAt: { $gte: thirtyDaysAgo },
                paymentStatus: 'completed'
            } 
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: { $sum: "$amount" },
                transactions: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const statistics = {
        totalMembers,
        activeMembers,
        generalMembers,
        stateDistribution,
        membershipOverview,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalTransactions,
        totalDonations: totalDonations[0]?.total || 0,
        dailyNewMembers,
        dailyRevenue
    };

    return res.status(200).json(new ApiResponse(200, "Dashboard statistics retrieved successfully", statistics));
});

export { getDashboardStatistics };
