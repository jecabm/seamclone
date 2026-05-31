

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Project } from '../types';

// ─── API Configuration ────────────────────────────────────────────────────────
// Android emulator routes localhost through 10.0.2.2 to reach your host machine.
// Physical device: replace with your computer's LAN IP (run `ipconfig` → IPv4 Address)
// Production: replace with your deployed server URL
const API_BASE = 'http://10.0.2.2:3001/api';

const TOKEN_KEY = '@seamclone_token';
const USER_KEY = '@seamclone_user';

// ─── HTTP helper ──────────────────────────────────────────────────────────────
const getToken = (): Promise<string | null> => AsyncStorage.getItem(TOKEN_KEY);

const apiFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
	const token = await getToken();
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as Record<string, string>),
	};
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return fetch(`${API_BASE}${path}`, { ...options, headers });
};

// ─── Auth Service ─────────────────────────────────────────────────────────────
export const authService = {
	register: async (email: string, password: string, displayName?: string) => {
		const res = await apiFetch('/auth/register', {
			method: 'POST',
			body: JSON.stringify({ email, password, displayName }),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || 'Registration failed');
		await AsyncStorage.setItem(TOKEN_KEY, data.token);
		await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
		return data.user;
	},

	login: async (email: string, password: string) => {
		const res = await apiFetch('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || 'Login failed');
		await AsyncStorage.setItem(TOKEN_KEY, data.token);
		await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
		return data.user;
	},

	logout: async () => {
		 await AsyncStorage.removeItem(TOKEN_KEY);
		 await AsyncStorage.removeItem(USER_KEY);
	},

	getCurrentUser: async (): Promise<User | null> => {
		const raw = await AsyncStorage.getItem(USER_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as User;
	},

	// Called once on app start to restore session from stored token
	onAuthStateChanged: (callback: (user: User | null) => void) => {
		AsyncStorage.getItem(USER_KEY).then((raw) => {
			callback(raw ? (JSON.parse(raw) as User) : null);
		});
		return () => {};
	},
};

// ─── Database Service ─────────────────────────────────────────────────────────
// Exported as `firestoreService` for backward compatibility with existing screens
export const firestoreService = {
	getUserProfile: async (_userId: string): Promise<User | null> => {
		return authService.getCurrentUser();
	},

	createProject: async (
		_userId: string,
		projectData: Omit<Project, 'id' | 'userId'>
	): Promise<string> => {
		const res = await apiFetch('/projects', {
			method: 'POST',
			body: JSON.stringify(projectData),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || 'Failed to create project');
		return data.id;
	},

	getUserProjects: async (_userId: string): Promise<Project[]> => {
		const res = await apiFetch('/projects');
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || 'Failed to fetch projects');
		return (data as (Project & { createdAt: string; updatedAt: string })[]).map((p) => ({
			...p,
			createdAt: new Date(p.createdAt),
			updatedAt: new Date(p.updatedAt),
		}));
	},

	getProject: async (projectId: string): Promise<Project | null> => {
		const res = await apiFetch(`/projects/${projectId}`);
		if (res.status === 404) return null;
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || 'Failed to fetch project');
		return {
			...data,
			createdAt: new Date(data.createdAt),
			updatedAt: new Date(data.updatedAt),
		};
	},

	updateProject: async (projectId: string, updates: Partial<Project>): Promise<void> => {
		const res = await apiFetch(`/projects/${projectId}`, {
			method: 'PATCH',
			body: JSON.stringify(updates),
		});
		if (!res.ok) {
			const data = await res.json();
			throw new Error(data.message || 'Failed to update project');
		}
	},
};

// ─── Storage Service ──────────────────────────────────────────────────────────
export const storageService = {
	uploadImage: async (userId: string, projectId: string, imagePath: string) => {
		// TODO (Phase 2): POST multipart/form-data to /api/uploads
		console.log('Upload image (stub):', userId, projectId, imagePath);
	},

	downloadImage: async (path: string) => {
		console.log('Download image (stub):', path);
	},
};

