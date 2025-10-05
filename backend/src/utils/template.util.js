/**
 * Reemplaza variables en una plantilla
 * Ejemplo: "¿Qué fecha fue {{evento}}?" con {evento: "nuestra cita"} 
 * → "¿Qué fecha fue nuestra cita?"
 */
const replaceVariables = (template, variables) => {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  
  return result;
};

/**
 * Extrae variables de una plantilla
 * Ejemplo: "¿Qué fecha fue {{evento}} en {{lugar}}?" 
 * → ["evento", "lugar"]
 */
const extractVariables = (template) => {
  const regex = /{{(\w+)}}/g;
  const variables = [];
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    variables.push(match[1]);
  }
  
  return [...new Set(variables)]; // Eliminar duplicados
};

/**
 * Valida que todas las variables estén presentes
 */
const validateVariables = (template, providedVariables) => {
  const required = extractVariables(template);
  const missing = required.filter(v => !providedVariables.hasOwnProperty(v));
  
  return {
    valid: missing.length === 0,
    missing
  };
};

module.exports = {
  replaceVariables,
  extractVariables,
  validateVariables
};