
import type { RowDataPacket } from "mysql2";

export interface Minijuego extends RowDataPacket {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}
