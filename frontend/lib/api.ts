import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth endpoints
export const authApi = {
    login: (email: string, password: string) =>
        axiosInstance.post('/auth/login', { email, password }),
    register: (data: any) => axiosInstance.post('/auth/register', data),
    getProfile: () => axiosInstance.get('/auth/profile'),
    getMe: () => axiosInstance.get('/auth/me'),
};

// Tenants endpoints
export const tenantsApi = {
    getAll: () => axiosInstance.get('/tenants'),
    getOne: (id: string) => axiosInstance.get(`/tenants/${id}`),
    create: (data: any) => axiosInstance.post('/tenants', data),
    update: (id: string, data: any) => axiosInstance.patch(`/tenants/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/tenants/${id}`),
};

// Branches endpoints
export const branchesApi = {
    getAll: (tenantId?: string) =>
        axiosInstance.get('/branches', { params: { tenant_id: tenantId } }),
    getOne: (id: string) => axiosInstance.get(`/branches/${id}`),
    create: (data: any) => axiosInstance.post('/branches', data),
    update: (id: string, data: any) => axiosInstance.patch(`/branches/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/branches/${id}`),
};

// Ministries endpoints
export const ministriesApi = {
    getAll: (tenantId?: string, branchId?: string) =>
        axiosInstance.get('/ministries', { params: { tenant_id: tenantId, branch_id: branchId } }),
    getOne: (id: string) => axiosInstance.get(`/ministries/${id}`),
    create: (data: any) => axiosInstance.post('/ministries', data),
    update: (id: string, data: any) => axiosInstance.patch(`/ministries/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/ministries/${id}`),
    addMember: (id: string, userId: string) => axiosInstance.post(`/ministries/${id}/members/${userId}`),
    removeMember: (id: string, userId: string) => axiosInstance.delete(`/ministries/${id}/members/${userId}`),
};

// Templates endpoints
export const templatesApi = {
    getAll: (category?: string) =>
        axiosInstance.get('/studio/templates', { params: { category } }),
    getOne: (id: string) => axiosInstance.get(`/studio/templates/${id}`),
    create: (data: any) => axiosInstance.post('/studio/templates', data),
    update: (id: string, data: any) => axiosInstance.patch(`/studio/templates/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/studio/templates/${id}`),
    injectData: (id: string, data: any) =>
        axiosInstance.post(`/studio/templates/${id}/inject`, data),
};

// Designs endpoints
export const designsApi = {
    getAll: (tenantId?: string, status?: string) =>
        axiosInstance.get('/studio/designs', { params: { tenant_id: tenantId, status } }),
    getOne: (id: string) => axiosInstance.get(`/studio/designs/${id}`),
    create: (data: any) => axiosInstance.post('/studio/designs', data),
    update: (id: string, data: any) => axiosInstance.patch(`/studio/designs/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/studio/designs/${id}`),
    approve: (id: string) => axiosInstance.post(`/studio/designs/${id}/approve`),
    addExport: (id: string, format: string, url: string) =>
        axiosInstance.post(`/studio/designs/${id}/export`, { format, url }),
};

// Events endpoints
export const eventsApi = {
    getAll: (params?: any) => axiosInstance.get('/events', { params }),
    getOne: (id: string) => axiosInstance.get(`/events/${id}`),
    create: (data: any) => axiosInstance.post('/events', data),
    update: (id: string, data: any) => axiosInstance.patch(`/events/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/events/${id}`),
    linkDesign: (id: string, designId: string) =>
        axiosInstance.post(`/events/${id}/link-design/${designId}`),
};

// Consolidated API export
// Families endpoints
const familiesApi = {
    getAll: () => axiosInstance.get('/families'),
    getOne: (id: string) => axiosInstance.get(`/families/${id}`),
    create: (data: any) => axiosInstance.post('/families', data),
    update: (id: string, data: any) => axiosInstance.patch(`/families/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/families/${id}`),
    getMembers: (id: string) => axiosInstance.get(`/families/${id}/members`),
};

// Finance endpoints
const financeApi = {
    getProjects: () => axiosInstance.get('/finance/projects'),
    getHistory: () => axiosInstance.get('/finance/history'),
    getStats: () => axiosInstance.get('/finance/stats'),
    giveMpesa: (data: { amount: number; phone: string; type: string; project_id?: string }) =>
        axiosInstance.post('/finance/give/mpesa', data),
    createProject: (data: any) => axiosInstance.post('/finance/projects', data),
};

// Crisis & Outreach endpoints
const crisisApi = {
    getActive: () => axiosInstance.get('/outreach/crisis/active'),
    report: (data: any) => axiosInstance.post('/outreach/crisis/report', data),
    getMatches: (id: string) => axiosInstance.get(`/outreach/crisis/${id}/matches`),
    updateStatus: (id: string, data: { status: string, notes?: string }) =>
        axiosInstance.patch(`/outreach/crisis/${id}/status`, data),
};

export const api = {
    auth: authApi,
    // ...
    outreach: {
        crisis: {
            list: crisisApi.getActive,
            report: crisisApi.report,
            matches: crisisApi.getMatches,
            update: crisisApi.updateStatus,
        },
    },
    // ...
    finance: {
        projects: financeApi.getProjects,
        history: financeApi.getHistory,
        stats: financeApi.getStats,
        give: financeApi.giveMpesa,
        createProject: financeApi.createProject,
    },
    // ...
    families: {
        list: familiesApi.getAll,
        get: familiesApi.getOne,
        create: familiesApi.create,
        update: familiesApi.update,
        delete: familiesApi.delete,
        members: familiesApi.getMembers,
    },
    tenants: {
        list: tenantsApi.getAll,
        get: tenantsApi.getOne,
        create: tenantsApi.create,
        update: tenantsApi.update,
        delete: tenantsApi.delete,
    },
    branches: {
        list: branchesApi.getAll,
        get: branchesApi.getOne,
        create: branchesApi.create,
        update: branchesApi.update,
        delete: branchesApi.delete,
    },
    ministries: {
        list: ministriesApi.getAll,
        get: ministriesApi.getOne,
        create: ministriesApi.create,
        update: ministriesApi.update,
        delete: ministriesApi.delete,
        addMember: ministriesApi.addMember,
        removeMember: ministriesApi.removeMember,
    },
    templates: {
        list: templatesApi.getAll,
        get: templatesApi.getOne,
        create: templatesApi.create,
        update: templatesApi.update,
        delete: templatesApi.delete,
        inject: templatesApi.injectData
    },
    designs: {
        list: designsApi.getAll,
        get: designsApi.getOne,
        create: designsApi.create,
        update: designsApi.update,
        delete: designsApi.delete,
    },
    events: {
        list: eventsApi.getAll,
        get: eventsApi.getOne,
        create: eventsApi.create,
        update: eventsApi.update,
        delete: eventsApi.delete,
    }
};

export default axiosInstance;
