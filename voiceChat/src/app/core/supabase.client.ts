import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://yublnlwgsacateiatolf.supabase.co',
  'sb_publishable_c-fD4dKbV0ZD1dViI6_ZUA_OQyIHreg',
  {
    auth: {
      lock: undefined,
      autoRefreshToken: true,
      persistSession: true,
    }
  }
)