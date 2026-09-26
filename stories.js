/* =========================================================
   Historias — casos cotidianos, cada uno con SU PROPIA BD
   (las tablas están en dbs.js y se muestran al inicio).
   Cada paso es:
     ['personaje', 'texto', 'código opcional']   → diálogo
     { t: 'mc' | 'tf' | 'fill' | 'build' | 'order' | 'match' | 'write', ... } → pregunta
   ========================================================= */

const CAST = {
  nar:    { name: '',          emoji: '📖', color: 'muted' },
  tu:     { name: 'Tú',        emoji: '🧑‍💻', color: 'green' },
  carmen: { name: 'Carmen',    emoji: '👩‍🦳', color: 'purple' },
  luis:   { name: 'Luis',      emoji: '💊', color: 'orange' },
  rosa:   { name: 'Dra. Rosa', emoji: '👩‍⚕️', color: 'pink' },
  jorge:  { name: 'Prof. Jorge', emoji: '👨‍🏫', color: 'blue' },
  vale:   { name: 'Vale',      emoji: '🍿', color: 'yellow' },
  sofia:  { name: 'Sofía',     emoji: '🏦', color: 'blue' },
  don:    { name: 'Don Pepe',  emoji: '👴', color: 'red' },
  mateo:  { name: 'Mateo',     emoji: '🧢', color: 'yellow' },
  kevin:  { name: 'Kevin',     emoji: '💪', color: 'orange' },
};

const STORIES = [
/* ───────────── 1 · ERRORES · BIBLIOTECA ───────────── */
{
  id: 'socio', db: 'biblioteca', title: 'El socio que no se podía borrar', icon: '📚', topic: 'Manejo de errores', color: 'red',
  steps: [
    ['nar', 'Empiezas a trabajar en la biblioteca municipal. Carmen, la bibliotecaria, te llama.'],
    ['carmen', 'El socio 10 se mudó de ciudad. Bórralo del sistema, por favor.'],
    ['tu', 'Listo, es una línea.', 'DELETE FROM Socios\nWHERE IdSocio = 10'],
    ['nar', 'Aparece un mensaje rojo: “Instrucción DELETE en conflicto con la restricción REFERENCE…”.'],
    { t: 'mc', q: 'Mira las tablas. ¿Por qué no se puede borrar al socio 10?', o: ['Tiene filas en Prestamos que lo referencian con la FK IdSocio', 'Porque Socios no tiene PK', 'Porque el Distrito está vacío', 'Porque falta un COMMIT'], a: 0, ex: 'Prestamos.IdSocio → Socios. Borrarlo dejaría préstamos “huérfanos”.' },
    ['carmen', 'Uy. Pero no quiero que la gente vea ese mensaje tan feo.'],
    { t: 'fill', q: 'Envuelve el DELETE para capturar el error.', code: "BEGIN TRY\n    DELETE FROM Socios WHERE IdSocio = 10\nEND TRY\n___\n    PRINT 'No se pudo eliminar'\nEND CATCH", a: [['BEGIN CATCH']] },
    ['carmen', '¿Y puedes decirme exactamente cuándo es porque tiene préstamos?'],
    { t: 'fill', q: 'Número de error de integridad referencial:', code: "BEGIN CATCH\n    IF @@ERROR = ___\n        PRINT 'El socio tiene préstamos, primero hay que cerrarlos'\nEND CATCH", a: [['547']] },
    { t: 'mc', q: '¿Qué función te da el texto original del error?', o: ['ERROR_MESSAGE()', 'ERROR_LINE()', 'ERROR_NUMBER()', 'ERROR_STATE()'], a: 0 },
    ['nar', 'Carmen queda feliz. Aprendiste que el mismo error 547 aparece en CUALQUIER BD con FK. ✅'],
  ],
},

/* ───────────── 2 · RAISERROR · FARMACIA ───────────── */
{
  id: 'farmacia', db: 'farmacia', title: 'La pastilla que no había', icon: '💊', topic: 'RAISERROR', color: 'orange',
  steps: [
    ['nar', 'Luis atiende una farmacia de barrio.'],
    ['luis', '¡El sistema me dejó vender 5 cajas de paracetamol y en el estante no hay ninguna!'],
    ['tu', 'Hago que revise el stock antes de vender.'],
    { t: 'mc', q: '¿En qué columna está lo que hay en el estante?', o: ['Medicamentos.Stock', 'DetalleVenta.Cantidad', 'Ventas.Total', 'Medicamentos.Precio'], a: 0 },
    { t: 'fill', q: 'Guarda el stock en una variable.', code: 'DECLARE @v_stock INT\nSELECT @v_stock = Stock\nFROM ___\nWHERE IdMed = @p_idMed', a: [['Medicamentos', 'dbo.Medicamentos']] },
    ['luis', 'Y si piden más de lo que hay, ¡que salte una alarma!'],
    { t: 'build', q: 'Arma el error.', words: ['RAISERROR', '(', "'STOCK INSUFICIENTE'", ',', '16', ',', '1', ')'], extra: ['PRINT', '10', 'COMMIT'] },
    { t: 'mc', q: 'Stock = 0 y piden 5. ¿Qué se imprime?', code: "BEGIN TRY\n    IF @v_stock < @p_cantidad\n        RAISERROR('STOCK INSUFICIENTE', 16, 1)\n    PRINT 'VENTA REGISTRADA'\nEND TRY\nBEGIN CATCH\n    PRINT 'ERROR: ' + ERROR_MESSAGE()\nEND CATCH", o: ['ERROR: STOCK INSUFICIENTE', 'VENTA REGISTRADA', 'VENTA REGISTRADA\nERROR: STOCK INSUFICIENTE', 'Nada'], a: 0 },
    ['luis', 'Oye, ¿y si solo quiero un aviso de que el producto vence pronto, sin bloquear la venta?'],
    { t: 'mc', q: '¿Qué severidad usas para un aviso que NO salta al CATCH?', o: ['10', '16', '18', '19'], a: 0 },
    ['luis', '¡Perfecto! Ya no vendo aire. 😅'],
  ],
},

/* ───────────── 3 · PROCEDIMIENTOS · CLÍNICA ───────────── */
{
  id: 'clinica', db: 'clinica', title: 'El paciente duplicado', icon: '🏥', topic: 'Procedimientos + OUTPUT', color: 'purple',
  steps: [
    ['nar', 'La Dra. Rosa dirige una clínica pequeña.'],
    ['rosa', 'La recepcionista registró tres veces al mismo paciente con el mismo DNI. ¡Es un caos!'],
    ['tu', 'Te hago un procedimiento para registrar pacientes que revise el DNI antes.'],
    { t: 'fill', q: 'Empieza el procedimiento.', code: 'CREATE OR ALTER ___ uspRegistrarPaciente\n@p_nombres VARCHAR(60), @p_dni CHAR(8),\n@p_mensaje VARCHAR(200) OUTPUT\nAS', a: [['PROCEDURE', 'PROC']] },
    { t: 'fill', q: 'Valida que el DNI no exista.', code: "IF ___(SELECT 1 FROM Pacientes WHERE DNI = @p_dni)\n    SET @p_mensaje = 'Ese DNI ya está registrado'", a: [['EXISTS']] },
    { t: 'mc', q: '¿Cómo calculas el IdPaciente nuevo?', o: ['SELECT @v_id = MAX(IdPaciente) + 1 FROM Pacientes', 'SELECT @v_id = MAX(IdMedico) + 1 FROM Medicos', 'SELECT @v_id = COUNT(*) FROM Citas', 'SET @v_id = @p_dni + 1'], a: 0 },
    ['rosa', 'Y además quiero ver las citas de un médico con solo poner su id.'],
    { t: 'fill', q: 'SP que filtra por el parámetro.', code: 'CREATE OR ALTER PROCEDURE uspCitasMedico\n@p_idMedico INT\nAS\nBEGIN\n    SELECT * FROM Citas WHERE IdMedico = ___\nEND', a: [['@p_idMedico']] },
    ['rosa', '¿Y cómo uso el de pacientes?'],
    { t: 'order', q: 'Ordena la ejecución.', lines: ['DECLARE @msg VARCHAR(200)', "EXEC uspRegistrarPaciente 'Ana Ríos', '45678912', @msg OUTPUT", 'PRINT @msg'] },
    ['rosa', 'La segunda vez dice “Ese DNI ya está registrado”. ¡Gracias! 🩺'],
  ],
},

/* ───────────── 4 · CURSORES · COLEGIO ───────────── */
{
  id: 'libreta', db: 'colegio', title: 'La libreta de notas', icon: '🏫', topic: 'Cursores', color: 'orange',
  steps: [
    ['nar', 'Fin de bimestre en el colegio. El profesor Jorge necesita un reporte.'],
    ['jorge', 'Quiero imprimir cada alumno con su nota de Matemática (curso 1), y al final cuántos son y el promedio del salón.'],
    ['tu', 'Recorreré fila por fila con un cursor. Primero veo qué tablas necesito.'],
    { t: 'mc', q: '¿Qué tablas une el SELECT del cursor para tener nombre y nota?', o: ['Alumnos + Notas', 'Solo Cursos', 'Cursos + Alumnos', 'Solo Alumnos'], a: 0 },
    { t: 'fill', q: 'Completa el JOIN del cursor.', code: 'DECLARE c_notas CURSOR FOR\nSELECT a.Nombre, n.Nota\nFROM Alumnos a\nINNER JOIN Notas n ON a.IdAlumno = n.___\nWHERE n.IdCurso = 1', a: [['IdAlumno']] },
    { t: 'order', q: 'Ordena el ciclo del cursor.', lines: ['OPEN c_notas', 'FETCH c_notas INTO @v_nombre, @v_nota', 'WHILE @@FETCH_STATUS = 0', 'CLOSE c_notas', 'DEALLOCATE c_notas'] },
    ['nar', 'Ejecutas… y la consola repite “Andrea 18” sin parar. 😱'],
    { t: 'mc', q: '¿Qué falta?', code: 'FETCH c_notas INTO @v_nombre, @v_nota\nWHILE @@FETCH_STATUS = 0\nBEGIN\n    PRINT @v_nombre + \' \' + CAST(@v_nota AS VARCHAR)\n    SET @v_cant = @v_cant + 1\nEND', o: ['Un FETCH dentro del WHILE para avanzar', 'Un COMMIT', 'Otro OPEN', 'Un RAISERROR'], a: 0 },
    ['jorge', '¿Y el promedio?'],
    { t: 'match', q: 'Une cada línea con su función', pairs: [['SET @v_cant = @v_cant + 1', 'Contador'], ['SET @v_suma = @v_suma + @v_nota', 'Acumulador'], ['@v_suma / @v_cant', 'Promedio']] },
    ['jorge', '¡Listo para la reunión de padres! 📒'],
  ],
},

/* ───────────── 5 · FUNCIONES · CINE ───────────── */
{
  id: 'cine', db: 'cine', title: 'Miércoles de cine', icon: '🎬', topic: 'Funciones', color: 'green',
  steps: [
    ['nar', 'Vale administra un cine. Los miércoles hay descuento.'],
    ['vale', 'Quiero ver el precio de cada función con el descuento que yo diga.'],
    ['tu', 'Creo una función: recibe el precio y el porcentaje, y devuelve el precio final.'],
    { t: 'fill', q: 'Tipo que devuelve la función.', code: 'CREATE OR ALTER FUNCTION dbo.fu_precio_final(@p_precio DECIMAL(6,2), @p_pct INT)\n___ DECIMAL(6,2)\nAS', a: [['RETURNS']] },
    { t: 'fill', q: 'Devuelve el precio con descuento.', code: 'BEGIN\n    ___ @p_precio - @p_precio * @p_pct / 100\nEND', a: [['RETURN']] },
    { t: 'mc', q: 'Entrada de S/ 20 con 25 % de descuento. ¿Qué devuelve?', o: ['15.00', '5.00', '25.00', '19.75'], a: 0 },
    ['vale', '¿Y para todas las funciones a la vez?'],
    { t: 'build', q: 'Muestra cada función con su precio final al 50 %.', words: ['SELECT', 'IdFuncion', ',', 'dbo.fu_precio_final', '(', 'Precio', ',', '50', ')', 'FROM', 'Funciones'], extra: ['EXEC', 'Peliculas', 'Boletos'] },
    ['vale', 'Y quiero otra que me diga si una película es “Larga” (más de 120 min) o “Normal”.'],
    { t: 'mc', q: '¿Qué usas dentro de la función?', o: ["CASE WHEN @p_duracion > 120 THEN 'Larga' ELSE 'Normal' END", "PRINT 'Larga'", "EXEC 'Larga'", "INSERT INTO Peliculas VALUES ('Larga')"], a: 0 },
    { t: 'tf', q: 'Dentro de la función puedo hacer un UPDATE a Funciones para guardar el precio.', a: false, ex: 'Las funciones no modifican tablas. Eso se hace en un procedimiento.' },
    ['vale', '¡Pop corn para todos! 🍿'],
  ],
},

/* ───────────── 6 · TRANSACCIONES · BANCO ───────────── */
{
  id: 'apagon', db: 'banco', title: 'El apagón', icon: '💡', topic: 'Transacciones', color: 'yellow',
  steps: [
    ['nar', 'Sofía trabaja en el banco. Pasa S/ 200 de la cuenta A (saldo 1200) a la cuenta B (saldo 1000).'],
    ['sofia', 'Primero resto de A, luego sumo en B y registro el movimiento.'],
    ['nar', 'Justo después del primer UPDATE… ¡se va la luz! ⚡'],
    { t: 'mc', q: 'Sin transacción, ¿qué pasó?', o: ['A perdió S/ 200 y B nunca los recibió', 'Nada, SQL Server lo arregla', 'Se duplicó el dinero', 'Se canceló todo solo'], a: 0 },
    ['tu', 'Las tres operaciones van juntas: todas o ninguna.'],
    { t: 'order', q: 'Arma la transferencia segura.', lines: ['BEGIN TRANSACTION', 'BEGIN TRY', 'UPDATE Cuentas SET Saldo = Saldo - 200 WHERE NumCuenta = @A', 'UPDATE Cuentas SET Saldo = Saldo + 200 WHERE NumCuenta = @B', "INSERT INTO Movimientos VALUES (@id, @A, 'T', 200, GETDATE())", 'COMMIT TRANSACTION', 'END TRY', 'BEGIN CATCH', 'ROLLBACK TRANSACTION', 'END CATCH'] },
    { t: 'mc', q: 'Si todo sale bien, ¿cuánto tiene B?', o: ['1200', '1000', '800', '1400'], a: 0 },
    ['sofia', 'Hice varios cambios de prueba y solo quiero deshacer el último.'],
    { t: 'mc', q: 'Saldo final de A:', code: "BEGIN TRAN\nUPDATE Cuentas SET Saldo = 5000 WHERE NumCuenta = @A\nSAVE TRANSACTION P1\nUPDATE Cuentas SET Saldo = 5 WHERE NumCuenta = @A\nROLLBACK TRANSACTION P1\nCOMMIT", o: ['5000', '5', '1200', '0'], a: 0 },
    ['sofia', 'Ayer dejé un BEGIN TRAN sin cerrar y nadie podía consultar Cuentas…'],
    { t: 'mc', q: '¿Por qué?', o: ['La transacción abierta tenía las filas bloqueadas', 'Se borró la tabla', 'Por el apagón', 'Se llenó el disco'], a: 0 },
    ['sofia', 'Ahora siempre termino con COMMIT o ROLLBACK. 💸'],
  ],
},

/* ───────────── 7 · TRIGGERS DML · HOTEL ───────────── */
{
  id: 'hotel', db: 'hotel', title: 'La suite de S/ 2000', icon: '🏨', topic: 'Triggers', color: 'pink',
  steps: [
    ['nar', 'Don Pepe es dueño de un hotel. Revisa precios y se asusta.'],
    ['don', '¿¡Quién puso la habitación 201 de S/ 200 a S/ 2000 la noche!? Fue un cero de más.'],
    ['tu', 'Creo un trigger en Habitaciones que no deje subir el precio más del 30 %.'],
    { t: 'fill', q: 'Cabecera del trigger.', code: 'CREATE OR ALTER TRIGGER trg_precio_hab\n___ Habitaciones\nFOR UPDATE\nAS', a: [['ON']] },
    { t: 'match', q: '¿De dónde sale cada precio?', pairs: [['PrecioNoche antes del cambio', 'deleted'], ['PrecioNoche después del cambio', 'inserted']] },
    { t: 'mc', q: 'Si cuesta 200, ¿cuál es el máximo permitido?', o: ['260', '230', '300', '2000'], a: 0 },
    { t: 'fill', q: 'Si se pasa, revierte el UPDATE.', code: "IF @v_nuevo > 1.3 * @v_actual\nBEGIN\n    ___ TRANSACTION\n    RAISERROR('MÁXIMO 30% DE AUMENTO', 10, 1)\nEND", a: [['ROLLBACK']] },
    ['don', 'Y que nadie pueda reservar una habitación que está “Ocupada”.'],
    { t: 'mc', q: 'Trigger en Reservas FOR INSERT. ¿Cómo sabes qué habitación se está reservando?', o: ['SELECT NumHab FROM inserted', 'SELECT NumHab FROM deleted', 'SELECT NumHab FROM Habitaciones', 'Con un parámetro @p_numHab'], a: 0, ex: 'Los triggers no reciben parámetros: los datos nuevos están en inserted.' },
    ['don', 'Por hoy quiero cambiar precios libremente, desactívalo.'],
    { t: 'write', q: 'Desactiva <code>trg_precio_hab</code> de la tabla Habitaciones.', a: ['DISABLE TRIGGER trg_precio_hab ON Habitaciones', 'DISABLE TRIGGER dbo.trg_precio_hab ON dbo.Habitaciones', 'DISABLE TRIGGER trg_precio_hab ON dbo.Habitaciones'] },
    ['don', '¡Ahora nadie me pone la suite a S/ 2000! 🛎️'],
  ],
},

/* ───────────── 8 · AUDITORÍA + DDL · GIMNASIO ───────────── */
{
  id: 'gym', db: 'gimnasio', title: '¿Quién borró las membresías?', icon: '🏋️', topic: 'Triggers DDL y auditoría', color: 'blue',
  steps: [
    ['nar', 'Kevin es dueño de un gimnasio. Mateo, el practicante, “limpia” la base de datos un viernes.'],
    ['mateo', 'DELETE FROM Membresias… ¡ups! Se me olvidó el WHERE. 😰'],
    ['kevin', '¡¿Quién borró todas las membresías?! Quiero saber quién toca esa tabla.'],
    ['tu', 'Hago un trigger que guarde en Auditoria cada cambio: qué, quién y cuándo.'],
    { t: 'match', q: '¿Qué tablas virtuales tienen filas en cada caso?', pairs: [['INSERT', 'Solo inserted'], ['DELETE', 'Solo deleted'], ['UPDATE', 'inserted y deleted']] },
    { t: 'fill', q: 'Detecta una eliminación.', code: "IF NOT EXISTS(SELECT 1 FROM inserted) AND EXISTS(SELECT 1 FROM ___)\n    INSERT INTO Auditoria VALUES ('ELIMINACIÓN EN MEMBRESIAS', SUSER_SNAME(), GETDATE())", a: [['deleted']] },
    { t: 'match', q: 'Une cada función con lo que guarda', pairs: [['SUSER_SNAME()', 'Quién (login)'], ['GETDATE()', 'Cuándo'], ['HOST_NAME()', 'Desde qué equipo']] },
    ['mateo', 'Y luego borré la tabla Planes con DROP TABLE… 😬'],
    ['tu', 'Para eso hay triggers a nivel de base de datos.'],
    { t: 'order', q: 'Ordena el trigger DDL.', lines: ['CREATE OR ALTER TRIGGER trgNoBorrarTablas', 'ON DATABASE', 'AFTER DROP_TABLE', 'AS', 'BEGIN', "RAISERROR('NO SE PUEDEN BORRAR TABLAS', 10, 1)", 'ROLLBACK', 'END'] },
    { t: 'tf', q: 'El trigger DDL se crea ON Membresias.', a: false, ex: 'Los DDL van ON DATABASE (o ON ALL SERVER), no sobre una tabla.' },
    ['kevin', 'Ahora sé quién hace qué. Mateo… a hacer burpees. 😂'],
    ['nar', 'Terminaste las historias en 8 bases de datos distintas. Si en el examen te dan otra BD, ¡ya sabes adaptarte! 🏆'],
  ],
},
];
