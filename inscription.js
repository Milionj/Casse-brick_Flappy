document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  const fields = {
    lastname: {
      element: document.getElementById("lastname"),
      regex: /^[A-Za-zÀ-ÿ\\-\\s]{2,50}$/,
      error: "Le nom doit contenir entre 2 et 50 lettres."
    },
    firstname: {
      element: document.getElementById("firstname"),
      regex: /^[A-Za-zÀ-ÿ\\-\\s]{2,50}$/,
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
    const value = element.value.trim();
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
  const burger = document.querySelector(".burger-menu") || (() => {
    const b = document.createElement("div");
    b.className = "burger-menu";
    b.textContent = "☰";
    (document.querySelector(".nav-right") || document.querySelector(".navbar")).appendChild(b);
    return b;
  })();

  const navLinks = document.querySelector(".nav-center");
  function toggleNav(e) {
    if (e) e.preventDefault();
    if (!navLinks) return;
    navLinks.classList.toggle("active");
    const expanded = navLinks.classList.contains("active");
    burger.setAttribute("aria-expanded", expanded ? "true" : "false");
  }
  burger.addEventListener("click", toggleNav);
  if (navLinks) {
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }
});
