document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contact-form"); // Utilise un ID précis
    const fields = {
        lastname: {
            element: document.getElementById("lastname"),
            regex: /^[A-Za-zÀ-ÿ\-\s]{2,50}$/, 
            error: "Le nom doit contenir entre 2 et 50 lettres."
        },
        firstname: {
            element: document.getElementById("firstname"),
            regex: /^[A-Za-zÀ-ÿ\-\s]{2,50}$/, 
            error: "Le prénom doit contenir entre 2 et 50 lettres."
        },
        email: {
            element: document.getElementById("email"),
            regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/, 
            error: "Veuillez entrer un email valide."
        },
        message: {
            element: document.getElementById("message"),
            minLength: 10,
            error: "Le message doit contenir au moins 10 caractères."
        }
    };

    function validateField(field) {
        const { element, regex, minLength, error } = field;
        let value = element.value.trim();
        let errorMessage = element.nextElementSibling;

        if (!errorMessage || !errorMessage.classList.contains("error-message")) {
            errorMessage = document.createElement("div");
            errorMessage.className = "error-message";
            element.parentNode.insertBefore(errorMessage, element.nextSibling);
        }

        if ((regex && !regex.test(value)) || (minLength && value.length < minLength)) {
            element.style.border = "2px solid red";
            errorMessage.textContent = error;
            errorMessage.style.display = "block";
            return false;
        } else {
            element.style.border = "2px solid green";
            errorMessage.style.display = "none";
            return true;
        }
    }

    // Validation en temps réel
    Object.values(fields).forEach(field => {
        field.element.addEventListener("input", () => validateField(field));
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        let isValid = true;

        Object.values(fields).forEach(field => {
            if (!validateField(field)) isValid = false;
        });

        if (isValid) {
            alert("Formulaire soumis avec succès !");
            form.reset();
            Object.values(fields).forEach(field => {
                field.element.style.border = "1px solid #ccc";
            });
        }
    });

        // Menu Burger
        const burger = document.createElement("div");
        burger.className = "burger-menu";
        burger.innerHTML = "☰";
        document.querySelector(".navbar").prepend(burger);
    
        const navLinks = document.querySelector(".nav-center");
        burger.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    });


