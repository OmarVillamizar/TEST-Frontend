export interface User {
  id: number;
  nombre: string;
  activo: boolean;
  /** ISO 8601 / epoch timestamp coming from the backend. */
  fechaCreacion: string;
}

/** Payload used for create/update. Server assigns id + fechaCreacion. */
export interface UserPayload {
  nombre: string;
  activo: boolean;
}
