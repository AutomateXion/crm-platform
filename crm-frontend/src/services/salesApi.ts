import axios from 'axios';

const salesApi = axios.create({
  baseURL: '/sales-api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

salesApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

salesApi.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const productsApi = {
  getAll: (params?: any) => salesApi.get('/sales/products', { params }),
  getOne: (id: string) => salesApi.get(`/sales/products/${id}`),
  create: (data: any) => salesApi.post('/sales/products', data),
  update: (id: string, data: any) => salesApi.put(`/sales/products/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/products/${id}`),
};

export const stockApi = {
  getMovements: (params?: any) => salesApi.get('/sales/stock-movements', { params }),
  adjust: (data: any) => salesApi.post('/sales/stock-adjustments', data),
};

export const exchangeRatesApi = {
  getAll: () => salesApi.get('/sales/exchange-rates'),
  create: (data: any) => salesApi.post('/sales/exchange-rates', data),
  update: (id: string, data: any) => salesApi.put(`/sales/exchange-rates/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/exchange-rates/${id}`),
};

export const quotationsApi = {
  getAll: (params?: any) => salesApi.get('/sales/quotations', { params }),
  getOne: (id: string) => salesApi.get(`/sales/quotations/${id}`),
  create: (data: any) => salesApi.post('/sales/quotations', data),
  update: (id: string, data: any) => salesApi.put(`/sales/quotations/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/quotations/${id}`),
  convertToDN: (id: string) => salesApi.post(`/sales/quotations/${id}/convert-to-dn`),
};

export const deliveryNotesApi = {
  getAll: (params?: any) => salesApi.get('/sales/delivery-notes', { params }),
  getOne: (id: string) => salesApi.get(`/sales/delivery-notes/${id}`),
  create: (data: any) => salesApi.post('/sales/delivery-notes', data),
  update: (id: string, data: any) => salesApi.put(`/sales/delivery-notes/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/delivery-notes/${id}`),
  convertToInvoice: (id: string) => salesApi.post(`/sales/delivery-notes/${id}/convert-to-invoice`),
};

export const invoicesApi = {
  getAll: (params?: any) => salesApi.get('/sales/invoices', { params }),
  getOne: (id: string) => salesApi.get(`/sales/invoices/${id}`),
  create: (data: any) => salesApi.post('/sales/invoices', data),
  update: (id: string, data: any) => salesApi.put(`/sales/invoices/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/invoices/${id}`),
};

export const receiptsApi = {
  getAll: (params?: any) => salesApi.get('/sales/receipts', { params }),
  create: (data: any) => salesApi.post('/sales/receipts', data),
  update: (id: string, data: any) => salesApi.put(`/sales/receipts/${id}`, data),
  post: (id: string) => salesApi.post(`/sales/receipts/${id}/post`),
  delete: (id: string) => salesApi.delete(`/sales/receipts/${id}`),
};

export const salesReturnsApi = {
  getAll: (params?: any) => salesApi.get('/sales/returns', { params }),
  getOne: (id: string) => salesApi.get(`/sales/returns/${id}`),
  create: (data: any) => salesApi.post('/sales/returns', data),
  update: (id: string, data: any) => salesApi.put(`/sales/returns/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/returns/${id}`),
};

export const salesDashboardApi = {
  get: () => salesApi.get('/sales/dashboard'),
};

export default salesApi;

export const suppliersApi = {
  getAll: (params?: any) => salesApi.get('/sales/suppliers', { params }),
  getOne: (id: string) => salesApi.get(`/sales/suppliers/${id}`),
  create: (data: any) => salesApi.post('/sales/suppliers', data),
  update: (id: string, data: any) => salesApi.put(`/sales/suppliers/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/suppliers/${id}`),
};

export const purchaseOrdersApi = {
  getAll: (params?: any) => salesApi.get('/sales/purchase-orders', { params }),
  getOne: (id: string) => salesApi.get(`/sales/purchase-orders/${id}`),
  create: (data: any) => salesApi.post('/sales/purchase-orders', data),
  update: (id: string, data: any) => salesApi.put(`/sales/purchase-orders/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/purchase-orders/${id}`),
};

export const rfqApi = {
  getAll: (params?: any) => salesApi.get('/sales/rfqs', { params }),
  getOne: (id: string) => salesApi.get(`/sales/rfqs/${id}`),
  create: (data: any) => salesApi.post('/sales/rfqs', data),
  update: (id: string, data: any) => salesApi.put(`/sales/rfqs/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/rfqs/${id}`),
  cancel: (id: string) => salesApi.patch(`/sales/rfqs/${id}/cancel`),
};

export const grnsApi = {
  getAll: (params?: any) => salesApi.get('/sales/grns', { params }),
  getOne: (id: string) => salesApi.get(`/sales/grns/${id}`),
  create: (data: any) => salesApi.post('/sales/grns', data),
  update: (id: string, data: any) => salesApi.put(`/sales/grns/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/grns/${id}`),
  convertToInvoice: (id: string) => salesApi.post(`/sales/grns/${id}/convert-to-invoice`),
};

export const purchaseInvoicesApi = {
  getAll: (params?: any) => salesApi.get('/sales/purchase-invoices', { params }),
  getOne: (id: string) => salesApi.get(`/sales/purchase-invoices/${id}`),
  create: (data: any) => salesApi.post('/sales/purchase-invoices', data),
  update: (id: string, data: any) => salesApi.put(`/sales/purchase-invoices/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/purchase-invoices/${id}`),
};

export const paymentVouchersApi = {
  getAll: (params?: any) => salesApi.get('/sales/payment-vouchers', { params }),
  getOne: (id: string) => salesApi.get(`/sales/payment-vouchers/${id}`),
  create: (data: any) => salesApi.post('/sales/payment-vouchers', data),
  update: (id: string, data: any) => salesApi.put(`/sales/payment-vouchers/${id}`, data),
  post: (id: string) => salesApi.post(`/sales/payment-vouchers/${id}/post`),
  delete: (id: string) => salesApi.delete(`/sales/payment-vouchers/${id}`),
};

export const purchaseReturnsApi = {
  getAll: (params?: any) => salesApi.get('/sales/purchase-returns', { params }),
  getOne: (id: string) => salesApi.get(`/sales/purchase-returns/${id}`),
  create: (data: any) => salesApi.post('/sales/purchase-returns', data),
  update: (id: string, data: any) => salesApi.put(`/sales/purchase-returns/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/purchase-returns/${id}`),
};

export const warehousesApi = {
  getAll: (params?: any) => salesApi.get('/sales/warehouses', { params }),
  create: (data: any) => salesApi.post('/sales/warehouses', data),
  update: (id: string, data: any) => salesApi.put(`/sales/warehouses/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/warehouses/${id}`),
};

export const warehouseLocationsApi = {
  getAll: (params?: any) => salesApi.get('/sales/warehouse-locations', { params }),
  create: (data: any) => salesApi.post('/sales/warehouse-locations', data),
  update: (id: string, data: any) => salesApi.put(`/sales/warehouse-locations/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/warehouse-locations/${id}`),
};

export const stockTransfersApi = {
  getAll: (params?: any) => salesApi.get('/sales/stock-transfers', { params }),
  getOne: (id: string) => salesApi.get(`/sales/stock-transfers/${id}`),
  create: (data: any) => salesApi.post('/sales/stock-transfers', data),
  update: (id: string, data: any) => salesApi.put(`/sales/stock-transfers/${id}`, data),
  confirm: (id: string) => salesApi.post(`/sales/stock-transfers/${id}/confirm`),
  delete: (id: string) => salesApi.delete(`/sales/stock-transfers/${id}`),
};

export const stockAdjustmentsApi = {
  getAll: (params?: any) => salesApi.get('/sales/stock-adjustments', { params }),
  getOne: (id: string) => salesApi.get(`/sales/stock-adjustments/${id}`),
  create: (data: any) => salesApi.post('/sales/stock-adjustments', data),
  update: (id: string, data: any) => salesApi.put(`/sales/stock-adjustments/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/stock-adjustments/${id}`),
};

export const grnApi = {
  getAll: (params?: any) => salesApi.get('/sales/grns', { params }),
  getOne: (id: string) => salesApi.get(`/sales/grns/${id}`),
  create: (data: any) => salesApi.post('/sales/grns', data),
  update: (id: string, data: any) => salesApi.put(`/sales/grns/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/grns/${id}`),
};

export const updateStatus = {
  quotation: (id: string, status: string) => salesApi.patch(`/sales/quotations/${id}/status`, { status }),
  deliveryNote: (id: string, status: string) => salesApi.patch(`/sales/delivery-notes/${id}/status`, { status }),
  invoice: (id: string, status: string) => salesApi.patch(`/sales/invoices/${id}/status`, { status }),
  purchaseOrder: (id: string, status: string) => salesApi.patch(`/sales/purchase-orders/${id}/status`, { status }),
  grn: (id: string, status: string) => salesApi.patch(`/sales/grns/${id}/status`, { status }),
  purchaseInvoice: (id: string, status: string) => salesApi.patch(`/sales/purchase-invoices/${id}/status`, { status }),
};

export const signaturesApi = {
  getStatus: (docType: string) => salesApi.get('/sales/signatures/status', { params: { docType } }),
  getOne: (docType: string, docId: string) => salesApi.get(`/sales/signatures/${docType}/${docId}`),
  signInPerson: (data: any) => salesApi.post('/sales/signatures/in-person', data),
};
export const bankAccountsApi = {
  getAll: () => salesApi.get('/sales/bank-accounts'),
  getOne: (id: string) => salesApi.get(`/sales/bank-accounts/${id}`),
  create: (data: any) => salesApi.post('/sales/bank-accounts', data),
  update: (id: string, data: any) => salesApi.put(`/sales/bank-accounts/${id}`, data),
  delete: (id: string) => salesApi.delete(`/sales/bank-accounts/${id}`),
};
export const chequeBooksApi = {
  getAll: (bankAccountId?: string) => salesApi.get('/sales/cheque-books', { params: { bankAccountId } }),
  create: (data: any) => salesApi.post('/sales/cheque-books', data),
  updateStatus: (id: string, status: string) => salesApi.put(`/sales/cheque-books/${id}/status`, { status }),
  delete: (id: string) => salesApi.delete(`/sales/cheque-books/${id}`),
};
export const chequeLeavesApi = {
  getAll: (params?: any) => salesApi.get('/sales/cheque-leaves', { params }),
  getNext: (bankAccountId: string) => salesApi.get('/sales/cheque-leaves/next', { params: { bankAccountId } }),
  void: (id: string, reason: string) => salesApi.put(`/sales/cheque-leaves/${id}/void`, { reason }),
  realize: (id: string, date: string) => salesApi.put(`/sales/cheque-leaves/${id}/realize`, { date }),
  reconcile: (id: string, date: string) => salesApi.put(`/sales/cheque-leaves/${id}/reconcile`, { date }),
};

export const pdcChequesApi = {
  getAll: (params?: any) => salesApi.get('/sales/pdc-cheques', { params }),
  getDueCount: () => salesApi.get('/sales/pdc-cheques/due-count'),
  deposit: (receiptIds: string[], bankAccountId?: string) => salesApi.post('/sales/pdc-cheques/deposit', { receiptIds, bankAccountId }),
};

export const recurringApi = {
  getAll: () => salesApi.get('/sales/recurring-expenses'),
  getOne: (id) => salesApi.get(`/sales/recurring-expenses/${id}`),
  create: (data) => salesApi.post('/sales/recurring-expenses', data),
  update: (id, data) => salesApi.put(`/sales/recurring-expenses/${id}`, data),
  remove: (id) => salesApi.delete(`/sales/recurring-expenses/${id}`),
  generateDue: () => salesApi.post('/sales/recurring-expenses/generate-due'),
  dueCount: () => salesApi.get('/sales/recurring-expenses/due-count'),
  log: (id) => salesApi.get(`/sales/recurring-expenses/${id}/log`),
};
