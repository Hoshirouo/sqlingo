/* =========================================================
   Práctica con OTRAS bases de datos (dbs.js) + plantillas
   genéricas. Se agrega a UNITS antes de que arranque app.js.
   Las preguntas con `db` muestran el esquema de esa BD.
   ========================================================= */
(() => {
  const U = (id) => UNITS.find((u) => u.id === id);
  const add = (id, qs) => U(id).qs.push(...qs);
  const tpl = (id, code, p) => U(id).cheat.unshift({ h: '🧩 Plantilla para CUALQUIER base de datos', p: p || 'Cambia lo que está entre <code>&lt; &gt;</code> por las tablas y columnas del enunciado.', code });

  /* ─────────── Nueva unidad: leer una BD desconocida ─────────── */
  UNITS.splice(1, 0, {
    id: 'nueva', title: 'Leer una BD nueva', sub: 'Cómo enfrentar tablas que nunca viste', icon: '🔎', color: 'blue',
    cheat: [
      { h: 'Si en el examen te dan otra BD', p: '1) Mira qué <b>tablas</b> hay y qué guarda cada una.<br>2) Ubica las <b>PK</b> 🔑 (identifican cada fila) y las <b>FK</b> 🔗 (unen tablas).<br>3) Subraya en el enunciado los datos que te piden y busca en qué <b>columna</b> está cada uno.<br>4) Si están en tablas distintas, únelas con <code>INNER JOIN … ON fk = pk</code>.<br>5) Si la tabla tiene esquema (<code>Ventas.clientes</code>) escríbelo; si no, basta el nombre.' },
      { h: 'JOIN genérico', code:
`SELECT a.<columna>, b.<columna>
FROM <TablaHija> a
INNER JOIN <TablaPadre> b ON a.<IdFK> = b.<IdPK>
WHERE <condicion>` },
      { h: 'Traducción rápida (Negocios → otras BD)', p: '<b>productos.UnidadesEnExistencia</b> = Libros.Stock = Medicamentos.Stock = Funciones.AsientosLibres<br><b>clientes → pedidoscabe</b> = Socios → Prestamos = Pacientes → Citas = Alumnos → Notas<br><b>CUENTAS</b> (transacciones) = Cuentas del Banco<br><b>RRHH.Cargos</b> (auditoría) = cualquier tabla que quieran vigilar' },
      { h: 'Bases de práctica', dbs: Object.keys(DBS) },
    ],
    qs: [
      { t: 'mc', q: 'En el examen te dan una BD que nunca viste. ¿Qué haces <b>primero</b>?', o: ['Revisar las tablas, sus PK/FK y en qué columna está cada dato que piden', 'Copiar el código de BD Negocios tal cual', 'Empezar por el trigger', 'Crear una tabla nueva'], a: 0 },
      { t: 'mc', db: 'biblioteca', q: '¿Dónde ves cuántos ejemplares quedan de un libro?', o: ['Libros.Stock', 'Prestamos.IdLibro', 'Categorias.Nombre', 'Socios.IdSocio'], a: 0 },
      { t: 'mc', db: 'biblioteca', q: 'Quieres listar el <b>título</b> del libro y el <b>nombre</b> del socio de cada préstamo. ¿Qué tablas unes?', o: ['Prestamos + Libros + Socios', 'Solo Prestamos', 'Libros + Categorias', 'Socios + Categorias'], a: 0 },
      { t: 'fill', db: 'biblioteca', q: 'Completa el JOIN.', code: 'SELECT l.Titulo, s.Nombre\nFROM Prestamos p\nINNER JOIN Libros l ON p.IdLibro = l.___\nINNER JOIN Socios s ON p.IdSocio = s.IdSocio', a: [['IdLibro']] },
      { t: 'mc', db: 'clinica', q: '¿Qué columna de <b>Citas</b> es la FK hacia <b>Medicos</b>?', o: ['IdMedico', 'IdCita', 'Especialidad', 'Estado'], a: 0 },
      { t: 'write', db: 'clinica', q: 'Escribe la consulta que muestra todos los médicos de la especialidad <b>Pediatría</b>.', a: ["SELECT * FROM Medicos WHERE Especialidad = 'Pediatría'", "SELECT * FROM Medicos WHERE Especialidad = 'Pediatria'"], hint: "SELECT * FROM <tabla> WHERE <columna> = 'valor'" },
      { t: 'mc', db: 'colegio', q: 'La tabla <b>Notas</b> no tiene IdNota. ¿Cuál es su clave primaria?', o: ['La combinación (IdAlumno, IdCurso)', 'Nota', 'IdAlumno solo', 'No tiene clave'], a: 0, ex: 'Es una PK compuesta: un alumno tiene una sola nota por curso.' },
      { t: 'match', db: 'banco', q: 'Une cada tabla con lo que guarda', pairs: [['Clientes', 'Datos de la persona'], ['Cuentas', 'Saldo de cada cuenta'], ['Movimientos', 'Depósitos y retiros']] },
      { t: 'mc', db: 'cine', q: 'Antes de vender boletos, ¿qué columna debes revisar (equivale al “stock”)?', o: ['Funciones.AsientosLibres', 'Boletos.Cantidad', 'Peliculas.Duracion', 'Funciones.Sala'], a: 0 },
      { t: 'mc', db: 'farmacia', q: '¿Por qué falla <code>DELETE FROM Medicamentos WHERE IdMed = 3</code> si ese medicamento ya se vendió?', o: ['DetalleVenta.IdMed lo referencia (FK) → error 547', 'Porque Stock es INT', 'Porque falta el esquema', 'Porque DELETE necesita COMMIT'], a: 0 },
      { t: 'tf', q: 'Si una tabla está en un esquema (ej. <code>Ventas.clientes</code>) hay que escribir <code>esquema.tabla</code>; si está en <b>dbo</b> puedes poner solo el nombre.', a: true },
      { t: 'match', q: 'Traduce de BD Negocios a otras BD', pairs: [['productos.UnidadesEnExistencia', 'Medicamentos.Stock'], ['clientes → pedidoscabe', 'Pacientes → Citas'], ['RRHH.Cargos', 'Planes (Gimnasio)']] },
      { t: 'mc', db: 'hotel', q: '¿Qué tabla une a un huésped con una habitación?', o: ['Reservas', 'Habitaciones', 'Huespedes', 'Ninguna'], a: 0 },
    ],
  });

  /* ─────────── Errores ─────────── */
  tpl('err',
`DECLARE @v_<dato> <TIPO>
BEGIN TRY
    SELECT @v_<dato> = <columna> FROM <tabla> WHERE <IdPK> = @<id>
    IF <condición de error>                 -- ej: @v_stock < @cantidad
        RAISERROR('<MENSAJE>', 16, 1)       -- 16 → salta al CATCH
    PRINT '<todo bien>'
END TRY
BEGIN CATCH
    PRINT 'Error: ' + ERROR_MESSAGE()
END CATCH`);
  add('err', [
    { t: 'fill', db: 'farmacia', q: 'Adapta el “stock insuficiente” a la farmacia.', code: 'SELECT @v_stock = ___\nFROM Medicamentos\nWHERE IdMed = @p_idMed\nIF @v_stock < @p_cantidad\n    RAISERROR(\'STOCK INSUFICIENTE\', 16, 1)', a: [['Stock']] },
    { t: 'mc', db: 'biblioteca', q: '<code>DELETE FROM Socios WHERE IdSocio = 10</code> falla. El socio 10 tiene préstamos. ¿Qué número de error es?', o: ['547', '8134', '50000', '208'], a: 0 },
    { t: 'fill', db: 'colegio', q: 'Lanza un error si la nota no está entre 0 y 20.', code: "IF @p_nota NOT BETWEEN 0 AND 20\n    ___('NOTA FUERA DE RANGO', 16, 1)", a: [['RAISERROR']] },
    { t: 'build', db: 'cine', q: 'Si <code>AsientosLibres &lt; @cantidad</code>, lanza el error “NO HAY ASIENTOS”.', words: ['RAISERROR', '(', "'NO HAY ASIENTOS'", ',', '16', ',', '1', ')'], extra: ['PRINT', 'COMMIT', '10'] },
    { t: 'mc', db: 'banco', q: 'La cuenta tiene saldo 100 y se intenta retirar 300. ¿Qué imprime?', code: "BEGIN TRY\n    SELECT @v_saldo = Saldo FROM Cuentas WHERE NumCuenta = @p_cuenta\n    IF @v_saldo < @p_monto\n        RAISERROR('SALDO INSUFICIENTE', 16, 1)\n    PRINT 'RETIRO OK'\nEND TRY\nBEGIN CATCH\n    PRINT 'Error: ' + ERROR_MESSAGE()\nEND CATCH", o: ['Error: SALDO INSUFICIENTE', 'RETIRO OK', 'RETIRO OK\nError: SALDO INSUFICIENTE', 'Nada'], a: 0 },
    { t: 'mc', db: 'hotel', q: 'Quieres avisar (sin detener nada) que una habitación está en mantenimiento. ¿Qué severidad usas?', o: ['10 (solo informativo)', '16', '19', '25'], a: 0 },
  ]);

  /* ─────────── Procedimientos ─────────── */
  tpl('sp',
`CREATE OR ALTER PROCEDURE usp<Accion>
@p_<entrada> <TIPO>,
@p_mensaje VARCHAR(200) OUTPUT        -- si piden devolver algo
AS
BEGIN
    IF EXISTS(SELECT 1 FROM <tabla> WHERE <columna> = @p_<entrada>)
        SET @p_mensaje = 'Ya existe'
    ELSE
    BEGIN
        DECLARE @v_id INT
        SELECT @v_id = MAX(<IdPK>) + 1 FROM <tabla>
        INSERT INTO <tabla> VALUES (@v_id, @p_<entrada>, ...)
        SET @p_mensaje = 'Registrado con id ' + CAST(@v_id AS VARCHAR)
    END
END
GO
DECLARE @msg VARCHAR(200)
EXEC usp<Accion> <valor>, @msg OUTPUT
PRINT @msg`);
  add('sp', [
    { t: 'fill', db: 'clinica', q: 'SP que lista las citas de un médico.', code: 'CREATE OR ALTER PROCEDURE uspCitasPorMedico\n@p_idMedico INT\nAS\nBEGIN\n    SELECT * FROM Citas\n    WHERE IdMedico = ___\nEND', a: [['@p_idMedico']] },
    { t: 'fill', db: 'colegio', q: 'SP que devuelve el promedio de un alumno por OUTPUT.', code: 'CREATE OR ALTER PROCEDURE uspPromedio\n@p_idAlumno INT, @p_promedio DECIMAL(4,2) OUTPUT\nAS\nBEGIN\n    SELECT @p_promedio = ___(Nota)\n    FROM Notas WHERE IdAlumno = @p_idAlumno\nEND', a: [['AVG']] },
    { t: 'order', db: 'colegio', q: 'Ejecuta <b>uspPromedio</b> para el alumno 7 y muestra el resultado.', lines: ['DECLARE @prom DECIMAL(4,2)', 'EXEC uspPromedio 7, @prom OUTPUT', "PRINT 'Promedio: ' + CAST(@prom AS VARCHAR)"] },
    { t: 'mc', db: 'biblioteca', q: 'SP para registrar un préstamo. Antes de insertar, ¿qué validas con IF EXISTS?', o: ['Que el socio exista en Socios y el libro en Libros', 'Que exista la categoría', 'Que Prestamos esté vacía', 'Nada'], a: 0 },
    { t: 'mc', db: 'gimnasio', q: 'Para calcular el id de un nuevo socio usas…', o: ['SELECT @v_id = MAX(IdSocio) + 1 FROM Socios', 'SELECT @v_id = MAX(IdPlan) + 1 FROM Planes', 'SELECT @v_id = COUNT(*) FROM Membresias', 'SET @v_id = IdSocio + 1'], a: 0 },
    { t: 'build', db: 'hotel', q: 'Ejecuta <code>uspReservar</code> pasando el huésped 4 y la habitación 201 <b>por nombre</b>.', words: ['EXEC', 'uspReservar', '@p_idHuesped', '=', '4', ',', '@p_numHab', '=', '201'], extra: ['OUTPUT', 'SELECT', '('] },
  ]);

  /* ─────────── Cursores ─────────── */
  tpl('cur',
`DECLARE c_<nombre> CURSOR FOR
    SELECT <col1>, <col2> FROM <tabla> WHERE <filtro>
DECLARE @v_<col1> <TIPO>, @v_<col2> <TIPO>,
        @cant INT = 0, @total DECIMAL(12,2) = 0

OPEN c_<nombre>
FETCH c_<nombre> INTO @v_<col1>, @v_<col2>     -- mismas columnas y orden
WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT @v_<col1> + ' ' + CAST(@v_<col2> AS VARCHAR)
    SET @cant  = @cant + 1                       -- contador
    SET @total = @total + @v_<col2>              -- acumulador
    FETCH c_<nombre> INTO @v_<col1>, @v_<col2>   -- ¡un solo FETCH aquí!
END
CLOSE c_<nombre>
DEALLOCATE c_<nombre>
PRINT 'Cantidad: ' + CAST(@cant AS VARCHAR)`);
  add('cur', [
    { t: 'fill', db: 'biblioteca', q: 'Cursor que recorre el título y stock de cada libro.', code: 'DECLARE c_libros CURSOR FOR\nSELECT Titulo, Stock FROM ___', a: [['Libros', 'dbo.Libros']] },
    { t: 'mc', db: 'farmacia', q: 'El cursor es <code>SELECT Nombre, Precio, Stock FROM Medicamentos</code>. ¿Cuántas variables van en el FETCH … INTO?', o: ['3', '1', '5', 'Las que quieras'], a: 0 },
    { t: 'fill', db: 'cine', q: 'Acumula el precio de todas las funciones.', code: 'FETCH c_funciones INTO @v_idFuncion, @v_precio\nWHILE @@FETCH_STATUS = 0\nBEGIN\n    SET @v_total = @v_total + ___\n    FETCH c_funciones INTO @v_idFuncion, @v_precio\nEND', a: [['@v_precio']] },
    { t: 'mc', db: 'clinica', q: 'Cursores anidados: por cada médico, sus citas. ¿Qué filtro lleva el cursor <b>interno</b>?', o: ['SELECT Fecha, Estado FROM Citas WHERE IdMedico = @v_idMedico', 'SELECT * FROM Medicos', 'SELECT Fecha FROM Citas', 'SELECT * FROM Pacientes WHERE IdMedico = 1'], a: 0 },
    { t: 'order', db: 'colegio', q: 'Ordena el cursor que imprime el nombre de cada alumno.', lines: ['DECLARE c_alumnos CURSOR FOR SELECT Nombre FROM Alumnos', 'OPEN c_alumnos', 'FETCH c_alumnos INTO @v_nombre', 'WHILE @@FETCH_STATUS = 0', 'BEGIN', 'PRINT @v_nombre', 'FETCH c_alumnos INTO @v_nombre', 'END', 'CLOSE c_alumnos', 'DEALLOCATE c_alumnos'] },
  ]);

  /* ─────────── Funciones ─────────── */
  tpl('fn',
`CREATE OR ALTER FUNCTION dbo.fu_<nombre>(@p_<param> <TIPO>)
RETURNS <TIPO_RESULTADO>
AS
BEGIN
    DECLARE @v_res <TIPO_RESULTADO>
    SELECT @v_res = <cálculo con columnas>
    FROM <tabla> WHERE <IdPK> = @p_<param>
    RETURN @v_res
END
GO
SELECT <columna>, dbo.fu_<nombre>(<IdPK>) AS <alias>
FROM <tabla>`);
  add('fn', [
    { t: 'fill', db: 'hotel', q: 'Función que calcula cuántas noches dura una reserva.', code: 'CREATE OR ALTER FUNCTION dbo.fu_noches(@p_ingreso DATE, @p_salida DATE)\nRETURNS INT\nAS\nBEGIN\n    RETURN DATEDIFF(___, @p_ingreso, @p_salida)\nEND', a: [['DAY', 'DD', 'D']] },
    { t: 'mc', db: 'colegio', q: '¿Qué devuelve <code>dbo.fu_estado(10)</code>?', code: "CREATE OR ALTER FUNCTION dbo.fu_estado(@p_nota DECIMAL(4,2))\nRETURNS VARCHAR(15)\nAS\nBEGIN\n    RETURN CASE WHEN @p_nota >= 11 THEN 'Aprobado'\n                ELSE 'Desaprobado' END\nEND", o: ['Desaprobado', 'Aprobado', 'NULL', '10'], a: 0 },
    { t: 'mc', db: 'farmacia', q: 'Tienes <code>dbo.fu_igv(@precio)</code>. ¿Cómo muestras el IGV de <b>todos</b> los medicamentos?', o: ['SELECT Nombre, dbo.fu_igv(Precio) AS IGV FROM Medicamentos', 'EXEC dbo.fu_igv Medicamentos', 'SELECT dbo.fu_igv FROM Medicamentos', 'PRINT dbo.fu_igv(Medicamentos)'], a: 0 },
    { t: 'fill', db: 'gimnasio', q: 'Días que le quedan a una membresía.', code: 'DECLARE @v_fecFin DATE\nSELECT @v_fecFin = FecFin FROM Membresias\nWHERE IdMembresia = @p_idMembresia\nRETURN DATEDIFF(DAY, GETDATE(), ___)', a: [['@v_fecFin']] },
    { t: 'build', db: 'cine', q: 'Muestra cada función con su precio con 20 % de descuento usando <code>dbo.fu_descuento</code>.', words: ['SELECT', 'IdFuncion', ',', 'dbo.fu_descuento', '(', 'Precio', ',', '20', ')', 'FROM', 'Funciones'], extra: ['EXEC', 'Peliculas', 'RETURN'] },
  ]);

  /* ─────────── Transacciones ─────────── */
  tpl('tx',
`BEGIN TRANSACTION
BEGIN TRY
    <operación 1>      -- ej: INSERT en la cabecera
    <operación 2>      -- ej: INSERT en el detalle
    <operación 3>      -- ej: UPDATE del stock
    COMMIT TRANSACTION
    PRINT 'Operación completa'
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION
    PRINT 'Se deshizo todo: ' + ERROR_MESSAGE()
END CATCH`, 'Úsala cuando el enunciado tenga <b>varias operaciones que deben hacerse juntas</b> (vender, transferir, reservar…).');
  add('tx', [
    { t: 'order', db: 'farmacia', q: 'Ordena la venta dentro de una transacción.', lines: ['BEGIN TRANSACTION', 'BEGIN TRY', 'INSERT INTO Ventas VALUES (@idVenta, GETDATE(), @total)', 'INSERT INTO DetalleVenta VALUES (@idVenta, @idMed, @cant, @precio)', 'UPDATE Medicamentos SET Stock = Stock - @cant WHERE IdMed = @idMed', 'COMMIT TRANSACTION', 'END TRY', 'BEGIN CATCH', 'ROLLBACK TRANSACTION', 'END CATCH'] },
    { t: 'mc', db: 'cine', q: 'Al comprar boletos haces <code>UPDATE Funciones SET AsientosLibres = AsientosLibres - @cant</code> e <code>INSERT INTO Boletos …</code>. ¿Por qué en una transacción?', o: ['Para que no se descuenten asientos sin registrar el boleto (o al revés)', 'Porque INSERT no funciona sin transacción', 'Para que sea más rápido', 'No hace falta'], a: 0 },
    { t: 'fill', db: 'banco', q: 'Si algo falla en el retiro, deshaz todo.', code: "BEGIN CATCH\n    ___ TRANSACTION\n    PRINT 'No se pudo retirar'\nEND CATCH", a: [['ROLLBACK']] },
    { t: 'mc', db: 'hotel', q: '¿Cuál es el precio final de la habitación 201?', code: "BEGIN TRAN\nUPDATE Habitaciones SET PrecioNoche = 150 WHERE NumHab = 201\nSAVE TRANSACTION P1\nUPDATE Habitaciones SET PrecioNoche = 999 WHERE NumHab = 201\nROLLBACK TRANSACTION P1\nCOMMIT", o: ['150', '999', 'El precio original', '0'], a: 0 },
  ]);

  /* ─────────── Triggers ─────────── */
  tpl('trg',
`CREATE OR ALTER TRIGGER trg_<nombre>
ON <tabla>
FOR INSERT, UPDATE, DELETE          -- solo los eventos que pidan
AS
BEGIN
    -- valor nuevo: inserted      valor viejo: deleted
    IF EXISTS(SELECT 1 FROM inserted WHERE <condición prohibida>)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('<MENSAJE>', 10, 1)
    END
    -- auditoría:
    INSERT INTO <TablaLog> VALUES ('<acción>', SUSER_SNAME(), GETDATE())
END`);
  add('trg', [
    { t: 'fill', db: 'colegio', q: 'Trigger que impide registrar notas mayores a 20.', code: "CREATE OR ALTER TRIGGER trg_nota_max\nON Notas\nFOR INSERT, UPDATE\nAS\nBEGIN\n    IF EXISTS(SELECT 1 FROM ___ WHERE Nota > 20)\n    BEGIN\n        ROLLBACK TRANSACTION\n        RAISERROR('LA NOTA MÁXIMA ES 20', 10, 1)\n    END\nEND", a: [['inserted']] },
    { t: 'mc', db: 'farmacia', q: 'Trigger en <b>DetalleVenta</b> que descuenta el stock al vender. ¿De qué tabla virtual sacas la cantidad vendida?', o: ['inserted', 'deleted', 'Medicamentos', 'Ventas'], a: 0, ex: 'UPDATE m SET Stock = m.Stock - i.Cantidad FROM Medicamentos m INNER JOIN inserted i ON m.IdMed = i.IdMed' },
    { t: 'fill', db: 'farmacia', q: 'Completa el trigger que descuenta stock.', code: 'UPDATE m SET Stock = m.Stock - i.Cantidad\nFROM Medicamentos m\nINNER JOIN inserted i ON m.IdMed = i.___', a: [['IdMed']] },
    { t: 'mc', db: 'banco', q: 'Trigger en <b>Cuentas</b>: si tras un UPDATE el saldo queda negativo, se revierte. ¿Qué condición usas?', o: ['IF EXISTS(SELECT 1 FROM inserted WHERE Saldo < 0)', 'IF EXISTS(SELECT 1 FROM deleted WHERE Saldo < 0)', 'IF Saldo < 0', 'IF EXISTS(SELECT 1 FROM Clientes WHERE Saldo < 0)'], a: 0 },
    { t: 'fill', db: 'gimnasio', q: 'Auditoría: guarda quién eliminó una membresía.', code: "CREATE OR ALTER TRIGGER trg_audit_membresia\nON Membresias\nFOR ___\nAS\nBEGIN\n    INSERT INTO Auditoria VALUES ('ELIMINÓ MEMBRESÍA', SUSER_SNAME(), GETDATE())\nEND", a: [['DELETE']] },
    { t: 'mc', db: 'hotel', q: 'Trigger en <b>Habitaciones</b>: no subir <code>PrecioNoche</code> más del 30 %. Si hoy cuesta 200, ¿cuál es el máximo?', o: ['260', '230', '300', '600'], a: 0 },
  ]);
})();
