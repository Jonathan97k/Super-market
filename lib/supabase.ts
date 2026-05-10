// Stub: project uses PocketBase, not Supabase.
// This stub exists only so legacy storage helpers compile without the @supabase/supabase-js dependency.

type StubFileObject = { name: string; bucket?: string }

const notImplemented = (op: string) => {
  throw new Error(`Supabase ${op} is not available in this build (PocketBase is used instead).`)
}

export const supabase = {
  storage: {
    from(_bucket: string) {
      return {
        upload: async (_path: string, _file: Blob | File, _opts?: any) => {
          return { data: null, error: { message: 'Supabase storage not configured' } as any }
        },
        getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } }),
        remove: async (_paths: string[]) => ({ data: null, error: { message: 'Supabase storage not configured' } as any }),
        list: async (_path?: string) => ({ data: [] as StubFileObject[], error: null as any }),
      }
    },
    listBuckets: async () => ({ data: [] as { name: string }[], error: null as any }),
    createBucket: async (_name: string, _opts?: any) => ({ data: null, error: { message: 'Supabase storage not configured' } as any }),
  },
  from(_table: string) {
    return {
      select: () => ({ data: null, error: { message: 'Supabase DB not configured' } }),
      insert: () => ({ data: null, error: { message: 'Supabase DB not configured' } }),
      update: () => ({ data: null, error: { message: 'Supabase DB not configured' } }),
      delete: () => ({ data: null, error: { message: 'Supabase DB not configured' } }),
    }
  },
  auth: {
    getUser: async () => ({ data: { user: null }, error: null as any }),
    signInWithPassword: async (_: any) => notImplemented('signInWithPassword'),
    signOut: async () => ({ error: null as any }),
  },
}

export default supabase
