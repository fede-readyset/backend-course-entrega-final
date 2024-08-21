// utils/handlebars-helpers.js

import Handlebars from 'handlebars';

// Definir los helpers de Handlebars
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('or', (a, b) => a || b);
Handlebars.registerHelper('and', (a, b) => a && b);
Handlebars.registerHelper('ne', (a, b) => a !== b);
Handlebars.registerHelper('lt', (a, b) => a < b);
Handlebars.registerHelper('inc', (value) => value + 1);
Handlebars.registerHelper('dec', (value) => value - 1);

// Exportar Handlebars (si es necesario)
export default Handlebars;