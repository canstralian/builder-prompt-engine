import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalCategories: number;
  totalAdmins: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      const [usersResult, postsResult, categoriesResult, adminsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('learn_posts').select('id', { count: 'exact', head: true }),
        supabase.from('learn_categories').select('id', { count: 'exact', head: true }),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
      ]);

      // Check for errors in any of the queries
      const errors = [usersResult.error, postsResult.error, categoriesResult.error, adminsResult.error].filter(Boolean);
      if (errors.length > 0) {
        throw new Error(`Failed to fetch admin stats: ${errors.map(e => e?.message).join(', ')}`);
      }

      return {
        totalUsers: usersResult.count ?? 0,
        totalPosts: postsResult.count ?? 0,
        totalCategories: categoriesResult.count ?? 0,
        totalAdmins: adminsResult.count ?? 0,
      };
    },
  });
}
