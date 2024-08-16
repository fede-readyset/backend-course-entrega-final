// BCRYPT
import bcrypt from "bcrypt";


// Creo el hash del password
export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));


// Valido si el hash es válido
export const isValidPassword = (password, user) => bcrypt.compareSync(password, user.password);

