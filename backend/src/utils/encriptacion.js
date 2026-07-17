'use strict';

const crypto = require('crypto');

// La clave de cifrado debe ser de 32 bytes (256 bits).
// El IV debe ser de 16 bytes.
const ALGORITMO = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'; // 32 caracteres fallback
const IV_LENGTH = 16;

/**
 * Cifra un texto plano.
 * Retorna el resultado en formato: iv_en_hex:texto_cifrado_en_hex
 */
function cifrar(texto) {
  if (!texto) return texto;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITMO, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(texto, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (err) {
    console.error('Error al cifrar dato:', err.message);
    return texto; // Fallback al texto original en caso de error
  }
}

/**
 * Descifra un texto que fue cifrado previamente.
 * Si no está cifrado o no es un formato válido, retorna el texto original.
 */
function descifrar(textoCifrado) {
  if (!textoCifrado || typeof textoCifrado !== 'string') return textoCifrado;
  
  // El formato esperado es iv:contenido
  const partes = textoCifrado.split(':');
  if (partes.length !== 2) {
    return textoCifrado; // No parece estar cifrado
  }

  try {
    const iv = Buffer.from(partes[0], 'hex');
    const encryptedText = Buffer.from(partes[1], 'hex');
    
    if (iv.length !== IV_LENGTH) {
      return textoCifrado; // IV inválido, no es un cifrado nuestro
    }

    const decipher = crypto.createDecipheriv(ALGORITMO, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    // Si falla el descifrado (por ejemplo clave incorrecta o formato erróneo),
    // retornamos el valor original para evitar romper el flujo
    return textoCifrado;
  }
}

module.exports = {
  cifrar,
  descifrar
};
