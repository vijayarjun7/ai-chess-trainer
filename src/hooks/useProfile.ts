'use client'

import { useEffect } from 'react'
import { useProfileStore } from '@/stores/profileStore'
import { createClient } from '@/lib/supabase/client'

export function useProfile() {
  const { student, setStudent, clear } = useProfileStore()

  useEffect(() => {
    if (student) return  // already loaded

    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return clear()

      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) setStudent(data)
    })
  }, [student, setStudent, clear])

  return { student, isLoading: !student }
}
