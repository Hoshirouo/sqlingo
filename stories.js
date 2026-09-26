/* =========================================================
   Historias — casos cotidianos en la empresa "Negocios"
   Cada paso es:
     ['personaje', 'texto', 'código opcional']   → diálogo
     { t: 'mc' | 'tf' | 'fill' | 'build' | 'order' | 'match' | 'write', ... } → pregunta
   (las preguntas usan el mismo formato que data.js)
   ========================================================= */

const CAST = {
  nar:   { name: '',        emoji: '📖', color: 'muted' },
  tu:    { name: 'Tú',      emoji: '🧑‍💻', color: 'green' },
  ana:   { name: 'Ana',     emoji: '👩‍💼', color: 'purple' },
  luis:  { name: 'Luis',    emoji: '📦', color: 'orange' },
  rosa:  { name: 'Rosa',    emoji: '👩‍🏫', color: 'pink' },
  jorge: { name: 'Jorge',   emoji: '👨‍💼', color: 'blue' },
  mateo: { name: 'Mateo',   emoji: '🧢', color: 'yellow' },
  sofia: { name: 'Sofía',   emoji: '🏦', color: 'blue' },
  don:   { name: 'Don Pepe', emoji: '👴', color: 'red' },
};

const STORIES = [
/* ───────────── 1 · ERRORES ───────────── */
{
  id: 'alfki', title: 'El cliente que no se podía borrar', icon: '🗑️', topic: 'Manejo de errores', color: 'red',
  steps: [
    ['nar', 'Es tu primer día como practicante en la empresa Negocios. Ana, la jefa de ventas, se acerca a tu escritorio.'],
    ['ana', '¡Hola! El cliente ALFKI ya no trabaja con nosotros. ¿Puedes borrarlo del sistema?'],
    ['tu', 'Claro, es fácil.', "DELETE FROM Ventas.clientes\nWHERE IdCliente = 'ALFKI'"],
    ['nar', 'Presionas F5 y… aparece un mensaje rojo: “Instrucción DELETE en conflicto con la restricción REFERENCE…”.'],
    { t: 'mc', q: '¿Por qué SQL Server no deja borrar a ALFKI?', o: ['Porque tiene pedidos en Ventas.pedidoscabe que lo referencian (FK)', 'Porque el practicante no tiene permisos', 'Porque ALFKI está escrito en mayúsculas', 'Porque faltó un COMMIT'], a: 0, ex: 'La FK de pedidoscabe.IdCliente protege la integridad referencial: no puedes dejar pedidos “huérfanos”.' },
    ['ana', '¡Uy! A los usuarios no les podemos mostrar ese mensaje tan feo. ¿Puedes controlarlo?'],
    ['tu', 'Sí, lo voy a envolver en un bloque TRY…CATCH.'],
    { t: 'fill', q: 'Completa el bloque para capturar el error.', code: "BEGIN TRY\n    DELETE FROM Ventas.clientes WHERE IdCliente = 'ALFKI'\nEND TRY\n___\n    PRINT 'OCURRIÓ UN ERROR'\nEND CATCH", a: [['BEGIN CATCH']] },
    ['ana', 'Mejor. Pero quiero que diga exactamente cuándo es un problema de integridad referencial.'],
    ['tu', 'Ese error siempre tiene el mismo número. Lo reviso con @@ERROR.'],
    { t: 'fill', q: '¿Qué número de error corresponde a la integridad referencial?', code: "BEGIN CATCH\n    IF @@ERROR = ___\n        PRINT 'No se puede borrar: el cliente tiene pedidos'\nEND CATCH", a: [['547']] },
    ['ana', '¡Perfecto! Y si quiero ver el texto original del error, ¿qué uso?'],
    { t: 'mc', q: '¿Qué función devuelve el texto del error dentro del CATCH?', o: ['ERROR_MESSAGE()', 'ERROR_NUMBER()', 'ERROR_LINE()', '@@ERROR'], a: 0 },
    ['nar', 'Ana sonríe. Primer problema del día resuelto. ✅'],
  ],
},

/* ───────────── 2 · RAISERROR ───────────── */
{
  id: 'stock', title: 'La venta sin stock', icon: '📦', topic: 'RAISERROR', color: 'orange',
  steps: [
    ['nar', 'Luis, el encargado del almacén, llega corriendo.'],
    ['luis', '¡Vendimos 10 “Mezcla Gumbo del chef Anton”, pero en el almacén hay 0! El sistema no avisó nada.'],
    ['tu', 'Voy a hacer que el sistema revise el stock antes de vender.'],
    { t: 'mc', q: '¿En qué columna de Compras.productos está el stock?', o: ['UnidadesEnExistencia', 'UnidadesEnPedido', 'CantxUnidad', 'PrecioUnidad'], a: 0 },
    ['tu', 'Primero guardo el stock en una variable.', 'DECLARE @STOCK SMALLINT, @IDPRODUCTO INT = 5\nSELECT @STOCK = UnidadesEnExistencia\nFROM Compras.productos\nWHERE IdProducto = @IDPRODUCTO'],
    ['luis', 'Y si hay menos de 5, ¡que salte una alarma!'],
    { t: 'build', q: 'Lanza el error “STOCK INSUFICIENTE” con severidad 16.', words: ['RAISERROR', '(', "'STOCK INSUFICIENTE'", ',', '16', ',', '1', ')'], extra: ['PRINT', '10', 'THROW'] },
    ['luis', '¿Y por qué 16 y no 10?'],
    { t: 'mc', q: '¿Qué pasa si usas severidad 10 dentro del TRY?', o: ['Solo muestra el mensaje; NO salta al CATCH', 'Salta al CATCH igual', 'Borra el producto', 'Da error de sintaxis'], a: 0, ex: 'Severidad ≤ 10 es informativa. Para que se active el CATCH usa 11–19.' },
    ['nar', 'Ejecutas la prueba con el producto 5.'],
    { t: 'mc', q: '¿Qué aparece en la consola?', code: "PRINT 'EL STOCK ES: ' + CAST(@STOCK AS VARCHAR)\nIF @STOCK < 5\n    RAISERROR('STOCK INSUFICIENTE',16,1)\nPRINT 'SE PUEDE VENDER'\n-- CATCH: PRINT 'OCURRIO UN ERROR!! ' + ERROR_MESSAGE()", o: ['EL STOCK ES: 0\nOCURRIO UN ERROR!! STOCK INSUFICIENTE', 'EL STOCK ES: 0\nSE PUEDE VENDER', 'SE PUEDE VENDER', 'Nada'], a: 0 },
    ['luis', '¡Genial! Ya no vamos a vender aire. 😅'],
  ],
},

/* ───────────── 3 · PROCEDIMIENTOS ───────────── */
{
  id: 'cargo', title: 'El cargo repetido', icon: '🪪', topic: 'Procedimientos + OUTPUT', color: 'purple',
  steps: [
    ['nar', 'Rosa, de Recursos Humanos, tiene un problema con la tabla RRHH.Cargos.'],
    ['rosa', 'Cada vez que registro un cargo tengo que buscar a mano el último id. ¡Y ayer registré “Asesor de Marketing” tres veces!'],
    ['tu', 'Te voy a crear un procedimiento almacenado. Solo le pasas la descripción y listo.'],
    { t: 'fill', q: 'Empieza el procedimiento.', code: 'CREATE OR ALTER ___ uspCrearCargo\n@p_descargo VARCHAR(30)\nAS', a: [['PROCEDURE', 'PROC']] },
    ['tu', 'El id nuevo lo calculo solo, así:'],
    { t: 'mc', q: '¿Cómo obtienes el siguiente id de cargo?', o: ['SELECT @v_id = MAX(idcargo) + 1 FROM RRHH.Cargos', 'SELECT @v_id = COUNT(*) FROM RRHH.Cargos', 'SET @v_id = idcargo + 1', 'SELECT @v_id = MIN(idcargo) - 1 FROM RRHH.Cargos'], a: 0 },
    ['rosa', '¿Y cómo evito los repetidos?'],
    { t: 'fill', q: 'Valida que el cargo no exista antes de insertar.', code: "IF ___(SELECT 1 FROM RRHH.Cargos WHERE desCargo = @p_descargo)\n    SET @p_mensaje = 'Ese cargo ya existe'\nELSE\n    ...", a: [['EXISTS']] },
    ['rosa', 'Y quiero que me devuelva un mensajito diciendo si se guardó o no.'],
    ['tu', 'Para eso uso un parámetro de salida.'],
    { t: 'fill', q: 'Declara el parámetro de salida.', code: '@p_mensaje VARCHAR(200) ___', a: [['OUTPUT', 'OUT']] },
    ['rosa', '¿Y cómo lo uso yo?'],
    { t: 'order', q: 'Ordena cómo Rosa ejecuta el procedimiento.', lines: ['DECLARE @msg VARCHAR(200)', "EXEC uspCrearCargo 'Asesor de Marketing', @msg OUTPUT", 'PRINT @msg'] },
    ['rosa', 'La primera vez dice “Se insertó el cargo” y la segunda “Ese cargo ya existe”. ¡Me salvaste! 🙌'],
  ],
},

/* ───────────── 4 · CURSORES ───────────── */
{
  id: 'reporte', title: 'El reporte del lunes', icon: '🧾', topic: 'Cursores', color: 'orange',
  steps: [
    ['nar', 'Lunes, 8:05 a.m. Jorge, el gerente, te pide un reporte.'],
    ['jorge', 'Quiero en la consola cada producto del proveedor 3, con su stock y precio. Y al final, cuántos son y la suma de precios.'],
    ['tu', 'Como hay que recorrer fila por fila, usaré un cursor.'],
    { t: 'order', q: 'Ordena los pasos del cursor.', lines: ['DECLARE c_productos CURSOR FOR SELECT ...', 'OPEN c_productos', 'FETCH c_productos INTO @nom, @stock, @precio', 'WHILE @@FETCH_STATUS = 0', 'CLOSE c_productos', 'DEALLOCATE c_productos'] },
    ['nar', 'Ejecutas… y la consola imprime el mismo producto una y otra vez, sin parar. 😱'],
    { t: 'mc', q: '¿Qué olvidaste dentro del WHILE?', code: 'FETCH c_productos INTO @nom, @stock, @precio\nWHILE @@FETCH_STATUS = 0\nBEGIN\n    PRINT @nom\nEND', o: ['Otro FETCH para avanzar a la siguiente fila', 'Un COMMIT', 'Un DEALLOCATE', 'Un RAISERROR'], a: 0, ex: 'Sin el FETCH dentro del bucle, @@FETCH_STATUS siempre vale 0 → bucle infinito.' },
    ['jorge', 'Bien, ahora sí. ¿Y el total de productos y precios?'],
    { t: 'match', q: 'Une cada línea con lo que es', pairs: [['SET @cant = @cant + 1', 'Contador'], ['SET @total = @total + @precio', 'Acumulador'], ['WHILE @@FETCH_STATUS = 0', 'Bucle'], ['DEALLOCATE c_productos', 'Libera el cursor']] },
    ['jorge', 'Otra cosa: el reporte de ALFKI dice 3 pedidos, pero yo sé que tiene 6.'],
    { t: 'mc', q: '¿Cuál es el error?', code: 'WHILE @@FETCH_STATUS = 0\nBEGIN\n    PRINT @IdPed\n    FETCH C_PedidoCli INTO @IdPed, @FecPed\n    FETCH C_PedidoCli INTO @IdPed, @FecPed\n    SET @cantidad = @cantidad + 1\nEND', o: ['Hay dos FETCH: se salta un pedido en cada vuelta', 'El contador empieza en 3', 'Falta OPEN', 'PRINT no muestra números'], a: 0 },
    ['tu', 'Listo, borré el FETCH repetido.'],
    ['jorge', '6 pedidos. ¡Ahora sí cuadra! Buen trabajo. ☕'],
  ],
},

/* ───────────── 5 · FUNCIONES ───────────── */
{
  id: 'cyber', title: 'Cyber Wow', icon: '🛍️', topic: 'Funciones', color: 'green',
  steps: [
    ['nar', 'Se viene el Cyber Wow. Ana necesita ver el descuento de cada producto.'],
    ['ana', 'Quiero una lista con el nombre de cada producto y cuánto se descuenta con 10 %.'],
    ['tu', 'Voy a crear una función: recibe el producto y el porcentaje, y devuelve el monto.'],
    { t: 'fill', q: 'Indica el tipo de dato que devuelve la función.', code: 'CREATE OR ALTER FUNCTION Compras.fu_descuento(@p_idProducto INT, @p_pct DECIMAL(5,2))\n___ DECIMAL(12,2)\nAS', a: [['RETURNS']] },
    { t: 'fill', q: 'Devuelve el monto de descuento.', code: 'BEGIN\n    DECLARE @v_precio DECIMAL(10,0)\n    SELECT @v_precio = PrecioUnidad FROM Compras.productos\n    WHERE IdProducto = @p_idProducto\n    ___ @v_precio * @p_pct / 100\nEND', a: [['RETURN']] },
    ['ana', 'Un producto cuesta S/ 30. ¿Cuánto se descuenta con 10 %?'],
    { t: 'mc', q: '¿Qué devuelve la función?', o: ['3.00', '27.00', '10.00', '0.30'], a: 0 },
    ['ana', '¿Y cómo lo veo para todos los productos a la vez?'],
    { t: 'mc', q: '¿Cuál consulta funciona?', o: ['SELECT NomProducto, Compras.fu_descuento(IdProducto, 10) FROM Compras.productos', 'EXEC Compras.fu_descuento 10', 'SELECT * FROM fu_descuento', 'PRINT fu_descuento(IdProducto)'], a: 0, ex: 'Las funciones escalares se usan dentro del SELECT, con su esquema.' },
    ['tu', 'Se me ocurrió poner un PRINT dentro de la función para ver cómo avanza…'],
    { t: 'tf', q: 'Se puede usar PRINT dentro de una función.', a: false, ex: 'Las funciones no pueden tener efectos secundarios (PRINT, INSERT, UPDATE, DELETE). Eso es trabajo de un procedimiento.' },
    ['ana', '¡Listo para el Cyber! 🛒'],
  ],
},

/* ───────────── 6 · TRANSACCIONES ───────────── */
{
  id: 'apagon', title: 'El apagón', icon: '💡', topic: 'Transacciones', color: 'yellow',
  steps: [
    ['nar', 'Sofía, de tesorería, está pasando S/ 200 de la cuenta 20161206 (saldo 1200) a la 20161207 (saldo 1000).'],
    ['sofia', 'El sistema resta de una cuenta y luego suma en la otra.'],
    ['nar', 'Justo después del primer UPDATE… ¡se va la luz! ⚡'],
    { t: 'mc', q: 'Sin transacción, ¿qué pasó con el dinero?', o: ['Se restó de la 1.ª cuenta pero nunca llegó a la 2.ª: se “perdieron” S/ 200', 'Nada, SQL lo arregla solo', 'Se duplicó', 'Se canceló todo automáticamente'], a: 0 },
    ['tu', 'Por eso las dos operaciones tienen que ir juntas: o se hacen las dos o ninguna.'],
    { t: 'order', q: 'Arma la transferencia segura.', lines: ['BEGIN TRANSACTION', 'BEGIN TRY', 'UPDATE CUENTAS SET saldo = saldo - 200 WHERE numCuenta = \'20161206\'', 'UPDATE CUENTAS SET saldo = saldo + 200 WHERE numCuenta = \'20161207\'', 'COMMIT TRANSACTION', 'END TRY', 'BEGIN CATCH', 'ROLLBACK TRANSACTION', 'END CATCH'] },
    ['sofia', 'Ahora sí salió bien. ¿Cuánto tiene la cuenta 20161207?'],
    { t: 'mc', q: 'Saldo final de 20161207:', o: ['1200', '1000', '800', '1400'], a: 0 },
    ['sofia', 'Otra cosa… hice varios cambios de prueba y solo quiero deshacer el último.'],
    { t: 'mc', q: '¿Cuál es el saldo final?', code: "BEGIN TRAN\nUPDATE CUENTAS SET saldo = 5000 WHERE numCuenta = '20161206'\nSAVE TRANSACTION Punto1\nUPDATE CUENTAS SET saldo = 5 WHERE numCuenta = '20161206'\nROLLBACK TRANSACTION Punto1\nCOMMIT", o: ['5000', '5', '1200', '0'], a: 0, ex: 'ROLLBACK a Punto1 deshace solo lo que vino después del savepoint.' },
    ['sofia', 'Ah, y ayer dejé un BEGIN TRAN sin cerrar y nadie podía usar la tabla…'],
    { t: 'mc', q: '¿Por qué nadie podía usar la tabla?', o: ['La transacción abierta mantenía las filas bloqueadas', 'Se borró la tabla', 'Se llenó el disco', 'Por el apagón'], a: 0 },
    ['sofia', 'Ahora siempre cierro con COMMIT o ROLLBACK. 💸'],
  ],
},

/* ───────────── 7 · TRIGGERS DML ───────────── */
{
  id: 'precio', title: 'El precio que se disparó', icon: '📈', topic: 'Triggers', color: 'pink',
  steps: [
    ['nar', 'Don Pepe, el dueño, revisa los precios y se lleva un susto.'],
    ['don', '¿¡Quién subió el “Té Dharamsala” de S/ 18 a S/ 180!? Seguro fue un cero de más.'],
    ['tu', 'Puedo crear un trigger que no deje subir el precio más del 30 %.'],
    { t: 'mc', q: '¿Cuándo se ejecuta un trigger?', o: ['Automáticamente cuando ocurre el evento (ej. un UPDATE)', 'Cuando lo llamas con EXEC', 'Solo a medianoche', 'Cuando lo usas en un SELECT'], a: 0 },
    ['tu', 'Dentro del trigger comparo el precio viejo con el nuevo.'],
    { t: 'match', q: '¿De dónde saco cada precio?', pairs: [['Precio antiguo', 'deleted'], ['Precio nuevo', 'inserted']] },
    ['don', 'Si el precio es 18, ¿hasta cuánto se puede subir?'],
    { t: 'mc', q: 'Máximo permitido (18 × 1.3):', o: ['23.4', '30', '18.3', '54'], a: 0 },
    { t: 'fill', q: 'Si se pasa del 30 %, revierte el cambio.', code: "IF @v_precioNuevo > 1.3 * @v_precioActual\nBEGIN\n    ___ TRANSACTION\n    RAISERROR('NO SE PUEDE SUBIR MÁS DEL 30%', 10, 1)\nEND", a: [['ROLLBACK']] },
    ['don', 'Y también quiero que los precios solo se cambien en horario de oficina, de 8 a 12.'],
    { t: 'mc', q: '¿Cómo sabes la hora actual?', o: ['DATEPART(HH, GETDATE())', 'GETHOUR()', 'DATEDIFF(HH, GETDATE())', 'FORMAT(HH)'], a: 0 },
    ['don', 'Ah, y para la campaña de hoy necesito desactivar esa regla un rato.'],
    { t: 'fill', q: 'Desactiva el trigger.', code: '___ TRIGGER COMPRAS.TRG_UPD30_PRODUCTO ON Compras.productos', a: [['DISABLE']] },
    ['don', '¡Ahora nadie me sube el té a S/ 180! 🍵'],
  ],
},

/* ───────────── 8 · AUDITORÍA + DDL ───────────── */
{
  id: 'drop', title: '¿Quién borró la tabla?', icon: '🕵️', topic: 'Triggers DDL y auditoría', color: 'blue',
  steps: [
    ['nar', 'Viernes, 6 p.m. Mateo, el otro practicante, está limpiando tablas de prueba…'],
    ['mateo', 'DROP TABLE CUENTAS… listo. Espera… ¿esa no era la de tesorería? 😰'],
    ['sofia', '¡¿Dónde están mis cuentas?!'],
    ['tu', 'Para que no vuelva a pasar, voy a crear un trigger a nivel de base de datos.'],
    { t: 'mc', q: 'Un trigger que reacciona a DROP_TABLE se crea…', o: ['ON DATABASE', 'ON RRHH.Cargos', 'ON sys.tables', 'FOR DELETE'], a: 0 },
    { t: 'order', q: 'Ordena el trigger DDL.', lines: ['CREATE OR ALTER TRIGGER trgImpideEliminarTablas', 'ON DATABASE', 'AFTER DROP_TABLE', 'AS', 'BEGIN', "RAISERROR('!!NO PUEDE ELIMINAR UNA TABLA EN ESTA BD', 10, 1)", 'ROLLBACK', 'END'] },
    ['rosa', 'Yo también quiero saber quién toca la tabla de Cargos: si inserta, actualiza o elimina.'],
    { t: 'match', q: '¿Qué tablas virtuales tienen filas en cada caso?', pairs: [['INSERT', 'Solo inserted'], ['DELETE', 'Solo deleted'], ['UPDATE', 'inserted y deleted']] },
    { t: 'fill', q: 'Detecta una actualización.', code: "IF EXISTS(SELECT 1 FROM inserted) AND EXISTS(SELECT 1 FROM ___)\n    INSERT INTO LOG_TABLE VALUES('ACTUALIZACION EN CARGOS', USER)", a: [['deleted']] },
    ['rosa', '¿Y cómo guardo también el usuario y el equipo desde donde lo hicieron?'],
    { t: 'match', q: 'Une cada función con lo que devuelve', pairs: [['SUSER_SNAME()', 'Login del usuario'], ['HOST_NAME()', 'Nombre del equipo'], ['GETDATE()', 'Fecha y hora']] },
    ['mateo', 'Bueno… por lo menos ahora nadie más podrá borrar una tabla. 😅'],
    ['nar', 'Fin de la semana. Aprendiste errores, SP, cursores, funciones, transacciones y triggers. ¡Estás listo para el examen! 🏆'],
  ],
},
];
