export type MergeProps<T, U> = T & Omit<U, keyof T>;
