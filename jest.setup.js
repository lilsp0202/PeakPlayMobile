// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

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
jest.mock('next-auth', () => ({
  default: jest.fn(),
  getServerSession: jest.fn(),
}))

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