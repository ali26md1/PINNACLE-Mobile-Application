import axios from 'axios';

// Use Expo's public environment variables
// Defaults to the hardcoded IP if the environment variable is not set
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'http://192.168.0.112:8001';
const API = BASE_URL + '/api';

const client = axios.create({
  baseURL: API,
  withCredentials: true,
  timeout: 10000,
});

// Token stored in memory (set after login)
let authToken = null;
export const setAuthToken = (token) => { authToken = token; };
export const clearAuthToken = () => { authToken = null; };

client.interceptors.request.use(config => {
  if (authToken) config.headers['Authorization'] = `Bearer ${authToken}`;
  return config;
});

const fmtError = (e) => {
  const detail = e?.response?.data?.detail;
  if (!detail) return e?.message || 'Something went wrong';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(d => d?.msg || JSON.stringify(d)).join(', ');
  return String(detail);
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const apiLogin = async (email, password) => {
  try {
    const { data } = await client.post('/auth/login', { email, password });
    return { success: true, data };
  } catch (e) { return { success: false, error: fmtError(e) }; }
};

export const apiRegister = async (name, email, password, role) => {
  try {
    const { data } = await client.post('/auth/register', { name, email, password, role });
    return { success: true, data };
  } catch (e) { return { success: false, error: fmtError(e) }; }
};

export const apiLogout = async () => {
  try { await client.post('/auth/logout'); } catch {}
};

export const apiMe = async () => {
  try {
    const { data } = await client.get('/auth/me');
    return { success: true, data };
  } catch (e) { return { success: false, error: fmtError(e) }; }
};

// ── Courses ───────────────────────────────────────────────────────────────────
export const apiGetCourses = async () => {
  const { data } = await client.get('/courses');
  return data;
};

export const apiCreateCourse = async (payload) => {
  const { data } = await client.post('/courses', payload);
  return data;
};

export const apiDeleteCourse = async (id) => {
  await client.delete(`/courses/${id}`);
};

// ── Enrollments ───────────────────────────────────────────────────────────────
export const apiGetEnrollments = async () => {
  const { data } = await client.get('/enrollments');
  return data;
};

export const apiEnrollFree = async (course_id) => {
  const { data } = await client.post('/enrollments', { course_id });
  return data;
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const apiGetPayments = async () => {
  const { data } = await client.get('/payments');
  return data;
};

export const apiPayCourse = async (payload) => {
  const { data } = await client.post('/payments', payload);
  return data;
};

export const apiRefund = async (pid) => {
  const { data } = await client.put(`/payments/${pid}/refund`);
  return data;
};

// ── Assignments ───────────────────────────────────────────────────────────────
export const apiGetAssignments = async (course_id) => {
  const params = course_id ? { course_id } : {};
  const { data } = await client.get('/assignments', { params });
  return data;
};

export const apiCreateAssignment = async (payload) => {
  const { data } = await client.post('/assignments', payload);
  return data;
};

export const apiSubmitAssignment = async (assignment_id, content) => {
  const { data } = await client.post('/assignments/submit', { assignment_id, content });
  return data;
};

export const apiGetSubmissions = async (assignment_id) => {
  const { data } = await client.get(`/assignments/${assignment_id}/submissions`);
  return data;
};

export const apiGradeSubmission = async (submission_id, grade, feedback) => {
  const { data } = await client.post('/assignments/grade', { submission_id, grade, feedback });
  return data;
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const apiGetNotifications = async () => {
  const { data } = await client.get('/notifications');
  return data;
};

export const apiMarkRead = async (id) => {
  await client.put(`/notifications/${id}/read`);
};

export const apiSendNotification = async (title, message) => {
  const { data } = await client.post('/notifications', { title, message });
  return data;
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const apiStudentAnalytics = async (student_id) => {
  const { data } = await client.get(`/analytics/student/${student_id}`);
  return data;
};

export const apiDashboardAnalytics = async () => {
  const { data } = await client.get('/analytics/dashboard');
  return data;
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const apiGetAttendance = async (params = {}) => {
  const { data } = await client.get('/attendance', { params });
  return data;
};

export const apiMarkBulkAttendance = async (payload) => {
  const { data } = await client.post('/attendance/bulk', payload);
  return data;
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const apiGetUsers = async () => {
  const { data } = await client.get('/users');
  return data;
};

export const apiDeleteUser = async (id) => {
  await client.delete(`/users/${id}`);
};
