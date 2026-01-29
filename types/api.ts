// API 응답 타입 정의

export type APIResponse<T> = {
  data?: T;
  error?: string;
};
