/* =========================================================
   Banco de preguntas — SQL Server · BD Negocios
   Tipos:
     mc    → opción múltiple      {q, code?, o:[...], a:indice, ex?}
     tf    → verdadero / falso    {q, code?, a:true|false, ex?}
     fill  → completa el código   {q, code:'... ___ ...', a:[[aceptadas], ...], ex?}
     write → escribe la línea     {q, a:[aceptadas], hint?, ex?}
     build → arma con palabras    {q, words:[...en orden], extra:[distractores], ex?}
     order → ordena las líneas    {q, lines:[...en orden], ex?}
     match → une las parejas      {q, pairs:[[izq, der], ...]}
   ========================================================= */

const UNITS = [
/* ───────────────────────── 0 · BD NEGOCIOS ───────────────────────── */
{
  id: 'bd', title: 'La BD Negocios', sub: 'Esquemas y tablas', icon: '🗄️', color: 'blue',
  cheat: [
    { h: 'Esquemas', p: 'La BD <b>Negocios</b> tiene 3 esquemas: <b>Ventas</b>, <b>Compras</b> y <b>RRHH</b>. Siempre escribe <code>esquema.tabla</code>.',
      code:
`Ventas.paises       (Idpais, NombrePais)
Ventas.clientes     (IdCliente, NomCliente, DirCliente, idpais, fonoCliente)
Ventas.pedidoscabe  (IdPedido, IdCliente, IdEmpleado, FechaPedido, ...)
Ventas.pedidosdeta  (IdPedido, IdProducto, PrecioUnidad, Cantidad, Descuento)

Compras.categorias  (IdCategoria, NombreCategoria, Descripcion)
Compras.proveedores (IdProveedor, NomProveedor, DirProveedor, idpais, ...)
Compras.productos   (IdProducto, NomProducto, IdProveedor, IdCategoria,
                     CantxUnidad, PrecioUnidad, UnidadesEnExistencia,
                     UnidadesEnPedido)

RRHH.Cargos         (idcargo, desCargo)
RRHH.Distritos      (idDistrito, nomDistrito)
RRHH.empleados      (IdEmpleado, ApeEmpleado, NomEmpleado, FecNac, DirEmpleado,
                     idDistrito, fonoEmpleado, idCargo, FecContrata)` },
    { h: 'Relaciones (FK)', p: 'clientes → paises · productos → proveedores y categorias · empleados → Distritos y Cargos · pedidoscabe → clientes y empleados · pedidosdeta → pedidoscabe y productos.' },
    { h: 'Tipos importantes', p: '<code>PrecioUnidad decimal(10,0)</code> (sin decimales), <code>UnidadesEnExistencia smallint</code>, <code>IdCliente varchar(5)</code> (ej. <code>\'ALFKI\'</code>), <code>Idpais char(3)</code> (ej. <code>\'002\'</code>).' },
  ],
  qs: [
    { t: 'mc', q: '¿En qué esquema está la tabla <b>productos</b>?', o: ['Compras', 'Ventas', 'RRHH', 'dbo'], a: 0 },
    { t: 'mc', q: '¿En qué esquema está la tabla <b>clientes</b>?', o: ['Ventas', 'Compras', 'RRHH', 'dbo'], a: 0 },
    { t: 'mc', q: '¿Qué tablas pertenecen al esquema <b>RRHH</b>?', o: ['Cargos, Distritos y empleados', 'Cargos, clientes y paises', 'productos y proveedores', 'pedidoscabe y pedidosdeta'], a: 0 },
    { t: 'mc', q: '¿Qué columna guarda el <b>stock</b> de un producto?', o: ['UnidadesEnExistencia', 'UnidadesEnPedido', 'CantxUnidad', 'Stock'], a: 0 },
    { t: 'fill', q: 'Completa el nombre de la tabla de cabecera de pedidos.', code: 'SELECT IdPedido, FechaPedido\nFROM Ventas.___', a: [['pedidoscabe']] },
    { t: 'mc', q: '¿Por qué falla este DELETE?', code: "DELETE FROM Ventas.clientes\nWHERE IdCliente = 'ALFKI'", o: ['ALFKI tiene pedidos que lo referencian (FK)', 'La tabla clientes no tiene PK', 'Falta el esquema dbo', 'DELETE no admite WHERE'], a: 0, ex: 'Ventas.pedidoscabe.IdCliente es FOREIGN KEY hacia clientes. Borrarlo rompería la integridad referencial → error 547.' },
    { t: 'write', q: 'Escribe la consulta para ver <b>todos</b> los registros de la tabla de cargos.', a: ['SELECT * FROM RRHH.Cargos'], hint: 'SELECT * FROM esquema.tabla' },
    { t: 'mc', q: '¿Qué tipo de dato tiene <b>PrecioUnidad</b> en productos?', o: ['DECIMAL(10,0)', 'MONEY', 'FLOAT', 'INT'], a: 0, ex: 'decimal(10,0) → sin decimales. Por eso en los reportes salen precios enteros (S/ 18, S/ 19…).' },
    { t: 'match', q: 'Une cada tabla con su esquema', pairs: [['productos', 'Compras'], ['clientes', 'Ventas'], ['empleados', 'RRHH'], ['proveedores', 'Compras'], ['pedidoscabe', 'Ventas']] },
    { t: 'mc', q: '¿Cómo se relaciona un empleado con su cargo?', o: ['empleados.idCargo → Cargos.idcargo', 'Cargos.IdEmpleado → empleados', 'Por el nombre del cargo', 'No están relacionadas'], a: 0 },
  ]
},

/* ───────────────────────── 1 · MANEJO DE ERRORES ───────────────────────── */
{
  id: 'err', title: 'Manejo de errores', sub: 'TRY · CATCH · RAISERROR', icon: '🚨', color: 'red',
  cheat: [
    { h: 'Estructura', code:
`BEGIN TRY
    -- código que puede fallar
    SELECT 1/0            -- error 8134: división entre 0
END TRY
BEGIN CATCH
    SELECT ERROR_NUMBER()    AS Numero,
           ERROR_SEVERITY()  AS Severidad,
           ERROR_STATE()     AS Estado,
           ERROR_PROCEDURE() AS Procedimiento,
           ERROR_LINE()      AS Linea,
           ERROR_MESSAGE()   AS Mensaje
END CATCH` },
    { h: '@@ERROR', p: 'Variable global con el <b>número de error de la última instrucción</b> (0 si no hubo error). <b>547</b> = conflicto de integridad referencial (FK). Los mensajes están en <code>sys.messages</code> (<code>language_id = 3082</code> → español).' },
    { h: 'RAISERROR', p: '<code>RAISERROR(\'mensaje\', severidad, estado)</code>. Con severidad <b>11–19</b> dentro de un TRY salta al CATCH. Con severidad <b>≤ 10</b> es solo informativo: <b>no</b> salta al CATCH.', code:
`DECLARE @STOCK SMALLINT, @IDPRODUCTO INT = 5
BEGIN TRY
    SELECT @STOCK = UnidadesEnExistencia
    FROM Compras.productos WHERE IdProducto = @IDPRODUCTO
    PRINT 'EL STOCK ES: ' + CAST(@STOCK AS VARCHAR)
    IF @STOCK < 5
        RAISERROR('STOCK INSUFICIENTE', 16, 1)
    PRINT 'SE PUEDE VENDER'      -- no se ejecuta si hubo error
END TRY
BEGIN CATCH
    PRINT 'OCURRIO UN ERROR!! ' + ERROR_MESSAGE()
END CATCH` },
  ],
  qs: [
    { t: 'mc', q: '¿Qué estructura se usa en SQL Server para capturar errores?', o: ['BEGIN TRY … END TRY BEGIN CATCH … END CATCH', 'TRY { } CATCH { }', 'ON ERROR GOTO', 'EXCEPTION WHEN OTHERS'], a: 0 },
    { t: 'fill', q: 'Completa el bloque para capturar el error.', code: 'BEGIN TRY\n    SELECT 1/0\nEND TRY\n___\n    PRINT ERROR_MESSAGE()\nEND CATCH', a: [['BEGIN CATCH']] },
    { t: 'match', q: 'Une cada función con lo que devuelve', pairs: [['ERROR_MESSAGE()', 'Texto del error'], ['ERROR_NUMBER()', 'Número del error'], ['ERROR_LINE()', 'Línea donde falló'], ['ERROR_SEVERITY()', 'Severidad'], ['ERROR_PROCEDURE()', 'Nombre del SP']] },
    { t: 'mc', q: '¿Qué es <code>@@ERROR</code>?', o: ['Variable global con el número de error de la última instrucción', 'Una tabla del sistema con todos los errores', 'Una función que lanza un error', 'El mensaje de texto del último error'], a: 0 },
    { t: 'mc', q: 'El error número <b>547</b> significa…', o: ['Conflicto de integridad referencial (FK)', 'División entre cero', 'Error de conversión de tipos', 'Tabla no encontrada'], a: 0 },
    { t: 'fill', q: 'Completa para mostrar un mensaje propio cuando falla por integridad referencial.', code: "BEGIN CATCH\n    IF @@ERROR = ___\n        PRINT 'ERROR DE INTEGRIDAD REFERENCIAL'\nEND CATCH", a: [['547']] },
    { t: 'mc', q: '<code>SELECT 1/0</code> genera el error número…', o: ['8134', '547', '245', '50000'], a: 0, ex: '8134 = "Divide by zero error encountered". En el script se buscaba con message_id = 8134 en sys.messages.' },
    { t: 'mc', q: '¿En qué vista del sistema puedes ver los mensajes de error?', o: ['sys.messages', 'sys.procedures', 'sys.triggers', 'sys.errors'], a: 0, ex: 'SELECT * FROM sys.messages WHERE language_id = 3082  → mensajes en español.' },
    { t: 'mc', q: 'En <code>RAISERROR(\'ERROR GENERADO\', 16, 1)</code>, ¿qué es el <b>16</b>?', o: ['La severidad', 'El estado', 'El número de error', 'La línea'], a: 0, ex: 'Orden: mensaje, severidad, estado.' },
    { t: 'build', q: 'Arma la instrucción que lanza el error "STOCK INSUFICIENTE" con severidad 16 y estado 1.', words: ['RAISERROR', '(', "'STOCK INSUFICIENTE'", ',', '16', ',', '1', ')'], extra: ['THROW', '10', 'PRINT'] },
    { t: 'tf', q: 'Un <code>RAISERROR</code> con severidad <b>10</b> dentro de un TRY hace saltar la ejecución al bloque CATCH.', a: false, ex: 'Severidad ≤ 10 es informativa: solo muestra el mensaje. Para que salte al CATCH usa 11–19 (en clase: 16).' },
    { t: 'mc', q: 'Si el stock del producto es <b>0</b>, ¿qué se imprime?', code: "BEGIN TRY\n    PRINT 'EL STOCK CONSULTADO ES: ' + CAST(@STOCK AS VARCHAR)\n    IF @STOCK < 5\n        RAISERROR('STOCK INSUFICIENTE',16,1)\n    PRINT 'SE PUEDE VENDER'\nEND TRY\nBEGIN CATCH\n    PRINT 'OCURRIO UN ERROR!' + ERROR_MESSAGE()\nEND CATCH", o: ['EL STOCK CONSULTADO ES: 0\nOCURRIO UN ERROR!STOCK INSUFICIENTE', 'EL STOCK CONSULTADO ES: 0\nSE PUEDE VENDER', 'EL STOCK CONSULTADO ES: 0\nSE PUEDE VENDER\nOCURRIO UN ERROR!STOCK INSUFICIENTE', 'OCURRIO UN ERROR!STOCK INSUFICIENTE'], a: 0, ex: 'Al ejecutarse RAISERROR (sev. 16) se salta directo al CATCH: "SE PUEDE VENDER" nunca se imprime.' },
    { t: 'mc', q: 'Con el mismo código, si el stock es <b>15</b>, ¿qué se imprime?', o: ['EL STOCK CONSULTADO ES: 15\nSE PUEDE VENDER', 'OCURRIO UN ERROR!STOCK INSUFICIENTE', 'EL STOCK CONSULTADO ES: 15\nOCURRIO UN ERROR!', 'Nada'], a: 0 },
    { t: 'mc', q: '¿Por qué se usa <code>CAST(@STOCK AS VARCHAR)</code> en el PRINT?', o: ['Para poder concatenar el número con el texto', 'Para redondear el stock', 'Porque PRINT solo acepta enteros', 'Para convertirlo a fecha'], a: 0, ex: "Sin CAST, 'texto' + número intenta convertir el texto a número → error de conversión." },
    { t: 'mc', q: '¿Qué devuelve <code>ERROR_PROCEDURE()</code> si el error NO ocurrió dentro de un procedimiento?', o: ['NULL', '0', 'El nombre de la BD', "'dbo'"], a: 0 },
    { t: 'write', q: 'Escribe la instrucción que muestra en consola el <b>texto</b> del error dentro del CATCH.', a: ['PRINT ERROR_MESSAGE()'], hint: 'PRINT función()' },
  ]
},

/* ───────────────────────── 2 · PROCEDIMIENTOS ───────────────────────── */
{
  id: 'sp', title: 'Procedimientos almacenados', sub: 'CREATE PROCEDURE · OUTPUT', icon: '⚙️', color: 'purple',
  cheat: [
    { h: 'Crear / modificar / ejecutar', code:
`CREATE OR ALTER PROCEDURE uspMostarEmpleados
@p_idPais CHAR(3)
AS
BEGIN
    SELECT * FROM Ventas.clientes
    WHERE idpais = @p_idPais
END
GO

EXECUTE uspMostarEmpleados '002'               -- posicional
EXEC    uspMostarEmpleados @p_idPais = '002'   -- por nombre

SELECT * FROM sys.procedures   -- ver SP existentes
DROP PROCEDURE uspMostarEmpleados` },
    { h: 'Parámetro de salida OUTPUT', p: 'Se declara con <code>OUTPUT</code> en el SP <b>y</b> también al ejecutarlo.', code:
`CREATE PROCEDURE uspCalculaSuma
@p_num1 SMALLINT, @p_num2 SMALLINT, @p_resultado SMALLINT OUTPUT
AS
BEGIN
    SET @p_resultado = @p_num1 + @p_num2
END
GO

DECLARE @v_resultado SMALLINT
EXECUTE uspCalculaSuma 5, 45, @v_resultado OUTPUT
PRINT 'El resultado es: ' + CAST(@v_resultado AS VARCHAR)   -- 50` },
    { h: 'Validar antes de insertar', code:
`IF EXISTS(SELECT * FROM RRHH.Distritos WHERE idDistrito = @p_idDist)
BEGIN
    SELECT @v_idEmp = MAX(IdEmpleado) + 1 FROM RRHH.empleados
    BEGIN TRY
        INSERT INTO RRHH.empleados VALUES (@v_idEmp, ...)
        SET @P_resultado = 'Se insertó correctamente'
    END TRY
    BEGIN CATCH
        SET @P_resultado = 'Error: ' + ERROR_MESSAGE()
    END CATCH
END
ELSE
    SET @P_resultado = 'El distrito no existe'` },
  ],
  qs: [
    { t: 'mc', q: '¿Qué hace <code>CREATE OR ALTER PROCEDURE</code>?', o: ['Crea el SP, o lo modifica si ya existe', 'Solo modifica un SP existente', 'Crea el SP y lo ejecuta', 'Elimina y crea una tabla'], a: 0 },
    { t: 'fill', q: 'Completa la creación del procedimiento.', code: 'CREATE OR ALTER ___ uspMostarEmpleados\n@p_idPais CHAR(3)\nAS\nBEGIN\n    SELECT * FROM Ventas.clientes\n    WHERE idpais = @p_idPais\nEND', a: [['PROCEDURE', 'PROC']] },
    { t: 'mc', q: '¿Cómo se ejecuta un procedimiento almacenado?', o: ["EXECUTE uspMostarEmpleados '002'", "SELECT uspMostarEmpleados('002')", "CALL uspMostarEmpleados('002')", "RUN uspMostarEmpleados '002'"], a: 0 },
    { t: 'mc', q: '¿Cómo ves la lista de procedimientos que existen en la BD?', o: ['SELECT * FROM sys.procedures', 'SELECT * FROM sys.messages', 'SHOW PROCEDURES', 'EXEC sys.list'], a: 0 },
    { t: 'fill', q: 'Completa para que <code>@p_resultado</code> sea un parámetro de <b>salida</b>.', code: 'CREATE PROCEDURE uspCalculaSuma\n@p_num1 SMALLINT, @p_num2 SMALLINT,\n@p_resultado SMALLINT ___\nAS\nBEGIN\n    SET @p_resultado = @p_num1 + @p_num2\nEND', a: [['OUTPUT', 'OUT']] },
    { t: 'order', q: 'Ordena las líneas para ejecutar <b>uspCalculaSuma</b> y mostrar el resultado.', lines: ['DECLARE @v_resultado SMALLINT', 'EXECUTE uspCalculaSuma 5, 45, @v_resultado OUTPUT', "PRINT 'El resultado es: ' + CAST(@v_resultado AS VARCHAR)"] },
    { t: 'mc', q: '¿Qué imprime?', code: "DECLARE @v_resultado SMALLINT\nEXECUTE uspCalculaSuma 5, 45, @v_resultado OUTPUT\nPRINT 'El resultado es: ' + CAST(@v_resultado AS VARCHAR)", o: ['El resultado es: 50', 'El resultado es: 545', 'El resultado es: NULL', 'Error de conversión'], a: 0 },
    { t: 'tf', q: 'Al ejecutar un SP con parámetro de salida, también debes escribir <code>OUTPUT</code> junto a la variable en el EXECUTE.', a: true, ex: 'Si lo olvidas, la variable queda en NULL.' },
    { t: 'build', q: 'Ejecuta el SP pasando el parámetro <b>por nombre</b>.', words: ['EXEC', 'uspMostarEmpleados', '@p_idPais', '=', "'002'"], extra: ['SELECT', 'OUTPUT', '('] },
    { t: 'mc', q: 'Este SP tiene <b>un error</b> en el PRINT. ¿Cuál es?', code: "CREATE OR ALTER PROCEDURE uspCrearCargo\n@p_descargo VARCHAR(30)\nAS\nBEGIN TRY\n    DECLARE @v_id INT\n    SELECT @v_id = MAX(idcargo) + 1 FROM RRHH.Cargos\n    INSERT INTO RRHH.Cargos VALUES (@v_id, @p_descargo)\n    PRINT 'Se inserto: ' + @p_descargo +\n          '(' + CAST(@p_idcargo AS VARCHAR(30)) + ')'\nEND TRY\nBEGIN CATCH\n    PRINT 'OCURRIO UN ERROR!! ' + ERROR_MESSAGE()\nEND CATCH", o: ['@p_idcargo no está declarada; debería ser @v_id', 'Falta el esquema en el INSERT', 'MAX no se puede usar en SELECT', 'ERROR_MESSAGE no existe'], a: 0, ex: 'Error "Debe declarar la variable escalar @p_idcargo". El id generado está en @v_id.' },
    { t: 'mc', q: '¿Qué pasa al ejecutar <code>EXECUTE uspCrearCargo 6, \'Asesor de Marketing\'</code> si el SP solo recibe <code>@p_descargo</code>?', o: ['Error: se enviaron demasiados argumentos', 'Inserta el cargo con id 6', 'Ignora el 6 y funciona', 'Inserta dos cargos'], a: 0, ex: 'El id se calcula dentro con MAX(idcargo)+1, solo se debe enviar la descripción: EXEC uspCrearCargo \'Asesor de Marketing\'.' },
    { t: 'mc', q: '¿Qué hace esta línea?', code: 'SELECT @v_id = MAX(idcargo) + 1 FROM RRHH.Cargos', o: ['Calcula el siguiente id disponible y lo guarda en @v_id', 'Muestra el cargo con mayor id', 'Incrementa todos los id en 1', 'Inserta un nuevo cargo'], a: 0 },
    { t: 'mc', q: 'En el caso integrador <b>Compras.uspInsertaEmpleado</b>, ¿para qué sirve el <code>IF EXISTS(SELECT * FROM RRHH.Distritos WHERE idDistrito = @p_idDist)</code>?', o: ['Validar que el distrito exista antes de insertar (integridad referencial)', 'Crear el distrito si no existe', 'Contar empleados por distrito', 'Borrar el distrito'], a: 0 },
    { t: 'mc', q: 'Si llamas a <b>uspInsertaEmpleado</b> con <code>@p_idDist = 999</code> (no existe), <code>@v_resultado</code> vale…', o: ["'El distrito con ID 999 no exite'", "'El empleado con ID 999 se insertó correctamente'", "'Ocurrió un error con el insert'", 'NULL'], a: 0 },
    { t: 'fill', q: 'Completa para que las fechas se interpreten como día/mes/año.', code: "SET ___ dmy\nDECLARE @v_resultado VARCHAR(300)\nEXEC Compras.uspInsertaEmpleado @p_FecNac = '18/04/1980', ...", a: [['DATEFORMAT']] },
    { t: 'write', q: 'Escribe la instrucción para <b>eliminar</b> el procedimiento <code>usp_prueba</code>.', a: ['DROP PROCEDURE usp_prueba', 'DROP PROC usp_prueba'] },
    { t: 'mc', q: '¿Cuál es el prefijo de los parámetros y variables en T-SQL?', o: ['@', '#', '$', ':'], a: 0, ex: '@ para variables locales/parámetros, @@ para variables globales del sistema (ej. @@ERROR, @@FETCH_STATUS).' },
  ]
},

/* ───────────────────────── 3 · CURSORES ───────────────────────── */
{
  id: 'cur', title: 'Cursores', sub: 'DECLARE · FETCH · @@FETCH_STATUS', icon: '🔁', color: 'orange',
  cheat: [
    { h: 'Ciclo de vida (¡apréndelo de memoria!)', code:
`DECLARE c_cargos CURSOR FOR          -- 1. declarar
    SELECT idcargo, desCargo FROM RRHH.Cargos
DECLARE @v_idcargo INT, @v_desCargo VARCHAR(30)

OPEN c_cargos                         -- 2. abrir
FETCH c_cargos INTO @v_idcargo, @v_desCargo   -- 3. primera fila
WHILE @@FETCH_STATUS = 0              -- 4. mientras haya filas
BEGIN
    PRINT CAST(@v_idcargo AS VARCHAR) + ' ' + @v_desCargo
    FETCH c_cargos INTO @v_idcargo, @v_desCargo  -- siguiente fila
END
CLOSE c_cargos                        -- 5. cerrar
DEALLOCATE c_cargos                   -- 6. liberar` },
    { h: '@@FETCH_STATUS', p: '<b>0</b> = leyó bien · <b>-1</b> = no hay más filas / falló · <b>-2</b> = la fila ya no existe.' },
    { h: 'Cursor SCROLL', p: 'Permite moverse libremente. Sin SCROLL solo se puede avanzar (NEXT).', code:
`DECLARE c_producto CURSOR SCROLL FOR SELECT * FROM Compras.productos
OPEN c_producto
FETCH FIRST       FROM c_producto   -- primera
FETCH ABSOLUTE 6  FROM c_producto   -- la fila 6
FETCH LAST        FROM c_producto   -- última
FETCH PRIOR       FROM c_producto   -- anterior
CLOSE c_producto
DEALLOCATE c_producto` },
    { h: 'Formato de reportes', p: '<code>SPACE(n)</code> n espacios · <code>REPLICATE(\'*\', n)</code> repite · <code>CAST(x AS CHAR(40))</code> rellena a ancho fijo (alinea columnas) · <code>LTRIM(STR(n))</code> número a texto sin espacios · <code>CONVERT(VARCHAR(16), fecha, 6)</code> → <i>25 Aug 97</i>.' },
    { h: 'Contador y acumulador', code:
`SET @cantidad_prod = @cantidad_prod + 1             -- contador
SET @total_precios = @total_precios + @v_PrecioUnidad  -- acumulador` },
  ],
  qs: [
    { t: 'order', q: 'Ordena el ciclo de vida de un cursor.', lines: ['DECLARE c_cargos CURSOR FOR SELECT * FROM RRHH.Cargos', 'OPEN c_cargos', 'FETCH c_cargos INTO @v_id, @v_des', 'WHILE @@FETCH_STATUS = 0', 'CLOSE c_cargos', 'DEALLOCATE c_cargos'] },
    { t: 'mc', q: '<code>@@FETCH_STATUS = 0</code> significa…', o: ['El FETCH leyó una fila correctamente', 'Ya no hay más filas', 'El cursor está cerrado', 'La fila fue eliminada'], a: 0 },
    { t: 'match', q: 'Une cada valor de @@FETCH_STATUS con su significado', pairs: [['0', 'Fila leída correctamente'], ['-1', 'No hay más filas / falló'], ['-2', 'La fila ya no existe']] },
    { t: 'fill', q: 'Completa la condición del bucle.', code: 'WHILE ___ = 0\nBEGIN\n    PRINT @v_desCargo\n    FETCH c_cargos INTO @v_idcargo, @v_desCargo\nEND', a: [['@@FETCH_STATUS']] },
    { t: 'fill', q: 'Completa la lectura de la fila en las variables.', code: 'FETCH c_cargos ___ @v_idcargo, @v_desCargo', a: [['INTO']] },
    { t: 'mc', q: '¿Diferencia entre <code>CLOSE</code> y <code>DEALLOCATE</code>?', o: ['CLOSE cierra (se puede reabrir); DEALLOCATE libera los recursos y elimina la referencia', 'Son lo mismo', 'DEALLOCATE cierra y CLOSE libera', 'CLOSE borra los datos de la tabla'], a: 0 },
    { t: 'fill', q: 'Completa para que el cursor permita FETCH FIRST, LAST y ABSOLUTE.', code: 'DECLARE c_producto CURSOR ___ FOR\nSELECT * FROM Compras.productos', a: [['SCROLL']] },
    { t: 'mc', q: '¿Qué fila devuelve <code>FETCH ABSOLUTE 6 FROM c_producto</code>?', o: ['La sexta fila del resultado', '6 filas', 'La fila con IdProducto = 6', 'La fila 6 contando desde el final'], a: 0 },
    { t: 'tf', q: 'Un cursor declarado sin SCROLL puede usar <code>FETCH LAST</code>.', a: false, ex: 'Un cursor normal es forward-only: solo NEXT. FIRST, LAST, PRIOR, ABSOLUTE y RELATIVE necesitan SCROLL.' },
    { t: 'mc', q: '¿Por qué hay un FETCH <b>antes</b> del WHILE y otro <b>dentro</b>?', o: ['El primero lee la 1.ª fila; el de dentro avanza a la siguiente (si falta → bucle infinito)', 'Por costumbre, uno sobra', 'El primero abre el cursor', 'El de dentro cierra el cursor'], a: 0 },
    { t: 'mc', q: 'ALFKI tiene <b>6</b> pedidos, pero este SP dice “La cantidad de pedidos es: 3”. ¿Por qué?', code: "WHILE @@FETCH_STATUS = 0\nBegin\n    Print SPACE(20) + LTRIM(@vc_IdPed) + SPACE(20) + ...\n    Fetch C_PedidoCli Into @vc_IdPed, @vc_FecPed\n    Fetch C_PedidoCli Into @vc_IdPed, @vc_FecPed\n    SET @cantidad = @cantidad + 1\nEnd", o: ['Hay dos FETCH seguidos: se salta un pedido en cada vuelta', 'El contador empieza en 3', 'Falta un CLOSE', 'SPACE(20) borra filas'], a: 0, ex: 'Cada vuelta lee 2 filas pero imprime/cuenta 1. Solución: dejar un solo FETCH dentro del WHILE.' },
    { t: 'mc', q: '¿Cuál es el <b>contador</b>?', o: ['SET @cantidad_prod = @cantidad_prod + 1', 'SET @total_precios = @total_precios + @v_PrecioUnidad', 'FETCH c_productos INTO …', 'DECLARE @cantidad_prod INT = 0'], a: 0, ex: 'Contador suma 1 cada vez; acumulador suma un valor variable (el precio).' },
    { t: 'mc', q: '¿Qué hace <code>REPLICATE(\'*\', 20)</code>?', o: ['Devuelve 20 asteriscos seguidos', 'Multiplica por 20', 'Imprime 20 filas', 'Devuelve 20 espacios'], a: 0 },
    { t: 'mc', q: '¿Para qué se usa <code>CAST(@v_NomProducto AS CHAR(40))</code> en el reporte?', o: ['Para que ocupe siempre 40 caracteres y las columnas queden alineadas', 'Para cortar el nombre a 4 letras', 'Para pasarlo a mayúsculas', 'Para convertirlo en número'], a: 0, ex: 'CHAR es de longitud fija: rellena con espacios hasta 40.' },
    { t: 'mc', q: 'La cantidad de variables en <code>FETCH … INTO</code> debe…', o: ['Coincidir en número y tipo con las columnas del SELECT del cursor', 'Ser siempre 2', 'Ser mayor que las columnas', 'No importa'], a: 0 },
    { t: 'mc', q: 'En los <b>cursores anidados</b> (clientes → pedidos), ¿dónde se declara, abre, cierra y libera el cursor de pedidos?', o: ['Dentro del WHILE del cursor de clientes, una vez por cada cliente', 'Antes de declarar el cursor de clientes', 'Después del DEALLOCATE de clientes', 'En otro procedimiento'], a: 0 },
    { t: 'mc', q: '¿Qué devuelve <code>CONVERT(VARCHAR(16), @vc_FecPed, 6)</code> para el 25/08/1997?', o: ['25 Aug 97', '1997-08-25', '08/25/1997', '25/08/1997'], a: 0 },
    { t: 'write', q: 'Escribe la instrucción que <b>libera</b> el cursor <code>c_productos</code>.', a: ['DEALLOCATE c_productos'] },
    { t: 'build', q: 'Arma la declaración del cursor de clientes.', words: ['DECLARE', 'C_Cliente', 'CURSOR', 'FOR', 'SELECT', 'NomCliente', ',', 'DirCliente', 'FROM', 'Ventas.clientes'], extra: ['OPEN', 'INTO', 'SCROLL'] },
    { t: 'mc', q: '<code>LTRIM(STR(@cantidad_prod))</code> sirve para…', o: ['Convertir el número a texto y quitar los espacios de la izquierda', 'Redondear el número', 'Quitar decimales', 'Convertir texto a número'], a: 0, ex: 'STR() devuelve el número alineado a la derecha con espacios; LTRIM los quita.' },
  ]
},

/* ───────────────────────── 4 · FUNCIONES ───────────────────────── */
{
  id: 'fn', title: 'Funciones', sub: 'RETURNS · RETURN · dbo.', icon: '🧮', color: 'green',
  cheat: [
    { h: 'Función escalar', code:
`CREATE OR ALTER FUNCTION SUMAR_NUMEROS(@P_NUM1 SMALLINT, @P_NUM2 SMALLINT)
RETURNS SMALLINT            -- tipo que devuelve
AS
BEGIN
    DECLARE @p_resultado SMALLINT
    SET @p_resultado = @P_NUM1 + @P_NUM2
    RETURN @p_resultado     -- valor que devuelve
END
GO

SELECT dbo.SUMAR_NUMEROS(35, 27)    -- 62  (¡con esquema!)
PRINT  dbo.SUMAR_NUMEROS(35, 27)

SELECT NomProducto,
       dbo.SUMAR_NUMEROS(UnidadesEnExistencia, UnidadesEnPedido) AS Suma
FROM Compras.productos` },
    { h: 'CASE dentro de la función', code:
`SET @V_RES = CASE
    WHEN @P_OP = '+' THEN @P_NUM1 + @P_NUM2
    WHEN @P_OP = '-' THEN @P_NUM1 - @P_NUM2
    WHEN @P_OP = '*' THEN @P_NUM1 * @P_NUM2
    WHEN @P_OP = '/' THEN @P_NUM1 / @P_NUM2
END                -- si no coincide ninguno → NULL
RETURN @V_RES` },
    { h: 'Función con consulta', code:
`CREATE FUNCTION Compras.fu_promedio_precio(@P_IDPROVEEDOR INT)
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @V_PROMEDIO DECIMAL(12,2)
    SELECT @V_PROMEDIO = AVG(PrecioUnidad) FROM Compras.productos
    WHERE IdProveedor = @P_IDPROVEEDOR
    RETURN @V_PROMEDIO
END
GO
SELECT NomProveedor, Compras.fu_promedio_precio(IdProveedor) AS promedio
FROM Compras.proveedores` },
    { h: 'Función vs Procedimiento', p: 'La <b>función</b> siempre devuelve un valor con RETURN, se usa dentro de SELECT, <b>no</b> puede hacer INSERT/UPDATE/DELETE ni PRINT. El <b>SP</b> se ejecuta con EXEC, puede modificar datos, usar PRINT y devolver valores con OUTPUT.' },
    { h: 'FORMAT de fechas', p: '<code>FORMAT(GETDATE(), \'D\', \'es-es\')</code> → fecha larga en texto (<i>sábado, 26 de septiembre de 2026</i>). <code>\'d\'</code> → fecha corta (<i>26/09/2026</i>).' },
  ],
  qs: [
    { t: 'fill', q: 'Completa la cabecera de la función.', code: 'CREATE FUNCTION SUMAR_NUMEROS(@P_NUM1 SMALLINT, @P_NUM2 SMALLINT)\n___ SMALLINT\nAS\nBEGIN\n    ...', a: [['RETURNS']] },
    { t: 'fill', q: 'Completa la línea que devuelve el valor.', code: 'BEGIN\n    DECLARE @p_resultado SMALLINT\n    SET @p_resultado = @P_NUM1 + @P_NUM2\n    ___ @p_resultado\nEND', a: [['RETURN']] },
    { t: 'mc', q: '¿Diferencia entre <code>RETURNS</code> y <code>RETURN</code>?', o: ['RETURNS indica el tipo de dato; RETURN devuelve el valor', 'Son sinónimos', 'RETURN va en la cabecera y RETURNS al final', 'RETURNS se usa en SP y RETURN en funciones'], a: 0 },
    { t: 'mc', q: '¿Cómo se invoca correctamente la función escalar?', o: ['SELECT dbo.SUMAR_NUMEROS(35, 27)', 'EXEC SUMAR_NUMEROS 35, 27', 'SELECT SUMAR_NUMEROS(35, 27)', 'CALL dbo.SUMAR_NUMEROS(35, 27)'], a: 0, ex: 'Las funciones escalares se llaman con el esquema: dbo.nombre(...).' },
    { t: 'mc', q: '¿Qué devuelve <code>SELECT dbo.SUMAR_NUMEROS(35, 27)</code>?', o: ['62', '3527', '35', 'Error'], a: 0 },
    { t: 'mc', q: '¿Qué devuelve <code>SELECT dbo.OPERAR_NUMEROS(10, 30, \'*\')</code>?', o: ['300.00', '40.00', '0.33', 'NULL'], a: 0 },
    { t: 'mc', q: '¿Qué devuelve <code>dbo.OPERAR_NUMEROS(10, 30, \'%\')</code>?', o: ['NULL (ningún WHEN coincide)', '10', 'Error de sintaxis', '0'], a: 0, ex: 'Un CASE sin ELSE devuelve NULL si ninguna condición se cumple.' },
    { t: 'mc', q: '¿Qué imprime <code>PRINT dbo.fu_operacion(200, 20)</code>?', code: 'CREATE OR ALTER FUNCTION fu_operacion(@p_sueldo MONEY, @p_pct_descuento DECIMAL(4,2))\nRETURNS MONEY\nAS\nBEGIN\n    DECLARE @p_resultado MONEY\n    SET @p_resultado = @p_sueldo * @p_pct_descuento / 100\n    RETURN @p_resultado\nEND', o: ['40.00', '4000.00', '220.00', '180.00'], a: 0 },
    { t: 'mc', q: "¿Qué imprime <code>PRINT dbo.fu_saludo('Sebastian')</code>?", code: "SET @v_saludo = 'Hola ' + @p_nombre + ' Bienvenido al curso'\nRETURN @v_saludo", o: ['Hola Sebastian Bienvenido al curso', 'HolaSebastianBienvenido al curso', 'Hola @p_nombre Bienvenido al curso', 'NULL'], a: 0 },
    { t: 'mc', q: "¿Qué devuelve <code>FORMAT(GETDATE(), 'D', 'es-es')</code>?", o: ['La fecha larga en texto (ej. sábado, 26 de septiembre de 2026)', 'Solo el día', 'La fecha corta 26/09/2026', 'La hora'], a: 0 },
    { t: 'tf', q: 'Dentro de una función escalar se puede usar <code>PRINT</code> y hacer un <code>INSERT</code> en una tabla.', a: false, ex: 'Las funciones no pueden tener efectos secundarios: nada de PRINT, INSERT, UPDATE ni DELETE sobre tablas. Eso es para procedimientos.' },
    { t: 'match', q: 'Función o procedimiento?', pairs: [['Se usa dentro de un SELECT', 'Función'], ['Se ejecuta con EXEC', 'Procedimiento'], ['Devuelve valor con RETURN', 'Función'], ['Puede hacer INSERT y PRINT', 'Procedimiento']] },
    { t: 'fill', q: 'Completa la función que devuelve el promedio de precios de un proveedor.', code: 'SELECT @V_PROMEDIO = ___(PrecioUnidad)\nFROM Compras.productos\nWHERE IdProveedor = @P_IDPROVEEDOR', a: [['AVG']] },
    { t: 'mc', q: 'La función <code>fu_promedio_precio</code> se creó en el esquema <b>Compras</b>. ¿Cómo la llamas?', o: ['Compras.fu_promedio_precio(IdProveedor)', 'dbo.fu_promedio_precio(IdProveedor)', 'fu_promedio_precio(IdProveedor)', 'EXEC Compras.fu_promedio_precio'], a: 0 },
    { t: 'build', q: 'Llama a la función que divide 17 entre 7.', words: ['SELECT', 'dbo.OPERAR_NUMEROS', '(', '17', ',', '7', ',', "'/'", ')'], extra: ['EXEC', "'*'", 'RETURN'] },
    { t: 'write', q: 'Escribe la instrucción para eliminar la función <code>OBTENER_FECHA</code>.', a: ['DROP FUNCTION OBTENER_FECHA', 'DROP FUNCTION dbo.OBTENER_FECHA'] },
  ]
},

/* ───────────────────────── 5 · TRANSACCIONES ───────────────────────── */
{
  id: 'tx', title: 'Transacciones', sub: 'BEGIN TRAN · COMMIT · ROLLBACK', icon: '💸', color: 'yellow',
  cheat: [
    { h: 'Idea', p: 'Una transacción agrupa varias operaciones que se hacen <b>todas o ninguna</b> (atomicidad). <code>COMMIT</code> confirma, <code>ROLLBACK</code> deshace.' },
    { h: 'Transferencia con TRY/CATCH', code:
`DECLARE @Monto DECIMAL(18,2) = 200
BEGIN TRANSACTION
BEGIN TRY
    UPDATE CUENTAS SET saldo = saldo - @Monto WHERE numCuenta = '20161206'
    UPDATE CUENTAS SET saldo = saldo + @Monto WHERE numCuenta = '20161207'
    COMMIT TRANSACTION          -- todo bien → confirmar
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION        -- algo falló → deshacer todo
    PRINT 'Ha ocurrido un error!'
END CATCH
-- 1200 → 1000   y   1000 → 1200` },
    { h: 'SAVE TRANSACTION (savepoint)', code:
`BEGIN TRAN
UPDATE CUENTAS SET saldo = 50000 WHERE numCuenta = '20161206'
UPDATE CUENTAS SET saldo = 5000  WHERE numCuenta = '20161206'
SAVE TRANSACTION Punto1
UPDATE CUENTAS SET saldo = 5     WHERE numCuenta = '20161206'
ROLLBACK TRANSACTION Punto1   -- deshace solo lo posterior a Punto1
COMMIT                        -- saldo final = 5000` },
    { h: 'Bloqueos y backup', p: 'Si haces <code>BEGIN TRAN</code> + UPDATE/DELETE y no cierras con COMMIT o ROLLBACK, las filas quedan <b>bloqueadas</b> para otras sesiones. <code>SELECT * INTO bk_clientes FROM Ventas.clientes</code> crea una tabla copia (backup).' },
  ],
  qs: [
    { t: 'mc', q: '¿Qué es una transacción?', o: ['Un conjunto de operaciones que se ejecutan todas o ninguna', 'Un tipo de tabla temporal', 'Un procedimiento que se ejecuta solo', 'Una copia de seguridad'], a: 0 },
    { t: 'match', q: 'Une cada instrucción con lo que hace', pairs: [['BEGIN TRAN', 'Inicia la transacción'], ['COMMIT', 'Confirma los cambios'], ['ROLLBACK', 'Deshace los cambios'], ['SAVE TRANSACTION', 'Crea un punto de guardado']] },
    { t: 'fill', q: 'Completa el inicio de la transacción.', code: "BEGIN ___\nUPDATE CUENTAS SET saldo = saldo - 200 WHERE numCuenta = '20161206'", a: [['TRANSACTION', 'TRAN']] },
    { t: 'mc', q: 'Saldos iniciales: 20161206 = 1200 y 20161207 = 1000. Tras transferir <b>200</b> sin errores, ¿cuánto tiene 20161207?', o: ['1200', '1000', '800', '1400'], a: 0 },
    { t: 'mc', q: '¿Por qué va <code>ROLLBACK TRANSACTION</code> en el CATCH?', o: ['Si falla un UPDATE, se deshace el otro y no se pierde dinero', 'Para confirmar los cambios', 'Para cerrar la conexión', 'Para repetir la transacción'], a: 0 },
    { t: 'order', q: 'Ordena la transferencia bancaria segura.', lines: ['BEGIN TRANSACTION', 'BEGIN TRY', 'UPDATE CUENTAS SET saldo = saldo - @Monto WHERE numCuenta = @Origen', 'UPDATE CUENTAS SET saldo = saldo + @Monto WHERE numCuenta = @Destino', 'COMMIT TRANSACTION', 'END TRY', 'BEGIN CATCH', 'ROLLBACK TRANSACTION', 'END CATCH'] },
    { t: 'fill', q: 'Completa para crear un punto de guardado.', code: '___ TRANSACTION Punto1', a: [['SAVE']] },
    { t: 'mc', q: '¿Cuál es el saldo final de la cuenta 20161206?', code: "BEGIN TRAN\nUPDATE CUENTAS SET saldo = 50000 WHERE numCuenta = '20161206'\nUPDATE CUENTAS SET saldo = 5000  WHERE numCuenta = '20161206'\nSAVE TRANSACTION Punto1\nUPDATE CUENTAS SET saldo = 5     WHERE numCuenta = '20161206'\nROLLBACK TRANSACTION Punto1\nCOMMIT", o: ['5000', '5', '50000', '1200 (el original)'], a: 0, ex: 'ROLLBACK a Punto1 solo deshace lo que vino después del savepoint (saldo = 5). Queda 5000 y el COMMIT lo confirma.' },
    { t: 'build', q: 'Deshaz solo lo que pasó después del savepoint <b>Punto1</b>.', words: ['ROLLBACK', 'TRANSACTION', 'Punto1'], extra: ['COMMIT', 'SAVE', 'BEGIN'] },
    { t: 'tf', q: 'Después de <code>ROLLBACK TRANSACTION Punto1</code> la transacción sigue abierta y todavía hay que hacer COMMIT o ROLLBACK.', a: true },
    { t: 'mc', q: 'Haces <code>BEGIN TRAN</code> + <code>UPDATE CUENTAS …</code> y no ejecutas COMMIT ni ROLLBACK. ¿Qué pasa?', o: ['Las filas quedan bloqueadas para otras sesiones', 'Se confirma automáticamente', 'Se deshace automáticamente al instante', 'Se borra la tabla'], a: 0 },
    { t: 'mc', q: '¿Qué hace <code>SELECT * INTO bk_clientes FROM Ventas.clientes</code>?', o: ['Crea la tabla bk_clientes con una copia de los datos', 'Inserta en Ventas.clientes', 'Borra bk_clientes', 'Crea una vista'], a: 0 },
    { t: 'write', q: 'Escribe la instrucción para <b>confirmar</b> la transacción.', a: ['COMMIT', 'COMMIT TRANSACTION', 'COMMIT TRAN'] },
  ]
},

/* ───────────────────────── 6 · TRIGGERS ───────────────────────── */
{
  id: 'trg', title: 'Triggers', sub: 'inserted · deleted · DDL', icon: '⚡', color: 'pink',
  cheat: [
    { h: 'Trigger DML', p: 'Se dispara solo ante INSERT, UPDATE o DELETE. <code>FOR</code> = <code>AFTER</code>.', code:
`CREATE OR ALTER TRIGGER RRHH.trgDistrito
ON RRHH.Distritos
FOR INSERT, UPDATE, DELETE
AS
BEGIN
    PRINT 'SE REALIZÓ UNA OPERACION DML'
END` },
    { h: 'Tablas virtuales inserted / deleted', p: '<b>INSERT</b> → filas en <code>inserted</code> · <b>DELETE</b> → filas en <code>deleted</code> · <b>UPDATE</b> → las dos (deleted = valor viejo, inserted = valor nuevo).', code:
`IF EXISTS(SELECT 1 FROM inserted) AND NOT EXISTS(SELECT 1 FROM deleted)
    PRINT 'Se realizó una inserción'
ELSE IF NOT EXISTS(SELECT 1 FROM inserted) AND EXISTS(SELECT 1 FROM deleted)
    PRINT 'Se realizó una eliminación'
ELSE IF EXISTS(SELECT 1 FROM inserted) AND EXISTS(SELECT 1 FROM deleted)
    PRINT 'Se realizó una actualización'` },
    { h: 'Regla de negocio', code:
`CREATE OR ALTER TRIGGER COMPRAS.TRG_UPD30_PRODUCTO
ON Compras.productos
FOR UPDATE
AS
BEGIN
    DECLARE @v_actual DECIMAL(10,0), @v_nuevo DECIMAL(10,0), @v_msg VARCHAR(200)
    SELECT @v_actual = PrecioUnidad FROM deleted     -- precio viejo
    SELECT @v_nuevo  = PrecioUnidad FROM inserted    -- precio nuevo
    IF @v_nuevo > 1.3 * @v_actual
    BEGIN
        SET @v_msg = 'MÁXIMO: ' + TRIM(STR(1.3 * @v_actual))
        ROLLBACK TRANSACTION           -- revierte el UPDATE
        RAISERROR(@v_msg, 10, 1)
    END
END` },
    { h: 'Activar / desactivar / DDL', code:
`DISABLE TRIGGER COMPRAS.TRG_UPD_PRODUCTO ON Compras.productos
ENABLE  TRIGGER COMPRAS.TRG_UPD_PRODUCTO ON Compras.productos
SELECT * FROM sys.triggers

-- Trigger DDL: a nivel de base de datos
CREATE OR ALTER TRIGGER trgImpideEliminarTablas
ON DATABASE
AFTER DROP_TABLE
AS
BEGIN
    RAISERROR('!!NO PUEDE ELIMINAR UNA TABLA EN ESTA BD', 10, 1)
    ROLLBACK
END` },
    { h: 'Auditoría', p: '<code>GETDATE()</code> fecha/hora · <code>HOST_NAME()</code> equipo · <code>SUSER_SNAME()</code> login · <code>APP_NAME()</code> aplicación · <code>USER</code> usuario de la BD · <code>DATEPART(HH, GETDATE())</code> hora actual.' },
  ],
  qs: [
    { t: 'mc', q: '¿Qué es un trigger?', o: ['Código que se ejecuta automáticamente ante un evento (INSERT, UPDATE, DELETE, DROP…)', 'Un procedimiento que se ejecuta con EXEC', 'Una función que devuelve una tabla', 'Un tipo de índice'], a: 0 },
    { t: 'fill', q: 'Completa la creación del trigger.', code: "CREATE OR ALTER TRIGGER RRHH.trgDistrito\n___ RRHH.Distritos\nFOR INSERT, UPDATE, DELETE\nAS\nBEGIN\n    PRINT 'SE REALIZÓ UNA OPERACION DML'\nEND", a: [['ON']] },
    { t: 'match', q: '¿Qué tablas virtuales tienen filas en cada operación?', pairs: [['INSERT', 'Solo inserted'], ['DELETE', 'Solo deleted'], ['UPDATE', 'inserted y deleted']] },
    { t: 'mc', q: 'En un <b>UPDATE</b>, la tabla <code>deleted</code> contiene…', o: ['Los valores antiguos (antes del cambio)', 'Los valores nuevos', 'Las filas borradas de otra tabla', 'Nada, está vacía'], a: 0 },
    { t: 'mc', q: 'Este trigger nunca imprime “eliminación” ni “inserción”. ¿Cuál es el error?', code: "IF EXISTS(SELECT 1 FROM inserted) AND NOT EXISTS(SELECT 1 FROM inserted)\n    PRINT 'Se realizó una insercción'\nELSE IF NOT EXISTS(SELECT 1 FROM inserted) AND EXISTS(SELECT 1 FROM inserted)\n    PRINT 'Se realizó una eliminación'\nELSE IF EXISTS(SELECT 1 FROM inserted) AND EXISTS(SELECT 1 FROM inserted)\n    PRINT 'Se realizó una actualización'", o: ['La segunda condición de cada IF debería consultar deleted, no inserted', 'Falta un COMMIT', 'PRINT no se puede usar en triggers', 'Debe usar SELECT * en vez de SELECT 1'], a: 0, ex: '"EXISTS(inserted) AND NOT EXISTS(inserted)" siempre es falso. La segunda tabla debe ser deleted.' },
    { t: 'fill', q: 'Corrige la condición que detecta una <b>eliminación</b>.', code: "ELSE IF NOT EXISTS(SELECT 1 FROM inserted)\n    AND EXISTS(SELECT 1 FROM ___)\n    PRINT 'Se realizó una eliminación'", a: [['deleted']] },
    { t: 'mc', q: 'El trigger <code>RRHH.trgCargos</code> es <code>FOR UPDATE, DELETE</code>. ¿Qué pasa al hacer <code>INSERT INTO RRHH.Cargos VALUES (99, \'Asistente\')</code>?', o: ['El trigger no se dispara', 'Imprime "Se realizó una inserción"', 'Da error', 'Imprime "Se realizó una actualización"'], a: 0 },
    { t: 'fill', q: 'Completa para <b>desactivar</b> el trigger.', code: '___ TRIGGER COMPRAS.TRG_UPD_PRODUCTO ON Compras.productos', a: [['DISABLE']] },
    { t: 'mc', q: '¿Qué devuelve <code>DATEPART(HH, GETDATE())</code>?', o: ['La hora actual (0–23)', 'Los minutos actuales', 'La fecha completa', 'El día de la semana'], a: 0 },
    { t: 'mc', q: 'Regla: no subir el precio más del 30 %. Si el precio actual es <b>20</b>, ¿cuál es el máximo permitido?', o: ['26', '30', '23', '50'], a: 0, ex: '1.3 × 20 = 26. Si intentas 27, el trigger hace ROLLBACK.' },
    { t: 'mc', q: 'En <code>TRG_UPD30_PRODUCTO</code>, ¿de dónde sale el precio <b>anterior</b>?', o: ['SELECT PrecioUnidad FROM deleted', 'SELECT PrecioUnidad FROM inserted', 'SELECT PrecioUnidad FROM Compras.productos', 'De un parámetro'], a: 0 },
    { t: 'mc', q: '¿Qué hace <code>ROLLBACK TRANSACTION</code> dentro de un trigger?', o: ['Revierte la operación (INSERT/UPDATE/DELETE) que disparó el trigger', 'Elimina el trigger', 'Desactiva el trigger', 'Nada'], a: 0 },
    { t: 'order', q: 'Ordena el trigger DDL que impide borrar tablas.', lines: ['CREATE OR ALTER TRIGGER trgImpideEliminarTablas', 'ON DATABASE', 'AFTER DROP_TABLE', 'AS', 'BEGIN', "RAISERROR('!!NO PUEDE ELIMINAR UNA TABLA EN ESTA BD', 10, 1)", 'ROLLBACK', 'END'] },
    { t: 'mc', q: 'Un trigger <b>DDL</b> se crea sobre…', o: ['ON DATABASE (eventos como DROP_TABLE)', 'ON una tabla, FOR INSERT', 'ON un procedimiento', 'ON sys.triggers'], a: 0 },
    { t: 'mc', q: '¿Cómo ves los triggers que existen?', o: ['SELECT * FROM sys.triggers', 'SELECT * FROM sys.procedures', 'EXEC sp_triggers', 'SHOW TRIGGERS'], a: 0 },
    { t: 'mc', q: '¿Para qué sirve <code>SET NOCOUNT ON</code>?', o: ['Para no mostrar el mensaje "(1 fila afectada)"', 'Para desactivar triggers', 'Para no contar filas en un SELECT COUNT', 'Para desactivar errores'], a: 0 },
    { t: 'match', q: 'Funciones útiles para auditoría', pairs: [['SUSER_SNAME()', 'Login del usuario'], ['HOST_NAME()', 'Nombre del equipo'], ['APP_NAME()', 'Aplicación usada'], ['GETDATE()', 'Fecha y hora actual']] },
    { t: 'tf', q: 'En SQL Server, <code>FOR UPDATE</code> y <code>AFTER UPDATE</code> en un trigger significan lo mismo.', a: true },
    { t: 'build', q: 'Arma la cabecera del trigger para UPDATE y DELETE sobre Cargos.', words: ['CREATE', 'OR', 'ALTER', 'TRIGGER', 'RRHH.trgCargos', 'ON', 'RRHH.Cargos', 'FOR', 'UPDATE', ',', 'DELETE'], extra: ['INSERT', 'PROCEDURE', 'RETURNS'] },
    { t: 'write', q: 'Escribe la instrucción para <b>activar</b> de nuevo el trigger <code>RRHH.TRG_INS_CARGO</code> de la tabla <code>RRHH.Cargos</code>.', a: ['ENABLE TRIGGER RRHH.TRG_INS_CARGO ON RRHH.Cargos'] },
  ]
},

/* ───────────────────────── 7 · CASOS PARA EL EXAMEN ───────────────────────── */
{
  id: 'casos', title: 'Casos tipo examen', sub: 'Los que quedaron por resolver', icon: '🏆', color: 'gold',
  cheat: [
    { h: 'SP con OUTPUT que valida antes de insertar (Caso 2 corregido)', code:
`CREATE OR ALTER PROCEDURE uspCrearCargo
@p_descargo VARCHAR(30), @p_mensaje VARCHAR(200) OUTPUT
AS
BEGIN
    IF EXISTS(SELECT 1 FROM RRHH.Cargos WHERE desCargo = @p_descargo)
        SET @p_mensaje = 'El cargo ' + @p_descargo + ' ya existe'
    ELSE
    BEGIN
        BEGIN TRY
            DECLARE @v_id INT
            SELECT @v_id = MAX(idcargo) + 1 FROM RRHH.Cargos
            INSERT INTO RRHH.Cargos VALUES (@v_id, @p_descargo)
            SET @p_mensaje = 'Se insertó el cargo ' + @p_descargo
                           + ' (' + CAST(@v_id AS VARCHAR) + ')'
        END TRY
        BEGIN CATCH
            SET @p_mensaje = 'Error: ' + ERROR_MESSAGE()
        END CATCH
    END
END
GO
DECLARE @msg VARCHAR(200)
EXEC uspCrearCargo 'Asesor de Marketing', @msg OUTPUT
PRINT @msg` },
    { h: 'uspCalculaImpuesto', code:
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
PRINT 'Impuesto: ' + CAST(@imp AS VARCHAR)` },
    { h: 'Vista de empleados', code:
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
SELECT * FROM RRHH.vw_empleados` },
    { h: 'Caso 3: función de descuento + vista', code:
`CREATE OR ALTER FUNCTION Compras.fu_descuento(@p_idProducto INT, @p_pct DECIMAL(5,2))
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @v_precio DECIMAL(10,0)
    SELECT @v_precio = PrecioUnidad FROM Compras.productos
    WHERE IdProducto = @p_idProducto
    RETURN @v_precio * @p_pct / 100
END
GO
CREATE OR ALTER VIEW Compras.vw_descuentos
AS
SELECT IdProducto, NomProducto, PrecioUnidad,
       Compras.fu_descuento(IdProducto, 10) AS Descuento
FROM Compras.productos` },
    { h: 'Caso 2 triggers: auditar las 3 operaciones', code:
`DISABLE TRIGGER RRHH.TRG_INS_CARGO ON RRHH.Cargos
GO
CREATE OR ALTER TRIGGER RRHH.TRG_AUDIT_CARGO
ON RRHH.Cargos
FOR INSERT, UPDATE, DELETE
AS
BEGIN
    IF EXISTS(SELECT 1 FROM inserted) AND EXISTS(SELECT 1 FROM deleted)
        INSERT INTO LOG_TABLE VALUES('ACTUALIZACION EN LA TABLA CARGOS', USER)
    ELSE IF EXISTS(SELECT 1 FROM inserted)
        INSERT INTO LOG_TABLE VALUES('INSERCION EN LA TABLA CARGOS', USER)
    ELSE IF EXISTS(SELECT 1 FROM deleted)
        INSERT INTO LOG_TABLE VALUES('ELIMINACION EN LA TABLA CARGOS', USER)
END` },
  ],
  qs: [
    { t: 'fill', q: 'Caso 2: valida que el cargo <b>no exista</b> antes de insertar.', code: "IF ___(SELECT 1 FROM RRHH.Cargos WHERE desCargo = @p_descargo)\n    SET @p_mensaje = 'El cargo ya existe'\nELSE\n    ...", a: [['EXISTS']] },
    { t: 'fill', q: 'Caso 2: declara el parámetro de salida del mensaje.', code: 'CREATE OR ALTER PROCEDURE uspCrearCargo\n@p_descargo VARCHAR(30),\n@p_mensaje VARCHAR(200) ___\nAS', a: [['OUTPUT', 'OUT']] },
    { t: 'order', q: 'Ordena la ejecución del SP que devuelve el mensaje por OUTPUT.', lines: ['DECLARE @msg VARCHAR(200)', "EXEC uspCrearCargo 'Asesor de Marketing', @msg OUTPUT", 'PRINT @msg'] },
    { t: 'fill', q: '<b>uspCalculaImpuesto</b>: completa el cálculo.', code: 'SELECT @p_impuesto = ___ * @p_pct / 100\nFROM Compras.productos\nWHERE IdProducto = @p_idProducto', a: [['PrecioUnidad']] },
    { t: 'mc', q: 'Si un producto cuesta 20 y el impuesto es 18 %, <code>@p_impuesto</code> vale…', o: ['3.60', '23.60', '0.18', '360'], a: 0 },
    { t: 'fill', q: 'Vista: calcula la <b>edad</b> del empleado.', code: 'DATEDIFF(___, e.FecNac, GETDATE()) AS Edad', a: [['YEAR', 'YY', 'YYYY']] },
    { t: 'fill', q: 'Vista: calcula los <b>meses</b> que lleva laborando.', code: 'DATEDIFF(___, e.FecContrata, GETDATE()) AS MesesLaborando', a: [['MONTH', 'MM', 'M']] },
    { t: 'fill', q: 'Vista: une empleados con cargos para obtener la descripción.', code: 'FROM RRHH.empleados e\nINNER JOIN RRHH.Cargos c ___ e.idCargo = c.idcargo', a: [['ON']] },
    { t: 'order', q: 'Ordena la vista de empleados.', lines: ['CREATE OR ALTER VIEW RRHH.vw_empleados', 'AS', "SELECT e.IdEmpleado, e.NomEmpleado + ' ' + e.ApeEmpleado AS NombreCompleto,", 'DATEDIFF(YEAR, e.FecNac, GETDATE()) AS Edad, c.desCargo', 'FROM RRHH.empleados e', 'INNER JOIN RRHH.Cargos c ON e.idCargo = c.idcargo'] },
    { t: 'write', q: 'Escribe la consulta que muestra el resultado de la vista <code>RRHH.vw_empleados</code>.', a: ['SELECT * FROM RRHH.vw_empleados'] },
    { t: 'order', q: 'Caso 3: ordena la función que calcula el monto de descuento.', lines: ['CREATE OR ALTER FUNCTION Compras.fu_descuento(@p_idProducto INT, @p_pct DECIMAL(5,2))', 'RETURNS DECIMAL(12,2)', 'AS', 'BEGIN', 'DECLARE @v_precio DECIMAL(10,0)', 'SELECT @v_precio = PrecioUnidad FROM Compras.productos WHERE IdProducto = @p_idProducto', 'RETURN @v_precio * @p_pct / 100', 'END'] },
    { t: 'mc', q: 'Caso 3: ¿cómo usas la función en la vista para <b>todos</b> los productos?', o: ['SELECT NomProducto, Compras.fu_descuento(IdProducto, 10) AS Descuento FROM Compras.productos', 'EXEC Compras.fu_descuento 10', 'SELECT * FROM Compras.fu_descuento', 'SELECT Compras.fu_descuento FROM Compras.productos'], a: 0 },
    { t: 'fill', q: 'Caso 2 triggers: primero desactiva el trigger anterior.', code: '___ TRIGGER RRHH.TRG_INS_CARGO ON RRHH.Cargos', a: [['DISABLE']] },
    { t: 'fill', q: 'Trigger de auditoría: detecta la <b>actualización</b>.', code: "IF EXISTS(SELECT 1 FROM inserted) AND EXISTS(SELECT 1 FROM ___)\n    INSERT INTO LOG_TABLE VALUES('ACTUALIZACION EN LA TABLA CARGOS', USER)", a: [['deleted']] },
    { t: 'mc', q: 'En el trigger de auditoría, ¿por qué se revisa primero el caso “inserted <b>y</b> deleted”?', o: ['Porque un UPDATE llena ambas; si revisas solo inserted primero, lo confundirías con un INSERT', 'Por orden alfabético', 'Porque es más rápido', 'No importa el orden'], a: 0 },
    { t: 'mc', q: 'Caso 1 errores: ¿qué muestra si el producto 5 (Mezcla Gumbo del chef Anton) tiene stock 0?', code: "PRINT 'EL STOCK CONSULTADO PARA EL PRODUCTO ' + UPPER(@NOMBREDELPROD) + ' ES: ' + CAST(@STOCK AS VARCHAR)\nIF @STOCK < 5\n    RAISERROR('STOCK INSUFICIENTE',16,1)\nPRINT 'SE PUEDE VENDER'\n-- CATCH: PRINT 'OCURRIO UN ERROR!! ' + ERROR_MESSAGE()", o: ['EL STOCK CONSULTADO PARA EL PRODUCTO MEZCLA GUMBO DEL CHEF ANTON ES: 0\nOCURRIO UN ERROR!! STOCK INSUFICIENTE', 'EL STOCK CONSULTADO PARA EL PRODUCTO Mezcla Gumbo del chef Anton ES: 0\nSE PUEDE VENDER', 'OCURRIO UN ERROR!! STOCK INSUFICIENTE', 'SE PUEDE VENDER'], a: 0, ex: 'UPPER() pasa el nombre a mayúsculas; el RAISERROR salta al CATCH.' },
  ]
},
];
