document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.createElement("div");
    overlay.className = "a-lightbox";
    overlay.innerHTML = '<img class="a-lightbox__img" src="" alt="">';
    document.body.appendChild(overlay);

    const img = overlay.querySelector(".a-lightbox__img");

    const open = (src, alt) => {
        img.src = src;
        img.alt = alt;
        overlay.classList.add("a-lightbox--visible");
        document.body.style.overflow = "hidden";
    };

    const close = () => {
        overlay.classList.remove("a-lightbox--visible");
        document.body.style.overflow = "";
    };

    document.querySelectorAll(".e-hotwheel-card__image-wrapper").forEach((wrapper) => {
        wrapper.style.cursor = "zoom-in";
        wrapper.addEventListener("click", () => {
            const cardImg = wrapper.querySelector(".e-hotwheel-card__img");
            open(cardImg.src, cardImg.alt);
        });
    });

    overlay.addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
    });
});
