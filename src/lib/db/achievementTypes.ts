import type { Achievement } from '../../types';
import type {
  AchievementRow,
  UserAchievementRow,
} from './repositories/AchievementRepository';

export function mergeAchievements(
  achievementRows: AchievementRow[],
  userAchievementRows: UserAchievementRow[],
): Achievement[] {
  const unlockedMap = new Map<string, string>();
  for (const ua of userAchievementRows) {
    unlockedMap.set(ua.achievement_id, ua.unlocked_at);
  }

  return achievementRows.map(row => {
    const unlockedAt = unlockedMap.get(row.id);
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      points: row.points,
      icon: row.icon,
      isUnlocked: !!unlockedAt,
      unlockedAt: unlockedAt ?? undefined,
    };
  });
}
