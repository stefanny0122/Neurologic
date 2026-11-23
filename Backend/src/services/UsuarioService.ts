
import bcrypt from "bcryptjs";
import * as usuarioRepository from "../repositories/UsuarioRepository.js";
import type {
  DatosRegistro,
  UsuarioPublico
} from "../models/Usuario.js";
import { AppError } from "../utils/app-error.js";

// Calcular edad a partir de la fecha de nacimiento
function calcularEdad(fechaNacimiento: string): number {
  const [anio, mes, dia] = fechaNacimiento.split("-").map(Number);

  const hoy = new Date();

  let edad = hoy.getFullYear() - anio;

  const yaCumplio =
    hoy.getMonth() + 1 > mes ||
    (
      hoy.getMonth() + 1 === mes &&
      hoy.getDate() >= dia
    );

  if (!yaCumplio) {
    edad--;
  }

  return edad;
}

// Convertir fecha de MySQL a formato YYYY-MM-DD
function normalizarFecha(
  fecha: Date | string | null
): string | null {
  if (!fecha) {
    return null;
  }

  if (typeof fecha === "string") {
    return fecha.slice(0, 10);
  }

  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

// Convertir usuario privado en usuario público
function convertirUsuarioPublico(
  usuario: Awaited<
    ReturnType<typeof usuarioRepository.buscarPorId>
  >
): UsuarioPublico {
  if (!usuario) {
    throw new AppError(404, "Usuario no encontrado.");
  }

  const fechaNacimiento = normalizarFecha(
    usuario.fecha_nacimiento
  );

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    fecha_nacimiento: fechaNacimiento,
    edad: fechaNacimiento
      ? calcularEdad(fechaNacimiento)
      : null,
    rol: usuario.rol,
    activo: usuario.activo,
    fecha_creacion: usuario.fecha_creacion
  };
}

// Cambiar contraseña
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

  if (
    passwordNueva.length < 8 ||
    passwordNueva.length > 72
  ) {
    throw new AppError(
      400,
      "La nueva contraseña debe tener entre 8 y 72 caracteres."
    );
  }

  const usuario = await usuarioRepository.buscarPorId(id);

  if (!usuario || !usuario.activo) {
    throw new AppError(
      404,
      "Usuario no encontrado o inactivo."
    );
  }

  if (!usuario.password_hash) {
    throw new AppError(
      400,
      "Esta cuenta no tiene una contraseña local configurada."
    );
  }

  const actualValida = await bcrypt.compare(
    passwordActual,
    usuario.password_hash
  );

  if (!actualValida) {
    throw new AppError(
      401,
      "La contraseña actual es incorrecta."
    );
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

  await usuarioRepository.actualizarPassword(
    id,
    nuevoHash
  );
}

// Registrar usuario
export async function registrar(
  datos: DatosRegistro
): Promise<UsuarioPublico> {

  // Validar campos obligatorios
  if (
    !datos ||
    typeof datos.nombre !== "string" ||
    typeof datos.correo !== "string" ||
    typeof datos.password !== "string" ||
    typeof datos.fecha_nacimiento !== "string" ||
    typeof datos.confirmarPassword !== "string"
  ) {
    throw new AppError(
      400,
      "Debes completar todos los campos."
    );
  }

  const nombre = datos.nombre.trim();
  const correo = datos.correo.trim().toLowerCase();
  const password = datos.password;
  const confirmarPassword = datos.confirmarPassword;
  const fechaNacimiento = datos.fecha_nacimiento.trim();

  // Validar nombre
  if (nombre.length < 2 || nombre.length > 100) {
    throw new AppError(
      400,
      "El nombre debe tener entre 2 y 100 caracteres."
    );
  }

  // Validar correo
  if (
    correo.length > 150 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
  ) {
    throw new AppError(
      400,
      "Ingresa un correo electrónico válido."
    );
  }

  // Validar contraseña
  if (
    password.length < 8 ||
    password.length > 72
  ) {
    throw new AppError(
      400,
      "La contraseña debe tener entre 8 y 72 caracteres."
    );
  }

  // Confirmar contraseña
  if (password !== confirmarPassword) {
    throw new AppError(
      400,
      "Las contraseñas no coinciden."
    );
  }

  // Validar formato de fecha
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
    throw new AppError(
      400,
      "La fecha de nacimiento debe tener el formato AAAA-MM-DD."
    );
  }

  const [anio, mes, dia] = fechaNacimiento.split("-").map(Number);

  const fechaValidada = new Date(anio, mes - 1, dia);

  // Comprobar que la fecha realmente exista
  if (
    fechaValidada.getFullYear() !== anio ||
    fechaValidada.getMonth() + 1 !== mes ||
    fechaValidada.getDate() !== dia
  ) {
    throw new AppError(
      400,
      "La fecha de nacimiento no es válida."
    );
  }

  // Validar que la fecha no sea futura
  const hoy = new Date();
  const fechaHoy = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate()
  );

  if (fechaValidada > fechaHoy) {
    throw new AppError(
      400,
      "La fecha de nacimiento no puede ser futura."
    );
  }

  // Calcular y validar edad
  const edad = calcularEdad(fechaNacimiento);

  if (edad < 1 || edad > 120) {
    throw new AppError(
      400,
      "La edad debe estar entre 1 y 120 años."
    );
  }

  // Comprobar si el correo ya existe
  const existente = await usuarioRepository.buscarPorCorreo(
    correo
  );

  if (existente) {
    throw new AppError(
      409,
      "Este correo ya está registrado."
    );
  }

  // Cifrar contraseña
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    // Guardar todos los datos en MySQL
    const id = await usuarioRepository.crear(
      nombre,
      correo,
      passwordHash,
      fechaNacimiento
    );

    // Consultar usuario recién creado
    const usuario = await usuarioRepository.buscarPorId(id);

    return convertirUsuarioPublico(usuario);

  } catch (error) {
    // Controlar correos duplicados
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      throw new AppError(
        409,
        "Este correo ya está registrado."
      );
    }

    throw error;
  }
}

// Obtener perfil
export async function obtenerPerfil(
  id: number
): Promise<UsuarioPublico> {
  const usuario = await usuarioRepository.buscarPorId(id);

  if (!usuario) {
    throw new AppError(
      404,
      "Usuario no encontrado."
    );
  }

  if (!usuario.activo) {
    throw new AppError(
      403,
      "La cuenta está desactivada."
    );
  }

  return convertirUsuarioPublico(usuario);
}

// Actualizar nombre, correo y fecha de nacimiento.
export async function actualizarPerfil(
  id: number,
  datos: { nombre: string; correo: string; fecha_nacimiento: string }
): Promise<UsuarioPublico> {
  const nombre = datos?.nombre?.trim();
  const correo = datos?.correo?.trim().toLowerCase();
  const fechaNacimiento = datos?.fecha_nacimiento?.trim();

  if (!nombre || nombre.length < 2 || nombre.length > 100) {
    throw new AppError(400, "El nombre debe tener entre 2 y 100 caracteres.");
  }
  if (!correo || correo.length > 150 || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(correo)) {
    throw new AppError(400, "Ingresa un correo electrónico válido.");
  }
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(fechaNacimiento || "")) {
    throw new AppError(400, "La fecha de nacimiento no es válida.");
  }
  const [anio, mes, dia] = fechaNacimiento.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  const hoy = new Date();
  const fechaHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  if (fecha.getFullYear() !== anio || fecha.getMonth() + 1 !== mes ||
      fecha.getDate() !== dia || fecha > fechaHoy) {
    throw new AppError(400, "La fecha de nacimiento no es válida.");
  }

  const existente = await usuarioRepository.buscarPorCorreo(correo);
  if (existente && existente.id !== id) {
    throw new AppError(409, "Este correo ya está registrado por otra cuenta.");
  }

  try {
    await usuarioRepository.actualizarPerfil(id, nombre, correo, fechaNacimiento);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ER_DUP_ENTRY") {
      throw new AppError(409, "Este correo ya está registrado por otra cuenta.");
    }
    throw error;
  }
  return obtenerPerfil(id);
}
