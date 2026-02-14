
import { User, Role } from '../types';

// Mock database simulation
const USERS_KEY = 'yusra_users_db';
const CREATOR_EMAIL = 'shaoncmd@gmail.com';
const CREATOR_PASS = 'BadSoul@1989';

// Helper to get raw users
const getRawUsers = (): any[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper to save users
const saveRawUsers = (users: any[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const login = async (email: string, pass: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 1. Check Creator Credentials
      if (email === CREATOR_EMAIL && pass === CREATOR_PASS) {
        resolve({
          id: 'creator-001',
          email: CREATOR_EMAIL,
          name: 'Mohammad Maynul Hasan Shaon',
          role: Role.CREATOR,
          photoUrl: 'https://ui-avatars.com/api/?name=Shaon+Cmd&background=00f2ff&color=000',
          plan: 'quantum'
        });
        return;
      }

      // 2. Check Local Storage Users
      const users = getRawUsers();
      const user = users.find((u: any) => u.email === email && u.password === pass);

      if (user) {
        const { password, ...safeUser } = user;
        resolve(safeUser);
      } else {
        reject(new Error("Invalid credentials. Access Denied."));
      }
    }, 1500); // Simulate network delay
  });
};

export const register = async (name: string, email: string, pass: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === CREATOR_EMAIL) {
         reject(new Error("This email is reserved for system administration."));
         return;
      }

      const users = getRawUsers();
      if (users.find((u: any) => u.email === email)) {
        reject(new Error("User already exists within the Quantum Network."));
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: pass, // In a real app, hash this!
        role: Role.USER,
        plan: 'free',
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      };

      users.push(newUser);
      saveRawUsers(users);

      const { password, ...safeUser } = newUser;
      resolve(safeUser as User);
    }, 1500);
  });
};

export const googleLogin = async (): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: 'google-' + Date.now(),
                email: 'user@gmail.com',
                name: 'Google User',
                role: Role.USER,
                plan: 'free',
                photoUrl: 'https://lh3.googleusercontent.com/a/default-user'
            })
        }, 2000);
    })
}

export const recoverAccount = async (email: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`Recovery quantum key sent to ${email}`);
        }, 1000);
    });
};

// --- Creator Tools ---

export const getAllUsers = async (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getRawUsers().map(({ password, ...u }) => u as User);
      resolve(users);
    }, 500);
  });
};

export const updateUserPlan = async (userId: string, newPlan: 'free' | 'pro' | 'quantum'): Promise<void> => {
  return new Promise((resolve) => {
    const users = getRawUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].plan = newPlan;
      saveRawUsers(users);
    }
    resolve();
  });
};

// Generic update for profile details (Photo, Name, Role, Plan)
export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  return new Promise((resolve, reject) => {
      const users = getRawUsers();
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
          users[idx] = { ...users[idx], ...updates };
          saveRawUsers(users);
          const { password, ...safeUser } = users[idx];
          resolve(safeUser);
      } else {
          reject(new Error("User not found"));
      }
  });
};

export const deleteUser = async (userId: string): Promise<void> => {
   return new Promise((resolve) => {
      const users = getRawUsers();
      const filtered = users.filter(u => u.id !== userId);
      saveRawUsers(filtered);
      resolve();
   });
};