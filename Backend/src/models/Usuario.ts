import type { RowDataPacket } from "mysql2";

export type RolUsuario = "estudiante" | "administrador";

export interface Usuario extends RowDataPacket {
  id: number;
  nombre: string;
  correo: string;
  password_hash: string;
  rol: RolUsuario;
  activo: boolean;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface UsuarioPublico {
  id: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  activo: boolean;
  fecha_creacion: Date;
}

export interface DatosRegistro {
  nombre: string;
  correo: string;
  password: string;
}

export interface DatosLogin {
  correo: string;
  password: string;
}