
import type { RowDataPacket } from "mysql2";

export interface Partida extends RowDataPacket {
  id: number;
  usuario_id: number;
  minijuego_id: number;
  nivel: number;
  estado: string;
  puntaje_total: number;
  fecha_inicio: Date;
  fecha_finalizacion: Date | null;
}

export interface CrearPartida {
  usuarioId: number;
  minijuegoId: number;
  nivel: number;
}
