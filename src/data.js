// Datos de referencia CCB (Cámara de Comercio de Bogotá)
// Fuente: agendamiento.ccb.org.co / puntos de atención

export const TRAMITES = [
  "Renovación de matrícula mercantil",
  "Certificados (histórico, textual, negativo)",
  "Constitución de empresa (SAS, Ltda, Establecimiento)",
  "Actualización de información empresarial",
  "Inscripción de documentos registrales",
  "Cambio de domicilio / dirección",
  "Cancelación de matrícula",
  "Cambio de actividad económica (CIIU)",
  "Asesoría virtual (estatutos, consultas)",
];

export const SEDES = [
  { id: "salitre", nombre: "Salitre (Principal)", dir: "Av. El Dorado # 68D-35", zona: "Centro-Occidente" },
  { id: "chapinero", nombre: "Chapinero", dir: "Calle 67 # 8-32/44", zona: "Norte" },
  { id: "cedritos", nombre: "Cedritos", dir: "Avenida 19 # 140-29", zona: "Norte" },
  { id: "kennedy", nombre: "Kennedy", dir: "Av. Carrera 68 # 30-15 Sur", zona: "Sur" },
  { id: "centro", nombre: "Centro", dir: "Carrera 9 # 16-13", zona: "Centro" },
];

export const TIPOS_DOC = [
  "Cédula de Ciudadanía",
  "Cédula de Extranjería",
  "NIT",
  "Pasaporte",
];

// Horario atención L-V 8:00-17:00, franjas de 30 min
export const HORAS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30",
];
