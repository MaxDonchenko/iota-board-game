import { format, differenceInSeconds } from 'date-fns';

export interface GameSession {
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export class DateUtils {
  static createSession(): GameSession {
    return {
      startTime: new Date(),
    };
  }

  static endSession(session: GameSession): GameSession {
    const endTime = new Date();
    const duration = differenceInSeconds(endTime, session.startTime);
    return {
      ...session,
      endTime,
      duration,
    };
  }

  static formatSessionDuration(session: GameSession): string {
    if (!session.duration) {
      return '0:00';
    }
    const minutes = Math.floor(session.duration / 60);
    const seconds = session.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  static formatDate(date: Date): string {
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  }
}

