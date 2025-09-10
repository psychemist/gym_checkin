import { Request, Response } from 'express';
import { PrismaClient, SessionType } from '../generated/prisma';

const prisma = new PrismaClient();

// Helper function to determine session type based on time
const getSessionType = (): SessionType => {
  const now = new Date();
  const hour = now.getHours();
  
  // 6AM-2PM = Morning, 2PM-8PM = Evening
  return hour >= 6 && hour < 14 ? SessionType.MORNING : SessionType.EVENING;
};

export const checkIn = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // From auth middleware
    const { sessionType } = req.body;
    
    // Check if user already has an active check-in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCheckIn = await prisma.attendance.findFirst({
      where: {
        userId,
        checkInTime: {
          gte: today,
          lt: tomorrow,
        },
        checkOutTime: null, // Still checked in
      },
    });

    if (existingCheckIn) {
      return res.status(400).json({
        error: 'Already checked in',
        message: 'You are already checked in for today',
        attendance: existingCheckIn,
      });
    }

    // Create new attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId,
        checkInTime: new Date(),
        sessionType: sessionType || getSessionType(),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      attendance,
      message: `Check-in successful! Welcome to your ${attendance.sessionType.toLowerCase()} session.`,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      error: 'Check-in failed',
      message: 'Internal server error',
    });
  }
};

export const checkOut = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // From auth middleware

    // Find active check-in
    const activeCheckIn = await prisma.attendance.findFirst({
      where: {
        userId,
        checkOutTime: null,
      },
      orderBy: {
        checkInTime: 'desc',
      },
    });

    if (!activeCheckIn) {
      return res.status(400).json({
        error: 'No active check-in',
        message: 'You are not currently checked in',
      });
    }

    // Update with check-out time
    const attendance = await prisma.attendance.update({
      where: { id: activeCheckIn.id },
      data: {
        checkOutTime: new Date(),
      },
    });

    // Calculate session duration
    const duration = Math.floor(
      (attendance.checkOutTime!.getTime() - attendance.checkInTime.getTime()) / (1000 * 60)
    );

    res.json({
      attendance,
      duration: `${duration} minutes`,
      message: 'Check-out successful! Great workout session!',
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      error: 'Check-out failed',
      message: 'Internal server error',
    });
  }
};

export const getAttendanceHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // From auth middleware
    const { limit = 30, offset = 0 } = req.query;

    const attendances = await prisma.attendance.findMany({
      where: { userId },
      orderBy: { checkInTime: 'desc' },
      take: Number(limit),
      skip: Number(offset),
      include: {
        workoutSessions: true,
      },
    });

    // Calculate stats
    const totalWorkouts = attendances.length;
    const thisMonth = attendances.filter(a => {
      const checkIn = new Date(a.checkInTime);
      const now = new Date();
      return checkIn.getMonth() === now.getMonth() && checkIn.getFullYear() === now.getFullYear();
    }).length;

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    const sortedAttendances = attendances.sort((a, b) => 
      new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
    );

    for (let i = 0; i < sortedAttendances.length; i++) {
      const checkInDate = new Date(sortedAttendances[i].checkInTime);
      const daysDiff = Math.floor((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= i + 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    res.json({
      attendances,
      stats: {
        totalWorkouts,
        thisMonth,
        currentStreak,
      },
    });
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({
      error: 'Failed to get attendance history',
      message: 'Internal server error',
    });
  }
};

export const getCurrentStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // From auth middleware

    // Check if user has an active check-in
    const activeCheckIn = await prisma.attendance.findFirst({
      where: {
        userId,
        checkOutTime: null,
      },
      orderBy: {
        checkInTime: 'desc',
      },
    });

    res.json({
      isCheckedIn: !!activeCheckIn,
      activeSession: activeCheckIn || null,
    });
  } catch (error) {
    console.error('Get current status error:', error);
    res.status(500).json({
      error: 'Failed to get current status',
      message: 'Internal server error',
    });
  }
};