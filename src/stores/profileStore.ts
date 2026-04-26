import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Student } from '@/types/database'

interface ProfileState {
  student: Student | null
  setStudent: (student: Student | null) => void
  updateStudent: (partial: Partial<Student>) => void
  clear: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      student: null,
      setStudent: (student) => set({ student }),
      updateStudent: (partial) =>
        set((state) => ({
          student: state.student ? { ...state.student, ...partial } : null,
        })),
      clear: () => set({ student: null }),
    }),
    { name: 'chess-trainer-profile' }
  )
)
