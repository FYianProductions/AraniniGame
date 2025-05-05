document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del DOM ---
    const coverSection = document.getElementById('cover-section');
    const playButton = document.getElementById('play-button');
    const challengeSection = document.getElementById('challenge-section'); // Renombrado
    const player = document.getElementById('player');
    const scoreDisplay = document.getElementById('score-display');
    const modal = document.getElementById('modal');
    const retryButton = document.getElementById('retry-button');
    const finalScoreDisplay = document.getElementById('final-score');

    // --- Estado del Juego ---
    let gameActive = false;
    let score = 0;
    let playerPosX = 0; // Posición X actual del jugador
    let playerPosY = 0; // Posición Y actual del jugador
    let isDragging = false;
    let dragStartX = 0; // Posición inicial del toque/mouse al arrastrar
    let dragStartY = 0;
    let playerStartDragX = 0; // Posición inicial del jugador al arrastrar
    let playerStartDragY = 0;
    let emojis = []; // Array para almacenar objetos { element, x, y, dx, dy, size }
    let emojiSpeedMultiplier = 1.0;
    let intervals = { // Almacena IDs de intervalos para limpiarlos
        score: null,
        spawn: null,
        speed: null
    };
    let animationFrameId = null; // ID para el bucle del juego con requestAnimationFrame
    let gameJustStarted = false; // Flag para evitar inicio múltiple por scroll+click

    // --- 1. Lógica de Inicio (Portada -> Reto) ---

    // Función para iniciar el juego (llamada por botón o scroll)
    function startGameTransition() {
        // Evita iniciar si ya está activo o si acabamos de empezar (doble trigger)
        if (gameActive || gameJustStarted) return;
        console.log("Iniciando transición al juego...");
        gameJustStarted = true; // Prevenir inicio múltiple inmediato

        // Ocultar portada, mostrar sección del reto
        coverSection.classList.add('hidden');
        challengeSection.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Ocultar scroll del body

        initializeGame(); // Configura e inicia la lógica del juego

        // Pequeño delay para resetear el flag y permitir reinicios futuros
        setTimeout(() => { gameJustStarted = false; }, 100);
    }

    // Event listener para el botón "Jugar"
    playButton.addEventListener('click', startGameTransition);

    // Event listener para iniciar con scroll (Opcional)
    let scrollTriggered = false;
    function checkScrollToStart() {
        if (!gameActive && !scrollTriggered && window.scrollY > 100) {
            scrollTriggered = true; // Evitar que se dispare múltiples veces
            startGameTransition();
            window.removeEventListener('scroll', checkScrollToStart); // Remover listener una vez iniciado
        }
    }
    window.addEventListener('scroll', checkScrollToStart);


    // --- 2. Lógica de Inicialización y Reinicio del Juego ---

    function initializeGame() {
        console.log("Inicializando juego...");
        gameActive = true;
        score = 0;
        emojiSpeedMultiplier = 1.0;
        emojis.forEach(emojiObj => emojiObj.element.remove()); // Limpiar emojis anteriores del DOM
        emojis = []; // Limpiar array de emojis

        resetPlayerPosition(); // Colocar al jugador en el centro
        updateScoreDisplay(); // Mostrar puntaje inicial (0)

        // Limpiar intervalos anteriores (importante para reinicios)
        clearAllIntervals();

        // Empezar nuevos intervalos
        intervals.score = setInterval(updateScore, 1000); // Actualizar puntaje cada segundo
        intervals.spawn = setInterval(spawnEmoji, 5000); // Generar emoji cada 5 segundos
        intervals.speed = setInterval(increaseSpeed, 20000); // Aumentar velocidad cada 20 segundos

        // Cancelar frame anterior si existe (importante para reinicios)
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        // Iniciar el bucle principal del juego
        animationFrameId = requestAnimationFrame(gameLoop);

        console.log("Juego iniciado/reiniciado.");
    }

    function resetPlayerPosition() {
        // Centrar al jugador en la sección del reto
        playerPosX = challengeSection.offsetWidth / 2 - player.offsetWidth / 2;
        playerPosY = challengeSection.offsetHeight / 2 - player.offsetHeight / 2;
        player.style.left = `${playerPosX}px`;
        player.style.top = `${playerPosY}px`;
    }

    // Función llamada por el botón "Reiniciar" del modal
    function restartGame() {
        console.log("Reiniciando juego desde modal...");
        modal.classList.add('hidden'); // Ocultar el modal
        initializeGame(); // Reutilizar la lógica de inicialización
    }

    // Event listener para el botón "Reiniciar"
    retryButton.addEventListener('click', restartGame);

    // --- 3. Lógica del Jugador (Arrastrar en toda la pantalla) ---
    // (Esta sección permanece igual que en la versión anterior)

    function startDrag(event) {
        if (!gameActive) return;
        isDragging = true;
        player.style.cursor = 'grabbing';

        const touch = event.type === 'touchstart' ? event.touches[0] : event;
        dragStartX = touch.clientX;
        dragStartY = touch.clientY;
        playerStartDragX = player.offsetLeft;
        playerStartDragY = player.offsetTop;

        event.preventDefault();
    }

    function drag(event) {
        if (!isDragging || !gameActive) return;

        const touch = event.type === 'touchmove' ? event.touches[0] : event;
        const deltaX = touch.clientX - dragStartX;
        const deltaY = touch.clientY - dragStartY;
        let newX = playerStartDragX + deltaX;
        let newY = playerStartDragY + deltaY;

        const maxX = challengeSection.offsetWidth - player.offsetWidth;
        const maxY = challengeSection.offsetHeight - player.offsetHeight;

        playerPosX = Math.max(0, Math.min(newX, maxX));
        playerPosY = Math.max(0, Math.min(newY, maxY));

        player.style.left = `${playerPosX}px`;
        player.style.top = `${playerPosY}px`;

        event.preventDefault();
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        player.style.cursor = 'grab';
    }

    challengeSection.addEventListener('mousedown', startDrag);
    challengeSection.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    challengeSection.addEventListener('touchstart', startDrag, { passive: false });
    challengeSection.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);


    // --- 4. Lógica de Emojis (Generación, Movimiento, Velocidad) ---
    // (Movimiento y Rebote restaurados a la versión 1)

    function spawnEmoji() {
        if (!gameActive) return;

        const emojiElement = document.createElement('div');
        emojiElement.classList.add('fire-emoji');
        emojiElement.textContent = '🔥';

        // Estimar tamaño basado en CSS (igual que antes)
        const tempSizeStyle = window.getComputedStyle(emojiElement).fontSize;
        const emojiSize = parseFloat(tempSizeStyle) * 1.2 || 32;

        let startX, startY, angle;
        const edge = Math.floor(Math.random() * 4);

        const gameWidth = challengeSection.offsetWidth;
        const gameHeight = challengeSection.offsetHeight;

        // Posición inicial aleatoria en uno de los bordes (igual que antes)
        switch (edge) {
             case 0: // Top
                startX = Math.random() * (gameWidth - emojiSize);
                startY = -emojiSize; // Ligeramente fuera para que entre
                angle = Math.random() * Math.PI; // Ángulo hacia abajo (0 a PI)
                break;
            case 1: // Right
                startX = gameWidth; // Ligeramente fuera
                startY = Math.random() * (gameHeight - emojiSize);
                angle = Math.random() * Math.PI + Math.PI / 2; // Ángulo hacia la izquierda (PI/2 a 3PI/2)
                break;
            case 2: // Bottom
                startX = Math.random() * (gameWidth - emojiSize);
                startY = gameHeight; // Ligeramente fuera
                angle = Math.random() * Math.PI + Math.PI; // Ángulo hacia arriba (PI a 2PI)
                break;
            case 3: // Left
                startX = -emojiSize; // Ligeramente fuera
                startY = Math.random() * (gameHeight - emojiSize);
                angle = Math.random() * Math.PI - Math.PI / 2; // Ángulo hacia la derecha (-PI/2 a PI/2)
                break;
        }

        const baseSpeed = 2.5; // Mantenemos la velocidad base ajustada
        let speed = baseSpeed * emojiSpeedMultiplier;
        let dx = Math.cos(angle) * speed;
        let dy = Math.sin(angle) * speed;

        // Asegurar que el emoji se mueva hacia adentro inicialmente (igual que antes)
        if (edge === 0 && dy < 0) dy = Math.abs(dy);
        if (edge === 1 && dx > 0) dx = -Math.abs(dx);
        if (edge === 2 && dy > 0) dy = -Math.abs(dy);
        if (edge === 3 && dx < 0) dx = Math.abs(dx);

        // **CAMBIO:** Posicionar usando left/top directamente
        emojiElement.style.left = `${startX}px`;
        emojiElement.style.top = `${startY}px`;

        challengeSection.appendChild(emojiElement);
        emojis.push({ element: emojiElement, x: startX, y: startY, dx, dy, size: emojiSize });
    }

    // **CAMBIO:** Lógica de movimiento y rebote restaurada a la versión 1
    function moveAndBounceEmojis() {
        const gameWidth = challengeSection.offsetWidth;
        const gameHeight = challengeSection.offsetHeight;

        emojis.forEach((emojiObj) => {
            // Actualizar posición en las variables JS
            emojiObj.x += emojiObj.dx;
            emojiObj.y += emojiObj.dy;

            // Límites para la colisión con los bordes
            const maxX = gameWidth - emojiObj.size;
            const maxY = gameHeight - emojiObj.size;

            // Colisión con bordes y rebote (lógica de la versión 1)
            if (emojiObj.x <= 0 || emojiObj.x >= maxX) {
                emojiObj.dx *= -1; // Invertir dirección horizontal
                // Corregir/clampear posición para evitar que se quede atascado fuera
                emojiObj.x = Math.max(0, Math.min(emojiObj.x, maxX));
            }
            if (emojiObj.y <= 0 || emojiObj.y >= maxY) {
                emojiObj.dy *= -1; // Invertir dirección vertical
                // Corregir/clampear posición
                emojiObj.y = Math.max(0, Math.min(emojiObj.y, maxY));
            }

            // Actualizar posición en el DOM usando left/top
            emojiObj.element.style.left = `${emojiObj.x}px`;
            emojiObj.element.style.top = `${emojiObj.y}px`;
        });
    }

    function increaseSpeed() {
        // (Esta función permanece igual que en la versión anterior)
        if (!gameActive) return;
        emojiSpeedMultiplier *= 1.12; // Aumento ligeramente mayor (12%)
        console.log(`Speed increased. Multiplier: ${emojiSpeedMultiplier.toFixed(2)}`);

        const baseSpeed = 2.5;
        const targetBaseSpeed = baseSpeed * emojiSpeedMultiplier;

        emojis.forEach(emojiObj => {
             const currentSpeed = Math.sqrt(emojiObj.dx**2 + emojiObj.dy**2);
             if (currentSpeed > 0) {
                 const scaleFactor = targetBaseSpeed / currentSpeed;
                 emojiObj.dx *= scaleFactor;
                 emojiObj.dy *= scaleFactor;
             }
        });
    }

    // --- 5. Lógica de Puntaje y Colisiones ---
    // (Esta sección permanece igual que en la versión anterior)

    function updateScore() {
        if (!gameActive) return;
        score++;
        updateScoreDisplay();
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = `Puntaje: ${score}`;
    }

    function checkCollisions() {
        if (!gameActive) return;
        const playerRect = player.getBoundingClientRect();

        for (let i = 0; i < emojis.length; i++) {
            const emojiObj = emojis[i];
            // Obtener el rectángulo del emoji (getBoundingClientRect funciona bien aquí también)
            const emojiRect = emojiObj.element.getBoundingClientRect();

            if (
                playerRect.left < emojiRect.right &&
                playerRect.right > emojiRect.left &&
                playerRect.top < emojiRect.bottom &&
                playerRect.bottom > emojiRect.top
            ) {
                gameOver();
                return;
            }
        }
    }

    // --- 6. Bucle Principal del Juego y Game Over ---
    // (Esta sección permanece igual que en la versión anterior)

    function gameLoop() {
        if (!gameActive) {
             if (animationFrameId) cancelAnimationFrame(animationFrameId);
             return;
        }

        moveAndBounceEmojis(); // Mover y rebotar emojis (con la lógica restaurada)
        checkCollisions();    // Verificar colisiones

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function gameOver() {
        console.log("¡Game Over!");
        gameActive = false;
        isDragging = false;

        clearAllIntervals();
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        finalScoreDisplay.textContent = `Puntaje: ${score}`;
        modal.classList.remove('hidden');
    }

    function clearAllIntervals() {
        clearInterval(intervals.score);
        clearInterval(intervals.spawn);
        clearInterval(intervals.speed);
        intervals.score = null;
        intervals.spawn = null;
        intervals.speed = null;
    }

}); // Fin del DOMContentLoaded
