export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      academic_updates: {
        Row: {
          id: string
          title: string
          content: string
          category: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'academic_updates_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      buddy_connections: {
        Row: {
          id: string
          requester_id: string | null
          receiver_id: string | null
          status: 'pending' | 'accepted' | 'declined'
          created_at: string
        }
        Insert: {
          id?: string
          requester_id?: string | null
          receiver_id?: string | null
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
        }
        Update: {
          id?: string
          requester_id?: string | null
          receiver_id?: string | null
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'buddy_connections_requester_id_fkey'
            columns: ['requester_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'buddy_connections_receiver_id_fkey'
            columns: ['receiver_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      event_registrations: {
        Row: {
          event_id: string
          user_id: string
        }
        Insert: {
          event_id: string
          user_id: string
        }
        Update: {
          event_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'event_registrations_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'event_registrations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_date: string
          event_time: string | null
          location: string | null
          category: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_date: string
          event_time?: string | null
          location?: string | null
          category?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          location?: string | null
          category?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'events_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          user_id: string
          role: 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          group_id: string
          user_id: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          group_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'group_members_group_id_fkey'
            columns: ['group_id']
            isOneToOne: false
            referencedRelation: 'groups'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          creator_id: string | null
          is_interest_group: boolean
          member_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          creator_id?: string | null
          is_interest_group?: boolean
          member_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          creator_id?: string | null
          is_interest_group?: boolean
          member_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'groups_creator_id_fkey'
            columns: ['creator_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      lost_items: {
        Row: {
          id: string
          reporter_id: string | null
          title: string
          description: string | null
          location_found: string | null
          status: 'missing' | 'found' | 'claimed'
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id?: string | null
          title: string
          description?: string | null
          location_found?: string | null
          status?: 'missing' | 'found' | 'claimed'
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string | null
          title?: string
          description?: string | null
          location_found?: string | null
          status?: 'missing' | 'found' | 'claimed'
          image_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lost_items_reporter_id_fkey'
            columns: ['reporter_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      messages: {
        Row: {
          id: string
          sender_id: string | null
          receiver_id: string | null
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id?: string | null
          receiver_id?: string | null
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string | null
          receiver_id?: string | null
          content?: string
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_receiver_id_fkey'
            columns: ['receiver_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      notes: {
        Row: {
          id: string
          author_id: string | null
          title: string
          subject: string
          file_url: string
          file_size_bytes: number | null
          downloads_count: number
          created_at: string
        }
        Insert: {
          id?: string
          author_id?: string | null
          title: string
          subject: string
          file_url: string
          file_size_bytes?: number | null
          downloads_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string | null
          title?: string
          subject?: string
          file_url?: string
          file_size_bytes?: number | null
          downloads_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notes_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      peer_tutors: {
        Row: {
          id: string
          user_id: string | null
          subjects: string[] | null
          rating: number
          total_sessions: number
          is_available: boolean
          bio: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          subjects?: string[] | null
          rating?: number
          total_sessions?: number
          is_available?: boolean
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          subjects?: string[] | null
          rating?: number
          total_sessions?: number
          is_available?: boolean
          bio?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'peer_tutors_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      post_likes: {
        Row: {
          post_id: string
          user_id: string
        }
        Insert: {
          post_id: string
          user_id: string
        }
        Update: {
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'post_likes_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'post_likes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      posts: {
        Row: {
          id: string
          author_id: string | null
          content: string
          likes_count: number
          comments_count: number
          created_at: string
        }
        Insert: {
          id?: string
          author_id?: string | null
          content: string
          likes_count?: number
          comments_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string | null
          content?: string
          likes_count?: number
          comments_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'posts_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          year_group:
            | 'Year 7'
            | 'Year 8'
            | 'Year 9'
            | 'Year 10'
            | 'Year 11'
            | 'Year 12'
            | null
          house: string | null
          student_id: string | null
          class_teacher: string | null
          subjects: string[] | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          year_group?:
            | 'Year 7'
            | 'Year 8'
            | 'Year 9'
            | 'Year 10'
            | 'Year 11'
            | 'Year 12'
            | null
          house?: string | null
          student_id?: string | null
          class_teacher?: string | null
          subjects?: string[] | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          year_group?:
            | 'Year 7'
            | 'Year 8'
            | 'Year 9'
            | 'Year 10'
            | 'Year 11'
            | 'Year 12'
            | null
          house?: string | null
          student_id?: string | null
          class_teacher?: string | null
          subjects?: string[] | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      study_buddy_profiles: {
        Row: {
          id: string
          user_id: string | null
          academic_level: string | null
          subjects_studying: string[] | null
          subjects_needing_help: string[] | null
          study_styles: string[] | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          academic_level?: string | null
          subjects_studying?: string[] | null
          subjects_needing_help?: string[] | null
          study_styles?: string[] | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          academic_level?: string | null
          subjects_studying?: string[] | null
          subjects_needing_help?: string[] | null
          study_styles?: string[] | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'study_buddy_profiles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      suggestions: {
        Row: {
          id: string
          category: string
          content: string
          is_anonymous: boolean
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          content: string
          is_anonymous?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          content?: string
          is_anonymous?: boolean
          created_at?: string
        }
        Relationships: []
      }
      tutor_bookings: {
        Row: {
          id: string
          tutor_id: string | null
          student_id: string | null
          subject: string
          topic: string | null
          scheduled_date: string | null
          duration_minutes: number | null
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id?: string | null
          student_id?: string | null
          subject: string
          topic?: string | null
          scheduled_date?: string | null
          duration_minutes?: number | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string | null
          student_id?: string | null
          subject?: string
          topic?: string | null
          scheduled_date?: string | null
          duration_minutes?: number | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tutor_bookings_tutor_id_fkey'
            columns: ['tutor_id']
            isOneToOne: false
            referencedRelation: 'peer_tutors'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tutor_bookings_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ----------------------------------------------------------------
// Helper types — convenience aliases for the most-used Row shapes
// ----------------------------------------------------------------

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type LostItem = Database['public']['Tables']['lost_items']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type StudyBuddyProfile =
  Database['public']['Tables']['study_buddy_profiles']['Row']
export type PeerTutor = Database['public']['Tables']['peer_tutors']['Row']
