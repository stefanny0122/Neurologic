import bcrypt from "bcryptjs";
import * as usuarioRepository from "../repositories/UsuarioRepository.js";
import type {
  DatosRegistro,
  UsuarioPublico
} from "../models/Usuario.js";
import { AppError } from "../utils/app-error.js";

function convertirUsuarioPublico(
  usuario: Awaited<ReturnType<typeof usuarioRepository.buscarPorId>>
): UsuarioPublico {
  if (!usuario) {
    throw new AppError(404, "Usuario no encontrado.");
  }

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    activo: usuario.activo,
    fecha_creacion: usuario.fecha_creacion
  };
}

export async function cambiarPassword(
  id: number,
  passwordActual: string,
  passwordNueva: string
): Promise<void> {
  if (
    typeof passwordActual !== "string" ||
    typeof passwordNueva !== "string" ||
    !passwordActual ||
    !passwordNueva
  ) {
    throw new AppError(
      400,
      "Debes ingresar la contraseña actual y la nueva."
    );
  }

  if (passwordNueva.length < 8 || passwordNueva.length > 72) {
    throw new AppError(
      400,
      "La nueva contraseña debe tener entre 8 y 72 caracteres."
    );
  }

  const usuario = await usuarioRepository.buscarPorId(id);

  if (!usuario || !usuario.activo) {
    throw new AppError(404, "Usuario no encontrado o inactivo.");
  }

  const actualValida = await bcrypt.compare(
    passwordActual,
    usuario.password_hash
  );

  if (!actualValida) {
    throw new AppError(401, "La contraseña actual es incorrecta.");
  }

  const mismaPassword = await bcrypt.compare(
    passwordNueva,
    usuario.password_hash
  );

  if (mismaPassword) {
    throw new AppError(
      400,
      "La nueva contraseña debe ser diferente a la actual."
    );
  }

  const nuevoHash = await bcrypt.hash(passwordNueva, 12);

  await usuarioRepository.actualizarPassword(id, nuevoHash);
}

export async function registrar(
  datos: DatosRegistro
): Promise<UsuarioPublico> {
  if (
    typeof datos.nombre !== "string" ||
    typeof datos.correo !== "string" ||
    typeof datos.password !== "string"
  ) {
    throw new AppError(400, "Debes completar todos los campos.");
  }

  const nombre = datos.nombre.trim();
  const correo = datos.correo.trim().toLowerCase();
  const password = datos.password;

  if (nombre.length < 2 || nombre.length > 100) {
    throw new AppError(
      400,
      "El nombre debe tener entre 2 y 100 caracteres."
    );
  }

  if (
    correo.length > 150 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
  ) {
    throw new AppError(400, "Ingresa un correo electrónico válido.");
  }

  if (password.length < 8 || password.length > 72) {
    throw new AppError(
      400,
      "La contraseña debe tener entre 8 y 72 caracteres."
    );
  }

  const existente = await usuarioRepository.buscarPorCorreo(correo);

  if (existente) {
    throw new AppError(409, "Este correo ya está registrado.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const id = await usuarioRepository.crear(
      nombre,
      correo,
      passwordHash
    );

    const usuario = await usuarioRepository.buscarPorId(id);

    return convertirUsuarioPublico(usuario);
  } catch (error) {
    // También cubre dos registros simultáneos con el mismo correo.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      throw new AppError(409, "Este correo ya está registrado.");
    }

    throw error;
  }
}

export async function obtenerPerfil(
  id: number
): Promise<UsuarioPublico> {
  const usuario = await usuarioRepository.buscarPorId(id);

  if (!usuario) {
    throw new AppError(404, "Usuario no encontrado.");
  }

  if (!usuario.activo) {
    throw new AppError(403, "La cuenta está desactivada.");
  }

  return convertirUsuarioPublico(usuario);
}