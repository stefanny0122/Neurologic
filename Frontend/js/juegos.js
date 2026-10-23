
document.addEventListener("DOMContentLoaded", () => {
    // Identificar la página actual y marcar su opción en el menú.
    const enlaces = document.querySelectorAll(".nav-link");

    enlaces.forEach((enlace) => {
        const destino = enlace.getAttribute("href");

        if (destino && destino.endsWith("juegos.html")) {
            enlace.classList.add("active");
            enlace.setAttribute("aria-current", "page");
        } else {
            enlace.classList.remove("active");
            enlace.removeAttribute("aria-current");
        }
    });

    // Efecto visual y navegación de las tarjetas de los minijuegos.
    const tarjetas = document.querySelectorAll(".all-games .game-card");

    tarjetas.forEach((tarjeta) => {
        const boton = tarjeta.querySelector(".game-button");

        if (!boton) return;

        tarjeta.setAttribute("tabindex", "0");
        tarjeta.setAttribute("aria-label", tarjeta.querySelector("h3")?.textContent || "Minijuego");

        // Permitir abrir el minijuego haciendo clic en la tarjeta.
        tarjeta.addEventListener("click", (evento) => {
            if (evento.target.closest("a")) return;

            window.location.href = boton.getAttribute("href");
        });

        // Permitir abrirlo con Enter o barra espaciadora.
        tarjeta.addEventListener("keydown", (evento) => {
            if (
                evento.target === tarjeta &&
                (evento.key === "Enter" || evento.key === " ")
            ) {
                evento.preventDefault();
                window.location.href = boton.getAttribute("href");
            }
        });
    });

    console.log("NEUROLOGIC: página Mis juegos cargada correctamente.");
});
