# Activar inventario, compras simuladas y temporizadores

## 1. Activar el guardado compartido
En tu proyecto Supabase, abre **SQL Editor > New query**, pega todo el contenido de `supabase-inventario.sql` y pulsa **Run**. No necesitas cambiar las claves ni el proveedor Google. El script crea una tabla privada por usuario con seguridad por filas y una función de guardado con control de versión.

La aplicación funciona localmente antes de ejecutar el script, pero no compartirá los datos con el iPhone hasta completarlo. **Perfil > Sincronizar** muestra el resultado. No hemos ejecutado el SQL ni verificado tu servidor desde aquí.

## 2. Publicar en GitHub
Sube los archivos de esta carpeta al mismo repositorio y a las mismas rutas. Incluye `extras.js`, `recetario-core.js`, `app.js`, `auth.js`, `index.html`, `styles.css` y `service-worker.js`. Este último ya cambia la caché a `mi-recetario-v5-inventario`. Espera la ejecución verde en Actions. En iPhone abre la aplicación con Internet, ciérrala completamente y vuelve a abrirla. El SQL se ejecuta en Supabase; no es un archivo de configuración del navegador.

## 3. Prueba rápida para la clase
1. Inventario: agrega **Huevos**, **2**, **unidad**.
2. Abre Bizcocho de vainilla y pulsa **Calcular ingredientes faltantes**. Debe mostrar 1 huevo y los otros faltantes.
3. En Compras, agrega un paquete de huevos: 6 unidades a RD$ 75.00 (precio de ejemplo).
4. Confirma la compra simulada. El inventario todavía tendrá 2 huevos.
5. Confirma la recepción simulada en el historial. Ahora tendrá 8 huevos. No es posible recibir dos veces el mismo pedido.
6. Edita una receta: conserva sus ingredientes descriptivos y registra las cantidades necesarias en **Cantidades para inventario**. Puedes agregar productos personalizados y precio en Compras.
7. En cada paso asigna minutos y segundos al temporizador. Deja ambos en 0 para no usar temporizador.
8. Abre la receta e inicia, pausa o reinicia el temporizador. La pantalla muestra “Tiempo terminado” al finalizar.
9. Al confirmar que preparaste la receta, se descuentan las cantidades registradas. Si falta un ingrediente, se bloquea el descuento y se indica cuál.
10. En PC e iPhone usa la misma cuenta y pulsa **Perfil > Sincronizar**. Comprueba el inventario después de que indique “Sincronizado con Supabase”.

## Unidades e ingredientes
Convierte kg/g y l/ml automáticamente; no convierte tazas, cucharadas o cucharaditas a gramos porque la equivalencia depende del ingrediente. Usa la misma unidad en inventario y receta para esos casos, o mide y registra los gramos manualmente. Los nombres coinciden ignorando mayúsculas y acentos, pero “huevo” y “huevos” son nombres distintos.
Las recetas anteriores conservan sus textos. Las tres recetas de ejemplo tienen cantidades iniciales para los ingredientes cuantificados; sal y otros ingredientes “al gusto” no se descuentan. El botón de preparación confirma explícitamente cuáles se descontarán. Las cantidades corresponden a una preparación con las porciones de la receta.

## Sincronización, respaldos y temporizadores
Los cambios se guardan localmente y se envían a Supabase al tener conexión. También sincroniza al volver a la app o desde Perfil; no es actualización en tiempo real. Si dos dispositivos cambian datos a la vez, se evita sobrescribir silenciosamente: Perfil permite descargar un respaldo local y cargar la versión de la nube. Usa un dispositivo a la vez y sincroniza antes de cambiar al otro. El respaldo completo puede conservarse como JSON; el importador original importa recetas solamente.

Los temporizadores pertenecen al dispositivo y a la sesión de pestaña. Se conservan al recargar esa pestaña; al cerrarla completamente pueden perderse. Al volver del segundo plano se recalcula el tiempo con la hora real. iOS puede suspender JavaScript y sonido cuando bloqueas la pantalla: esta versión no garantiza alarmas ni notificaciones en segundo plano. El sonido breve depende de los permisos del navegador; el aviso visual es el principal.

Las compras son exclusivamente demostraciones: catálogo y precios de ejemplo, sin cobros, tarjetas reales ni entregas. El catálogo reside en el código y cada usuario mantiene su propio carrito e inventario. Integrar pagos reales requiere un proveedor, validación de pedidos en servidor y gestión de entrega; no basta con activar un botón.
