const SUPABASE_URL = "https://bcyevroitnkqhougwlym.supabase.co";
const SUPABASE_KEY = "sb_publishable_hU3oFgb1Dla0ePgVE2SH6g_e2ANy4w-";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let usuario = null;

// REGISTRAR CUENTA
async function registrar() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Ingresá un correo electrónico y una contraseña.");
        return;
    }

    if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    const { data, error } = await db.auth.signUp({
        email,
        password
    });

    if (error) {
        alert(error.message);
        return;
    }

    if (data.session) {
        usuario = data.user;
        mostrarAplicacion();
    } else {
        alert("¡Cuenta creada! Revisá tu correo para confirmar el registro antes de iniciar sesión.");
    }
}

// INICIAR SESIÓN
async function iniciarSesion() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Ingresá tu correo electrónico y contraseña.");
        return;
    }

    const { data, error } = await db.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert(error.message);
        return;
    }

    usuario = data.user;
    mostrarAplicacion();
}

// CERRAR SESIÓN
async function cerrarSesion() {
    await db.auth.signOut();
    usuario = null;
    document.getElementById("contenedorTareas").innerHTML = "";

    document.getElementById("acceso").classList.remove("oculto");
    document.getElementById("contenido").classList.add("oculto");
}

// MOSTRAR APLICACIÓN
function mostrarAplicacion() {
    document.getElementById("acceso").classList.add("oculto");
    document.getElementById("contenido").classList.remove("oculto");

    cargarTareas();
}

// AGREGAR TAREA
async function agregarTarea() {
    if (!usuario) {
        alert("Tenés que iniciar sesión primero.");
        return;
    }

    const titulo = document.getElementById("titulo").value.trim();
    const materia = document.getElementById("materia").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const fecha = document.getElementById("fecha").value;

    if (!titulo || !materia || !descripcion || !fecha) {
        alert("Completá todos los campos.");
        return;
    }

    const { error } = await db.from("tareas").insert({
        titulo,
        materia,
        descripcion,
        fecha_entrega: fecha,
        entado: "pendiente",
        user_id: usuario.id
    });

    if (error) {
        alert(error.message);
        return;
    }

    document.getElementById("titulo").value = "";
    document.getElementById("materia").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("fecha").value = "";

    cargarTareas();
}

// CARGAR TAREAS
async function cargarTareas() {
    const contenedor = document.getElementById("contenedorTareas");
    contenedor.innerHTML = "Cargando tareas...";

    const { data, error } = await db
        .from("tareas")
        .select("*")
        .order("fecha_entrega", { ascending: true });

    if (error) {
        contenedor.textContent = "Error: " + error.message;
        return;
    }

    contenedor.innerHTML = "";

    if (data.length === 0) {
        contenedor.textContent = "Todavía no tenés tareas 🌸";
        return;
    }

    data.forEach(tarea => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "card";

        const titulo = document.createElement("h3");
        titulo.textContent = "📚 " + tarea.titulo;

        const materia = document.createElement("p");
        materia.textContent = "Materia: " + tarea.materia;

        const descripcion = document.createElement("p");
        descripcion.textContent = tarea.descripcion;

        const fecha = document.createElement("p");
        fecha.textContent = "Entrega: " + tarea.fecha_entrega;

        const estado = document.createElement("p");
        estado.textContent = "Estado: " + (tarea.entado || "pendiente");

        tarjeta.append(titulo, materia, descripcion, fecha, estado);

        const completar = document.createElement("button");
        completar.textContent = "Completar";
        completar.onclick = () => cambiarEstado(tarea.id, "terminada");

        const posponer = document.createElement("button");
        posponer.textContent = "Posponer";
        posponer.onclick = () => cambiarEstado(tarea.id, "pospuesta");

        const eliminar = document.createElement("button");
        eliminar.textContent = "Eliminar";
        eliminar.onclick = () => eliminarTarea(tarea.id);

        tarjeta.append(completar, posponer, eliminar);
        contenedor.appendChild(tarjeta);
    });
}

// CAMBIAR ESTADO
async function cambiarEstado(id, nuevoEstado) {
    const { error } = await db
        .from("tareas")
        .update({ entado: nuevoEstado })
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    cargarTareas();
}

// ELIMINAR TAREA
async function eliminarTarea(id) {
    if (!confirm("¿Querés eliminar esta tarea?")) return;

    const { error } = await db
        .from("tareas")
        .delete()
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    cargarTareas();
}

// RECUPERAR SESIÓN
async function comprobarSesion() {
    const { data, error } = await db.auth.getSession();

    if (!error && data.session) {
        usuario = data.session.user;
        mostrarAplicacion();
    }
}

comprobarSesion();
