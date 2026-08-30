export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: 'google' | 'apple' | 'password' | 'guest';
  savedPromptIds: string[];
  createdAt?: number;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
}
