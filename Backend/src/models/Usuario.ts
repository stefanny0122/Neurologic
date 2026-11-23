
import type { RowDataPacket } from "mysql2";

export type RolUsuario = "estudiante" | "administrador";

export type ProveedorUsuario = "local" | "google" | "ambos";

export interface Usuario extends RowDataPacket {
  id: number;
  nombre: string;
  correo: string;
  password_hash: string | null;
  google_id: string | null;
  proveedor: ProveedorUsuario;
  rol: RolUsuario;
  activo: boolean;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  fecha_nacimiento: Date | string | null;
}

export interface UsuarioPublico {
  id: number;
  nombre: string;
  correo: string;
  fecha_nacimiento: string | null;
  edad: number | null;
  rol: RolUsuario;
  activo: boolean;
  fecha_creacion: Date;
}

export interface DatosRegistro {
  nombre: string;
  correo: string;
  fecha_nacimiento: string;
  password: string;
  confirmarPassword: string;
}

export interface DatosLogin {
  correo: string;
  password: string;
}

export interface DatosGoogle {
  credential: string;
}
