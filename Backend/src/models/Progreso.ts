
import type { RowDataPacket } from "mysql2";

export interface Progreso extends RowDataPacket {
  id: number | null;
  usuario_id: number;
  minijuego_id: number;
  codigo: string;
  nombre_minijuego: string;
  partidas_completadas: number;
  puntaje_acumulado: number;
  mejor_puntaje: number;
  nivel_maximo_alcanzado: number;
  ultima_actividad: Date | null;
  fecha_actualizacion: Date | null;
}
