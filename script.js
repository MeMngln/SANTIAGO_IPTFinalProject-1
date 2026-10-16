"use strict";
const $ = id => document.getElementById(id);
const log = (el, msg) => { el.textContent += (el.textContent ? "\n" : "") + msg; };
const wait = ms => new Promise(res => setTimeout(res, ms));


const stack = ["apple", "banana"];
const numbers = [1, 2, 3, 4, 5, 6];
function renderArr() {
  $("arrChips").innerHTML = "";
  stack.forEach(v => { const c = document.createElement("span"); c.className = "chip"; c.textContent = v; $("arrChips").appendChild(c); });
  if (!stack.length) $("arrChips").textContent = "[ empty ]";
}
function arrOp(op) {
  const v = $("arrIn").value.trim();
  let result;
  if (op === "push" || op === "unshift") {
    if (!v) { $("arrOut").textContent = "Type something first."; return; }
    result = stack[op](v);
    $("arrOut").textContent = op + "('" + v + "') -> new length " + result;
    $("arrIn").value = "";
  } else {
    result = stack[op]();
    $("arrOut").textContent = op + "() -> " + (result === undefined ? "undefined (array was empty)" : "removed '" + result + "'");
  }
  renderArr();
}
function arrMethod(m) {
  const r = {
    map: () => numbers.map(n => n * 2),
    filter: () => numbers.filter(n => n % 2 === 0),
    reduce: () => numbers.reduce((s, n) => s + n, 0),
    find: () => numbers.find(n => n > 3)
  }[m]();
  $("arrOut").textContent = "numbers." + m + "(...) -> " + JSON.stringify(r);
}
renderArr();


const t0 = () => ((performance.now() - start) / 1000).toFixed(2) + "s";
let start = performance.now();
function resetAsync() { $("asyncOut").textContent = ""; start = performance.now(); }
function runCallback() {
  resetAsync(); log($("asyncOut"), "[callback] waiting...");
  setTimeout(() => log($("asyncOut"), "[callback] done at " + t0()), 1000);
}
function runPromise() {
  resetAsync(); log($("asyncOut"), "[promise] waiting...");
  wait(1000).then(() => log($("asyncOut"), "[promise] done at " + t0()));
}
async function runAwait() {
  resetAsync(); log($("asyncOut"), "[await] waiting...");
  await wait(1000);
  log($("asyncOut"), "[await] done at " + t0());
}
function runOrder() {
  resetAsync();
  log($("asyncOut"), "1 - sync start");
  setTimeout(() => log($("asyncOut"), "4 - setTimeout (macrotask)"), 0);
  Promise.resolve().then(() => log($("asyncOut"), "3 - promise.then (microtask)"));
  log($("asyncOut"), "2 - sync end");
}


const boxes = ["bOuter", "bMiddle", "bInner"].map($);
const names = { bOuter: "Outer", bMiddle: "Middle", bInner: "Inner" };
const handlers = {};
function attach() {
  const cap = $("useCapture").checked;
  boxes.forEach(b => {
    if (handlers[b.id]) b.removeEventListener("click", handlers[b.id].fn, handlers[b.id].cap);
    const fn = e => {
      log($("evOut"), (cap ? "capture" : "bubble") + " -> " + names[b.id] + (e.target === b ? " (target)" : ""));
      if (b.id === "bMiddle" && $("stopProp").checked) { e.stopPropagation(); log($("evOut"), "   stopPropagation()"); }
    };
    handlers[b.id] = { fn, cap };
    b.addEventListener("click", fn, cap);
  });
}
$("useCapture").addEventListener("change", attach);
$("stopProp").addEventListener("change", () => {});
$("bOuter").addEventListener("click", e => { if (e.target === $("bOuter")) log($("evOut"), "-----"); }, true);
attach();
const evOut = $("evOut");


const fakeServer = (method, url) => wait(400).then(() => {
  if (url.includes("missing")) return { status: 404, statusText: "Not Found", body: {} };
  const map = {
    GET: { status: 200, statusText: "OK", body: { id: 1, title: "Hello HTTP", userId: 1 } },
    POST: { status: 201, statusText: "Created", body: { id: 101, title: "New post" } },
    PUT: { status: 200, statusText: "OK", body: { id: 1, title: "Updated post" } },
    DELETE: { status: 200, statusText: "OK", body: {} }
  };
  return map[method];
});
async function sendHttp(bad) {
  const method = $("httpMethod").value;
  const url = "https://jsonplaceholder.typicode.com/posts/" + (bad ? "missing" : "1");
  const out = $("httpOut");
  out.textContent = method + " " + url + "\nSending...";
  let res, source = "real network";
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    const opts = { method, signal: ctrl.signal };
    if (method === "POST" || method === "PUT") {
      opts.headers = { "Content-Type": "application/json" };
      opts.body = JSON.stringify({ title: "My post" });
    }
    const r = await fetch(url, opts);
    clearTimeout(timer);
    res = { status: r.status, statusText: r.statusText || "", body: await r.json().catch(() => ({})) };
  } catch (err) {
    source = "simulated server (real request was blocked)";
    res = await fakeServer(method, url);
  }
  out.textContent = method + " " + url + "\nSource: " + source + "\n\nStatus: " + res.status + " " + res.statusText +
    (res.status >= 400 ? "  <- client error" : res.status >= 200 && res.status < 300 ? "  <- success" : "") +
    "\nBody: " + JSON.stringify(res.body, null, 2);
}


class Account {
  #balance = 0;
  constructor(owner) { this.owner = owner; }
  deposit(n) { if (n > 0) this.#balance += n; return this; }
  get balance() { return this.#balance; }
}
class Animal {
  constructor(name) { this.name = name; }
  speak() { return this.name + " makes a sound"; }
}
class Dog extends Animal { speak() { return this.name + " barks: Woof!"; } }
class Cat extends Animal { speak() { return this.name + " meows: Meow!"; } }
class Shape {
  area() { throw new Error("Shape.area() must be implemented"); }
  describe() { return this.constructor.name + " area = " + this.area().toFixed(2); }
}
class Circle extends Shape { constructor(r) { super(); this.r = r; } area() { return Math.PI * this.r ** 2; } }
class Rect extends Shape { constructor(w, h) { super(); this.w = w; this.h = h; } area() { return this.w * this.h; } }

function oopEncap() {
  const o = $("oopOut"); o.textContent = "";
  const acc = new Account("Sam").deposit(100);
  log(o, "Encapsulation: data hidden behind methods");
  log(o, "deposit(100) -> balance: " + acc.balance);
  try { acc.balance = 999999; } catch (e) { log(o, "acc.balance = 999999 -> blocked (" + e.name + ")"); }
  log(o, "balance is still: " + acc.balance);
}
function oopInherit() {
  const o = $("oopOut"); o.textContent = "";
  const d = new Dog("Rex");
  log(o, "Inheritance: Dog extends Animal");
  log(o, "d.name (from Animal constructor): " + d.name);
  log(o, "d instanceof Animal: " + (d instanceof Animal));
  log(o, "d.speak(): " + d.speak());
}
function oopPoly() {
  const o = $("oopOut"); o.textContent = "";
  log(o, "Polymorphism: same call, different result");
  [new Animal("Generic"), new Dog("Rex"), new Cat("Tom")].forEach(a => log(o, "a.speak() -> " + a.speak()));
}
function oopAbstract() {
  const o = $("oopOut"); o.textContent = "";
  log(o, "Abstraction: callers use describe() without knowing the math");
  [new Circle(3), new Rect(4, 5)].forEach(s => log(o, s.describe()));
  try { new Shape().describe(); } catch (e) { log(o, "new Shape() -> " + e.message); }
}


let todoCount = 0;
function updateCount() { $("domOut").textContent = "Tasks: " + document.querySelectorAll("#todo li").length; }
function addTodo() {
  const input = $("todoIn"), text = input.value.trim();
  if (!text) return;
  const li = document.createElement("li");
  const span = document.createElement("span");
  span.textContent = text;
  span.style.cursor = "pointer";
  span.addEventListener("click", () => { span.style.textDecoration = span.style.textDecoration ? "" : "line-through"; });
  const del = document.createElement("button");
  del.textContent = "x";
  del.addEventListener("click", () => { li.remove(); updateCount(); });
  li.append(span, del);
  $("todo").appendChild(li);
  input.value = "";
  updateCount();
}
$("todoIn").addEventListener("keydown", e => { if (e.key === "Enter") addTodo(); });
function toggleDomStyle() { document.querySelector("#dom h2").classList.toggle("accent-on"); }
const projects = [
  { title: "FindBack", category: "School", description: "A campus Lost and Found Board concept for helping students post and find missing items.", link: "#" },
  { title: "ArtWorth", category: "Web", description: "A web platform concept for artists to share work and receive support from users.", link: "#" },
  { title: "PantayGear", category: "Web", description: "A proposed platform concept for small repair and fabrication shops to share tools and manage availability.", link: "#" }
];
let currentFilter = "All";
function renderProjects() {
  const query = $("searchBox").value.toLowerCase();
  const list = $("projectList");
  list.innerHTML = "";
  const shown = projects.filter(p =>
    (currentFilter === "All" || p.category === currentFilter) &&
    (p.title + " " + p.description).toLowerCase().includes(query)
  );
  if (shown.length === 0) { list.textContent = "No projects found."; return; }
  shown.forEach(p => {
    const div = document.createElement("div");
    div.className = "project";
    const h3 = document.createElement("h3"); h3.textContent = p.title;
    const small = document.createElement("small"); small.textContent = "Category: " + p.category;
    const desc = document.createElement("p"); desc.textContent = p.description;
    const a = document.createElement("a"); a.href = p.link; a.textContent = "View project";
    div.append(h3, small, desc, a);
    list.appendChild(div);
  });
}
function setFilter(cat) {
  currentFilter = cat;
  document.querySelectorAll("#filterBtns button").forEach(b => b.classList.toggle("active", b.dataset.cat === cat));
  renderProjects();
}
$("searchBox").addEventListener("input", renderProjects);
renderProjects();


const MSG_KEY = "portfolioMessages";
function loadMessages() {
  try { return JSON.parse(localStorage.getItem(MSG_KEY)) || []; } catch (e) { return []; }
}
function saveMessages(arr) {
  try { localStorage.setItem(MSG_KEY, JSON.stringify(arr)); } catch (e) {  }
}
function renderMessages() {
  const box = $("msgList");
  const msgs = loadMessages();
  box.innerHTML = "";
  if (msgs.length === 0) { box.textContent = "No saved messages yet."; return; }
  msgs.forEach((m, i) => {
    const div = document.createElement("div");
    div.className = "msg";
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteMessage(i));
    const text = document.createElement("div");
    text.textContent = m.name + " (" + m.email + ") - " + m.date + ": " + m.message;
    div.append(del, text);
    box.appendChild(div);
  });
}
function deleteMessage(i) {
  const msgs = loadMessages();
  msgs.splice(i, 1);
  saveMessages(msgs);
  renderMessages();
}
function clearMessages() {
  saveMessages([]);
  renderMessages();
}
$("contactForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("cName").value.trim();
  const email = $("cEmail").value.trim();
  const message = $("cMsg").value.trim();
  let valid = true;
  $("errName").textContent = ""; $("errEmail").textContent = ""; $("errMsg").textContent = "";
  $("formStatus").textContent = "";
  if (name.length < 2) { $("errName").textContent = "Please enter your name (at least 2 letters)."; valid = false; }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { $("errEmail").textContent = "Please enter a valid email."; valid = false; }
  if (message.length < 10) { $("errMsg").textContent = "Message must be at least 10 characters."; valid = false; }
  if (!valid) return;
  const msgs = loadMessages();
  msgs.push({ name, email, message, date: new Date().toLocaleString() });
  saveMessages(msgs);
  $("contactForm").reset();
  $("formStatus").textContent = "Thanks! Your message was saved.";
  $("formStatus").className = "ok";
  renderMessages();
});
renderMessages();
