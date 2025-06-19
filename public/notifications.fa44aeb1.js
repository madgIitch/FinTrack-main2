import"./FinTrack-main.401b9eb7.js";var t=globalThis,e={},i={},n=t.parcelRequire94c2;null==n&&((n=function(t){if(t in e)return e[t].exports;if(t in i){var n=i[t];delete i[t];var o={id:t,exports:{}};return e[t]=o,n.call(o.exports,o,o.exports),o.exports}var a=Error("Cannot find module '"+t+"'");throw a.code="MODULE_NOT_FOUND",a}).register=function(t,e){i[t]=e},t.parcelRequire94c2=n),n.register;var o=n("gEjZb"),a=n("ilpIi");let r=(0,a.getFirestore)(o.app);document.addEventListener("DOMContentLoaded",()=>{let t=document.querySelector(".notifications-list");t.innerHTML="";let e=document.getElementById("back-button");e&&e.addEventListener("click",()=>{window.location.href="/pages/home.html"}),o.auth.onAuthStateChanged(async e=>{if(!e){console.warn("[NOTIFICATIONS] Usuario no autenticado");return}let i=(0,a.collection)(r,`users/${e.uid}/notifications`),n=(0,a.query)(i,(0,a.orderBy)("data.timestamp","desc")),o=await (0,a.getDocs)(n);if(o.empty){t.innerHTML='<p style="text-align:center; margin-top: 2rem; color: #777;">No tienes notificaciones por ahora.</p>';return}o.forEach(e=>{let i=e.data(),n=document.createElement("li");n.className=`notification-card ${i.type}`,n.innerHTML=`
        <span class="material-icons notification-icon">
          ${"alert"===i.type?"warning":"insert_drive_file"}
        </span>
        <div class="notification-content">
          <h2 class="notification-title">${i.title}</h2>
          <p class="notification-body">${i.body}</p>
          <time class="notification-time" style="font-size: 0.85rem; color: #888; margin-top: 6px; display: block;">
            ${i.data?.timestamp?.toDate?.().toLocaleString?.("es-ES")||""}
          </time>
        </div>
      `,t.appendChild(n)})})});
//# sourceMappingURL=notifications.fa44aeb1.js.map
