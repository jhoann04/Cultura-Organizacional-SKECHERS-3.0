// ====== VARIABLES ======
let jugador = {
    nombre: "",
    cm: "",
    puntaje: 0,
    preguntaActual: 0
};

const pantallaInicio = document.getElementById("inicio");
const pantallaQuiz = document.getElementById("quiz");
const pantallaFinal = document.getElementById("resultado");

const nombreInput = document.getElementById("nombre");
const cmInput = document.getElementById("cm");

const pregunta = document.getElementById("pregunta");
const respuestas = document.getElementById("respuestas");

const barra = document.getElementById("progreso");     // antes: "barra" (no existía)

const btnInicio = document.getElementById("btnComenzar"); // antes: "btnInicio" (no existía)
const btnSiguiente = document.getElementById("btnSiguiente");

// Elementos de la pantalla final (antes se buscaba "textoFinal", que no existe)
const elPorcentaje = document.getElementById("porcentaje");
const elMensaje = document.getElementById("mensaje");
const elDetalle = document.getElementById("detalle");

let preguntas = [];

// ====== INICIAR ======
btnInicio.onclick = () => {

    if(nombreInput.value.trim()=="" || cmInput.value.trim()==""){
        alert("Debes ingresar Nombre y CM");
        return;
    }

    jugador.nombre = nombreInput.value;
    jugador.cm = cmInput.value;

    preguntas = [...DATA];

    preguntas.sort(()=>Math.random()-0.5);

    pantallaInicio.style.display="none";
    pantallaQuiz.style.display="block";

    mostrarPregunta();

};

// ====== MOSTRAR PREGUNTA ======
function mostrarPregunta(){

    if(jugador.preguntaActual>=preguntas.length){
        terminar();
        return;
    }

    let p = preguntas[jugador.preguntaActual];

    barra.style.width=((jugador.preguntaActual/preguntas.length)*100)+"%";

    pregunta.innerHTML=(jugador.preguntaActual+1)+". "+p.pregunta;

    respuestas.innerHTML="";

    if(p.tipo=="texto"){

        respuestas.innerHTML=`
        <input id="respuestaTexto"
        placeholder="Escribe tu respuesta">
        `;

    }else{

        let opciones=[...p.opciones];

        opciones.sort(()=>Math.random()-0.5);

        opciones.forEach(op=>{

            respuestas.innerHTML+=`
            <button class="opcion">${op}</button>
            `;

        });

        document.querySelectorAll(".opcion").forEach(btn=>{

            btn.onclick=()=>{

                document.querySelectorAll(".opcion").forEach(b=>b.classList.remove("seleccion"));

                btn.classList.add("seleccion");

            }

        });

    }

}

// ====== SIGUIENTE ======
btnSiguiente.onclick=()=>{

    let p=preguntas[jugador.preguntaActual];

    if(p.tipo=="texto"){

        let r=document.getElementById("respuestaTexto").value.trim().toLowerCase();

        if(r==""){
            alert("Escribe una respuesta.");
            return;
        }

        if(r==p.correcta.toLowerCase()){
            jugador.puntaje++;
        }

    }

    else{

        let seleccion=document.querySelector(".seleccion");

        if(!seleccion){
            alert("Selecciona una respuesta.");
            return;
        }

        if(seleccion.innerHTML==p.correcta){
            jugador.puntaje++;
        }

    }

    jugador.preguntaActual++;

    mostrarPregunta();

}

// ====== FINAL ======
function terminar(){

    pantallaQuiz.style.display="none";

    pantallaFinal.style.display="block";

    barra.style.width="100%";

    let porcentaje=Math.round((jugador.puntaje/preguntas.length)*100);

    let mensaje="";

    if(porcentaje>=90){

        mensaje="🏆 Excelente.";

    }

    else if(porcentaje>=70){

        mensaje="👏 Muy buen trabajo.";

    }

    else if(porcentaje>=50){

        mensaje="🙂 Puedes mejorar.";

    }

    else{

        mensaje="📚 Necesitas repasar la Cultura Organizacional.";

    }

    elPorcentaje.innerHTML = porcentaje + "%";
    elMensaje.innerHTML = mensaje;
    elDetalle.innerHTML = `${jugador.nombre} (CM: ${jugador.cm}) — ${jugador.puntaje} de ${preguntas.length} respuestas correctas.`;

}
