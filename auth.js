/* Autenticacion en linea; las recetas siguen guardadas localmente. */
(() => {
  'use strict';
  let clientPromise;
  async function client() {
    const c = window.RECETARIO_AUTH_CONFIG || {};
    if (!c.url || !c.publishableKey) throw new Error('El acceso por correo y Google todavía no está configurado.');
    if (!navigator.onLine) throw new Error('Conéctate a Internet para acceder o verificar tu correo.');
    if (!clientPromise) {
      clientPromise = import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
        .then(({createClient}) => createClient(c.url, c.publishableKey, {
          auth: {flowType:'pkce', detectSessionInUrl:true, persistSession:true, autoRefreshToken:true}
        })).catch(error => {clientPromise = null; throw error;});
    }
    return clientPromise;
  }
  function result({data,error}) {if(error) throw error; return data;}
  function redirect() {return window.RECETARIO_AUTH_CONFIG.redirectUrl || new URL('./', location.href).href;}
  const service = {
    client,
    async signup(username,email,password) {return result(await (await client()).auth.signUp({email,password,options:{data:{username},emailRedirectTo:redirect()}}));},
    async login(email,password) {return result(await (await client()).auth.signInWithPassword({email,password}));},
    async verify(email,token,type) {return result(await (await client()).auth.verifyOtp({email,token,type}));},
    async recover(email) {return result(await (await client()).auth.resetPasswordForEmail(email,{redirectTo:redirect()}));},
    async resend(email) {return result(await (await client()).auth.resend({type:'signup',email}));},
    async password(password) {return result(await (await client()).auth.updateUser({password}));},
    async google() {return result(await (await client()).auth.signInWithOAuth({provider:'google',options:{redirectTo:redirect()}}));},
    async logout() {if(clientPromise || window.RECETARIO_AUTH_CONFIG?.url) result(await (await client()).auth.signOut({scope:'local'}));},
    async callback() {return result(await (await client()).auth.getSession());}
  };
  const eye = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const google = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.6a4.8 4.8 0 0 1-2.1 3.2v2.6h3.4c2-1.9 3.1-4.5 3.1-7.7Z"/><path fill="#34A853" d="M12 22c2.8 0 5.1-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1.9-3.5.9-2.7 0-5-1.8-5.8-4.2H2.7v2.7A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.2 13.6a6 6 0 0 1 0-3.2V7.7H2.7a10 10 0 0 0 0 8.6l3.5-2.7Z"/><path fill="#EA4335" d="M12 6.2c1.5 0 2.8.5 3.9 1.5l2.9-2.9A10 10 0 0 0 2.7 7.7l3.5 2.7C7 8 9.3 6.2 12 6.2Z"/></svg>';
  function escape(value) {return String(value || '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function field(name,title,type='text',extra='') {return `<label class="field" for="auth-${name}">${title}</label><div class="auth-input"><input id="auth-${name}" name="${name}" type="${type}" required ${extra}>${type==='password'?`<button class="eye" type="button" data-eye="auth-${name}" aria-label="Mostrar contraseña" aria-pressed="false">${eye}</button>`:''}</div>`;}
  window.RecetarioLogin = {
    service,
    mount(root,onLogin,legacyLogin,hasLegacy) {
      let view='login',pendingEmail='',notice='',lastSent=0;
      const titles={login:'Bienvenido de nuevo',register:'Crea tu cuenta',recover:'Recuperar contraseña',verify:'Verifica tu correo',recoveryCode:'Introduce el código',newPassword:'Nueva contraseña'};
      const subtitles={login:'Tus mejores recetas te esperan.',register:'Guarda tus recetas en un espacio personal.',recover:'Te enviaremos un código para restablecerla.',verify:'Escribe el código que recibiste por correo.',recoveryCode:'Escribe el código de recuperación recibido.',newPassword:'Elige una contraseña de al menos 8 caracteres.'};
      function draw() {
        const email=field('email','Correo electrónico','email','autocomplete="email"');
        const password=field('password',view==='newPassword'?'Nueva contraseña':'Contraseña','password',`minlength="8" autocomplete="${view==='login'?'current-password':'new-password'}"`);
        let fields;
        if(view==='login') fields=email+password+'<button type="button" class="forgot" data-view="recover">¿Olvidaste tu contraseña?</button>';
        if(view==='register') fields=field('username','Usuario','text','minlength="3" maxlength="30" autocomplete="username" pattern="[A-Za-z0-9_]{3,30}" title="De 3 a 30 letras, números o guion bajo"')+email+password+field('confirm','Confirmar contraseña','password','minlength="8" autocomplete="new-password"');
        if(view==='recover') fields=email;
        if(view==='verify'||view==='recoveryCode') fields=`<p class="code-email">${escape(pendingEmail)}</p>`+field('token','Código de verificación','text','inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,10}" minlength="6" maxlength="10"');
        if(view==='newPassword') fields=password+field('confirm','Confirmar contraseña','password','minlength="8" autocomplete="new-password"');
        const actions={login:'Iniciar sesión',register:'Crear cuenta',recover:'Enviar código',verify:'Verificar correo',recoveryCode:'Verificar código',newPassword:'Guardar contraseña'};
        root.innerHTML=`<main class="auth professional"><div class="auth-brand"><img class="logo" src="icons/icon.svg" alt=""><h1>Mi Recetario</h1><p>Tus recetas, a tu manera</p></div><section class="panel"><h2>${titles[view]}</h2><p class="auth-subtitle">${subtitles[view]}</p><p id="auth-feedback" role="status" aria-live="polite" ${notice?'':'hidden'} class="notice">${escape(notice)}</p><form id="auth-form">${fields}<button class="primary">${actions[view]}</button></form>${['login','register'].includes(view)?`<div class="auth-divider"><span>o continúa con</span></div><button class="google" id="google">${google}<span>Google</span></button>`:''}${view==='verify'||view==='recoveryCode'?'<button type="button" class="link resend" id="resend">Reenviar código</button>':''}</section><div class="auth-switch">${view==='login'?'¿No tienes cuenta? <button class="link" data-view="register">Regístrate</button>':view==='register'?'¿Ya tienes cuenta? <button class="link" data-view="login">Inicia sesión</button>':'<button class="link" data-view="login">Volver al inicio de sesión</button>'}</div>${hasLegacy?'<button class="link legacy" id="legacy">Acceder a mi cuenta local anterior</button>':''}<p class="auth-footer">El acceso requiere conexión.<br>Tus recetas quedan disponibles en este dispositivo.</p></main>`;
        root.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;notice='';draw()});
        root.querySelectorAll('[data-eye]').forEach(b=>b.onclick=()=>{const input=document.getElementById(b.dataset.eye),show=input.type==='password';input.type=show?'text':'password';b.setAttribute('aria-label',show?'Ocultar contraseña':'Mostrar contraseña');b.setAttribute('aria-pressed',String(show));});
        root.querySelector('#legacy')?.addEventListener('click',legacyLogin);
        root.querySelector('#google')?.addEventListener('click',()=>run(()=>service.google()));
        root.querySelector('#resend')?.addEventListener('click',()=>run(async()=>{if(Date.now()-lastSent<60000)throw Error('Espera un minuto antes de solicitar otro código.');if(view==='verify')await service.resend(pendingEmail);else await service.recover(pendingEmail);lastSent=Date.now();feedback('Si la solicitud es válida, recibirás un nuevo código.','notice')}));
        root.querySelector('#auth-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);run(async()=>{
          const mail=String(f.get('email')||'').trim().toLowerCase(),pass=String(f.get('password')||'');
          if((view==='register'||view==='newPassword')&&pass!==f.get('confirm'))throw Error('Las contraseñas no coinciden.');
          if(view==='login'){const d=await service.login(mail,pass);onLogin(d.user);return}
          if(view==='register'){const d=await service.signup(String(f.get('username')).trim(),mail,pass);if(d.session)throw Error('La confirmación por correo debe estar activada en el servicio de autenticación.');pendingEmail=mail;lastSent=Date.now();view='verify';notice='Si el correo permite el registro, recibirás un código. Revisa también spam.';draw();return}
          if(view==='recover'){await service.recover(mail);pendingEmail=mail;lastSent=Date.now();view='recoveryCode';notice='Si existe una cuenta con ese correo, recibirás un código.';draw();return}
          if(view==='verify'){const d=await service.verify(pendingEmail,String(f.get('token')),'email');onLogin(d.user);return}
          if(view==='recoveryCode'){await service.verify(pendingEmail,String(f.get('token')),'recovery');view='newPassword';notice='Código verificado. Ahora puedes cambiar tu contraseña.';draw();return}
          if(view==='newPassword'){await service.password(pass);await service.logout();view='login';notice='Contraseña actualizada. Inicia sesión con tu nueva contraseña.';draw()}
        });};
      }
      function feedback(text,style='error'){const p=root.querySelector('#auth-feedback');p.textContent=text;p.className=style;p.hidden=false;}
      async function run(action){const form=root.querySelector('#auth-form');if(form.dataset.busy)return;form.dataset.busy='true';const buttons=[...root.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);try{await action()}catch(e){const messages={'Invalid login credentials':'Correo o contraseña incorrectos.','Email not confirmed':'Verifica primero tu correo.','Token has expired or is invalid':'El código es incorrecto o ha caducado.'};feedback(messages[e.message]||e.message||'No se pudo completar. Intenta de nuevo.')}finally{delete form.dataset.busy;buttons.forEach(b=>b.disabled=false)}}
      draw();
    }
  };
})();
