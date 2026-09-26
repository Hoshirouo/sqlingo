/* =========================================================
   Modo Express — lo mínimo para entender cada tema rápido.
   Cada tema: qué es · cómo te lo piden · plantilla · trampa · preguntas
   ========================================================= */

CAST.profe = { name: 'Profe Express', emoji: '🚀', color: 'purple' };

const EXPRESS = [
  {
    id: 'mapa', unit: 'nueva', icon: '🧭', color: 'blue', title: '¿Qué me están pidiendo?', min: 4,
    what: 'En el examen, el enunciado te dice qué herramienta usar con ciertas palabras. Si las reconoces, ya tienes la mitad del ejercicio resuelto.',
    signal: '“controle los errores” → TRY/CATCH · “cree un procedimiento / que reciba / devuelva por OUTPUT” → SP · “recorra / por cada / uno por uno” → CURSOR · “función que calcule y retorne” → FUNCIÓN · “todo o nada / transferencia / deshacer si falla” → TRANSACCIÓN · “automáticamente al insertar / no permita / auditar” → TRIGGER',
    code:
`-- Orden para atacar cualquier ejercicio:
-- 1. ¿Qué herramienta piden?  (palabras clave)
-- 2. ¿Qué tablas y columnas uso? (mira PK 🔑 y FK 🔗)
-- 3. Copia la plantilla de esa herramienta
-- 4. Reemplaza <tabla> y <columna>
-- 5. Agrega lo extra: validación, TRY/CATCH, mensaje`,
    trap: 'Muchos casos combinan dos cosas: SP + TRY/CATCH, SP + transacción, función + vista. Resuélvelos por partes.',
    qs: [
      { t: 'match', q: 'Une lo que dice el enunciado con lo que debes usar', pairs: [['“…y controle los errores”', 'TRY / CATCH'], ['“…por cada cliente, muestre…”', 'Cursor'], ['“…que retorne el monto…” y se use en SELECT', 'Función'], ['“…cada vez que se elimine…”', 'Trigger']] },
      { t: 'match', q: 'Otra vuelta', pairs: [['“…si una falla, deshaga todo”', 'Transacción'], ['“…devuelva el mensaje por un parámetro”', 'SP con OUTPUT'], ['“…genere un error si el stock es menor a 5”', 'RAISERROR']] },
      { t: 'mc', q: 'Enunciado: <i>“Cree un procedimiento que registre una venta y actualice el stock; si algo falla, no debe guardarse nada.”</i> ¿Qué combinas?', o: ['SP + transacción con TRY/CATCH', 'Solo un cursor', 'Una función', 'Un trigger DDL'], a: 0 },
      { t: 'mc', q: 'Enunciado: <i>“Impida que se actualice el precio fuera del horario de 8 a 12.”</i> ¿Qué usas?', o: ['Un trigger FOR UPDATE con ROLLBACK', 'Una función', 'Un cursor SCROLL', 'Un SAVE TRANSACTION'], a: 0 },
    ],
  },
  {
    id: 'err', unit: 'err', icon: '🚨', color: 'red', title: 'Errores en 5 minutos', min: 5,
    what: 'TRY/CATCH es como un airbag: si algo choca dentro del TRY, el CATCH lo atrapa y tú decides qué mensaje mostrar. RAISERROR sirve para provocar un error tú mismo cuando algo no cumple una regla.',
    signal: '“controle los errores”, “muestre un mensaje si ocurre un error”, “genere un error con RAISERROR si…”, “valide que…”',
    code:
`BEGIN TRY
    -- lo que puede fallar
    IF <condición mala>
        RAISERROR('MENSAJE', 16, 1)
    PRINT 'Todo bien'
END TRY
BEGIN CATCH
    PRINT 'Error: ' + ERROR_MESSAGE()
END CATCH`,
    trap: 'RAISERROR con severidad 10 NO entra al CATCH (usa 16). El orden es (mensaje, severidad, estado). El error 547 es de FK y el 8134 es división entre 0.',
    qs: [
      { t: 'fill', q: 'Completa la plantilla.', code: "BEGIN TRY\n    IF @stock < 5\n        ___('STOCK INSUFICIENTE', 16, 1)\nEND TRY\nBEGIN CATCH\n    PRINT 'Error: ' + ___()\nEND CATCH", a: [['RAISERROR'], ['ERROR_MESSAGE']] },
      { t: 'mc', q: '¿Qué severidad pones para que SÍ salte al CATCH?', o: ['16', '10', '0', '5'], a: 0 },
      { t: 'mc', q: 'Si el RAISERROR se ejecuta, ¿se imprime “Todo bien”?', o: ['No, salta directo al CATCH', 'Sí, siempre', 'Solo si la severidad es 16', 'Se imprime dos veces'], a: 0 },
      { t: 'mc', q: 'Borras un registro que otra tabla referencia. ¿Qué error sale?', o: ['547 (integridad referencial)', '8134', '50000', 'Ninguno'], a: 0 },
    ],
  },
  {
    id: 'sp', unit: 'sp', icon: '⚙️', color: 'purple', title: 'Procedimientos en 5 minutos', min: 5,
    what: 'Un procedimiento almacenado es una receta guardada: le das ingredientes (parámetros), la ejecutas con EXEC y hace el trabajo (consultar, insertar, validar). Con OUTPUT te devuelve un resultado.',
    signal: '“cree un procedimiento”, “que reciba como parámetro…”, “devuelva por un parámetro de salida / OUTPUT”, “registre / inserte / valide antes de insertar”',
    code:
`CREATE OR ALTER PROCEDURE uspNombre
@p_dato INT, @p_msg VARCHAR(200) OUTPUT
AS
BEGIN
    IF EXISTS(SELECT 1 FROM <tabla> WHERE <col> = @p_dato)
        SET @p_msg = 'Ya existe'
    ELSE
        SET @p_msg = 'OK'
END
GO
DECLARE @msg VARCHAR(200)
EXEC uspNombre 5, @msg OUTPUT
PRINT @msg`,
    trap: 'OUTPUT va DOS veces: al declarar el parámetro y al ejecutar. Y debes declarar la variable antes del EXEC. El id nuevo se saca con MAX(Id) + 1.',
    qs: [
      { t: 'order', q: 'Ordena cómo se ejecuta un SP con OUTPUT.', lines: ['DECLARE @msg VARCHAR(200)', 'EXEC uspNombre 5, @msg OUTPUT', 'PRINT @msg'] },
      { t: 'fill', q: 'Completa la cabecera del procedimiento.', code: 'CREATE OR ALTER ___ uspNombre\n@p_msg VARCHAR(200) ___\nAS', a: [['PROCEDURE', 'PROC'], ['OUTPUT', 'OUT']] },
      { t: 'mc', q: '¿Cómo validas que algo ya exista antes de insertar?', o: ['IF EXISTS(SELECT 1 FROM tabla WHERE …)', 'IF COUNT = 1', 'WHILE EXISTS', 'TRY EXISTS'], a: 0 },
      { t: 'mc', q: 'Te olvidas de escribir OUTPUT en el EXEC. ¿Qué pasa?', o: ['La variable queda en NULL', 'Error de sintaxis siempre', 'Funciona igual', 'Se borra el SP'], a: 0 },
    ],
  },
  {
    id: 'cur', unit: 'cur', icon: '🔁', color: 'orange', title: 'Cursores en 5 minutos', min: 6,
    what: 'Un cursor lee el resultado de un SELECT fila por fila, como pasar lista en el salón: uno por uno. Se usa cuando por cada fila tienes que imprimir o calcular algo.',
    signal: '“recorra”, “por cada …”, “muestre uno por uno con PRINT”, “reporte”, “usando un cursor”, “al final muestre la cantidad / el total”',
    code:
`DECLARE c CURSOR FOR SELECT <col1>, <col2> FROM <tabla>
DECLARE @v1 <tipo>, @v2 <tipo>, @cant INT = 0
OPEN c
FETCH c INTO @v1, @v2
WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT @v1
    SET @cant = @cant + 1
    FETCH c INTO @v1, @v2
END
CLOSE c
DEALLOCATE c`,
    trap: 'Memoriza DOF-WCD: Declare, Open, Fetch, While, Close, Deallocate. Sin FETCH dentro del WHILE hay bucle infinito; con dos FETCH te saltas filas. Las variables del INTO deben ser tantas como columnas tenga el SELECT.',
    qs: [
      { t: 'order', q: 'DOF-WCD: ordena.', lines: ['DECLARE c CURSOR FOR SELECT …', 'OPEN c', 'FETCH c INTO @v1', 'WHILE @@FETCH_STATUS = 0', 'CLOSE c', 'DEALLOCATE c'] },
      { t: 'mc', q: '¿Cuántos FETCH lleva un cursor normal?', o: ['2: uno antes del WHILE y otro al final del bucle', '1', '3', 'Uno por columna'], a: 0 },
      { t: 'fill', q: 'Condición del bucle.', code: 'WHILE ___ = 0', a: [['@@FETCH_STATUS']] },
      { t: 'mc', q: 'SELECT Nombre, Precio FROM … → ¿cuántas variables en el INTO?', o: ['2', '1', '3', 'Ninguna'], a: 0 },
    ],
  },
  {
    id: 'fn', unit: 'fn', icon: '🧮', color: 'green', title: 'Funciones en 5 minutos', min: 4,
    what: 'Una función es una calculadora: recibe datos, calcula y devuelve UN valor con RETURN. Su gracia es que se usa dentro de un SELECT, fila por fila.',
    signal: '“cree una función que calcule / retorne…”, “úsela en una consulta”, “cree una vista usando la función”',
    code:
`CREATE OR ALTER FUNCTION dbo.fu_nombre(@p INT)
RETURNS DECIMAL(10,2)
AS
BEGIN
    DECLARE @v DECIMAL(10,2)
    SELECT @v = <cálculo> FROM <tabla> WHERE <Id> = @p
    RETURN @v
END
GO
SELECT <col>, dbo.fu_nombre(<Id>) FROM <tabla>`,
    trap: 'RETURNS (con S, el tipo) va arriba y RETURN (sin S, el valor) va abajo. Al llamarla escribe dbo. o su esquema. No uses PRINT, INSERT ni UPDATE dentro.',
    qs: [
      { t: 'fill', q: 'Completa la función: tipo arriba, valor abajo.', code: 'CREATE FUNCTION dbo.fu_x(@p INT)\n___ INT\nAS\nBEGIN\n    ___ @p * 2\nEND', a: [['RETURNS'], ['RETURN']] },
      { t: 'mc', q: '¿Cómo la usas?', o: ['SELECT dbo.fu_x(5)', 'EXEC fu_x 5', 'CALL fu_x(5)', 'fu_x 5'], a: 0 },
      { t: 'tf', q: 'Puedo hacer PRINT dentro de una función.', a: false },
      { t: 'mc', q: 'Enunciado: “…y cree una vista que muestre el descuento de cada producto”. ¿Dónde va la función?', o: ['Dentro del SELECT de la vista', 'En un EXEC antes de la vista', 'En un trigger', 'No se puede'], a: 0 },
    ],
  },
  {
    id: 'tx', unit: 'tx', icon: '💸', color: 'yellow', title: 'Transacciones en 4 minutos', min: 4,
    what: 'Una transacción es un paquete: todas sus operaciones se hacen, o no se hace ninguna. Piensa en una transferencia bancaria: restar de una cuenta y sumar en otra van juntas.',
    signal: '“transferencia”, “si alguna operación falla, deshacer todo”, “asegure la consistencia”, “use una transacción”, “savepoint / punto de guardado”',
    code:
`BEGIN TRANSACTION
BEGIN TRY
    UPDATE ... -- operación 1
    UPDATE ... -- operación 2
    COMMIT TRANSACTION
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION
    PRINT 'Error: ' + ERROR_MESSAGE()
END CATCH`,
    trap: 'El COMMIT va al final del TRY y el ROLLBACK en el CATCH. ROLLBACK TRANSACTION P1 solo deshace lo que vino después de SAVE TRANSACTION P1.',
    qs: [
      { t: 'mc', q: '¿Dónde va el ROLLBACK?', o: ['En el BEGIN CATCH', 'Al final del TRY', 'Antes del BEGIN TRAN', 'No se usa'], a: 0 },
      { t: 'match', q: 'Une cada instrucción con lo que hace', pairs: [['COMMIT', 'Confirma'], ['ROLLBACK', 'Deshace'], ['SAVE TRANSACTION', 'Punto de guardado']] },
      { t: 'mc', q: 'Saldo 1200 → UPDATE a 5000 → SAVE P1 → UPDATE a 5 → ROLLBACK P1 → COMMIT. ¿Saldo final?', o: ['5000', '5', '1200', '0'], a: 0 },
    ],
  },
  {
    id: 'trg', unit: 'trg', icon: '⚡', color: 'pink', title: 'Triggers en 6 minutos', min: 6,
    what: 'Un trigger es una alarma: nadie lo llama, se dispara solo cuando alguien hace INSERT, UPDATE o DELETE en una tabla (o un DROP en la BD). Sirve para impedir cosas o para auditar.',
    signal: '“cada vez que se inserte / actualice / elimine”, “automáticamente”, “no permita…”, “auditar / registrar quién lo hizo”, “impida eliminar tablas”',
    code:
`CREATE OR ALTER TRIGGER trg_nombre
ON <tabla>
FOR UPDATE            -- INSERT, UPDATE, DELETE
AS
BEGIN
    IF EXISTS(SELECT 1 FROM inserted WHERE <regla rota>)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('NO PERMITIDO', 10, 1)
    END
END`,
    trap: 'inserted = lo nuevo, deleted = lo viejo (el UPDATE usa los dos). Los triggers no reciben parámetros. Para impedir: ROLLBACK TRANSACTION + RAISERROR. El DDL va ON DATABASE AFTER DROP_TABLE.',
    qs: [
      { t: 'match', q: '¿Qué tablas virtuales llena cada operación?', pairs: [['INSERT', 'Solo inserted'], ['DELETE', 'Solo deleted'], ['UPDATE', 'inserted y deleted']] },
      { t: 'mc', q: 'En un UPDATE, ¿de dónde sacas el valor ANTERIOR?', o: ['deleted', 'inserted', 'Un parámetro', 'La tabla original'], a: 0 },
      { t: 'fill', q: 'Impide la operación.', code: "IF EXISTS(SELECT 1 FROM inserted WHERE Nota > 20)\nBEGIN\n    ___ TRANSACTION\n    RAISERROR('NOTA INVÁLIDA', 10, 1)\nEND", a: [['ROLLBACK']] },
      { t: 'mc', q: 'Trigger que impide borrar tablas:', o: ['ON DATABASE AFTER DROP_TABLE', 'ON <tabla> FOR DELETE', 'ON sys.tables', 'FOR DROP'], a: 0 },
    ],
  },
];

/* Pasos para atacar el examen (se muestran en el resumen) */
const EXAM_STEPS = [
  'Lee el enunciado y <b>subraya las palabras clave</b> (¿SP, cursor, función, trigger, transacción?).',
  'Mira las tablas: ubica <b>PK 🔑, FK 🔗</b> y en qué columna está cada dato.',
  'Escribe la <b>plantilla</b> de memoria y reemplaza <code>&lt;tabla&gt;</code> y <code>&lt;columna&gt;</code>.',
  'Agrega lo extra que piden: <b>validación (IF EXISTS), TRY/CATCH, mensaje, OUTPUT</b>.',
  'Escribe <b>cómo se prueba</b> (EXEC / SELECT / UPDATE de prueba). Suma puntos.',
];
