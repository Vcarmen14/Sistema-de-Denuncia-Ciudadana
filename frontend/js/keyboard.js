document.addEventListener('keydown', function(e) {
    const key = (e && typeof e.key === "string" ? e.key : "").toLowerCase();
    // usar 'key' en el resto de la función
    console.log(key);
    // Additional logic can be added here
});
