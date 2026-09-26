/* =========================================================
   Práctica extra: casos para escribir, tarjetas y trucos
   ========================================================= */

/* ---------- Trucos para recordar (por unidad) ---------- */
const TIPS = {
  nueva: [
    'Primero las 🔑 PK y 🔗 FK: te dicen qué tablas se pueden unir.',
    'Busca en el enunciado cada dato que piden y ubica su columna antes de escribir código.',
    'JOIN siempre: <code>hija.IdFK = padre.IdPK</code>.',
  ],
  err: [
    '<b>TRY = intenta, CATCH = atrapa.</b> Lo que falla en el TRY cae al CATCH.',
    'RAISERROR(<b>M</b>ensaje, <b>S</b>everidad, <b>E</b>stado) → “<b>M</b>i <b>S</b>istema <b>E</b>xplota”.',
    'Severidad <b>≥ 11</b> salta al CATCH; <b>≤ 10</b> solo avisa. Piensa: “10 es tranquilo”.',
    '<b>547</b> = FK (integridad referencial). <b>8134</b> = división entre 0.',
  ],
  sp: [
    'SP = “receta guardada”: se crea con CREATE PROCEDURE y se usa con <b>EXEC</b>.',
    'OUTPUT se escribe <b>dos veces</b>: al declarar el parámetro y al ejecutar.',
    'Nuevo id: <code>MAX(Id) + 1</code>. Validar: <code>IF EXISTS(SELECT 1 …)</code>.',
  ],
  cur: [
    'Ciclo del cursor: <b>DOF-WCD</b> → Declare, Open, Fetch, While, Close, Deallocate.',
    '<b>Dos FETCH</b>: uno antes del WHILE y uno al final del bucle. Ni más ni menos.',
    '@@FETCH_STATUS: <b>0 = “hay fila”</b>, -1 = se acabó, -2 = se borró.',
    'Contador suma 1; acumulador suma un valor.',
  ],
  fn: [
    '<b>RETURNS</b> (con S) arriba = tipo. <b>RETURN</b> (sin S) abajo = valor.',
    'Función = calculadora: se usa en SELECT con <b>dbo.</b> y no modifica tablas ni hace PRINT.',
    'CASE sin ELSE → si nada coincide devuelve NULL.',
  ],
  tx: [
    'Transacción = “todo o nada”, como una transferencia bancaria.',
    'Todo bien → <b>COMMIT</b>. Algo falló (CATCH) → <b>ROLLBACK</b>.',
    'SAVE TRANSACTION = “punto de guardado” de videojuego: ROLLBACK a ese punto deshace solo lo posterior.',
  ],
  trg: [
    '<b>inserted = lo nuevo, deleted = lo viejo</b>. UPDATE usa los dos.',
    'Trigger = “alarma automática”: nadie lo llama con EXEC, se dispara solo.',
    'DML: ON <tabla>. DDL: <b>ON DATABASE</b> (DROP_TABLE, CREATE_TABLE…).',
    'Para bloquear algo dentro del trigger: <b>ROLLBACK TRANSACTION</b> + RAISERROR.',
  ],
};

/* ---------- Tarjetas rápidas ---------- */
const FLASH = [
  // errores
  { u: 'err', f: '¿Qué estructura captura errores?', b: 'BEGIN TRY … END TRY\nBEGIN CATCH … END CATCH' },
  { u: 'err', f: '¿Qué devuelve ERROR_MESSAGE()?', b: 'El texto del error' },
  { u: 'err', f: '¿Qué es @@ERROR?', b: 'Número de error de la última instrucción (0 = sin error)' },
  { u: 'err', f: 'Error 547', b: 'Conflicto de integridad referencial (FK)' },
  { u: 'err', f: 'Orden de parámetros de RAISERROR', b: "RAISERROR('mensaje', severidad, estado)" },
  { u: 'err', f: '¿Qué severidad salta al CATCH?', b: '11 a 19 (en clase: 16).\n≤ 10 solo informa' },
  { u: 'err', f: '¿Dónde se ven los mensajes de error del sistema?', b: 'sys.messages\n(language_id = 3082 → español)' },
  // sp
  { u: 'sp', f: 'Crear o modificar un SP', b: 'CREATE OR ALTER PROCEDURE nombre\n@param TIPO\nAS\nBEGIN … END' },
  { u: 'sp', f: 'Ejecutar un SP', b: "EXEC nombre 'valor'\nEXEC nombre @param = 'valor'" },
  { u: 'sp', f: 'Parámetro de salida', b: '@p_res TIPO OUTPUT\n(y al ejecutar: @var OUTPUT)' },
  { u: 'sp', f: 'Ver los SP existentes', b: 'SELECT * FROM sys.procedures' },
  { u: 'sp', f: 'Calcular el siguiente id', b: 'SELECT @v_id = MAX(Id) + 1 FROM tabla' },
  { u: 'sp', f: 'Validar que algo exista', b: 'IF EXISTS(SELECT 1 FROM tabla WHERE …)' },
  // cursores
  { u: 'cur', f: 'Pasos del cursor (en orden)', b: 'DECLARE → OPEN → FETCH → WHILE → CLOSE → DEALLOCATE' },
  { u: 'cur', f: '@@FETCH_STATUS = 0', b: 'La fila se leyó bien' },
  { u: 'cur', f: '@@FETCH_STATUS = -1', b: 'No hay más filas (o falló)' },
  { u: 'cur', f: 'CLOSE vs DEALLOCATE', b: 'CLOSE cierra (se puede reabrir)\nDEALLOCATE libera todo' },
  { u: 'cur', f: '¿Qué necesita FETCH LAST / ABSOLUTE?', b: 'Un cursor SCROLL' },
  { u: 'cur', f: 'Leer una fila en variables', b: 'FETCH c_nombre INTO @v1, @v2' },
  { u: 'cur', f: '¿Qué pasa si falta el FETCH dentro del WHILE?', b: 'Bucle infinito' },
  { u: 'cur', f: 'REPLICATE(\'*\', 5)', b: '*****' },
  { u: 'cur', f: 'CAST(x AS CHAR(40))', b: 'Rellena a 40 caracteres → alinea columnas' },
  // funciones
  { u: 'fn', f: 'RETURNS vs RETURN', b: 'RETURNS = tipo (cabecera)\nRETURN = valor (cuerpo)' },
  { u: 'fn', f: 'Llamar una función escalar', b: 'SELECT dbo.nombre(param)\n(¡con el esquema!)' },
  { u: 'fn', f: '¿Una función puede hacer PRINT o INSERT?', b: 'No. Solo calcula y devuelve.' },
  { u: 'fn', f: "FORMAT(GETDATE(), 'D', 'es-es')", b: 'Fecha larga en texto\n(sábado, 26 de septiembre de 2026)' },
  { u: 'fn', f: 'Calcular edad', b: 'DATEDIFF(YEAR, FecNac, GETDATE())' },
  { u: 'fn', f: 'Función vs SP', b: 'Función: SELECT, RETURN, sin cambios\nSP: EXEC, OUTPUT, INSERT/UPDATE, PRINT' },
  // transacciones
  { u: 'tx', f: '¿Qué es una transacción?', b: 'Operaciones que se hacen todas o ninguna' },
  { u: 'tx', f: 'Confirmar / deshacer', b: 'COMMIT / ROLLBACK' },
  { u: 'tx', f: 'Punto de guardado', b: 'SAVE TRANSACTION P1\nROLLBACK TRANSACTION P1' },
  { u: 'tx', f: '¿Dónde va el ROLLBACK?', b: 'En el BEGIN CATCH' },
  { u: 'tx', f: 'BEGIN TRAN sin COMMIT ni ROLLBACK', b: 'Las filas quedan bloqueadas para otros' },
  // triggers
  { u: 'trg', f: 'INSERT llena…', b: 'Solo inserted' },
  { u: 'trg', f: 'DELETE llena…', b: 'Solo deleted' },
  { u: 'trg', f: 'UPDATE llena…', b: 'inserted (nuevo) y deleted (viejo)' },
  { u: 'trg', f: 'Desactivar un trigger', b: 'DISABLE TRIGGER nombre ON tabla' },
  { u: 'trg', f: 'Trigger que impide borrar tablas', b: 'ON DATABASE\nAFTER DROP_TABLE' },
  { u: 'trg', f: 'FOR UPDATE es igual a…', b: 'AFTER UPDATE' },
  { u: 'trg', f: 'Revertir la operación en un trigger', b: 'ROLLBACK TRANSACTION' },
  { u: 'trg', f: 'Usuario / equipo / fecha para auditoría', b: 'SUSER_SNAME() / HOST_NAME() / GETDATE()' },
  { u: 'trg', f: 'Ver los triggers existentes', b: 'SELECT * FROM sys.triggers' },
];

/* ---------- Casos para escribir (modo examen) ---------- */
const CASES = [
  {
    id: 'c-cita', unit: 'sp', db: 'clinica', title: 'Registrar una cita',
    text: 'Crea el procedimiento <b>uspRegistrarCita</b> que reciba el id del paciente, el id del médico y la fecha. Debe validar que <b>el paciente y el médico existan</b>; si todo está bien, inserta la cita con estado <code>\'Pendiente\'</code>. Devuelve un mensaje por un parámetro <b>OUTPUT</b>.',
    solution:
`CREATE OR ALTER PROCEDURE uspRegistrarCita
@p_idPaciente INT, @p_idMedico INT, @p_fecha DATETIME,
@p_mensaje VARCHAR(200) OUTPUT
AS
BEGIN
    IF NOT EXISTS(SELECT 1 FROM Pacientes WHERE IdPaciente = @p_idPaciente)
        SET @p_mensaje = 'El paciente no existe'
    ELSE IF NOT EXISTS(SELECT 1 FROM Medicos WHERE IdMedico = @p_idMedico)
        SET @p_mensaje = 'El médico no existe'
    ELSE
    BEGIN
        DECLARE @v_id INT
        SELECT @v_id = ISNULL(MAX(IdCita), 0) + 1 FROM Citas
        INSERT INTO Citas VALUES (@v_id, @p_idPaciente, @p_idMedico, @p_fecha, 'Pendiente')
        SET @p_mensaje = 'Cita ' + CAST(@v_id AS VARCHAR) + ' registrada'
    END
END
GO
DECLARE @msg VARCHAR(200)
EXEC uspRegistrarCita 1, 2, '2026-10-05 09:00', @msg OUTPUT
PRINT @msg`,
    check: [
      ['CREATE (OR ALTER) PROCEDURE', 'CREATE\\s+(OR\\s+ALTER\\s+)?PROC'],
      ['Parámetro OUTPUT', '\\bOUTPUT\\b|\\bOUT\\b'],
      ['Valida con EXISTS', '\\bEXISTS\\s*\\('],
      ['Revisa Pacientes y Medicos', 'PACIENTES[\\s\\S]*MEDICOS|MEDICOS[\\s\\S]*PACIENTES'],
      ['Calcula el id con MAX + 1', 'MAX\\s*\\([^)]*\\)\\s*\\+\\s*1|MAX\\s*\\([^)]*\\)\\s*,\\s*0\\s*\\)\\s*\\+\\s*1'],
      ['INSERT INTO Citas', 'INSERT\\s+INTO\\s+(DBO\\.)?CITAS'],
    ],
  },
  {
    id: 'c-venta', unit: 'tx', db: 'farmacia', title: 'Vender un medicamento',
    text: 'Crea <b>uspVender</b> que reciba id de medicamento y cantidad. Si el stock no alcanza, lanza un error con <b>RAISERROR</b>. Si alcanza, en una <b>transacción</b>: registra la venta, su detalle y descuenta el stock. Si algo falla, deshaz todo.',
    solution:
`CREATE OR ALTER PROCEDURE uspVender
@p_idMed INT, @p_cantidad INT
AS
BEGIN
    DECLARE @v_stock INT, @v_precio DECIMAL(8,2), @v_idVenta INT
    SELECT @v_stock = Stock, @v_precio = Precio
    FROM Medicamentos WHERE IdMed = @p_idMed

    BEGIN TRY
        IF @v_stock < @p_cantidad
            RAISERROR('STOCK INSUFICIENTE', 16, 1)

        BEGIN TRANSACTION
            SELECT @v_idVenta = ISNULL(MAX(IdVenta), 0) + 1 FROM Ventas
            INSERT INTO Ventas VALUES (@v_idVenta, GETDATE(), @v_precio * @p_cantidad)
            INSERT INTO DetalleVenta VALUES (@v_idVenta, @p_idMed, @p_cantidad, @v_precio)
            UPDATE Medicamentos SET Stock = Stock - @p_cantidad WHERE IdMed = @p_idMed
        COMMIT TRANSACTION
        PRINT 'Venta registrada'
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        PRINT 'Error: ' + ERROR_MESSAGE()
    END CATCH
END`,
    check: [
      ['Lee el Stock', '\\bSTOCK\\b'],
      ['RAISERROR con severidad 16', 'RAISERROR\\s*\\([^,]+,\\s*1[1-9]'],
      ['BEGIN TRY / BEGIN CATCH', 'BEGIN\\s+TRY[\\s\\S]*BEGIN\\s+CATCH'],
      ['BEGIN TRANSACTION', 'BEGIN\\s+TRAN'],
      ['COMMIT', '\\bCOMMIT\\b'],
      ['ROLLBACK en el CATCH', 'CATCH[\\s\\S]*ROLLBACK'],
      ['Descuenta el stock (UPDATE)', 'UPDATE\\s+(DBO\\.)?MEDICAMENTOS[\\s\\S]*STOCK\\s*=\\s*STOCK\\s*-'],
    ],
  },
  {
    id: 'c-aprobados', unit: 'cur', db: 'colegio', title: 'Aprobados y desaprobados',
    text: 'Con un <b>cursor</b>, imprime el nombre y la nota de cada alumno en el curso que se reciba como parámetro (<b>uspReporteCurso @p_idCurso</b>). Al final muestra cuántos <b>aprobaron</b> (nota ≥ 11) y cuántos <b>desaprobaron</b>.',
    solution:
`CREATE OR ALTER PROCEDURE uspReporteCurso
@p_idCurso INT
AS
BEGIN
    DECLARE c_notas CURSOR FOR
        SELECT a.Nombre, n.Nota
        FROM Notas n INNER JOIN Alumnos a ON n.IdAlumno = a.IdAlumno
        WHERE n.IdCurso = @p_idCurso
    DECLARE @v_nombre VARCHAR(60), @v_nota DECIMAL(4,2),
            @aprob INT = 0, @desap INT = 0

    OPEN c_notas
    FETCH c_notas INTO @v_nombre, @v_nota
    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT CAST(@v_nombre AS CHAR(30)) + CAST(@v_nota AS VARCHAR)
        IF @v_nota >= 11 SET @aprob = @aprob + 1
        ELSE SET @desap = @desap + 1
        FETCH c_notas INTO @v_nombre, @v_nota
    END
    CLOSE c_notas
    DEALLOCATE c_notas

    PRINT 'Aprobados: ' + CAST(@aprob AS VARCHAR)
    PRINT 'Desaprobados: ' + CAST(@desap AS VARCHAR)
END`,
    check: [
      ['DECLARE … CURSOR FOR', 'CURSOR\\s+(SCROLL\\s+)?FOR'],
      ['JOIN Notas con Alumnos', 'JOIN'],
      ['OPEN', '\\bOPEN\\b'],
      ['WHILE @@FETCH_STATUS = 0', 'WHILE\\s*\\(?\\s*@@FETCH_STATUS\\s*=\\s*0'],
      ['Dos FETCH … INTO', 'FETCH[\\s\\S]*INTO[\\s\\S]*FETCH[\\s\\S]*INTO'],
      ['Contadores (+ 1)', '\\+\\s*1'],
      ['CLOSE y DEALLOCATE', 'CLOSE[\\s\\S]*DEALLOCATE'],
    ],
  },
  {
    id: 'c-socios', unit: 'cur', db: 'biblioteca', title: 'Préstamos por socio (anidado)',
    text: 'Usando <b>cursores anidados</b>, por cada socio imprime su nombre y debajo el <b>título</b> y la <b>fecha</b> de cada libro que se prestó.',
    solution:
`DECLARE c_socios CURSOR FOR SELECT IdSocio, Nombre FROM Socios
DECLARE @v_idSocio INT, @v_nombre VARCHAR(60)
OPEN c_socios
FETCH c_socios INTO @v_idSocio, @v_nombre
WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT 'Socio: ' + @v_nombre

    DECLARE c_prest CURSOR FOR
        SELECT l.Titulo, p.FechaPrestamo
        FROM Prestamos p INNER JOIN Libros l ON p.IdLibro = l.IdLibro
        WHERE p.IdSocio = @v_idSocio
    DECLARE @v_titulo VARCHAR(100), @v_fecha DATE
    OPEN c_prest
    FETCH c_prest INTO @v_titulo, @v_fecha
    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT SPACE(5) + @v_titulo + ' - ' + CONVERT(VARCHAR, @v_fecha, 103)
        FETCH c_prest INTO @v_titulo, @v_fecha
    END
    CLOSE c_prest
    DEALLOCATE c_prest

    FETCH c_socios INTO @v_idSocio, @v_nombre
END
CLOSE c_socios
DEALLOCATE c_socios`,
    check: [
      ['Dos cursores declarados', 'CURSOR[\\s\\S]*CURSOR'],
      ['El interno filtra por el socio actual', 'IDSOCIO\\s*=\\s*@'],
      ['JOIN con Libros para el título', 'JOIN\\s+(DBO\\.)?LIBROS'],
      ['WHILE @@FETCH_STATUS dos veces', '@@FETCH_STATUS[\\s\\S]*@@FETCH_STATUS'],
      ['CLOSE + DEALLOCATE del interno y el externo', 'DEALLOCATE[\\s\\S]*DEALLOCATE'],
    ],
  },
  {
    id: 'c-boleto', unit: 'fn', db: 'cine', title: 'Total de boletos',
    text: 'Crea la función <b>dbo.fu_total</b> que reciba el id de una función de cine y una cantidad de boletos, y devuelva el <b>total a pagar</b> (precio × cantidad). Luego úsala en un SELECT que muestre cada función y cuánto cuestan 3 boletos.',
    solution:
`CREATE OR ALTER FUNCTION dbo.fu_total(@p_idFuncion INT, @p_cantidad INT)
RETURNS DECIMAL(8,2)
AS
BEGIN
    DECLARE @v_precio DECIMAL(6,2)
    SELECT @v_precio = Precio FROM Funciones WHERE IdFuncion = @p_idFuncion
    RETURN @v_precio * @p_cantidad
END
GO
SELECT IdFuncion, Precio, dbo.fu_total(IdFuncion, 3) AS Total3
FROM Funciones`,
    check: [
      ['CREATE FUNCTION', 'CREATE\\s+(OR\\s+ALTER\\s+)?FUNCTION'],
      ['RETURNS tipo', '\\bRETURNS\\b'],
      ['Lee el Precio de Funciones', 'PRECIO[\\s\\S]*FROM\\s+(DBO\\.)?FUNCIONES'],
      ['RETURN precio * cantidad', 'RETURN[^\\n]*\\*'],
      ['La usa con dbo. en un SELECT', 'SELECT[\\s\\S]*DBO\\.FU_TOTAL\\s*\\('],
    ],
  },
  {
    id: 'c-estadia', unit: 'fn', db: 'hotel', title: 'Costo de una reserva + vista',
    text: 'Crea <b>dbo.fu_costo_reserva(@idReserva)</b> que devuelva PrecioNoche × número de noches. Luego crea la vista <b>vw_reservas</b> con el nombre del huésped, la habitación y el costo.',
    solution:
`CREATE OR ALTER FUNCTION dbo.fu_costo_reserva(@p_idReserva INT)
RETURNS DECIMAL(10,2)
AS
BEGIN
    DECLARE @v_costo DECIMAL(10,2)
    SELECT @v_costo = h.PrecioNoche * DATEDIFF(DAY, r.FecIngreso, r.FecSalida)
    FROM Reservas r INNER JOIN Habitaciones h ON r.NumHab = h.NumHab
    WHERE r.IdReserva = @p_idReserva
    RETURN @v_costo
END
GO
CREATE OR ALTER VIEW vw_reservas
AS
SELECT hu.Nombre, r.NumHab, dbo.fu_costo_reserva(r.IdReserva) AS Costo
FROM Reservas r INNER JOIN Huespedes hu ON r.IdHuesped = hu.IdHuesped
GO
SELECT * FROM vw_reservas`,
    check: [
      ['CREATE FUNCTION … RETURNS', 'FUNCTION[\\s\\S]*RETURNS'],
      ['DATEDIFF(DAY, …)', 'DATEDIFF\\s*\\(\\s*(DAY|DD|D)\\s*,'],
      ['JOIN Reservas con Habitaciones', 'JOIN\\s+(DBO\\.)?HABITACIONES|HABITACIONES[\\s\\S]*JOIN'],
      ['RETURN', '\\bRETURN\\b'],
      ['CREATE VIEW', 'CREATE\\s+(OR\\s+ALTER\\s+)?VIEW'],
      ['La vista usa la función', 'VIEW[\\s\\S]*FU_COSTO_RESERVA'],
    ],
  },
  {
    id: 'c-transfer', unit: 'tx', db: 'banco', title: 'Transferencia segura',
    text: 'Crea <b>uspTransferir</b> (cuenta origen, cuenta destino, monto). Valida que el origen tenga saldo suficiente (si no, RAISERROR). Resta, suma y registra el movimiento dentro de una <b>transacción</b> con TRY/CATCH.',
    solution:
`CREATE OR ALTER PROCEDURE uspTransferir
@p_origen VARCHAR(12), @p_destino VARCHAR(12), @p_monto DECIMAL(12,2)
AS
BEGIN
    BEGIN TRY
        IF (SELECT Saldo FROM Cuentas WHERE NumCuenta = @p_origen) < @p_monto
            RAISERROR('SALDO INSUFICIENTE', 16, 1)

        BEGIN TRANSACTION
            UPDATE Cuentas SET Saldo = Saldo - @p_monto WHERE NumCuenta = @p_origen
            UPDATE Cuentas SET Saldo = Saldo + @p_monto WHERE NumCuenta = @p_destino
            INSERT INTO Movimientos
            VALUES ((SELECT ISNULL(MAX(IdMov), 0) + 1 FROM Movimientos),
                    @p_origen, 'T', @p_monto, GETDATE())
        COMMIT TRANSACTION
        PRINT 'Transferencia exitosa'
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        PRINT 'Error: ' + ERROR_MESSAGE()
    END CATCH
END`,
    check: [
      ['Valida el Saldo', '\\bSALDO\\b[\\s\\S]*<|<[\\s\\S]*\\bSALDO\\b'],
      ['RAISERROR', 'RAISERROR'],
      ['BEGIN TRANSACTION', 'BEGIN\\s+TRAN'],
      ['Resta y suma (2 UPDATE)', 'UPDATE[\\s\\S]*UPDATE'],
      ['COMMIT', '\\bCOMMIT\\b'],
      ['ROLLBACK en el CATCH', 'CATCH[\\s\\S]*ROLLBACK'],
    ],
  },
  {
    id: 'c-audit', unit: 'trg', db: 'gimnasio', title: 'Auditar membresías',
    text: 'Crea un trigger en <b>Membresias</b> que, ante INSERT, UPDATE o DELETE, guarde en <b>Auditoria</b> qué operación fue, el usuario (<code>SUSER_SNAME()</code>) y la fecha.',
    solution:
`CREATE OR ALTER TRIGGER trg_audit_membresias
ON Membresias
FOR INSERT, UPDATE, DELETE
AS
BEGIN
    DECLARE @v_accion VARCHAR(100)
    IF EXISTS(SELECT 1 FROM inserted) AND EXISTS(SELECT 1 FROM deleted)
        SET @v_accion = 'ACTUALIZACIÓN'
    ELSE IF EXISTS(SELECT 1 FROM inserted)
        SET @v_accion = 'INSERCIÓN'
    ELSE
        SET @v_accion = 'ELIMINACIÓN'

    INSERT INTO Auditoria VALUES (@v_accion, SUSER_SNAME(), GETDATE())
END`,
    check: [
      ['CREATE TRIGGER … ON Membresias', 'TRIGGER[\\s\\S]*ON\\s+(DBO\\.)?MEMBRESIAS'],
      ['FOR/AFTER INSERT, UPDATE, DELETE', '(FOR|AFTER)\\s+INSERT\\s*,\\s*UPDATE\\s*,\\s*DELETE|(FOR|AFTER)[\\s\\S]*INSERT[\\s\\S]*UPDATE[\\s\\S]*DELETE'],
      ['Usa inserted y deleted', 'INSERTED[\\s\\S]*DELETED|DELETED[\\s\\S]*INSERTED'],
      ['UPDATE = los dos EXISTS', 'EXISTS[\\s\\S]*AND[\\s\\S]*EXISTS'],
      ['INSERT INTO Auditoria', 'INSERT\\s+INTO\\s+(DBO\\.)?AUDITORIA'],
      ['SUSER_SNAME() y GETDATE()', 'SUSER_SNAME\\s*\\(\\s*\\)[\\s\\S]*GETDATE|GETDATE[\\s\\S]*SUSER_SNAME'],
    ],
  },
  {
    id: 'c-precio', unit: 'trg', db: 'hotel', title: 'Máximo 30 % de aumento',
    text: 'Crea un trigger en <b>Habitaciones</b> que no permita subir <code>PrecioNoche</code> más del 30 %. Si pasa, revierte y muestra con RAISERROR (severidad 10) el máximo permitido.',
    solution:
`CREATE OR ALTER TRIGGER trg_precio_hab
ON Habitaciones
FOR UPDATE
AS
BEGIN
    DECLARE @v_actual DECIMAL(8,2), @v_nuevo DECIMAL(8,2), @v_msg VARCHAR(200)
    SELECT @v_actual = PrecioNoche FROM deleted
    SELECT @v_nuevo  = PrecioNoche FROM inserted
    IF @v_nuevo > 1.3 * @v_actual
    BEGIN
        SET @v_msg = 'MÁXIMO PERMITIDO: ' + CAST(1.3 * @v_actual AS VARCHAR)
        ROLLBACK TRANSACTION
        RAISERROR(@v_msg, 10, 1)
    END
END`,
    check: [
      ['TRIGGER … ON Habitaciones FOR UPDATE', 'ON\\s+(DBO\\.)?HABITACIONES[\\s\\S]*(FOR|AFTER)\\s+UPDATE'],
      ['Precio viejo desde deleted', 'FROM\\s+DELETED'],
      ['Precio nuevo desde inserted', 'FROM\\s+INSERTED'],
      ['Compara con 1.3 ×', '1\\.3|1\\.30|130'],
      ['ROLLBACK', 'ROLLBACK'],
      ['RAISERROR severidad 10', 'RAISERROR\\s*\\([^,]+,\\s*10'],
    ],
  },
  {
    id: 'c-notas', unit: 'err', db: 'colegio', title: 'Registrar nota válida',
    text: 'Crea <b>uspRegistrarNota</b> (alumno, curso, nota). Si la nota no está entre 0 y 20 lanza un error con RAISERROR. Controla cualquier error con TRY/CATCH mostrando <code>ERROR_MESSAGE()</code>.',
    solution:
`CREATE OR ALTER PROCEDURE uspRegistrarNota
@p_idAlumno INT, @p_idCurso INT, @p_nota DECIMAL(4,2)
AS
BEGIN
    BEGIN TRY
        IF @p_nota NOT BETWEEN 0 AND 20
            RAISERROR('LA NOTA DEBE ESTAR ENTRE 0 Y 20', 16, 1)
        INSERT INTO Notas VALUES (@p_idAlumno, @p_idCurso, @p_nota)
        PRINT 'Nota registrada'
    END TRY
    BEGIN CATCH
        PRINT 'Error: ' + ERROR_MESSAGE()
    END CATCH
END`,
    check: [
      ['CREATE PROCEDURE', 'CREATE\\s+(OR\\s+ALTER\\s+)?PROC'],
      ['Valida el rango 0–20', 'BETWEEN\\s+0\\s+AND\\s+20|<\\s*0[\\s\\S]*>\\s*20|>\\s*20[\\s\\S]*<\\s*0'],
      ['RAISERROR severidad ≥ 11', 'RAISERROR\\s*\\([^,]+,\\s*1[1-9]'],
      ['BEGIN TRY … BEGIN CATCH', 'BEGIN\\s+TRY[\\s\\S]*BEGIN\\s+CATCH'],
      ['ERROR_MESSAGE()', 'ERROR_MESSAGE\\s*\\('],
      ['INSERT INTO Notas', 'INSERT\\s+INTO\\s+(DBO\\.)?NOTAS'],
    ],
  },
  {
    id: 'c-impuesto', unit: 'sp', db: null, title: 'uspCalculaImpuesto (BD Negocios)',
    text: 'En la BD <b>Negocios</b>: crea <b>uspCalculaImpuesto</b> que reciba el IdProducto y el porcentaje de impuesto, y devuelva por <b>OUTPUT</b> el monto (PrecioUnidad × porcentaje / 100). Muestra cómo ejecutarlo.',
    solution:
`CREATE OR ALTER PROCEDURE uspCalculaImpuesto
@p_idProducto INT, @p_pct DECIMAL(5,2), @p_impuesto DECIMAL(12,2) OUTPUT
AS
BEGIN
    SELECT @p_impuesto = PrecioUnidad * @p_pct / 100
    FROM Compras.productos
    WHERE IdProducto = @p_idProducto
END
GO
DECLARE @imp DECIMAL(12,2)
EXEC uspCalculaImpuesto 1, 18, @imp OUTPUT
PRINT 'Impuesto: ' + CAST(@imp AS VARCHAR)`,
    check: [
      ['CREATE PROCEDURE', 'CREATE\\s+(OR\\s+ALTER\\s+)?PROC'],
      ['OUTPUT en la declaración y en el EXEC', 'OUTPUT[\\s\\S]*EXEC[\\s\\S]*OUTPUT'],
      ['Usa Compras.productos', 'COMPRAS\\.PRODUCTOS'],
      ['PrecioUnidad × % / 100', 'PRECIOUNIDAD\\s*\\*[\\s\\S]*\\/\\s*100'],
      ['DECLARE de la variable antes del EXEC', 'DECLARE[\\s\\S]*EXEC'],
    ],
  },
  {
    id: 'c-vista', unit: 'fn', db: null, title: 'Vista de empleados (BD Negocios)',
    text: 'En la BD <b>Negocios</b>: crea una vista con el IdEmpleado, nombre completo, <b>edad</b>, descripción del cargo y los <b>meses</b> que lleva trabajando. Luego consúltala.',
    solution:
`CREATE OR ALTER VIEW RRHH.vw_empleados
AS
SELECT e.IdEmpleado,
       e.NomEmpleado + ' ' + e.ApeEmpleado      AS NombreCompleto,
       DATEDIFF(YEAR, e.FecNac, GETDATE())       AS Edad,
       c.desCargo,
       DATEDIFF(MONTH, e.FecContrata, GETDATE()) AS MesesLaborando
FROM RRHH.empleados e
INNER JOIN RRHH.Cargos c ON e.idCargo = c.idcargo
GO
SELECT * FROM RRHH.vw_empleados`,
    check: [
      ['CREATE VIEW', 'CREATE\\s+(OR\\s+ALTER\\s+)?VIEW'],
      ['Nombre completo concatenado', 'NOMEMPLEADO\\s*\\+|APEEMPLEADO\\s*\\+'],
      ['Edad con DATEDIFF(YEAR…)', 'DATEDIFF\\s*\\(\\s*(YEAR|YY|YYYY)'],
      ['Meses con DATEDIFF(MONTH…)', 'DATEDIFF\\s*\\(\\s*(MONTH|MM|M)\\s*,'],
      ['JOIN con RRHH.Cargos', 'JOIN\\s+RRHH\\.CARGOS'],
      ['Consulta la vista', 'SELECT\\s+\\*\\s+FROM[\\s\\S]*VW_'],
    ],
  },
];
