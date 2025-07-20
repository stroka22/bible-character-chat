/**
 * Supabase Client Stub
 * 
 * This is a placeholder implementation that mimics the Supabase client API
 * without actually connecting to a Supabase instance. It's used for development
 * and testing purposes when a real Supabase connection is not needed or available.
 */

// Mock response generator
const createMockResponse = (data = []) => ({
  data,
  error: null,
  count: data.length,
  status: 200,
  statusText: 'OK'
});

// Mock query builder
class QueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.filters = [];
    this.selectedFields = '*';
    this.limitValue = null;
    this.orderByField = null;
    this.orderDirection = null;
  }

  select(fields) {
    this.selectedFields = fields;
    return this;
  }

  eq(field, value) {
    this.filters.push({ field, value, operator: 'eq' });
    return this;
  }

  neq(field, value) {
    this.filters.push({ field, value, operator: 'neq' });
    return this;
  }

  gt(field, value) {
    this.filters.push({ field, value, operator: 'gt' });
    return this;
  }

  lt(field, value) {
    this.filters.push({ field, value, operator: 'lt' });
    return this;
  }

  gte(field, value) {
    this.filters.push({ field, value, operator: 'gte' });
    return this;
  }

  lte(field, value) {
    this.filters.push({ field, value, operator: 'lte' });
    return this;
  }

  like(field, value) {
    this.filters.push({ field, value, operator: 'like' });
    return this;
  }

  ilike(field, value) {
    this.filters.push({ field, value, operator: 'ilike' });
    return this;
  }

  is(field, value) {
    this.filters.push({ field, value, operator: 'is' });
    return this;
  }

  in(field, values) {
    this.filters.push({ field, value: values, operator: 'in' });
    return this;
  }

  contains(field, value) {
    this.filters.push({ field, value, operator: 'contains' });
    return this;
  }

  containedBy(field, value) {
    this.filters.push({ field, value, operator: 'containedBy' });
    return this;
  }

  limit(count) {
    this.limitValue = count;
    return this;
  }

  order(field, { ascending } = { ascending: true }) {
    this.orderByField = field;
    this.orderDirection = ascending ? 'asc' : 'desc';
    return this;
  }

  single() {
    return Promise.resolve(createMockResponse(null));
  }

  maybeSingle() {
    return Promise.resolve(createMockResponse(null));
  }

  async insert(data) {
    console.log(`[MOCK] Inserting into ${this.tableName}:`, data);
    return createMockResponse([{ id: `mock-id-${Date.now()}`, ...data }]);
  }

  async update(data) {
    console.log(`[MOCK] Updating ${this.tableName}:`, data);
    return createMockResponse([{ ...data }]);
  }

  async delete() {
    console.log(`[MOCK] Deleting from ${this.tableName} with filters:`, this.filters);
    return createMockResponse([]);
  }

  async execute() {
    console.log(`[MOCK] Executing query on ${this.tableName} with filters:`, this.filters);
    return createMockResponse([]);
  }
}

// Mock Supabase client
const supabaseClient = {
  from: (tableName) => new QueryBuilder(tableName),
  
  auth: {
    signUp: ({ email, password }) => {
      console.log(`[MOCK] Sign up with email: ${email}`);
      return Promise.resolve(createMockResponse({ user: { id: `user-${Date.now()}`, email }, session: null }));
    },
    signIn: ({ email, password }) => {
      console.log(`[MOCK] Sign in with email: ${email}`);
      return Promise.resolve(createMockResponse({ user: { id: `user-${Date.now()}`, email }, session: { access_token: 'mock-token' } }));
    },
    signOut: () => {
      console.log('[MOCK] Sign out');
      return Promise.resolve(createMockResponse());
    },
    getSession: () => {
      console.log('[MOCK] Get session');
      return Promise.resolve(createMockResponse({ session: { access_token: 'mock-token' } }));
    },
    onAuthStateChange: (callback) => {
      console.log('[MOCK] Auth state change listener registered');
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  
  storage: {
    from: (bucketName) => ({
      upload: (path, file) => {
        console.log(`[MOCK] Uploading file to ${bucketName}/${path}`);
        return Promise.resolve(createMockResponse({ path }));
      },
      download: (path) => {
        console.log(`[MOCK] Downloading file from ${bucketName}/${path}`);
        return Promise.resolve(createMockResponse({ data: new Blob(['mock file content']) }));
      },
      getPublicUrl: (path) => {
        return { publicURL: `https://mock-storage.example.com/${bucketName}/${path}` };
      },
      remove: (paths) => {
        console.log(`[MOCK] Removing files from ${bucketName}:`, paths);
        return Promise.resolve(createMockResponse());
      },
      list: (prefix) => {
        console.log(`[MOCK] Listing files in ${bucketName}/${prefix || ''}`);
        return Promise.resolve(createMockResponse([]));
      }
    })
  }
};

export default supabaseClient;
