/* Generamos una instancia de socket.io desde el lado del cliente */
const socket = io();
socket.emit("Request", "refresh", owner);

// Recibimos el array de productos del server
socket.on("Productos", (data) => {
    const listaProductos = document.getElementById("lista-productos");

    // Construir la tabla de productos
    let tablaProductos = `
        <table border="1">
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Título</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Código</th>
                    <th>Stock</th>
                    <th>Categoría</th>
                    <th>Vendedor</th>
                </tr>
            </thead>
            <tbody>`;

    data.forEach(producto => {
        tablaProductos += `
            <tr>
                <td><img class="mini__thumbnail" src="${producto.thumbnail?producto.thumbnail:'/img/generic_product.png'}"></td>
                
                <td>${producto.title}</td>
                <td>${producto.description}</td>
                <td>$${producto.price}</td>
                <td>${producto.status ? 'Disponible' : 'No disponible'}</td>
                <td>${producto.code}</td>
                <td>${producto.stock}</td>
                <td>${producto.category}</td>
                <td>${producto.owner}</td>

            </tr>`;
    });

    tablaProductos += `</tbody></table>`;

    // Insertar la tabla en el contenedor deseado
    listaProductos.innerHTML = tablaProductos;

})

// El servidor me informa que hay data nueva, pedimos refresh
socket.on("UpdateNeeded", (data) => socket.emit("Request", "refresh",owner));