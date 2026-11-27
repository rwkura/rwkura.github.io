(function () {
  var placeholders = document.querySelectorAll(".strava-embed-placeholder");
  if (!placeholders.length) return;

  var scriptAdded = false;

  function loadStravaScript() {
    if (typeof window.__STRAVA_EMBED_BOOTSTRAP__ === "function") {
      window.__STRAVA_EMBED_BOOTSTRAP__();
      return;
    }
    if (scriptAdded) return;
    scriptAdded = true;
    var s = document.createElement("script");
    s.src = "https://strava-embeds.com/embed.js";
    s.defer = true;
    s.onload = function () {
      if (typeof window.__STRAVA_EMBED_BOOTSTRAP__ === "function") {
        window.__STRAVA_EMBED_BOOTSTRAP__();
      }
    };
    document.body.appendChild(s);
  }

  function hydrate(el) {
    if (el.dataset.stravaHydrated) return;
    el.dataset.stravaHydrated = "1";
    el.textContent = "";
    el.classList.remove("strava-embed-lazy");
    el.classList.add("strava-embed-placeholder");
    loadStravaScript();
  }

  if (!("IntersectionObserver" in window)) {
    loadStravaScript();
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          hydrate(entry.target);
        }
      });
    },
    { rootMargin: "250px 0px" }
  );

  placeholders.forEach(function (el) {
    el.classList.remove("strava-embed-placeholder");
    el.classList.add("strava-embed-lazy");
    el.textContent = "Loading Strava route map…";
    el.addEventListener("click", function () {
      observer.unobserve(el);
      hydrate(el);
    }, { once: true });
    observer.observe(el);
  });
})();
