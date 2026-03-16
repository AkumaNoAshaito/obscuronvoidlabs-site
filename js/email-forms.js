/**
 * Reusable email form handler for OBSCURON VOID LABS.
 * POSTs to /api/send-email with validation and global success/error toast.
 */
(function () {
  var API = "/api/send-email";
  var SUCCESS_MSG = "Your message has been sent. We will get back to you shortly.";
  var ERROR_MSG = "Something went wrong. Please try again.";
  var INVALID_EMAIL_MSG = "Please enter a valid email address.";

  function ensureToast() {
    var id = "email-form-toast";
    var el = document.getElementById(id);
    if (el) return el;
    el = document.createElement("div");
    el.id = id;
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.className = "fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full mx-4 px-4 py-3 rounded-xl text-sm font-medium shadow-lg transition-opacity duration-300 opacity-0 pointer-events-none";
    el.style.background = "rgba(15, 15, 24, 0.95)";
    el.style.border = "1px solid rgba(255, 255, 255, 0.1)";
    el.style.backdropFilter = "blur(12px)";
    document.body.appendChild(el);
    return el;
  }

  function showToast(message, isError) {
    var toast = ensureToast();
    toast.textContent = message;
    toast.style.color = isError ? "#f87171" : "#34d399";
    toast.classList.remove("opacity-0", "pointer-events-none");
    setTimeout(function () {
      toast.classList.add("opacity-0", "pointer-events-none");
    }, 5000);
  }

  function validateEmail(email) {
    return typeof email === "string" && email.trim().length > 0 && email.includes("@");
  }

  function getFormPayload(form) {
    var fd = new FormData(form);
    var data = {};
    fd.forEach(function (value, key) {
      if (key === "type") data.type = value;
      else data[key] = value;
    });
    return data;
  }

  function attachForm(form) {
    if (form.dataset.emailFormAttached) return;
    form.dataset.emailFormAttached = "true";

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      var data = getFormPayload(form);
      if (!data.type) data.type = "contact";

      var email = (data.email || "").trim();
      if (!validateEmail(email)) {
        showToast(INVALID_EMAIL_MSG, true);
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      try {
        var res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          showToast(SUCCESS_MSG, false);
          form.reset();
        } else {
          showToast(ERROR_MSG, true);
        }
      } catch (err) {
        showToast(ERROR_MSG, true);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  function init() {
    document.querySelectorAll("form[data-send-email]").forEach(attachForm);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
