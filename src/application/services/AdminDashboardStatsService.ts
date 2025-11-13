import { injectable } from 'tsyringe';
import { AdminDashboardResponseDto } from '../dto/admin/AdminDashboardResponseDto';
import { IAdminDashboardStatsService } from '../interfaces/IAdminDashboardStatsService';
import { UserModel } from '../../infrastructure/db/models/UserModel';
import { CoinPurchaseModel } from '../../infrastructure/db/models/CoinPurchaseModel';
import { SubmissionModel } from '../../infrastructure/db/models/SubmissionModel';
import { PushSubscriptionModel } from '../../infrastructure/db/models/PushSubscriptionModel';
import { ProgrammingLanguage } from '../../domain/value-objects/ProgrammingLanguage';

const IST_OFFSET_MS = 330 * 60 * 1000;
const IST_TIMEZONE = 'Asia/Kolkata';

function toIst(date: Date) {
  return new Date(date.getTime() + IST_OFFSET_MS);
}

function fromIst(date: Date) {
  return new Date(date.getTime() - IST_OFFSET_MS);
}

function getIstComponents(date: Date) {
  const istDate = toIst(date);
  return {
    year: istDate.getUTCFullYear(),
    month: istDate.getUTCMonth(),
    day: istDate.getUTCDate()
  };
}

function getMonthRange(date: Date) {
  const { year, month } = getIstComponents(date);
  const startIst = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const endIst = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));
  return {
    start: fromIst(startIst),
    end: fromIst(endIst),
    label: `${year}-${(month + 1).toString().padStart(2, '0')}`
  };
}

function shiftMonths(date: Date, diff: number) {
  const { year, month } = getIstComponents(date);
  const shiftedIst = new Date(Date.UTC(year, month + diff, 1, 0, 0, 0));
  return fromIst(shiftedIst);
}

function getRecentMonths(date: Date, count: number) {
  const months: Array<{ label: string; start: Date; end: Date }> = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const shifted = shiftMonths(date, -i);
    const range = getMonthRange(shifted);
    months.push({ label: range.label, start: range.start, end: range.end });
  }
  return months;
}

function shiftDays(date: Date, diff: number) {
  const { year, month, day } = getIstComponents(date);
  const shiftedIst = new Date(Date.UTC(year, month, day + diff, 0, 0, 0));
  return fromIst(shiftedIst);
}

function getDayRange(date: Date) {
  const { year, month, day } = getIstComponents(date);
  const startIst = new Date(Date.UTC(year, month, day, 0, 0, 0));
  const endIst = new Date(Date.UTC(year, month, day + 1, 0, 0, 0));
  return {
    start: fromIst(startIst),
    end: fromIst(endIst),
    label: `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  };
}

function getRecentDays(date: Date, count: number) {
  const days: Array<{ label: string; start: Date; end: Date }> = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const shifted = shiftDays(date, -i);
    const range = getDayRange(shifted);
    days.push({ label: range.label, start: range.start, end: range.end });
  }
  return days;
}

function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

@injectable()
export class AdminDashboardStatsService implements IAdminDashboardStatsService {
  async getDashboard(): Promise<AdminDashboardResponseDto> {
    const now = new Date();
    const currentMonthRange = getMonthRange(now);
    const previousMonthRange = getMonthRange(shiftMonths(now, -1));
    const monthSeries = getRecentMonths(now, 7);
    const daySeries = getRecentDays(now, 7);

    const [
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      verifiedUsers,
      providerAggregation,
      recentSignupsDocs
    ] = await Promise.all([
      UserModel.countDocuments({ role: 'user' }),
      UserModel.countDocuments({
        role: 'user',
        createdAt: { $gte: currentMonthRange.start, $lt: currentMonthRange.end }
      }),
      UserModel.countDocuments({
        role: 'user',
        createdAt: { $gte: previousMonthRange.start, $lt: previousMonthRange.end }
      }),
      UserModel.countDocuments({ role: 'user', emailVerified: true }),
      UserModel.aggregate([
        { $match: { role: 'user' } },
        {
          $group: {
            _id: { $ifNull: ['$provider', 'email'] },
            count: { $sum: 1 }
          }
        }
      ]),
      UserModel.find({ role: 'user' })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('fullName userName email provider emailVerified createdAt profilePicKey')
        .lean()
    ]);

    const verifiedRate = totalUsers > 0 ? roundTo(verifiedUsers / totalUsers, 2) : 0;
    const providers = providerAggregation
      .map((item: { _id: string; count: number }) => ({
        provider: item._id || 'email',
        count: item.count
      }))
      .sort((a, b) => b.count - a.count);

    const recentSignups = recentSignupsDocs.map((doc: any) => ({
      id: doc._id.toString(),
      fullName: doc.fullName,
      userName: doc.userName,
      email: doc.email,
      provider: doc.provider || 'email',
      emailVerified: Boolean(doc.emailVerified),
      createdAt: doc.createdAt.toISOString(),
      profilePicKey: doc.profilePicKey || undefined
    }));

    const coinPurchaseCurrencyDoc = await CoinPurchaseModel.findOne().sort({ createdAt: -1 }).select('currency').lean();
    const currency = coinPurchaseCurrencyDoc?.currency || 'INR';

    const monthlyAggregation = await CoinPurchaseModel.aggregate([
      {
        $match: {
          createdAt: { $gte: monthSeries[0].start }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt',
              timezone: IST_TIMEZONE
            }
          },
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 }
        }
      }
    ]);

    const monthlyMap = new Map<string, { revenue: number; orders: number }>();
    monthlyAggregation.forEach((item: any) => {
      monthlyMap.set(item._id, { revenue: item.revenue, orders: item.orders });
    });

    const monthlyTrend = monthSeries.map(({ label }) => ({
      month: label,
      revenue: monthlyMap.get(label)?.revenue || 0
    }));

    const currentMonthStats = monthlyMap.get(currentMonthRange.label) || { revenue: 0, orders: 0 };
    const previousMonthStats = monthlyMap.get(previousMonthRange.label) || { revenue: 0, orders: 0 };

    const statusBreakdownAggregation = await CoinPurchaseModel.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$status', 'unknown'] },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    const paymentMethodsAggregation = await CoinPurchaseModel.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$paymentMethod', 'unknown'] },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    const statusBreakdown = statusBreakdownAggregation.map((item: any) => ({
      status: item._id,
      count: item.count,
      amount: item.amount
    }));

    const paymentMethods = paymentMethodsAggregation.map((item: any) => ({
      method: item._id,
      count: item.count,
      amount: item.amount
    }));

    const [
      totalProblemSubmissions,
      totalContestSubmissions,
      acceptedProblemSubmissions,
      rejectedProblemSubmissions,
      pendingProblemSubmissions
    ] = await Promise.all([
      SubmissionModel.countDocuments({ submissionType: 'problem' }),
      SubmissionModel.countDocuments({ submissionType: 'contest' }),
      SubmissionModel.countDocuments({ submissionType: 'problem', status: 'accepted' }),
      SubmissionModel.countDocuments({ submissionType: 'problem', status: 'rejected' }),
      SubmissionModel.countDocuments({
        submissionType: 'problem',
        status: { $in: ['pending', 'processing'] }
      })
    ]);

    const statusTrendAggregation = await SubmissionModel.aggregate([
      {
        $match: {
          submissionType: 'problem',
          createdAt: { $gte: daySeries[0].start }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: IST_TIMEZONE
            }
          },
          accepted: {
            $sum: {
              $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0]
            }
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $in: ['$status', ['pending', 'processing']] }, 1, 0]
            }
          }
        }
      }
    ]);

    const statusTrendMap = new Map<string, { accepted: number; rejected: number; pending: number }>();
    statusTrendAggregation.forEach((item: any) => {
      statusTrendMap.set(item._id, {
        accepted: item.accepted,
        rejected: item.rejected,
        pending: item.pending
      });
    });

    const statusTrend = daySeries.map(({ label }) => {
      const metrics = statusTrendMap.get(label) || { accepted: 0, rejected: 0, pending: 0 };
      return {
        date: label,
        accepted: metrics.accepted,
        rejected: metrics.rejected,
        pending: metrics.pending
      };
    });

    const languageAggregation = await SubmissionModel.aggregate([
      { $match: { submissionType: 'problem' } },
      {
        $group: {
          _id: '$languageId',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalLanguageCount = languageAggregation.reduce((sum: number, item: any) => sum + item.count, 0);

    const languageDistribution = languageAggregation
      .map((item: any) => {
        const languageId = Number(item._id);
        const languageInfo = ProgrammingLanguage.getLanguageInfo(languageId);
        const languageName = languageInfo?.name || 'Unknown';
        const percentage = totalLanguageCount > 0 ? item.count / totalLanguageCount : 0;
        return {
          language: languageName,
          count: item.count,
          percentage: roundTo(percentage, 3)
        };
      })
      .sort((a, b) => b.count - a.count);

    const totalSubscribersIds = await PushSubscriptionModel.distinct('userId');
    const newSubscribersAggregation = await PushSubscriptionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonthRange.start, $lt: currentMonthRange.end }
        }
      },
      {
        $group: {
          _id: '$userId'
        }
      },
      {
        $count: 'count'
      }
    ]);

    const osAggregation = await PushSubscriptionModel.aggregate([
      {
        $addFields: {
          normalizedAgent: {
            $toLower: {
              $ifNull: ['$userAgent', '']
            }
          }
        }
      },
      {
        $addFields: {
          os: {
            $switch: {
              branches: [
                {
                  case: { $regexMatch: { input: '$normalizedAgent', regex: 'windows' } },
                  then: 'windows'
                },
                {
                  case: { $regexMatch: { input: '$normalizedAgent', regex: 'mac os|macos|darwin' } },
                  then: 'macos'
                },
                {
                  case: { $regexMatch: { input: '$normalizedAgent', regex: 'iphone|ipad|ios' } },
                  then: 'ios'
                },
                {
                  case: { $regexMatch: { input: '$normalizedAgent', regex: 'android' } },
                  then: 'android'
                },
                {
                  case: { $regexMatch: { input: '$normalizedAgent', regex: 'linux' } },
                  then: 'linux'
                },
                {
                  case: { $regexMatch: { input: '$normalizedAgent', regex: 'cros' } },
                  then: 'chromeos'
                }
              ],
              default: {
                $cond: [{ $eq: ['$normalizedAgent', ''] }, 'unknown', 'other']
              }
            }
          }
        }
      },
      {
        $group: {
          _id: {
            userId: '$userId',
            os: '$os'
          }
        }
      },
      {
        $group: {
          _id: '$_id.os',
          count: { $sum: 1 }
        }
      }
    ]);

    const osDistribution = osAggregation.map((item: any) => ({
      os: item._id || 'unknown',
      count: item.count
    }));

    const dashboard: AdminDashboardResponseDto = {
      users: {
        total: totalUsers,
        newUsersThisMonth,
        newUsersLastMonth,
        verificationRate: verifiedRate,
        providers,
        recentSignups
      },
      revenue: {
        currency,
        currentMonth: {
          month: currentMonthRange.label,
          revenue: currentMonthStats.revenue,
          orders: currentMonthStats.orders,
          averageOrderValue:
            currentMonthStats.orders > 0
              ? roundTo(currentMonthStats.revenue / currentMonthStats.orders, 2)
              : 0
        },
        previousMonth: {
          month: previousMonthRange.label,
          revenue: previousMonthStats.revenue,
          orders: previousMonthStats.orders,
          averageOrderValue:
            previousMonthStats.orders > 0
              ? roundTo(previousMonthStats.revenue / previousMonthStats.orders, 2)
              : 0
        },
        monthlyTrend,
        statusBreakdown,
        paymentMethods
      },
      submissions: {
        summary: {
          totalSubmissions: totalProblemSubmissions,
          acceptedCount: acceptedProblemSubmissions,
          rejectedCount: rejectedProblemSubmissions,
          pendingCount: pendingProblemSubmissions,
          problemSubmissionsCount: totalProblemSubmissions,
          contestSubmissionsCount: totalContestSubmissions
        },
        statusTrend,
        languageDistribution
      },
      notifications: {
        subscribers: {
          total: totalSubscribersIds.length,
          newThisMonth: newSubscribersAggregation[0]?.count || 0,
          osDistribution
        }
      }
    };

    return dashboard;
  }
}

