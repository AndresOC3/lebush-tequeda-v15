// ===== LEBUSH — ¡TeQueda! VFinal15 =====
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ===== Conexión a MongoDB Atlas =====
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://admin:Lebush2025@cluster0.ndrrpj5.mongodb.net/lebush_tequeda?retryWrites=true&w=majority";

if (!MONGODB_URI) {
  console.warn("⚠️  MONGODB_URI no está definido. Configúralo en .env o en Render.");
} else {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("✅ Conectado a MongoDB Atlas"))
    .catch((e) => console.error("❌ Error de conexión con MongoDB:", e));
}

// ===== Modelo de Usuario =====
const userSchema = new mongoose.Schema({
  nombre: String,
  correo: { type: String, unique: true },
  password: String,
  rol: { type: String, default: "admin" },
});

const Usuario = mongoose.models.Usuario || mongoose.model("Usuario", userSchema);

// ===== Crear admin por defecto si no existe =====
(async () => {
  try {
    const existeAdmin = await Usuario.findOne({ correo: "mario@lebush.com" });
    if (!existeAdmin) {
      const hash = await bcrypt.hash("Lebush2025", 10);
      await Usuario.create({
        nombre: "Mario Roberto Tuchez",
        correo: "mario@lebush.com",
        password: hash,
        rol: "admin",
      });
      console.log("✅ Usuario admin creado: mario@lebush.com / Lebush2025");
    } else {
      console.log("🔹 Usuario admin ya existe");
    }
  } catch (err) {
    console.error("❌ Error al crear usuario admin:", err);
  }
})();

// ===== Login =====
app.post("/api/login", async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password)
      return res.status(400).json({ mensaje: "Datos incompletos" });

    const usuario = await Usuario.findOne({ correo });
    if (!usuario)
      return res.status(400).json({ mensaje: "Usuario no encontrado" });

    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok)
      return res.status(400).json({ mensaje: "Contraseña incorrecta" });

    res.json({
      mensaje: "Login exitoso",
      token: "dummy-" + Date.now(),
      usuario: {
        nombre: usuario.nombre,
        rol: usuario.rol,
        correo: usuario.correo,
      },
    });
  } catch (e) {
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// ===== Servir el Frontend (dist) =====
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "dist", "index.html"))
);

// ===== Arranque del servidor =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log("🚀 LEBUSH — ¡TeQueda! VFinal15 corriendo en puerto", PORT)
);
