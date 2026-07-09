import { supabase } from '../../supabase';

export interface AchievementRow {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
}

export interface UserAchievementRow {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export class AchievementRepository {
  async getAchievements(): Promise<AchievementRow[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return data as AchievementRow[];
  }

  async getUserAchievements(userId: string): Promise<UserAchievementRow[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data as UserAchievementRow[];
  }

  async unlockAchievement(
    userId: string,
    achievementId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('user_achievements')
      .upsert(
        { user_id: userId, achievement_id: achievementId },
        { onConflict: 'user_id, achievement_id', ignoreDuplicates: true },
      );

    if (error) throw error;
  }
}
