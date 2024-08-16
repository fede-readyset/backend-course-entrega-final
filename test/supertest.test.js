import { expect } from 'chai';
import supertest from 'supertest';

const requester = supertest("http://localhost:8080");

describe("Testing de la app CoderMart", () => {
    // TESTING DE LA ENTIDAD PRODUCTOS
    let pid
    describe("Testing de la entidad PRODUCTS", () => {
        let newPid;

        it("Prod Test 1: El endpoing GET /api/products debe retornar el listado completo de productos", async () => {
            const { statusCode, ok, body } = await requester.get("/api/products");
            expect(statusCode).to.equal(200);
            expect(body).to.have.property("success").that.equals(true);
            expect(body.payload).to.have.property("docs").that.is.an("array");
            pid = body.payload.docs[0]._id; // Guardo el pid del primer producto encontrado para futuros tests
        });

        it("Prod Test 2: El endpoing GET /api/products/:pid debe retornar el productos especificado", async () => {
            const { statusCode, ok, body } = await requester.get("/api/products/" + pid);
            expect(statusCode).to.equal(200);
            expect(body).to.have.property("success").that.equals(true);
            expect(body).to.have.property("payload").that.is.an("object");
            expect(body.payload).to.have.property("_id").that.equals(pid);
        });

        it("Prod Test 3: El endpoing GET /api/products/:pid con id inexistente debe devolver un error", async () => {
            let nonExistantPid = "d061da43585a9e06008c553e"
            const { statusCode, ok, body } = await requester.get(`/api/products/${nonExistantPid}`);
            expect(statusCode).to.equal(404);
            expect(body).to.have.property("success").that.equals(false);
            expect(body).to.have.property("message").that.equals("Producto no encontrado");
        })

        it("Prod Test 4: El endpoing POST /api/products debe permitir agregar un producto a la DB.", async () => {
            let mockProduct = {
                name: "Test Product",
                description: "Test Product",
                price: 1.99,
                stock: 1,
                code: 1919191919191
            };
            const { statusCode, body } = await requester.post("/api/products/").send(mockProduct);
            //console.log(body);
            expect(statusCode).to.equal(200);
            expect(body).to.have.property("success").that.equals(true);
            expect(body).to.have.property("id");
            // Guardo el id para usar en otros tests
            newPid = body.id;
        })

        it("Prod Test 5: El endpoint POST /api/products debe devolver un error si faltan campos requeridos", async () => {
            let incompleteProduct = {
                name: "Producto Incompleto",
                description: "Producto sin campo código",
                price: 2.99,
                stock: 3
            };
            const { statusCode, body } = await requester
                .post("/api/products/")
                .send(incompleteProduct);
            expect(statusCode).to.equal(400);
            expect(body).to.have.property("success").that.equals(false);
            expect(body).to.have.property("message").that.includes("Error de validación: ");
        });


        // Test para actualizar un producto
        it("Prod Test 6: El endpoint PUT /api/products/:pid debe permitir actualizar un producto existente", async () => {
            let updatedProduct = {
                name: "Updated Product",
                description: "Updated Product Description",
                price: 2.99,
                stock: 5,
            };
            const { statusCode, body } = await requester.put(`/api/products/${newPid}`).send(updatedProduct);
            expect(statusCode).to.equal(200);
            expect(body).to.have.property("success").that.equals(true);
            expect(body).to.have.property("id").that.equals(newPid);
        });

        it("Prod Test 7: El endpoint DELETE /api/products/:pid debe permitir eliminar un producto existente", async () => {
            const { statusCode, body } = await requester.delete(`/api/products/${newPid}`);
            expect(statusCode).to.equal(200);
            expect(body).to.have.property("success").that.equals(true);
            expect(body).to.have.property("id").that.equals(newPid);
        });

        // Test para manejar la eliminación de un producto inexistente
        it("Prod Test 8: El endpoint DELETE /api/products/:pid con id inexistente debe devolver un error", async () => {
            let nonExistantPid = "d061da43585a9e06008c553e";
            const { statusCode, body } = await requester.delete(`/api/products/${nonExistantPid}`);
            expect(statusCode).to.equal(404);
            expect(body).to.have.property("success").that.equals(false);
            expect(body).to.have.property("message").that.equals("Producto no encontrado");
        });
    })


    // TESTING DE LA ENTIDAD CARRITOS

    describe("Testing de la entidad CARTS", () => {
        let cartId;

        // Test para obtener todos los carritos
        it("Carts Test 1: El endpoint GET /api/carts debe retornar el listado completo de carritos", async () => {
            const { statusCode, body } = await requester.get("/api/carts");
            expect(statusCode).to.equal(200);
            expect(body).to.have.property("success").that.equals(true);
            expect(body.payload).to.be.an("array");
            if (body.payload.length > 0) {
                cartId = body.payload[0]._id; // Guarda el ID del primer carrito para futuros tests
            }
        });

        // Test para obtener un carrito por ID
        it("Carts Test 2: El endpoint GET /api/carts/:cid debe retornar el carrito especificado", async () => {
            if (!cartId) {
                // Si no se obtuvo un carrito, no podemos continuar con este test
                this.skip();
            }
            const { statusCode, body } = await requester.get(`/api/carts/${cartId}`);
            expect(statusCode).to.equal(200);
            expect(body).to.have.property("success").that.equals(true);
            expect(body).to.have.property("payload").that.is.an("object");
            expect(body.payload).to.have.property("_id").that.equals(cartId);
        });

        // Test para manejar un ID de carrito inexistente
        it("Carts Test 3: El endpoint GET /api/carts/:cid con id inexistente debe devolver un error", async () => {
            let nonExistantCartId = "d061da43585a9e06008c553e";
            const { statusCode, body } = await requester.get(`/api/carts/${nonExistantCartId}`);
            expect(statusCode).to.equal(404);
            expect(body).to.have.property("success").that.equals(false);
            expect(body).to.have.property("messa|ge").that.equals("Carrito no encontrado.");
        });

        // Test para agregar un nuevo carrito
        it("Carts Test 4: El endpoint POST /api/carts debe permitir agregar un nuevo carrito", async () => {
            const { statusCode, body } = await requester.post("/api/carts");
            expect(statusCode).to.equal(200);
            expect(body).to.have.property("success").that.equals(true);
            expect(body.payload).to.have.property("_id");
            cartId = body.payload._id; // Guarda el ID del nuevo carrito para futuros tests*/
        });
/*
        // Test para agregar un producto a un carrito
        it("Carts Test 5: El endpoint POST /api/carts/:cid/product/:pid debe permitir agregar un producto al carrito", async () => {
            if (!cartId || !pid) {
                // Si no se obtuvo un carrito y un producto, este test no se puede correr
                this.skip();
            }
            const { statusCode, body } = await requester.post(`/api/carts/${cartId}/product/${pid}`);
            console.log(body);
            expect(statusCode).to.equal(200);
            expect(body).to.have.property("success").that.equals(true);
            expect(body).to.have.property("message").that.equals("Producto añadido al carrito correctamente");
        });
        
            // Test para eliminar un producto de un carrito
            it("Carts Test 6: El endpoint DELETE /api/carts/:cid/product/:pid debe permitir eliminar un producto del carrito", async () => {
              if (!cartId) {
                // Si no se obtuvo un carrito, no podemos continuar con este test
                this.skip();
              }
              let productId = "646b2e09a3d857de0d3c944d"; // Reemplaza con un ID de producto válido en tu base de datos
              const { statusCode, body } = await requester.delete(`/api/carts/${cartId}/product/${productId}`);
              expect(statusCode).to.equal(200);
              expect(body).to.have.property("success").that.equals(true);
              expect(body).to.have.property("message").that.equals("Producto eliminado del carrito correctamente");
            });
        
            // Test para vaciar un carrito
            it("Carts Test 7: El endpoint DELETE /api/carts/:cid debe permitir vaciar un carrito", async () => {
              if (!cartId) {
                // Si no se obtuvo un carrito, no podemos continuar con este test
                this.skip();
              }
              const { statusCode, body } = await requester.delete(`/api/carts/${cartId}`);
              expect(statusCode).to.equal(200);
              expect(body).to.have.property("success").that.equals(true);
              expect(body).to.have.property("message").that.equals("Carrito vaciado correctamente");
            });
        
            // Test para actualizar los productos en un carrito
            it("Carts Test 8: El endpoint PUT /api/carts/:cid debe permitir actualizar los productos en un carrito", async () => {
              if (!cartId) {
                // Si no se obtuvo un carrito, no podemos continuar con este test
                this.skip();
              }
              let newProducts = [
                { product: "646b2e09a3d857de0d3c944d", qty: 3 } // Reemplaza con un ID de producto válido y cantidad
              ];
              const { statusCode, body } = await requester.put(`/api/carts/${cartId}`).send(newProducts);
              expect(statusCode).to.equal(200);
              expect(body).to.have.property("success").that.equals(true);
              expect(body).to.have.property("message").that.equals("Carrito actualizado.");
            });
        
            // Test para confirmar la compra
            it("Carts Test 9: El endpoint GET /api/carts/:cid/purchase debe permitir confirmar la compra", async () => {
              if (!cartId) {
                // Si no se obtuvo un carrito, no podemos continuar con este test
                this.skip();
              }
              const { statusCode, body } = await requester.get(`/api/carts/${cartId}/purchase`);
              expect(statusCode).to.equal(200);
              expect(body).to.have.property("success").that.equals(true);
              expect(body).to.have.property("message").that.equals("Ticket generado correctamente.");
            });
        */
            // Test para manejar un ID de carrito inexistente al intentar vaciar
            it("Carts Test 10: El endpoint DELETE /api/carts/:cid con id inexistente debe devolver un error", async () => {
              let nonExistantCartId = "d061da43585a9e0600811111";
              const { statusCode, body } = await requester.delete(`/api/carts/${nonExistantCartId}`);
              expect(statusCode).to.equal(404);
              expect(body).to.have.property("success").that.equals(false);
              expect(body).to.have.property("message").that.contains("Carrito inexistente");
            });
            
            /*
        
            // Test para manejar un ID de producto inexistente al intentar agregarlo
            it("Carts Test 11: El endpoint POST /api/carts/:cid/product/:pid con id de producto inexistente debe devolver un error", async () => {
              if (!cartId) {
                // Si no se obtuvo un carrito, no podemos continuar con este test
                this.skip();
              }
              let nonExistantProductId = "d061da43585a9e06008c553e";
              const { statusCode, body } = await requester.post(`/api/carts/${cartId}/product/${nonExistantProductId}`);
              expect(statusCode).to.equal(404);
              expect(body).to.have.property("success").that.equals(false);
              expect(body).to.have.property("message").that.equals("Producto no encontrado.");
            }); */
    });

    describe("Testing de la entidad USERS", () => {
        let userId;
        const testUser = {
          email: "adminCoder@coder.com",
          password: "adminCod3r123",
          firstName: "Test",
          lastName: "User",
        };
    
        /* // Crear un nuevo usuario para las pruebas
        it("Users Test 1: El endpoint POST /api/users debe permitir crear un nuevo usuario", async () => {
          const { statusCode, body } = await requester.post("/api/users").send(testUser);
          expect(statusCode).to.equal(201);
          expect(body).to.have.property("success").that.equals(true);
          expect(body).to.have.property("user").that.is.an("object");
          expect(body.user).to.have.property("_id");
          userId = body.user._id; // Guarda el ID del nuevo usuario para futuros tests
        }); */
    
        // Iniciar sesión con el usuario creado
        it("Users Test 2: El endpoint POST /api/users/login debe permitir iniciar sesión con credenciales válidas", async () => {
          const { statusCode, body } = await requester.post("/api/users/login").send({
            email: testUser.email,
            password: testUser.password,
          });
          expect(statusCode).to.equal(200);
          expect(body).to.have.property("success").that.equals(true);
          expect(body).to.have.property("message").that.contains("Login exitoso");
        });
    /* 
        // Intentar iniciar sesión con un email incorrecto
        it("Users Test 3: El endpoint POST /api/sessions/login debe devolver un error con email incorrecto", async () => {
          const { statusCode, body } = await requester.post("/api/sessions/login").send({
            email: "wronguser@example.com",
            password: testUser.password,
          });
          expect(statusCode).to.equal(401);
          expect(body).to.have.property("success").that.equals(false);
          expect(body).to.have.property("message").that.equals("Email o contraseña incorrectos.");
        });
    
        // Intentar iniciar sesión con una contraseña incorrecta
        it("Users Test 4: El endpoint POST /api/sessions/login debe devolver un error con contraseña incorrecta", async () => {
          const { statusCode, body } = await requester.post("/api/sessions/login").send({
            email: testUser.email,
            password: "WrongPassword",
          });
          expect(statusCode).to.equal(401);
          expect(body).to.have.property("success").that.equals(false);
          expect(body).to.have.property("message").that.equals("Email o contraseña incorrectos.");
        });
    
        // Intentar iniciar sesión sin email
        it("Users Test 5: El endpoint POST /api/sessions/login debe devolver un error si falta el email", async () => {
          const { statusCode, body } = await requester.post("/api/sessions/login").send({
            password: testUser.password,
          });
          expect(statusCode).to.equal(400);
          expect(body).to.have.property("success").that.equals(false);
          expect(body).to.have.property("message").that.equals("El email es requerido.");
        });
    
        // Intentar iniciar sesión sin contraseña
        it("Users Test 6: El endpoint POST /api/sessions/login debe devolver un error si falta la contraseña", async () => {
          const { statusCode, body } = await requester.post("/api/sessions/login").send({
            email: testUser.email,
          });
          expect(statusCode).to.equal(400);
          expect(body).to.have.property("success").that.equals(false);
          expect(body).to.have.property("message").that.equals("La contraseña es requerida.");
        });
    
        // Limpiar usuario de prueba después de las pruebas
        after(async () => {
          if (userId) {
            await requester.delete(`/api/users/${userId}`);
          }
        }); */
      });

})