export interface User {
  id: number;
  nombre: string;
  activo: boolean;
  /** ISO 8601 timestamp assigned by TypeORM's @CreateDateColumn. */
  createdAt: string;
}

/** Payload used for create/update. Server assigns id + createdAt. */
export interface UserPayload {
  nombre: string;
  activo: boolean;
}
