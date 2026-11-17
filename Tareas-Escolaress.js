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
        alert("IngresÃ¡ un correo electrÃ³nico y una contraseÃ±a.");
        return;
    }

    if (password.length < 6) {
        alert("La contraseÃ±a debe tener al menos 6 caracteres.");
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
        alert("Â¡Cuenta creada! RevisÃ¡ tu correo para confirmar el registro antes de iniciar sesiÃ³n.");
    }
}

// INICIAR SESIÃN
async function iniciarSesion() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("IngresÃ¡ tu correo electrÃ³nico y contraseÃ±a.");
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

// CERRAR SESIÃN
async function cerrarSesion() {
    await db.auth.signOut();
    usuario = null;
    document.getElementById("contenedorTareas").innerHTML = "";

    document.getElementById("acceso").classList.remove("oculto");
    document.getElementById("contenido").classList.add("oculto");
}

// MOSTRAR APLICACIÃN
function mostrarAplicacion() {
    document.getElementById("acceso").classList.add("oculto");
    document.getElementById("contenido").classList.remove("oculto");

    cargarTareas();
}

// AGREGAR TAREA
async function agregarTarea() {
    if (!usuario) {
        alert("TenÃ©s que iniciar sesiÃ³n primero.");
        return;
    }

    const titulo = document.getElementById("titulo").value.trim();
    const materia = document.getElementById("materia").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const fecha = document.getElementById("fecha").value;

    if (!titulo || !materia || !descripcion || !fecha) {
        alert("CompletÃ¡ todos los campos.");
        return;
    }

    const { error } = await db.from("tareas").insert({
        titulo,
        materia,
        descripcion,
        fecha_entrega: fecha,
        estado: "pendiente",
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
    if (!usuario) return;

    const contenedor = document.getElementById("contenedorTareas");
    contenedor.innerHTML = "Cargando tareas...";

    const { data, error } = await db
        .from("tareas")
        .select("*")
        .eq("user_id", usuario.id)
        .order("fecha_entrega", { ascending: true });

    if (error) {
        contenedor.textContent = "Error: " + error.message;
        return;
    }

    contenedor.innerHTML = "";

    if (data.length === 0) {
        contenedor.textContent = "TodavÃ­a no tenÃ©s tareas ð¸";
        return;
    }

    data.forEach(tarea => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "card";

        const titulo = document.createElement("h3");
        titulo.textContent = "ð " + tarea.titulo;

        const materia = document.createElement("p");
        materia.textContent = "Materia: " + tarea.materia;

        const descripcion = document.createElement("p");
        descripcion.textContent = tarea.descripcion;

        const fecha = document.createElement("p");
        fecha.textContent = "Entrega: " + tarea.fecha_entrega;

        const estado = document.createElement("p");
        estado.textContent = "Estado: " + (tarea.estado || "pendiente");

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
        .update({ estado: nuevoEstado })
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    cargarTareas();
}

// ELIMINAR TAREA
async function eliminarTarea(id) {
    if (!confirm("Â¿QuerÃ©s eliminar esta tarea?")) return;

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

// RECUPERAR SESIÃN
async function comprobarSesion() {
    const { data, error } = await db.auth.getSession();

    if (!error && data.session) {
        usuario = data.session.user;
        mostrarAplicacion();
    }
}

comprobarSesion();
