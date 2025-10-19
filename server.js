import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

// ====== Mongo ======
const MONGODB_URI = process.env.MONGODB_URI || ''
if (!MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI no está definido. Configúralo en .env o en Render.')
} else {
  mongoose.connect(MONGODB_URI).then(()=>console.log('✅ Conectado a MongoDB Atlas')).catch(e=>console.error('❌ Mongo error:', e))
}

// ====== Modelos ======
const userSchema = new mongoose.Schema({
  nombre: String,
  correo: { type: String, unique: true },
  password: String,
  rol: { type: String, default: 'admin' }
})
const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', userSchema)

// ====== Seed admin ======
app.get('/api/_seed_admin', async (req, res) => {
  try {
    const name = process.env.ADMIN_NAME || 'Administrador'
    const correo = process.env.ADMIN_EMAIL || 'admin@lebush.local'
    const plain = process.env.ADMIN_PASSWORD || 'admin123'
    let u = await Usuario.findOne({ correo })
    if (!u) {
      const hash = await bcrypt.hash(plain, 10)
      u = await Usuario.create({ nombre: name, correo, password: hash, rol: 'admin' })
    }
    res.json({ ok: true, correo: u.correo })
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) })
  }
})

// ====== Login ======
app.post('/api/login', async (req, res) => {
  try {
    const { correo, password } = req.body
    if (!correo || !password) return res.status(400).json({ mensaje: 'Datos incompletos' })
    const usuario = await Usuario.findOne({ correo })
    if (!usuario) return res.status(400).json({ mensaje: 'Usuario no encontrado' })
    const ok = await bcrypt.compare(password, usuario.password)
    if (!ok) return res.status(400).json({ mensaje: 'Contraseña incorrecta' })
    res.json({ mensaje: 'Login exitoso', token: 'dummy-'+Date.now(), usuario: { nombre: usuario.nombre, rol: usuario.rol, correo: usuario.correo } })
  } catch (e) {
    res.status(500).json({ mensaje: 'Error interno del servidor' })
  }
})

// ====== Frontend (dist) ======
app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log('🚀 LEBUSH — ¡TeQueda! VFinal15 en puerto', PORT))
