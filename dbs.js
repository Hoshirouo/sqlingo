/* =========================================================
   Bases de datos ficticias para practicar con tablas distintas
   a las de BD Negocios. Cada columna:
     'PK Nombre TIPO'          → clave primaria
     'Nombre TIPO → Tabla'     → clave foránea
   ========================================================= */

const DBS = {
  biblioteca: {
    name: 'BD Biblioteca', icon: '📚',
    tables: {
      Categorias: ['PK IdCategoria INT', 'Nombre VARCHAR(40)'],
      Libros: ['PK IdLibro INT', 'Titulo VARCHAR(100)', 'Autor VARCHAR(60)', 'IdCategoria INT → Categorias', 'Stock SMALLINT'],
      Socios: ['PK IdSocio INT', 'Nombre VARCHAR(60)', 'Distrito VARCHAR(40)'],
      Prestamos: ['PK IdPrestamo INT', 'IdLibro INT → Libros', 'IdSocio INT → Socios', 'FechaPrestamo DATE', 'FechaDevolucion DATE'],
    },
  },
  clinica: {
    name: 'BD Clínica', icon: '🏥',
    tables: {
      Pacientes: ['PK IdPaciente INT', 'Nombres VARCHAR(60)', 'DNI CHAR(8)', 'FecNac DATE'],
      Medicos: ['PK IdMedico INT', 'Nombre VARCHAR(60)', 'Especialidad VARCHAR(40)', 'Tarifa DECIMAL(8,2)'],
      Citas: ['PK IdCita INT', 'IdPaciente INT → Pacientes', 'IdMedico INT → Medicos', 'Fecha DATETIME', 'Estado VARCHAR(15)'],
    },
  },
  colegio: {
    name: 'BD Colegio', icon: '🏫',
    tables: {
      Alumnos: ['PK IdAlumno INT', 'Nombre VARCHAR(60)', 'Grado CHAR(2)'],
      Cursos: ['PK IdCurso INT', 'Nombre VARCHAR(40)', 'Creditos TINYINT'],
      Notas: ['PK IdAlumno INT → Alumnos', 'PK IdCurso INT → Cursos', 'Nota DECIMAL(4,2)'],
    },
  },
  banco: {
    name: 'BD Banco', icon: '🏦',
    tables: {
      Clientes: ['PK IdCliente INT', 'Nombre VARCHAR(60)', 'DNI CHAR(8)'],
      Cuentas: ['PK NumCuenta VARCHAR(12)', 'IdCliente INT → Clientes', 'Saldo DECIMAL(12,2)', 'Tipo VARCHAR(10)'],
      Movimientos: ['PK IdMov INT', 'NumCuenta VARCHAR(12) → Cuentas', 'Tipo CHAR(1)', 'Monto DECIMAL(12,2)', 'Fecha DATETIME'],
    },
  },
  cine: {
    name: 'BD Cine', icon: '🎬',
    tables: {
      Peliculas: ['PK IdPelicula INT', 'Titulo VARCHAR(80)', 'Duracion SMALLINT', 'Clasificacion VARCHAR(5)'],
      Funciones: ['PK IdFuncion INT', 'IdPelicula INT → Peliculas', 'Sala TINYINT', 'Fecha DATETIME', 'Precio DECIMAL(6,2)', 'AsientosLibres SMALLINT'],
      Boletos: ['PK IdBoleto INT', 'IdFuncion INT → Funciones', 'Cantidad TINYINT', 'Total DECIMAL(8,2)'],
    },
  },
  farmacia: {
    name: 'BD Farmacia', icon: '💊',
    tables: {
      Medicamentos: ['PK IdMed INT', 'Nombre VARCHAR(60)', 'Precio DECIMAL(8,2)', 'Stock INT', 'FecVencimiento DATE'],
      Ventas: ['PK IdVenta INT', 'Fecha DATETIME', 'Total DECIMAL(10,2)'],
      DetalleVenta: ['IdVenta INT → Ventas', 'IdMed INT → Medicamentos', 'Cantidad INT', 'Precio DECIMAL(8,2)'],
    },
  },
  gimnasio: {
    name: 'BD Gimnasio', icon: '🏋️',
    tables: {
      Socios: ['PK IdSocio INT', 'Nombre VARCHAR(60)', 'Telefono VARCHAR(15)'],
      Planes: ['PK IdPlan INT', 'Nombre VARCHAR(30)', 'PrecioMensual DECIMAL(8,2)'],
      Membresias: ['PK IdMembresia INT', 'IdSocio INT → Socios', 'IdPlan INT → Planes', 'FecInicio DATE', 'FecFin DATE'],
      Auditoria: ['Accion VARCHAR(100)', 'Usuario VARCHAR(50)', 'Fecha DATETIME'],
    },
  },
  hotel: {
    name: 'BD Hotel', icon: '🏨',
    tables: {
      Habitaciones: ['PK NumHab INT', 'Tipo VARCHAR(20)', 'PrecioNoche DECIMAL(8,2)', 'Estado VARCHAR(15)'],
      Huespedes: ['PK IdHuesped INT', 'Nombre VARCHAR(60)', 'Pais VARCHAR(30)'],
      Reservas: ['PK IdReserva INT', 'IdHuesped INT → Huespedes', 'NumHab INT → Habitaciones', 'FecIngreso DATE', 'FecSalida DATE'],
    },
  },
};
