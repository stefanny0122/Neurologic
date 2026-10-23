
import type { RowDataPacket } from "mysql2";

export interface Resultado extends RowDataPacket {
  id: number;
  partida_id: number;
  numero_pregunta: number;
  respuesta_usuario: string | null;
  respuesta_correcta: string | null;
  es_correcta: boolean;
  puntos_obtenidos: number;
  tiempo_respuesta_segundos: number | null;
  fecha_creacion: Date;
}

export interface CrearResultado {
  partidaId: number;
  numeroPregunta: number;
  respuestaUsuario: string;
  respuestaCorrecta: string;
  esCorrecta: boolean;
  puntosObtenidos: number;
  tiempoRespuestaSegundos: number;
}
