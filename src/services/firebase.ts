
import { Platform } from 'react-native';
import { User, Project, Scan, ScanCalibration, ScanReferenceObject, ScanValidation } from '../types';

// ─── API Configuration ────────────────────────────────────────────────────────
// Override by setting EXPO_PUBLIC_API_BASE, e.g. http://192.168.1.20:3001/api
const API_BASE_OVERRIDE = process.env.EXPO_PUBLIC_API_BASE;
const DEFAULT_API_BASES: string[] = API_BASE_OVERRIDE
	? [API_BASE_OVERRIDE]
	: Platform.OS === 'web'
		? ['http://localhost:3001/api', 'http://127.0.0.1:3001/api']
		: Platform.OS === 'ios'
			? ['http://localhost:3001/api', 'http://127.0.0.1:3001/api']
			: ['http://10.0.2.2:3001/api', 'http://localhost:3001/api', 'http://127.0.0.1:3001/api'];
const REQUEST_TIMEOUT_MS = 6000;
let resolvedApiBase: string | null = null;

const TOKEN_KEY = '@seamclone_token';
const USER_KEY = '@seamclone_user';
const authListeners = new Set<(user: User | null) => void>();

// ─── Storage Adapter ─────────────────────────────────────────────────────────
// Some runtimes (web or mismatched native builds) can throw when AsyncStorage native module is unavailable.
type StorageLike = {
	getItem: (key: string) => Promise<string | null>;
	setItem: (key: string, value: string) => Promise<void>;
	removeItem: (key: string) => Promise<void>;
};

const memoryStorage = new Map<string, string>();

const createStorage = (): StorageLike => {
	if (Platform.OS === 'web' && typeof globalThis.localStorage !== 'undefined') {
		return {
			getItem: async (key: string) => globalThis.localStorage.getItem(key),
			setItem: async (key: string, value: string) => {
				globalThis.localStorage.setItem(key, value);
			},
			removeItem: async (key: string) => {
				globalThis.localStorage.removeItem(key);
			},
		};
	}

	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const AsyncStorageModule = require('@react-native-async-storage/async-storage').default;
		if (AsyncStorageModule && typeof AsyncStorageModule.getItem === 'function') {
			return AsyncStorageModule as StorageLike;
		}
	} catch {
		// Fallback below.
	}

	return {
		getItem: async (key: string) => memoryStorage.get(key) ?? null,
		setItem: async (key: string, value: string) => {
			memoryStorage.set(key, value);
		},
		removeItem: async (key: string) => {
			memoryStorage.delete(key);
		},
	};
};

const storage = createStorage();

const notifyAuthListeners = (user: User | null) => {
	authListeners.forEach((listener) => listener(user));
};

const mapScan = (scan: any): Scan => ({
	...scan,
	createdAt: new Date(scan.createdAt),
	updatedAt: new Date(scan.updatedAt),
});

// ─── HTTP helper ──────────────────────────────────────────────────────────────
const getToken = (): Promise<string | null> => storage.getItem(TOKEN_KEY);

const apiFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
	const token = await getToken();
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as Record<string, string>),
	};
	if (token) headers['Authorization'] = `Bearer ${token}`;

	const candidates = resolvedApiBase ? [resolvedApiBase] : DEFAULT_API_BASES;
	const failedBases: string[] = [];

	for (const base of candidates) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

		try {
			const res = await fetch(`${base}${path}`, {
				...options,
				headers,
				signal: controller.signal,
			});

			resolvedApiBase = base;
			return res;
		} catch {
			failedBases.push(base);
		} finally {
			clearTimeout(timeoutId);
		}
	}

	throw new Error(
		`Network request timed out. Could not reach backend. Tried: ${failedBases.join(', ')}. ` +
		`If using a physical phone, set EXPO_PUBLIC_API_BASE to your computer LAN IP (e.g. http://192.168.1.20:3001/api).`
	);
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
		await storage.setItem(TOKEN_KEY, data.token);
		await storage.setItem(USER_KEY, JSON.stringify(data.user));
		notifyAuthListeners(data.user as User);
		return data.user;
	},

	login: async (email: string, password: string) => {
		const res = await apiFetch('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || 'Login failed');
		await storage.setItem(TOKEN_KEY, data.token);
		await storage.setItem(USER_KEY, JSON.stringify(data.user));
		notifyAuthListeners(data.user as User);
		return data.user;
	},

	logout: async () => {
		 await storage.removeItem(TOKEN_KEY);
		 await storage.removeItem(USER_KEY);
		notifyAuthListeners(null);
	},

	getCurrentUser: async (): Promise<User | null> => {
		const raw = await storage.getItem(USER_KEY);
		if (!raw) return null;
		try {
			return JSON.parse(raw) as User;
		} catch {
			await storage.removeItem(USER_KEY);
			return null;
		}
	},

	// Called once on app start to restore session from stored token
	onAuthStateChanged: (callback: (user: User | null) => void) => {
		authListeners.add(callback);
		storage.getItem(USER_KEY)
			.then(async (raw) => {
				if (!raw) {
					callback(null);
					return;
				}

				try {
					callback(JSON.parse(raw) as User);
				} catch {
					// Corrupt cached session should not block app startup.
					await storage.removeItem(USER_KEY);
					await storage.removeItem(TOKEN_KEY);
					callback(null);
				}
			})
			.catch(() => {
				callback(null);
			});
		return () => {
			authListeners.delete(callback);
		};
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

// ─── Scan Service ─────────────────────────────────────────────────────────────
export const scanService = {
	createScan: async (payload: {
		projectId: string;
		rawImageUri: string;
		referenceObject: ScanReferenceObject;
		calibration: ScanCalibration;
		validation: ScanValidation;
	}): Promise<Scan> => {
		const res = await apiFetch('/scans', {
			method: 'POST',
			body: JSON.stringify(payload),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || 'Failed to create scan');
		return mapScan(data);
	},

	getScan: async (scanId: string): Promise<Scan> => {
		const res = await apiFetch(`/scans/${scanId}`);
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || 'Failed to fetch scan');
		return mapScan(data);
	},

	getProjectScans: async (projectId: string): Promise<Scan[]> => {
		const res = await apiFetch(`/scans/project/${projectId}`);
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || 'Failed to fetch project scans');
		return (data as any[]).map(mapScan);
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

