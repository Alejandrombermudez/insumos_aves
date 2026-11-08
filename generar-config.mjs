/* Genera la versión publicable del sitio en dist/, con config.js (dirección y key pública de la
 * base) armado desde variables de entorno. Así la key no queda escrita en este repositorio,
 * que es público. Lo corre Vercel en cada despliegue (vercel.json → buildCommand).
 *
 *   Variables (Vercel → Settings → Environment Variables):
 *     SUPABASE_URL       https://<proyecto>.supabase.co
 *     SUPABASE_ANON_KEY  la key pública «anon» (NUNCA la service_role)
 *
 *   En el PC, para probar con un servidor estático sobre esta carpeta:
 *     node generar-config.mjs --local           escribe ./config.js (está en .gitignore)
 *   Si las variables no están puestas, las toma de ../Intranet-AE/.env (NEXT_PUBLIC_SUPABASE_*).
 *
 * Si faltan las variables NO se rompe el despliegue: se publica un config.js vacío y las
 * apps siguen funcionando como antes, solo en el celular, sin enviar nada a la base.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'

const local = process.argv.includes('--local')
let url = process.env.SUPABASE_URL
let key = process.env.SUPABASE_ANON_KEY

if ((!url || !key) && local && existsSync('../Intranet-AE/.env')) {
  for (const l of readFileSync('../Intranet-AE/.env', 'utf8').split(/\r?\n/)) {
    const m = l.match(/^NEXT_PUBLIC_SUPABASE_(URL|ANON_KEY)=(.*)$/)
    if (m && m[1] === 'URL') url ||= m[2].replace(/^["']|["']$/g, '')
    if (m && m[1] === 'ANON_KEY') key ||= m[2].replace(/^["']|["']$/g, '')
  }
}

let cfg = {}
if (url && key) {
  // La service_role abre toda la base: si alguien la pega aquí por error, no se publica.
  try {
    const rol = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role
    if (rol !== 'anon') { console.error(`La key es de rol «${rol}». Aquí va la key anon (pública), nunca la service_role.`); process.exit(1) }
  } catch { /* key en otro formato: se deja pasar */ }
  cfg = { supabaseUrl: url, supabaseAnonKey: key }
} else {
  console.warn('AVISO: faltan SUPABASE_URL y SUPABASE_ANON_KEY. Se publica config.js vacío: las apps guardan solo en el celular.')
}

const config = `/* Generado por generar-config.mjs al desplegar. No editar. */\nwindow.AE_CONFIG = ${JSON.stringify(cfg)};\n`

if (local) {
  writeFileSync('config.js', config)
  console.log(cfg.supabaseUrl ? 'config.js escrito (local).' : 'config.js vacío escrito (local).')
} else {
  const ARCHIVOS = ['index.html', 'sw.js', 'sw-comun.js', 'actualizar.js', 'manifest.json']
  const CARPETAS = ['icons', 'aves', 'semilleros', 'piedemonte']
  rmSync('dist', { recursive: true, force: true })
  mkdirSync('dist')
  for (const a of ARCHIVOS) cpSync(a, `dist/${a}`)
  for (const c of CARPETAS) cpSync(c, `dist/${c}`, { recursive: true })
  writeFileSync('dist/config.js', config)
  console.log('dist/ listo:', ARCHIVOS.length, 'archivos,', CARPETAS.length, 'carpetas y config.js.')
}
