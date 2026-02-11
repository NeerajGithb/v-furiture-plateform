import {
  fetchWithCredentials,
  handleApiResponse,
  createTimeoutError,
  isApiError,
  isTimeoutError,
  isNetworkError,
} from "@/utils/fetchWithCredentials";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    context?: any;
  };
  message?: string;
  meta?: Record<string, any>;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  cache?: boolean;
  skipRetry?: boolean;
  onUploadProgress?: (progress: number) => void;
}

const DEFAULT_TIMEOUT = 8000;
const DEFAULT_RETRIES = 2;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

export abstract class BaseService {
  protected baseUrl: string;
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly isAuthenticated: boolean;

  constructor(baseUrl: string = "/api", authenticated: boolean = false) {
    if (!baseUrl) throw new Error("Base URL is required");
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.isAuthenticated = authenticated;
  }

  // Generate unique cache key from request parameters
  private getCacheKey(method: string, url: string, data?: any): string {
    return `${method}:${url}:${data ? JSON.stringify(data) : ""}`;
  }

  // Retrieve cached response if valid and not expired
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Store response in cache with timestamp
  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Prevent duplicate in-flight requests to the same endpoint
  private async deduplicateRequest<T>(
    key: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const pending = this.pendingRequests.get(key);

    if (pending && Date.now() - pending.timestamp < 1000) {
      return pending.promise;
    }

    const promise = operation().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, { promise, timestamp: Date.now() });
    return promise;
  }

  // Retry failed requests with exponential backoff (skips 4xx, timeouts, aborts)
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number = DEFAULT_RETRIES,
    skipRetry: boolean = false,
  ): Promise<T> {
    if (skipRetry) return operation();

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        const shouldNotRetry =
          (isApiError(error) && error.status >= 400 && error.status < 500) ||
          isTimeoutError(error) ||
          (error instanceof Error && error.name === "AbortError");

        if (shouldNotRetry || attempt === retries) {
          throw error;
        }

        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  // Parse response and convert errors to standardized ApiResponse format
  private async processResponse<T>(
    response: Response,
    requestInfo?: { method: string; url: string; data?: any }
  ): Promise<ApiResponse<T>> {
    try {
      
      const rawData = await handleApiResponse<any>(response);
      // Only log in development and for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Raw Response]:', rawData);
      }
      
      return rawData as ApiResponse<T>;
    } catch (error) {
      // Log errors for debugging
      if (isApiError(error)) {
        console.error(`[API Error] ${error.status} ${error.code}:`, error.message);
        if (process.env.NODE_ENV === 'development') {
          console.error('Request details:', requestInfo);
          console.error('Error body:', error.body);
        }
        return {
          success: false,
          error: {
            code: error.code || `HTTP_${error.status}`,
            message: error.message,
            context: error.body,
          },
        };
      }

      if (isTimeoutError(error)) {
        console.error(`[Timeout Error] Request timed out after ${error.timeout}ms:`, error.message);
        return {
          success: false,
          error: {
            code: "TIMEOUT",
            message: error.message,
          },
        };
      }

      if (isNetworkError(error)) {
        console.error('[Network Error]:', error.message);
        return {
          success: false,
          error: {
            code: "NETWORK_ERROR",
            message: error.message,
          },
        };
      }

      console.error('[Unknown Error]:', error);
      return {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        },
      };
    }
  }

  // Core HTTP request handler with timeout and auth support
  private async makeRequest(
    method: string,
    url: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<Response> {
    const timeout = options?.timeout || DEFAULT_TIMEOUT;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const headers: Record<string, string> = {};

      if (!(data instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      const config: RequestInit = {
        method,
        headers: {
          ...headers,
          ...options?.headers,
        },
        signal: options?.signal || controller.signal,
      };

      if (data && method !== "GET" && method !== "HEAD") {
        config.body = data instanceof FormData ? data : JSON.stringify(data);
      }

      let response: Response;

      if (this.isAuthenticated) {
        response = await fetchWithCredentials(url, config);
      } else {
        response = await fetch(url, config);
      }

      clearTimeout(timer);
      return response;
    } catch (error) {
      clearTimeout(timer);

      if (error instanceof Error && error.name === "AbortError") {
        throw createTimeoutError(timeout);
      }

      throw error;
    }
  }

  // GET with query params, caching, and deduplication support
  protected async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(
            key,
            Array.isArray(value) ? value.join(",") : String(value),
          );
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const cacheKey = this.getCacheKey("GET", url);

    if (options?.cache) {
      const cached = this.getFromCache<ApiResponse<T>>(cacheKey);
      if (cached) return cached;
    }

    return this.deduplicateRequest(cacheKey, async () => {
      return this.executeWithRetry(
        async () => {
          const response = await this.makeRequest(
            "GET",
            url,
            undefined,
            options,
          );
          const result = await this.processResponse<T>(response, {
            method: "GET",
            url,
            data: params
          });

          if (options?.cache && result.success) {
            this.setCache(cacheKey, result);
          }

          return result;
        },
        options?.retries,
        options?.skipRetry,
      );
    });
  }

  // GET paginated data - handles pagination field separately
  protected async getPaginated<T>(
    endpoint: string,
    params?: Record<string, any>,
    options?: RequestOptions,
  ): Promise<{ data: T[]; pagination: any }> {
    const response = await this.get<T[]>(endpoint, params, options) as any;
    
    if (response.success) {
      return {
        data: response.data,
        pagination: response.pagination
      };
    } else {
      throw new Error(response.error?.message || "Request failed");
    }
  }

  // POST with JSON or FormData body
  protected async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    const fullUrl = `${this.baseUrl}${endpoint}`;
    
    return this.executeWithRetry(
      async () => {
        const response = await this.makeRequest(
          "POST",
          fullUrl,
          data,
          options,
        );
        return this.processResponse<T>(response, {
          method: "POST",
          url: fullUrl,
          data
        });
      },
      options?.retries,
      options?.skipRetry,
    );
  }

  // PUT for full resource updates
  protected async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    const fullUrl = `${this.baseUrl}${endpoint}`;
    
    return this.executeWithRetry(
      async () => {
        const response = await this.makeRequest(
          "PUT",
          fullUrl,
          data,
          options,
        );
        return this.processResponse<T>(response, {
          method: "PUT",
          url: fullUrl,
          data
        });
      },
      options?.retries,
      options?.skipRetry,
    );
  }

  // PATCH for partial resource updates
  protected async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    const fullUrl = `${this.baseUrl}${endpoint}`;
    
    return this.executeWithRetry(
      async () => {
        const response = await this.makeRequest(
          "PATCH",
          fullUrl,
          data,
          options,
        );
        return this.processResponse<T>(response, {
          method: "PATCH",
          url: fullUrl,
          data
        });
      },
      options?.retries,
      options?.skipRetry,
    );
  }

  // DELETE with optional query params
  protected async delete<T>(
    endpoint: string,
    params?: Record<string, any>,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    return this.executeWithRetry(
      async () => {
        const response = await this.makeRequest(
          "DELETE",
          url,
          undefined,
          options,
        );
        return this.processResponse<T>(response, {
          method: "DELETE",
          url,
          data: params
        });
      },
      options?.retries,
      options?.skipRetry,
    );
  }

  // File upload with extended timeout and progress support
  protected async upload<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions & {
      onProgress?: (progress: number) => void;
    },
  ): Promise<ApiResponse<T>> {
    const timeout = options?.timeout || DEFAULT_TIMEOUT * 2;

    try {
      // Use XMLHttpRequest for progress tracking
      if (options?.onProgress) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          // Track upload progress
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              options.onProgress!(progress);
            }
          });

          // Handle completion
          xhr.addEventListener("load", async () => {
            try {
              const response = new Response(xhr.responseText, {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: new Headers({
                  "Content-Type":
                    xhr.getResponseHeader("Content-Type") || "application/json",
                }),
              });

              const result = await this.processResponse<T>(response);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          });

          // Handle errors
          xhr.addEventListener("error", () => {
            reject(new Error("Upload failed"));
          });

          // Handle timeout
          const timeoutId = setTimeout(() => {
            xhr.abort();
            reject(createTimeoutError(timeout));
          }, timeout);

          xhr.addEventListener("loadend", () => {
            clearTimeout(timeoutId);
          });

          // Start upload
          xhr.open("POST", `${this.baseUrl}${endpoint}`);
          xhr.withCredentials = true;
          xhr.send(formData);
        });
      }

      // Fallback to regular makeRequest for uploads without progress
      const response = await this.makeRequest(
        "POST",
        `${this.baseUrl}${endpoint}`,
        formData,
        { ...options, timeout },
      );
      return this.processResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: "UPLOAD_ERROR",
          message: error instanceof Error ? error.message : "Upload failed",
        },
      };
    }
  }
}

export class BasePublicService extends BaseService {
  constructor(baseUrl: string = "/api") {
    super(baseUrl, false);
  }
}

export class BasePrivateService extends BaseService {
  constructor(baseUrl: string = "/api") {
    super(baseUrl, true);
  }
}