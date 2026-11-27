(function () {
  var nav = document.querySelector("nav.greedy-nav");
  if (!nav) return;

  var btn = nav.querySelector(".greedy-nav__toggle");
  var vlinks = nav.querySelector(".visible-links");
  var hlinks = nav.querySelector(".hidden-links");
  var logo = nav.querySelector(".site-logo");
  var logoImg = nav.querySelector(".site-logo img");
  var title = nav.querySelector(".site-title");
  var search = nav.querySelector("button.search__toggle");
  if (!btn || !vlinks || !hlinks) return;

  var numOfItems = 0;
  var breakWidths = [];
  var closingTime = 1000;
  var timer;

  function outerWidth(el, withMargins) {
    if (!el) return 0;
    var w = el.offsetWidth;
    if (withMargins) {
      var s = getComputedStyle(el);
      w += (parseFloat(s.marginLeft) || 0) + (parseFloat(s.marginRight) || 0);
    }
    return w;
  }

  function getBreakpoint() {
    var w = window.innerWidth;
    return w < 768 ? 0 : w < 1024 ? 1 : w < 1280 ? 2 : 3;
  }

  function measureLinks() {
    numOfItems = 0;
    var totalSpace = 0;
    breakWidths = [];

    Array.prototype.forEach.call(vlinks.children, function (item) {
      totalSpace += outerWidth(item, false);
      numOfItems += 1;
      breakWidths.push(totalSpace);
    });

    Array.prototype.forEach.call(hlinks.children, function (item) {
      var clone = item.cloneNode(true);
      clone.style.visibility = "hidden";
      vlinks.appendChild(clone);
      totalSpace += outerWidth(clone, false);
      numOfItems += 1;
      breakWidths.push(totalSpace);
      vlinks.removeChild(clone);
    });
  }

  measureLinks();
  var lastBreakpoint = getBreakpoint();

  function check() {
    var curBreakpoint = getBreakpoint();
    if (curBreakpoint !== lastBreakpoint) {
      measureLinks();
      lastBreakpoint = curBreakpoint;
    }

    var guard = numOfItems + 2;
    while (guard-- > 0) {
      var visible = vlinks.children.length;
      var availableSpace =
        nav.clientWidth -
        outerWidth(logo, true) -
        outerWidth(title, true) -
        outerWidth(search, true) -
        (visible !== breakWidths.length ? outerWidth(btn, true) : 0);
      var requiredSpace = visible > 0 ? breakWidths[visible - 1] : 0;

      if (visible > 0 && requiredSpace > availableSpace) {
        hlinks.insertBefore(vlinks.lastElementChild, hlinks.firstElementChild);
      } else if (
        visible < numOfItems &&
        availableSpace +
          (visible === breakWidths.length - 1 ? outerWidth(btn, true) : 0) >
          breakWidths[visible]
      ) {
        vlinks.appendChild(hlinks.firstElementChild);
      } else {
        break;
      }
    }

    var finalVisible = vlinks.children.length;
    btn.setAttribute("count", numOfItems - finalVisible);
    btn.classList.toggle("hidden", finalVisible === numOfItems);
  }

  window.addEventListener("resize", check);

  btn.addEventListener("click", function () {
    hlinks.classList.toggle("hidden");
    btn.classList.toggle("close");
    clearTimeout(timer);
  });

  hlinks.addEventListener("click", function () {
    hlinks.classList.add("hidden");
    btn.classList.remove("close");
  });

  hlinks.addEventListener("mouseleave", function () {
    timer = setTimeout(function () {
      hlinks.classList.add("hidden");
      btn.classList.remove("close");
    }, closingTime);
  });

  hlinks.addEventListener("mouseenter", function () {
    clearTimeout(timer);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !hlinks.classList.contains("hidden")) {
      hlinks.classList.add("hidden");
      btn.classList.remove("close");
    }
  });

  if (logoImg && !(logoImg.complete && logoImg.naturalWidth !== 0)) {
    logoImg.addEventListener("load", check, { once: true });
    logoImg.addEventListener("error", check, { once: true });
  } else {
    check();
  }
})();
