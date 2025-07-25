// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Add polyfills for Node.js test environment
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Add File and FormData polyfills
if (typeof File === 'undefined') {
  global.File = class File {
    constructor(parts, name, options = {}) {
      this.name = name;
      this.size = parts.reduce((acc, part) => acc + (part.length || part.byteLength || 0), 0);
      this.type = options.type || '';
      this.lastModified = options.lastModified || Date.now();
      this._parts = parts;
    }
    
    arrayBuffer() {
      const buffer = new ArrayBuffer(this.size);
      const view = new Uint8Array(buffer);
      let offset = 0;
      
      for (const part of this._parts) {
        if (part instanceof ArrayBuffer) {
          view.set(new Uint8Array(part), offset);
          offset += part.byteLength;
        } else if (typeof part === 'string') {
          const encoder = new TextEncoder();
          const encoded = encoder.encode(part);
          view.set(encoded, offset);
          offset += encoded.length;
        }
      }
      
      return Promise.resolve(buffer);
    }
    
    text() {
      return this.arrayBuffer().then(buffer => {
        const decoder = new TextDecoder();
        return decoder.decode(buffer);
      });
    }
  };
}

if (typeof FormData === 'undefined') {
  global.FormData = class FormData {
    constructor() {
      this._data = new Map();
    }
    
    append(name, value, filename) {
      if (!this._data.has(name)) {
        this._data.set(name, []);
      }
      this._data.get(name).push({ value, filename });
    }
    
    get(name) {
      const entries = this._data.get(name);
      return entries ? entries[0].value : null;
    }
    
    getAll(name) {
      const entries = this._data.get(name);
      return entries ? entries.map(entry => entry.value) : [];
    }
    
    has(name) {
      return this._data.has(name);
    }
    
    set(name, value, filename) {
      this._data.set(name, [{ value, filename }]);
    }
    
    delete(name) {
      this._data.delete(name);
    }
    
    *entries() {
      for (const [name, entries] of this._data) {
        for (const entry of entries) {
          yield [name, entry.value];
        }
      }
    }
    
    *keys() {
      for (const [name] of this._data) {
        yield name;
      }
    }
    
    *values() {
      for (const [name, entries] of this._data) {
        for (const entry of entries) {
          yield entry.value;
        }
      }
    }
    
    [Symbol.iterator]() {
      return this.entries();
    }
  };
}

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    action: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    skills: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    coach: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
    $use: jest.fn((middleware) => {
      // Mock the middleware function - just call the next function
      return jest.fn(async (params, next) => next(params));
    }),
  })),
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

// Mock NextRequest
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation(function(input, init = {}) {
    this.url = typeof input === 'string' ? input : input.url;
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.body = init.body;
    this.cookies = new Map();
    this.geo = {};
    this.ip = '127.0.0.1';
    this.nextUrl = { pathname: '/test' };
    this.json = async () => JSON.parse(this.body || '{}');
    this.text = async () => this.body || '';
    return this;
  }),
  NextResponse: {
    json: jest.fn((data, init = {}) => ({
      json: async () => data,
      status: init.status || 200,
      headers: new Map(Object.entries(init.headers || {})),
    })),
  },
}))

// Mock Web APIs for Node.js test environment
global.Request = class Request {
  constructor(input, init = {}) {
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.body = init.body;
  }
  
  async json() {
    return JSON.parse(this.body || '{}');
  }
  
  async text() {
    return this.body || '';
  }
};

global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Map(Object.entries(init.headers || {}));
  }
  
  static json(data, init = {}) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  }
  
  async json() {
    return JSON.parse(this.body || '{}');
  }
  
  async text() {
    return this.body || '';
  }
};

// Mock Headers
global.Headers = class Headers extends Map {
  constructor(init = {}) {
    super(Object.entries(init));
  }
  
  get(name) {
    return super.get(name.toLowerCase());
  }
  
  set(name, value) {
    return super.set(name.toLowerCase(), value);
  }
  
  has(name) {
    return super.has(name.toLowerCase());
  }
  
  delete(name) {
    return super.delete(name.toLowerCase());
  }
};

// Mock URL
if (typeof URL === 'undefined') {
  global.URL = class URL {
    constructor(url, base) {
      this.href = url;
      this.origin = base || '';
      this.protocol = 'http:';
      this.host = 'localhost';
      this.hostname = 'localhost';
      this.port = '';
      this.pathname = '/';
      this.search = '';
      this.hash = '';
    }
  };
}

// Mock console.log to reduce test output noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    randomUUID: jest.fn(() => 'test-uuid'),
  },
});

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Mock next-auth server functions
jest.mock('next-auth', () => {
  const mockNextAuth = jest.fn(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
  }));
  mockNextAuth.getServerSession = jest.fn();
  return {
    default: mockNextAuth,
    getServerSession: jest.fn(),
  };
})

// Mock dynamic imports
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => null;
  DynamicComponent.displayName = 'LoadableComponent';
  DynamicComponent.preload = jest.fn();
  return DynamicComponent;
});

// Suppress console errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
       args[0].includes('Warning: validateDOMNesting') ||
       args[0].includes('Warning: Each child in a list'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
}) 